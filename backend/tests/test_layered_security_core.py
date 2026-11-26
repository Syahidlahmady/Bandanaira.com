import time
import pytest
from backend.app.core.account_lockout import (
    check_account_lockout,
    get_current_failures,
    record_login_failure,
    reset_login_failures,
)
from backend.app.core.config import settings
from backend.app.core.security_headers import SecurityHeadersMiddleware


def test_account_lockout_workflow():
    test_user = "test_lockout_user@banda.neira.id"
    reset_login_failures(test_user)

    # 1. Pastikan awal tidak terkunci
    is_locked, rem = check_account_lockout(test_user)
    assert is_locked is False
    assert rem == 0
    assert get_current_failures(test_user) == 0

    # 2. Catat 4 kali kegagalan (belum terkunci, batas = 5)
    for i in range(1, 5):
        attempts, is_now_locked, lockout_secs = record_login_failure(
            test_user, max_attempts=5, lockout_minutes=15
        )
        assert attempts == i
        assert is_now_locked is False
        assert lockout_secs == 0

    assert get_current_failures(test_user) == 4
    is_locked, _ = check_account_lockout(test_user)
    assert is_locked is False

    # 3. Percobaan ke-5 -> Akun harus terkunci otomatis
    attempts, is_now_locked, lockout_secs = record_login_failure(
        test_user, max_attempts=5, lockout_minutes=15
    )
    assert attempts == 5
    assert is_now_locked is True
    assert lockout_secs == 15 * 60

    # 4. Verifikasi status terkunci
    is_locked, rem_secs = check_account_lockout(test_user)
    assert is_locked is True
    assert rem_secs > 0

    # 5. Reset setelah login berhasil -> Harus kembali bersih
    reset_login_failures(test_user)
    is_locked, rem_secs = check_account_lockout(test_user)
    assert is_locked is False
    assert rem_secs == 0
    assert get_current_failures(test_user) == 0


def test_security_headers_middleware_dispatch():
    from starlette.requests import Request
    from starlette.responses import Response
    import asyncio

    middleware = SecurityHeadersMiddleware(app=None)

    async def mock_call_next(request: Request) -> Response:
        return Response("OK", status_code=200)

    # Buat scope request Starlette sederhana
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [],
    }
    request = Request(scope)

    loop = asyncio.new_event_loop()
    try:
        response = loop.run_until_complete(middleware.dispatch(request, mock_call_next))
        assert response.headers["X-Content-Type-Options"] == "nosniff"
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["X-XSS-Protection"] == "1; mode=block"
        assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
        assert "camera=()" in response.headers["Permissions-Policy"]
        assert "geolocation=(self)" in response.headers["Permissions-Policy"]
    finally:
        loop.close()
