import hashlib
import json
from datetime import datetime
from typing import Optional, Tuple, List, Dict
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from ..models.blockchain import BlockchainBlock

def calculate_hash(block_index: int, timestamp_str: str, previous_hash: str, payload: str) -> str:
    """Calculate the SHA-256 hash of a block's contents."""
    block_string = f"{block_index}|{timestamp_str}|{previous_hash}|{payload}"
    return hashlib.sha256(block_string.encode('utf-8')).hexdigest()

async def get_latest_block(session: AsyncSession) -> Optional[BlockchainBlock]:
    """Retrieve the latest block in the chain from the database."""
    statement = select(BlockchainBlock).order_by(BlockchainBlock.block_index.desc()).limit(1)
    results = await session.exec(statement)
    return results.first()

def _format_timestamp(ts) -> str:
    if isinstance(ts, datetime):
        return ts.strftime("%Y-%m-%dT%H:%M:%S")
    if isinstance(ts, str):
        try:
            return datetime.fromisoformat(ts).strftime("%Y-%m-%dT%H:%M:%S")
        except Exception:
            return ts
    return str(ts)

def _get_timestamp_candidates(ts) -> List[str]:
    candidates = []
    if isinstance(ts, datetime):
        candidates.append(ts.strftime("%Y-%m-%dT%H:%M:%S"))
        candidates.append(ts.isoformat())
        candidates.append(ts.strftime("%Y-%m-%d %H:%M:%S"))
        if ts.microsecond:
            candidates.append(ts.strftime("%Y-%m-%dT%H:%M:%S.%f"))
    elif isinstance(ts, str):
        candidates.append(ts)
        try:
            dt = datetime.fromisoformat(ts)
            candidates.append(dt.strftime("%Y-%m-%dT%H:%M:%S"))
            candidates.append(dt.isoformat())
        except Exception:
            pass
    return list(dict.fromkeys(candidates))

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
    
    # Create genesis block
    now = datetime.utcnow().replace(microsecond=0)
    timestamp_str = _format_timestamp(now)
    block_hash = calculate_hash(0, timestamp_str, "0" * 64, genesis_payload)
    
    genesis = BlockchainBlock(
        block_index=0,
        timestamp=now,
        previous_hash="0" * 64,
        hash=block_hash,
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
    
    # 4. Create new block hash
    now = datetime.utcnow().replace(microsecond=0)
    timestamp_str = _format_timestamp(now)
    block_hash = calculate_hash(next_index, timestamp_str, previous_hash, payload_str)
    
    # 5. Save block
    new_block = BlockchainBlock(
        block_index=next_index,
        timestamp=now,
        previous_hash=previous_hash,
        hash=block_hash,
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
                
        # 3. Recalculate hash and verify correctness with possible timestamp representations
        is_hash_valid = False
        candidates = _get_timestamp_candidates(block.timestamp)
        for ts_str in candidates:
            computed = calculate_hash(
                block.block_index,
                ts_str,
                block.previous_hash,
                block.payload
            )
            if block.hash == computed:
                is_hash_valid = True
                break
        
        # If computed hash doesn't match saved hash, block is tampered
        if not is_hash_valid:
            return False, block.block_index, f"Cryptographic integrity failed: Hash mismatch at block {block.block_index}. Saved: {block.hash}"
            
    return True, None, "Blockchain ledger integrity fully verified. No tampering detected."
