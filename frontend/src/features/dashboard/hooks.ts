import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from './api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: ['dashboard', 'summary'] as const,
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: getDashboardSummary,
    // Angka dashboard harus selalu terbaru saat halaman dibuka.
    staleTime: 0,
  })
}