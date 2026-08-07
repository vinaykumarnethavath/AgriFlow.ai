import hashlib
import json
from datetime import datetime
from typing import Optional, Tuple, List, Dict
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.blockchain import BlockchainBlock

DIFFICULTY_TARGET = "00"  # Fast but shows proof of work mechanism

def calculate_hash(block_index: int, timestamp_str: str, previous_hash: str, nonce: int, payload: str) -> str:
    """Calculate the SHA-256 hash of a block's contents."""
    block_string = f"{block_index}|{timestamp_str}|{previous_hash}|{nonce}|{payload}"
    return hashlib.sha256(block_string.encode('utf-8')).hexdigest()

def mine_block(block_index: int, previous_hash: str, payload: str, difficulty: str = DIFFICULTY_TARGET) -> Tuple[int, str]:
    """Mine a block by finding a nonce that yields a hash starting with the difficulty target."""
    nonce = 0
    timestamp_str = datetime.utcnow().isoformat()
    
    while True:
        block_hash = calculate_hash(block_index, timestamp_str, previous_hash, nonce, payload)
        if block_hash.startswith(difficulty):
            return nonce, block_hash, timestamp_str
        nonce += 1

async def get_latest_block(session: AsyncSession) -> Optional[BlockchainBlock]:
    """Retrieve the latest block in the chain from the database."""
    statement = select(BlockchainBlock).order_by(BlockchainBlock.block_index.desc()).limit(1)
    results = await session.exec(statement)
    return results.first()

async def ensure_genesis_block(session: AsyncSession) -> BlockchainBlock:
    """Ensure that the genesis block exists, creating it if necessary."""
    latest = await get_latest_block(session)
    if latest is not None:
        return latest
        
    # Genesis block payload
    genesis_payload = json.dumps({
        "message": "AgriChain Ledger Genesis Block",
        "system": "AgriFlow Immutable Supply Chain Ledger",
        "version": "1.0.0"
    })
    
    # Mine genesis block
    nonce, block_hash, timestamp_str = mine_block(0, "0" * 64, genesis_payload)
    
    genesis = BlockchainBlock(
        block_index=0,
        timestamp=datetime.fromisoformat(timestamp_str),
        previous_hash="0" * 64,
        hash=block_hash,
        nonce=nonce,
        payload=genesis_payload,
        certification_type="genesis",
        verifier_name="System Admin"
    )
    
    session.add(genesis)
    await session.commit()
    await session.refresh(genesis)
    return genesis

async def record_ledger_entry(
    session: AsyncSession,
    payload_data: Dict,
    product_id: Optional[int] = None,
    certification_type: Optional[str] = None,
    verifier_name: Optional[str] = None
) -> BlockchainBlock:
    """
    Mine and record a new block on the immutable ledger.
    Ensures genesis block exists first.
    """
    # 1. Ensure genesis exists
    await ensure_genesis_block(session)
    
    # 2. Get latest block to chain it
    latest = await get_latest_block(session)
    next_index = latest.block_index + 1
    previous_hash = latest.hash
    
    # 3. Stringify payload
    payload_str = json.dumps(payload_data, sort_keys=True)
    
    # 4. Mine new block
    nonce, block_hash, timestamp_str = mine_block(next_index, previous_hash, payload_str)
    
    # 5. Save block
    new_block = BlockchainBlock(
        block_index=next_index,
        timestamp=datetime.fromisoformat(timestamp_str),
        previous_hash=previous_hash,
        hash=block_hash,
        nonce=nonce,
        payload=payload_str,
        product_id=product_id,
        certification_type=certification_type,
        verifier_name=verifier_name
    )
    
    session.add(new_block)
    await session.commit()
    await session.refresh(new_block)
    return new_block

async def verify_blockchain_integrity(session: AsyncSession) -> Tuple[bool, Optional[int], Optional[str]]:
    """
    Verify the integrity of the blockchain database.
    Checks that previous hashes match, hashes are correctly computed, and difficulty is met.
    """
    statement = select(BlockchainBlock).order_by(BlockchainBlock.block_index.asc())
    results = await session.exec(statement)
    blocks: List[BlockchainBlock] = results.all()
    
    if not blocks:
        return True, None, "Blockchain is empty."
        
    for i, block in enumerate(blocks):
        # 1. Verify index sequencing
        if block.block_index != i:
            return False, block.block_index, f"Invalid block index sequence: expected {i}, got {block.block_index}"
            
        # 2. Check previous hash matching (except for genesis)
        if i > 0:
            prev_block = blocks[i - 1]
            if block.previous_hash != prev_block.hash:
                return False, block.block_index, f"Block previous_hash mismatch at block {block.block_index}. Link is broken."
        else:
            if block.previous_hash != "0" * 64:
                return False, 0, "Genesis block previous hash is invalid."
                
        # 3. Recalculate hash and verify correctness
        computed = calculate_hash(
            block.block_index,
            block.timestamp.isoformat() if isinstance(block.timestamp, datetime) else str(block.timestamp),
            block.previous_hash,
            block.nonce,
            block.payload
        )
        
        # If computed hash doesn't match saved hash, block is tampered
        if block.hash != computed:
            return False, block.block_index, f"Cryptographic integrity failed: Hash mismatch at block {block.block_index}. Saved: {block.hash}, Computed: {computed}"
            
        # 4. Check target difficulty met
        if not block.hash.startswith(DIFFICULTY_TARGET):
            return False, block.block_index, f"Proof of work target not met at block {block.block_index}."
            
    return True, None, "Blockchain ledger integrity fully verified. No tempering detected."
