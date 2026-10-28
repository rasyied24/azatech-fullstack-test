import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCustomer, deleteCustomer, listCustomers, updateCustomer } from './api'
import type { Customer, CustomerListParams, CustomerPayload } from './api'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params: CustomerListParams) => ['customers', 'list', params] as const,
}

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => listCustomers(params),
    placeholderData: keepPreviousData,
  })
}

export function useSaveCustomer(customer?: Customer) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CustomerPayload) =>
      customer ? updateCustomer(customer.id, payload) : createCustomer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  })
}