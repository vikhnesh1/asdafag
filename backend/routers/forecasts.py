"""Router for wind generation forecasts."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import ForecastItem, ForecastListResponse
from services.data_service import get_forecasts_data

router = APIRouter(prefix="/api/forecasts", tags=["Forecasts"])


@router.get("", response_model=ForecastListResponse)
def get_forecasts(
    start: str | None = Query(None, description="Delivery start timestamp ISO 8601"),
    end: str | None = Query(None, description="Delivery end timestamp ISO 8601"),
    db: Session = Depends(get_db),
) -> ForecastListResponse:
    """Retrieve wind generation forecasts for target delivery periods."""
    records = get_forecasts_data(db, start, end)
    items = [
        ForecastItem(
            start_time=r["start_time"],
            publish_time=r["publish_time"],
            generation=r["generation"],
        )
        for r in records
    ]
    return ForecastListResponse(data=items, count=len(items))
