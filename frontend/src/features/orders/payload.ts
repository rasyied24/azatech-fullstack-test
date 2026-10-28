import type { OrderPayload } from './api'
import type { OrderFormValues } from './schema'

// Tidak pernah membuang baris diam-diam: baris kosong akan menggeser indeks dan
// membuat error server (items.N) menempel di baris yang salah. Zod sudah memastikan
// tidak ada baris kosong; null di sini hanya pengaman tipe.
export function buildOrderPayload(values: OrderFormValues): OrderPayload | null {
  if (!values.customer) return null

  const items: OrderPayload['items'] = []
  for (const item of values.items) {
    if (!item.product) return null
    items.push({ product_id: item.product.id, quantity: Number(item.quantity) })
  }

  return { customer_id: values.customer.id, items }
}