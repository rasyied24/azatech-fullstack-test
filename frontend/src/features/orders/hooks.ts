import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '@/features/products/hooks'
import { createOrder, getOrder, listOrders } from './api'
import type { OrderListParams } from './api'
import { dashboardKeys } from '@/features/dashboard/hooks'

export const orderKeys = {
  all: ['orders'] as const,
  list: (params: OrderListParams) => ['orders', 'list', params] as const,
  detail: (id: number) => ['orders', 'detail', id] as const,
}

export function useOrders(params: OrderListParams, enabled = true) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => listOrders(params),
    placeholderData: keepPreviousData,
    enabled,
  })
}

// id <= 0 berarti tidak valid: query tidak dijalankan sama sekali.
export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled: id > 0,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}