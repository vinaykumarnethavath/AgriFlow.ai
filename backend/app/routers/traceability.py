from typing import List
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from ..database import get_session
from ..models import TraceabilityEvent, Product, User
from ..deps import get_current_user
from ..services.blockchain_service import record_ledger_entry

router = APIRouter(prefix="/traceability", tags=["traceability"])

@router.post("/", response_model=TraceabilityEvent)
async def add_event(
    product_id: int,
    action: str,
    details: str, # JSON string
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    # Verify product exists
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # In a real app, verify ownership or permissions based on supply chain logic
    
    event = TraceabilityEvent(
        product_id=product_id,
        actor_id=current_user.id,
        action=action,
        details=details
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    
    # Save a corresponding block on the blockchain ledger
    try:
        parsed_details = json.loads(details)
    except Exception:
        parsed_details = {"raw_details": details}
        
    blockchain_payload = {
        "event_id": event.id,
        "product_id": product_id,
        "product_name": product.name,
        "batch_number": product.batch_number,
        "action": action,
        "actor_id": current_user.id,
        "actor_name": current_user.full_name,
        "actor_email": current_user.email,
        "details": parsed_details
    }
    
    await record_ledger_entry(
        session=session,
        payload_data=blockchain_payload,
        product_id=product_id,
        certification_type="traceability",
        verifier_name=f"AgriFlow System Audit ({current_user.role.capitalize()})"
    )
    
    return event


@router.get("/{product_id}", response_model=List[TraceabilityEvent])
async def get_product_traceability(
    product_id: int,
    session: AsyncSession = Depends(get_session)
):
    statement = select(TraceabilityEvent).where(TraceabilityEvent.product_id == product_id).order_by(TraceabilityEvent.timestamp)
    result = await session.exec(statement)
    return result.all()


@router.get("/public/{product_id}")
async def get_public_traceability(
    product_id: int,
    session: AsyncSession = Depends(get_session)
):
    """
    Public endpoint for traceability - returns basic product info + events.
    No auth required.
    """
    # Get product
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Get farmer details
    farmer = await session.get(User, product.user_id)
    
    # Get events
    statement = select(TraceabilityEvent).where(TraceabilityEvent.product_id == product_id).order_by(TraceabilityEvent.timestamp)
    result = await session.exec(statement)
    events = result.all()
    
    # Get blockchain blocks for product
    from ..models.blockchain import BlockchainBlock
    block_stmt = select(BlockchainBlock).where(BlockchainBlock.product_id == product_id).order_by(BlockchainBlock.block_index.asc())
    block_res = await session.exec(block_stmt)
    blocks = block_res.all()
    
    return {
        "product": {
            "id": product.id,
            "name": product.name,
            "category": product.category,
            "description": product.description,
            "batch_number": product.batch_number,
            "quantity": product.quantity
        },
        "farmer": {
            "name": farmer.full_name if farmer else "Unknown Farmer",
            "is_verified": farmer.is_verified if farmer else False
        },
        "events": events,
        "blockchain_blocks": blocks
    }
