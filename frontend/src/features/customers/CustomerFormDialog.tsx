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
import { Textarea } from '@/components/ui/textarea'
import { applyServerErrors } from '@/lib/forms'
import { todayIsoDate } from '@/lib/format'
import { GENDERS } from './api'
import type { Customer } from './api'
import { useSaveCustomer } from './hooks'

const customerSchema = z.object({
  customer_name: z
    .string()
    .trim()
    .min(1, 'Nama pelanggan wajib diisi')
    .max(150, 'Nama pelanggan maksimal 150 karakter'),
  customer_address: z
    .string()
    .trim()
    .min(1, 'Alamat wajib diisi')
    .max(255, 'Alamat maksimal 255 karakter'),
  gender: z.enum(GENDERS, { message: 'Jenis kelamin wajib dipilih' }),
  birth_date: z
    .string()
    .min(1, 'Tanggal lahir wajib diisi')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal lahir tidak valid')
    .refine((value) => value >= '1900-01-01', 'Tanggal lahir tidak valid')
    // todayIsoDate() dipanggil saat validasi, bukan saat modul dimuat, supaya tidak basi.
    .refine((value) => value < todayIsoDate(), 'Tanggal lahir harus sebelum hari ini'),
  // Opsional: kosong boleh; kalau diisi, angka 8-19 digit, boleh diawali "+".
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^\+?\d{8,19}$/.test(value),
      'No. HP harus 8–19 digit angka, boleh diawali +',
    ),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormDialogProps {
  customer?: Customer
  onClose: () => void
}

export default function CustomerFormDialog({ customer, onClose }: CustomerFormDialogProps) {
  const save = useSaveCustomer(customer)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_name: customer?.customer_name ?? '',
      customer_address: customer?.customer_address ?? '',
      gender: customer?.gender, // undefined untuk pelanggan baru: belum ada yang terpilih
      birth_date: customer?.birth_date ?? '',
      phone: customer?.phone ?? '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync({
        ...values,
        // Kosong dikirim sebagai null (bukan dihilangkan) agar nomor lama bisa dihapus.
        phone: values.phone === '' ? null : values.phone,
      })
      toast.success(customer ? 'Pelanggan berhasil diperbarui' : 'Pelanggan berhasil ditambahkan')
      onClose()
    } catch (error) {
      applyServerErrors(error, setError, [
        'customer_name',
        'customer_address',
        'gender',
        'birth_date',
        'phone',
      ])
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</DialogTitle>
          <DialogDescription>
            {customer ? 'Ubah data pelanggan, lalu simpan.' : 'Isi data pelanggan baru.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {errors.root?.message && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          <FormField id="customer_name" label="Nama" error={errors.customer_name?.message}>
            <Input
              id="customer_name"
              aria-invalid={!!errors.customer_name}
              {...register('customer_name')}
            />
          </FormField>

          <FormField id="customer_address" label="Alamat" error={errors.customer_address?.message}>
            <Textarea
              id="customer_address"
              rows={3}
              aria-invalid={!!errors.customer_address}
              {...register('customer_address')}
            />
          </FormField>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Jenis Kelamin</legend>
            <div className="flex gap-6">
              {GENDERS.map((gender) => (
                <label key={gender} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    value={gender}
                    className="size-4 accent-primary"
                    {...register('gender')}
                  />
                  {gender}
                </label>
              ))}
            </div>
            {errors.gender && (
              <p role="alert" className="text-sm text-destructive">
                {errors.gender.message}
              </p>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="birth_date" label="Tanggal Lahir" error={errors.birth_date?.message}>
              <Input
                id="birth_date"
                type="date"
                max={todayIsoDate()}
                aria-invalid={!!errors.birth_date}
                {...register('birth_date')}
              />
            </FormField>

            <FormField id="phone" label="No. HP (opsional)" error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="081234567890"
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
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