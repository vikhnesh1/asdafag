"""Forecast accuracy metrics computation service.

Computes MAE, RMSE, nRMSE, Bias, and Max Absolute Error.
Note: MAPE is intentionally omitted per product specification.
"""

import math
from typing import Sequence
from config import UK_INSTALLED_WIND_CAPACITY_MW


def compute_mae(forecasts: Sequence[float], actuals: Sequence[float]) -> float:
    """Compute Mean Absolute Error in MW."""
    if not forecasts or not actuals or len(forecasts) != len(actuals):
        return 0.0
    return sum(abs(f - a) for f, a in zip(forecasts, actuals)) / len(forecasts)


def compute_rmse(forecasts: Sequence[float], actuals: Sequence[float]) -> float:
    """Compute Root Mean Squared Error in MW."""
    if not forecasts or not actuals or len(forecasts) != len(actuals):
        return 0.0
    mse = sum((f - a) ** 2 for f, a in zip(forecasts, actuals)) / len(forecasts)
    return math.sqrt(mse)


def compute_nrmse(
    rmse_mw: float,
    capacity_mw: float = UK_INSTALLED_WIND_CAPACITY_MW,
) -> float:
    """Compute normalized RMSE as a ratio against reference installed capacity."""
    if capacity_mw <= 0:
        return 0.0
    return rmse_mw / capacity_mw


def compute_bias(forecasts: Sequence[float], actuals: Sequence[float]) -> float:
    """Compute Mean Error (Bias) in MW.
    
    Positive bias indicates over-prediction; negative indicates under-prediction.
    """
    if not forecasts or not actuals or len(forecasts) != len(actuals):
        return 0.0
    return sum(f - a for f, a in zip(forecasts, actuals)) / len(forecasts)


def compute_max_error(forecasts: Sequence[float], actuals: Sequence[float]) -> float:
    """Compute maximum absolute error across all observed periods in MW."""
    if not forecasts or not actuals or len(forecasts) != len(actuals):
        return 0.0
    return max(abs(f - a) for f, a in zip(forecasts, actuals))


def compute_metrics_bundle(
    forecasts: Sequence[float],
    actuals: Sequence[float],
    capacity_mw: float = UK_INSTALLED_WIND_CAPACITY_MW,
) -> dict[str, float]:
    """Compute all standard power trading accuracy metrics for paired time series."""
    if not forecasts or not actuals or len(forecasts) != len(actuals):
        return {
            "mae": 0.0,
            "rmse": 0.0,
            "nrmse": 0.0,
            "nrmse_pct": 0.0,
            "bias": 0.0,
            "max_abs_error": 0.0,
            "mean_actual": 0.0,
            "mean_forecast": 0.0,
        }

    mae = compute_mae(forecasts, actuals)
    rmse = compute_rmse(forecasts, actuals)
    nrmse = compute_nrmse(rmse, capacity_mw)
    bias = compute_bias(forecasts, actuals)
    max_err = compute_max_error(forecasts, actuals)

    return {
        "mae": round(mae, 1),
        "rmse": round(rmse, 1),
        "nrmse": round(nrmse, 4),
        "nrmse_pct": round(nrmse * 100.0, 2),
        "bias": round(bias, 1),
        "max_abs_error": round(max_err, 1),
        "mean_actual": round(sum(actuals) / len(actuals), 1),
        "mean_forecast": round(sum(forecasts) / len(forecasts), 1),
    }
