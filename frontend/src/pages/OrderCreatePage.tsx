import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Plus } from 'lucide-react'
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import FormField from '@/components/FormField'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { centsToRupiah, lineSubtotalCents } from '@/features/orders/calc'
import CustomerCombobox from '@/features/orders/CustomerCombobox'
import { useCreateOrder } from '@/features/orders/hooks'
import OrderItemRow from '@/features/orders/OrderItemRow'
import { buildOrderPayload } from '@/features/orders/payload'
import { emptyItem, orderSchema } from '@/features/orders/schema'
import type { OrderFormValues } from '@/features/orders/schema'
import { applyOrderServerErrors } from '@/features/orders/serverErrors'
import { ApiError } from '@/lib/api'
import { getErrorMessage } from '@/lib/forms'

export default function OrderCreatePage() {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customer: null, items: [emptyItem()] },
  })
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = useWatch({ control, name: 'items' })
  const create = useCreateOrder()

  // Hanya tampilan; total yang sah dihitung ulang server.
  const totalCents = (items ?? []).reduce(
    (sum, item) => sum + (item.product ? lineSubtotalCents(item.product.price, item.quantity) : 0),
    0,
  )

  const onSubmit = handleSubmit(async (values) => {
    const payload = buildOrderPayload(values)
    if (!payload) return

    try {
      const order = await create.mutateAsync(payload)
      toast.success(`Order ${order.order_number} berhasil dibuat`)
      reset({ customer: null, items: [emptyItem()] })
    } catch (error) {
      if (error instanceof ApiError) applyOrderServerErrors(error, setError)
      else setError('root', { message: getErrorMessage(error) })
    }
  })

  const itemsError = errors.items?.message ?? errors.items?.root?.message

  return (
    <FormProvider {...form}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Buat Order</h1>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {errors.root?.message && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField id="customer" label="Pelanggan" error={errors.customer?.message}>
                <Controller
                  control={control}
                  name="customer"
                  render={({ field }) => (
                    <CustomerCombobox
                      id="customer"
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!errors.customer}
                    />
                  )}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Produk</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append(emptyItem())}>
                <Plus />
                Tambah Produk
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, index) => (
                <OrderItemRow
                  key={field.id}
                  index={index}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(index)}
                />
              ))}
              {itemsError && (
                <p role="alert" className="text-sm text-destructive">
                  {itemsError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{centsToRupiah(totalCents)}</p>
                <p className="text-xs text-muted-foreground">
                  Harga dan total dihitung ulang oleh server saat order disimpan.
                </p>
              </div>
              <Button type="submit" size="lg" disabled={create.isPending}>
                {create.isPending && <LoaderCircle className="animate-spin" />}
                {create.isPending ? 'Menyimpan...' : 'Simpan Order'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </FormProvider>
  )
}