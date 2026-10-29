# Azatech Shop: Sistem Online Shop (Order Management)

Technical test **Medior Fullstack Developer** (Azatech), Track B (Laravel).

Aplikasi untuk mengelola produk, pelanggan, dan transaksi penjualan. Satu order dapat berisi lebih dari satu produk, dengan validasi stok dan perhitungan harga sepenuhnya di server.

## Daftar isi

1. [Tech stack dan alasannya](#tech-stack-dan-alasannya)
2. [Struktur repo](#struktur-repo)
3. [Menjalankan aplikasi](#menjalankan-aplikasi)
4. [Menjalankan test](#menjalankan-test)
5. [Dokumentasi API](#dokumentasi-api)
6. [Logika aplikasi](#logika-aplikasi)
7. [Asumsi dan keterbatasan](#asumsi-dan-keterbatasan)
8. [Yang akan diperbaiki jika ada waktu](#yang-akan-diperbaiki-jika-ada-waktu)
9. [AI Usage](#ai-usage)

## Tech stack dan alasannya

**Backend** (`backend/`)

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Laravel 13 (PHP 8.3+) | Track B; framework yang paling saya kuasai, sehingga keputusan teknisnya bisa saya pertanggungjawabkan |
| Database | PostgreSQL | Mendukung row locking (`SELECT ... FOR UPDATE`) yang dipakai untuk mengamankan stok |
| Autentikasi | Laravel Sanctum (API token) | Sederhana dan cukup untuk SPA yang terpisah; token kedaluwarsa setelah 24 jam |
| Validasi | Form Request | Validasi terpisah dari controller |
| Test | PHPUnit (feature test) | Bawaan Laravel |

**Frontend** (`frontend/`)

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | React 19 + TypeScript + Vite (SPA) | Backend sudah terpisah, aplikasi berada di balik login, dan tidak butuh SSR/SEO. Vite memberi setup yang lebih ringan daripada Next.js |
| Routing | React Router | Rute terproteksi dan code splitting per halaman |
| Data fetching | TanStack Query | Cache, state loading/error, dan invalidasi setelah mutasi |
| Form dan validasi | React Hook Form + Zod | Nama field array sama dengan key error Laravel (`items.1.quantity`), jadi error server dipetakan ke baris yang tepat |
| UI | Tailwind CSS v4 + shadcn/ui | Komponen yang dapat diakses (aksesibel) dan mudah disesuaikan |
| HTTP | Axios + interceptor | Token otomatis ditambahkan, 401 ditangani di satu tempat, error dinormalisasi |

## Struktur repo

```
azatech-test/
├── backend/        Laravel 13 (REST API)
├── frontend/       React + Vite (SPA)
├── docs/postman/   Postman collection
└── README.md
```

Backend dan frontend adalah dua service terpisah dan dijalankan sendiri-sendiri.

## Menjalankan aplikasi

**Prasyarat:** PHP 8.3+, Composer, PostgreSQL, Node.js (dikembangkan dengan Node 24) dan npm.

Buat dahulu database PostgreSQL kosong bernama `azatech_shop`, lalu jalankan:

```bash
# 1. Ambil kode
git clone https://github.com/rasyied24/azatech-fullstack-test.git && cd azatech-fullstack-test

# 2. Backend: instal dependensi dan siapkan .env
cd backend && composer install && cp .env.example .env && php artisan key:generate

# 3. Sesuaikan DB_USERNAME dan DB_PASSWORD di backend/.env, lalu migrasi + seed
php artisan migrate --seed

# 4. Jalankan backend (tetap di terminal ini)
php artisan serve

# 5. Terminal baru: instal dan jalankan frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

- Backend: <http://localhost:8000/api>
- Frontend: <http://localhost:5173>

Frontend memakai `VITE_API_URL` (default di `.env.example`: `http://localhost:8000/api`). Backend hanya mengizinkan origin dari `FRONTEND_URL` (default `http://localhost:5173`), jadi buka frontend lewat `localhost`, bukan `127.0.0.1`.

**Akun login (dari seeder):**

| Email | Password |
|---|---|
| `admin@azatech.id` | `password` |

**Data seeder:** 1 user admin, 20 produk (`P0001` sampai `P0020`), 15 pelanggan, dan 30 order yang tersebar dalam 30 hari terakhir. Migrasi dan seeder dapat dijalankan dari database kosong.

## Menjalankan test

**Backend** membutuhkan database PostgreSQL **terpisah** bernama `azatech_shop_test` (agar data development tidak terhapus). Buat database kosong itu, lalu:

```bash
cd backend
php artisan test
```

Ada 16 test, mencakup skenario wajib dari soal: buat order sukses, stok tidak cukup, validasi input gagal, dan akses tanpa token.

**Frontend** belum memiliki test otomatis (lihat [keterbatasan](#asumsi-dan-keterbatasan)). Pemeriksaan yang tersedia:

```bash
cd frontend
npm run lint
npm run build   # termasuk type-check TypeScript
```

## Dokumentasi API

Postman collection ada di [`docs/postman/azatech-shop.postman_collection.json`](docs/postman/azatech-shop.postman_collection.json).

1. Impor file tersebut di Postman.
2. Jalankan request **Auth, Login** terlebih dahulu. Tes pada request itu menyimpan token ke variabel koleksi, dan semua request lain otomatis memakainya.
3. Variabel `base_url` bisa diubah (default `http://localhost:8000/api`).
4. Request **Create** pada Produk, Pelanggan, dan Order menyimpan id-nya ke variabel (`product_id`, `customer_id`, `order_id`), sehingga request Detail, Update, dan Delete bisa langsung dijalankan sesudahnya.

Semua endpoint selain login membutuhkan header `Authorization: Bearer <token>`.

**Format response** (semua endpoint):

```json
{ "success": true, "message": "OK", "data": {}, "meta": { "page": 1, "per_page": 10, "total": 57, "total_pages": 6 } }
{ "success": false, "message": "Validasi gagal", "errors": { "items.0.quantity": ["Jumlah minimal 1"] } }
```

`meta` hanya ada pada response list; `errors` bersifat opsional. Status code yang dipakai: 200, 201, 204 (DELETE, tanpa body), 401, 404, 409, 422, 500.

## Logika aplikasi

### Alur pembuatan order (`POST /api/orders`)

1. Klien mengirim `customer_id` dan `items` (`product_id`, `quantity`). **Harga dan total tidak pernah diterima dari klien**; nilai `price` atau `total` yang dikirim diabaikan.
2. Form Request memvalidasi input. Satu produk tidak boleh muncul dua kali dalam `items`. Jika gagal: **422**.
3. Seluruh proses berikut berjalan dalam **satu database transaction**:
   - Baris produk yang terlibat dikunci dengan `lockForUpdate`, **diurutkan berdasarkan id**. Penguncian berurutan mencegah deadlock ketika dua order mengunci produk yang sama dalam urutan berbeda, dan mencegah dua order memakai stok yang sama secara bersamaan (oversell).
   - Stok setiap item diperiksa. Jika ada yang kurang, error **semua item bermasalah** dikumpulkan lalu dikembalikan sekaligus dengan **409**; transaksi dibatalkan sehingga **tidak ada stok yang berkurang**.
   - Server menghitung `unit_price` (snapshot harga saat transaksi), `subtotal` tiap item, dan `total_amount`.
   - Stok dikurangi, lalu `orders` dan `order_items` dibuat.
   - Nomor invoice `INV-YYYYMMDD-XXXX` dibuat dari tabel `order_sequences` di dalam transaksi yang sama, sehingga unik dan aman dari balapan (race) antar-request.
4. Response **201** berisi order lengkap beserta item-nya.

**Kenapa 409 untuk stok dan 422 untuk validasi?** 422 berarti input itu sendiri tidak valid. 409 berarti input valid tetapi bertentangan dengan keadaan data saat ini (stok tidak cukup), dan bisa berubah jika dicoba lagi nanti.

`unit_price` disimpan di `order_items` agar laporan historis tetap akurat walaupun harga produk berubah. Produk atau pelanggan yang sudah dihapus (soft delete) tetap tampil pada riwayat order.

### Frontend

- **Autentikasi:** token disimpan di `localStorage`. Saat aplikasi dimuat, token divalidasi lewat `/auth/me`. Satu interceptor menangani 401 di mana pun terjadi (token kedaluwarsa atau dicabut): sesi dibersihkan dan user diarahkan ke login, lalu kembali ke halaman tujuan semula setelah login ulang.
- **Buat Order:** baris produk dinamis (`useFieldArray`). Produk yang sudah dipilih di satu baris dinonaktifkan di baris lain. Subtotal dan total di layar hanya tampilan (dihitung dalam sen agar bebas galat floating-point); total yang sah dihitung server. Error 409/422 dipetakan ke baris dan field yang bermasalah.
- **Stok pada form order hanya petunjuk.** Jumlah melebihi stok menampilkan peringatan tetapi tidak memblokir, karena stok di browser bisa basi; server yang menentukan.
- **State** loading, empty, dan error tersedia pada setiap halaman data. Halaman dimuat per rute (code splitting), dengan halaman 404 dan penangkap error untuk kegagalan tak terduga.

## Asumsi dan keterbatasan

**Backend**
- Kode produk (`product_code`) tetap unik walaupun produk sudah di-soft-delete, sehingga kode produk yang dihapus tidak bisa dipakai ulang.
- Validasi nomor HP pelanggan: opsional, angka 8 sampai 19 digit, boleh diawali `+`.
- Dashboard bersifat **semua waktu** (tidak ada filter periode).
- Produk yang sudah dihapus tetap dihitung dan tampil pada daftar produk terlaris.
- Belum ada test untuk skenario race condition paralel (dua order bersamaan pada produk yang sama). Mekanisme pengamannya (transaksi dan `lockForUpdate` berurutan) sudah ada, tetapi belum dibuktikan dengan test.
- Belum ada idempotency key pada `POST /orders`. Klik ganda dicegah di sisi klien (tombol dinonaktifkan saat proses), tetapi request ganda langsung ke API akan membuat dua order.

**Frontend**
- Token di `localStorage` rentan dicuri jika ada celah XSS. Alternatif yang lebih aman adalah cookie `HttpOnly`, yang butuh perubahan di sisi backend.
- State daftar (halaman, pencarian, filter) disimpan di memori komponen, bukan di URL, sehingga hilang saat reload dan tidak bisa dibagikan lewat tautan.
- Stok produk pada baris order adalah snapshot saat produk dipilih; setelah error 409 pengguna perlu memilih ulang produk untuk melihat stok terbaru.
- Tabel pada layar kecil digeser secara horizontal, bukan diubah menjadi tampilan kartu.
- Ambang stok menipis (5) ditulis di frontend untuk badge tabel produk, padahal sumber kebenarannya di backend. Dashboard sudah memakai nilai dari server.
- Logout di satu tab tidak otomatis mengeluarkan tab lain.
- TypeScript dipasang di seri 6.0 karena `typescript-eslint` belum mendukung TypeScript 7.
- Belum ada test otomatis di frontend.

**Tidak dikerjakan (bonus):** `docker compose`, GitHub Actions, grafik penjualan harian, export CSV, dan test frontend.

## Yang akan diperbaiki jika ada waktu

1. Test race condition paralel untuk pembuatan order, dan idempotency key pada `POST /orders`.
2. Test frontend: Vitest untuk helper murni (format Rupiah/tanggal, hitung order, pemetaan error server) dan Playwright untuk alur login sampai buat order.
3. GitHub Actions untuk lint, build, dan test pada setiap push.
4. Endpoint agregasi penjualan harian di backend, lalu grafiknya di dashboard.
5. Filter pelanggan pada riwayat order (backend sudah mendukung `customer_id`), dan export CSV.
6. Menyimpan state daftar di URL, tampilan kartu untuk tabel di layar kecil, dan komponen CRUD generik untuk halaman Produk dan Pelanggan yang strukturnya serupa.
7. Token pada cookie `HttpOnly` dan `docker compose` untuk menjalankan seluruh aplikasi dengan satu perintah.

## AI Usage

Saya memakai **Claude (Anthropic)** lewat antarmuka chat sebagai asisten pengembangan.

| Bagian | Peran AI | Peran saya |
|---|---|---|
| Backend (Laravel) | Membantu diskusi desain, penulisan kode, dan test | Menentukan keputusan, menjalankan dan memverifikasi semua test, dan menyesuaikan kode |
| Frontend (React) | Menyusun arsitektur dan menulis kode bertahap per fase (setup, login, produk dan pelanggan, buat order, riwayat, dashboard, poles) | Menjalankan setiap fase, menguji manual terhadap daftar verifikasi, melaporkan dan memperbaiki masalah |
| Dokumentasi | Menyusun draf README dan Postman collection | Memeriksa dan menyesuaikan isinya dengan kondisi aplikasi |

Saya bertanggung jawab atas seluruh kode di repositori ini dan siap membahasnya pada sesi review.
