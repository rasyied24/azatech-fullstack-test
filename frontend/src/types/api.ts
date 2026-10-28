export interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: true
  message: string
  data: T
  meta?: PaginationMeta
}

export interface ApiErrorBody {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
}