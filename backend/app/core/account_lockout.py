import threading
import time
from typing import Dict, List, Optional, Tuple
from backend.app.core.config import settings

_lock = threading.Lock()
# Menyimpan riwayat timestamp percobaan gagal: {identifier: [timestamp1, timestamp2, ...]}
_failed_attempts: Dict[str, List[float]] = {}
# Menyimpan batas waktu penguncian akun: {identifier: timestamp_unlock}
_lockouts: Dict[str, float] = {}


def _cleanup_old_records(now: float, window_seconds: float) -> None:
    """Membersihkan riwayat percobaan gagal lama untuk mencegah kebocoran memori."""
    expired_users = []
    for user, timestamps in _failed_attempts.items():
        # Pertahankan hanya timestamp dalam jendela waktu penguncian
        valid = [t for t in timestamps if now - t < window_seconds]
        if valid:
            _failed_attempts[user] = valid
        else:
            expired_users.append(user)

    for user in expired_users:
        if user not in _lockouts:
            _failed_attempts.pop(user, None)

    # Bersihkan akun yang waktu pengunciannya telah usai
    expired_lockouts = [u for u, until in _lockouts.items() if now >= until]
    for u in expired_lockouts:
        _lockouts.pop(u, None)
        _failed_attempts.pop(u, None)


def check_account_lockout(identifier: str) -> Tuple[bool, int]:
    """
    Memeriksa apakah akun sedang dalam status terkunci.
    Mengembalikan (is_locked, sisa_detik_terkunci).
    """
    norm_id = identifier.strip().lower()
    now = time.time()
    lockout_duration = settings.LOCKOUT_DURATION_MINUTES * 60

    with _lock:
        _cleanup_old_records(now, lockout_duration)

        if norm_id in _lockouts:
            unlock_time = _lockouts[norm_id]
            if now < unlock_time:
                remaining_seconds = int(unlock_time - now)
                return True, max(1, remaining_seconds)
            else:
                # Waktu penguncian telah lewat, buka kunci akun
                _lockouts.pop(norm_id, None)
                _failed_attempts.pop(norm_id, None)

    return False, 0


def record_login_failure(
    identifier: str,
    max_attempts: Optional[int] = None,
    lockout_minutes: Optional[int] = None,
) -> Tuple[int, bool, int]:
    """
    Mencatat kegagalan percobaan login untuk username/email tertentu.
    Jika mencapai ambang batas (default 5 kali), akun dikunci selama 15 menit.
    Mengembalikan: (jumlah_kegagalan, apakah_baru_saja_terkunci, sisa_detik).
    """
    norm_id = identifier.strip().lower()
    now = time.time()
    max_att = max_attempts or settings.MAX_LOGIN_ATTEMPTS
    lock_min = lockout_minutes or settings.LOCKOUT_DURATION_MINUTES
    lockout_duration = lock_min * 60

    with _lock:
        _cleanup_old_records(now, lockout_duration)

        if norm_id not in _failed_attempts:
            _failed_attempts[norm_id] = []

        _failed_attempts[norm_id].append(now)
        current_attempts = len(_failed_attempts[norm_id])

        if current_attempts >= max_att:
            unlock_time = now + lockout_duration
            _lockouts[norm_id] = unlock_time
            return current_attempts, True, int(lockout_duration)

        return current_attempts, False, 0


def reset_login_failures(identifier: str) -> None:
    """Mereset riwayat kegagalan dan membuka kunci setelah login berhasil."""
    norm_id = identifier.strip().lower()
    with _lock:
        _failed_attempts.pop(norm_id, None)
        _lockouts.pop(norm_id, None)


def get_current_failures(identifier: str) -> int:
    """Mendapatkan jumlah kegagalan login saat ini."""
    norm_id = identifier.strip().lower()
    with _lock:
        return len(_failed_attempts.get(norm_id, []))
