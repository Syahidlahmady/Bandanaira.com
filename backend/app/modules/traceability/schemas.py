from datetime import date, datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class BatchHarvestInput(BaseModel):
    harvest_id: uuid.UUID
    allocated_quantity_kg: float = Field(..., gt=0.0)


class ProductBatchCreate(BaseModel):
    batch_code: str = Field(..., min_length=3, max_length=50)
    commodity: str = Field(..., min_length=2, max_length=100)
    production_date: date
    harvests: List[BatchHarvestInput] = Field(..., min_length=1)


class BatchEventCreate(BaseModel):
    event_type: str = Field(
        ...,
        pattern=r"^(harvest_aggregated|fermentation|drying|sorting|packaging|transfer)$",
        description="Standardized event lifecycle type",
    )
    location: Optional[str] = Field("Banda Neira", max_length=255)
    description: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None


class BatchEventResponse(BaseModel):
    id: uuid.UUID
    batch_id: uuid.UUID
    event_type: str
    event_timestamp: datetime
    recorded_by_user_id: uuid.UUID
    location: Optional[str] = None
    description: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    event_hash: str
    previous_event_hash: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductBatchResponse(BaseModel):
    id: uuid.UUID
    batch_code: str
    commodity: str
    total_quantity_kg: float
    production_date: date
    public_verification_token: str
    status: str
    blockchain_status: str
    created_at: datetime
    updated_at: datetime
    events: List[BatchEventResponse] = []
    qr_code_base64: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductBatchListResponse(BaseModel):
    items: List[ProductBatchResponse]
    total: int
    page: int
    limit: int


# Public Verification Schemas (Strictly Zero PII)
class PublicEventTimeline(BaseModel):
    event_type: str
    event_timestamp: datetime
    location: Optional[str] = None
    description: Optional[str] = None
    event_hash: str


class PublicBatchVerificationResponse(BaseModel):
    batch_code: str
    commodity: str
    total_quantity_kg: float
    production_date: date
    origin_village: str
    origin_farms: List[str]
    status: str
    blockchain_status: str
    verified_integrity: bool
    timeline: List[PublicEventTimeline]
    qr_code_base64: str
