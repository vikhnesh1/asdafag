import { Row, Col, Card, Spin, Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ThunderboltOutlined,
  CompassOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons';
import { useOverview } from '../hooks/useWindData';
import { KPICard } from '../components/Cards/KPICard';
import { SparklineChart } from '../components/Charts/SparklineChart';
import './Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { data: overview, isLoading, isError, error } = useOverview();

  if (isLoading) {
    return (
      <div className="page-loading">
        <Spin size="large" tip="Loading trading desk overview..." />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        type="error"
        message="Failed to load dashboard data"
        description={error?.message || 'Could not connect to backend service.'}
        showIcon
      />
    );
  }

  const isOverForecasting = (overview?.bias ?? 0) > 0;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Trading Overview</h1>
          <p className="page-subtitle">
            National Grid ESO Wind Outturn vs Day-Ahead Generation Forecasts • January 2026
          </p>
        </div>
        <div className="header-actions">
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/day-ahead')}
            className="action-primary-btn"
          >
            Day-Ahead Auction View
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <Row gutter={[16, 16]} className="kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Total Wind Generation"
            value={overview?.total_generation_mwh?.toLocaleString()}
            unit="MWh"
            subtitle="1,488 half-hours delivered"
            icon={<ThunderboltOutlined />}
            color="cyan"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Mean Absolute Error"
            value={overview?.mae?.toLocaleString()}
            unit="MW"
            subtitle="Average volume deviation"
            icon={<CompassOutlined />}
            color="amber"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Root Mean Sq Error (RMSE)"
            value={overview?.rmse?.toLocaleString()}
            unit="MW"
            subtitle={`nRMSE: ${overview?.nrmse_pct}% of 30GW fleet`}
            icon={<WarningOutlined />}
            color="rose"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <KPICard
            title="Systematic Bias"
            value={`${overview?.bias > 0 ? '+' : ''}${overview?.bias?.toLocaleString()}`}
            unit="MW"
            subtitle={isOverForecasting ? 'Net over-prediction risk' : 'Net under-prediction'}
            trend={{
              direction: isOverForecasting ? 'up' : 'down',
              label: isOverForecasting ? 'Over-predicting' : 'Under-predicting',
            }}
            icon={<CheckCircleOutlined />}
            color={isOverForecasting ? 'rose' : 'emerald'}
          />
        </Col>
      </Row>

      {/* Monthly Timeline Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col span={24}>
          <Card className="sparkline-card">
            <div className="sparkline-card-header">
              <div>
                <span className="card-section-title">January 2026 Generation & Forecast Trajectory</span>
                <span className="card-section-desc">Sampled half-hourly outturn against latest pre-gate forecasts</span>
              </div>
              <div className="legend-pills">
                <span className="pill pill-cyan">● Actual Outturn</span>
                <span className="pill pill-amber">-- Latest Forecast</span>
              </div>
            </div>
            <SparklineChart data={overview?.sparkline} />
          </Card>
        </Col>
      </Row>

      {/* Trading Insights & Quick Launch */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <Card title="Trading Desk Risk Summary" className="info-card">
            <p className="summary-paragraph">
              During January 2026, National Grid ESO forecasts exhibited a persistent positive bias of 
              <strong className="text-highlight"> +{overview?.bias?.toLocaleString()} MW</strong>.
            </p>
            <ul className="insights-list">
              <li>
                <strong>Procurement Risk:</strong> Power traders relying purely on headline forecasts under-procured thermal backup by ~1.6 GW on average.
              </li>
              <li>
                <strong>Cashout Exposure:</strong> Over-forecasting creates real-time short positions subject to peak System Buy Price (SBP) penalties.
              </li>
              <li>
                <strong>Normalized Volatility:</strong> An nRMSE of <strong>{overview?.nrmse_pct}%</strong> indicates reliable synoptic weather tracking with localized ramp errors.
              </li>
            </ul>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Core Workflows" className="info-card">
            <div className="workflow-links">
              <div className="workflow-item" onClick={() => navigate('/day-ahead')}>
                <div className="workflow-icon"><FundProjectionScreenOutlined /></div>
                <div className="workflow-info">
                  <h4>Day-Ahead Gate Simulation</h4>
                  <p>Inspect what forecast was frozen on the trader's screens at 11:00 D-1.</p>
                </div>
                <ArrowRightOutlined className="workflow-arrow" />
              </div>

              <div className="workflow-item" onClick={() => navigate('/accuracy')}>
                <div className="workflow-icon"><CompassOutlined /></div>
                <div className="workflow-info">
                  <h4>Forecast Accuracy Analytics</h4>
                  <p>Review error histograms, scatter correlations, and daily error heatmaps.</p>
                </div>
                <ArrowRightOutlined className="workflow-arrow" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
