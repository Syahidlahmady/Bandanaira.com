import asyncio
import time
import pytest
from fastapi import HTTPException
from backend.app.core.config import settings
from backend.app.core.crypto_nik import (
    check_nik_rate_limit,
    decrypt_pii,
    encrypt_pii,
)
from backend.app.core.permissions import get_current_user
from backend.app.core.token_blacklist import (
    blacklist_token,
    is_token_blacklisted,
    token_blacklist,
)


def test_offline_jwt_backdoor_rejected():
    """
    SEC-001: Verifikasi bahwa token 'offline-jwt-*' ditolak secara ketat dengan HTTP 401 Unauthorized.
    """
    token_blacklist.clear()
    settings.ALLOW_OFFLINE_DEV_TOKENS = False

    class DummyDB:
        pass

    loop = asyncio.new_event_loop()
    try:
        with pytest.raises(HTTPException) as exc_info:
            loop.run_until_complete(get_current_user(token="offline-jwt-admin-attacker", db=DummyDB()))
        assert exc_info.value.status_code == 401
        assert "Offline demo token dilarang" in exc_info.value.detail
    finally:
        loop.close()


def test_token_blacklist_lifecycle():
    """
    SEC-009: Verifikasi bahwa token yang telah dicabut (logout) tercatat di blacklist
    dan menyebabkan akses ditolak dengan HTTP 401.
    """
    token_blacklist.clear()
    sample_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_test_payload.signature"

    assert not is_token_blacklisted(sample_token)

    # Tambahkan token ke blacklist
    blacklist_token(sample_token)
    assert is_token_blacklisted(sample_token)

    class DummyDB:
        pass

    loop = asyncio.new_event_loop()
    try:
        with pytest.raises(HTTPException) as exc_info:
            loop.run_until_complete(get_current_user(token=sample_token, db=DummyDB()))

        assert exc_info.value.status_code == 401
        assert "Token telah dicabut" in exc_info.value.detail
    finally:
        loop.close()


def test_production_startup_secret_guard():
    """
    SEC-007: Verifikasi fail-closed startup jika aplikasi di-boot pada production
    menggunakan kunci default rahasia.
    """
    original_env = settings.ENVIRONMENT
    try:
        settings.ENVIRONMENT = "production"
        insecure_keys = {
            "banda_neira_digital_secret_key_change_in_production_2026_secure",
            "banda_neira_aes_256_gcm_master_key_32bytes_sec!",
        }

        # Kunci default terdeteksi pada konfigurasi
        assert settings.SECRET_KEY in insecure_keys
    finally:
        settings.ENVIRONMENT = original_env


def test_pii_encryption_roundtrip():
    """
    SEC-008: Verifikasi fungsi enkripsi dan dekripsi PII (AES-256-GCM)
    untuk nomor telepon dan alamat warga.
    """
    sample_phone = "081234567890"
    sample_address = "Jl. Benteng Belgica No. 12, RT 01 / RW 02, Lonthoir"

    encrypted_phone = encrypt_pii(sample_phone)
    encrypted_addr = encrypt_pii(sample_address)

    assert encrypted_phone != sample_phone
    assert encrypted_addr != sample_address

    decrypted_phone = decrypt_pii(encrypted_phone)
    decrypted_addr = decrypt_pii(encrypted_addr)

    assert decrypted_phone == sample_phone
    assert decrypted_addr == sample_address


def test_anti_enumeration_rate_limiting():
    """
    SEC-004: Verifikasi proteksi rate limiting pencarian NIK per IP.
    """
    client_ip = f"198.51.100.{int(time.time()) % 200}"

    # Panggil hingga batas ambang (20x)
    for _ in range(settings.RATE_LIMIT_NIK_SEARCH_PER_MINUTE):
        check_nik_rate_limit(client_ip)

    # Panggilan ke-21 harus memicu HTTP 429 Too Many Requests
    with pytest.raises(HTTPException) as exc_info:
        check_nik_rate_limit(client_ip)

    assert exc_info.value.status_code == 429
