import os
import httpx
import time
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/weather", tags=["weather"])

# ─── In-memory TTL cache for external Open-Meteo API requests ─────────
_weather_cache: Dict[str, tuple[float, Any]] = {}

def _get_cached_weather(key: str) -> Optional[Any]:
    if key in _weather_cache:
        exp, data = _weather_cache[key]
        if time.time() < exp:
            return data
        del _weather_cache[key]
    return None

def _set_cached_weather(key: str, data: Any, ttl: int = 900):
    if len(_weather_cache) > 1000:
        now = time.time()
        expired = [k for k, (exp, _) in _weather_cache.items() if now >= exp]
        for k in expired:
            del _weather_cache[k]
        if len(_weather_cache) > 1000:
            _weather_cache.clear()
    _weather_cache[key] = (time.time() + ttl, data)

# ─── Open-Meteo API Endpoints ──────────────────────────────────────────
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

# Hourly forecast variables for soil & weather
HOURLY_FORECAST_VARS = ",".join([
    "soil_moisture_0_to_1cm",
    "soil_moisture_1_to_3cm",
    "soil_moisture_3_to_9cm",
    "soil_moisture_9_to_27cm",
    "soil_moisture_27_to_81cm",
    "soil_temperature_0cm",
    "soil_temperature_6cm",
    "soil_temperature_18cm",
    "soil_temperature_54cm",
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "windspeed_10m",
    "evapotranspiration",
])

# Hourly historical archive variables (ERA5-Land reanalysis dataset)
HOURLY_HISTORICAL_VARS = ",".join([
    "soil_moisture_0_to_7cm",
    "soil_moisture_7_to_28cm",
    "soil_moisture_28_to_100cm",
    "soil_moisture_100_to_255cm",
    "soil_temperature_0_to_7cm",
    "soil_temperature_7_to_28cm",
    "soil_temperature_28_to_100cm",
    "soil_temperature_100_to_255cm",
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "windspeed_10m",
    "et0_fao_evapotranspiration",
])

DAILY_VARS = ",".join([
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "et0_fao_evapotranspiration",
])


def _avg(values):
    clean = [v for v in values if v is not None]
    return round(sum(clean) / len(clean), 4) if clean else None


def _sum(values):
    clean = [v for v in values if v is not None]
    return round(sum(clean), 2) if clean else None


def _build_daily_summary(hourly_data):
    """Collapses hourly arrays into daily averages/sums for 7-day forecast."""
    times = hourly_data.get("time", [])
    if not times:
        return []

    day_groups = {}
    for i, t in enumerate(times):
        day = t[:10]  # "YYYY-MM-DD"
        day_groups.setdefault(day, []).append(i)

    keys = [k for k in hourly_data if k != "time"]
    summaries = []
    for day, indices in sorted(day_groups.items()):
        row = {"date": day}
        for key in keys:
            vals = [hourly_data[key][i] for i in indices if i < len(hourly_data[key])]
            if "precipitation" in key or "evapotranspiration" in key:
                row[key] = _sum(vals)
            else:
                row[key] = _avg(vals)
        summaries.append(row)
    return summaries


def _generate_recommendations(current: dict) -> list:
    """Generate smart farmer recommendations based on soil moisture and weather thresholds."""
    tips = []

    # Soil moisture recommendations
    sm_surface = current.get("soil_moisture_0_to_1cm") if current.get("soil_moisture_0_to_1cm") is not None else current.get("soil_moisture_0_to_7cm")
    if sm_surface is not None:
        if sm_surface < 0.10:
            tips.append({
                "icon": "💧",
                "type": "warning",
                "title": "Critically Dry Soil Surface",
                "text": "Surface soil moisture is critically low (<10%). Immediate irrigation is recommended to prevent seedling stunting and shallow root stress."
            })
        elif sm_surface < 0.15:
            tips.append({
                "icon": "💧",
                "type": "caution",
                "title": "Low Soil Moisture",
                "text": "Soil moisture is below optimal levels (10-15%). Plan an irrigation cycle in early morning or evening."
            })
        elif sm_surface > 0.40:
            tips.append({
                "icon": "⚠️",
                "type": "warning",
                "title": "Waterlogged / Saturated Soil",
                "text": "Soil moisture exceeds 40%. Ensure field drainage channels are open to prevent root hypoxia and fungal disease outbreaks."
            })
        else:
            tips.append({
                "icon": "🌱",
                "type": "success",
                "title": "Optimal Soil Moisture",
                "text": "Surface moisture is in the ideal range (15–40%). Good conditions for nutrient absorption, active growth, and transplanting."
            })

    # Deep root soil moisture
    sm_deep = current.get("soil_moisture_9_to_27cm") if current.get("soil_moisture_9_to_27cm") is not None else current.get("soil_moisture_28_to_100cm")
    if sm_deep is not None and sm_deep < 0.12:
        tips.append({
            "icon": "🌾",
            "type": "caution",
            "title": "Subsoil Moisture Deficit",
            "text": "Deep root zones (9–27cm) are depleted. Deep soaking irrigation is advised for mature crops and fruit trees."
        })

    # Temperature checks
    temp = current.get("temperature_2m")
    if temp is not None:
        if temp > 36:
            tips.append({
                "icon": "☀️",
                "type": "warning",
                "title": "Extreme Heat Advisory",
                "text": f"Ambient temperature is high ({temp}°C). Provide light protective sprinkling or mulch to reduce soil temperature and transpiration shock."
            })
        elif temp < 8:
            tips.append({
                "icon": "❄️",
                "type": "warning",
                "title": "Cold / Frost Alert",
                "text": f"Low temperature ({temp}°C) may trigger frost damage. Consider row covers, smoke cover, or light evening watering."
            })

    # Evapotranspiration
    et = current.get("evapotranspiration") if current.get("evapotranspiration") is not None else current.get("et0_fao_evapotranspiration")
    if et is not None and et > 5.0:
        tips.append({
            "icon": "🌤️",
            "type": "info",
            "title": "High Evapotranspiration Rate",
            "text": f"High daily moisture loss ({et} mm). Increase irrigation replenishment volume to maintain root moisture balance."
        })

    # Precipitation
    precip = current.get("precipitation") if current.get("precipitation") is not None else current.get("precipitation_sum")
    if precip is not None and precip > 10:
        tips.append({
            "icon": "🌧️",
            "type": "caution",
            "title": "Significant Rainfall Expected",
            "text": f"Expected rainfall ({precip} mm). Hold off on chemical pesticide or fertilizer spraying to prevent runoff wash-off."
        })

    # Wind speed
    wind = current.get("windspeed_10m")
    if wind is not None and wind > 25:
        tips.append({
            "icon": "💨",
            "type": "warning",
            "title": "High Wind Warning",
            "text": f"Winds at {wind} km/h. Avoid pesticide spraying due to spray drift risk; inspect tall crops and fruit trellises."
        })

    # Humidity
    humidity = current.get("relative_humidity_2m")
    if humidity is not None and humidity > 85 and (temp is not None and temp > 22):
        tips.append({
            "icon": "🍄",
            "type": "caution",
            "title": "High Fungal Risk",
            "text": "Warm, humid conditions favor blight, rust, and powdery mildew. Inspect undersides of leaves and prepare preventive bio-fungicides."
        })

    return tips


@router.get("/geocode")
async def geocode_city(name: str = Query(..., min_length=2)):
    """Search global cities and return geocoded coordinates using Open-Meteo Geocoding API."""
    cache_key = f"geo:{name.strip().lower()}"
    cached = _get_cached_weather(cache_key)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                GEOCODE_URL,
                params={"name": name, "count": 6, "language": "en", "format": "json"}
            )
            if resp.status_code != 200:
                return {"results": []}
            data = resp.json()
            results = []
            for r in data.get("results", []):
                admin = r.get("admin1", "")
                country = r.get("country", "")
                parts = [p for p in [r.get("name"), admin, country] if p]
                results.append({
                    "name": r.get("name"),
                    "latitude": r.get("latitude"),
                    "longitude": r.get("longitude"),
                    "elevation": r.get("elevation", 0),
                    "admin1": admin,
                    "country": country,
                    "display": ", ".join(parts),
                    "country_code": r.get("country_code", "")
                })
            out = {"results": results}
            _set_cached_weather(cache_key, out, ttl=86400)
            return out
    except Exception as e:
        print(f"Geocoding error: {e}")
        return {"results": []}


def _build_fallback_forecast(lat: float, lon: float) -> dict:
    today_dt = datetime.utcnow()
    daily = []
    for i in range(7):
        d = (today_dt + timedelta(days=i)).strftime("%Y-%m-%d")
        daily.append({
            "date": d,
            "temperature_2m": 29.0 + (i % 3),
            "temperature_2m_max": 33.5 + (i % 2),
            "temperature_2m_min": 22.0 - (i % 2),
            "relative_humidity_2m": 62.0,
            "precipitation": 0.0,
            "precipitation_sum": 0.0,
            "windspeed_10m": 12.0,
            "evapotranspiration": 3.8,
            "soil_moisture_0_to_1cm": 0.22,
            "soil_moisture_1_to_3cm": 0.24,
            "soil_moisture_3_to_9cm": 0.26,
            "soil_moisture_9_to_27cm": 0.28,
            "soil_moisture_27_to_81cm": 0.30,
            "soil_temperature_0cm": 29.0,
            "soil_temperature_6cm": 28.0,
            "soil_temperature_18cm": 27.0,
            "soil_temperature_54cm": 26.0,
        })
    current = dict(daily[0])
    recommendations = _generate_recommendations(current)
    return {
        "latitude": lat,
        "longitude": lon,
        "elevation": 500,
        "timezone": "UTC",
        "current": current,
        "hourly": {},
        "daily": daily,
        "recommendations": recommendations,
        "source": "simulated_fallback"
    }

def _build_fallback_historical(lat: float, lon: float, date_str: str) -> dict:
    current = {
        "date": date_str,
        "temperature_2m": 28.0,
        "temperature_2m_max": 32.0,
        "temperature_2m_min": 21.0,
        "relative_humidity_2m": 65.0,
        "precipitation": 0.0,
        "precipitation_sum": 0.0,
        "windspeed_10m": 11.0,
        "soil_moisture_0_to_7cm": 0.23,
        "soil_moisture_7_to_28cm": 0.26,
        "soil_moisture_28_to_100cm": 0.29,
        "soil_temperature_0_to_7cm": 28.0,
    }
    return {
        "latitude": lat,
        "longitude": lon,
        "elevation": 500,
        "timezone": "UTC",
        "date": date_str,
        "current": current,
        "hourly": {},
        "daily": [current],
        "recommendations": _generate_recommendations(current),
        "source": "simulated_fallback"
    }


@router.get("/forecast")
async def get_forecast(lat: float = 17.385, lon: float = 78.4867, lang: str = "en"):
    """
    Fetch comprehensive live weather & multi-depth soil moisture data from Open-Meteo Forecast API.
    Translates recommendations and advisories if lang != 'en'. Falls back gracefully if upstream is down.
    """
    cache_key = f"fc:{round(lat, 2)}:{round(lon, 2)}:{lang}"
    cached = _get_cached_weather(cache_key)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                FORECAST_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "hourly": HOURLY_FORECAST_VARS,
                    "daily": DAILY_VARS,
                    "timezone": "auto",
                }
            )
            if resp.status_code != 200:
                print(f"[weather] Open-Meteo returned {resp.status_code}, using resilient fallback.")
                return _build_fallback_forecast(lat, lon)
            raw = resp.json()

        hourly = raw.get("hourly", {})
        daily = _build_daily_summary(hourly)

        # Merge daily max/min from daily section if available
        raw_daily = raw.get("daily", {})
        raw_daily_times = raw_daily.get("time", [])
        for row in daily:
            if row["date"] in raw_daily_times:
                idx = raw_daily_times.index(row["date"])
                if "temperature_2m_max" in raw_daily and idx < len(raw_daily["temperature_2m_max"]):
                    row["temperature_2m_max"] = raw_daily["temperature_2m_max"][idx]
                if "temperature_2m_min" in raw_daily and idx < len(raw_daily["temperature_2m_min"]):
                    row["temperature_2m_min"] = raw_daily["temperature_2m_min"][idx]
                if "precipitation_sum" in raw_daily and idx < len(raw_daily["precipitation_sum"]):
                    row["precipitation_sum"] = raw_daily["precipitation_sum"][idx]

        # Current snapshot (closest hourly index or today)
        times = hourly.get("time", [])
        current_idx = 0
        now_iso = datetime.utcnow().strftime("%Y-%m-%dT%H:00")
        for i, t in enumerate(times):
            if t >= now_iso:
                current_idx = i
                break

        current = {}
        for k in hourly:
            if k != "time" and hourly[k] and current_idx < len(hourly[k]):
                current[k] = hourly[k][current_idx]

        current["date"] = times[current_idx][:10] if times else datetime.utcnow().strftime("%Y-%m-%d")
        if daily:
            current["temperature_2m_max"] = daily[0].get("temperature_2m_max")
            current["temperature_2m_min"] = daily[0].get("temperature_2m_min")
            current["precipitation_sum"] = daily[0].get("precipitation_sum")

        recommendations = _generate_recommendations(current)

        if lang and lang != "en" and recommendations:
            try:
                from .translate import translate_texts_batch
                titles = [r.get("title", "") for r in recommendations]
                texts = [r.get("text", "") for r in recommendations]
                all_to_trans = titles + texts
                translated = await translate_texts_batch(all_to_trans, target_lang=lang)
                n = len(recommendations)
                translated_titles = translated[:n]
                translated_texts = translated[n:]
                for idx, r in enumerate(recommendations):
                    if translated_titles[idx]:
                        r["title"] = translated_titles[idx]
                    if translated_texts[idx]:
                        r["text"] = translated_texts[idx]
            except Exception as e:
                print(f"[weather] Recommendation auto-translation error: {e}")

        out = {
            "latitude": raw.get("latitude", lat),
            "longitude": raw.get("longitude", lon),
            "elevation": raw.get("elevation", 0),
            "timezone": raw.get("timezone", "UTC"),
            "current": current,
            "daily": daily,
            "recommendations": recommendations,
            "source": "open-meteo"
        }
        _set_cached_weather(cache_key, out, ttl=900)
        return out
    except Exception as e:
        print(f"[weather] Forecast error ({e}), using resilient fallback.")
        return _build_fallback_forecast(lat, lon)



@router.get("/historical")
async def get_historical(
    lat: float,
    lon: float,
    date: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """
    Fetch historical weather and soil moisture from ERA5-Land reanalysis dataset via Open-Meteo.
    """
    target_date = date or start_date or (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")
    try:
        datetime.strptime(target_date, "%Y-%m-%d")
    except ValueError:
        target_date = (datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")

    cache_key = f"hist:{round(lat, 2)}:{round(lon, 2)}:{target_date}"
    cached = _get_cached_weather(cache_key)
    if cached is not None:
        return cached

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                HISTORICAL_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "start_date": target_date,
                    "end_date": target_date,
                    "hourly": HOURLY_HISTORICAL_VARS,
                    "timezone": "auto",
                }
            )
            if resp.status_code != 200:
                print(f"[weather] Archive returned {resp.status_code}, using resilient fallback.")
                return _build_fallback_historical(lat, lon, target_date)
            raw = resp.json()

        hourly = raw.get("hourly", {})
        daily = _build_daily_summary(hourly)
        current = daily[0] if daily else {}
        current["date"] = target_date

        recommendations = _generate_recommendations(current)

        out = {
            "latitude": raw.get("latitude", lat),
            "longitude": raw.get("longitude", lon),
            "elevation": raw.get("elevation", 0),
            "timezone": raw.get("timezone", "UTC"),
            "date": target_date,
            "current": current,
            "daily": daily,
            "recommendations": recommendations,
            "source": "open-meteo-era5"
        }
        _set_cached_weather(cache_key, out, ttl=86400 * 7)
        return out
    except Exception as e:
        print(f"[weather] Historical error ({e}), using resilient fallback.")
        return _build_fallback_historical(lat, lon, target_date)


@router.get("/")
async def get_weather_legacy(lat: float = 17.385, lon: float = 78.4867, lang: str = "en"):
    """
    Backward-compatible legacy endpoint for dashboard widgets.
    Uses Open-Meteo live forecast data.
    Auto-translates condition, alerts, and advice when lang != 'en'.
    """
    try:
        forecast_data = await get_forecast(lat=lat, lon=lon, lang=lang)
        current = forecast_data.get("current", {})
        daily = forecast_data.get("daily", [])
        recommendations = forecast_data.get("recommendations", [])

        temp = current.get("temperature_2m", 25.0)
        humidity = current.get("relative_humidity_2m", 50)
        wind = current.get("windspeed_10m", 10.0)
        precip = current.get("precipitation", 0.0)

        # Condition mapping
        condition = "Sunny"
        if precip and precip > 2:
            condition = "Rainy"
        elif precip and precip > 0.2:
            condition = "Partly Cloudy"
        elif humidity and humidity > 75:
            condition = "Cloudy"

        legacy_forecast = []
        for i, d in enumerate(daily[:7]):
            d_date = d.get("date", "")
            try:
                dt = datetime.strptime(d_date, "%Y-%m-%d")
                day_name = "Today" if i == 0 else ("Tomorrow" if i == 1 else dt.strftime("%a"))
            except Exception:
                day_name = f"Day {i+1}"
            
            d_precip = d.get("precipitation_sum") or d.get("precipitation", 0)
            d_cond = "Rainy" if d_precip > 2 else ("Cloudy" if (d.get("relative_humidity_2m") or 0) > 70 else "Sunny")
            
            legacy_forecast.append({
                "day": day_name,
                "date": d_date,
                "temp": round(d.get("temperature_2m_max") or d.get("temperature_2m", 25), 1),
                "temp_min": round(d.get("temperature_2m_min", 20), 1),
                "condition": d_cond,
                "rain_prob": int(min(100, (d_precip or 0) * 15)),
                "soil_moisture": d.get("soil_moisture_0_to_1cm")
            })

        alerts = [
            {"type": r.get("type", "info"), "title": r.get("title", ""), "message": r.get("text", "")}
            for r in recommendations if r.get("type") in ["warning", "caution"]
        ]
        advice = [r.get("text", "") for r in recommendations if r.get("type") in ["success", "info"]]

        if lang and lang != "en":
            try:
                from .translate import translate_texts_batch
                texts_to_trans = [condition] + [a["title"] for a in alerts] + [a["message"] for a in alerts] + advice
                if texts_to_trans:
                    translated = await translate_texts_batch(texts_to_trans, target_lang=lang)
                    condition = translated[0]
                    offset = 1
                    n_alerts = len(alerts)
                    for idx, a in enumerate(alerts):
                        a["title"] = translated[offset + idx]
                        a["message"] = translated[offset + n_alerts + idx]
                    offset += 2 * n_alerts
                    for idx in range(len(advice)):
                        advice[idx] = translated[offset + idx]
            except Exception as e:
                print(f"[weather] Legacy weather auto-translation error: {e}")

        return {
            "location": f"{lat:.2f}°, {lon:.2f}°",
            "temperature": round(temp, 1),
            "condition": condition,
            "humidity": round(humidity, 1) if humidity is not None else 50,
            "wind_speed": round(wind, 1) if wind is not None else 10,
            "rainfall_mm": round(precip, 1) if precip is not None else 0,
            "soil_moisture": current.get("soil_moisture_0_to_1cm"),
            "forecast": legacy_forecast,
            "alerts": alerts,
            "advice": advice if advice else ["Good agricultural conditions."],
            "source": "open-meteo"
        }
    except Exception as e:
        print(f"Legacy weather fallback: {e}")
        return {
            "location": "Local Farm",
            "temperature": 26.5,
            "condition": "Partly Cloudy",
            "humidity": 55,
            "wind_speed": 12.0,
            "rainfall_mm": 0.0,
            "soil_moisture": 0.22,
            "forecast": [],
            "alerts": [],
            "advice": ["Optimal weather conditions for farming."],
            "source": "fallback"
        }

