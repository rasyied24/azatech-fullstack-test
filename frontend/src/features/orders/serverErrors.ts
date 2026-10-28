import type { UseFormSetError } from 'react-hook-form'
import type { ApiError } from '@/lib/api'
import type { OrderFormValues } from './schema'

// Key Laravel "items.1.quantity" memakai indeks yang sama dengan nama field RHF,
// jadi tidak perlu tabel konversi. Pesan umum (mis. "Stok tidak mencukupi")
// tampil sebagai banner di atas form.
export function applyOrderServerErrors(error: ApiError, setError: UseFormSetError<OrderFormValues>): void {
  const unmapped: string[] = []

  for (const [key, messages] of Object.entries(error.errors ?? {})) {
    const message = messages[0]
    if (!message) continue

    const itemMatch = /^items\.(\d+)\.(quantity|product_id)$/.exec(key)
    if (itemMatch) {
      const field = itemMatch[2] === 'product_id' ? 'product' : 'quantity'
      setError(`items.${Number(itemMatch[1])}.${field}`, { message })
    } else if (key === 'customer_id') {
      setError('customer', { message })
    } else {
      unmapped.push(message)
    }
  }

  const rootMessage = unmapped.length > 0 ? `${error.message}: ${unmapped.join(' ')}` : error.message
  setError('root', { message: rootMessage })
}