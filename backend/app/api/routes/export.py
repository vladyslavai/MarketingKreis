from fastapi import APIRouter

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/activities.csv")
def export_activities_csv():
    """Placeholder for CSV export"""
    return {"message": "Export functionality not yet implemented"}


