import { apiPost } from '@/lib/api'

export interface OrderPayload {
  customer_id: string
  items: { product_id: number; quantity: number }[]
}

export interface OrderListItem {
  id: number
  order_number: string
  order_date: string
  total_amount: string
  customer: { id: string; customer_name: string }
  items_count: number
}

export interface OrderItem {
  id: number
  product_id: number
  product: { product_code: string; product_name: string }
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order extends OrderListItem {
  created_by: { id: number; name: string }
  items: OrderItem[]
}

export const createOrder = (payload: OrderPayload) => apiPost<Order>('/orders', payload)