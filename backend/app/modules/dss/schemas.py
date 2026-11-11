from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, field_validator


class CriterionType(str, Enum):
    BENEFIT = "BENEFIT"
    COST = "COST"


class DSSMode(str, Enum):
    TOURISM = "TOURISM"  # Mode 1: Rekomendasi Wisata & Penginapan
    INFRA_CRISIS = "INFRA_CRISIS"  # Mode 2: Prioritas Intervensi Air & Energi


class SAWCriterion(BaseModel):
    code: str = Field(..., description="Kode kriteria unik, misal: c1_harga")
    name: str = Field(..., description="Nama deskriptif kriteria")
    criterion_type: CriterionType = Field(..., description="BENEFIT atau COST")
    weight: float = Field(..., gt=0, description="Bobot kepentingan kriteria (misal: 0.25)")


class SAWAlternativeInput(BaseModel):
    id: str = Field(..., description="ID unik alternatif")
    name: str = Field(..., description="Nama alternatif (nama vila/destinasi/RT desa)")
    values: Dict[str, float] = Field(
        ...,
        description="Nilai kuantitatif per kriteria, misal: {'c1_harga': 350000, 'c2_jarak': 1.2}",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Metadata tambahan (foto, deskripsi, tautan pemesanan, kontak WA)",
    )


class SAWCalculationRequest(BaseModel):
    criteria: List[SAWCriterion] = Field(..., min_length=2, description="Daftar kriteria evaluasi")
    alternatives: List[SAWAlternativeInput] = Field(..., min_length=2, description="Daftar alternatif yang dirangking")

    @field_validator("criteria")
    @classmethod
    def validate_unique_criteria(cls, v: List[SAWCriterion]):
        codes = [c.code for c in v]
        if len(codes) != len(set(codes)):
            raise ValueError("Kode kriteria harus unik.")
        return v


class SAWAlternativeResult(BaseModel):
    rank: int = Field(..., description="Peringkat hasil rekomendasi (1 = paling optimal)")
    id: str
    name: str
    preference_score: float = Field(..., description="Nilai preferensi akhir Vi (0.0 - 1.0)")
    normalized_values: Dict[str, float] = Field(..., description="Nilai ternormalisasi rij per kriteria")
    raw_values: Dict[str, float] = Field(..., description="Nilai mentah xij per kriteria")
    metadata: Optional[Dict[str, Any]] = None


class SAWCalculationResponse(BaseModel):
    mode: Optional[str] = "CUSTOM"
    total_alternatives: int
    normalized_weights: Dict[str, float]
    results: List[SAWAlternativeResult]
    top_recommendation: Optional[SAWAlternativeResult] = None


class TourismPreferences(BaseModel):
    weight_harga: float = Field(default=0.25, ge=0.05, le=1.0, description="Bobot harga (Cost)")
    weight_jarak: float = Field(default=0.20, ge=0.05, le=1.0, description="Bobot jarak ke dermaga (Cost)")
    weight_fasilitas: float = Field(default=0.30, ge=0.05, le=1.0, description="Bobot fasilitas air RO & listrik surya (Benefit)")
    weight_daya_tarik: float = Field(default=0.25, ge=0.05, le=1.0, description="Bobot keindahan alam & sejarah (Benefit)")
    max_budget_rp: Optional[float] = Field(default=None, description="Filter batas anggaran maksimal")
    island_filter: Optional[str] = Field(default=None, description="Filter pulau (Pulau Neira, Banda Besar, dll.)")


class CrisisPriorityWeights(BaseModel):
    weight_tds: float = Field(default=0.35, ge=0.05, le=1.0, description="Bobot kadar TDS sumur payau (Urgency)")
    weight_populasi: float = Field(default=0.25, ge=0.05, le=1.0, description="Bobot jumlah warga terdampak (Benefit)")
    weight_jarak_air: float = Field(default=0.20, ge=0.05, le=1.0, description="Bobot jarak ke air tawar terdekat (Benefit)")
    weight_padam_listrik: float = Field(default=0.20, ge=0.05, le=1.0, description="Bobot durasi pemadaman listrik diesel (Benefit)")
