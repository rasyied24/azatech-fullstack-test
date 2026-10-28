import { formatRupiah, toNumber } from '@/lib/format'

// Uang dihitung dalam sen (bilangan bulat) agar tidak terkena galat desimal
// floating-point (mis. 0.1 * 3 = 0.30000000000000004).
export function toCents(value: string | number): number {
  return Math.round(toNumber(value) * 100)
}

export function lineSubtotalCents(price: string | number, quantity: string): number {
  const qty = /^\d+$/.test(quantity.trim()) ? Number(quantity) : 0
  return toCents(price) * qty
}

export function centsToRupiah(cents: number): string {
  return formatRupiah(cents / 100)
}