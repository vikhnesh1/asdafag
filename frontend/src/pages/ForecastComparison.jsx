import { useState } from 'react';
import { Card, Radio, Spin, Alert, Row, Col, Statistic } from 'antd';
import { useForecastVsActual } from '../hooks/useWindData';
import { ForecastVsActualChart } from '../components/Charts/ForecastVsActualChart';
import './ForecastComparison.css';

const PRESETS = [
  { label: 'Full Month', start: '', end: '' },
  { label: 'Week 1 (Jan 1–7)', start: '2026-01-01T00:00:00Z', end: '2026-01-07T23:30:00Z' },
  { label: 'Week 2 (Jan 8–14)', start: '2026-01-08T00:00:00Z', end: '2026-01-14T23:30:00Z' },
  { label: 'Week 3 (Jan 15–21)', start: '2026-01-15T00:00:00Z', end: '2026-01-21T23:30:00Z' },
  { label: 'Week 4 (Jan 22–31)', start: '2026-01-22T00:00:00Z', end: '2026-01-31T23:30:00Z' },
];

export function ForecastComparison() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const currentRange = PRESETS[selectedPreset];

  const { data, isLoading, isError, error } = useForecastVsActual(
    currentRange.start,
    currentRange.end,
  );

  const seriesData = data?.data || [];

  // Derived metrics for current view
  let avgActual = 0;
  let avgForecast = 0;
  let totalMAE = 0;
  let totalBias = 0;
  if (seriesData.length > 0) {
    avgActual = Math.round(seriesData.reduce((acc, p) => acc + p.actual_mw, 0) / seriesData.length);
    avgForecast = Math.round(seriesData.reduce((acc, p) => acc + p.forecast_mw, 0) / seriesData.length);
    totalMAE = Math.round(seriesData.reduce((acc, p) => acc + p.abs_error_mw, 0) / seriesData.length);
    totalBias = Math.round(seriesData.reduce((acc, p) => acc + p.error_mw, 0) / seriesData.length);
  }

  return (
    <div className="comparison-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Forecast vs Actual Overlay</h1>
          <p className="page-subtitle">
            Compare actual wind outturn against the latest pre-delivery forecasts with interactive data scrubbing.
          </p>
        </div>

        <div className="filter-controls">
          <Radio.Group
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            buttonStyle="solid"
            className="preset-radio-group"
          >
            {PRESETS.map((p, idx) => (
              <Radio.Button key={idx} value={idx}>
                {p.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>

      {/* Range Summary Bar */}
      <Card className="window-summary-card">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Settlement Periods"
              value={seriesData.length}
              suffix="half-hours"
              valueStyle={{ fontSize: '1.25rem' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Window Mean Actual"
              value={avgActual.toLocaleString()}
              suffix="MW"
              valueStyle={{ fontSize: '1.25rem', color: '#06b6d4' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Window Mean Forecast"
              value={avgForecast.toLocaleString()}
              suffix="MW"
              valueStyle={{ fontSize: '1.25rem', color: '#f59e0b' }}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Window Mean Absolute Error"
              value={totalMAE.toLocaleString()}
              suffix="MW"
              valueStyle={{ fontSize: '1.25rem', color: totalMAE > 2000 ? '#f43f5e' : '#10b981' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Chart Card */}
      <Card className="chart-card" style={{ marginTop: 20 }}>
        {isLoading ? (
          <div className="chart-loading">
            <Spin size="large" tip="Loading time-series overlay..." />
          </div>
        ) : isError ? (
          <Alert type="error" message="Error loading forecast comparison" description={error?.message} showIcon />
        ) : (
          <ForecastVsActualChart
            data={seriesData}
            height={520}
            title={`${PRESETS[selectedPreset].label} — Wind Outturn vs Latest Forecast`}
          />
        )}
      </Card>
    </div>
  );
}
