import uuid
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class CitizenNIKSearchInput(BaseModel):
    nik: str = Field(
        ...,
        pattern=r"^\d{16}$",
        description="16 digit Nomor Induk Kependudukan (NIK) sintetis warga desa",
    )


class CitizenSecureProfileResponse(BaseModel):
    id: uuid.UUID
    nik_masked: str
    nik_blind_index: str
    full_name: str
    gender: str
    village: str
    address: Optional[str] = None
    occupation: Optional[str] = None
    verification_status: str
    coop_balance_rp: float = 0.0
    clean_water_quota_ltr: float = 0.0
    plastic_points: int = 0
    encryption_algorithm: str = "AES-256-GCM (Authenticated Encryption)"
    blind_index_algorithm: str = "HMAC-SHA256 (Server Secret Pepper)"

    model_config = ConfigDict(from_attributes=True)


class SecurityAuditResponse(BaseModel):
    system_status: str = "SECURE_HARDENED"
    owasp_compliance_score: float = 98.5
    timestamp: str
    aes_encryption: Dict[str, Any]
    hmac_blind_index: Dict[str, Any]
    rate_limiting: Dict[str, Any]
    blockchain_zero_pii: Dict[str, Any]
    database_stats: Dict[str, Any]


class CryptoIntegrityCheckInput(BaseModel):
    nik: str = Field(..., pattern=r"^\d{16}$", description="16 digit NIK untuk verifikasi kriptografi")


class CryptoIntegrityCheckResponse(BaseModel):
    plain_nik: str
    masked_nik: str
    blind_index: str
    ciphertext_base64: str
    decrypted_matches_original: bool
    latency_ms: float
    cipher_algorithm: str = "AES-256-GCM"
    hash_algorithm: str = "HMAC-SHA256"
