"""
AI Crop Health Diagnosis Router
================================
Deep-learning based disease diagnosis via mobile photos.
Uses Groq Vision API (Llama 3.2 Vision) to analyze crop images
and provide instant treatment + pesticide recommendations.
"""

import os
import base64
import json
import traceback
import uuid
from typing import Optional

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from groq import AsyncGroq
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from ..deps import get_current_user
from ..database import get_session
from ..models.user import User
from ..models.crop import CropDiagnosis

router = APIRouter(prefix="/crop-health", tags=["crop-health"])

# Maximum image size: 10MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}

# ---------------------------------------------------------------------------
# Response Models
# ---------------------------------------------------------------------------

class DiseaseInfo(BaseModel):
    disease_name: str
    confidence: str  # "High", "Medium", "Low"
    severity: str    # "Mild", "Moderate", "Severe", "Critical"
    description: str
    affected_parts: list[str]
    causes: list[str]

class TreatmentStep(BaseModel):
    step_number: int
    title: str
    description: str
    timing: str  # "Immediately", "Within 24 hours", etc.

class PesticideRecommendation(BaseModel):
    name: str
    type: str  # "Fungicide", "Insecticide", "Bactericide", etc.
    dosage: str
    application_method: str
    frequency: str
    precautions: list[str]

class PreventionTip(BaseModel):
    tip: str
    category: str  # "Cultural", "Chemical", "Biological", "Environmental"

class CropHealthDiagnosis(BaseModel):
    is_healthy: bool
    crop_detected: str
    disease: Optional[DiseaseInfo] = None
    treatment_steps: list[TreatmentStep]
    pesticide_recommendations: list[PesticideRecommendation]
    prevention_tips: list[PreventionTip]
    additional_notes: str
    urgency_level: str  # "None", "Low", "Medium", "High", "Critical"


# ---------------------------------------------------------------------------
# Vision Analysis Prompt
# ---------------------------------------------------------------------------

DIAGNOSIS_SYSTEM_PROMPT = """You are AgriFlow CropDoc AI, an expert agricultural plant pathologist. 
You analyze images of crops to diagnose diseases, pests, and health issues.

IMPORTANT RULES:
1. Analyze the image carefully for any signs of disease, pest damage, nutrient deficiency, or stress.
2. If the plant appears healthy, say so clearly.
3. If you detect a disease/issue, provide DETAILED and ACCURATE information.
4. Focus on Indian agriculture context — use locally available treatments and pesticides.
5. Always provide actionable, practical advice that a farmer can follow immediately.
6. Use simple, clear language.
7. If the image is unclear or not a plant/crop, say so honestly.

You MUST respond ONLY with valid JSON in this exact structure (no markdown, no extra text):
{
    "is_healthy": true/false,
    "crop_detected": "Name of the crop/plant detected",
    "disease": {
        "disease_name": "Name of disease or 'None'",
        "confidence": "High/Medium/Low",
        "severity": "Mild/Moderate/Severe/Critical",
        "description": "Detailed description of the disease",
        "affected_parts": ["leaf", "stem", "fruit", etc.],
        "causes": ["fungal infection", "bacterial", "environmental stress", etc.]
    },
    "treatment_steps": [
        {
            "step_number": 1,
            "title": "Step title",
            "description": "Detailed description",
            "timing": "Immediately / Within 24 hours / Within a week"
        }
    ],
    "pesticide_recommendations": [
        {
            "name": "Product name (generic + brand examples)",
            "type": "Fungicide/Insecticide/Bactericide/Bio-agent",
            "dosage": "e.g., 2ml per liter of water",
            "application_method": "Foliar spray / Soil drench / etc.",
            "frequency": "e.g., Every 7-10 days for 3 applications",
            "precautions": ["Wear gloves", "Avoid during flowering", etc.]
        }
    ],
    "prevention_tips": [
        {
            "tip": "Prevention tip description",
            "category": "Cultural/Chemical/Biological/Environmental"
        }
    ],
    "additional_notes": "Any extra advice or context",
    "urgency_level": "None/Low/Medium/High/Critical"
}

If the image is NOT a crop/plant, respond with:
{
    "is_healthy": true,
    "crop_detected": "Not a crop image",
    "disease": null,
    "treatment_steps": [],
    "pesticide_recommendations": [],
    "prevention_tips": [],
    "additional_notes": "The uploaded image does not appear to be a crop or plant. Please upload a clear photo of your crop leaves, stems, or affected areas for diagnosis.",
    "urgency_level": "None"
}"""


# ---------------------------------------------------------------------------
# Helper: Call Groq Vision API
# ---------------------------------------------------------------------------

async def analyze_crop_image(image_base64: str, mime_type: str, crop_name: Optional[str] = None) -> dict:
    """Send image to Hugging Face Vision model for crop disease analysis."""
    api_key = os.getenv("HUGGINGFACE_API_KEY", "")
    
    # If API key is not configured, fallback to mock response
    if not api_key or api_key == "your_token_here":
        print("[CropHealth] Hugging Face API key not configured. Falling back to mock response.")
        return get_mock_diagnosis(crop_name)

    user_message = "Analyze this crop image for any diseases, pest damage, or health issues. Provide a complete diagnosis."
    if crop_name:
        user_message += f"\n\nThe farmer has identified this crop as: {crop_name}. Use this context for more accurate diagnosis."

    try:
        import httpx
        url = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "meta-llama/Llama-3.2-11B-Vision-Instruct",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{DIAGNOSIS_SYSTEM_PROMPT}\n\n{user_message}"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 2048,
            "temperature": 0.1
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                print(f"[CropHealth] HF API Error {response.status_code}: {response.text}")
                # Fallback to mock on error (e.g. model loading)
                return get_mock_diagnosis(crop_name)
                
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"] or ""
        
        # Try to parse JSON from the response
        # Sometimes the model wraps JSON in markdown code blocks
        json_text = raw_text.strip()
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
            # If JSON parsing fails, try to extract JSON from the text
            import re
            json_match = re.search(r'\{[\s\S]*\}', raw_text)
            if json_match:
                result = json.loads(json_match.group())
            else:
                # Return a fallback response
                result = get_mock_diagnosis(crop_name)

        return result

    except Exception as e:
        print(f"[CropHealth] Hugging Face Vision API error: {e}")
        import traceback
        traceback.print_exc()
        
        print("[CropHealth] Falling back to mock response due to exception.")
        return get_mock_diagnosis(crop_name)

def get_mock_diagnosis(crop_name: Optional[str]) -> dict:
    return {
        "is_healthy": False,
        "crop_detected": crop_name or "Crop",
        "disease": {
            "disease_name": "Leaf Blight (Simulated)",
            "confidence": "High",
            "severity": "Moderate",
            "description": "This is a simulated response because the Hugging Face API key is missing or the API failed. Leaf blight is a common fungal disease characterized by dark, necrotic spots on leaves with yellow halos.",
            "affected_parts": ["Leaves", "Stems"],
            "causes": ["Fungal infection", "High humidity", "Poor air circulation"]
        },
        "treatment_steps": [
            {
                "step_number": 1,
                "title": "Remove Affected Leaves",
                "description": "Carefully prune and destroy all leaves showing signs of blight.",
                "timing": "Immediate"
            },
            {
                "step_number": 2,
                "title": "Improve Ventilation",
                "description": "Ensure plants are spaced properly to allow air to circulate and dry foliage.",
                "timing": "Ongoing"
            }
        ],
        "pesticide_recommendations": [
            {
                "name": "Copper Fungicide",
                "type": "Organic Fungicide",
                "dosage": "2 tablespoons per gallon of water",
                "application_method": "Foliar spray",
                "frequency": "Every 7-10 days",
                "precautions": ["Apply early in the morning", "Do not apply in high heat", "Wear protective gloves"]
            }
        ],
        "prevention_tips": [
            {
                "category": "Watering",
                "tip": "Water at the base of the plant to keep foliage dry."
            },
            {
                "category": "Maintenance",
                "tip": "Clean garden tools after use to prevent spreading spores."
            }
        ],
        "additional_notes": "Note: This is a demonstration diagnosis.",
        "urgency_level": "Medium"
    }


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@router.post("/diagnose", response_model=CropHealthDiagnosis)
async def diagnose_crop(
    image: UploadFile = File(...),
    crop_name: Optional[str] = Form(None),
    crop_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Upload a crop image for AI-powered disease diagnosis.
    Returns detailed disease info, treatment steps, and pesticide recommendations.
    """
    # Validate file type
    content_type = image.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {content_type}. Allowed types: JPEG, PNG, WebP"
        )

    # Read and validate size
    image_bytes = await image.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large ({len(image_bytes) / 1024 / 1024:.1f}MB). Maximum size is 10MB."
        )

    if len(image_bytes) < 1000:
        raise HTTPException(
            status_code=400,
            detail="Image file appears to be corrupted or too small."
        )

    # Save image to disk if crop_id is provided
    image_url = ""
    if crop_id:
        os.makedirs("uploads/diagnoses", exist_ok=True)
        ext = content_type.split("/")[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("uploads", "diagnoses", filename)
        
        async with aiofiles.open(filepath, 'wb') as out_file:
            await out_file.write(image_bytes)
        
        # We assume the static directory is mounted at /static mapping to uploads/
        # Or you can construct the URL based on request (simplified here)
        image_url = f"/static/diagnoses/{filename}"

    # Convert to base64
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    # Call Groq Vision API
    result = await analyze_crop_image(image_base64, content_type, crop_name)

    # Validate and return structured response
    try:
        diagnosis = CropHealthDiagnosis(**result)
    except Exception as validation_error:
        print(f"[CropHealth] Response validation error: {validation_error}")
        # Try to construct a valid response from partial data
        diagnosis = CropHealthDiagnosis(
            is_healthy=result.get("is_healthy", False),
            crop_detected=result.get("crop_detected", crop_name or "Unknown"),
            disease=DiseaseInfo(**result["disease"]) if result.get("disease") else None,
            treatment_steps=[TreatmentStep(**s) for s in result.get("treatment_steps", [])],
            pesticide_recommendations=[PesticideRecommendation(**p) for p in result.get("pesticide_recommendations", [])],
            prevention_tips=[PreventionTip(**t) for t in result.get("prevention_tips", [])],
            additional_notes=result.get("additional_notes", ""),
            urgency_level=result.get("urgency_level", "Medium"),
        )
        
    # Save to database if crop_id is present
    if crop_id:
        db_record = CropDiagnosis(
            crop_id=crop_id,
            image_url=image_url,
            is_healthy=diagnosis.is_healthy,
            disease_name=diagnosis.disease.disease_name if diagnosis.disease else None,
            severity=diagnosis.disease.severity if diagnosis.disease else None,
            confidence=diagnosis.disease.confidence if diagnosis.disease else None,
            full_diagnosis_json=json.dumps(diagnosis.dict())
        )
        db.add(db_record)
        await db.commit()

    return diagnosis

@router.get("/history/{crop_id}")
async def get_diagnosis_history(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Fetch all past diagnoses for a specific crop."""
    # We could also verify if the crop belongs to the current user
    result = await db.exec(
        select(CropDiagnosis).where(CropDiagnosis.crop_id == crop_id).order_by(CropDiagnosis.created_at.desc())
    )
    records = result.all()
    
    # Optional: we can return the full diagnosis parsed from JSON
    response = []
    for record in records:
        try:
            diag_data = json.loads(record.full_diagnosis_json)
            response.append({
                "id": record.id,
                "crop_id": record.crop_id,
                "image_url": record.image_url,
                "created_at": record.created_at,
                "diagnosis": diag_data
            })
        except:
            pass
            
    return response



@router.get("/supported-crops")
async def get_supported_crops():
    """Return a list of common Indian crops for the dropdown selector."""
    return {
        "crops": [
            {"name": "Rice (Paddy)", "emoji": "🌾"},
            {"name": "Wheat", "emoji": "🌾"},
            {"name": "Cotton", "emoji": "☁️"},
            {"name": "Sugarcane", "emoji": "🎋"},
            {"name": "Maize (Corn)", "emoji": "🌽"},
            {"name": "Groundnut (Peanut)", "emoji": "🥜"},
            {"name": "Soybean", "emoji": "🫘"},
            {"name": "Chili (Mirchi)", "emoji": "🌶️"},
            {"name": "Tomato", "emoji": "🍅"},
            {"name": "Potato", "emoji": "🥔"},
            {"name": "Onion", "emoji": "🧅"},
            {"name": "Brinjal (Eggplant)", "emoji": "🍆"},
            {"name": "Okra (Bhindi)", "emoji": "🌿"},
            {"name": "Turmeric", "emoji": "🟡"},
            {"name": "Mango", "emoji": "🥭"},
            {"name": "Banana", "emoji": "🍌"},
            {"name": "Grapes", "emoji": "🍇"},
            {"name": "Pomegranate", "emoji": "🔴"},
            {"name": "Mustard", "emoji": "🌻"},
            {"name": "Sunflower", "emoji": "🌻"},
            {"name": "Jowar (Sorghum)", "emoji": "🌾"},
            {"name": "Bajra (Pearl Millet)", "emoji": "🌾"},
            {"name": "Ragi (Finger Millet)", "emoji": "🌾"},
            {"name": "Other", "emoji": "🌿"},
        ]
    }
