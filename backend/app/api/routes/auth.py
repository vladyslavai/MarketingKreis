from fastapi import APIRouter, Depends, HTTPException, Response, Request
import json
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db_session
from app.core.config import get_settings
from datetime import timedelta
from jose import jwt

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


def create_jwt(subject: str, secret: str, algorithm: str, minutes: int) -> str:
    payload = {"sub": subject}
    try:
        from datetime import datetime, timezone
        payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    except Exception:
        pass
    return jwt.encode(payload, secret, algorithm=algorithm)


@router.post("/login")
async def login(request: Request, response: Response, db: Session = Depends(get_db_session)):
    settings = get_settings()

    # Robust body parsing: accept JSON body regardless of client behavior
    # Accept JSON or form bodies and be lenient with clients
    email = ""
    password = ""
    ctype = (request.headers.get("content-type") or "").lower()
    raw_bytes = await request.body()
    raw_text = raw_bytes.decode("utf-8", errors="ignore").strip() if raw_bytes else ""

    # 1) JSON
    if not email and raw_text:
        if "application/json" in ctype or raw_text.startswith("{"):
            try:
                payload = json.loads(raw_text)
                if isinstance(payload, dict):
                    email = str(payload.get("email") or "").strip()
                    password = str(payload.get("password") or "").strip()
            except Exception:
                pass

    # 2) URL-encoded
    if (not email or not password) and raw_text:
        try:
            from urllib.parse import parse_qs
            parsed = {k: v[0] for k, v in parse_qs(raw_text).items() if v}
            if not email:
                email = str(parsed.get("email") or "").strip()
            if not password:
                password = str(parsed.get("password") or "").strip()
        except Exception:
            pass

    # 3) Query params fallback
    if not email:
        email = str(request.query_params.get("email") or "").strip()
    if not password:
        password = str(request.query_params.get("password") or "").strip()

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    access_token = create_jwt(
        subject=email,
        secret=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        minutes=settings.access_token_expire_minutes,
    )
    refresh_token = create_jwt(
        subject=email,
        secret=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        minutes=settings.refresh_token_expire_minutes,
    )

    cookie_domain = settings.cookie_domain
    cookie_secure = settings.cookie_secure
    cookie_samesite = settings.cookie_samesite

    response.set_cookie(
        key=settings.cookie_access_name,
        value=access_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        path="/",
        domain=cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
    )
    response.set_cookie(
        key=settings.cookie_refresh_name,
        value=refresh_token,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        path="/",
        domain=cookie_domain,
        max_age=settings.refresh_token_expire_minutes * 60,
    )

    # Redirect hint for frontend
    response.headers["X-Redirect-To"] = "/dashboard"
    return {"message": "ok"}



