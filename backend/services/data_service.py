"""Data access and query service for wind actuals, forecasts, and comparisons."""

from datetime import datetime, timedelta
from typing import Any
from sqlalchemy import text
from sqlalchemy.orm import Session

from config import UK_INSTALLED_WIND_CAPACITY_MW
from services.metrics import compute_metrics_bundle


def get_actuals_data(
    db: Session,
    start: str | None = None,
    end: str | None = None,
) -> list[dict[str, Any]]:
    """Retrieve actual wind generation records with optional date filtering."""
    query = """
        SELECT start_time, settlement_date, settlement_period, generation
        FROM wind_actuals
        WHERE 1=1
    """
    params: dict[str, Any] = {}
    if start:
        query += " AND start_time >= :start"
        params["start"] = start
    if end:
        query += " AND start_time <= :end"
        params["end"] = end

    query += " ORDER BY start_time ASC;"
    rows = db.execute(text(query), params).mappings().fetchall()
    return [dict(r) for r in rows]


def get_forecasts_data(
    db: Session,
    start: str | None = None,
    end: str | None = None,
) -> list[dict[str, Any]]:
    """Retrieve wind generation forecasts with optional target start time filtering."""
    query = """
        SELECT start_time, publish_time, generation
        FROM wind_forecasts
        WHERE 1=1
    """
    params: dict[str, Any] = {}
    if start:
        query += " AND start_time >= :start"
        params["start"] = start
    if end:
        query += " AND start_time <= :end"
        params["end"] = end

    query += " ORDER BY start_time ASC, publish_time DESC;"
    rows = db.execute(text(query), params).mappings().fetchall()
    return [dict(r) for r in rows]


def get_matched_forecast_vs_actual(
    db: Session,
    start: str | None = None,
    end: str | None = None,
) -> list[dict[str, Any]]:
    """Join actuals with the most recent forecast published prior to delivery.
    
    For half-hour settlement periods (:30), the corresponding hourly forecast (:00) is matched.
    """
    base_query = """
    WITH matched AS (
        SELECT 
            a.start_time,
            a.settlement_date,
            a.settlement_period,
            a.generation AS actual_mw,
            f.generation AS forecast_mw,
            f.publish_time,
            ROW_NUMBER() OVER (
                PARTITION BY a.start_time 
                ORDER BY f.publish_time DESC
            ) as rn
        FROM wind_actuals a
        JOIN wind_forecasts f 
          ON (f.start_time = a.start_time 
              OR (a.start_time LIKE '%:30:00Z' AND f.start_time = substr(a.start_time, 1, 14) || '00:00Z'))
         AND f.publish_time < a.start_time
        WHERE 1=1
    """
    params: dict[str, Any] = {}
    if start:
        base_query += " AND a.start_time >= :start"
        params["start"] = start
    if end:
        base_query += " AND a.start_time <= :end"
        params["end"] = end

    base_query += """
    )
    SELECT 
        start_time,
        settlement_date,
        settlement_period,
        actual_mw,
        forecast_mw,
        ROUND(forecast_mw - actual_mw, 1) as error_mw,
        ROUND(abs(forecast_mw - actual_mw), 1) as abs_error_mw,
        publish_time
    FROM matched
    WHERE rn = 1
    ORDER BY start_time ASC;
    """

    rows = db.execute(text(base_query), params).mappings().fetchall()
    return [dict(r) for r in rows]


def get_accuracy_metrics(
    db: Session,
    start: str | None = None,
    end: str | None = None,
) -> dict[str, Any]:
    """Calculate aggregate error metrics across the specified time window."""
    pairs = get_matched_forecast_vs_actual(db, start, end)
    if not pairs:
        return {
            "mae": 0.0,
            "rmse": 0.0,
            "nrmse": 0.0,
            "nrmse_pct": 0.0,
            "bias": 0.0,
            "max_abs_error": 0.0,
            "period_count": 0,
            "mean_actual_mw": 0.0,
            "mean_forecast_mw": 0.0,
            "date_range": {"start": start or "", "end": end or ""},
        }

    forecasts = [p["forecast_mw"] for p in pairs]
    actuals = [p["actual_mw"] for p in pairs]
    bundle = compute_metrics_bundle(forecasts, actuals, UK_INSTALLED_WIND_CAPACITY_MW)

    return {
        "mae": bundle["mae"],
        "rmse": bundle["rmse"],
        "nrmse": bundle["nrmse"],
        "nrmse_pct": bundle["nrmse_pct"],
        "bias": bundle["bias"],
        "max_abs_error": bundle["max_abs_error"],
        "period_count": len(pairs),
        "mean_actual_mw": bundle["mean_actual"],
        "mean_forecast_mw": bundle["mean_forecast"],
        "date_range": {
            "start": pairs[0]["start_time"],
            "end": pairs[-1]["start_time"],
        },
    }


def get_daily_accuracy_breakdown(
    db: Session,
    start: str | None = None,
    end: str | None = None,
) -> list[dict[str, Any]]:
    """Compute daily MAE, RMSE, and bias for heatmap and daily trend charts."""
    pairs = get_matched_forecast_vs_actual(db, start, end)
    grouped: dict[str, list[dict[str, Any]]] = {}
    for p in pairs:
        date_str = p["settlement_date"]
        grouped.setdefault(date_str, []).append(p)

    breakdown = []
    for date_str in sorted(grouped.keys()):
        day_pairs = grouped[date_str]
        f_vals = [p["forecast_mw"] for p in day_pairs]
        a_vals = [p["actual_mw"] for p in day_pairs]
        bundle = compute_metrics_bundle(f_vals, a_vals, UK_INSTALLED_WIND_CAPACITY_MW)
        breakdown.append({
            "date": date_str,
            "mae": bundle["mae"],
            "rmse": bundle["rmse"],
            "bias": bundle["bias"],
            "count": len(day_pairs),
        })
    return breakdown


def get_day_ahead_decision_data(
    db: Session,
    delivery_date: str,
) -> dict[str, Any]:
    """Reconstruct what forecast was available at 11:00 UK time on D-1 for delivery day D."""
    try:
        dt = datetime.strptime(delivery_date, "%Y-%m-%d")
        d_minus_1 = (dt - timedelta(days=1)).strftime("%Y-%m-%d")
    except ValueError:
        return {"delivery_date": delivery_date, "gate_closure": "", "metrics": {}, "data": [], "count": 0}

    gate_closure = f"{d_minus_1}T11:00:00Z"

    query = """
    WITH matched_da AS (
        SELECT 
            a.start_time,
            a.settlement_date,
            a.settlement_period,
            a.generation AS actual_mw,
            f.generation AS forecast_mw,
            f.publish_time,
            ROW_NUMBER() OVER (
                PARTITION BY a.start_time 
                ORDER BY f.publish_time DESC
            ) as rn
        FROM wind_actuals a
        JOIN wind_forecasts f 
          ON (f.start_time = a.start_time 
              OR (a.start_time LIKE '%:30:00Z' AND f.start_time = substr(a.start_time, 1, 14) || '00:00Z'))
         AND f.publish_time <= :gate_closure
        WHERE a.settlement_date = :delivery_date
    )
    SELECT 
        start_time,
        settlement_date,
        settlement_period,
        actual_mw,
        forecast_mw,
        ROUND(forecast_mw - actual_mw, 1) as error_mw,
        ROUND(abs(forecast_mw - actual_mw), 1) as abs_error_mw,
        publish_time
    FROM matched_da
    WHERE rn = 1
    ORDER BY settlement_period ASC;
    """

    rows = db.execute(
        text(query),
        {"gate_closure": gate_closure, "delivery_date": delivery_date},
    ).mappings().fetchall()

    data = [dict(r) for r in rows]
    metrics = {}
    if data:
        f_vals = [p["forecast_mw"] for p in data]
        a_vals = [p["actual_mw"] for p in data]
        metrics = compute_metrics_bundle(f_vals, a_vals, UK_INSTALLED_WIND_CAPACITY_MW)

    return {
        "delivery_date": delivery_date,
        "gate_closure": gate_closure,
        "metrics": metrics,
        "data": data,
        "count": len(data),
    }


def get_overview_kpis(db: Session) -> dict[str, Any]:
    """Compute high-level executive KPIs and monthly sparkline."""
    pairs = get_matched_forecast_vs_actual(db)
    if not pairs:
        return {
            "total_generation_mwh": 0.0,
            "mean_actual_mw": 0.0,
            "mean_forecast_mw": 0.0,
            "mae": 0.0,
            "rmse": 0.0,
            "nrmse_pct": 0.0,
            "bias": 0.0,
            "period_count": 0,
            "date_range": {"start": "", "end": ""},
            "sparkline": [],
        }

    f_vals = [p["forecast_mw"] for p in pairs]
    a_vals = [p["actual_mw"] for p in pairs]
    bundle = compute_metrics_bundle(f_vals, a_vals, UK_INSTALLED_WIND_CAPACITY_MW)

    # Half-hourly MW -> MWh: multiply generation by 0.5 hours
    total_generation_mwh = round(sum(a_vals) * 0.5, 1)

    # Sample sparkline: sample every 4th period for a fast, responsive sparkline
    sparkline = [
        {"timestamp": p["start_time"], "actual": p["actual_mw"], "forecast": p["forecast_mw"]}
        for p in pairs[::4]
    ]

    return {
        "total_generation_mwh": total_generation_mwh,
        "mean_actual_mw": bundle["mean_actual"],
        "mean_forecast_mw": bundle["mean_forecast"],
        "mae": bundle["mae"],
        "rmse": bundle["rmse"],
        "nrmse_pct": bundle["nrmse_pct"],
        "bias": bundle["bias"],
        "period_count": len(pairs),
        "date_range": {
            "start": pairs[0]["start_time"],
            "end": pairs[-1]["start_time"],
        },
        "sparkline": sparkline,
    }
