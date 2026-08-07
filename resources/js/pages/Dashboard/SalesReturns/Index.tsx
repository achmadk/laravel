import { useEffect, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/layouts/dashboard-layout";
import salesReturnsRoutes from "@/routes/sales-returns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value))
    : "-";
}

interface SalesReturnItem {
  id: number;
  code: string;
  created_at: string;
  return_type: string;
  status: string;
  total_return_amount: number;
  transaction: { invoice: string } | null;
  customer: { name: string } | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface SalesReturnsResponse {
  data: SalesReturnItem[];
  links: PaginationLink[];
}

interface IndexProps {
  salesReturns: SalesReturnsResponse;
  filters: {
    code?: string;
    invoice?: string;
    date_from?: string;
    date_to?: string;
    return_type?: string;
  };
}

export default function Index({ salesReturns, filters }: IndexProps) {
  const [form, setForm] = useState({
    code: filters.code || "",
    invoice: filters.invoice || "",
    date_from: filters.date_from || "",
    date_to: filters.date_to || "",
    return_type: filters.return_type || "",
  });

  useEffect(() => {
    setForm({
      code: filters.code || "",
      invoice: filters.invoice || "",
      date_from: filters.date_from || "",
      date_to: filters.date_to || "",
      return_type: filters.return_type || "",
    });
  }, [filters]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.get(salesReturnsRoutes.index.url(), form, {
      preserveScroll: true,
      preserveState: true,
    });
  }

  const rows = salesReturns.data || [];

  return (
    <>
      <Head title="Retur Penjualan" />

      <PageHeader
        title="Retur Penjualan"
        description="Histori retur penjualan berdasarkan transaksi asal."
      />

      <Card className="p-5 [--gutter:0]">
      <form
        onSubmit={submit}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
      >
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
          placeholder="Kode retur"
          className="h-11 rounded-xl border border-input bg-muted px-4 text-fg text-sm placeholder:text-muted-fg"
        />
        <input
          type="text"
          value={form.invoice}
          onChange={(e) => setForm((prev) => ({ ...prev, invoice: e.target.value }))}
          placeholder="Invoice transaksi"
          className="h-11 rounded-xl border border-input bg-muted px-4 text-fg text-sm placeholder:text-muted-fg"
        />
        <input
          type="date"
          value={form.date_from}
          onChange={(e) => setForm((prev) => ({ ...prev, date_from: e.target.value }))}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-fg text-sm"
        />
        <input
          type="date"
          value={form.date_to}
          onChange={(e) => setForm((prev) => ({ ...prev, date_to: e.target.value }))}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-fg text-sm"
        />
        <div className="flex gap-2">
          <select
            value={form.return_type}
            onChange={(e) => setForm((prev) => ({ ...prev, return_type: e.target.value }))}
            className="h-11 flex-1 rounded-xl border border-input bg-muted px-4 text-fg text-sm"
          >
            <option value="">Semua metode</option>
            <option value="refund_cash">Refund Tunai</option>
            <option value="store_credit">Saldo Toko</option>
          </select>
          <Button type="submit" intent="primary">
            Filter
          </Button>
        </div>
      </form>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border border-b bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Kode</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Pelanggan</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Metode</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-fg">Nominal</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-fg">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-fg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.length > 0 ? (
                  rows.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-muted">
                      <td className="px-4 py-4 font-medium text-fg">{item.code}</td>
                      <td className="px-4 py-4 text-muted-fg">
                        {item.transaction?.invoice || "-"}
                      </td>
                      <td className="px-4 py-4 text-muted-fg">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-4 text-muted-fg">{item.customer?.name || "Umum"}</td>
                      <td className="px-4 py-4 text-muted-fg">
                        {item.return_type === "store_credit" ? "Saldo Toko" : "Refund Tunai"}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-fg">
                        {formatCurrency(item.total_return_amount)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge
                          variant={item.status === "completed" ? "success" : "warning"}
                          label={item.status === "completed" ? "Completed" : "Draft"}
                        />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link href={salesReturnsRoutes.show.url({ salesReturn: item.id })}>
                          <Button intent="plain" size="sq-sm">
                            Lihat
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-muted-fg">
                      Belum ada retur penjualan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {salesReturns.links?.length > 3 && <Pagination links={salesReturns.links} />}
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
