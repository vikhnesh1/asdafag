"""Router for dashboard overview KPIs."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import OverviewResponse
from services.data_service import get_overview_kpis

router = APIRouter(prefix="/api/overview", tags=["Overview"])


@router.get("", response_model=OverviewResponse)
def get_overview(db: Session = Depends(get_db)) -> OverviewResponse:
    """Retrieve executive summary KPIs and monthly overview sparkline."""
    data = get_overview_kpis(db)
    return OverviewResponse(**data)
