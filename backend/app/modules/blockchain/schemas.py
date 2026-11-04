import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class BlockchainAnchorRequest(BaseModel):
    event_id: Optional[uuid.UUID] = Field(None, description="Optional specific event to anchor. If omitted, anchors latest event.")


class BlockchainTransactionResponse(BaseModel):
    id: uuid.UUID
    batch_id: uuid.UUID
    event_id: Optional[uuid.UUID] = None
    transaction_hash: Optional[str] = None
    block_number: Optional[int] = None
    contract_address: str
    data_hash: str
    status: str
    submitted_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlockchainVerificationResponse(BaseModel):
    batch_id: uuid.UUID
    batch_code: str
    latest_db_hash: str
    on_chain_hash: Optional[str] = None
    is_verified: bool
    status: str
    network_chain_id: int
    contract_address: str
    block_number: Optional[int] = None
    transaction_hash: Optional[str] = None
    verified_at: datetime
    message: str

    model_config = ConfigDict(from_attributes=True)
