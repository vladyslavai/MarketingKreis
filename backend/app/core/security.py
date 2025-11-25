from typing import Iterable
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.core.config import get_settings


class CSRFMiddleware(BaseHTTPMiddleware):
    """Very lightweight CSRF check for state-changing requests in production.

    - Allows only requests with Origin/Referer matching allowed CORS origins
    - Skips GET/HEAD/OPTIONS
    """

    def __init__(self, app, allowed_origins: Iterable[str]):
        super().__init__(app)
        self.allowed = set(allowed_origins)

    async def dispatch(self, request: Request, call_next):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return await call_next(request)

        origin = request.headers.get("origin") or ""
        referer = request.headers.get("referer") or ""

        if origin and not any(origin.startswith(a) for a in self.allowed):
            return Response("Forbidden (CSRF origin)", status_code=403)
        if referer and not any(referer.startswith(a) for a in self.allowed):
            return Response("Forbidden (CSRF referer)", status_code=403)

        return await call_next(request)



