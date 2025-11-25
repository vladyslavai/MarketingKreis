from fastapi import APIRouter

router = APIRouter(prefix="/performance", tags=["performance"]) 

@router.get("")
def get_performance():
    return {"status": "ok", "data": []}

