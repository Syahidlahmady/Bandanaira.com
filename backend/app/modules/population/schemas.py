from datetime import date, datetime
from typing import Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class AdministrativeRequestCreate(BaseModel):
    resident_id: uuid.UUID
    request_type: str = Field(..., min_length=3, max_length=100)
    notes: Optional[str] = None


class AdministrativeRequestResponse(BaseModel):
    id: uuid.UUID
    resident_id: uuid.UUID
    request_type: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResidentCreate(BaseModel):
    nik: str = Field(..., min_length=16, max_length=16, pattern=r"^\d{16}$", description="16-digit synthetic NIK")
    full_name: str = Field(..., min_length=2, max_length=255)
    gender: str = Field(..., pattern=r"^(L|P)$", description="'L' for Laki-laki, 'P' for Perempuan")
    birth_place: Optional[str] = Field(None, max_length=100)
    birth_date: Optional[date] = None
    address: Optional[str] = None
    rt: Optional[str] = Field(None, max_length=5)
    rw: Optional[str] = Field(None, max_length=5)
    village: str = Field("Banda Neira", max_length=100)
    religion: Optional[str] = Field(None, max_length=50)
    marital_status: Optional[str] = Field(None, max_length=50)
    occupation: Optional[str] = Field(None, max_length=100)
    phone_number: Optional[str] = Field(None, max_length=20)


class ResidentUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    gender: Optional[str] = Field(None, pattern=r"^(L|P)$")
    birth_place: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    rt: Optional[str] = None
    rw: Optional[str] = None
    village: Optional[str] = None
    religion: Optional[str] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    phone_number: Optional[str] = None


class ResidentVerificationUpdate(BaseModel):
    verification_status: str = Field(..., pattern=r"^(verified|rejected)$")
    notes: Optional[str] = None


class ResidentResponse(BaseModel):
    id: uuid.UUID
    nik: str
    full_name: str
    gender: str
    birth_place: Optional[str] = None
    birth_date: Optional[date] = None
    address: Optional[str] = None
    rt: Optional[str] = None
    rw: Optional[str] = None
    village: str
    religion: Optional[str] = None
    marital_status: Optional[str] = None
    occupation: Optional[str] = None
    phone_number: Optional[str] = None
    verification_status: str
    verified_by: Optional[uuid.UUID] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    administrative_requests: List[AdministrativeRequestResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ResidentListResponse(BaseModel):
    items: List[ResidentResponse]
    total: int
    page: int
    limit: int


class PopulationStatisticsResponse(BaseModel):
    total_residents: int
    total_verified: int
    total_pending: int
    total_rejected: int
    gender_distribution: Dict[str, int]
    top_occupations: Dict[str, int]
