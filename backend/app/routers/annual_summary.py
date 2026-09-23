"""
Annual Performance Summary Router
=================================
Provides financial year and calendar year analytics for farmers:
- Year-over-Year (YoY) income and cost comparisons
- Multi-season aggregation (Kharif, Rabi, Zaid)
- Crop profitability ranking & Cost-Benefit Ratio (CBR)
- Expense distribution (Seeds, Fertilizers, Labor, Machinery, Storage)
- Monthly cashflow timeline (Inflow vs Outflow)
- AI Financial Auditor commentary
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, date
from collections import defaultdict
from pydantic import BaseModel

from ..database import get_session
from ..deps import get_current_user
from ..models.user import User
from ..models.crop import Crop, CropExpense, CropHarvest
from ..models.farmer import FarmerProfile

router = APIRouter(prefix="/annual-summary", tags=["annual-summary"])

class YoYMetric(BaseModel):
    current: float
    previous: float
    difference: float
    percent_change: float
    is_positive: bool

class SeasonAnnualBreakdown(BaseModel):
    season_name: str
    crops_count: int
    area_acres: float
    production_quintals: float
    cost: float
    revenue: float
    net_profit: float
    profit_share_percent: float

class CropAnnualRank(BaseModel):
    rank: int
    crop_id: int
    crop_name: str
    variety: Optional[str]
    season: str
    area: float
    yield_quintals: float
    yield_per_acre: float
    total_cost: float
    revenue: float
    net_profit: float
    profit_per_acre: float
    cost_benefit_ratio: float

class ExpenseCategoryItem(BaseModel):
    category: str
    amount: float
    percentage: float

class MonthlyCashflowItem(BaseModel):
    month_num: int
    month_name: str
    income: float
    expenses: float
    net: float

class AnnualSummaryResponse(BaseModel):
    year: int
    available_years: List[int]
    total_crops_planted: int
    gross_cropped_area_acres: float
    net_operated_area_acres: float
    cropping_intensity_percent: float
    total_production_quintals: float
    gross_revenue: float
    total_input_cost: float
    net_farm_income: float
    profit_margin_percent: float
    avg_return_per_acre: float
    
    # YoY Comparison
    yoy_revenue: YoYMetric
    yoy_profit: YoYMetric
    yoy_cost: YoYMetric
    yoy_yield: YoYMetric
    
    # Breakdowns
    seasonal_breakdown: List[SeasonAnnualBreakdown]
    crop_rankings: List[CropAnnualRank]
    expense_breakdown: List[ExpenseCategoryItem]
    monthly_cashflow: List[MonthlyCashflowItem]
    
    # Executive Insights
    key_highlights: List[str]
    audit_summary: str

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

def _get_crop_year(crop: Crop) -> int:
    if crop.sowing_date:
        return crop.sowing_date.year
    if crop.created_at:
        return crop.created_at.year
    return date.today().year

@router.get("/years", response_model=List[int])
async def get_available_years(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Crop).where(Crop.user_id == current_user.id)
    res = await session.exec(stmt)
    crops = res.all()
    
    years = set()
    current_yr = date.today().year
    years.add(current_yr)
    for c in crops:
        years.add(_get_crop_year(c))
        if c.actual_harvest_date:
            years.add(c.actual_harvest_date.year)
            
    return sorted(list(years), reverse=True)

@router.get("/", response_model=AnnualSummaryResponse)
async def get_annual_performance_summary(
    year: Optional[int] = Query(None, description="Calendar year, defaults to current year"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    current_yr = date.today().year
    selected_year = year or current_yr

    # Fetch farmer profile for total landholding
    prof_stmt = select(FarmerProfile).where(FarmerProfile.user_id == current_user.id)
    prof_res = await session.exec(prof_stmt)
    farmer_profile = prof_res.first()
    net_operated_area = farmer_profile.total_area if (farmer_profile and farmer_profile.total_area > 0) else 5.0

    # Fetch all crops for this user
    crops_stmt = select(Crop).where(Crop.user_id == current_user.id)
    crops_res = await session.exec(crops_stmt)
    all_crops = crops_res.all()

    # Available years list
    available_years_set = {current_yr, current_yr - 1}
    for c in all_crops:
        available_years_set.add(_get_crop_year(c))
    available_years = sorted(list(available_years_set), reverse=True)

    # Fetch all expenses and harvests for all user's crops
    crop_ids = [c.id for c in all_crops if c.id is not None]
    
    all_expenses: List[CropExpense] = []
    all_harvests: List[CropHarvest] = []
    
    if crop_ids:
        exp_stmt = select(CropExpense).where(CropExpense.crop_id.in_(crop_ids))
        all_expenses = (await session.exec(exp_stmt)).all()

        harv_stmt = select(CropHarvest).where(CropHarvest.crop_id.in_(crop_ids))
        all_harvests = (await session.exec(harv_stmt)).all()

    # Helper to calculate stats for a given year
    def calculate_year_stats(yr: int):
        yr_crops = [c for c in all_crops if _get_crop_year(c) == yr]
        yr_crop_ids = {c.id for c in yr_crops if c.id is not None}

        # Expenses in this year
        yr_expenses = [e for e in all_expenses if (e.crop_id in yr_crop_ids or (e.date and e.date.year == yr))]
        # Harvests in this year
        yr_harvests = [h for h in all_harvests if (h.crop_id in yr_crop_ids or (h.date and h.date.year == yr))]

        total_area = sum(c.area for c in yr_crops)
        
        # Calculate revenue: prioritize harvests, fallback to crop.total_revenue
        harvest_rev = sum(h.total_revenue for h in yr_harvests)
        crop_rev = sum(c.total_revenue or 0.0 for c in yr_crops)
        total_rev = max(harvest_rev, crop_rev)

        # Calculate cost: prioritize expenses, fallback to crop.total_cost
        exp_cost = sum(e.total_cost for e in yr_expenses)
        crop_cost = sum(c.total_cost or 0.0 for c in yr_crops)
        total_cost = max(exp_cost, crop_cost)

        # Yield
        total_yield = sum(h.quantity for h in yr_harvests) or sum(c.actual_yield or 0.0 for c in yr_crops)

        net_income = total_rev - total_cost
        return {
            "crops": yr_crops,
            "expenses": yr_expenses,
            "harvests": yr_harvests,
            "total_area": total_area,
            "total_rev": total_rev,
            "total_cost": total_cost,
            "net_income": net_income,
            "total_yield": total_yield
        }

    curr_stats = calculate_year_stats(selected_year)
    prev_stats = calculate_year_stats(selected_year - 1)

    # YoY calculations
    def make_yoy(curr_val: float, prev_val: float, invert_positive: bool = False) -> YoYMetric:
        diff = curr_val - prev_val
        if prev_val > 0:
            pct = round((diff / prev_val) * 100, 1)
        elif curr_val > 0:
            pct = 100.0
        else:
            pct = 0.0
            
        is_pos = (diff < 0) if invert_positive else (diff >= 0)
        return YoYMetric(
            current=round(curr_val, 2),
            previous=round(prev_val, 2),
            difference=round(diff, 2),
            percent_change=pct,
            is_positive=is_pos
        )

    yoy_rev = make_yoy(curr_stats["total_rev"], prev_stats["total_rev"])
    yoy_profit = make_yoy(curr_stats["net_income"], prev_stats["net_income"])
    yoy_cost = make_yoy(curr_stats["total_cost"], prev_stats["total_cost"], invert_positive=True)
    yoy_yield = make_yoy(curr_stats["total_yield"], prev_stats["total_yield"])

    gross_area = curr_stats["total_area"]
    cropping_intensity = round((gross_area / net_operated_area * 100), 1) if net_operated_area > 0 else 100.0
    profit_margin = round((curr_stats["net_income"] / curr_stats["total_rev"] * 100), 1) if curr_stats["total_rev"] > 0 else 0.0
    return_per_acre = round(curr_stats["net_income"] / gross_area, 2) if gross_area > 0 else 0.0

    # 1. Seasonal Breakdown for selected year
    seasons_map = defaultdict(lambda: {
        "crops_count": 0, "area": 0.0, "yield": 0.0, "cost": 0.0, "revenue": 0.0
    })

    # Group crops by season
    for c in curr_stats["crops"]:
        s_name = c.season or "Kharif"
        seasons_map[s_name]["crops_count"] += 1
        seasons_map[s_name]["area"] += c.area
        seasons_map[s_name]["yield"] += c.actual_yield or 0.0
        seasons_map[s_name]["cost"] += c.total_cost or 0.0
        seasons_map[s_name]["revenue"] += c.total_revenue or 0.0

    # Incorporate harvest and expense specifics
    for h in curr_stats["harvests"]:
        for c in curr_stats["crops"]:
            if h.crop_id == c.id:
                s_name = c.season or "Kharif"
                # If harvest recorded greater revenue
                if h.total_revenue > seasons_map[s_name]["revenue"]:
                    seasons_map[s_name]["revenue"] = h.total_revenue
                break

    seasonal_breakdown: List[SeasonAnnualBreakdown] = []
    total_net_pos = max(1.0, sum(max(0.0, v["revenue"] - v["cost"]) for v in seasons_map.values()))

    # Order by standard agricultural cycle: Kharif, Rabi, Zaid, Other
    season_order = ["Kharif", "Rabi", "Zaid", "Year-round", "Other"]
    sorted_seasons = sorted(seasons_map.keys(), key=lambda s: season_order.index(s) if s in season_order else 99)

    for s_name in sorted_seasons:
        v = seasons_map[s_name]
        net = v["revenue"] - v["cost"]
        share = round((max(0.0, net) / total_net_pos) * 100, 1) if total_net_pos > 0 else 0.0
        seasonal_breakdown.append(SeasonAnnualBreakdown(
            season_name=s_name,
            crops_count=v["crops_count"],
            area_acres=round(v["area"], 2),
            production_quintals=round(v["yield"], 1),
            cost=round(v["cost"], 2),
            revenue=round(v["revenue"], 2),
            net_profit=round(net, 2),
            profit_share_percent=share
        ))

    # 2. Crop Profitability Ranking
    crop_items: List[Dict[str, Any]] = []
    for c in curr_stats["crops"]:
        c_harvs = [h for h in curr_stats["harvests"] if h.crop_id == c.id]
        c_exps = [e for e in curr_stats["expenses"] if e.crop_id == c.id]

        c_rev = sum(h.total_revenue for h in c_harvs) or (c.total_revenue or 0.0)
        c_cost = sum(e.total_cost for e in c_exps) or (c.total_cost or 0.0)
        c_yield = sum(h.quantity for h in c_harvs) or (c.actual_yield or 0.0)
        c_profit = c_rev - c_cost
        
        cbr = round(c_rev / c_cost, 2) if c_cost > 0 else (2.5 if c_rev > 0 else 1.0)
        profit_acre = round(c_profit / c.area, 2) if c.area > 0 else 0.0
        yield_acre = round(c_yield / c.area, 2) if c.area > 0 else 0.0

        crop_items.append({
            "crop_id": c.id or 0,
            "crop_name": c.name,
            "variety": c.variety,
            "season": c.season or "Kharif",
            "area": c.area,
            "yield_quintals": round(c_yield, 1),
            "yield_per_acre": yield_acre,
            "total_cost": round(c_cost, 2),
            "revenue": round(c_rev, 2),
            "net_profit": round(c_profit, 2),
            "profit_per_acre": profit_acre,
            "cost_benefit_ratio": cbr
        })

    # Sort crops by net profit descending
    crop_items.sort(key=lambda x: x["net_profit"], reverse=True)
    crop_rankings: List[CropAnnualRank] = []
    for idx, ci in enumerate(crop_items, start=1):
        ci["rank"] = idx
        crop_rankings.append(CropAnnualRank(**ci))

    # 3. Expense Category Breakdown
    cat_totals = defaultdict(float)
    for e in curr_stats["expenses"]:
        cat = (e.category or "Input").strip().title()
        if cat in ["Input", "Seeds", "Seed"]:
            cat = "Seeds & Planting"
        elif cat in ["Fertilizer", "Fertilizers", "Nutrients"]:
            cat = "Fertilizers & Nutrients"
        elif cat in ["Pesticide", "Pesticides", "Protection"]:
            cat = "Plant Protection (Pesticides)"
        elif cat in ["Labor", "Labour"]:
            cat = "Hired Labor & Picking"
        elif cat in ["Machinery", "Tractor", "Fuel"]:
            cat = "Machinery & Diesel Fuel"
        elif cat in ["Irrigation", "Water", "Electricity"]:
            cat = "Irrigation & Power"
        elif cat in ["Logistics", "Transport", "Storage"]:
            cat = "Storage & Transport"
        else:
            cat = "Miscellaneous / Other"
        cat_totals[cat] += e.total_cost

    # If no line item expenses found, generate synthetic ICAR category breakdown from total cost
    if not cat_totals and curr_stats["total_cost"] > 0:
        tot = curr_stats["total_cost"]
        cat_totals["Seeds & Planting"] = round(tot * 0.18, 2)
        cat_totals["Fertilizers & Nutrients"] = round(tot * 0.28, 2)
        cat_totals["Plant Protection (Pesticides)"] = round(tot * 0.14, 2)
        cat_totals["Hired Labor & Picking"] = round(tot * 0.24, 2)
        cat_totals["Machinery & Diesel Fuel"] = round(tot * 0.16, 2)

    total_expense_sum = max(1.0, sum(cat_totals.values()))
    expense_breakdown: List[ExpenseCategoryItem] = [
        ExpenseCategoryItem(
            category=cat,
            amount=round(amt, 2),
            percentage=round((amt / total_expense_sum) * 100, 1)
        )
        for cat, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    # 4. Monthly Cashflow (12 months)
    monthly_in = defaultdict(float)
    monthly_out = defaultdict(float)

    for h in curr_stats["harvests"]:
        m = h.date.month if h.date else 10
        monthly_in[m] += h.total_revenue

    for e in curr_stats["expenses"]:
        m = e.date.month if e.date else 6
        monthly_out[m] += e.total_cost

    # Fallback distribute if no timestamped entries
    if sum(monthly_in.values()) == 0 and curr_stats["total_rev"] > 0:
        # Typical harvest peaks: April (Rabi) and Oct-Nov (Kharif)
        monthly_in[4] = round(curr_stats["total_rev"] * 0.45, 2)
        monthly_in[11] = round(curr_stats["total_rev"] * 0.55, 2)

    if sum(monthly_out.values()) == 0 and curr_stats["total_cost"] > 0:
        monthly_out[6] = round(curr_stats["total_cost"] * 0.40, 2) # Kharif sowing
        monthly_out[8] = round(curr_stats["total_cost"] * 0.20, 2) # Intercultural
        monthly_out[11] = round(curr_stats["total_cost"] * 0.40, 2) # Rabi sowing

    monthly_cashflow: List[MonthlyCashflowItem] = []
    for m_num in range(1, 13):
        m_inc = monthly_in[m_num]
        m_exp = monthly_out[m_num]
        monthly_cashflow.append(MonthlyCashflowItem(
            month_num=m_num,
            month_name=MONTH_NAMES[m_num - 1],
            income=round(m_inc, 2),
            expenses=round(m_exp, 2),
            net=round(m_inc - m_exp, 2)
        ))

    # 5. Highlights and Audit Summary
    highlights = []
    if crop_rankings:
        top_crop = crop_rankings[0]
        highlights.append(f"Top Earning Crop: {top_crop.crop_name} produced ₹{int(top_crop.net_profit):,} net profit with a {top_crop.cost_benefit_ratio}x Cost-Benefit Ratio.")
    
    if cropping_intensity >= 150:
        highlights.append(f"High Land Productivity: Cropping intensity reached {cropping_intensity}%, maximizing revenue across multiple seasons.")
    
    if yoy_profit.percent_change > 0:
        highlights.append(f"Positive Growth: Net farm income increased by {yoy_profit.percent_change}% compared to the previous calendar year.")
    elif yoy_profit.percent_change < 0:
        highlights.append(f"Income Alert: Net income declined by {abs(yoy_profit.percent_change)}% YoY, primarily due to input cost inflation.")

    if expense_breakdown:
        top_cost = expense_breakdown[0]
        highlights.append(f"Primary Cost Factor: {top_cost.category} accounted for {top_cost.percentage}% of your total annual operational expenditure.")

    # Executive Audit Summary
    if profit_margin >= 35:
        audit_summary = (
            f"Outstanding fiscal year {selected_year}! Your farm recorded a healthy {profit_margin}% profit margin "
            f"generating an average return of ₹{int(return_per_acre):,}/acre. Continue maintaining disciplined crop rotation "
            f"and explore cold storage holding to capture peak mandi prices."
        )
    elif profit_margin >= 15:
        audit_summary = (
            f"Stable operational performance in {selected_year} with a {profit_margin}% profit margin. "
            f"To increase returns next season, optimize fertilizer dosages using precision soil testing and explore institutional "
            f"bulk procurement for seed and protection chemicals."
        )
    else:
        audit_summary = (
            f"Tight margins observed in {selected_year}. Review your input costs ({expense_breakdown[0].category if expense_breakdown else 'inputs'} was the largest expense) "
            f"and consider enrolling in PM-Fasal Bima Yojana (PMFBY) to cushion against market and weather volatility."
        )

    return AnnualSummaryResponse(
        year=selected_year,
        available_years=available_years,
        total_crops_planted=len(curr_stats["crops"]),
        gross_cropped_area_acres=round(gross_area, 2),
        net_operated_area_acres=round(net_operated_area, 2),
        cropping_intensity_percent=cropping_intensity,
        total_production_quintals=round(curr_stats["total_yield"], 1),
        gross_revenue=round(curr_stats["total_rev"], 2),
        total_input_cost=round(curr_stats["total_cost"], 2),
        net_farm_income=round(curr_stats["net_income"], 2),
        profit_margin_percent=profit_margin,
        avg_return_per_acre=return_per_acre,
        yoy_revenue=yoy_rev,
        yoy_profit=yoy_profit,
        yoy_cost=yoy_cost,
        yoy_yield=yoy_yield,
        seasonal_breakdown=seasonal_breakdown,
        crop_rankings=crop_rankings,
        expense_breakdown=expense_breakdown,
        monthly_cashflow=monthly_cashflow,
        key_highlights=highlights,
        audit_summary=audit_summary
    )
