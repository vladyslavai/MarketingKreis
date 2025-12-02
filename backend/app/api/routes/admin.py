from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db_session, require_role
from app.models.user import User, UserRole


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/health")
def admin_health(_: User = Depends(require_role(UserRole.admin))) -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/stats")
def admin_stats(
    db: Session = Depends(get_db_session),
    _: User = Depends(require_role(UserRole.admin)),
) -> Dict[str, Any]:
    """Return basic platform metrics for the Admin Dashboard."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    verified_users = db.query(func.count(User.id)).filter(User.is_verified.is_(True)).scalar() or 0
    unverified_users = total_users - verified_users

    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    new_last_7d = (
        db.query(func.count(User.id))
        .filter(User.created_at >= seven_days_ago)
        .scalar()
        or 0
    )

    role_rows: List[tuple] = (
        db.query(User.role, func.count(User.id))
        .group_by(User.role)
        .all()
    )
    roles_breakdown = {str(role.value if hasattr(role, "value") else role): count for role, count in role_rows}

    latest_users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .limit(10)
        .all()
    )
    latest = [
        {
            "id": u.id,
            "email": u.email,
            "role": (u.role.value if hasattr(u.role, "value") else str(u.role)),
            "isVerified": bool(u.is_verified),
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        }
        for u in latest_users
    ]

    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "unverified": unverified_users,
            "newLast7d": new_last_7d,
            "roles": roles_breakdown,
            "latest": latest,
        }
    }


