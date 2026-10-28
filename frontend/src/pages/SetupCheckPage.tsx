import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiError, apiGet } from '@/lib/api'
import { formatDate, formatDateTime, formatRupiah } from '@/lib/format'

export default function SetupCheckPage() {
  const { refetch, isFetching, error, data } = useQuery({
    queryKey: ['setup-check'],
    queryFn: () => apiGet<{ id: number; name: string; email: string }>('/auth/me'),
    enabled: false,
  })

  return (
    <main className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Azatech Shop: cek setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Rupiah: {formatRupiah('12000.00')}</p>
          <p>Tanggal: {formatDate('1995-02-10')}</p>
          <p>Tanggal & jam: {formatDateTime('2026-10-28T13:21:00+07:00')}</p>

          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Memeriksa...' : 'Tes koneksi API'}
          </Button>

          {error && (
            <p className="text-red-600">
              {error instanceof ApiError ? `${error.status}: ${error.message}` : 'Error tak dikenal'}
            </p>
          )}
          {data && <p className="text-green-600">Terhubung sebagai {data.email}</p>}
        </CardContent>
      </Card>
    </main>
  )
}