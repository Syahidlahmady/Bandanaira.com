import pytest
from httpx import AsyncClient
from backend.app.core.crypto_nik import (
    clear_rate_limits_for_testing,
    compute_nik_blind_index,
    decrypt_nik,
    encrypt_nik,
    mask_nik,
)


async def get_token(client: AsyncClient, username: str, password: str) -> str:
    res = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": username, "password": password},
    )
    assert res.status_code == 200, res.text
    return res.json()["access_token"]


def test_crypto_nik_encryption_and_decryption():
    """Uji unit primitif enkripsi simetris AES-256-GCM (Authenticated Encryption)."""
    raw_nik = "8171010101900001"

    # Enkripsi dua kali menghasilkan ciphertext berbeda karena IV/nonce random (Semantic Security)
    cipher_1 = encrypt_nik(raw_nik)
    cipher_2 = encrypt_nik(raw_nik)
    assert cipher_1 != cipher_2

    # Dekripsi berhasil memulihkan NIK asli
    decrypted_1 = decrypt_nik(cipher_1)
    decrypted_2 = decrypt_nik(cipher_2)
    assert decrypted_1 == raw_nik
    assert decrypted_2 == raw_nik

    # Dekripsi data korup / palsu wajib melempar ValueError
    with pytest.raises(ValueError):
        decrypt_nik("payload_palsu_tidak_valid_12345678901234567890")


def test_hmac_sha256_blind_index_deterministic():
    """Uji unit Blind Index deterministik HMAC-SHA256 untuk pencarian O(1)."""
    nik_a = "8171010101900001"
    nik_b = "8171010101900002"

    idx_a1 = compute_nik_blind_index(nik_a)
    idx_a2 = compute_nik_blind_index(nik_a)
    idx_b = compute_nik_blind_index(nik_b)

    # Deterministik
    assert idx_a1 == idx_a2
    assert len(idx_a1) == 64

    # Kolisi bebas untuk NIK berbeda
    assert idx_a1 != idx_b


def test_nik_masking():
    """Uji penyensoran data privat (OWASP Privacy by Design)."""
    raw_nik = "8171010101900001"
    masked = mask_nik(raw_nik)
    assert masked == "817101******0001"
    assert "010190" not in masked


@pytest.mark.asyncio
async def test_search_nik_via_blind_index_happy_path(client: AsyncClient):
    """Uji endpoint pencarian profil warga via NIK dengan HMAC Blind Index (SRS 11)."""
    clear_rate_limits_for_testing()
    admin_token = await get_token(client, "admin", "Admin123!")

    # 1. Daftarkan 1 warga baru
    test_nik = "8171020202950001"
    res_create = await client.post(
        "/api/v1/population/residents",
        json={
            "nik": test_nik,
            "full_name": "Siti Nurhaliza Basudara",
            "gender": "P",
            "birth_place": "Lonthoir",
            "address": "RT 02 Lonthoir, Banda Besar",
            "village": "Banda Neira",
            "occupation": "Petani Fuli Pala",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_create.status_code == 201

    # 2. Cari via endpoint /api/v1/warga/cari-nik (SRS 11 Parity)
    res_search = await client.post(
        "/api/v1/warga/cari-nik",
        json={"nik": test_nik},
        headers={"X-Forwarded-For": "192.168.10.55"},
    )
    assert res_search.status_code == 200
    data = res_search.json()

    assert data["nik_masked"] == "817102******0001"
    assert data["full_name"] == "Siti Nurhaliza Basudara"
    assert "nik_blind_index" in data
    assert len(data["nik_blind_index"]) == 64
    assert data["encryption_algorithm"].startswith("AES-256-GCM")


@pytest.mark.asyncio
async def test_search_nik_not_found(client: AsyncClient):
    """Pencarian NIK yang tidak ada wajib merespons 404 dengan NIK tersensor."""
    clear_rate_limits_for_testing()
    unknown_nik = "9999888877776666"

    res = await client.post(
        "/api/v1/warga/cari-nik",
        json={"nik": unknown_nik},
        headers={"X-Forwarded-For": "192.168.10.60"},
    )
    assert res.status_code == 404
    detail = res.json()["detail"]
    assert "999988******6666" in detail


@pytest.mark.asyncio
async def test_anti_enumeration_rate_limiting(client: AsyncClient):
    """Uji proteksi Anti-Enumeration Brute-Force NFR-02 (OWASP Top 10 A07)."""
    clear_rate_limits_for_testing()
    test_ip = "192.168.99.100"

    # Kirim 20 request (batas default per menit)
    for i in range(20):
        dummy_nik = f"817100000000{i:04d}"
        res = await client.post(
            "/api/v1/warga/cari-nik",
            json={"nik": dummy_nik},
            headers={"X-Forwarded-For": test_ip},
        )
        assert res.status_code in [200, 404]

    # Request ke-21 dari IP yang sama wajib ditolak dengan HTTP 429 Too Many Requests
    blocked_res = await client.post(
        "/api/v1/warga/cari-nik",
        json={"nik": "8171000000009999"},
        headers={"X-Forwarded-For": test_ip},
    )
    assert blocked_res.status_code == 429
    assert "Batas laju permintaan terlampaui" in blocked_res.json()["detail"]

    # IP yang berbeda tetap boleh mengakses
    other_res = await client.post(
        "/api/v1/warga/cari-nik",
        json={"nik": "8171000000009999"},
        headers={"X-Forwarded-For": "10.0.0.1"},
    )
    assert other_res.status_code in [200, 404]


@pytest.mark.asyncio
async def test_audit_keamanan_report_endpoint(client: AsyncClient):
    """Uji endpoint audit keamanan OWASP Top 10 (/api/v1/audit-keamanan SRS 11)."""
    res = await client.get("/api/v1/audit-keamanan")
    assert res.status_code == 200
    report = res.json()

    assert report["system_status"] == "SECURE_HARDENED"
    assert report["owasp_compliance_score"] >= 90.0
    assert report["aes_encryption"]["cipher"] == "AES-256-GCM"
    assert report["aes_encryption"]["key_length_bits"] == 256
    assert report["hmac_blind_index"]["algorithm"] == "HMAC-SHA256"
    assert report["blockchain_zero_pii"]["status"] == "COMPLIANT"


@pytest.mark.asyncio
async def test_crypto_roundtrip_endpoint(client: AsyncClient):
    """Uji endpoint verifikasi langsung putaran kriptografi AES-256 & HMAC."""
    sample_nik = "8171012345678901"
    res = await client.post(
        "/api/v1/security/test-crypto-roundtrip",
        json={"nik": sample_nik},
    )
    assert res.status_code == 200
    data = res.json()

    assert data["plain_nik"] == sample_nik
    assert data["masked_nik"] == "817101******8901"
    assert data["decrypted_matches_original"] is True
    assert data["latency_ms"] < 100.0  # Sangat cepat di bawah 100 milidetik
    assert len(data["blind_index"]) == 64
