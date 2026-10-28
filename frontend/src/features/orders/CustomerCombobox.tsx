import { useState } from 'react'
import AsyncCombobox from '@/components/AsyncCombobox'
import { useCustomers } from '@/features/customers/hooks'
import { getErrorMessage } from '@/lib/forms'
import type { CustomerOption } from './schema'

interface CustomerComboboxProps {
  id?: string
  value: CustomerOption | null
  onChange: (customer: CustomerOption) => void
  invalid?: boolean
}

export default function CustomerCombobox({ id, value, onChange, invalid }: CustomerComboboxProps) {
  const [search, setSearch] = useState('')
  const { data, isPending, isError, error } = useCustomers({ page: 1, per_page: 20, search })

  return (
    <AsyncCombobox<CustomerOption>
      id={id}
      value={value}
      onChange={onChange}
      items={data?.items ?? []}
      isLoading={isPending}
      errorMessage={isError ? getErrorMessage(error) : undefined}
      onSearchChange={setSearch}
      getKey={(customer) => customer.id}
      getLabel={(customer) => customer.customer_name}
      placeholder="Pilih pelanggan"
      searchPlaceholder="Cari nama pelanggan..."
      emptyText="Pelanggan tidak ditemukan"
      invalid={invalid}
    />
  )
}