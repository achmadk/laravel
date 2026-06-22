import { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  IconCoin,
  IconDiscount2,
  IconReceipt2,
  IconShoppingBag,
  IconTrendingUp,
  IconFilter,
  IconX,
  IconSearch,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import reports from "@/routes/reports";
import { Pagination } from "@/components/dashboard/pagination";
import { EmptyState } from "@/components/dashboard/empty-state";

interface Cashier {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  name: string;
}

interface TransactionRow {
  id: number;
  invoice: string;
  created_at: string;
  customer: Customer | null;
  cashier: Cashier | null;
  total_items: number;
  grand_total: number;
  total_profit: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedData {
  data: TransactionRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface SalesFilters {
  start_date: string;
  end_date: string;
  invoice: string;
  cashier_id: string;
  customer_id: string;
}

interface SummaryData {
  orders_count: number;
  revenue_total: number;
  discount_total: number;
  items_sold: number;
  profit_total: number;
  average_order: number;
}

const defaultFilterState: SalesFilters = {
  start_date: "",
  end_date: "",
  invoice: "",
  cashier_id: "",
  customer_id: "",
};

function formatCurrency(value = 0): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function castFilterString(value: string | number | null | undefined): string {
  return typeof value === "number" ? String(value) : (value ?? "");
}

function SummaryCard({
  icon,
  title,
  value,
  description,
  gradient,
}: {
  icon: React.ReactElement;
  title: string;
  value: string;
  description: string;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-lg`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
        <div className="transform translate-x-4 -translate-y-4">{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-white/20">{icon}</div>
          <span className="text-sm font-medium opacity-90">{title}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm opacity-80 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function Sales({
  transactions,
  summary,
  filters,
  cashiers,
  customers,
}: {
  transactions: PaginatedData;
  summary: SummaryData;
  filters: SalesFilters;
  cashiers: Cashier[];
  customers: Customer[];
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterData, setFilterData] = useState<SalesFilters>({
    ...defaultFilterState,
    start_date: castFilterString(filters?.start_date),
    end_date: castFilterString(filters?.end_date),
    invoice: castFilterString(filters?.invoice),
    cashier_id: castFilterString(filters?.cashier_id),
    customer_id: castFilterString(filters?.customer_id),
  });

  const cashierFromFilters = useMemo(
    () => cashiers.find((c) => castFilterString(c.id) === filterData.cashier_id) ?? null,
    [cashiers, filterData.cashier_id],
  );

  const customerFromFilters = useMemo(
    () => customers.find((c) => castFilterString(c.id) === filterData.customer_id) ?? null,
    [customers, filterData.customer_id],
  );

  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(cashierFromFilters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customerFromFilters);

  useEffect(() => setSelectedCashier(cashierFromFilters), [cashierFromFilters]);
  useEffect(() => setSelectedCustomer(customerFromFilters), [customerFromFilters]);

  useEffect(() => {
    setFilterData({
      ...defaultFilterState,
      start_date: castFilterString(filters?.start_date),
      end_date: castFilterString(filters?.end_date),
      invoice: castFilterString(filters?.invoice),
      cashier_id: castFilterString(filters?.cashier_id),
      customer_id: castFilterString(filters?.customer_id),
    });
  }, [filters]);

  function handleChange(field: keyof SalesFilters, value: string) {
    setFilterData((prev) => ({ ...prev, [field]: value }));
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      // @ts-expect-error
      reports.sales.index({ query: filterData }).url,
      {},
      { preserveScroll: true, preserveState: true },
    );
    setShowFilters(false);
  }

  function resetFilters() {
    setFilterData(defaultFilterState);
    setSelectedCashier(null);
    setSelectedCustomer(null);
    router.get(
      // @ts-expect-error
      reports.sales.index({ query: defaultFilterState }).url,
      {},
      { preserveScroll: true, preserveState: true, replace: true },
    );
  }

  const rows = transactions?.data ?? [];
  const paginationLinks = transactions?.links ?? [];
  const currentPage = transactions?.current_page ?? 1;
  const perPage = transactions?.per_page ? Number(transactions.per_page) : rows.length || 1;

  const hasActiveFilters =
    filterData.invoice ||
    filterData.start_date ||
    filterData.end_date ||
    filterData.cashier_id ||
    filterData.customer_id;

  const safeSummary = {
    orders_count: summary?.orders_count ?? 0,
    revenue_total: summary?.revenue_total ?? 0,
    discount_total: summary?.discount_total ?? 0,
    items_sold: summary?.items_sold ?? 0,
    profit_total: summary?.profit_total ?? 0,
    average_order: summary?.average_order ?? 0,
  };

  const summaryCards = [
    {
      title: "Pendapatan Bersih",
      value: formatCurrency(safeSummary.revenue_total),
      description: "Total setelah diskon",
      icon: <IconReceipt2 size={96} strokeWidth={0.5} />,
      gradient: "from-primary to-primary/80",
    },
    {
      title: "Total Profit",
      value: formatCurrency(safeSummary.profit_total),
      description: `Rata-rata ${formatCurrency(safeSummary.average_order)}`,
      icon: <IconCoin size={96} strokeWidth={0.5} />,
      gradient: "from-success to-success/80",
    },
    {
      title: "Item Terjual",
      value: safeSummary.items_sold.toLocaleString("id-ID"),
      description: `${safeSummary.orders_count} transaksi`,
      icon: <IconShoppingBag size={96} strokeWidth={0.5} />,
      gradient: "from-cyan-500 to-cyan-700",
    },
    {
      title: "Diskon Diberikan",
      value: formatCurrency(safeSummary.discount_total),
      description: "Akumulasi promo",
      icon: <IconDiscount2 size={96} strokeWidth={0.5} />,
      gradient: "from-warning to-warning/80",
    },
  ];

  return (
    <>
      <Head title="Laporan Penjualan" />

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
              <IconTrendingUp size={28} className="text-primary" />
              Laporan Penjualan
            </h1>
            <p className="text-sm text-muted-fg">Analisis dan ringkasan penjualan</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary/10 border-primary/20 text-primary"
                : "bg-bg border-border text-muted-fg hover:bg-muted"
            }`}
          >
            <IconFilter size={18} />
            <span>Filter</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary" />}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>

        {showFilters && (
          <div className="bg-bg rounded-2xl border border-border p-5">
            <form onSubmit={applyFilters}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={filterData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={filterData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">Invoice</label>
                  <input
                    type="text"
                    placeholder="TRX-..."
                    value={filterData.invoice}
                    onChange={(e) => handleChange("invoice", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg placeholder-muted-fg focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">Kasir</label>
                  <select
                    value={filterData.cashier_id}
                    onChange={(e) => handleChange("cashier_id", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg focus:border-ring focus:ring-2 focus:ring-ring transition-all"
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
                  <label className="block text-sm font-medium text-fg mb-2">Pelanggan</label>
                  <select
                    value={filterData.customer_id}
                    onChange={(e) => handleChange("customer_id", e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-muted text-fg focus:border-ring focus:ring-2 focus:ring-ring transition-all"
                  >
                    <option value="">Semua pelanggan</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2.5 rounded-xl border border-border text-muted-fg hover:bg-muted transition-colors"
                  >
                    <IconX size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors"
                >
                  <IconSearch size={18} />
                  Terapkan
                </button>
              </div>
            </form>
          </div>
        )}

        {rows.length > 0 ? (
          <div className="bg-bg rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Kasir
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-muted-fg uppercase tracking-wider">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((trx, i) => (
                    <tr key={trx.id} className="hover:bg-muted transition-colors">
                      <td className="px-4 py-4 text-sm text-muted-fg">
                        {i + 1 + (currentPage - 1) * perPage}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-fg">{trx.invoice}</td>
                      <td className="px-4 py-4 text-sm text-muted-fg">{trx.created_at}</td>
                      <td className="px-4 py-4 text-sm text-muted-fg">
                        {trx.customer?.name ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-fg">
                        {trx.cashier?.name ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {trx.total_items ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-fg">
                        {formatCurrency(trx.grand_total ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-success">
                        {formatCurrency(trx.total_profit ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState title="Tidak Ada Data" description="Tidak ada transaksi sesuai filter." />
        )}

        <Pagination links={paginationLinks} />
      </div>
    </>
  );
}

Sales.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
