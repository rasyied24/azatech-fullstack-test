import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/lib/api'

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Terjadi kesalahan tak terduga'
}

// 422: pesan server ditempel ke field yang cocok. Selain itu (409, 500, jaringan,
// atau key yang tidak dikenal): tampil sebagai pesan umum di atas form.
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): void {
  if (!(error instanceof ApiError)) {
    setError('root', { message: getErrorMessage(error) })
    return
  }

  let matched = false
  if (error.status === 422 && error.errors) {
    for (const field of fields) {
      const message = error.errors[field]?.[0]
      if (message) {
        setError(field, { message })
        matched = true
      }
    }
  }

  if (!matched) setError('root', { message: error.message })
}