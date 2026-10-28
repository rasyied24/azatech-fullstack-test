import { useState } from 'react'
import AsyncCombobox from '@/components/AsyncCombobox'
import { useProducts } from '@/features/products/hooks'
import { getErrorMessage } from '@/lib/forms'
import { formatRupiah } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProductOption } from './schema'

interface ProductComboboxProps {
  id?: string
  value: ProductOption | null
  onChange: (product: ProductOption) => void
  takenIds: number[] // produk yang sudah dipilih di baris lain
  invalid?: boolean
}

export default function ProductCombobox({ id, value, onChange, takenIds, invalid }: ProductComboboxProps) {
  const [search, setSearch] = useState('')
  const { data, isPending, isError, error } = useProducts({ page: 1, per_page: 20, search })

  return (
    <AsyncCombobox<ProductOption>
      id={id}
      value={value}
      onChange={onChange}
      items={data?.items ?? []}
      isLoading={isPending}
      errorMessage={isError ? getErrorMessage(error) : undefined}
      onSearchChange={setSearch}
      getKey={(product) => product.id}
      getLabel={(product) => `${product.product_code} · ${product.product_name}`}
      isItemDisabled={(product) => product.stock <= 0 || takenIds.includes(product.id)}
      renderItem={(product) => {
        const taken = takenIds.includes(product.id)
        const soldOut = product.stock <= 0
        return (
          <div className="flex w-full items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate">{product.product_name}</p>
              <p className="text-xs text-muted-foreground">
                {product.product_code} · {formatRupiah(product.price)}
              </p>
            </div>
            <span className={cn('shrink-0 text-xs', soldOut ? 'text-destructive' : 'text-muted-foreground')}>
              {soldOut ? 'Habis' : taken ? 'Sudah dipilih' : `Stok ${product.stock}`}
            </span>
          </div>
        )
      }}
      placeholder="Pilih produk"
      searchPlaceholder="Cari nama atau kode produk..."
      emptyText="Produk tidak ditemukan"
      invalid={invalid}
    />
  )
}