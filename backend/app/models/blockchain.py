from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class BlockchainBlock(SQLModel, table=True):
    __tablename__ = "blockchain_blocks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    block_index: int = Field(index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    previous_hash: str
    hash: str
    payload: str  # JSON-encoded transaction / certification data
    
    product_id: Optional[int] = Field(default=None, foreign_key="product.id")
    certification_type: Optional[str] = Field(default=None)  # "organic", "fair-trade", "traceability"
    verifier_name: Optional[str] = Field(default=None)  # "AgriChain Authority", etc.
