"""Router for Day-Ahead trading decision simulation."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import DayAheadResponse, ForecastVsActualItem
from services.data_service import get_day_ahead_decision_data

router = APIRouter(prefix="/api/day-ahead-view", tags=["Day-Ahead"])


@router.get("", response_model=DayAheadResponse)
def get_day_ahead(
    deliveryDate: str = Query("2026-01-15", description="Target delivery date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
) -> DayAheadResponse:
    """Retrieve Day-Ahead forecast snapshot published strictly prior to 11:00 UK time on D-1."""
    result = get_day_ahead_decision_data(db, deliveryDate)
    if not result["data"]:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for delivery date {deliveryDate}. Available range: 2026-01-01 to 2026-01-31",
        )

    items = [ForecastVsActualItem(**item) for item in result["data"]]
    return DayAheadResponse(
        delivery_date=result["delivery_date"],
        gate_closure=result["gate_closure"],
        metrics=result["metrics"],
        data=items,
        count=result["count"],
    )
