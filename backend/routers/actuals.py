"""Router for actual wind generation time series."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import ActualItem, ActualListResponse
from services.data_service import get_actuals_data

router = APIRouter(prefix="/api/actuals", tags=["Actuals"])


@router.get("", response_model=ActualListResponse)
def get_actuals(
    start: str | None = Query(None, description="Start timestamp ISO 8601 (e.g. 2026-01-01T00:00:00Z)"),
    end: str | None = Query(None, description="End timestamp ISO 8601 (e.g. 2026-01-07T23:30:00Z)"),
    db: Session = Depends(get_db),
) -> ActualListResponse:
    """Retrieve half-hourly actual wind generation outturn records."""
    records = get_actuals_data(db, start, end)
    items = [
        ActualItem(
            start_time=r["start_time"],
            settlement_date=r["settlement_date"],
            settlement_period=r["settlement_period"],
            generation=r["generation"],
        )
        for r in records
    ]
    return ActualListResponse(data=items, count=len(items))
