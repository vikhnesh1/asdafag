import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AppLayout } from './components/Layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ForecastComparison } from './pages/ForecastComparison';
import { AccuracyAnalytics } from './pages/AccuracyAnalytics';
import { DayAheadView } from './pages/DayAheadView';
import { DataExplorer } from './pages/DataExplorer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
    },
  },
});

function AppWithAntdTheme() {
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#06b6d4',
          fontFamily: "'Inter', sans-serif",
          borderRadius: 8,
          colorBgContainer: isDark ? 'rgba(19, 29, 51, 0.75)' : '#ffffff',
          colorBgElevated: isDark ? '#0f172a' : '#ffffff',
          colorBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="forecast-comparison" element={<ForecastComparison />} />
            <Route path="accuracy" element={<AccuracyAnalytics />} />
            <Route path="day-ahead" element={<DayAheadView />} />
            <Route path="data" element={<DataExplorer />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppWithAntdTheme />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
