import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginationMeta } from '@/types/api'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
  disabled?: boolean
}

export default function Pagination({ meta, onPageChange, disabled }: PaginationProps) {
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.per_page + 1
  const to = Math.min(meta.page * meta.per_page, meta.total)

  return (
    <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row">
      <p className="text-muted-foreground">
        Menampilkan {from}–{to} dari {meta.total} data
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft />
          Sebelumnya
        </Button>
        <span className="px-1">
          Halaman {meta.page} dari {Math.max(meta.total_pages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || meta.page >= meta.total_pages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Berikutnya
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}