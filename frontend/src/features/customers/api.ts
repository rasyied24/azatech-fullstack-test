import { apiDelete, apiList, apiPost, apiPut } from '@/lib/api'

export const GENDERS = ['Pria', 'Wanita'] as const
export type Gender = (typeof GENDERS)[number]

export interface Customer {
  id: string // UUID
  customer_name: string
  customer_address: string
  gender: Gender
  birth_date: string // "YYYY-MM-DD"
  phone: string | null
  created_at: string
  updated_at: string
}

export interface CustomerPayload {
  customer_name: string
  customer_address: string
  gender: Gender
  birth_date: string
  phone: string | null
}

export interface CustomerListParams {
  page: number
  per_page: number
  search?: string
}

export const listCustomers = (params: CustomerListParams) =>
  apiList<Customer>('/customers', { ...params, search: params.search || undefined })

export const createCustomer = (payload: CustomerPayload) =>
  apiPost<Customer>('/customers', payload)

export const updateCustomer = (id: string, payload: CustomerPayload) =>
  apiPut<Customer>(`/customers/${id}`, payload)

export const deleteCustomer = (id: string) => apiDelete(`/customers/${id}`)