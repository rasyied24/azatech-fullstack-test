import { Link } from 'react-router-dom'
import { Banknote, PackageCheck, ReceiptText, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/ListStates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DashboardSummary } from '@/features/dashboard/api'
import { useDashboardSummary } from '@/features/dashboard/hooks'
import { useAuth } from '@/features/auth/auth-context'
import { getErrorMessage } from '@/lib/forms'
import { formatNumber, formatRupiah } from '@/lib/format'

function StatCard({
  title,
  value,
  caption,
  icon: Icon,
}: {
  title: string
  value: string
  caption: string
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Memuat">
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

function DashboardContent({ data }: { data: DashboardSummary }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Total Transaksi"
          value={formatNumber(data.total_orders)}
          caption="Semua waktu"
          icon={ReceiptText}
        />
        <StatCard
          title="Total Penjualan"
          value={formatRupiah(data.total_sales)}
          caption="Semua waktu"
          icon={Banknote}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {data.top_products.length === 0 ? (
              <EmptyState title="Belum ada penjualan" description="Produk terlaris muncul setelah ada order." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Terjual</TableHead>
                    <TableHead className="text-right">Pendapatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.top_products.map((product, index) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <p className="font-medium">
                          {index + 1}. {product.product_name}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">{product.product_code}</p>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(product.total_quantity)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(product.total_revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                {data.low_stock_products.length > 0 && <TriangleAlert className="size-4 text-amber-600" />}
                Stok Menipis
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Produk dengan stok kurang dari {data.low_stock_threshold}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/products">Kelola produk</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.low_stock_products.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <PackageCheck className="size-10 text-green-600" />
                <p className="font-medium">Semua stok aman</p>
                <p className="text-sm text-muted-foreground">Tidak ada produk yang perlu diisi ulang.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {data.low_stock_products.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.product_name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{product.product_code}</p>
                    </div>
                    {product.stock <= 0 ? (
                      <Badge variant="destructive">Habis</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Sisa {product.stock}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isPending, isError, error, refetch } = useDashboardSummary()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, {user?.name}.</p>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : isPending ? (
        <DashboardSkeleton />
      ) : (
        <DashboardContent data={data} />
      )}
    </div>
  )
}