import threading
import time
from datetime import datetime, timezone
from typing import Dict, Optional


class TokenBlacklistStore:
    """
    Thread-safe in-memory token blacklist store for JWT revocation upon user logout.
    Evicts expired tokens automatically to prevent unbounded memory growth.
    """

    def __init__(self):
        self._blacklist: Dict[str, float] = {}  # token -> expiration timestamp (seconds)
        self._lock = threading.Lock()

    def add(self, token: str, expires_at: Optional[datetime] = None) -> None:
        """Tambahkan token ke daftar blacklist dengan batas waktu kadaluarsa."""
        now = time.time()
        # Default kadaluarsa 2 jam ke depan jika tidak ditentukan
        exp_timestamp = expires_at.timestamp() if expires_at else now + 7200.0

        with self._lock:
            self._cleanup_expired(now)
            self._blacklist[token.strip()] = exp_timestamp

    def is_blacklisted(self, token: str) -> bool:
        """Cek apakah token ada dalam daftar terblokir (revoked)."""
        if not token:
            return False
        clean_token = token.strip()
        now = time.time()

        with self._lock:
            exp_time = self._blacklist.get(clean_token)
            if exp_time is None:
                return False
            if now > exp_time:
                del self._blacklist[clean_token]
                return False
            return True

    def _cleanup_expired(self, current_time: float) -> None:
        """Bersihkan token yang telah melewati waktu kadaluarsa alami."""
        expired_keys = [t for t, exp in self._blacklist.items() if current_time > exp]
        for t in expired_keys:
            del self._blacklist[t]

    def clear(self) -> None:
        """Reset seluruh daftar blacklist (digunakan pada unit testing)."""
        with self._lock:
            self._blacklist.clear()


# Global Singleton Store
token_blacklist = TokenBlacklistStore()


def blacklist_token(token: str, expires_at: Optional[datetime] = None) -> None:
    token_blacklist.add(token, expires_at)


def is_token_blacklisted(token: str) -> bool:
    return token_blacklist.is_blacklisted(token)
