"""Router for raw data CSV export."""

import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from services.data_service import get_matched_forecast_vs_actual

router = APIRouter(prefix="/api/data-export", tags=["Export"])


@router.get("")
def export_csv(
    start: str | None = Query(None, description="Start timestamp ISO 8601"),
    end: str | None = Query(None, description="End timestamp ISO 8601"),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    """Export paired forecast vs actual generation dataset as CSV."""
    records = get_matched_forecast_vs_actual(db, start, end)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Start Time",
        "Settlement Date",
        "Settlement Period",
        "Actual Generation (MW)",
        "Forecast Generation (MW)",
        "Error (MW)",
        "Absolute Error (MW)",
        "Forecast Publish Time",
    ])

    for r in records:
        writer.writerow([
            r["start_time"],
            r["settlement_date"],
            r["settlement_period"],
            r["actual_mw"],
            r["forecast_mw"],
            r["error_mw"],
            r["abs_error_mw"],
            r["publish_time"],
        ])

    output.seek(0)
    filename = f"wind_forecast_vs_actual_{start or '2026-01-01'}_{end or '2026-01-31'}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
