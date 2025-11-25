from fastapi import APIRouter

router = APIRouter(prefix="/import", tags=["import"])


@router.post("/activities")
def import_activities():
  return {"message": "Import functionality not yet implemented"}


@router.post("/performance")
def import_performance():
  return {"message": "Import functionality not yet implemented"}


