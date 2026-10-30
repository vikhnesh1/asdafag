import { NavLink } from 'react-router-dom';
import {
  DashboardOutlined,
  LineChartOutlined,
  DotChartOutlined,
  CalendarOutlined,
  TableOutlined,
  ThunderboltFilled,
} from '@ant-design/icons';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Overview', icon: <DashboardOutlined /> },
  { path: '/forecast-comparison', label: 'Forecast vs Actual', icon: <LineChartOutlined /> },
  { path: '/accuracy', label: 'Accuracy Analytics', icon: <DotChartOutlined /> },
  { path: '/day-ahead', label: 'Day-Ahead Trading', icon: <CalendarOutlined /> },
  { path: '/data', label: 'Data Explorer', icon: <TableOutlined /> },
];

export function Sidebar({ collapsed }) {
  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">
          <ThunderboltFilled />
        </div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-title">AERO<span className="brand-accent">GRID</span></span>
            <span className="brand-subtitle">UK Wind Trading Desk</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="data-source-badge">
            <span className="badge-pulse"></span>
            <span>Elexon BMRS Live Jan 2026</span>
          </div>
        </div>
      )}
    </aside>
  );
}
