import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, deleteProduct, listProducts, updateProduct } from './api'
import type { Product, ProductListParams, ProductPayload } from './api'

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductListParams) => ['products', 'list', params] as const,
}

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    placeholderData: keepPreviousData,
  })
}

// Satu hook untuk tambah dan edit: kalau `product` ada berarti edit.
export function useSaveProduct(product?: Product) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductPayload) =>
      product ? updateProduct(product.id, payload) : createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    // onSettled (bukan onSuccess): kalau 404 karena sudah terhapus, daftar tetap disegarkan.
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.all }),
  })
}