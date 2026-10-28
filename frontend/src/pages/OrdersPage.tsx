import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { EmptyState, ErrorState, TableSkeletonRows } from '@/components/ListStates'
import Pagination from '@/components/Pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useOrders } from '@/features/orders/hooks'
import { PAGE_SIZE } from '@/lib/constants'
import { getErrorMessage } from '@/lib/forms'
import { formatDateTime, formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Format YYYY-MM-DD bisa dibandingkan sebagai string.
  const rangeInvalid = from !== '' && to !== '' && to < from
  const hasFilter = from !== '' || to !== ''

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useOrders(
    { page, per_page: PAGE_SIZE, from, to },
    !rangeInvalid,
  )

  function resetFilter() {
    setFrom('')
    setTo('')
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Riwayat Order</h1>
        <Button asChild>
          <Link to="/orders/new">
            <Plus />
            Buat Order
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="filter-from">Dari tanggal</Label>
          <Input
            id="filter-from"
            type="date"
            className="sm:w-44"
            value={from}
            max={to || undefined}
            onChange={(event) => {
              setFrom(event.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filter-to">Sampai tanggal</Label>
          <Input
            id="filter-to"
            type="date"
            className="sm:w-44"
            value={to}
            min={from || undefined}
            onChange={(event) => {
              setTo(event.target.value)
              setPage(1)
            }}
          />
        </div>
        {hasFilter && (
          <Button variant="outline" onClick={resetFilter}>
            Reset
          </Button>
        )}
      </div>

      {rangeInvalid ? (
        <Alert variant="destructive">
          <AlertDescription>Tanggal "Sampai" tidak boleh lebih awal dari tanggal "Dari".</AlertDescription>
        </Alert>
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className={cn('rounded-md border bg-background', isPlaceholderData && 'opacity-60')}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Order</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="hidden md:table-cell">Item</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && <TableSkeletonRows columns={6} />}
                {data?.items.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      <Link to={`/orders/${order.id}`} className="font-medium hover:underline">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(order.order_date)}</TableCell>
                    <TableCell>{order.customer.customer_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{order.items_count}</TableCell>
                    <TableCell className="text-right">{formatRupiah(order.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/orders/${order.id}`}>Detail</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data && data.items.length === 0 && (
              <EmptyState
                title={hasFilter ? 'Tidak ada order pada rentang tanggal ini' : 'Belum ada order'}
                description={
                  hasFilter ? 'Ubah atau reset filter tanggal.' : 'Order yang dibuat akan muncul di sini.'
                }
              />
            )}
          </div>

          {data && data.meta.total > 0 && (
            <Pagination meta={data.meta} onPageChange={setPage} disabled={isPlaceholderData} />
          )}
        </>
      )}
    </div>
  )
}