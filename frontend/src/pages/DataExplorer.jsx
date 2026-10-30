import { useState } from 'react';
import { Card, Table, Input, Button, Tag, Spin, Alert } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useForecastVsActual } from '../hooks/useWindData';
import './DataExplorer.css';

export function DataExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError, error } = useForecastVsActual();

  const handleExport = () => {
    window.location.href = '/api/data-export';
  };

  const rawData = data?.data || [];
  const filteredData = rawData.filter((r) => {
    if (!searchTerm) return true;
    return (
      r.start_time.includes(searchTerm) ||
      r.settlement_date.includes(searchTerm) ||
      String(r.settlement_period).includes(searchTerm)
    );
  });

  const columns = [
    {
      title: 'Settlement Date',
      dataIndex: 'settlement_date',
      key: 'settlement_date',
      sorter: (a, b) => a.settlement_date.localeCompare(b.settlement_date),
      width: 140,
    },
    {
      title: 'SP',
      dataIndex: 'settlement_period',
      key: 'settlement_period',
      sorter: (a, b) => a.settlement_period - b.settlement_period,
      width: 80,
      render: (v) => <span className="font-mono">{v}</span>,
    },
    {
      title: 'Period Timestamp (UTC)',
      dataIndex: 'start_time',
      key: 'start_time',
      sorter: (a, b) => a.start_time.localeCompare(b.start_time),
      render: (t) => t.replace('T', ' ').slice(0, 16),
      width: 180,
    },
    {
      title: 'Actual Outturn',
      dataIndex: 'actual_mw',
      key: 'actual_mw',
      sorter: (a, b) => a.actual_mw - b.actual_mw,
      render: (v) => <span className="font-mono" style={{ color: '#06b6d4', fontWeight: 600 }}>{v.toLocaleString()} MW</span>,
    },
    {
      title: 'Latest Forecast',
      dataIndex: 'forecast_mw',
      key: 'forecast_mw',
      sorter: (a, b) => a.forecast_mw - b.forecast_mw,
      render: (v) => <span className="font-mono" style={{ color: '#f59e0b', fontWeight: 600 }}>{v.toLocaleString()} MW</span>,
    },
    {
      title: 'Delta (Error)',
      dataIndex: 'error_mw',
      key: 'error_mw',
      sorter: (a, b) => a.error_mw - b.error_mw,
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
      title: 'Absolute Error',
      dataIndex: 'abs_error_mw',
      key: 'abs_error_mw',
      sorter: (a, b) => a.abs_error_mw - b.abs_error_mw,
      render: (v) => <span className="font-mono">{v.toLocaleString()} MW</span>,
    },
    {
      title: 'Forecast Published',
      dataIndex: 'publish_time',
      key: 'publish_time',
      render: (t) => <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.replace('T', ' ').slice(0, 16)}</span>,
    },
  ];

  return (
    <div className="data-explorer-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Granular Data Explorer</h1>
          <p className="page-subtitle">
            Browse and export all 1,488 settlement periods with sorting and filtering across January 2026.
          </p>
        </div>

        <div className="header-actions">
          <Input
            placeholder="Search date or SP (e.g. 2026-01-15)..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            allowClear
          />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="action-primary-btn"
          >
            Export All to CSV
          </Button>
        </div>
      </div>

      <Card className="table-card">
        {isLoading ? (
          <div className="page-loading">
            <Spin size="large" tip="Loading settlement records..." />
          </div>
        ) : isError ? (
          <Alert type="error" message="Failed to load records" description={error?.message} showIcon />
        ) : (
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="start_time"
            pagination={{
              pageSize: 48, // 1 day per page by default
              showSizeChanger: true,
              pageSizeOptions: ['24', '48', '96', '144'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} settlement periods`,
            }}
            size="middle"
          />
        )}
      </Card>
    </div>
  );
}
