import { Card } from 'antd';
import './KPICard.css';

export function KPICard({ title, value, unit, subtitle, icon, trend, color = 'cyan' }) {
  return (
    <Card className={`kpi-card accent-${color}`}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {icon && <span className="kpi-icon">{icon}</span>}
      </div>

      <div className="kpi-body">
        <span className="kpi-value">{value ?? '—'}</span>
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="kpi-footer">
          {trend && (
            <span className={`kpi-trend trend-${trend.direction}`}>
              {trend.label}
            </span>
          )}
          {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
}
