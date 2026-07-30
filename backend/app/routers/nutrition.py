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

@router.post("/advice", response_model=NutritionResponse)
async def get_nutrition_advice(
    req: NutritionRequest,
    current_user: User = Depends(get_current_user)
):
    api_key = os.getenv("GROQ_API_KEY", "")
    
    if not api_key or api_key == "your-groq-api-key-here":
        # Return mock data if no key is set
        return NutritionResponse(
            status="Needs Improvement",
            soil_health_summary=f"The soil pH ({req.ph_level}) is slightly off for {req.crop_type}. NPK levels ({req.nitrogen}, {req.phosphorus}, {req.potassium}) indicate a deficiency in Nitrogen.",
            recommendations=[
                FertilizerRec(name="Urea", quantity="40 kg per acre", timing="Basal dose", application_method="Broadcasting"),
                FertilizerRec(name="DAP", quantity="25 kg per acre", timing="30 days after sowing", application_method="Band placement")
            ],
            additional_tips=["Consider adding organic compost to improve soil structure.", "Ensure proper irrigation after fertilizer application."]
        )

    client = AsyncGroq(api_key=api_key)
    prompt = NUTRITION_PROMPT.format(
        n=req.nitrogen,
        p=req.phosphorus,
        k=req.potassium,
        ph=req.ph_level,
        crop=req.crop_type,
        yield_target=req.expected_yield,
        area=req.land_area
    )

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful agronomist that returns only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        
        raw_text = response.choices[0].message.content or ""
        json_text = raw_text.strip()
        if json_text.startswith("```json"):
            json_text = json_text[7:]
        if json_text.startswith("```"):
            json_text = json_text[3:]
        if json_text.endswith("```"):
            json_text = json_text[:-3]
        json_text = json_text.strip()

        result = json.loads(json_text)
        return NutritionResponse(**result)

    except Exception as e:
        print(f"[Nutrition] Groq API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI advice.")
