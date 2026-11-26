from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from backend.app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware pengamanan HTTP berbasis rekomendasi OWASP Top 10.
    Menyisipkan header keamanan standar pada seluruh respons backend:
    - X-Content-Type-Options: nosniff (Cegah eksploitasi MIME-type sniffing)
    - X-Frame-Options: DENY (Cegah serangan Clickjacking)
    - X-XSS-Protection: 1; mode=block (Filter XSS untuk browser warisan)
    - Referrer-Policy: strict-origin-when-cross-origin (Cegah kebocoran URL path sensitif)
    - Permissions-Policy: Membatasi akses sensor/hardware perangkat yang tidak diperlukan
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        if settings.SECURITY_HEADERS_ENABLED:
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["Permissions-Policy"] = (
                "camera=(), microphone=(), geolocation=(self), payment=()"
            )

        return response
