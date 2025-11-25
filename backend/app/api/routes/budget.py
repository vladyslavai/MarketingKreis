from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db.session import get_db_session
from app.models.budget import BudgetTarget, KpiTarget


router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/targets/{period}")
def get_targets(period: str, db: Session = Depends(get_db_session)) -> Dict[str, Any]:
    try:
        bt = db.query(BudgetTarget).filter(BudgetTarget.period == period).all()
        kt = db.query(KpiTarget).filter(KpiTarget.period == period).all()
        return {
            "budgetTargets": [
                {"id": b.id, "period": b.period, "category": b.category, "amount": float(b.amount_chf)} for b in bt
            ],
            "kpiTargets": [
                {"id": k.id, "period": k.period, "metric": k.metric, "target": float(k.target_value), "unit": k.unit} for k in kt
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/targets/{period}")
def upsert_targets(period: str, payload: Dict[str, Any], db: Session = Depends(get_db_session)) -> Dict[str, Any]:
    try:
        # Upsert budget targets
        for bt in payload.get("budgetTargets", []):
            category = str(bt.get("category") or "").upper()
            amount = float(bt.get("amount") or 0)
            existing = db.query(BudgetTarget).filter(BudgetTarget.period == period, BudgetTarget.category == category).first()
            if existing:
                existing.amount_chf = amount
            else:
                db.add(BudgetTarget(period=period, category=category, amount_chf=amount))
        # Upsert KPI targets
        for kt in payload.get("kpiTargets", []):
            metric = str(kt.get("metric") or "")
            target = float(kt.get("target") or 0)
            unit = kt.get("unit") or None
            existing_k = db.query(KpiTarget).filter(KpiTarget.period == period, KpiTarget.metric == metric).first()
            if existing_k:
                existing_k.target_value = target
                existing_k.unit = unit
            else:
                db.add(KpiTarget(period=period, metric=metric, target_value=target, unit=unit))

        db.commit()

        return get_targets(period, db)
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



