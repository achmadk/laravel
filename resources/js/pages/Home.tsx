import { Head, Link } from "@inertiajs/react";
import {
  IconShoppingCart,
  IconCoin,
  IconClock,
  IconTrendingUp,
  IconArrowRight,
} from "@tabler/icons-react";
import AppLayout from "@/layouts/app-layout";
import * as transactions from "@/routes/transactions";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
};

const formatDate = () => {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

export default function Home({
  user,
  today,
  recentTransactions,
  topProducts,
  activeShift,
}: {
  user: { name: string; role: string };
  today: { transactions: number; sales: number; profit: number };
  recentTransactions: Array<{
    invoice: string;
    date: string;
    customer: string;
    total: number;
  }>;
  topProducts: Array<{ name: string; qty: number }>;
  activeShift: { id: number; opened_at: string } | null;
}) {
  return (
    <>
      <Head title="Home" />
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-bold text-3xl text-slate-900 dark:text-white">
              {getGreeting()}, {user.name.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-slate-500 text-sm dark:text-slate-400">{formatDate()}</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <IconCoin className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-500 text-xs dark:text-slate-400">
                    Penjualan Hari Ini
                  </p>
                  <p className="font-bold text-slate-900 text-xl dark:text-white">
                    {formatCurrency(today.sales)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-success/10 p-2.5">
                  <IconTrendingUp className="size-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-slate-500 text-xs dark:text-slate-400">
                    Profit Hari Ini
                  </p>
                  <p className="font-bold text-slate-900 text-xl dark:text-white">
                    {formatCurrency(today.profit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-warning/10 p-2.5">
                  <IconClock className="size-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-slate-500 text-xs dark:text-slate-400">
                    Transaksi Hari Ini
                  </p>
                  <p className="font-bold text-slate-900 text-xl dark:text-white">
                    {today.transactions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {activeShift && (
            <div className="mb-8 rounded-2xl border border-success/20 bg-success/5 p-4">
              <div className="flex items-center gap-2 font-medium text-sm text-success">
                <span className="size-2 animate-pulse rounded-full bg-success" />
                Shift aktif — kasir sedang open
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-slate-200 border-b px-5 py-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 text-sm dark:text-white">
                  Transaksi Terbaru
                </h2>
                <Link
                  href={transactions.index.url()}
                  className="flex items-center gap-1 font-medium text-primary text-xs hover:text-primary/80"
                >
                  Lihat semua
                  <IconArrowRight size={12} />
                </Link>
              </div>
              <div className="p-5">
                {recentTransactions.length === 0 ? (
                  <p className="text-slate-400 text-sm">Belum ada transaksi hari ini.</p>
                ) : (
                  <div className="space-y-3">
                    {recentTransactions.map((trx) => (
                      <div
                        key={trx.invoice}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 text-sm dark:text-white">
                            {trx.invoice}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {trx.date} · {trx.customer}
                          </p>
                        </div>
                        <p className="font-bold text-primary text-sm">
                          {formatCurrency(trx.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-slate-200 border-b px-5 py-4 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 text-sm dark:text-white">
                  Produk Terlaris Hari Ini
                </h2>
              </div>
              <div className="p-5">
                {topProducts.length === 0 ? (
                  <p className="text-slate-400 text-sm">Belum ada data penjualan.</p>
                ) : (
                  <div className="space-y-3">
                    {topProducts.map((product, i) => (
                      <div key={product.name} className="flex items-center gap-3">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900 text-sm dark:text-white">
                            {product.name}
                          </p>
                        </div>
                        <span className="font-semibold text-slate-500 text-xs">{product.qty}x</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={transactions.index.url()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-sm text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              <IconShoppingCart size={18} />
              Mulai Transaksi
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

Home.layout = (page: React.ReactNode) => <AppLayout children={page} />;
