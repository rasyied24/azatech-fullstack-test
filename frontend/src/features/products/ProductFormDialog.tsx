import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import FormField from '@/components/FormField'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { applyServerErrors } from '@/lib/forms'
import type { Product } from './api'
import { useSaveProduct } from './hooks'

// Semua field berupa string di form; diubah ke angka hanya saat submit.
const productSchema = z.object({
  product_code: z
    .string()
    .trim()
    .min(1, 'Kode produk wajib diisi')
    .max(20, 'Kode produk maksimal 20 karakter'),
  product_name: z
    .string()
    .trim()
    .min(1, 'Nama produk wajib diisi')
    .max(150, 'Nama produk maksimal 150 karakter'),
  stock: z
    .string()
    .trim()
    .min(1, 'Stok wajib diisi')
    .regex(/^\d+$/, 'Stok harus bilangan bulat 0 atau lebih'),
  price: z
    .string()
    .trim()
    .min(1, 'Harga wajib diisi')
    .regex(/^\d+(\.\d{1,2})?$/, 'Harga hanya angka; desimal pakai titik (maks. 2 digit)')
    .refine((value) => Number(value) > 0, 'Harga harus lebih dari 0'),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormDialogProps {
  product?: Product
  onClose: () => void
}

export default function ProductFormDialog({ product, onClose }: ProductFormDialogProps) {
  const save = useSaveProduct(product)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      product_code: product?.product_code ?? '',
      product_name: product?.product_name ?? '',
      stock: product ? String(product.stock) : '',
      // "12000.00" -> "12000"
      price: product ? String(Number(product.price)) : '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        product_code: values.product_code,
        product_name: values.product_name,
        stock: Number(values.stock),
        price: Number(values.price),
      })
      toast.success(product ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan')
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, ['product_code', 'product_name', 'stock', 'price'])
    }
  })

  const isPending = save.isPending

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
          <DialogDescription>
            {product ? 'Ubah data produk, lalu simpan.' : 'Isi data produk baru.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {errors.root?.message && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <FormField id="product_code" label="Kode Produk" error={errors.product_code?.message}>
            <Input id="product_code" aria-invalid={!!errors.product_code} {...register('product_code')} />
          </FormField>

          <FormField id="product_name" label="Nama Produk" error={errors.product_name?.message}>
            <Input id="product_name" aria-invalid={!!errors.product_name} {...register('product_name')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="stock" label="Stok" error={errors.stock?.message}>
              <Input id="stock" inputMode="numeric" aria-invalid={!!errors.stock} {...register('stock')} />
            </FormField>

            <FormField id="price" label="Harga (Rp)" error={errors.price?.message}>
              <Input id="price" inputMode="decimal" aria-invalid={!!errors.price} {...register('price')} />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <LoaderCircle className="animate-spin" />}
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}