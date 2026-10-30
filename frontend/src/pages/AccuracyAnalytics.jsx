import { Row, Col, Card, Spin, Alert, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  CompassOutlined,
  WarningOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useAccuracyMetrics, useDailyMetrics, useForecastVsActual } from '../hooks/useWindData';
import { KPICard } from '../components/Cards/KPICard';
import { ErrorHistogram } from '../components/Charts/ErrorHistogram';
import { ScatterPlot } from '../components/Charts/ScatterPlot';
import { DailyHeatmap } from '../components/Charts/DailyHeatmap';
import './AccuracyAnalytics.css';

export function AccuracyAnalytics() {
  const { data: metrics, isLoading: loadingMetrics, isError: errMetrics } = useAccuracyMetrics();
  const { data: dailyMetrics, isLoading: loadingDaily } = useDailyMetrics();
  const { data: rawPairs, isLoading: loadingPairs } = useForecastVsActual();

  const isLoading = loadingMetrics || loadingDaily || loadingPairs;

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <Spin size="large" tip="Computing mathematical error distributions..." />
      </div>
    );
  }

  if (errMetrics) {
    return <Alert type="error" message="Failed to load accuracy metrics" showIcon />;
  }

  return (
    <div className="accuracy-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Forecast Accuracy Analytics</h1>
          <p className="page-subtitle">
            Quantitative evaluation of National Grid ESO wind models across January 2026.
          </p>
        </div>

        <div className="methodology-note">
          <Tooltip title="In power trading, MAPE is prohibited because calm days with near-zero wind cause division by zero. MAE, RMSE, and nRMSE are the industry standards.">
            <span className="methodology-badge">
              <InfoCircleOutlined /> MAPE Excluded (Standard Energy Trading Practice)
            </span>
          </Tooltip>
        </div>
      </div>

      {/* 5 Core Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={4}>
          <KPICard
            title="MAE"
            value={metrics?.mae?.toLocaleString()}
            unit="MW"
            subtitle="Mean Absolute Error"
            icon={<CompassOutlined />}
            color="amber"
          />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <KPICard
            title="RMSE"
            value={metrics?.rmse?.toLocaleString()}
            unit="MW"
            subtitle="Penalizes large outlier misses"
            icon={<WarningOutlined />}
            color="rose"
          />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <KPICard
            title="nRMSE"
            value={`${metrics?.nrmse_pct}%`}
            unit="capacity"
            subtitle="Normalized to 30GW GB fleet"
            icon={<AimOutlined />}
            color="cyan"
          />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <KPICard
            title="Bias (Mean Error)"
            value={`${metrics?.bias > 0 ? '+' : ''}${metrics?.bias?.toLocaleString()}`}
            unit="MW"
            subtitle={metrics?.bias > 0 ? 'Over-prediction' : 'Under-prediction'}
            trend={{
              direction: metrics?.bias > 0 ? 'up' : 'down',
              label: metrics?.bias > 0 ? 'Bullish bias' : 'Bearish bias',
            }}
            icon={<RiseOutlined />}
            color={metrics?.bias > 0 ? 'rose' : 'emerald'}
          />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <KPICard
            title="Max Abs Error"
            value={metrics?.max_abs_error?.toLocaleString()}
            unit="MW"
            subtitle="Worst single half-hour delta"
            icon={<ThunderboltOutlined />}
            color="violet"
          />
        </Col>
      </Row>

      {/* Analytics Visualizations */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} lg={12}>
          <Card className="analytics-card">
            <ErrorHistogram data={rawPairs?.data} height={340} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="analytics-card">
            <ScatterPlot data={rawPairs?.data} height={340} />
          </Card>
        </Col>
      </Row>

      {/* Daily Breakdown Heatmap */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card className="analytics-card">
            <DailyHeatmap data={dailyMetrics} height={320} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
