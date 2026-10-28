import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '@/features/products/hooks'
import { createOrder } from './api'

export const orderKeys = {
  all: ['orders'] as const,
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      // Riwayat order dan dashboard sekarang basi. `void` agar mutation tidak
      // menunggu refetch selesai sebelum toast sukses tampil.
      void queryClient.invalidateQueries({ queryKey: orderKeys.all })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    // Sukses maupun gagal (409), stok di server bisa sudah berubah: segarkan produk.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}