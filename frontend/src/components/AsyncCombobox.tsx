import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface AsyncComboboxProps<T> {
  id?: string
  value: T | null
  onChange: (item: T) => void
  items: T[]
  isLoading: boolean
  errorMessage?: string
  onSearchChange: (search: string) => void
  getKey: (item: T) => string | number
  getLabel: (item: T) => string
  renderItem?: (item: T) => ReactNode
  isItemDisabled?: (item: T) => boolean
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  invalid?: boolean
}

// Penyaringan dilakukan server (parameter ?search=), bukan di browser:
// itu sebabnya <Command shouldFilter={false}>.
export default function AsyncCombobox<T>({
  id,
  value,
  onChange,
  items,
  isLoading,
  errorMessage,
  onSearchChange,
  getKey,
  getLabel,
  renderItem,
  isItemDisabled,
  placeholder,
  searchPlaceholder,
  emptyText,
  invalid,
}: AsyncComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function handleSearch(text: string) {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearchChange(text.trim()), 300)
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      // Kotak cari ikut hilang saat popover tertutup, jadi pencarian induk direset juga.
      clearTimeout(timer.current)
      onSearchChange('')
    }
  }

  const selectedKey = value ? String(getKey(value)) : null

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            invalid && 'border-destructive',
          )}
        >
          <span className="truncate">{value ? getLabel(value) : placeholder}</span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={handleSearch} />
          <CommandList>
            {isLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Memuat...</p>
            ) : errorMessage ? (
              <p role="alert" className="py-6 text-center text-sm text-destructive">
                {errorMessage}
              </p>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
            ) : (
              items.map((item) => {
                const key = String(getKey(item))
                return (
                  <CommandItem
                    key={key}
                    value={key}
                    disabled={isItemDisabled?.(item)}
                    onSelect={() => {
                      onChange(item)
                      handleOpenChange(false)
                    }}
                  >
                    <Check className={cn('shrink-0', selectedKey === key ? 'opacity-100' : 'opacity-0')} />
                    {renderItem ? renderItem(item) : getLabel(item)}
                  </CommandItem>
                )
              })
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}