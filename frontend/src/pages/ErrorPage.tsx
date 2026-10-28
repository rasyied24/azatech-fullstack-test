import { CircleAlert } from 'lucide-react'
import { useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const error = useRouteError()
  // Detail teknis hanya untuk developer; user melihat pesan umum.
  if (import.meta.env.DEV) console.error(error)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <CircleAlert className="size-12 text-destructive" />
      <div>
        <h1 className="text-xl font-semibold">Terjadi kesalahan</h1>
        <p className="text-muted-foreground">Halaman tidak dapat ditampilkan. Coba muat ulang.</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => window.location.reload()}>Muat ulang</Button>
        <Button asChild variant="outline">
          {/* <a> biasa (bukan <Link>): reload penuh membersihkan state yang rusak. */}
          <a href="/">Ke beranda</a>
        </Button>
      </div>
    </main>
  )
}