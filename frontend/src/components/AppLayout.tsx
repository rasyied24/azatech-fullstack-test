import { Suspense, useState } from 'react'
import { LoaderCircle, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { cn } from '@/lib/utils'

// Menu ditambah per fase (produk, pelanggan, order) saat halamannya sudah ada.
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Produk', end: false },
  { to: '/customers', label: 'Pelanggan', end: false },
  { to: '/orders/new', label: 'Buat Order', end: false },
  { to: '/orders', label: 'Riwayat Order', end: true },
]

function ContentSpinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="Memuat">
      <LoaderCircle className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
          <span className="text-lg font-semibold">Azatech Shop</span>

          <nav className="order-last flex w-full gap-1 overflow-x-auto md:order-none md:w-auto md:flex-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => void handleLogout()} disabled={isLoggingOut}>
                {isLoggingOut ? <LoaderCircle className="animate-spin" /> : <LogOut />}
                {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<ContentSpinner />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}