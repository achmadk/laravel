import { Head, Link, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  IconBox,
  IconCategory,
  IconMoneybag,
  IconUsers,
  IconCoin,
  IconReceipt,
  IconTrendingUp,
  IconArrowUpRight,
  IconArrowDownRight,
  IconShoppingCart,
  IconChartBar,
  IconClock,
  IconAlertTriangle,
  IconPackageOff,
  IconTarget,
  IconMapPin,
  IconWallet,
  IconPlus,
} from "@tabler/icons-react";
import * as transactions from "@/routes/transactions";
import * as products from "@/routes/products";
import * as customers from "@/routes/customers";
import { useAuthorization } from "@/lib/auth";
import DashboardLayout from "@/layouts/dashboard-layout";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  return "malam";
};

const formattedDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(new Date());

function calcGrowth(
  current: number,
  previous: number,
): { pct: number; direction: "up" | "down" | "flat" } {
  if (previous === 0) return { pct: current > 0 ? 100 : 0, direction: "up" };
  const pct = ((current - previous) / previous) * 100;
  if (pct > 0) return { pct: Math.round(pct), direction: "up" };
  if (pct < 0) return { pct: Math.round(Math.abs(pct)), direction: "down" };
  return { pct: 0, direction: "flat" };
}

function StatCard({ title, value, subtitle, icon: Icon, gradient, growth }: any) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ${gradient} text-white shadow-lg`}
    >
      <div className="absolute top-0 right-0 size-32 opacity-20">
        <Icon size={128} strokeWidth={0.5} className="translate-x-8 -translate-y-8" />
      </div>
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-white/20 p-2">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <span className="font-medium text-sm opacity-90">{title}</span>
        </div>
        <p className="font-bold text-3xl">{value}</p>
        {growth && (
          <p className="mt-2 flex items-center gap-1 text-xs opacity-80">
            {growth.direction === "up" && <IconArrowUpRight size={14} />}
            {growth.direction === "down" && <IconArrowDownRight size={14} />}
            {growth.direction === "up" && `${growth.pct}%`}
            {growth.direction === "down" && `${growth.pct}%`}
            {growth.direction === "flat" && "—"}
            <span>dari kemarin</span>
          </p>
        )}
        {subtitle && !growth && (
          <p className="mt-2 flex items-center gap-1 text-sm opacity-80">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function TargetCard({ title, current, target, icon: Icon }: any) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isAchieved = percentage >= 100;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 text-white shadow-lg">
      <div className="absolute top-0 right-0 size-32 opacity-20">
        <Icon size={128} strokeWidth={0.5} className="translate-x-8 -translate-y-8" />
      </div>
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <div className="rounded-xl bg-white/20 p-2">
            <Icon size={20} strokeWidth={1.5} />
          </div>
          <span className="font-medium text-sm opacity-90">{title}</span>
        </div>
        <p className="font-bold text-2xl">{percentage.toFixed(0)}%</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/30">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAchieved ? "bg-green-400" : "bg-white"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs opacity-80">
          {formatCurrency(current)} / {formatCurrency(target)}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-2xl border border-border bg-bg p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-fg text-sm">{title}</p>
          <p className="mt-2 font-bold text-2xl text-fg">{value}</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <Icon size={24} className="text-muted-fg" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function ListCard({ title, subtitle, icon: Icon, children, emptyMessage, action }: any) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg">
      <div className="border-border border-b p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-fg text-sm">{title}</h3>
            {subtitle && <p className="text-muted-fg text-xs">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">
        {children || (
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-muted-fg text-sm">
            <div className="rounded-full bg-muted p-3">
              <Icon size={20} className="text-muted-fg/50" />
            </div>
            <span>{emptyMessage}</span>
            {action && (
              <Link
                href={action.url}
                className="inline-flex items-center gap-1.5 font-medium text-primary text-xs hover:text-primary/80"
              >
                <IconPlus size={14} />
                {action.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({
  totalCategories = 0,
  totalProducts = 0,
  totalTransactions = 0,
  totalCustomers = 0,
  revenueTrend = [],
  totalRevenue = 0,
  totalProfit = 0,
  averageOrder = 0,
  todayTransactions = 0,
  todaySales = 0,
  todayProfit = 0,
  monthlyTarget = 0,
  currentMonthSales = 0,
  topProducts = [],
  slowMovingProducts = [],
  recentTransactions = [],
  topCustomers = [],
  topLocations = [],
  lowStockProducts = [],
  activeShifts = [],
  yesterdaySales = 0,
  yesterdayProfit = 0,
  yesterdayTransactions = 0,
}: any) {
  const { auth } = usePage<any>().props;
  const userName = auth?.user?.name || "Pengguna";
  const { isSuperAdmin } = useAuthorization();
  const isSuper = isSuperAdmin();

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const chartData = useMemo(() => revenueTrend ?? [], [revenueTrend]);

  const [period, setPeriod] = useState(12);
  const displayChartData = useMemo(() => {
    return chartData.slice(-period);
  }, [chartData, period]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    if (!displayChartData.length) return;

    const labels = displayChartData.map((item: any) => item.label);
    const totals = displayChartData.map((item: any) => item.total);
    const ctx = chartRef.current.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.01)");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Pendapatan",
            data: totals,
            borderColor: "#6366f1",
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#6366f1",
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#f1f5f9",
            bodyColor: "#f1f5f9",
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: { label: (ctx: any) => formatCurrency(ctx.raw) },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => formatCurrency(value),
              color: "#94a3b8",
              font: { size: 11 },
            },
            grid: { color: "rgba(148, 163, 184, 0.1)" },
            border: { display: false },
          },
          x: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });
    return () => chartInstance.current?.destroy();
  }, [displayChartData]);

  const salesGrowth = calcGrowth(todaySales, yesterdaySales);
  const profitGrowth = calcGrowth(todayProfit, yesterdayProfit);
  const txGrowth = calcGrowth(todayTransactions, yesterdayTransactions);

  return (
    <>
      <Head title="Dashboard" />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-2xl text-fg">Dashboard</h1>
          <p className="text-muted-fg text-sm">Ringkasan aktivitas bisnis Anda</p>
        </div>
        <Link
          href={transactions.index.url()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
        >
          <IconShoppingCart size={18} />
          <span>Transaksi Baru</span>
        </Link>
      </div>

      {isSuper && (
        <div className="rounded-2xl border border-border bg-bg px-6 py-4">
          <p className="font-semibold text-fg text-lg">
            Selamat {getGreeting()}, {userName}!
          </p>
          <p className="mt-0.5 text-muted-fg text-sm">{formattedDate}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Penjualan Hari Ini"
          value={formatCurrency(todaySales)}
          icon={IconCoin}
          gradient="from-primary to-primary/70"
          growth={isSuper ? salesGrowth : undefined}
        />
        <StatCard
          title="Profit Hari Ini"
          value={formatCurrency(todayProfit)}
          icon={IconTrendingUp}
          gradient="from-success to-success/70"
          growth={isSuper ? profitGrowth : undefined}
        />
        <TargetCard
          title="Target Bulan Ini"
          current={currentMonthSales}
          target={monthlyTarget}
          icon={IconTarget}
        />
        <StatCard
          title="Transaksi Hari Ini"
          value={todayTransactions}
          icon={IconClock}
          gradient="from-warning to-warning/80"
          growth={isSuper ? txGrowth : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <InfoCard title="Total Kategori" value={totalCategories} icon={IconCategory} />
        <InfoCard title="Total Produk" value={totalProducts} icon={IconBox} />
        <InfoCard title="Total Transaksi" value={totalTransactions} icon={IconMoneybag} />
        <InfoCard title="Total Pelanggan" value={totalCustomers} icon={IconUsers} />
      </div>

      {isSuper && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <InfoCard title="Total Pendapatan" value={formatCurrency(totalRevenue)} icon={IconCoin} />
          <InfoCard
            title="Total Profit"
            value={formatCurrency(totalProfit)}
            icon={IconTrendingUp}
          />
          <InfoCard
            title="Rata-rata Pesanan"
            value={formatCurrency(averageOrder)}
            icon={IconChartBar}
          />
        </div>
      )}

      {/* Revenue chart */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-border border-b p-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <IconChartBar size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-fg text-sm">Tren Pendapatan</h3>
              <p className="text-muted-fg text-xs">
                {isSuper ? `${period} data terakhir` : "Riwayat pendapatan"}
              </p>
            </div>
          </div>
          {isSuper && (
            <div className="flex gap-1 rounded-lg bg-muted p-0.5">
              {[7, 14, 30, 12].map((d) => {
                const label = d === 12 ? "semua" : `${d} hari`;
                const count = d === 12 ? chartData.length : d;
                return (
                  <button
                    key={d}
                    onClick={() => setPeriod(count)}
                    className={`rounded-md px-3 py-1.5 font-medium text-xs transition-colors ${
                      period === count ? "bg-bg text-fg shadow-sm" : "text-muted-fg hover:text-fg"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-5">
          {displayChartData.length > 0 ? (
            <div className="h-72">
              <canvas ref={chartRef} />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center text-muted-fg text-sm">
              Belum ada data pendapatan
            </div>
          )}
        </div>
      </div>

      {/* 4-column insight widgets */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ListCard
          title="Shift Aktif"
          subtitle="Pemantauan kasir"
          icon={IconWallet}
          emptyMessage="Tidak ada shift aktif"
        >
          {activeShifts.length > 0 && (
            <div className="divide-y divide-border">
              {activeShifts.map((shift: any) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-fg text-sm">{shift.user?.name || "-"}</p>
                    <p className="text-muted-fg text-xs">{shift.transactions_count} transaksi</p>
                  </div>
                  <span className="font-medium text-success text-xs">
                    {formatCurrency(shift.expected_cash)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ListCard>
        <ListCard
          title="Produk Terlaris"
          subtitle="Best seller"
          icon={IconBox}
          emptyMessage="Belum ada data penjualan"
          action={isSuper ? { url: products.index.url(), label: "Lihat produk" } : undefined}
        >
          {topProducts.length > 0 && (
            <div className="divide-y divide-border">
              {topProducts.slice(0, 3).map((product: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="line-clamp-1 font-semibold text-fg text-sm">{product.name}</p>
                      <p className="text-muted-fg text-xs">SKU: {product.sku || "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-base text-primary leading-tight">
                      {product.qty}x
                    </p>
                    <p className="text-[11px] text-muted-fg uppercase tracking-wide">Terjual</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ListCard>
        <ListCard
          title="Slow Moving"
          subtitle="Tidak terjual 30 hari"
          icon={IconPackageOff}
          emptyMessage="Semua produk laku"
          action={isSuper ? { url: products.index.url(), label: "Cek stok" } : undefined}
        >
          {slowMovingProducts.length > 0 && (
            <ul className="divide-y divide-border">
              {slowMovingProducts.map((product: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-warning/10 font-semibold text-warning text-xs">
                      {index + 1}
                    </span>
                    <span className="max-w-[120px] truncate text-fg text-sm">{product.name}</span>
                  </div>
                  <span className="font-semibold text-warning text-xs">{product.stock} pcs</span>
                </li>
              ))}
            </ul>
          )}
        </ListCard>
        <ListCard
          title="Pelanggan Terbaik"
          subtitle="Top spender"
          icon={IconUsers}
          emptyMessage="Belum ada data pelanggan"
          action={isSuper ? { url: customers.index.url(), label: "Lihat pelanggan" } : undefined}
        >
          {topCustomers.length > 0 && (
            <ul className="divide-y divide-border">
              {topCustomers.slice(0, 5).map((customer: any, index: number) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-muted font-semibold text-muted-fg text-sm">
                      {index + 1}
                    </span>
                    <span className="text-fg text-sm">{customer.name}</span>
                  </div>
                  <span className="font-semibold text-muted-fg text-xs">{customer.orders}x</span>
                </li>
              ))}
            </ul>
          )}
        </ListCard>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${isSuper ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
        <ListCard
          title="Transaksi Terbaru"
          subtitle="5 transaksi terakhir"
          icon={IconReceipt}
          emptyMessage="Belum ada transaksi"
          action={isSuper ? { url: transactions.index.url(), label: "Lihat transaksi" } : undefined}
        >
          {recentTransactions.length > 0 && (
            <div className="divide-y divide-border">
              {recentTransactions.map((trx: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-fg text-sm">{trx.invoice}</p>
                    <p className="mt-0.5 text-muted-fg text-xs">{trx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">{formatCurrency(trx.total)}</p>
                    <p className="text-[11px] text-muted-fg">{trx.cashier}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ListCard>

        {isSuper && (
          <ListCard
            title="Lokasi Teratas"
            subtitle="Wilayah pelanggan"
            icon={IconMapPin}
            emptyMessage="Belum ada data lokasi"
          >
            {topLocations.length > 0 && (
              <ul className="divide-y divide-border">
                {topLocations.map((loc: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                        {index + 1}
                      </span>
                      <span className="text-fg text-sm">{loc.name}</span>
                    </div>
                    <span className="font-semibold text-muted-fg text-xs">{loc.orders}x</span>
                  </li>
                ))}
              </ul>
            )}
          </ListCard>
        )}

        <ListCard
          title="Stok Menipis"
          subtitle="Stok &lt; 10"
          icon={IconAlertTriangle}
          emptyMessage="Semua stok aman"
          action={isSuper ? { url: products.index.url(), label: "Cek produk" } : undefined}
        >
          {lowStockProducts.length > 0 && (
            <div className="divide-y divide-border">
              {lowStockProducts.map((product: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-danger/10 font-semibold text-danger text-xs">
                      {index + 1}
                    </span>
                    <span className="max-w-[140px] truncate font-semibold text-fg text-sm">
                      {product.name}
                    </span>
                  </div>
                  <span className="font-semibold text-danger text-xs">{product.stock} pcs</span>
                </div>
              ))}
            </div>
          )}
        </ListCard>
      </div>
    </>
  );
}

Dashboard.layout = DashboardLayout;
