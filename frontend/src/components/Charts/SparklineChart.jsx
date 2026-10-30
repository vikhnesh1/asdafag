import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../context/ThemeContext';

export function SparklineChart({ data = [] }) {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading timeline...</div>;
  }

  const times = data.map((d) => d.timestamp.replace('T', ' ').slice(5, 16));
  const actuals = data.map((d) => d.actual);
  const forecasts = data.map((d) => d.forecast);

  const option = {
    grid: {
      top: 15,
      right: 15,
      bottom: 25,
      left: 45,
      containLabel: false,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
      formatter: (params) => {
        let content = `<div style="font-weight:600;margin-bottom:4px">${params[0].axisValue}</div>`;
        params.forEach((p) => {
          content += `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px">
            <span>${p.marker} ${p.seriesName}:</span>
            <span style="font-weight:600;font-family:monospace">${p.value?.toLocaleString()} MW</span>
          </div>`;
        });
        return content;
      },
    },
    xAxis: {
      type: 'category',
      data: times,
      boundaryGap: false,
      axisLine: { lineStyle: { color: isDark ? '#334155' : '#cbd5e1' } },
      axisLabel: {
        color: isDark ? '#94a3b8' : '#64748b',
        fontSize: 10,
        interval: Math.floor(times.length / 6),
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
      axisLabel: {
        color: isDark ? '#94a3b8' : '#64748b',
        fontSize: 10,
        formatter: (v) => `${(v / 1000).toFixed(0)}k`,
      },
    },
    series: [
      {
        name: 'Actual Outturn',
        type: 'line',
        data: actuals,
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2, color: '#06b6d4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.25)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.0)' },
            ],
          },
        },
      },
      {
        name: 'Latest Forecast',
        type: 'line',
        data: forecasts,
        showSymbol: false,
        smooth: true,
        lineStyle: { width: 2, color: '#f59e0b', type: 'dashed' },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 180, width: '100%' }} />;
}
