import { apiGet, apiPost } from '@/lib/api'

export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface LoginPayload {
  email: string
  password: string
}

interface LoginData {
  token: string
  token_type: 'Bearer'
  user: AuthUser
}

export const loginRequest = (payload: LoginPayload) =>
  apiPost<LoginData>('/auth/login', payload)

export const logoutRequest = () => apiPost<null>('/auth/logout')

export const fetchMe = () => apiGet<AuthUser>('/auth/me')