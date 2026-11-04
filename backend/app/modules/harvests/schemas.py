from datetime import date, datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class HarvestCreate(BaseModel):
    farm_id: uuid.UUID
    farmer_id: uuid.UUID
    harvest_code: str = Field(..., min_length=3, max_length=50)
    commodity: str = Field(..., min_length=2, max_length=100)
    harvest_date: date
    quantity_kg: float = Field(..., gt=0.0)
    quality_grade: Optional[str] = Field("Grade A", max_length=20)
    notes: Optional[str] = None


class HarvestResponse(BaseModel):
    id: uuid.UUID
    farm_id: uuid.UUID
    farmer_id: uuid.UUID
    harvest_code: str
    commodity: str
    harvest_date: date
    quantity_kg: float
    quality_grade: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HarvestListResponse(BaseModel):
    items: List[HarvestResponse]
    total: int
    page: int
    limit: int
