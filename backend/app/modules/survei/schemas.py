import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class ProblemDomainEnum(str, Enum):
    AIR_DAN_SAMPAH = "AIR_DAN_SAMPAH"
    ENERGI = "ENERGI"
    EKONOMI = "EKONOMI"
    WISATA = "WISATA"
    BUDAYA = "BUDAYA"


class UrgencyLevelEnum(str, Enum):
    RENDAH = "RENDAH"
    SEDANG = "SEDANG"
    TINGGI = "TINGGI"
    KRITIS = "KRITIS"


class SurveyCreate(BaseModel):
    collector_name: str = Field(..., min_length=2, max_length=120, description="Nama surveyor / periset lapangan")
    problem_domain: ProblemDomainEnum = Field(..., description="Domain masalah sesuai SRS 6.1 & 9.1")
    island_name: str = Field(..., min_length=2, max_length=50, description="Nama pulau di Kepulauan Banda")
    village_name: Optional[str] = Field(None, max_length=100, description="Nama desa / negeri administratif")
    rt_rw: Optional[str] = Field(None, max_length=30, description="RT/RW atau dusun")
    latitude: float = Field(..., description="Garis lintang WGS 84 (sekitar -4.52)")
    longitude: float = Field(..., description="Garis bujur WGS 84 (sekitar 129.90)")
    title: str = Field(..., min_length=3, max_length=200, description="Judul temuan / masalah lapangan")
    urgency_level: UrgencyLevelEnum = Field(default=UrgencyLevelEnum.SEDANG)
    flexible_attributes: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Atribut dinamis fleksibel (NoSQL / MongoDB style) tanpa batasan kolom kaku"
    )
    photo_evidence_url: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (-5.5 <= v <= -3.5):
            raise ValueError(f"Latitude {v} di luar batas wilayah geografis Maluku / Banda Neira (-5.5 s/d -3.5)")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (128.5 <= v <= 131.5):
            raise ValueError(f"Longitude {v} di luar batas wilayah geografis Maluku / Banda Neira (128.5 s/d 131.5)")
        return v


class SurveyResponse(BaseModel):
    id: uuid.UUID
    survey_code: str
    collector_name: str
    problem_domain: str
    island_name: str
    village_name: Optional[str] = None
    rt_rw: Optional[str] = None
    latitude: float
    longitude: float
    gps_point: Dict[str, float]
    title: str
    urgency_level: str
    flexible_attributes: Dict[str, Any] = Field(default_factory=dict)
    photo_evidence_url: Optional[str] = None
    notes: Optional[str] = None
    etl_status: str
    migrated_feature_id: Optional[uuid.UUID] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ETLRunRequest(BaseModel):
    problem_domain: Optional[str] = Field(None, description="Filter domain survei tertentu (opsional)")
    survey_ids: Optional[List[uuid.UUID]] = Field(None, description="Daftar ID survei spesifik untuk dimigrasi (opsional)")
    target_layer_type: Optional[str] = Field(None, description="Override target layer 7-layer PostGIS (opsional)")
    auto_promote_spatial: bool = Field(default=True, description="Otomatis promosikan ke tabel spatial_features")


class ETLMigratedFeatureItem(BaseModel):
    survey_id: uuid.UUID
    survey_code: str
    spatial_feature_id: uuid.UUID
    name: str
    layer_type: str
    island_name: str
    coordinates: List[float]


class ETLRunResult(BaseModel):
    success: bool
    message: str
    total_scanned: int
    migrated_count: int
    skipped_count: int
    migrated_items: List[ETLMigratedFeatureItem]
    errors: List[str] = Field(default_factory=list)


class SurveyStatsResponse(BaseModel):
    total_surveys: int
    pending_etl: int
    migrated_to_postgres: int
    by_domain: Dict[str, int]
    by_urgency: Dict[str, int]
    by_island: Dict[str, int]
