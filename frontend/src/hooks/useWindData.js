import { useQuery } from '@tanstack/react-query';
import { fetchJson } from '../api/client';

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => fetchJson('/api/overview'),
    staleTime: Infinity,
  });
}

export function useActuals(start, end) {
  return useQuery({
    queryKey: ['actuals', start, end],
    queryFn: () => fetchJson('/api/actuals', { start, end }),
    staleTime: Infinity,
  });
}

export function useForecasts(start, end) {
  return useQuery({
    queryKey: ['forecasts', start, end],
    queryFn: () => fetchJson('/api/forecasts', { start, end }),
    staleTime: Infinity,
  });
}

export function useForecastVsActual(start, end) {
  return useQuery({
    queryKey: ['forecast-vs-actual', start, end],
    queryFn: () => fetchJson('/api/forecast-vs-actual', { start, end }),
    staleTime: Infinity,
  });
}

export function useAccuracyMetrics(start, end) {
  return useQuery({
    queryKey: ['accuracy-metrics', start, end],
    queryFn: () => fetchJson('/api/accuracy-metrics', { start, end }),
    staleTime: Infinity,
  });
}

export function useDailyMetrics(start, end) {
  return useQuery({
    queryKey: ['daily-metrics', start, end],
    queryFn: () => fetchJson('/api/accuracy-metrics/daily', { start, end }),
    staleTime: Infinity,
  });
}

export function useDayAheadView(deliveryDate) {
  return useQuery({
    queryKey: ['day-ahead-view', deliveryDate],
    queryFn: () => fetchJson('/api/day-ahead-view', { deliveryDate }),
    staleTime: Infinity,
    enabled: !!deliveryDate,
  });
}
