import { Trash2 } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import FormField from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatRupiah } from '@/lib/format'
import { centsToRupiah, lineSubtotalCents } from './calc'
import ProductCombobox from './ProductCombobox'
import type { OrderFormValues } from './schema'

interface OrderItemRowProps {
  index: number
  canRemove: boolean
  onRemove: () => void
}

function ReadOnlyField({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <p className={strong ? 'flex h-9 items-center font-semibold' : 'flex h-9 items-center'}>{value}</p>
    </div>
  )
}

export default function OrderItemRow({ index, canRemove, onRemove }: OrderItemRowProps) {
  const {
    control,
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<OrderFormValues>()

  const items = useWatch({ control, name: 'items' })
  const current = items?.[index]
  const product = current?.product ?? null
  const quantity = current?.quantity ?? ''

  const takenIds = (items ?? []).flatMap((item, i) => (i !== index && item.product ? [item.product.id] : []))
  const rowErrors = errors.items?.[index]

  const subtotal = product ? lineSubtotalCents(product.price, quantity) : 0
  const exceedsStock = product !== null && /^\d+$/.test(quantity.trim()) && Number(quantity) > product.stock

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_7rem_9rem_9rem_auto]">
        <FormField id={`items-${index}-product`} label="Produk" error={rowErrors?.product?.message}>
          <Controller
            control={control}
            name={`items.${index}.product`}
            render={({ field }) => (
              <ProductCombobox
                id={`items-${index}-product`}
                value={field.value}
                takenIds={takenIds}
                invalid={!!rowErrors?.product}
                onChange={(selected) => {
                  field.onChange(selected)
                  // Pesan stok lama milik produk sebelumnya tidak berlaku lagi.
                  clearErrors(`items.${index}.quantity`)
                }}
              />
            )}
          />
        </FormField>

        <FormField id={`items-${index}-quantity`} label="Jumlah" error={rowErrors?.quantity?.message}>
          <Input
            id={`items-${index}-quantity`}
            inputMode="numeric"
            aria-invalid={!!rowErrors?.quantity}
            {...register(`items.${index}.quantity`)}
          />
        </FormField>

        <ReadOnlyField label="Harga satuan" value={product ? formatRupiah(product.price) : '-'} />
        <ReadOnlyField label="Subtotal" value={product ? centsToRupiah(subtotal) : '-'} strong />

        <div className="md:pt-7">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive"
            aria-label={`Hapus baris ${index + 1}`}
            disabled={!canRemove}
            onClick={onRemove}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {exceedsStock && product && (
        <p className="mt-2 text-sm text-amber-600">
          Jumlah melebihi stok yang tercatat ({product.stock}). Server akan memeriksa ulang saat order disimpan.
        </p>
      )}
    </div>
  )
}