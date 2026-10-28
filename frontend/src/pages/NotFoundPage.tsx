import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/ListStates'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-background">
        <EmptyState title="Halaman tidak ditemukan" description="Alamat yang Anda buka tidak tersedia." />
      </div>
      <Button asChild variant="outline">
        <Link to="/">Ke Dashboard</Link>
      </Button>
    </div>
  )
}