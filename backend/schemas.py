"""Pydantic schemas for request validation and response models."""

from typing import Any
from pydantic import BaseModel, Field


class DateRange(BaseModel):
    start: str
    end: str


class ActualItem(BaseModel):
    start_time: str
    settlement_date: str
    settlement_period: int
    generation: float


class ActualListResponse(BaseModel):
    data: list[ActualItem]
    count: int


class ForecastItem(BaseModel):
    start_time: str
    publish_time: str
    generation: float


class ForecastListResponse(BaseModel):
    data: list[ForecastItem]
    count: int


class ForecastVsActualItem(BaseModel):
    start_time: str
    settlement_date: str
    settlement_period: int
    actual_mw: float
    forecast_mw: float
    error_mw: float
    abs_error_mw: float
    publish_time: str


class ForecastVsActualResponse(BaseModel):
    data: list[ForecastVsActualItem]
    count: int


class AccuracyMetricsResponse(BaseModel):
    mae: float = Field(..., description="Mean Absolute Error in MW")
    rmse: float = Field(..., description="Root Mean Squared Error in MW")
    nrmse: float = Field(..., description="Normalized RMSE (relative to 30GW capacity)")
    nrmse_pct: float = Field(..., description="Normalized RMSE as percentage")
    bias: float = Field(..., description="Mean Error in MW (>0 over-prediction, <0 under-prediction)")
    max_abs_error: float = Field(..., description="Maximum absolute error in MW")
    period_count: int
    mean_actual_mw: float
    mean_forecast_mw: float
    date_range: DateRange


class DailyAccuracyMetric(BaseModel):
    date: str
    mae: float
    rmse: float
    bias: float
    count: int


class SparklinePoint(BaseModel):
    timestamp: str
    actual: float
    forecast: float


class OverviewResponse(BaseModel):
    total_generation_mwh: float
    mean_actual_mw: float
    mean_forecast_mw: float
    mae: float
    rmse: float
    nrmse_pct: float
    bias: float
    period_count: int
    date_range: DateRange
    sparkline: list[SparklinePoint]


class DayAheadResponse(BaseModel):
    delivery_date: str
    gate_closure: str
    metrics: dict[str, float]
    data: list[ForecastVsActualItem]
    count: int
