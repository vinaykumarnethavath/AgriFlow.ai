from typing import List, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func
from pydantic import BaseModel

from ..database import get_session
from ..models import User, Product
from ..models.blockchain import BlockchainBlock
from ..deps import get_current_user
from ..services.blockchain_service import (
    record_ledger_entry,
    verify_blockchain_integrity,
    ensure_genesis_block
)

router = APIRouter(prefix="/blockchain", tags=["blockchain"])

class CertificationRequest(BaseModel):
    product_id: int
    certification_type: str  # "organic" | "fair-trade"
    verifier_name: str
    details: Dict

@router.get("/blocks", response_model=List[BlockchainBlock])
async def get_blocks(
    session: AsyncSession = Depends(get_session)
):
    """Retrieve all blockchain blocks ordered by index ascending."""
    await ensure_genesis_block(session)
    statement = select(BlockchainBlock).order_by(BlockchainBlock.block_index.asc())
    results = await session.exec(statement)
    return results.all()

@router.get("/verify")
async def verify_ledger(
    session: AsyncSession = Depends(get_session)
):
    """Perform integrity verification on the cryptographic chain."""
    is_valid, failing_index, error_msg = await verify_blockchain_integrity(session)
    return {
        "is_valid": is_valid,
        "failing_block_index": failing_index,
        "message": error_msg
    }

@router.get("/stats")
async def get_stats(
    session: AsyncSession = Depends(get_session)
):
    """Retrieve high-level overview metrics of the blockchain ledger."""
    await ensure_genesis_block(session)
    
    # 1. Total Blocks count
    count_statement = select(func.count()).select_from(BlockchainBlock)
    count_result = await session.exec(count_statement)
    total_blocks = count_result.first() or 0
    
    # 2. Total Organic Certs
    organic_stmt = select(func.count()).select_from(BlockchainBlock).where(BlockchainBlock.certification_type == "organic")
    organic_res = await session.exec(organic_stmt)
    organic_count = organic_res.first() or 0
    
    # 3. Total Fair-Trade Certs
    ft_stmt = select(func.count()).select_from(BlockchainBlock).where(BlockchainBlock.certification_type == "fair-trade")
    ft_res = await session.exec(ft_stmt)
    ft_count = ft_res.first() or 0
    
    # 4. Total Traceability Events
    trace_stmt = select(func.count()).select_from(BlockchainBlock).where(BlockchainBlock.certification_type == "traceability")
    trace_res = await session.exec(trace_stmt)
    trace_count = trace_res.first() or 0
    
    # 5. Integrity status
    is_valid, _, _ = await verify_blockchain_integrity(session)
    
    return {
        "total_blocks": total_blocks,
        "organic_certifications": organic_count,
        "fair_trade_verifications": ft_count,
        "traceability_events": trace_count,
        "is_ledger_valid": is_valid
    }

@router.post("/certify", response_model=BlockchainBlock)
async def create_certification(
    request: CertificationRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """Create a new Organic or Fair-Trade certification block."""
    if current_user.role not in ["farmer", "manufacturer", "shop"]:
         raise HTTPException(status_code=403, detail="Not authorized to issue certifications")
         
    # Verify product exists
    product = await session.get(Product, request.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    # Build payload structure
    payload = {
        "product_id": request.product_id,
        "product_name": product.name,
        "batch_number": product.batch_number,
        "certification_type": request.certification_type,
        "verifier_name": request.verifier_name,
        "actor_email": current_user.email,
        "actor_name": current_user.full_name,
        "details": request.details,
        "timestamp": func.now()
    }
    
    # Record in blockchain
    block = await record_ledger_entry(
        session=session,
        payload_data=payload,
        product_id=request.product_id,
        certification_type=request.certification_type,
        verifier_name=request.verifier_name
    )
    
    return block

@router.post("/tamper-demo")
async def tamper_blockchain(
    block_index: int,
    tampered_payload: str,
    session: AsyncSession = Depends(get_session)
):
    """
    Demo endpoint: Directly alter a block's payload in the database without re-mining.
    This simulates malicious data tampering to demonstrate how the blockchain verification catches it.
    """
    statement = select(BlockchainBlock).where(BlockchainBlock.block_index == block_index)
    results = await session.exec(statement)
    block = results.first()
    
    if not block:
        raise HTTPException(status_code=404, detail=f"Block with index {block_index} not found.")
        
    block.payload = tampered_payload
    session.add(block)
    await session.commit()
    
    return {
        "message": f"Block {block_index} successfully tampered with! The hash chain is now broken.",
        "tampered_block": {
            "index": block.block_index,
            "payload": block.payload,
            "saved_hash": block.hash
        }
    }
