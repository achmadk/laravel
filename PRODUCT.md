# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dua pengguna utama yang sama pentingnya, dengan situasi dan pekerjaan berbeda:

- **Kasir** di counter toko — melayani transaksi cepat: scan barcode, keyboard shortcut, multi-payment, print struk, retur. Produktivitas di sini berarti kecepatan dan minim kesalahan.
- **Pemilik/manajer** toko — memantau penjualan, keuntungan, stok, piutang, dan anggota/loyalty dari dashboard dan laporan, serta mengelola master data, procurement, dan tim.

Keduanya bekerja pada instalasi yang sama; satu produk harus melayani dua mode kerja yang berbeda ini secara setara.

## Product Purpose

Sistem Point of Sale (Kasir) berbasis web untuk warung, toko, dan bisnis retail kecil-menengah di Indonesia. Satu aplikasi menutup seluruh operasional retail: transaksi kasir, inventory & stok, procurement (purchase order, penerimaan barang, retur), CRM & loyalty, dan laporan — sehingga pemilik UKM tidak perlu memakai banyak tools terpisah.

## Positioning

**Kedalaman fitur untuk UKM**: satu aplikasi yang menutup POS + inventory + procurement + CRM/loyalty + laporan sekaligus, plus deployment self-hosted di VPS sendiri (lisensi MIT, tanpa biaya langganan bulanan) — lebih dalam dari POS warung yang simpel, dan lebih terbuka/hemat dari SaaS POS lain di Indonesia (Moka, Pawoon, Olsera).

## Operating Context

- **Hardware nyata di lapangan**: printer thermal 58mm & 80mm, scanner barcode. Alur kasir dibangun di sekeliling perangkat ini.
- **Self-hosted di VPS milik pengguna** — bukan SaaS. Data tinggal di server mereka sendiri.
- **Deployment teknis**: `composer run dev` untuk development (serve + queue + pail + vp dev); `vp build` untuk produksi. Struk dicetak via DomPDF.
- UI (wajib) dalam Bahasa Indonesia.

## Capabilities and Constraints

### Confirmed

- Transaksi & kasir: POS dengan keyboard shortcut, scan barcode, keranjang hold/resume, multi-payment (tunai, QRIS, bank transfer), print struk thermal, riwayat & retur penjualan.
- Master data: produk (varian, barcode, harga, kategori), pelanggan, supplier, utang/piutang (payable, receivable, aging).
- Inventory: stok opname, mutasi stok real-time, low-stock alert.
- Procurement: purchase order, goods receiving, retur supplier.
- CRM & loyalty: member & loyalty points, promo harga, voucher, segmentasi customer, campaign automation, CRM reminder.
- Reports: penjualan harian/mingguan/bulanan, laba gross & net, advanced sales insights, aging piutang.
- User management: RBAC (Spatie), step-up auth untuk operasi sensitif, audit log.
- Settings: profil toko, payment gateway (Midtrans/Xendit), rekening bank, target penjualan, loyalty settings.
- Auth & permission: Sanctum session-based, middleware custom (`active_shift`, `step_up`, `bot.guard`, `verified`), dev quick-login (`/dev/login/{user}`) hanya aktif saat `APP_ENV=local`.
- Payment gateway: Midtrans + Xendit (QRIS, transfer bank), configurable environment (sandbox/production).
- Scope toko: single-store saat ini, namun arsitektur/desain harus bisa diperluas ke multi-cabang di masa depan.

### Undecided (jangan di-invent)

- Multi-cabang/multi-outlet: apakah benar-benar akan didukung nanti — belum diputuskan, jangan berasumsi kebutuhan bersama antar cabang.
- Offline-first (tetap berfungsi saat internet mati) — bukan kebutuhan terkonfirmasi; aplikasi adalah SPA Inertia yang butuh koneksi ke server.

## Brand Commitments

- Nama produk: **Nightdays POS** (dari nama repo & README). Tidak ada identitas brand lain yang terkonfirmasi.
- License: MIT (open-source).
- Bahasa UI wajib Bahasa Indonesia — istilah fitur yang sudah dipakai di README/routes (Mutasi stok, Retur supplier, Aging piutang, Penerimaan barang) adalah kosakata produk yang sah/berlaku.
- Voice tidak terkonfirmasi lebih jauh di luar konteks formal POS yang sudah ada di kode.

## Evidence on Hand

- README.md — deskripsi fitur, arsitektur, setup, stack, license.
- package.json & routes/web.php — daftar fitur & modul terkonfirmasi.
- resources/js/pages, layouts, components — incumbent visual system (Tailwind v4, react-aria-components, motion, sonner) dan struktur UI.
- **Absence**: tidak ada testimonial, pelanggan riil, case study, data penjualan, atau asset brand (logo dll.) — jangan difabrikasi.

## Product Principles

1. **Dua ruangan, satu produk.** Kasir (kecepatan) dan owner (kontrol/lihat) sama penting. Layar POS dan dashboard/laporan masing-masing harus dirancang untuk alur kerjanya sendiri.
2. **Kedalaman adalah diferensiasi.** Satu app menggerakkan operasional toko secara utuh; setiap modul memperkuat modul lain, dan itu yang membuat produk berbeda dari POS simpel atau SaaS mahal.
3. **Data berdaulat di lokasi sendiri.** Self-hosted, MIT, tanpa vendor lock — desain dan komunikasi menghormati bahwa pemilik toko yang memegang data mereka.
4. **Bahasa Indonesia sebagai bahasa inti.** UI, struk, dan laporan wajib dalam Bahasa Indonesia dan memakai kosakata yang dikenal di lapangan.
5. **Berakar di operasi nyata.** Desain menghormati hardware fisik (printer thermal, barcode) dan alur kerja kasir di counter — bukan sekadar layar yang indah.

## Accessibility & Inclusion

- Tidak ada kebutuhan aksesibilitas khusus yang terkonfirmasi dari user; keyboard-first untuk kasir adalah kebutuhan operasional nyata (shortcut POS), bukan sekadar preferensi.