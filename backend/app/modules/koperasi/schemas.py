from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class CommodityDepositInput(BaseModel):
    nik: str = Field(..., min_length=16, max_length=16, description="16 digit NIK warga penyetor")
    commodity_type: str = Field(..., description="Jenis komoditas, misal: pala_super, fuli_merah, ikan_cakalang")
    weight_kg: float = Field(..., gt=0, description="Berat timbangan (kg)")
    destination: str = Field(
        default="BALANCE",
        description="Pilihan alokasi hasil: 'BALANCE' (Saldo Tabungan Rp) atau 'WATER_QUOTA' (Kuota Air RO)",
    )
    notes: Optional[str] = Field(default=None, description="Catatan operasional timbangan")

    @field_validator("nik")
    @classmethod
    def validate_nik(cls, v: str):
        if not v.isdigit() or len(v) != 16:
            raise ValueError("NIK harus berupa 16 digit angka.")
        return v


class WasteDepositInput(BaseModel):
    nik: str = Field(..., min_length=16, max_length=16, description="16 digit NIK warga penyetor")
    waste_type: str = Field(..., description="botol_plastik_pet, jeriken_galon_hdpe, kardus_kertas")
    weight_kg: float = Field(..., gt=0, description="Berat sampah plastik terpilah (kg)")
    destination: str = Field(
        default="WATER_QUOTA",
        description="'WATER_QUOTA' (Kuota Air Minum Bersih) atau 'BALANCE' (Saldo Rp)",
    )
    notes: Optional[str] = Field(default=None, description="Catatan kebersihan plastik")

    @field_validator("nik")
    @classmethod
    def validate_nik(cls, v: str):
        if not v.isdigit() or len(v) != 16:
            raise ValueError("NIK harus berupa 16 digit angka.")
        return v


class WaterRedemptionInput(BaseModel):
    nik: str = Field(..., min_length=16, max_length=16, description="16 digit NIK warga")
    liters_requested: float = Field(..., gt=0, le=100.0, description="Volume air yang ditebus (Liter)")
    station_code: Optional[str] = Field(
        default="RO-STATION-LONTHOIR-01", description="Kode stasiun dispenser air RO desa"
    )

    @field_validator("nik")
    @classmethod
    def validate_nik(cls, v: str):
        if not v.isdigit() or len(v) != 16:
            raise ValueError("NIK harus berupa 16 digit angka.")
        return v


class WaterRedemptionResponse(BaseModel):
    transaction_code: str
    liters_dispensed: float
    remaining_quota_ltr: float
    valve_status: str = "OPEN"
    dispense_duration_sec: int
    station_code: str
    receipt_hash: str
    message: str


class CoopTransactionItem(BaseModel):
    id: str
    transaction_code: str
    transaction_type: str
    item_name: str
    weight_or_volume: float
    unit_price_rp: float
    monetary_value_rp: float
    water_quota_impact_ltr: float
    destination: str
    receipt_hash: str
    station_code: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime


class CitizenCoopProfileResponse(BaseModel):
    nik: str
    full_name: str
    village: str
    occupation: Optional[str] = None
    coop_balance_rp: float
    plastic_points: int
    clean_water_quota_ltr: float
    total_commodities_kg: float
    total_plastic_recycled_kg: float
    recent_transactions: List[CoopTransactionItem] = []


class CoopEcosystemRecap(BaseModel):
    total_active_accounts: int
    total_coop_balance_rp: float
    total_clean_water_quota_ltr: float
    total_commodities_recap_kg: float
    total_plastic_recycled_kg: float
    total_transactions_count: int
