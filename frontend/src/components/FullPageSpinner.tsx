import { LoaderCircle } from 'lucide-react'

export default function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Memuat">
      <LoaderCircle className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}