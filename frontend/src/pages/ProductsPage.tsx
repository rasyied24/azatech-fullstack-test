import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'
import { EmptyState, ErrorState, TableSkeletonRows } from '@/components/ListStates'
import Pagination from '@/components/Pagination'
import SearchInput from '@/components/SearchInput'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product, ProductSort } from '@/features/products/api'
import ProductFormDialog from '@/features/products/ProductFormDialog'
import { useDeleteProduct, useProducts } from '@/features/products/hooks'
import { LOW_STOCK_THRESHOLD, PAGE_SIZE } from '@/lib/constants'
import { getErrorMessage } from '@/lib/forms'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'

// Radix Select tidak mengizinkan value kosong, jadi "default" mewakili tanpa sort.
const SORT_OPTIONS = [
  { value: 'default', label: 'Urutan awal' },
  { value: 'product_name', label: 'Nama A–Z' },
  { value: '-product_name', label: 'Nama Z–A' },
  { value: 'price', label: 'Harga termurah' },
  { value: '-price', label: 'Harga termahal' },
  { value: 'stock', label: 'Stok tersedikit' },
  { value: '-stock', label: 'Stok terbanyak' },
]

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ProductSort | undefined>()
  const [formDialog, setFormDialog] = useState<{ product?: Product } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProducts({
    page,
    per_page: PAGE_SIZE,
    search,
    sort,
  })
  const remove = useDeleteProduct()

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await remove.mutateAsync(deleteTarget.id)
      toast.success(`Produk "${deleteTarget.product_name}" dihapus`)
      // Menghapus satu-satunya item di halaman terakhir: mundur satu halaman.
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
        <h1 className="text-2xl font-semibold">Produk</h1>
        <Button onClick={() => setFormDialog({})}>
          <Plus />
          Tambah Produk
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          placeholder="Cari nama atau kode produk"
          className="sm:max-w-sm"
          onSearch={(value) => {
            setSearch(value)
            setPage(1)
          }}
        />
        <Select
          value={sort ?? 'default'}
          onValueChange={(value) => {
            setSort(value === 'default' ? undefined : (value as ProductSort))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Urutkan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />
      ) : (
        <>
          <div className={cn('rounded-md border bg-background', isPlaceholderData && 'opacity-60')}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending && <TableSkeletonRows columns={5} />}
                {data?.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs">{product.product_code}</TableCell>
                    <TableCell className="font-medium">{product.product_name}</TableCell>
                    <TableCell>
                      {product.stock < LOW_STOCK_THRESHOLD ? (
                        <Badge variant="destructive">{product.stock}</Badge>
                      ) : (
                        product.stock
                      )}
                    </TableCell>
                    <TableCell className="text-right">{formatRupiah(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Edit ${product.product_name}`}
                          onClick={() => setFormDialog({ product })}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive"
                          aria-label={`Hapus ${product.product_name}`}
                          onClick={() => setDeleteTarget(product)}
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
                title={search ? `Tidak ada produk untuk "${search}"` : 'Belum ada produk'}
                description={
                  search ? 'Coba kata kunci lain.' : 'Klik "Tambah Produk" untuk membuat produk pertama.'
                }
              />
            )}
          </div>

          {data && data.meta.total > 0 && (
            <Pagination meta={data.meta} onPageChange={setPage} disabled={isPlaceholderData} />
          )}
        </>
      )}

      {formDialog && <ProductFormDialog product={formDialog.product} onClose={() => setFormDialog(null)} />}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !remove.isPending) setDeleteTarget(null)
        }}
        title="Hapus produk?"
        description={
          deleteTarget
            ? `Produk "${deleteTarget.product_name}" (${deleteTarget.product_code}) akan dihapus. Riwayat order yang memuat produk ini tetap tampil.`
            : ''
        }
        isPending={remove.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}