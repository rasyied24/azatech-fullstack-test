import { useAuth } from '@/features/auth/auth-context'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Selamat datang, {user?.name}. Ringkasan penjualan akan dibuat di F5.
      </p>
    </div>
  )
}