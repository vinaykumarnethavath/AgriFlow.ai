from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, col, desc

from ..database import get_session
from ..models import User, Crop
from ..deps import get_current_user
from .market_prices import get_market_prices

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/crop")
async def get_crop_recommendations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # Fetch user's previous crops (most recent first)
    statement = select(Crop).where(Crop.user_id == current_user.id).order_by(desc(col(Crop.sowing_date)))
    result = await session.exec(statement)
    crops = result.all()
    
    last_crop_name = None
    if crops:
        last_crop_name = crops[0].name.lower()
        
    # Get current market prices and trends
    market_data = await get_market_prices(lang="en")
    
    recommendations = []
    
    # 1. Market Demand Based Recommendation
    high_demand_crops = [item for item in market_data if item.get("trend") == "up"]
    if high_demand_crops:
        # Sort by highest base price for better profits
        high_demand_crops.sort(key=lambda x: x.get("market_price", 0), reverse=True)
        top_market_crop = high_demand_crops[0]
        recommendations.append({
            "crop_name": top_market_crop["crop_name"],
            "reason": f"High market demand with an upward price trend (₹{top_market_crop['market_price']}/q).",
            "confidence_score": 90,
            "type": "market"
        })
        
    # 2. Crop Rotation Based Recommendation
    # Basic logic: If last crop was a cereal (Wheat, Rice, Maize), recommend a legume (Soybean, Groundnut)
    # If last crop was a legume, recommend a cereal.
    cereals = ["wheat", "rice", "maize", "paddy", "corn"]
    legumes = ["soybean", "groundnut", "peanut", "gram"]
    
    if last_crop_name:
        if any(c in last_crop_name for c in cereals):
            recommendations.append({
                "crop_name": "Soybean",
                "reason": f"Great for crop rotation. Since your last crop was {crops[0].name}, planting a legume like Soybean will help fix soil nitrogen.",
                "confidence_score": 85,
                "type": "rotation"
            })
        elif any(l in last_crop_name for l in legumes):
            recommendations.append({
                "crop_name": "Wheat",
                "reason": f"Ideal for crop rotation after {crops[0].name}. The soil is now rich in nitrogen, perfect for cereals.",
                "confidence_score": 85,
                "type": "rotation"
            })
        else:
            # Fallback rotation
            recommendations.append({
                "crop_name": "Maize",
                "reason": "A versatile crop that generally works well in most rotation cycles.",
                "confidence_score": 70,
                "type": "rotation"
            })
            
    # 3. Weather / General (Fallback)
    recommendations.append({
        "crop_name": "Chilli",
        "reason": "Highly profitable cash crop if you have good irrigation facilities.",
        "confidence_score": 80,
        "type": "general"
    })
    
    # Ensure no duplicates by crop name (case insensitive)
    seen = set()
    unique_recs = []
    for rec in recommendations:
        name = rec["crop_name"].lower()
        if name not in seen:
            seen.add(name)
            unique_recs.append(rec)

    return unique_recs[:3]
