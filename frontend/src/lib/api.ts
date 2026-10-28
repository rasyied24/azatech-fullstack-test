import axios, { isAxiosError } from 'axios'
import type { ApiErrorBody, ApiResponse, Paginated } from '@/types/api'
import { clearToken, getToken } from '@/lib/token'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Diisi oleh AuthProvider di F1, supaya api.ts tidak perlu mengimpor router.
let unauthorizedHandler: (() => void) | null = null
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosError<ApiErrorBody>(error)) return Promise.reject(error)

    if (!error.response) {
      return Promise.reject(new ApiError(0, 'Tidak dapat terhubung ke server'))
    }

    const { status, data } = error.response
    const isLoginRequest = error.config?.url === '/auth/login'

    if (status === 401 && !isLoginRequest) {
      clearToken()
      unauthorizedHandler?.()
    }

    return Promise.reject(
      new ApiError(status, data?.message ?? 'Terjadi kesalahan pada server', data?.errors),
    )
  },
)

export async function apiGet<T>(url: string, params?: object): Promise<T> {
  const res = await http.get<ApiResponse<T>>(url, { params })
  return res.data.data
}

export async function apiList<T>(url: string, params?: object): Promise<Paginated<T>> {
  const res = await http.get<ApiResponse<T[]>>(url, { params })
  return { items: res.data.data, meta: res.data.meta! }
}

export async function apiPost<T>(url: string, body?: object): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, body)
  return res.data.data
}

export async function apiPut<T>(url: string, body?: object): Promise<T> {
  const res = await http.put<ApiResponse<T>>(url, body)
  return res.data.data
}

// DELETE mengembalikan 204 tanpa body, jadi tidak ada yang di-parse.
export async function apiDelete(url: string): Promise<void> {
  await http.delete(url)
}