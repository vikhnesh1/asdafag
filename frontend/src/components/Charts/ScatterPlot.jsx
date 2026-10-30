import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../context/ThemeContext';

export function ScatterPlot({ data = [], height = 320 }) {
  const { isDark } = useTheme();

  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Sample every 2nd point for scatter rendering performance
    return data.map((d) => [d.forecast_mw, d.actual_mw]);
  }, [data]);

  const maxVal = 20000;

  const option = {
    title: {
      text: 'Forecast vs Actual Correlation',
      left: 10,
      top: 5,
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 14, fontWeight: 600 },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#cbd5e1',
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
      formatter: (params) => {
        const [fc, act] = params.value;
        const diff = fc - act;
        return `
          <div style="font-size:12px">
            <div><b>Forecast:</b> ${fc?.toLocaleString()} MW</div>
            <div><b>Actual:</b> ${act?.toLocaleString()} MW</div>
            <div><b>Error:</b> ${diff >= 0 ? '+' : ''}${diff?.toLocaleString()} MW</div>
          </div>
        `;
      },
    },
    grid: { top: 45, left: 55, right: 25, bottom: 40 },
    xAxis: {
      type: 'value',
      name: 'Forecast (MW)',
      nameLocation: 'middle',
      nameGap: 24,
      nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
      min: 0,
      max: maxVal,
      splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
      axisLabel: {
        color: isDark ? '#94a3b8' : '#64748b',
        formatter: (v) => `${v / 1000}k`,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Actual (MW)',
      nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
      min: 0,
      max: maxVal,
      splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
      axisLabel: {
        color: isDark ? '#94a3b8' : '#64748b',
        formatter: (v) => `${v / 1000}k`,
      },
    },
    series: [
      {
        type: 'scatter',
        data: points,
        symbolSize: 5,
        itemStyle: {
          color: 'rgba(6, 182, 212, 0.65)',
        },
      },
      {
        type: 'line',
        data: [[0, 0], [maxVal, maxVal]],
        showSymbol: false,
        lineStyle: {
          color: '#f59e0b',
          type: 'dashed',
          width: 1.5,
        },
        tooltip: { show: false },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
