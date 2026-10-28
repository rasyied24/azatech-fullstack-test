import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  placeholder: string
  onSearch: (value: string) => void
  delay?: number
  className?: string
}

export default function SearchInput({ placeholder, onSearch, delay = 400, className }: SearchInputProps) {
  const [text, setText] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setText(value)
    // Request baru hanya dikirim setelah user berhenti mengetik.
    clearTimeout(timer.current)
    timer.current = setTimeout(() => onSearch(value.trim()), delay)
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
      />
    </div>
  )
}