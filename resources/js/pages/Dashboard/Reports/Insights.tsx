import { useEffect, useMemo, useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  IconChartBar,
  IconClock,
  IconCoin,
  IconDatabaseOff,
  IconFilter,
  IconPackage,
  IconReceipt2,
  IconSearch,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import Chart from "chart.js/auto";
import DashboardLayout from "@/layouts/dashboard-layout";
import reports from "@/routes/reports";

const defaultFilters = {
  start_date: "",
  end_date: "",
  cashier_id: "",
  customer_id: "",
  category_id: "",
};

function formatCurrency(value = 0): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value = 0): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string | null | undefined): string {
  return value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";
}

const coverageStatusConfig: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Kritis",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
  low: {
    label: "Rendah",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  healthy: {
    label: "Sehat",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  no_movement: {
    label: "Tidak Bergerak",
    className: "bg-muted text-muted-fg ",
  },
};

const promoStatusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Aktif",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  scheduled: {
    label: "Terjadwal",
    className: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  expired: {
    label: "Berakhir",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  inactive: {
    label: "Nonaktif",
    className: "bg-muted text-muted-fg ",
  },
};

const promoKindLabel: Record<string, string> = {
  standard_discount: "Discount",
  qty_break: "Grosir",
  bundle_price: "Bundle",
  buy_x_get_y: "BXGY",
};

const crmCampaignTypeLabel: Record<string, string> = {
  promo_broadcast: "Promo Broadcast",
  invoice_share: "Invoice Share",
  due_date_reminder: "Due Reminder",
  repeat_order_reminder: "Repeat Order",
};

interface Cashier {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface HourData {
  label: string;
  hour: number;
  orders_count: number;
  revenue_total: number;
}

interface DayData {
  label: string;
  date: string;
  revenue_total: number;
}

interface SummaryData {
  revenue_total: number;
  orders_count: number;
  profit_total: number;
  average_order: number;
  items_sold: number;
  manual_discount_total: number;
}

interface TopProduct {
  product_id: number;
  product_title: string;
  product_sku: string;
  category_name: string;
  qty_sold: number;
  revenue_total: number;
  profit_total: number;
}

interface LowProduct {
  product_id: number;
  product_title: string;
  category_name: string;
  current_stock: number;
  qty_sold: number;
  revenue_total: number;
  last_sold_at: string;
}

interface MarginItem {
  product_title?: string;
  category_name?: string;
  qty_sold: number;
  revenue_total: number;
  profit_total: number;
  margin_percentage: number;
}

interface CashierPerfItem {
  cashier_id: number;
  cashier_name: string;
  orders_count: number;
  items_sold: number;
  revenue_total: number;
  profit_total: number;
  average_basket: number;
}

interface RepeatSummary {
  active_customers: number;
  new_customers: number;
  repeat_rate: number;
  repeat_customers: number;
  member_revenue_share: number;
  member_revenue_total: number;
  non_member_revenue_total: number;
  repeat_revenue_total: number;
}

interface RepeatCustomer {
  customer_id: number;
  customer_name: string;
  loyalty_tier: string;
  is_loyalty_member: boolean;
  orders_count: number;
  revenue_total: number;
  average_basket: number;
  last_purchase_at: string;
}

interface StockCoverageSummary {
  critical: number;
  low: number;
  healthy: number;
  no_movement: number;
  window_days: number;
}

interface StockCoverageProduct {
  product_id: number;
  product_title: string;
  category_name: string;
  coverage_status: string;
  current_stock: number;
  qty_sold: number;
  average_daily_qty: number;
  coverage_days: number | null;
  last_sold_at: string;
}

interface PromoSummary {
  active: number;
  scheduled: number;
  by_kind: Record<string, number>;
}

interface PromoRule {
  id: number;
  name: string;
  kind: string;
  status_label: string;
  product_title: string | null;
  category_name: string | null;
  target_type: string;
  starts_at: string;
  ends_at: string;
}

interface PromoAudit {
  id: number;
  description: string;
  event: string;
  created_at: string;
}

interface PromoMonitor {
  summary: PromoSummary;
  active_rules: PromoRule[];
  scheduled_rules: PromoRule[];
  recent_audits: PromoAudit[];
}

interface LoyaltySummary {
  total_members: number;
  points_balance_total: number;
  points_earned: number;
  points_redeemed: number;
  tier_distribution: Record<string, number>;
  voucher_summary: {
    active: number;
    used: number;
  };
  voucher_discount_total: number;
}

interface LoyaltyMember {
  id: number;
  name: string;
  loyalty_tier: string;
  loyalty_points: number;
  loyalty_total_spent: number;
}

interface LoyaltyPerformance {
  summary: LoyaltySummary;
  top_members: LoyaltyMember[];
}

interface CRMSummary {
  segments_active: number;
  campaigns_draft: number;
  campaigns_ready: number;
  queue_ready_to_send: number;
  queue_sent: number;
  segments_manual: number;
  segments_auto: number;
  memberships_total: number;
  campaigns_processed: number;
}

interface CRMCampaign {
  id: number;
  name: string;
  type: string;
  status: string;
  logs_count: number;
  processed_at: string;
  created_at: string;
}

interface CRMOps {
  summary: CRMSummary;
  recent_campaigns: CRMCampaign[];
}

interface Filters {
  start_date: string;
  end_date: string;
  cashier_id: string;
  customer_id: string;
  category_id: string;
}

interface PageProps {
  filters: Filters;
  cashiers: Cashier[];
  customers: Customer[];
  categories: Category[];
  summary: SummaryData;
  salesByHour: HourData[];
  salesByDay: DayData[];
  topSellingProducts: TopProduct[];
  lowPerformingProducts: LowProduct[];
  marginByProduct: MarginItem[];
  marginByCategory: MarginItem[];
  cashierPerformance: CashierPerfItem[];
  repeatCustomerMetrics: { summary: RepeatSummary; top_customers: RepeatCustomer[] };
  stockCoverage: { summary: StockCoverageSummary; products: StockCoverageProduct[] };
  promoMonitor: PromoMonitor;
  loyaltyPerformance: LoyaltyPerformance;
  crmOperations: CRMOps;
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-lg`}
    >
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-xl bg-white/20 p-2">
            <Icon size={18} />
          </div>
          <span className="text-sm font-medium opacity-90">{title}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="mt-1 text-sm opacity-80">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <IconDatabaseOff size={24} className="text-muted-fg" />
        </div>
        <p className="text-sm text-muted-fg">{message}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  chartRef,
  hasData,
}: {
  title: string;
  subtitle: string;
  chartRef: React.RefObject<HTMLCanvasElement | null>;
  hasData: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        <p className="text-sm text-muted-fg">{subtitle}</p>
      </div>
      {hasData ? (
        <div className="h-72">
          <canvas ref={chartRef} />
        </div>
      ) : (
        <EmptyState message="Belum ada data untuk periode ini." />
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-4 text-left text-xs font-semibold uppercasetext-muted-fg ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 text-sm text-fg ${className}`}>{children}</td>;
}

export default function Insights({
  filters,
  cashiers,
  customers,
  categories,
  summary,
  salesByHour,
  salesByDay,
  topSellingProducts,
  lowPerformingProducts,
  marginByProduct,
  marginByCategory,
  cashierPerformance,
  repeatCustomerMetrics,
  stockCoverage,
  promoMonitor,
  loyaltyPerformance,
  crmOperations,
}: PageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [marginView, setMarginView] = useState<"product" | "category">("product");
  const [filterData, setFilterData] = useState({
    ...defaultFilters,
    ...filters,
  });

  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const salesHourChartRef = useRef<HTMLCanvasElement | null>(null);
  const salesHourChart = useRef<Chart | null>(null);
  const salesDayChartRef = useRef<HTMLCanvasElement | null>(null);
  const salesDayChart = useRef<Chart | null>(null);

  useEffect(() => {
    setFilterData({
      ...defaultFilters,
      ...filters,
    });
    const cashierFromFilters =
      cashiers.find((c) => String(c.id) === String(filters.cashier_id || "")) ?? null;
    const customerFromFilters =
      customers.find((c) => String(c.id) === String(filters.customer_id || "")) ?? null;
    const categoryFromFilters =
      categories.find((c) => String(c.id) === String(filters.category_id || "")) ?? null;
    setSelectedCashier(cashierFromFilters);
    setSelectedCustomer(customerFromFilters);
    setSelectedCategory(categoryFromFilters);
  }, [filters, cashiers, customers, categories]);

  const hasActiveFilters =
    filterData.start_date ||
    filterData.end_date ||
    filterData.cashier_id ||
    filterData.customer_id ||
    filterData.category_id;

  const hourChartData = useMemo(
    () => salesByHour.filter((item) => item.orders_count > 0 || item.revenue_total > 0),
    [salesByHour],
  );
  const dayChartData = useMemo(() => salesByDay, [salesByDay]);

  useEffect(() => {
    if (salesHourChart.current) {
      salesHourChart.current.destroy();
      salesHourChart.current = null;
    }
    if (!salesHourChartRef.current || !hourChartData.length) return;

    salesHourChart.current = new Chart(salesHourChartRef.current, {
      type: "bar",
      data: {
        labels: hourChartData.map((item) => item.label),
        datasets: [
          {
            label: "Omzet",
            data: hourChartData.map((item) => item.revenue_total),
            backgroundColor: "#3b82f6",
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    return () => salesHourChart.current?.destroy();
  }, [hourChartData]);

  useEffect(() => {
    if (salesDayChart.current) {
      salesDayChart.current.destroy();
      salesDayChart.current = null;
    }
    if (!salesDayChartRef.current || !dayChartData.length) return;

    salesDayChart.current = new Chart(salesDayChartRef.current, {
      type: "line",
      data: {
        labels: dayChartData.map((item) => item.label),
        datasets: [
          {
            label: "Omzet",
            data: dayChartData.map((item) => item.revenue_total),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });

    return () => salesDayChart.current?.destroy();
  }, [dayChartData]);

  const handleChange = (field: string, value: string) =>
    setFilterData((prev) => ({ ...prev, [field]: value }));

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    router.get(reports.insights.index.url({ query: filterData }), {
      preserveState: true,
      preserveScroll: true,
    });
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilterData(defaultFilters);
    setSelectedCashier(null);
    setSelectedCustomer(null);
    setSelectedCategory(null);
    router.get(reports.insights.index.url({ query: defaultFilters }), {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const marginRows = marginView === "product" ? marginByProduct : marginByCategory;
  const repeatSummary = repeatCustomerMetrics?.summary ?? ({} as RepeatSummary);
  const topRepeatCustomers = repeatCustomerMetrics?.top_customers ?? [];
  const stockCoverageSummary = stockCoverage?.summary ?? ({} as StockCoverageSummary);
  const stockCoverageProducts = stockCoverage?.products ?? [];
  const promoSummary = promoMonitor?.summary ?? ({} as PromoSummary);
  const promoActiveRules = promoMonitor?.active_rules ?? [];
  const promoScheduledRules = promoMonitor?.scheduled_rules ?? [];
  const promoRecentAudits = promoMonitor?.recent_audits ?? [];
  const loyaltySummary = loyaltyPerformance?.summary ?? ({} as LoyaltySummary);
  const loyaltyTopMembers = loyaltyPerformance?.top_members ?? [];
  const crmSummary = crmOperations?.summary ?? ({} as CRMSummary);
  const crmRecentCampaigns = crmOperations?.recent_campaigns ?? [];

  return (
    <>
      <Head title="Advanced Sales Insights" />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
              <IconChartBar size={28} className="text-primary-500" />
              Advanced Sales Insights
            </h1>
            <p className="text-sm text-muted-fg">
              Insight operasional penjualan, margin, produk, dan performa kasir dalam satu
              dashboard.
            </p>
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-bg text-fg hover:bg-muted"
            }`}
          >
            <IconFilter size={18} />
            Filter
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Pendapatan"
            value={formatCurrency(summary?.revenue_total ?? 0)}
            description={`${summary?.orders_count ?? 0} transaksi`}
            icon={IconReceipt2}
            gradient="from-primary-500 to-primary-700"
          />
          <SummaryCard
            title="Profit"
            value={formatCurrency(summary?.profit_total ?? 0)}
            description={`Rata-rata ${formatCurrency(summary?.average_order ?? 0)}`}
            icon={IconCoin}
            gradient="from-emerald-500 to-emerald-700"
          />
          <SummaryCard
            title="Item Terjual"
            value={(summary?.items_sold ?? 0).toLocaleString("id-ID")}
            description={`Diskon manual ${formatCurrency(summary?.manual_discount_total ?? 0)}`}
            icon={IconPackage}
            gradient="from-amber-500 to-amber-700"
          />
          <SummaryCard
            title="Kasir Aktif di Filter"
            value={cashierPerformance.length.toLocaleString("id-ID")}
            description="Leaderboard performa kasir"
            icon={IconUsers}
            gradient="from-fuchsia-500 to-fuchsia-700"
          />
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-border bg-bg p-5">
            <form onSubmit={applyFilters}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={filterData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={filterData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Kasir</label>
                  <select
                    value={filterData.cashier_id}
                    onChange={(e) => handleChange("cashier_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  >
                    <option value="">Semua kasir</option>
                    {cashiers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Pelanggan</label>
                  <select
                    value={filterData.customer_id}
                    onChange={(e) => handleChange("customer_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  >
                    <option value="">Semua pelanggan</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-fg">Kategori</label>
                  <select
                    value={filterData.category_id}
                    onChange={(e) => handleChange("category_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  >
                    <option value="">Semua kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-xl border border-border px-4 py-2.5 text-muted-fg transition-colors hover:bg-muted"
                  >
                    <IconX size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600"
                >
                  <IconSearch size={18} />
                  Terapkan
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Sales by Hour"
            subtitle="Pola omzet per jam dari transaksi yang lolos filter."
            chartRef={salesHourChartRef}
            hasData={hourChartData.length > 0}
          />
          <ChartCard
            title="Sales by Day"
            subtitle="Tren omzet harian pada periode aktif."
            chartRef={salesDayChartRef}
            hasData={dayChartData.length > 0}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Customer Aktif"
            value={(repeatSummary.active_customers ?? 0).toLocaleString("id-ID")}
            description={`${repeatSummary.new_customers ?? 0} pelanggan baru`}
            icon={IconUsers}
            gradient="from-sky-500 to-sky-700"
          />
          <SummaryCard
            title="Repeat Rate"
            value={`${formatPercentage(repeatSummary.repeat_rate ?? 0)}%`}
            description={`${repeatSummary.repeat_customers ?? 0} pelanggan repeat`}
            icon={IconTrendingUp}
            gradient="from-violet-500 to-violet-700"
          />
          <SummaryCard
            title="Member Revenue Share"
            value={`${formatPercentage(repeatSummary.member_revenue_share ?? 0)}%`}
            description={formatCurrency(repeatSummary.member_revenue_total ?? 0)}
            icon={IconCoin}
            gradient="from-teal-500 to-teal-700"
          />
          <SummaryCard
            title="Stok Perlu Perhatian"
            value={(
              (stockCoverageSummary.critical ?? 0) + (stockCoverageSummary.low ?? 0)
            ).toLocaleString("id-ID")}
            description={`${stockCoverageSummary.window_days ?? 0} hari jendela analisa`}
            icon={IconClock}
            gradient="from-rose-500 to-rose-700"
          />
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-fg">Top Selling Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <Th>Produk</Th>
                  <Th>Kategori</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Omzet</Th>
                  <Th className="text-right">Profit</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topSellingProducts.length > 0 ? (
                  topSellingProducts.map((item) => (
                    <tr key={item.product_id} className="hover:bg-muted ">
                      <Td>
                        <div>
                          <p className="font-semibold text-fg">{item.product_title}</p>
                          <p className="text-xs text-muted-fg">{item.product_sku || "-"}</p>
                        </div>
                      </Td>
                      <Td>{item.category_name || "-"}</Td>
                      <Td className="text-right">{item.qty_sold}</Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.revenue_total)}
                      </Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.profit_total)}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState message="Belum ada data top selling pada periode ini." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-fg">Low Performing Products</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <Th>Produk</Th>
                  <Th>Stok</Th>
                  <Th className="text-right">Qty Sold</Th>
                  <Th className="text-right">Omzet</Th>
                  <Th>Last Sold</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowPerformingProducts.length > 0 ? (
                  lowPerformingProducts.map((item) => (
                    <tr key={item.product_id} className="hover:bg-muted ">
                      <Td>
                        <div>
                          <p className="font-semibold text-fg">{item.product_title}</p>
                          <p className="text-xs text-muted-fg">{item.category_name || "-"}</p>
                        </div>
                      </Td>
                      <Td>{item.current_stock}</Td>
                      <Td className="text-right">{item.qty_sold}</Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.revenue_total)}
                      </Td>
                      <Td>{formatDateTime(item.last_sold_at)}</Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState message="Belum ada data low performing pada periode ini." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-fg">Margin per Produk / Kategori</h2>
              <p className="text-sm text-muted-fg">Perbandingan omzet, profit, dan margin kotor.</p>
            </div>
            <div className="inline-flex rounded-xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setMarginView("product")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  marginView === "product" ? "bg-bg text-primary shadow" : "text-fg"
                }`}
              >
                Per Produk
              </button>
              <button
                type="button"
                onClick={() => setMarginView("category")}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  marginView === "category" ? "bg-bg text-primary shadow" : "text-fg"
                }`}
              >
                Per Kategori
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <Th>{marginView === "product" ? "Produk" : "Kategori"}</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Omzet</Th>
                  <Th className="text-right">Profit</Th>
                  <Th className="text-right">Margin %</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {marginRows.length > 0 ? (
                  marginRows.map((item, index) => (
                    <tr key={`${marginView}-${index}`} className="hover:bg-muted ">
                      <Td>{marginView === "product" ? item.product_title : item.category_name}</Td>
                      <Td className="text-right">{item.qty_sold}</Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.revenue_total)}
                      </Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.profit_total)}
                      </Td>
                      <Td className="text-right font-medium text-fg">{item.margin_percentage}%</Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState message="Belum ada data margin pada periode ini." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-fg">Cashier Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <Th>Kasir</Th>
                  <Th className="text-right">Transaksi</Th>
                  <Th className="text-right">Items Sold</Th>
                  <Th className="text-right">Omzet</Th>
                  <Th className="text-right">Profit</Th>
                  <Th className="text-right">Avg Basket</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cashierPerformance.length > 0 ? (
                  cashierPerformance.map((item) => (
                    <tr key={item.cashier_id} className="hover:bg-muted ">
                      <Td className="font-medium text-fg">{item.cashier_name}</Td>
                      <Td className="text-right">{item.orders_count}</Td>
                      <Td className="text-right">{item.items_sold}</Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.revenue_total)}
                      </Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.profit_total)}
                      </Td>
                      <Td className="text-right font-medium text-fg">
                        {formatCurrency(item.average_basket)}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState message="Belum ada data performa kasir pada periode ini." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-fg">Repeat Customer Metrics</h2>
          </div>
          <div className="p-5">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Repeat Revenue</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {formatCurrency(repeatSummary.repeat_revenue_total ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Revenue Member</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {formatCurrency(repeatSummary.member_revenue_total ?? 0)}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Revenue Non-Member</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {formatCurrency(repeatSummary.non_member_revenue_total ?? 0)}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <Th>Pelanggan</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Transaksi</Th>
                    <Th className="text-right">Omzet</Th>
                    <Th className="text-right">Avg Basket</Th>
                    <Th>Last Purchase</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topRepeatCustomers.length > 0 ? (
                    topRepeatCustomers.map((item) => (
                      <tr key={item.customer_id} className="hover:bg-muted ">
                        <Td>
                          <div>
                            <p className="font-semibold text-fg">{item.customer_name}</p>
                            <p className="text-xs text-muted-fg">
                              {item.loyalty_tier
                                ? item.loyalty_tier.replace("_", " ").toUpperCase()
                                : "Non-member"}
                            </p>
                          </div>
                        </Td>
                        <Td>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.is_loyalty_member
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                : "bg-muted text-muted-fg "
                            }`}
                          >
                            {item.is_loyalty_member ? "Member" : "Non-member"}
                          </span>
                        </Td>
                        <Td className="text-right">{item.orders_count}</Td>
                        <Td className="text-right font-medium text-fg">
                          {formatCurrency(item.revenue_total)}
                        </Td>
                        <Td className="text-right font-medium text-fg">
                          {formatCurrency(item.average_basket)}
                        </Td>
                        <Td>{formatDateTime(item.last_purchase_at)}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState message="Belum ada pelanggan repeat pada periode ini." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-fg">Stock Coverage Analysis</h2>
          </div>
          <div className="p-5">
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Stok Kritis</p>
                <p className="mt-2 text-xl font-semibold text-danger">
                  {(stockCoverageSummary.critical ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Stok Rendah</p>
                <p className="mt-2 text-xl font-semibold text-warning">
                  {(stockCoverageSummary.low ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Stok Sehat</p>
                <p className="mt-2 text-xl font-semibold text-success">
                  {(stockCoverageSummary.healthy ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Tidak Bergerak</p>
                <p className="mt-2 text-xl font-semibold text-muted-fg">
                  {(stockCoverageSummary.no_movement ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <Th>Produk</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Stok</Th>
                    <Th className="text-right">Qty Sold</Th>
                    <Th className="text-right">Avg / Hari</Th>
                    <Th className="text-right">Coverage</Th>
                    <Th>Last Sold</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stockCoverageProducts.length > 0 ? (
                    stockCoverageProducts.map((item) => {
                      const statusCfg =
                        coverageStatusConfig[item.coverage_status] ??
                        coverageStatusConfig.no_movement;

                      return (
                        <tr key={item.product_id} className="hover:bg-muted ">
                          <Td>
                            <div>
                              <p className="font-semibold text-fg">{item.product_title}</p>
                              <p className="text-xs text-muted-fg">{item.category_name || "-"}</p>
                            </div>
                          </Td>
                          <Td>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusCfg.className}`}
                            >
                              {statusCfg.label}
                            </span>
                          </Td>
                          <Td className="text-right">{item.current_stock}</Td>
                          <Td className="text-right">{item.qty_sold}</Td>
                          <Td className="text-right">{formatPercentage(item.average_daily_qty)}</Td>
                          <Td className="text-right">
                            {item.coverage_days === null
                              ? "-"
                              : `${formatPercentage(item.coverage_days)} hari`}
                          </Td>
                          <Td>{formatDateTime(item.last_sold_at)}</Td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState message="Belum ada data stock coverage pada periode ini." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-bg">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-fg">Promo Active Monitor</h2>
            </div>
            <div className="p-5">
              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Promo Aktif</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(promoSummary.active ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Promo Terjadwal</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(promoSummary.scheduled ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(promoSummary.by_kind ?? {}).map(([key, count]) => (
                  <span
                    key={key}
                    className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg "
                  >
                    {promoKindLabel[key] || key}: {Number(count).toLocaleString("id-ID")}
                  </span>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <Th>Rule</Th>
                      <Th>Tipe</Th>
                      <Th>Status</Th>
                      <Th>Periode</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...promoActiveRules, ...promoScheduledRules].slice(0, 8).length > 0 ? (
                      [...promoActiveRules, ...promoScheduledRules].slice(0, 8).map((item) => {
                        const statusCfg =
                          promoStatusConfig[item.status_label] ?? promoStatusConfig.inactive;

                        return (
                          <tr key={`${item.status_label}-${item.id}`} className="hover:bg-muted ">
                            <Td>
                              <div>
                                <p className="font-semibold text-fg">{item.name}</p>
                                <p className="text-xs text-muted-fg">
                                  {item.product_title ?? item.category_name ?? item.target_type}
                                </p>
                              </div>
                            </Td>
                            <Td>{promoKindLabel[item.kind] || item.kind}</Td>
                            <Td>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusCfg.className}`}
                              >
                                {statusCfg.label}
                              </span>
                            </Td>
                            <Td>
                              <div className="text-sm text-fg">
                                <div>{formatDateTime(item.starts_at)}</div>
                                <div>{formatDateTime(item.ends_at)}</div>
                              </div>
                            </Td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState message="Belum ada promo aktif atau terjadwal." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-fg">Audit Promo Terbaru</h3>
                {promoRecentAudits.length > 0 ? (
                  promoRecentAudits.map((audit) => (
                    <div key={audit.id} className="rounded-2xl bg-muted p-3 text-sm">
                      <p className="font-medium text-fg">{audit.description}</p>
                      <p className="mt-1 text-xs text-muted-fg">
                        {audit.event} &bull; {formatDateTime(audit.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-fg">Belum ada audit promo terbaru.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-fg">Loyalty Performance Summary</h2>
            </div>
            <div className="p-5">
              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Total Member</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(loyaltySummary.total_members ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Saldo Poin</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(loyaltySummary.points_balance_total ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Poin Earned</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(loyaltySummary.points_earned ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Poin Redeemed</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(loyaltySummary.points_redeemed ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(loyaltySummary.tier_distribution ?? {}).map(([tier, count]) => (
                  <span
                    key={tier}
                    className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg "
                  >
                    {tier.toUpperCase()}: {Number(count).toLocaleString("id-ID")}
                  </span>
                ))}
              </div>
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Voucher Aktif</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(loyaltySummary.voucher_summary?.active ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Voucher Digunakan</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {(loyaltySummary.voucher_summary?.used ?? 0).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-fg">Nominal Voucher</p>
                  <p className="mt-2 text-xl font-semibold text-fg">
                    {formatCurrency(loyaltySummary.voucher_discount_total ?? 0)}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <Th>Member</Th>
                      <Th>Tier</Th>
                      <Th className="text-right">Poin</Th>
                      <Th className="text-right">Total Belanja</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loyaltyTopMembers.length > 0 ? (
                      loyaltyTopMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-muted ">
                          <Td className="font-medium text-fg">{member.name}</Td>
                          <Td>{(member.loyalty_tier || "-").replace("_", " ").toUpperCase()}</Td>
                          <Td className="text-right">
                            {member.loyalty_points.toLocaleString("id-ID")}
                          </Td>
                          <Td className="text-right font-medium text-fg">
                            {formatCurrency(member.loyalty_total_spent)}
                          </Td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState message="Belum ada member loyalty." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-fg">CRM Operational Snapshot</h2>
          </div>
          <div className="p-5">
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Segment Aktif</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {(crmSummary.segments_active ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Campaign Draft/Ready</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {(
                    (crmSummary.campaigns_draft ?? 0) + (crmSummary.campaigns_ready ?? 0)
                  ).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Queue Ready</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {(crmSummary.queue_ready_to_send ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-sm text-muted-fg">Queue Sent</p>
                <p className="mt-2 text-xl font-semibold text-fg">
                  {(crmSummary.queue_sent ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg ">
                Manual Segment: {Number(crmSummary.segments_manual ?? 0).toLocaleString("id-ID")}
              </span>
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg ">
                Auto Segment: {Number(crmSummary.segments_auto ?? 0).toLocaleString("id-ID")}
              </span>
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg ">
                Memberships: {Number(crmSummary.memberships_total ?? 0).toLocaleString("id-ID")}
              </span>
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg ">
                Campaign Processed:{" "}
                {Number(crmSummary.campaigns_processed ?? 0).toLocaleString("id-ID")}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <Th>Campaign</Th>
                    <Th>Tipe</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Target</Th>
                    <Th>Diproses</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {crmRecentCampaigns.length > 0 ? (
                    crmRecentCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-muted ">
                        <Td className="font-medium text-fg">{campaign.name}</Td>
                        <Td>{crmCampaignTypeLabel[campaign.type] || campaign.type}</Td>
                        <Td>{campaign.status}</Td>
                        <Td className="text-right font-medium text-fg">{campaign.logs_count}</Td>
                        <Td>{formatDateTime(campaign.processed_at || campaign.created_at)}</Td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState message="Belum ada campaign CRM terbaru." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Insights.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
