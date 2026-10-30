import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../context/ThemeContext';

export function ErrorHistogram({ data = [], height = 320 }) {
  const { isDark } = useTheme();

  const histogramData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Bin errors into 500 MW intervals from -6000 to +8000
    const binSize = 500;
    const minBin = -6000;
    const maxBin = 8000;
    const numBins = Math.floor((maxBin - minBin) / binSize);
    const bins = new Array(numBins).fill(0);
    const binLabels = [];

    for (let i = 0; i < numBins; i++) {
      const start = minBin + i * binSize;
      const end = start + binSize;
      binLabels.push(`${start >= 0 ? '+' : ''}${start / 1000}k`);
    }

    data.forEach((d) => {
      const err = d.error_mw;
      const binIdx = Math.floor((err - minBin) / binSize);
      if (binIdx >= 0 && binIdx < numBins) {
        bins[binIdx]++;
      }
    });

    return { bins, binLabels };
  }, [data]);

  if (!histogramData) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>;
  }

  const option = {
    title: {
      text: 'Forecast Error Distribution (MW)',
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
        const p = params[0];
        return `<b>Bin ${p.name} MW</b>: ${p.value} settlement periods`;
      },
    },
    grid: { top: 45, left: 45, right: 20, bottom: 35 },
    xAxis: {
      type: 'category',
      data: histogramData.binLabels,
      axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10, interval: 2 },
      axisLine: { lineStyle: { color: isDark ? '#334155' : '#cbd5e1' } },
    },
    yAxis: {
      type: 'value',
      name: 'Count',
      nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
      splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9' } },
      axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 },
    },
    series: [
      {
        type: 'bar',
        data: histogramData.bins,
        itemStyle: {
          color: (params) => {
            const label = histogramData.binLabels[params.dataIndex];
            return label.startsWith('-') ? '#10b981' : '#f43f5e';
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height, width: '100%' }} />;
}
