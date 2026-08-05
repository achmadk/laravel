import { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
  IconCoin,
  IconPercentage,
  IconReceipt,
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

interface ProfitFilters {
  start_date: string;
  end_date: string;
  invoice: string;
  cashier_id: string;
  customer_id: string;
}

interface SummaryData {
  profit_total: number;
  average_profit: number;
  orders_count: number;
  margin: number;
  best_invoice: string;
  best_profit: number;
}

const defaultFilters: ProfitFilters = {
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

function SummaryCard({
  title,
  value,
  description,
  icon,
  gradient,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactElement;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 ${gradient} text-white shadow-lg`}
    >
      <div className="absolute top-0 right-0 h-24 w-24 opacity-20">
        <div className="translate-x-4 -translate-y-4 transform">{icon}</div>
      </div>
      <div className="relative z-10">
        <div className="mb-2 flex items-center gap-2">
          <div className="rounded-xl bg-white/20 p-2">{icon}</div>
          <span className="font-medium text-sm opacity-90">{title}</span>
        </div>
        <p className="font-bold text-2xl">{value}</p>
        <p className="mt-1 text-sm opacity-80">{description}</p>
      </div>
    </div>
  );
}

export default function Profits({
  transactions,
  summary,
  filters,
  cashiers,
  customers,
}: {
  transactions: PaginatedData;
  summary: SummaryData;
  filters: ProfitFilters;
  cashiers: Cashier[];
  customers: Customer[];
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterData, setFilterData] = useState<ProfitFilters>({ ...defaultFilters, ...filters });
  const [selectedCashier, setSelectedCashier] = useState<Cashier | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    setFilterData({ ...defaultFilters, ...filters });
    setSelectedCashier(cashiers.find((c) => String(c.id) === filters.cashier_id) || null);
    setSelectedCustomer(customers.find((c) => String(c.id) === filters.customer_id) || null);
  }, [filters, cashiers, customers]);

  function handleChange(field: keyof ProfitFilters, value: string) {
    setFilterData((prev) => ({ ...prev, [field]: value }));
  }

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      // @ts-expect-error
      reports.profits.index({ query: filterData }).url,
      {},
      { preserveState: true, preserveScroll: true },
    );
    setShowFilters(false);
  }

  function resetFilters() {
    setFilterData(defaultFilters);
    setSelectedCashier(null);
    setSelectedCustomer(null);
    router.get(
      // @ts-expect-error
      reports.profits.index({ query: defaultFilters }).url,
      {},
      { replace: true, preserveScroll: true },
    );
  }

  const rows = transactions?.data ?? [];
  const links = transactions?.links ?? [];
  const currentPage = transactions?.current_page ?? 1;
  const perPage = transactions?.per_page ? Number(transactions.per_page) : rows.length || 1;

  const hasActiveFilters =
    filterData.invoice ||
    filterData.start_date ||
    filterData.end_date ||
    filterData.cashier_id ||
    filterData.customer_id;

  const stats = {
    profit_total: summary?.profit_total ?? 0,
    average_profit: summary?.average_profit ?? 0,
    orders_count: summary?.orders_count ?? 0,
    margin: summary?.margin ?? 0,
    best_invoice: summary?.best_invoice ?? "-",
    best_profit: summary?.best_profit ?? 0,
  };

  const summaryCards = [
    {
      title: "Total Profit",
      value: formatCurrency(stats.profit_total),
      description: "Akumulasi bersih",
      icon: <IconCoin size={96} strokeWidth={0.5} />,
      gradient: "from-success to-success/80",
    },
    {
      title: "Rata-rata Profit",
      value: formatCurrency(stats.average_profit),
      description: `${stats.orders_count} transaksi`,
      icon: <IconTrendingUp size={96} strokeWidth={0.5} />,
      gradient: "from-primary to-primary/80",
    },
    {
      title: "Margin Kotor",
      value: `${stats.margin}%`,
      description: "Profit vs penjualan",
      icon: <IconPercentage size={96} strokeWidth={0.5} />,
      gradient: "from-warning to-warning/80",
    },
    {
      title: "Transaksi Terbaik",
      value: stats.best_invoice,
      description: formatCurrency(stats.best_profit),
      icon: <IconReceipt size={96} strokeWidth={0.5} />,
      gradient: "from-cyan-500 to-cyan-700",
    },
  ];

  return (
    <>
      <Head title="Laporan Keuntungan" />

      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconCoin size={28} className="text-success" />
              Laporan Keuntungan
            </h1>
            <p className="text-muted-fg text-sm">Analisis profit dan margin</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-medium text-sm transition-colors ${
              showFilters || hasActiveFilters
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-border bg-bg text-muted-fg hover:bg-muted"
            }`}
          >
            <IconFilter size={18} />
            <span>Filter</span>
            {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-border bg-bg p-5">
            <form onSubmit={applyFilters}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="mb-2 block font-medium text-fg text-sm">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={filterData.start_date}
                    onChange={(e) => handleChange("start_date", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg transition-all focus:border-ring focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-fg text-sm">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={filterData.end_date}
                    onChange={(e) => handleChange("end_date", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg transition-all focus:border-ring focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-fg text-sm">Invoice</label>
                  <input
                    type="text"
                    placeholder="TRX-..."
                    value={filterData.invoice}
                    onChange={(e) => handleChange("invoice", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg placeholder-muted-fg transition-all focus:border-ring focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-fg text-sm">Kasir</label>
                  <select
                    value={filterData.cashier_id}
                    onChange={(e) => {
                      handleChange("cashier_id", e.target.value);
                      setSelectedCashier(
                        cashiers.find((c) => String(c.id) === e.target.value) || null,
                      );
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg transition-all focus:border-ring focus:ring-2 focus:ring-ring"
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
                  <label className="mb-2 block font-medium text-fg text-sm">Pelanggan</label>
                  <select
                    value={filterData.customer_id}
                    onChange={(e) => {
                      handleChange("customer_id", e.target.value);
                      setSelectedCustomer(
                        customers.find((c) => String(c.id) === e.target.value) || null,
                      );
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg transition-all focus:border-ring focus:ring-2 focus:ring-ring"
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
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary/90"
                >
                  <IconSearch size={18} />
                  Terapkan
                </button>
              </div>
            </form>
          </div>
        )}

        {rows.length > 0 ? (
          <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-border sm:bg-bg">
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Kasir
                    </th>
                    <th className="px-4 py-4 text-left font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-4 py-4 text-center font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-4 text-right font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Penjualan
                    </th>
                    <th className="px-4 py-4 text-right font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((trx, i) => (
                    <tr key={trx.id} className="transition-colors hover:bg-muted">
                      <td className="px-4 py-4 text-muted-fg text-sm">
                        {i + 1 + (currentPage - 1) * perPage}
                      </td>
                      <td className="px-4 py-4 font-semibold text-fg text-sm">{trx.invoice}</td>
                      <td className="px-4 py-4 text-muted-fg text-sm">{trx.created_at}</td>
                      <td className="px-4 py-4 text-muted-fg text-sm">
                        {trx.cashier?.name ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-muted-fg text-sm">
                        {trx.customer?.name ?? "-"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                          {trx.total_items ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-fg text-sm">
                        {formatCurrency(trx.grand_total ?? 0)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-sm text-success">
                        {formatCurrency(trx.total_profit ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 px-1 sm:hidden">
              {rows.map((trx, i) => (
                <div
                  key={trx.id}
                  className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-fg text-xs">
                        No {i + 1 + (currentPage - 1) * perPage}
                      </p>
                      <p className="font-semibold text-base text-fg">{trx.invoice}</p>
                      <p className="text-muted-fg text-xs">{trx.created_at}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="font-semibold text-fg text-sm">
                        {formatCurrency(trx.grand_total ?? 0)}
                      </p>
                      <p className="font-semibold text-success text-xs">
                        Profit {formatCurrency(trx.total_profit ?? 0)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-fg text-sm">
                    <div>
                      <p className="text-muted-fg text-xs">Kasir</p>
                      <p className="font-medium text-fg">{trx.cashier?.name ?? "-"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-fg text-xs">Pelanggan</p>
                      <p className="font-medium text-fg">{trx.customer?.name ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-fg text-xs">Item</p>
                      <p className="font-medium text-fg">{trx.total_items ?? 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="Tidak Ada Data" description="Tidak ada transaksi sesuai filter." />
        )}

        <Pagination links={links} />
      </div>
    </>
  );
}

Profits.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
