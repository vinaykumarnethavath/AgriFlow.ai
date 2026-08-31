import os
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import AsyncGroq
from sqlmodel.ext.asyncio.session import AsyncSession

from ..deps import get_current_user
from ..database import get_session
from ..models.user import User

router = APIRouter(prefix="/nutrition", tags=["nutrition"])

class NutritionRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph_level: float
    crop_type: str
    expected_yield: str
    land_area: str

class FertilizerRec(BaseModel):
    name: str
    quantity: str
    timing: str
    application_method: str

class NutritionResponse(BaseModel):
    status: str
    soil_health_summary: str
    recommendations: list[FertilizerRec]
    additional_tips: list[str]

NUTRITION_PROMPT = """You are an expert Agronomist and Soil Scientist.
The farmer has provided the following soil test and crop details:
- Nitrogen (N): {n} kg/ha
- Phosphorus (P): {p} kg/ha
- Potassium (K): {k} kg/ha
- pH Level: {ph}
- Crop Type: {crop}
- Expected Yield: {yield_target}
- Land Area: {area}

Analyze the soil health and provide precise fertilizer recommendations to achieve the expected yield.
Consider Indian agricultural context and fertilizers (e.g., Urea, DAP, MOP, SSP).
Respond strictly in JSON format matching the following structure without any markdown formatting or extra text:
{{
    "status": "Good / Needs Improvement / Poor",
    "soil_health_summary": "A brief 2-3 sentence analysis of the current soil parameters.",
    "recommendations": [
        {{
            "name": "Fertilizer Name (e.g., Urea)",
            "quantity": "Amount per area (e.g., 50 kg/acre)",
            "timing": "When to apply (e.g., Basal dose, 30 days after sowing)",
            "application_method": "How to apply (e.g., Broadcasting, fertigation)"
        }}
    ],
    "additional_tips": ["Tip 1", "Tip 2"]
}}
"""

def _generate_nutrition_fallback(req: NutritionRequest) -> NutritionResponse:
    status = "Good"
    recs = []
    tips = [
        f"For {req.crop_type}, ensure timely split application of nutrients.",
        "Add well-decomposed organic compost or farmyard manure to improve soil structure and water retention.",
        "Ensure proper soil moisture before and after applying synthetic fertilizers."
    ]

    area = max(req.land_area or 1.0, 0.5)

    if req.nitrogen < 140:
        status = "Needs Improvement"
        recs.append(FertilizerRec(
            name="Urea (46% N)",
            quantity=f"{round(40 * area)} kg total ({round(40 * area / area)} kg/acre)",
            timing="Split: 50% basal at sowing, 50% top-dressing at 30-35 days",
            application_method="Broadcasting followed by light irrigation"
        ))

    if req.phosphorus < 40:
        status = "Needs Improvement" if status == "Good" else "Poor"
        recs.append(FertilizerRec(
            name="DAP (18-46-0) or SSP",
            quantity=f"{round(25 * area)} kg total ({round(25 * area / area)} kg/acre)",
            timing="Full dose as basal application at sowing",
            application_method="Band placement 4-5 cm below seed depth"
        ))

    if req.potassium < 150:
        recs.append(FertilizerRec(
            name="MOP (Muriate of Potash)",
            quantity=f"{round(20 * area)} kg total ({round(20 * area / area)} kg/acre)",
            timing="Basal application or at flowering stage",
            application_method="Broadcasting"
        ))

    if req.ph_level < 6.0:
        status = "Poor"
        tips.append("Soil is acidic (pH < 6.0). Application of agricultural lime is recommended to normalize pH.")
    elif req.ph_level > 8.0:
        status = "Needs Improvement" if status == "Good" else status
        tips.append("Soil is alkaline (pH > 8.0). Gypsum application and zinc foliar spray are recommended.")

    if not recs:
        recs.append(FertilizerRec(
            name="Balanced NPK (19:19:19)",
            quantity=f"{round(15 * area)} kg total",
            timing="Vegetative growth stage",
            application_method="Foliar spray or fertigation"
        ))

    summary = (
        f"For {req.crop_type} ({req.land_area} acres): Soil pH is {req.ph_level} with NPK levels "
        f"({req.nitrogen}, {req.phosphorus}, {req.potassium}) kg/ha. "
        f"{'Nutrient levels are generally optimal.' if status == 'Good' else 'Targeted nutrient supplementation will help achieve your expected yield.'}"
    )

    return NutritionResponse(
        status=status,
        soil_health_summary=summary,
        recommendations=recs,
        additional_tips=tips[:3]
    )


@router.post("/advice", response_model=NutritionResponse)
async def get_nutrition_advice(
    req: NutritionRequest,
    current_user: User = Depends(get_current_user)
):
    api_key = os.getenv("GROQ_API_KEY", "")
    
    if not api_key or api_key == "your-groq-api-key-here":
        return _generate_nutrition_fallback(req)

    client = AsyncGroq(api_key=api_key, timeout=20.0)
    prompt = NUTRITION_PROMPT.format(
        n=req.nitrogen,
        p=req.phosphorus,
        k=req.potassium,
        ph=req.ph_level,
        crop=req.crop_type,
        yield_target=req.expected_yield,
        area=req.land_area
    )

    candidate_models = [
        os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b"),
        "openai/gpt-oss-20b",
        "openai/gpt-oss-120b",
    ]
    models = list(dict.fromkeys(candidate_models))

    for model_name in models:
        try:
            response = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful agronomist that returns only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=1024,
            )
            
            raw_text = response.choices[0].message.content or ""
            json_text = raw_text.strip()
            if "<think>" in json_text and "</think>" in json_text:
                json_text = json_text.split("</think>")[-1].strip()
            if json_text.startswith("```json"):
                json_text = json_text[7:]
            if json_text.startswith("```"):
                json_text = json_text[3:]
            if json_text.endswith("```"):
                json_text = json_text[:-3]
            json_text = json_text.strip()

            try:
                result = json.loads(json_text)
            except json.JSONDecodeError:
                import re
                match = re.search(r'\{[\s\S]*\}', json_text)
                if match:
                    result = json.loads(match.group(0))
                else:
                    continue

            return NutritionResponse(**result)

        except Exception as e:
            print(f"[Nutrition] Groq API Error with {model_name}: {e}")
            continue

    # Fallback to rule engine if all models fail
    return _generate_nutrition_fallback(req)

