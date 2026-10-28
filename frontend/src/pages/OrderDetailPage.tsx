import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { EmptyState, ErrorState } from '@/components/ListStates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrder } from '@/features/orders/hooks'
import { ApiError } from '@/lib/api'
import { getErrorMessage } from '@/lib/forms'
import { formatDateTime, formatRupiah } from '@/lib/format'

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const validId = Number.isInteger(id) && id > 0

  // id tidak valid: query tidak jalan (enabled = id > 0), tidak ada request ke server.
  const { data: order, isPending, isError, error, refetch } = useOrder(validId ? id : 0)

  const notFound = !validId || (error instanceof ApiError && error.status === 404)

  const backButton = (
    <Button asChild variant="outline" size="sm">
      <Link to="/orders">
        <ArrowLeft />
        Kembali
      </Link>
    </Button>
  )

  if (notFound) {
    return (
      <div className="space-y-4">
        {backButton}
        <div className="rounded-md border bg-background">
          <EmptyState
            title="Order tidak ditemukan"
            description="Order yang Anda cari tidak ada atau alamatnya salah."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {backButton}
        <h1 className="text-2xl font-semibold">{order ? order.order_number : 'Detail Order'}</h1>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : isPending ? (
        <div className="space-y-4" role="status" aria-label="Memuat">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Tanggal order" value={formatDateTime(order.order_date)} />
              <Info label="Pelanggan" value={order.customer.customer_name} />
              <Info label="Dibuat oleh" value={order.created_by.name} />
              <Info label="Jumlah produk" value={`${order.items.length} item`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rincian produk</CardTitle>
              <p className="text-sm text-muted-foreground">
                Harga satuan adalah harga saat transaksi dibuat, bukan harga produk saat ini.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Harga satuan</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.product.product_code}</TableCell>
                      <TableCell className="font-medium">{item.product.product_name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.unit_price)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">
                      Total
                    </TableCell>
                    <TableCell className="text-right text-base font-semibold">
                      {formatRupiah(order.total_amount)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}