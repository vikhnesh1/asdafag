import { Button, Tooltip, Tag } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

export function Header({ collapsed, onToggleCollapse }) {
  const { isDark, toggleTheme } = useTheme();

  const handleExportClick = () => {
    window.location.href = '/api/data-export';
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>

        <div className="market-status-chip">
          <ClockCircleOutlined className="status-icon" />
          <span className="status-label">UK Wholesale Gate:</span>
          <span className="status-val">11:00 UTC D-1</span>
        </div>

        <Tag color="cyan" className="period-tag">
          Jan 2026 Scope (1,488 Half-Hours)
        </Tag>
      </div>

      <div className="header-right">
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportClick}
          className="export-btn"
        >
          Export CSV
        </Button>

        <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
