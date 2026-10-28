import { z } from 'zod'

const customerOption = z.object({ id: z.string(), customer_name: z.string() })

const productOption = z.object({
  id: z.number(),
  product_code: z.string(),
  product_name: z.string(),
  price: z.string(),
  stock: z.number(),
})

export type CustomerOption = z.infer<typeof customerOption>
export type ProductOption = z.infer<typeof productOption>

const orderItemSchema = z.object({
  product: productOption
    .nullable()
    .refine((value): boolean => value !== null, 'Pilih produk'),
  quantity: z
    .string()
    .trim()
    .min(1, 'Jumlah wajib diisi')
    .regex(/^\d+$/, 'Jumlah harus bilangan bulat')
    .refine((value) => Number(value) >= 1, 'Jumlah minimal 1'),
})

export const orderSchema = z.object({
  customer: customerOption.nullable().refine((value): boolean => value !== null, 'Pelanggan wajib dipilih'),
  items: z
    .array(orderItemSchema)
    .min(1, 'Tambahkan minimal satu produk')
    // Jaring pengaman: combobox sudah menonaktifkan produk yang terpilih di baris lain.
    .superRefine((items, ctx) => {
      const seen = new Set<number>()
      items.forEach((item, index) => {
        if (!item.product) return
        if (seen.has(item.product.id)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Produk sudah dipilih di baris lain',
            path: [index, 'product'],
          })
        }
        seen.add(item.product.id)
      })
    }),
})

export type OrderFormValues = z.infer<typeof orderSchema>

export const emptyItem = (): OrderFormValues['items'][number] => ({ product: null, quantity: '1' })