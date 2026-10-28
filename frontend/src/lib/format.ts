const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const JAKARTA_TZ = 'Asia/Jakarta'

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

// Server mengirim uang sebagai string ("12000.00"); selalu lewat fungsi ini.
export function toNumber(value: string | number | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function formatRupiah(value: string | number | null | undefined): string {
  return rupiahFormatter.format(toNumber(value))
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

// "1995-02-10" -> "10 Februari 1995"
export function formatDate(value: string | null | undefined): string {
  const date = parseDate(value)
  if (!date || !value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    // Tanggal tanpa jam diparse sebagai UTC, jadi diformat sebagai UTC
    // agar tidak bergeser sehari di zona waktu lain.
    timeZone: DATE_ONLY.test(value) ? 'UTC' : JAKARTA_TZ,
  }).format(date)
}

// "2026-10-28T13:21:00+07:00" -> "28 Oktober 2026 pukul 13.21"
export function formatDateTime(value: string | null | undefined): string {
  const date = parseDate(value)
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: JAKARTA_TZ,
  }).format(date)
}

export function todayIsoDate(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const numberFormatter = new Intl.NumberFormat('id-ID')

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}