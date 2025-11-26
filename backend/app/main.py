from fastapi import FastAPI
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.routes import activities as activities_routes
from app.api.routes import assistant as assistant_routes
from app.api.routes import auth as auth_routes
from app.api.routes import budget as budget_routes
from app.api.routes import calendar as calendar_routes
from app.api.routes import performance as performance_routes
from app.api.routes import uploads as uploads_routes
from app.api.routes import export as export_routes
from app.api.routes import crm as crm_routes
from app.api.routes import health as health_routes
from app.api.routes import imports as imports_routes
from app.api.routes import jobs as jobs_routes
from app.db.base import Base
from app.db.session import engine
from app.core.security import CSRFMiddleware
import os


def create_app() -> FastAPI:
    app = FastAPI(title="MarketingKreis API")
    settings = get_settings()

    # Trusted hosts (prod hardening)
    if settings.environment == "production":
        default_hosts = ["marketingkreis.ch", "app.marketingkreis.ch", ".marketingkreis.ch", "localhost", "127.0.0.1"]
        extra_hosts = [h.strip() for h in os.getenv("ALLOWED_HOSTS", ".onrender.com,.vercel.app").split(",") if h.strip()]
        allowed_hosts = list(dict.fromkeys(default_hosts + extra_hosts))
        # If wildcard present, skip TrustedHostMiddleware to avoid 400s from internal health checks
        if "*" not in allowed_hosts:
            app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

    # CORS
    origins = [o.strip() for o in settings.backend_cors_origins.split(',') if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # CSRF middleware (prod-only)
    if settings.environment == "production":
        app.add_middleware(CSRFMiddleware, allowed_origins=origins)

    # Routers
    app.include_router(health_routes.router)
    app.include_router(auth_routes.router)
    app.include_router(activities_routes.router)
    app.include_router(calendar_routes.router)
    app.include_router(performance_routes.router)
    app.include_router(budget_routes.router)
    app.include_router(uploads_routes.router)
    app.include_router(export_routes.router)
    app.include_router(imports_routes.router)
    app.include_router(jobs_routes.router)
    app.include_router(crm_routes.router)
    app.include_router(assistant_routes.router)
    
    # Auto-create tables if not present
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create tables: {e}")

    return app


app = create_app()

