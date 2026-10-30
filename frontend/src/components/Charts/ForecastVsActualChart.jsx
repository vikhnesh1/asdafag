import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../context/ThemeContext';

export function ForecastVsActualChart({ data = [], height = 480, title = 'Forecast vs Actual Wind Generation' }) {
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const times = [];
    const actuals = [];
    const forecasts = [];
    const errors = [];
    const publishTimes = [];

    data.forEach((d) => {
      times.push(d.start_time.replace('T', ' ').slice(0, 16));
      actuals.push(d.actual_mw);
      forecasts.push(d.forecast_mw);
      errors.push(d.error_mw);
      publishTimes.push(d.publish_time ? d.publish_time.replace('T', ' ').slice(0, 16) : '—');
    });

    return { times, actuals, forecasts, errors, publishTimes };
  }, [data]);

  if (!chartData) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No data available for chart.
      </div>
    );
  }

  const option = {
    title: {
      text: title,
      left: 10,
      top: 5,
      textStyle: {
        color: isDark ? '#f8fafc' : '#0f172a',
        fontSize: 15,
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
      },
    },
    legend: {
      data: ['Actual Outturn', 'Wind Forecast', 'Forecast Delta (Error)'],
      right: 20,
      top: 5,
      textStyle: { color: isDark ? '#94a3b8' : '#475569' },
    },
    grid: {
      top: 55,
      left: 55,
      right: 40,
      bottom: 80,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#cbd5e1',
      borderWidth: 1,
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
      formatter: (params) => {
        if (!params || params.length === 0) return '';
        const index = params[0].dataIndex;
        const time = chartData.times[index];
        const pub = chartData.publishTimes[index];
        const act = chartData.actuals[index];
        const fc = chartData.forecasts[index];
        const err = chartData.errors[index];

        return `
          <div style="font-family:Inter,sans-serif;min-width:210px">
            <div style="font-weight:700;font-size:13px;border-bottom:1px solid ${isDark ? '#334155' : '#e2e8f0'};padding-bottom:4px;margin-bottom:6px">
              ${time} UTC
            </div>
            <div style="display:flex;justify-content:space-between;margin:3px 0;font-size:12px">
              <span style="color:#06b6d4;font-weight:600">● Actual Outturn:</span>
              <span style="font-family:monospace;font-weight:700">${act?.toLocaleString()} MW</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:3px 0;font-size:12px">
              <span style="color:#f59e0b;font-weight:600">● Forecast:</span>
              <span style="font-family:monospace;font-weight:700">${fc?.toLocaleString()} MW</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin:3px 0;font-size:12px">
              <span style="color:${err >= 0 ? '#f43f5e' : '#10b981'};font-weight:600">● Error:</span>
              <span style="font-family:monospace;font-weight:700;color:${err >= 0 ? '#f43f5e' : '#10b981'}">
                ${err >= 0 ? '+' : ''}${err?.toLocaleString()} MW
              </span>
            </div>
            <div style="font-size:10px;color:${isDark ? '#64748b' : '#94a3b8'};margin-top:6px;border-top:1px dashed ${isDark ? '#1e293b' : '#e2e8f0'};padding-top:4px">
              Published: ${pub} UTC
            </div>
          </div>
        `;
      },
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        bottom: 10,
        start: 0,
        end: 35, // default focus on first 10 days
        borderColor: isDark ? '#334155' : '#cbd5e1',
        textStyle: { color: isDark ? '#94a3b8' : '#64748b' },
        fillerColor: 'rgba(6, 182, 212, 0.15)',
        handleStyle: { color: '#06b6d4' },
      },
      {
        type: 'inside',
      },
    ],
    xAxis: {
      type: 'category',
      data: chartData.times,
      boundaryGap: false,
      axisLine: { lineStyle: { color: isDark ? '#334155' : '#cbd5e1' } },
      axisLabel: {
        color: isDark ? '#94a3b8' : '#64748b',
        fontSize: 11,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Generation (MW)',
        nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
        axisLabel: {
          color: isDark ? '#94a3b8' : '#64748b',
          formatter: (v) => `${(v / 1000).toFixed(0)}k`,
        },
      },
      {
        type: 'value',
        name: 'Error (MW)',
        show: false,
      },
    ],
    series: [
      {
        name: 'Actual Outturn',
        type: 'line',
        data: chartData.actuals,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#06b6d4' },
        itemStyle: { color: '#06b6d4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.2)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.0)' },
            ],
          },
        },
      },
      {
        name: 'Wind Forecast',
        type: 'line',
        data: chartData.forecasts,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#f59e0b', type: 'solid' },
        itemStyle: { color: '#f59e0b' },
      },
      {
        name: 'Forecast Delta (Error)',
        type: 'bar',
        data: chartData.errors,
        yAxisIndex: 0,
        itemStyle: {
          color: (params) => (params.value >= 0 ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'),
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
