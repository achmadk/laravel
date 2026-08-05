import { Head, Link, router } from "@inertiajs/react";
import { IconCirclePlus, IconEye, IconTruckReturn } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import supplierReturns from "@/routes/supplier-returns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SearchField } from "@/components/dashboard/search-field";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface Supplier {
  id: number;
  name: string;
}

interface SupplierReturn {
  id: number;
  document_number: string;
  status: string;
  supplier: Supplier | null;
  creator: { id: number; name: string } | null;
  items_count: number;
  created_at: string;
  returned_at: string | null;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginatedData<T> {
  data: T[];
  last_page: number;
  links: PaginationLink[];
}

interface Filters {
  search?: string;
  status?: string;
  supplier?: string;
}

interface IndexProps {
  returns: PaginatedData<SupplierReturn>;
  filters: Filters;
  suppliers: Supplier[];
}

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

const statusVariant = (status: string) => {
  const map: Record<string, string> = {
    draft: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return (map[status] || "neutral") as "success" | "warning" | "danger" | "info" | "neutral";
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function Index({ returns, filters, suppliers }: IndexProps) {
  const { can } = useAuthorization();

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      supplierReturns.index.url(),
      { ...filters, [key]: value },
      { preserveState: true, replace: true },
    );
  };

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <>
      <Head title="Retur Supplier" />

      <PageHeader
        title="Retur Supplier"
        description="Kelola retur barang ke supplier."
        icon={<IconTruckReturn size={20} />}
        actions={
          can("supplier-returns-create") && (
            <Link href={supplierReturns.create.url()}>
              <Button intent="primary">
                <IconCirclePlus size={18} />
                Buat Retur
              </Button>
            </Link>
          )
        }
      />

      <FilterBar onSubmit={handleSearchSubmit}>
        <div className="w-full md:col-span-2">
          <SearchField
            placeholder="Cari nomor dokumen..."
            value={filters.search || ""}
            onChange={(val) => handleFilterChange("search", val)}
          />
        </div>
        <select
          value={filters.status || ""}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-fg text-sm"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        <select
          value={filters.supplier || ""}
          onChange={(e) => handleFilterChange("supplier", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-fg text-sm"
        >
          <option value="">Semua Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </FilterBar>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 font-semibold text-fg text-lg">Daftar Retur Supplier</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Dokumen</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Supplier</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Item</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Tanggal</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Dibuat Oleh</th>
                  <th className="w-24 px-3 py-2 text-center font-semibold text-muted-fg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {returns.data.length > 0 ? (
                  returns.data.map((ret) => (
                    <tr
                      key={ret.id}
                      className="border-border border-b transition-colors hover:bg-muted"
                    >
                      <td className="px-3 py-3">
                        <p className="font-semibold text-fg">{ret.document_number}</p>
                        <p className="text-muted-fg text-xs">{ret.created_at?.split("T")[0]}</p>
                      </td>
                      <td className="px-3 py-3 text-fg text-sm">{ret.supplier?.name || "-"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          variant={statusVariant(ret.status)}
                          label={statusLabels[ret.status] || ret.status}
                        />
                      </td>
                      <td className="px-3 py-3 text-fg text-sm">{ret.items_count}</td>
                      <td className="px-3 py-3 text-fg text-sm">
                        {formatDateTime(ret.returned_at || ret.created_at)}
                      </td>
                      <td className="px-3 py-3 text-fg text-sm">{ret.creator?.name || "-"}</td>
                      <td className="px-3 py-3 text-center">
                        <Link href={supplierReturns.show.url({ supplierReturn: ret.id })}>
                          <Button intent="plain" size="sq-sm">
                            <IconEye size={18} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-muted-fg">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <IconTruckReturn size={28} className="text-muted-fg" />
                      </div>
                      <div>Belum ada data retur supplier.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {returns.last_page > 1 && <Pagination links={returns.links} />}
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
