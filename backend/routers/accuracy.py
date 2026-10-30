"""Router for forecast accuracy metrics and daily breakdowns."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import AccuracyMetricsResponse, DailyAccuracyMetric
from services.data_service import get_accuracy_metrics, get_daily_accuracy_breakdown

router = APIRouter(prefix="/api/accuracy-metrics", tags=["Accuracy"])


@router.get("", response_model=AccuracyMetricsResponse)
def get_metrics(
    start: str | None = Query(None, description="Start timestamp ISO 8601"),
    end: str | None = Query(None, description="End timestamp ISO 8601"),
    db: Session = Depends(get_db),
) -> AccuracyMetricsResponse:
    """Retrieve statistical error metrics (MAE, RMSE, nRMSE, Bias, Max Error)."""
    data = get_accuracy_metrics(db, start, end)
    return AccuracyMetricsResponse(**data)


@router.get("/daily", response_model=list[DailyAccuracyMetric])
def get_daily_metrics(
    start: str | None = Query(None, description="Start timestamp ISO 8601"),
    end: str | None = Query(None, description="End timestamp ISO 8601"),
    db: Session = Depends(get_db),
) -> list[DailyAccuracyMetric]:
    """Retrieve daily aggregated error metrics for heatmap and distribution charts."""
    records = get_daily_accuracy_breakdown(db, start, end)
    return [DailyAccuracyMetric(**r) for r in records]
