import { Head, Link, router } from "@inertiajs/react";
import { IconCirclePlus, IconClipboardCheck, IconEye, IconSearch } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import stockOpnames from "@/routes/stock-opnames";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface StockOpname {
  id: number;
  code: string;
  status: string;
  items_count: number;
  notes: string | null;
  creator: { id: number; name: string } | null;
  finalizer: { id: number; name: string } | null;
  finalized_at: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface StockOpnamesResponse {
  data: StockOpname[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface IndexProps {
  stockOpnames: StockOpnamesResponse;
  filters: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  };
}

function OpnameStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "warning"> = {
    finalized: "success",
    draft: "warning",
  };
  const labels: Record<string, string> = {
    finalized: "Finalized",
    draft: "Draft",
  };
  return <StatusBadge variant={variantMap[status] || "warning"} label={labels[status] || status} />;
}

export default function Index({ stockOpnames: data, filters }: IndexProps) {
  const { can } = useAuthorization();
  const canCreateStockOpnames = can("stock-opnames-create");

  function handleFilterChange(key: string, value: string) {
    router.get(
      stockOpnames.index.url(),
      { ...filters, [key]: value },
      { preserveState: true, replace: true },
    );
  }

  return (
    <>
      <Head title="Stock Opname" />
      <div className="space-y-6">
        <PageHeader
          title="Stock Opname"
          description="Kelola sesi audit stok fisik dan finalisasi adjustment stok."
          icon={<IconClipboardCheck size={20} />}
          actions={
            canCreateStockOpnames && (
              <Link href={stockOpnames.create.url()}>
                <Button intent="primary">
                  <IconCirclePlus size={18} />
                  Buat Sesi Opname
                </Button>
              </Link>
            )
          }
        />

        <div className="grid grid-cols-1 gap-3 bg-bg border border-border rounded-2xl p-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <input
              type="text"
              value={filters?.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Cari kode sesi atau catatan..."
              className="h-11 w-full rounded-xl border border-input bg-muted px-4 pr-11 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted-fg">
              <IconSearch size={18} />
            </div>
          </div>

          <select
            value={filters?.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="finalized">Finalized</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={filters?.date_from || ""}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
            />
            <input
              type="date"
              value={filters?.date_to || ""}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              className="h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 font-semibold text-sm text-fg">
                Daftar Sesi Stock Opname
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Kode
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Jumlah Item
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Dibuat Oleh
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Finalized
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-bg">
                  {data.data.length > 0 ? (
                    data.data.map((stockOpname) => (
                      <tr key={stockOpname.id} className="hover:bg-muted transition-colors">
                        <td className="whitespace-nowrap p-4 align-middle">
                          <div>
                            <p className="font-semibold text-fg">{stockOpname.code}</p>
                            <p className="text-xs text-muted-fg">
                              {stockOpname.notes || "Tanpa catatan"}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle">
                          <OpnameStatusBadge status={stockOpname.status} />
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {stockOpname.items_count}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {stockOpname.creator?.name || "-"}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {stockOpname.finalized_at
                            ? `${stockOpname.finalizer?.name || "-"} • ${formatDateTime(stockOpname.finalized_at)}`
                            : "-"}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-center">
                          <Link
                            href={stockOpnames.show.url({ stockOpname: stockOpname.id })}
                            className="inline-flex rounded-xl border border-border bg-muted p-2 text-muted-fg transition hover:border-primary/30 hover:text-primary"
                          >
                            <IconEye size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <IconClipboardCheck size={28} className="text-muted-fg" />
                          </div>
                          <p className="text-muted-fg">Belum ada sesi stock opname.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {data.last_page > 1 && <Pagination links={data.links} />}
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
