import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ApiError, setUnauthorizedHandler } from '@/lib/api'
import { clearToken, getToken, setToken } from '@/lib/token'
import { fetchMe, loginRequest, logoutRequest } from './api'
import type { AuthUser, LoginPayload } from './api'
import { AuthContext } from './auth-context'
import type { AuthContextValue, AuthStatus } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<AuthUser | null>(null)
  // Ada token = perlu divalidasi dulu; tidak ada token = pasti belum login.
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? 'loading' : 'unauthenticated',
  )
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    // Dipanggil interceptor saat ada 401 di endpoint selain login.
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('unauthenticated')
      setSessionExpired(true)
      queryClient.clear()
    })

    let cancelled = false

    if (getToken()) {
      fetchMe()
        .then((me) => {
          if (cancelled) return
          setUser(me)
          setStatus('authenticated')
        })
        .catch((error: unknown) => {
          // 401 sudah ditangani handler di atas. Error lain (jaringan/500):
          // tampilkan halaman login tanpa menghapus token.
          if (cancelled) return
          if (!(error instanceof ApiError && error.status === 401)) {
            setStatus('unauthenticated')
          }
        })
    }

    return () => {
      cancelled = true
      setUnauthorizedHandler(null)
    }
  }, [queryClient])

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await loginRequest(payload)
      setToken(data.token)
      queryClient.clear()
      setUser(data.user)
      setSessionExpired(false)
      setStatus('authenticated')
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Token mungkin sudah kedaluwarsa; user tetap harus bisa keluar.
    } finally {
      clearToken()
      queryClient.clear()
      setUser(null)
      setStatus('unauthenticated')
      // Reset: 401 saat logout tidak boleh dianggap "sesi berakhir".
      setSessionExpired(false)
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, sessionExpired, login, logout }),
    [user, status, sessionExpired, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}