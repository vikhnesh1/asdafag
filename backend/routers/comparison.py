"""Router for paired forecast versus actual comparison time series."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import ForecastVsActualItem, ForecastVsActualResponse
from services.data_service import get_matched_forecast_vs_actual

router = APIRouter(prefix="/api/forecast-vs-actual", tags=["Comparison"])


@router.get("", response_model=ForecastVsActualResponse)
def get_forecast_vs_actual(
    start: str | None = Query(None, description="Start timestamp ISO 8601"),
    end: str | None = Query(None, description="End timestamp ISO 8601"),
    db: Session = Depends(get_db),
) -> ForecastVsActualResponse:
    """Retrieve paired actuals and latest prior forecasts with signed error."""
    records = get_matched_forecast_vs_actual(db, start, end)
    items = [
        ForecastVsActualItem(
            start_time=r["start_time"],
            settlement_date=r["settlement_date"],
            settlement_period=r["settlement_period"],
            actual_mw=r["actual_mw"],
            forecast_mw=r["forecast_mw"],
            error_mw=r["error_mw"],
            abs_error_mw=r["abs_error_mw"],
            publish_time=r["publish_time"],
        )
        for r in records
    ]
    return ForecastVsActualResponse(data=items, count=len(items))
