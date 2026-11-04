from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class FarmerGroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    leader_name: Optional[str] = Field(None, max_length=255)
    village: str = Field("Banda Neira", max_length=100)
    contact_number: Optional[str] = Field(None, max_length=20)


class FarmerGroupResponse(BaseModel):
    id: uuid.UUID
    name: str
    leader_name: Optional[str] = None
    village: str
    contact_number: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmerCreate(BaseModel):
    farmer_code: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    status: str = Field("active", pattern=r"^(active|inactive)$")
    user_id: Optional[uuid.UUID] = None
    resident_id: Optional[uuid.UUID] = None
    farmer_group_id: Optional[uuid.UUID] = None


class FarmerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = None
    status: Optional[str] = Field(None, pattern=r"^(active|inactive)$")
    farmer_group_id: Optional[uuid.UUID] = None


class FarmerResponse(BaseModel):
    id: uuid.UUID
    farmer_code: str
    name: str
    phone: Optional[str] = None
    status: str
    user_id: Optional[uuid.UUID] = None
    resident_id: Optional[uuid.UUID] = None
    farmer_group_id: Optional[uuid.UUID] = None
    group: Optional[FarmerGroupResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FarmerListResponse(BaseModel):
    items: List[FarmerResponse]
    total: int
    page: int
    limit: int
