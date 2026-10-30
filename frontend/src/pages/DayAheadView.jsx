import { useState } from 'react';
import { DatePicker, Card, Row, Col, Spin, Alert, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import {
  ClockCircleOutlined,
  ThunderboltOutlined,
  CompassOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useDayAheadView } from '../hooks/useWindData';
import { ForecastVsActualChart } from '../components/Charts/ForecastVsActualChart';
import { KPICard } from '../components/Cards/KPICard';
import './DayAheadView.css';

export function DayAheadView() {
  const [selectedDate, setSelectedDate] = useState('2026-01-15');

  const { data, isLoading, isError, error } = useDayAheadView(selectedDate);

  const handleDateChange = (date, dateString) => {
    if (dateString) {
      setSelectedDate(dateString);
    }
  };

  const metrics = data?.metrics || {};
  const periods = data?.data || [];

  const columns = [
    {
      title: 'SP',
      dataIndex: 'settlement_period',
      key: 'settlement_period',
      width: 70,
      render: (v) => <span className="font-mono" style={{ fontWeight: 600 }}>{v}</span>,
    },
    {
      title: 'Delivery Window (UTC)',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 170,
      render: (t) => t.slice(11, 16),
    },
    {
      title: 'Actual Outturn',
      dataIndex: 'actual_mw',
      key: 'actual_mw',
      render: (v) => <span className="font-mono text-cyan">{v.toLocaleString()} MW</span>,
    },
    {
      title: 'D-1 Forecast (≤11:00)',
      dataIndex: 'forecast_mw',
      key: 'forecast_mw',
      render: (v) => <span className="font-mono text-amber">{v.toLocaleString()} MW</span>,
    },
    {
      title: 'Procurement Error',
      dataIndex: 'error_mw',
      key: 'error_mw',
      render: (v) => {
        const isOver = v > 0;
        return (
          <Tag color={isOver ? 'error' : 'success'} className="font-mono">
            {isOver ? '+' : ''}{v.toLocaleString()} MW
          </Tag>
        );
      },
    },
    {
      title: 'Model Published (D-1)',
      dataIndex: 'publish_time',
      key: 'publish_time',
      render: (t) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.replace('T', ' ').slice(0, 16)} UTC</span>,
    },
  ];

  return (
    <div className="day-ahead-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Day-Ahead Decision View</h1>
          <p className="page-subtitle">
            Simulate the trader's view at the 11:00 AM D-1 gate closure. Shows the active forecast used for market bidding.
          </p>
        </div>

        <div className="date-picker-wrap">
          <span className="picker-label">Delivery Date:</span>
          <DatePicker
            value={dayjs(selectedDate)}
            onChange={handleDateChange}
            minDate={dayjs('2026-01-01')}
            maxDate={dayjs('2026-01-31')}
            format="YYYY-MM-DD"
            allowClear={false}
            className="auction-date-picker"
          />
        </div>
      </div>

      {/* Gate Closure Banner */}
      <div className="gate-closure-banner">
        <ClockCircleOutlined className="gate-icon" />
        <div className="gate-text">
          <strong>EPEX SPOT / Nord Pool Gate Closure:</strong> All bids for delivery on{' '}
          <span className="gate-highlight">{selectedDate}</span> were locked at{' '}
          <span className="gate-highlight">{data?.gate_closure || `${selectedDate} (D-1) at 11:00 UTC`}</span>.
          Showing strictly forecasts published prior to this deadline.
        </div>
      </div>

      {isLoading ? (
        <div className="page-loading">
          <Spin size="large" tip="Reconstructing Day-Ahead market positions..." />
        </div>
      ) : isError ? (
        <Alert type="error" message="Failed to load Day-Ahead view" description={error?.message} showIcon />
      ) : (
        <>
          {/* Day-Ahead Specific Metrics */}
          <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col xs={24} sm={12} lg={6}>
              <KPICard
                title="D-1 Day MAE"
                value={metrics?.mae?.toLocaleString()}
                unit="MW"
                subtitle="Average auction miscalculation"
                icon={<CompassOutlined />}
                color="amber"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KPICard
                title="D-1 Day RMSE"
                value={metrics?.rmse?.toLocaleString()}
                unit="MW"
                subtitle="Peak delivery volatility"
                icon={<WarningOutlined />}
                color="rose"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KPICard
                title="Day Bias (Net Position)"
                value={`${metrics?.bias > 0 ? '+' : ''}${metrics?.bias?.toLocaleString()}`}
                unit="MW"
                subtitle={metrics?.bias > 0 ? 'Short position (under-bought power)' : 'Long position'}
                trend={{
                  direction: metrics?.bias > 0 ? 'up' : 'down',
                  label: metrics?.bias > 0 ? 'Under-procured' : 'Over-procured',
                }}
                icon={<CheckCircleOutlined />}
                color={metrics?.bias > 0 ? 'rose' : 'emerald'}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KPICard
                title="Max Hourly Discrepancy"
                value={metrics?.max_abs_error?.toLocaleString()}
                unit="MW"
                subtitle="Largest single half-hour mismatch"
                icon={<ThunderboltOutlined />}
                color="violet"
              />
            </Col>
          </Row>

          {/* D-1 Decision Chart */}
          <Card className="da-chart-card" style={{ marginTop: 20 }}>
            <ForecastVsActualChart
              data={periods}
              height={440}
              title={`Delivery Day ${selectedDate} — Actual Outturn vs Frozen D-1 Auction Forecast`}
            />
          </Card>

          {/* Detailed Half-Hour Settlement Breakdown Table */}
          <Card title={`Settlement Periods (48 Half-Hours) — ${selectedDate}`} style={{ marginTop: 20 }}>
            <Table
              dataSource={periods}
              columns={columns}
              rowKey="start_time"
              pagination={false}
              size="middle"
              className="da-periods-table"
            />
          </Card>
        </>
      )}
    </div>
  );
}
