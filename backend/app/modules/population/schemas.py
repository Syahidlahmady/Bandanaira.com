from datetime import date, datetime
from typing import Dict, List, Optional
import uuid
from pydantic import BaseModel, ConfigDict, Field


class AdministrativeRequestCreate(BaseModel):
    resident_id: Optional[uuid.UUID] = None
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


class AdministrativeRequestStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(submitted|in_review|approved|rejected)$")
    notes: Optional[str] = None


class AdministrativeRequestDetailResponse(BaseModel):
    id: uuid.UUID
    resident_id: uuid.UUID
    resident_name: Optional[str] = None
    resident_nik: Optional[str] = None
    resident_occupation: Optional[str] = None
    request_type: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdministrativeRequestListResponse(BaseModel):
    items: List[AdministrativeRequestDetailResponse]
    total: int
    page: int
    limit: int


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
    access_pin: Optional[str] = Field(None, min_length=6, max_length=100, description="PIN (min 6 digit angka) atau kata sandi akun warga. Jika dikosongkan, PIN akan dibuat otomatis.")
    residence_status: Optional[str] = Field("active", pattern=r"^(active|moving|moved_out|temporary|deceased)$")


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
    residence_status: Optional[str] = Field(None, pattern=r"^(active|moving|moved_out|temporary|deceased)$")


class ResidentVerificationUpdate(BaseModel):
    verification_status: str = Field(..., pattern=r"^(verified|rejected)$")
    notes: Optional[str] = None


class ResidentReportDeathRequest(BaseModel):
    death_date: date = Field(..., description="Tanggal wafat/meninggal dunia")
    death_place: Optional[str] = Field(None, max_length=150, description="Tempat wafat (RS, rumah, dll)")
    death_cause: Optional[str] = Field(None, max_length=150, description="Penyebab wafat (sakit, usia, dll)")
    death_certificate_no: Optional[str] = Field(None, max_length=100, description="Nomor surat keterangan / akta kematian")
    death_notes: Optional[str] = Field(None, description="Catatan pelapor / keterangan tambahan")


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
    residence_status: str = "active"
    death_date: Optional[date] = None
    death_place: Optional[str] = None
    death_cause: Optional[str] = None
    death_certificate_no: Optional[str] = None
    death_notes: Optional[str] = None
    reported_death_at: Optional[datetime] = None
    reported_death_by: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    administrative_requests: List[AdministrativeRequestResponse] = []
    access_pin: Optional[str] = None
    account_username: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ResidentMutationCreate(BaseModel):
    resident_id: uuid.UUID
    destination_village: str = Field(..., min_length=2, max_length=100)
    new_address: Optional[str] = None
    new_rt: Optional[str] = Field(None, max_length=5)
    new_rw: Optional[str] = Field(None, max_length=5)
    reason: Optional[str] = Field(None, description="Alasan mutasi/pindah domisili")
    skpwni_number: Optional[str] = Field(None, max_length=100, description="Nomor Surat Keterangan Pindah (SKPWNI)")


class ResidentMutationApproveRequest(BaseModel):
    new_address: Optional[str] = None
    new_rt: Optional[str] = Field(None, max_length=5)
    new_rw: Optional[str] = Field(None, max_length=5)
    notes: Optional[str] = None


class ResidentMutationRejectRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500, description="Alasan penolakan mutasi")


class ResidentMutationResponse(BaseModel):
    id: uuid.UUID
    resident_id: uuid.UUID
    resident_nik: Optional[str] = None
    resident_name: Optional[str] = None
    origin_village: str
    destination_village: str
    new_address: Optional[str] = None
    new_rt: Optional[str] = None
    new_rw: Optional[str] = None
    reason: Optional[str] = None
    skpwni_number: Optional[str] = None
    status: str
    initiated_by_village: str
    origin_approved_by: Optional[uuid.UUID] = None
    origin_approved_at: Optional[datetime] = None
    destination_approved_by: Optional[uuid.UUID] = None
    destination_approved_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    rejected_by: Optional[uuid.UUID] = None
    rejected_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResidentMutationListResponse(BaseModel):
    items: List[ResidentMutationResponse]
    total: int
    page: int
    limit: int


class ResidentResetPinRequest(BaseModel):
    pin: Optional[str] = Field(None, min_length=6, max_length=100, description="PIN baru (min 6 digit angka). Jika dikosongkan, PIN akan dibuat otomatis.")


class ResidentCredentialResponse(BaseModel):
    resident_id: uuid.UUID
    nik: str
    full_name: str
    username: str
    access_pin: str
    message: str


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
