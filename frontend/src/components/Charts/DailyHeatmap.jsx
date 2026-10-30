import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../context/ThemeContext';

export function DailyHeatmap({ data = [], height = 320 }) {
  const { isDark } = useTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    const days = data.map((d) => d.date.slice(5)); // '01-15'
    const maes = data.map((d) => d.mae);
    const biases = data.map((d) => d.bias);

    return { days, maes, biases };
  }, [data]);

  if (!chartData) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No daily metrics available</div>;
  }

  const option = {
    title: {
      text: 'Daily Mean Absolute Error (Jan 1 - 31)',
      left: 10,
      top: 5,
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 14, fontWeight: 600 },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#cbd5e1',
      textStyle: { color: isDark ? '#f8fafc' : '#0f172a' },
      formatter: (params) => {
        const index = params[0].dataIndex;
        const d = data[index];
        return `
          <div style="font-size:12px">
            <div><b>Date:</b> ${d.date}</div>
            <div><b>MAE:</b> ${d.mae?.toLocaleString()} MW</div>
            <div><b>RMSE:</b> ${d.rmse?.toLocaleString()} MW</div>
            <div><b>Bias:</b> ${d.bias >= 0 ? '+' : ''}${d.bias?.toLocaleString()} MW</div>
          </div>
        `;
      },
    },
    grid: { top: 45, left: 45, right: 20, bottom: 35 },
    xAxis: {
      type: 'category',
      data: chartData.days,
      axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10, interval: 2 },
      axisLine: { lineStyle: { color: isDark ? '#334155' : '#cbd5e1' } },
    },
    yAxis: {
      type: 'value',
      name: 'MAE (MW)',
      nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
      axisLabel: {
        color: isDark ? '#94a3b8' : '#64748b',
        fontSize: 10,
        formatter: (v) => `${(v / 1000).toFixed(1)}k`,
      },
    },
    series: [
      {
        name: 'Daily MAE',
        type: 'bar',
        data: chartData.maes,
        itemStyle: {
          color: (params) => {
            const val = params.value;
            if (val > 2500) return '#f43f5e';
            if (val > 1500) return '#f59e0b';
            return '#06b6d4';
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
