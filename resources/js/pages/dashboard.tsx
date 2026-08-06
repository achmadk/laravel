import { Head, Link } from "@inertiajs/react";
import { useEffect, useMemo, useRef } from "react";
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
  IconWallet,
} from "@tabler/icons-react";
import * as transactions from "@/routes/transactions";
import DashboardLayout from "@/layouts/dashboard-layout";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

function StatCard({ title, value, subtitle, icon: Icon, gradient, trend }: any) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ${gradient} shadow-lg`}
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
        {subtitle && (
          <p className="mt-2 flex items-center gap-1 text-sm opacity-80">
            {trend === "up" && <IconArrowUpRight size={14} />}
            {trend === "down" && <IconArrowDownRight size={14} />}
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function TargetCard({ title, current, target, icon: Icon }: any) {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isAchieved = percentage >= 100;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/70 p-5 text-primary-fg shadow-lg">
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

function ListCard({ title, subtitle, icon: Icon, children, emptyMessage }: any) {
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
          <div className="flex h-32 items-center justify-center text-muted-fg text-sm">
            {emptyMessage}
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
  // oxlint-disable-next-line no-unused-vars
  totalRevenue = 0,
  // oxlint-disable-next-line no-unused-vars
  totalProfit = 0,
  // oxlint-disable-next-line no-unused-vars
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
  // oxlint-disable-next-line no-unused-vars
  topLocations = [],
  lowStockProducts = [],
  activeShifts = [],
}: any) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const chartData = useMemo(() => revenueTrend ?? [], [revenueTrend]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    if (!chartData.length) return;

    const labels = chartData.map((item: any) => item.label);
    const totals = chartData.map((item: any) => item.total);
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
  }, [chartData]);

  return (
    <>
      <Head title="Dashboard" />
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Penjualan Hari Ini"
            value={formatCurrency(todaySales)}
            subtitle="Total penjualan hari ini"
            icon={IconCoin}
            gradient="from-primary to-primary/70 text-primary-fg"
          />
          <StatCard
            title="Profit Hari Ini"
            value={formatCurrency(todayProfit)}
            subtitle="Profit bersih hari ini"
            icon={IconTrendingUp}
            gradient="from-success to-success/70 text-success-fg"
            trend="up"
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
            subtitle="Transaksi"
            icon={IconClock}
            gradient="from-warning to-warning/80 text-warning-fg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <InfoCard title="Total Kategori" value={totalCategories} icon={IconCategory} />
          <InfoCard title="Total Produk" value={totalProducts} icon={IconBox} />
          <InfoCard title="Total Transaksi" value={totalTransactions} icon={IconMoneybag} />
          <InfoCard title="Total Pelanggan" value={totalCustomers} icon={IconUsers} />
        </div>

        <ListCard
          title="Tren Pendapatan"
          subtitle="12 data terakhir"
          icon={IconChartBar}
          emptyMessage="Belum ada data pendapatan"
        >
          {chartData.length > 0 && (
            <div className="h-72">
              <canvas ref={chartRef} />
            </div>
          )}
        </ListCard>

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
                    <span className="font-medium text-emerald-600 text-xs dark:text-emerald-400">
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
            emptyMessage="Belum ada data"
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
          >
            {slowMovingProducts.length > 0 && (
              <ul className="divide-y divide-border">
                {slowMovingProducts.map((product: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-full bg-muted font-semibold text-muted-fg text-sm">
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
            emptyMessage="Belum ada data"
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

        <ListCard
          title="Transaksi Terbaru"
          subtitle="5 transaksi terakhir"
          icon={IconReceipt}
          emptyMessage="Belum ada transaksi"
        >
          {recentTransactions.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {recentTransactions.map((trx: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl bg-muted p-3"
                >
                  <div>
                    <p className="font-semibold text-fg text-sm">{trx.invoice}</p>
                    <p className="mt-0.5 text-muted-fg text-xs">
                      {trx.date} &bull; {trx.customer}
                    </p>
                  </div>
                  <p className="font-bold text-primary text-sm">{formatCurrency(trx.total)}</p>
                </div>
              ))}
            </div>
          )}
        </ListCard>

        <ListCard
          title="Stok Menipis"
          subtitle="Stok &lt; 10"
          icon={IconAlertTriangle}
          emptyMessage="Semua stok aman"
        >
          {lowStockProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-danger/20 bg-danger/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-danger/10 font-semibold text-danger text-sm">
                      {index + 1}
                    </span>
                    <span className="max-w-[140px] truncate font-semibold text-danger text-sm">
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
