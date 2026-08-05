# Nightdays POS

Sistem Point of Sale (Kasir) berbasis web untuk warung, toko, dan bisnis retail kecil-menengah di Indonesia. Dibangun dengan Laravel 12, React 19, dan Inertia.js.

## Tech Stack

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Backend          | Laravel 12                              |
| Frontend         | React 19 + Inertia.js v2                |
| Styling          | Tailwind CSS v4                         |
| Database         | PostgreSQL                              |
| Auth             | Laravel Sanctum (session-based)         |
| Permissions      | Spatie Laravel Permission (RBAC)        |
| Payments         | Midtrans + Xendit (QRIS, bank transfer) |
| PDF              | Barryvdh DomPDF                         |
| Indonesia Region | Laravolt Indonesia                      |

## Fitur

### Transaksi & Kasir

- Transaksi POS dengan shortcut keyboard dan scan barcode
- Keranjang belanja dengan hold/resume
- Multi-payment: tunai, QRIS, bank transfer
- Print struk (printer thermal 58mm & 80mm)
- Riwayat transaksi dan retur penjualan

### Master Data

- Produk dengan kategori, varian, barcode, harga
- Kategori produk
- Pelanggan dengan riwayat pembelian
- Supplier dan manajemen hutang

### Inventory

- Stock opname
- Mutasi stok real-time
- Low stock alerts

### Procurement

- Purchase Order (PO)
- Penerimaan barang (Goods Receiving)
- Retur supplier

### CRM & Loyalty

- Member dan loyalty points
- Promo harga (diskon persen/nominal, buy-one-get-one)
- Voucher pelanggan
- Segmentasi customer
- Campaign automation
- CRM reminders

### Laporan

- Laporan penjualan harian/mingguan/bulanan
- Laporan keuntungan (gross & net)
- Advanced sales insights
- Aging piutang

### Manajemen User

- RBAC dengan roles dan permissions
- Step-up authentication untuk operasi sensitif
- Audit log

### Pengaturan

- Profil toko
- Payment gateway (Midtrans/Xendit)
- Rekening bank
- Target penjualan
- Loyalty settings

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React SPA)               │
│         Inertia.js v2 (server-driven routing)        │
└──────────────────────┬──────────────────────────────┘
                       │ XHR / WebSocket
┌──────────────────────▼──────────────────────────────┐
│                  Laravel 12 (Backend)               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Controllers  │  │   Services   │  │   Models  │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Middleware  │  │    Queue     │  │  Events   │  │
│  └──────────────┘  └──────────────┘  └───────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  PostgreSQL                        │
│   transactions, products, customers, users, etc.   │
└───────────────────────────────────────────────────┘
```

## Requisitos

- PHP 8.3+
- PostgreSQL 14+
- Node.js 20+
- Composer 2

## Instalasi

```bash
# Clone repository
git clone https://github.com/aryadwiputra/point-of-sales
cd point-of-sales

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Setup database (PostgreSQL)
# Edit .env with your database credentials:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=nightdays_pos
# DB_USERNAME=your_user
# DB_PASSWORD=your_password

# Run migrations & seeders
php artisan migrate --seed

# Link storage
php artisan storage:link

# Start development server
composer run dev
# Runs: php artisan serve + queue:listen + pail + vp dev
```

Aplikasi tersedia di `http://localhost:8000`.

### Quick Login (Development)

Untuk login cepat sebagai user tertentu:

```
http://localhost:8000/dev/login/{user_id}
```

Contoh: `http://localhost:8000/dev/login/1`

Hanya aktif ketika `APP_ENV=local` di `.env`.

## Struktur Direktori

```
├── app/
│   ├── Http/
│   │   ├── Controllers/       # HTTP controllers
│   │   │   ├── Apps/         # Business logic controllers
│   │   │   └── Auth/         # Auth controllers
│   │   ├── Middleware/       # Custom middleware
│   │   └── Requests/         # Form request validation
│   ├── Models/               # Eloquent models
│   └── Services/             # Business logic services
├── resources/js/
│   ├── components/           # React components
│   ├── layouts/              # Page layouts
│   ├── lib/                  # Utilities (auth, menu, route-resolver)
│   └── pages/                # Inertia pages
│       ├── Dashboard/         # Dashboard feature pages
│       └── auth/             # Auth pages
├── routes/
│   ├── web.php               # Main web routes
│   ├── auth.php              # Auth routes
│   └── settings.php          # Settings routes
├── config/                   # Laravel config files
└── database/
    ├── factories/            # Model factories
    └── seeders/              # Database seeders
```

## Middleware Custom

| Middleware     | Fungsi                                               |
| -------------- | ---------------------------------------------------- |
| `active_shift` | Pastikan kasir punya shift terbuka sebelum transaksi |
| `step_up`      | Konfirmasi password untuk operasi sensitif           |
| `bot.guard`    | Proteksi anti-automation                             |
| `verified`     | Verifikasi email (opsional)                          |

## Payment Gateway

Konfigurasi di `.env`:

```env
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

XENDIT_API_KEY=
XENDIT_IS_PRODUCTION=false
```

## Development

```bash
# Run lint & typecheck
vp check

# Run tests
vp test

# Build for production
vp build

# Run Pint (code formatter)
vendor/bin/pint --dirty --format agent
```

## License

MIT
