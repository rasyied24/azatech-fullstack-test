import { apiGet } from '@/lib/api'

export interface TopProduct {
  product_id: number
  product_code: string
  product_name: string
  total_quantity: number
  total_revenue: string
}

export interface LowStockProduct {
  id: number
  product_code: string
  product_name: string
  stock: number
}

export interface DashboardSummary {
  total_orders: number
  total_sales: string
  top_products: TopProduct[]
  low_stock_threshold: number
  low_stock_products: LowStockProduct[]
}

export const getDashboardSummary = () => apiGet<DashboardSummary>('/dashboard/summary')