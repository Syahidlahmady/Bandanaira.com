import base64
import hashlib
import hmac
import os
import time
from typing import Dict, List, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from fastapi import HTTPException, status
from backend.app.core.config import settings


def get_aes_key() -> bytes:
    """Menghasilkan kunci simetris 256-bit (32 byte) untuk AES-256-GCM."""
    raw_key = settings.AES_SECRET_KEY.encode("utf-8")
    return hashlib.sha256(raw_key).digest()


def encrypt_nik(raw_nik: str) -> str:
    """
    Enkripsi simetris data sensitif NIK menggunakan AES-256-GCM (Authenticated Encryption).
    Menggunakan random initialization vector (IV / nonce 12 byte) untuk setiap operasi enkripsi.
    Output: Base64 string dari (nonce + ciphertext + auth_tag).
    """
    if not raw_nik:
        return ""
    key = get_aes_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, raw_nik.strip().encode("utf-8"), None)
    return base64.b64encode(nonce + ciphertext).decode("utf-8")


def decrypt_nik(encrypted_b64: str) -> str:
    """
    Mendekripsi data NIK terenkripsi AES-256-GCM.
    Memvalidasi otentisitas tag dan memulihkan string asli 16-digit NIK.
    """
    if not encrypted_b64:
        return ""
    try:
        raw_data = base64.b64decode(encrypted_b64.encode("utf-8"))
        if len(raw_data) < 28:  # 12 byte nonce + minimal 16 byte tag
            raise ValueError("Panjang payload terenkripsi tidak mencukupi.")
        nonce = raw_data[:12]
        ciphertext = raw_data[12:]
        key = get_aes_key()
        aesgcm = AESGCM(key)
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted_bytes.decode("utf-8")
    except Exception as e:
        raise ValueError(f"Gagal mendekripsi NIK (kunci salah atau data korup): {e}")


def compute_nik_blind_index(raw_nik: str) -> str:
    """
    Menghitung Blind Index deterministik menggunakan HMAC-SHA256 dengan secret server pepper.
    Memungkinkan pencarian O(1) exact-match di basis data tanpa perlu mendekripsi seluruh baris.
    Mencegah penyerang menebak NIK asli jika database bocor tanpa secret pepper server.
    Output: 64-karakter string heksadesimal.
    """
    if not raw_nik:
        return ""
    clean_nik = raw_nik.strip()
    pepper = settings.HMAC_BLIND_INDEX_PEPPER.encode("utf-8")
    return hmac.new(pepper, clean_nik.encode("utf-8"), hashlib.sha256).hexdigest()


def mask_nik(raw_nik: str) -> str:
    """
    Sensor data NIK untuk tampilan publik & audit (OWASP Privacy By Design).
    Contoh: '8171010101900001' -> '817101******0001'.
    """
    if not raw_nik or len(raw_nik) < 10:
        return "****************"
    clean = raw_nik.strip()
    return f"{clean[:6]}******{clean[-4:]}"


# ==============================================================================
# Rate Limiting In-Memory (Anti-Enumeration Brute-Force Protection NFR-02)
# ==============================================================================
_SEARCH_REQUEST_LOGS: Dict[str, List[float]] = {}


def check_nik_rate_limit(client_identifier: str) -> None:
    """
    Membatasi frekuensi pencarian NIK per IP / identifier klien.
    Mencegah serangan brute-force enumeration 16-digit NIK warga (OWASP Top 10 A07 / NFR-02).
    """
    now = time.time()
    window_seconds = 60.0
    max_requests = settings.RATE_LIMIT_NIK_SEARCH_PER_MINUTE

    # Bersihkan timestamp yang sudah kadaluarsa (> 60 detik)
    timestamps = _SEARCH_REQUEST_LOGS.get(client_identifier, [])
    valid_timestamps = [t for t in timestamps if now - t < window_seconds]

    if len(valid_timestamps) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Batas laju permintaan terlampaui (Anti-Brute Force NIK OWASP). "
                f"Maksimal {max_requests} pencarian NIK per menit. Silakan tunggu 60 detik."
            ),
        )

    valid_timestamps.append(now)
    _SEARCH_REQUEST_LOGS[client_identifier] = valid_timestamps


def clear_rate_limits_for_testing() -> None:
    """Helper untuk mereset log rate limit saat pengujian unit test."""
    _SEARCH_REQUEST_LOGS.clear()
