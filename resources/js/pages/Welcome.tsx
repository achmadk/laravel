/* Hallmark · genre: modern-minimal · macrostructure: Workbench · theme: nightdays-tokens · nav: N5 · footer: Ft2 */
/* Hallmark · pre-emit critique: P5 H4 E5 S4 R5 V5 */
import { Head, Link } from "@inertiajs/react";
import {
  IconArrowRight,
  IconBolt,
  IconBox,
  IconBrandGithub,
  IconBrandReact,
  IconBrandTailwind,
  IconBuildingWarehouse,
  IconChartBar,
  IconCheck,
  IconCreditCard,
  IconDatabase,
  IconDiscount,
  IconPrinter,
  IconShieldLock,
  IconShoppingCart,
  IconTruckDelivery,
  IconUsers,
} from "@tabler/icons-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

interface Feature {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
}

interface TechItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  desc: string;
}

function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 36"
      fill="none"
      className={className}
      aria-label="Nightdays POS"
      role="img"
    >
      <rect x="0" y="6" width="28" height="24" rx="6" fill="currentColor" opacity="0.15" />
      <path d="M7 18h14M14 11v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <text
        x="36"
        y="24"
        fontFamily="Plus Jakarta Sans, Inter, system-ui"
        fontSize="20"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="-0.5"
      >
        Nightdays
      </text>
      <text
        x="134"
        y="24"
        fontFamily="Plus Jakarta Sans, Inter, system-ui"
        fontSize="20"
        fontWeight="300"
        fill="currentColor"
        letterSpacing="-0.3"
      >
        POS
      </text>
    </svg>
  );
}

const stats = [
  { value: "10rb+", label: "Transaksi Diproses" },
  { value: "50+", label: "Fitur Siap Pakai" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Dukungan Teknis" },
];

const features: Feature[] = [
  {
    icon: IconShoppingCart,
    title: "Transaksi Cepat",
    desc: "Antarmuka POS responsif dengan shortcut keyboard, scan barcode, dan pencarian produk instan.",
  },
  {
    icon: IconBox,
    title: "Manajemen Produk",
    desc: "Katalog produk dengan kategori, varian, barcode, harga jual & beli, dan stok minimal.",
  },
  {
    icon: IconBuildingWarehouse,
    title: "Inventori Real-time",
    desc: "Stok terupdate otomatis setiap transaksi. Pantau stok masuk, keluar, dan opname stok.",
  },
  {
    icon: IconUsers,
    title: "Data Pelanggan",
    desc: "Riwayat pembelian pelanggan tersimpan otomatis. Kelola membership dan loyalitas.",
  },
  {
    icon: IconChartBar,
    title: "Laporan Keuangan",
    desc: "Grafik penjualan harian/mingguan/bulanan, laba kotor, dan analisis tren produk.",
  },
  {
    icon: IconCreditCard,
    title: "Multi Payment",
    desc: "Terima pembayaran tunai, QRIS, dan Midtrans. Cocok untuk berbagai skenario toko.",
  },
  {
    icon: IconPrinter,
    title: "Cetak Struk",
    desc: "Dukungan printer thermal 58mm & 80mm. Cetak ulang struk dan invoice pelanggan.",
  },
  {
    icon: IconTruckDelivery,
    title: "Supplier & PO",
    desc: "Kelola pemasok, buat purchase order, dan catat penerimaan barang dengan mudah.",
  },
  {
    icon: IconDiscount,
    title: "Diskon & Promo",
    desc: "Aturan harga fleksibel: diskon persen/nominal, buy-one-get-one, dan promo musiman.",
  },
  {
    icon: IconShieldLock,
    title: "Hak Akses",
    desc: "Atur izin per pengguna: kasir, staf gudang, manajer, dan administrator.",
  },
];

const techStack: TechItem[] = [
  {
    icon: IconBolt,
    name: "Laravel 12",
    desc: "Backend PHP modern dengan Eloquent ORM, queue, dan REST API",
  },
  {
    icon: IconBrandReact,
    name: "React 19",
    desc: "Frontend reaktif dengan hooks, Suspense, dan concurrent features",
  },
  {
    icon: IconBolt,
    name: "Inertia.js v2",
    desc: "Monolith SPA tanpa API — Laravel dan React menyatu seamless",
  },
  {
    icon: IconBrandTailwind,
    name: "Tailwind CSS v4",
    desc: "Utility-first styling dengan design system dan dark mode",
  },
  {
    icon: IconDatabase,
    name: "PostgreSQL",
    desc: "Database relasional performa tinggi untuk transaksi real-time",
  },
];

const screenshots = [
  {
    src: "/media/revamp-pos.png",
    alt: "Tampilan POS utama",
    label: "Antarmuka POS",
    width: 1918,
    height: 907,
  },
  {
    src: "/media/revamp-dashboard.png",
    alt: "Dashboard analitik",
    label: "Dashboard",
    width: 1895,
    height: 907,
  },
  {
    src: "/media/revamp-pos.png",
    alt: "Transaksi penjualan",
    label: "Transaksi",
    width: 1918,
    height: 907,
  },
  {
    src: "/media/revamp-dashboard.png",
    alt: "Manajemen produk",
    label: "Produk",
    width: 1895,
    height: 907,
  },
];

const receiptItems = [
  { name: "Kopi Susu", price: "12.000" },
  { name: "Indomie Goreng", price: "4.500" },
  { name: "Beras 5 kg", price: "68.000" },
  { name: "Telur 1 kg", price: "28.000" },
  { name: "Gula Pasir", price: "17.500" },
  { name: "Teh Botol", price: "5.000" },
  { name: "Sabun Cuci", price: "15.000" },
  { name: "Roti Tawar", price: "18.000" },
];

const steps = [
  { label: "Clone Repositori", cmd: "git clone https://github.com/aryadwiputra/point-of-sales" },
  { label: "Install Dependency", cmd: "cd point-of-sales && composer install && npm install" },
  { label: "Setup Environment", cmd: "cp .env.example .env && php artisan key:generate" },
  { label: "Migrasi Database", cmd: "php artisan migrate --seed && php artisan storage:link" },
  { label: "Jalankan Aplikasi", cmd: "npm run dev & php artisan serve" },
];

export default function Welcome() {
  return (
    <>
      <Head title="Nightdays POS — Sistem Kasir Modern" />

      <div className="min-h-screen bg-bg font-sans text-fg antialiased">
        {/* N5 floating pill nav */}
        <nav className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-4">
          <div className="flex w-auto max-w-100dvw items-center justify-between gap-4 rounded-full border border-border bg-bg/75 py-1.5 pr-1.5 pl-3 shadow-sm backdrop-blur-xl backdrop-saturate-150 sm:gap-6 sm:pr-2 sm:pl-4">
            <Link href="/" className="shrink-0">
              <BrandMark className="h-6 w-auto text-fg" />
            </Link>

            <div className="hidden items-center gap-6 font-medium text-[13px] text-muted-fg md:flex">
              <a href="#features" className="transition-colors hover:text-primary">
                Fitur
              </a>
              <a href="#screenshots" className="transition-colors hover:text-primary">
                Tangkapan Layar
              </a>
              <a href="#tech" className="transition-colors hover:text-primary">
                Teknologi
              </a>
              <a href="#start" className="transition-colors hover:text-primary">
                Mulai
              </a>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeSwitcher />
              <div className="hidden h-5 w-px bg-border sm:block" />
              <Link
                href="/login"
                className="hidden px-2.5 py-1.5 font-semibold text-[13px] transition-colors hover:text-primary sm:inline-flex"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 font-semibold text-[13px] text-primary-fg transition-[transform,background-color] duration-200 ease-out hover:-translate-y-px hover:bg-primary/90"
              >
                Daftar
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero — split diptych */}
        <section className="px-4 pt-24 pb-32 sm:px-6 sm:pt-28 sm:pb-40 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
            <div className="min-w-0">
              <div className="stagger-1 inline-flex animate-fade-up items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 font-semibold text-[11px] text-muted-fg">
                <IconBolt size={13} className="text-primary" />
                Laravel 12 + React 19 + Inertia.js
              </div>

              <h1 className="overflow-wrap-anywhere stagger-2 mt-6 animate-fade-up font-extrabold text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[1.05] tracking-tight">
                Sistem Point of Sale
                <span className="block text-primary">Modern &amp; Andal</span>
              </h1>

              <p className="stagger-3 mt-6 max-w-xl animate-fade-up text-base text-muted-fg leading-relaxed sm:text-lg">
                Aplikasi kasir berbasis web untuk warung, toko, dan bisnis retail kecil-menengah.
                Cepat, <span className="font-semibold text-fg">offline-ready</span>, dan mudah
                digunakan.
              </p>

              <div className="stagger-4 mt-8 flex animate-fade-up flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-fg text-sm transition-[transform,background-color] duration-200 ease-out hover:-translate-y-[1.5px] hover:bg-primary/90 active:translate-y-0"
                >
                  Mulai Sekarang
                  <IconArrowRight size={18} />
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-bg px-6 py-3 font-semibold text-fg text-sm transition-colors duration-200 ease-out hover:border-primary/40 hover:text-primary"
                  rel="noopener"
                >
                  <IconBrandGithub size={18} />
                  Lihat Kode
                </a>
              </div>
            </div>

            <figure className="min-w-0">
              <div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
                <img
                  src="/media/revamp-dashboard.png"
                  alt="Dashboard Nightdays POS"
                  width={1895}
                  height={907}
                  loading="eager"
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-3 flex items-center gap-2 font-mono text-muted-fg text-xs">
                <IconArrowRight size={12} className="shrink-0 text-primary" />
                Dashboard Nightdays POS
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Receipt marquee strip */}
        <div
          role="region"
          aria-label="Contoh transaksi"
          className="group flex overflow-hidden border-border border-y bg-secondary py-3"
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className={`flex shrink-0 animate-marquee items-center gap-[var(--gap)] pr-[var(--gap)] [--duration:30s] [--gap:3rem] group-hover:[animation-play-state:paused] ${copy === 1 ? "motion-reduce:hidden" : ""}`}
            >
              {receiptItems.map((item) => (
                <span key={item.name} className="flex items-baseline gap-2 whitespace-nowrap">
                  <span className="font-medium text-secondary-fg text-sm">{item.name}</span>
                  <span className="w-6 flex-1 border-secondary-fg/30 border-b border-dotted" />
                  <span className="font-semibold text-secondary-fg text-sm tabular-nums">
                    {item.price}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Stats — T4 strip */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-extrabold text-3xl tabular-nums tracking-tight sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 font-medium text-[13px] text-muted-fg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — hairline matrix */}
        <section id="features" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="overflow-wrap-anywhere min-w-0 font-bold text-3xl tracking-tight sm:text-4xl">
                Semua yang Anda Butuhkan untuk <span className="text-primary">Mengelola Toko</span>
              </h2>
              <p className="mt-4 text-muted-fg text-sm leading-relaxed sm:text-base">
                Dari transaksi hingga laporan — setiap fitur dirancang untuk alur kerja bisnis
                retail yang sebenarnya.
              </p>
            </div>

            <div className="mt-12 grid border-border border-t border-l sm:grid-cols-2">
              {features.map((feature, i) => (
                <div key={i} className="border-border border-r border-b p-6 sm:p-8">
                  <feature.icon size={20} className="text-primary" />
                  <h3 className="mt-4 font-bold text-base tracking-tight">{feature.title}</h3>
                  <p className="mt-1.5 text-[13px] text-muted-fg leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots — Workbench tour */}
        <section id="screenshots" className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="overflow-wrap-anywhere min-w-0 font-bold text-3xl tracking-tight sm:text-4xl">
                Lihat Aplikasi dalam Aksi
              </h2>
              <p className="mt-4 text-muted-fg text-sm leading-relaxed sm:text-base">
                Antarmuka yang bersih, responsif, dan nyaman digunakan sehari-hari.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
              {screenshots.map((shot, i) => (
                <figure key={i} className={`min-w-0 ${i % 2 === 1 ? "sm:mt-14" : ""}`}>
                  <div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
                    <img
                      src={shot.src}
                      alt={shot.alt}
                      width={shot.width}
                      height={shot.height}
                      loading="lazy"
                      className="h-auto w-full"
                    />
                  </div>
                  <figcaption className="mt-3 flex items-center gap-2 font-mono text-muted-fg text-xs">
                    <IconArrowRight size={12} className="shrink-0 text-primary" />
                    {shot.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Architecture */}
        <section className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="overflow-wrap-anywhere min-w-0 font-bold text-3xl tracking-tight sm:text-4xl">
                Dibangun dengan <span className="text-primary">Stack Modern</span>
              </h2>
              <p className="mt-4 text-muted-fg text-sm leading-relaxed sm:text-base">
                Monolith SPA — backend dan frontend dalam satu aplikasi yang kohesif.
              </p>
            </div>

            <div className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row md:gap-0">
              {[
                { label: "Laravel 12", sub: "Routing · ORM · Auth · Queue" },
                { label: "Inertia.js", sub: "Server-driven SPA" },
                { label: "React 19", sub: "UI Components · Hooks" },
              ].map((layer, i) => (
                <div key={i} className="flex items-center">
                  <div className="min-w-[180px] rounded-lg border border-border bg-bg px-6 py-5 text-center">
                    <div className="font-bold text-sm tracking-tight">{layer.label}</div>
                    <div className="mt-1 text-[11px] text-muted-fg">{layer.sub}</div>
                  </div>
                  {i < 2 && (
                    <div className="hidden items-center px-3 md:flex">
                      <IconArrowRight size={14} className="text-muted-fg" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mx-auto mt-10 max-w-2xl">
              <div className="rounded-xl border border-border bg-muted/50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <IconDatabase size={15} className="text-muted-fg" />
                  <span className="font-semibold text-[11px] text-muted-fg uppercase tracking-wider">
                    Alur Data
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {["PostgreSQL", "Eloquent", "Inertia", "React", "Tailwind"].map(
                    (chip, i, arr) => (
                      <span key={chip} className="flex items-center gap-2">
                        <span className="rounded-md border border-border bg-bg px-2.5 py-1 text-fg">
                          {chip}
                        </span>
                        {i < arr.length - 1 && <span className="text-muted-fg">→</span>}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section id="tech" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="overflow-wrap-anywhere min-w-0 font-bold text-3xl tracking-tight sm:text-4xl">
                Tech Stack
              </h2>
              <p className="mt-4 text-muted-fg text-sm leading-relaxed sm:text-base">
                Setiap lapisan teknologi dipilih untuk keseimbangan performa, produktivitas, dan
                kemudahan maintenance.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
              {techStack.map((tech, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-lg border border-border bg-bg p-5 ${
                    i === techStack.length - 1 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-fg">
                    <tech.icon size={19} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm tracking-tight">{tech.name}</div>
                    <div className="mt-0.5 text-[13px] text-muted-fg leading-relaxed">
                      {tech.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Start — F4 steps */}
        <section id="start" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="overflow-wrap-anywhere min-w-0 font-bold text-3xl tracking-tight sm:text-4xl">
                Jalankan dalam 5 Menit
              </h2>
            </div>

            <ol className="mt-12 max-w-2xl space-y-8">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-5">
                  <span className="w-6 shrink-0 pt-3 font-mono text-muted-fg text-xs tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm tracking-tight">{step.label}</h3>
                    <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted px-4 py-3 font-mono text-[13px] text-fg leading-relaxed">
                      <span className="select-none text-muted-fg">$ </span>
                      {step.cmd}
                    </pre>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex max-w-2xl items-start gap-3 text-muted-fg text-sm">
              <IconCheck size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>Membutuhkan PHP 8.4+, PostgreSQL, Composer, dan Node.js 20+</span>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="overflow-wrap-anywhere min-w-0 font-bold text-3xl tracking-tight sm:text-4xl">
              Siap Modernisasi Bisnis Anda?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-fg text-sm leading-relaxed sm:text-base">
              Daftar gratis dan rasakan kemudahan mengelola toko dengan sistem POS modern.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-semibold text-primary-fg text-sm transition-[transform,background-color] duration-200 ease-out hover:-translate-y-[1.5px] hover:bg-primary/90 active:translate-y-0"
            >
              Daftar Gratis Sekarang
              <IconArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Footer — Ft2 inline */}
        <footer className="border-border border-t px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <BrandMark className="h-5 w-auto text-fg" />
            <div className="flex items-center gap-5 text-[13px] text-muted-fg">
              <a href="https://github.com" className="transition-colors hover:text-primary">
                GitHub
              </a>
              <a href="https://laravel.com" className="transition-colors hover:text-primary">
                Laravel
              </a>
              <a href="https://react.dev" className="transition-colors hover:text-primary">
                React
              </a>
            </div>
            <p className="text-[12px] text-muted-fg/70">
              &copy; {new Date().getFullYear()} Nightdays POS. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
