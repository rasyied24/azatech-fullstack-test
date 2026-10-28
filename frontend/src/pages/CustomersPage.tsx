import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'
import { EmptyState, ErrorState, TableSkeletonRows } from '@/components/ListStates'
import Pagination from '@/components/Pagination'
import SearchInput from '@/components/SearchInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Customer } from '@/features/customers/api'
import CustomerFormDialog from '@/features/customers/CustomerFormDialog'
import { useCustomers, useDeleteCustomer } from '@/features/customers/hooks'
import { PAGE_SIZE } from '@/lib/constants'
import { getErrorMessage } from '@/lib/forms'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formDialog, setFormDialog] = useState<{ customer?: Customer } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useCustomers({
    page,
    per_page: PAGE_SIZE,
    search,
  })
  const remove = useDeleteCustomer()

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(`Pelanggan "${deleteTarget.customer_name}" dihapus`)
      if (data && data.items.length === 1 && page > 1) setPage(page - 1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Pelanggan</h1>
        <Button onClick={() => setFormDialog({})}>
          <Plus />
          Tambah Pelanggan
        </Button>
      </div>

      <SearchInput
        placeholder="Cari nama pelanggan"
        className="sm:max-w-sm"
        onSearch={(value) => {
          setSearch(value)
          setPage(1)
        }}
      />

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className={cn('rounded-md border bg-background', isPlaceholderData && 'opacity-60')}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="hidden lg:table-cell">Alamat</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Tanggal Lahir</TableHead>
                  <TableHead>No. HP</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && <TableSkeletonRows columns={6} />}
                {data?.items.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.customer_name}</TableCell>
                    <TableCell className="hidden max-w-xs truncate lg:table-cell" title={customer.customer_address}>
                      {customer.customer_address}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{customer.gender}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(customer.birth_date)}</TableCell>
                    <TableCell>{customer.phone ?? '-'}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Edit ${customer.customer_name}`}
                          onClick={() => setFormDialog({ customer })}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          aria-label={`Hapus ${customer.customer_name}`}
                          onClick={() => setDeleteTarget(customer)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {data && data.items.length === 0 && (
              <EmptyState
                title={search ? `Tidak ada pelanggan untuk "${search}"` : 'Belum ada pelanggan'}
                description={
                  search
                    ? 'Coba kata kunci lain.'
                    : 'Klik "Tambah Pelanggan" untuk membuat pelanggan pertama.'
                }
              />
            )}
          </div>

          {data && data.meta.total > 0 && (
            <Pagination meta={data.meta} onPageChange={setPage} disabled={isPlaceholderData} />
          )}
        </>
      )}

      {formDialog && (
        <CustomerFormDialog customer={formDialog.customer} onClose={() => setFormDialog(null)} />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleteTarget(null)
        }}
        title="Hapus pelanggan?"
        description={
          deleteTarget
            ? `Pelanggan "${deleteTarget.customer_name}" akan dihapus. Riwayat order pelanggan ini tetap tampil.`
            : ''
        }
        isPending={remove.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}