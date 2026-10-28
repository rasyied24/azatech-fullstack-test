import { apiDelete, apiList, apiPost, apiPut } from '@/lib/api'

export interface Product {
  id: number
  product_code: string
  product_name: string
  stock: number
  price: string // server mengirim string "12000.00"
  created_at: string
  updated_at: string
}

export interface ProductPayload {
  product_code: string
  product_name: string
  stock: number
  price: number
}

export type ProductSort = 'product_name' | '-product_name' | 'price' | '-price' | 'stock' | '-stock'

export interface ProductListParams {
  page: number
  per_page: number
  search?: string
  sort?: ProductSort
}

export const listProducts = (params: ProductListParams) =>
  // Nilai kosong/undefined tidak ikut dikirim sebagai query string.
  apiList<Product>('/products', { ...params, search: params.search || undefined })

export const createProduct = (payload: ProductPayload) => apiPost<Product>('/products', payload)

export const updateProduct = (id: number, payload: ProductPayload) =>
  apiPut<Product>(`/products/${id}`, payload)

export const deleteProduct = (id: number) => apiDelete(`/products/${id}`)