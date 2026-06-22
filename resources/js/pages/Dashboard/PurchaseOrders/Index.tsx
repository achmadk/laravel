import { Head, Link, router } from "@inertiajs/react";
import { IconCirclePlus, IconEye, IconShoppingCart } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import purchaseOrders from "@/routes/purchase-orders";
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

interface Order {
  id: number;
  document_number: string;
  status: string;
  supplier: Supplier | null;
  creator: { id: number; name: string } | null;
  items_count: number;
  created_at: string;
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
  orders: PaginatedData<Order>;
  filters: Filters;
  suppliers: Supplier[];
}

const formatPrice = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const statusVariant = (status: string) => {
  const map: Record<string, string> = {
    draft: "warning",
    ordered: "info",
    partial_received: "info",
    completed: "success",
    cancelled: "danger",
  };
  return (map[status] || "neutral") as "success" | "warning" | "danger" | "info" | "neutral";
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  ordered: "Dipesan",
  partial_received: "Sebagian Diterima",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function Index({ orders, filters, suppliers }: IndexProps) {
  const { can } = useAuthorization();

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      purchaseOrders.index.url(),
      { ...filters, [key]: value },
      { preserveState: true, replace: true },
    );
  };

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <>
      <Head title="Purchase Orders" />

      <PageHeader
        title="Purchase Orders"
        description="Kelola pemesanan pembelian ke supplier."
        icon={<IconShoppingCart size={20} />}
        actions={
          can("purchase-orders-create") && (
            <Link href={purchaseOrders.create.url()}>
              <Button intent="primary">
                <IconCirclePlus size={18} />
                Buat PO
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
          className="h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="ordered">Dipesan</option>
          <option value="partial_received">Sebagian Diterima</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
        <select
          value={filters.supplier || ""}
          onChange={(e) => handleFilterChange("supplier", e.target.value)}
          className="h-11 rounded-xl border border-input bg-muted px-3 text-sm text-fg"
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
          <h2 className="mb-4 text-lg font-semibold text-fg">Daftar Purchase Order</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Dokumen</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Supplier</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Item</th>
                  <th className="px-3 py-2 text-left font-semibold text-muted-fg">Dibuat Oleh</th>
                  <th className="w-24 px-3 py-2 text-center font-semibold text-muted-fg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.length > 0 ? (
                  orders.data.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border transition-colors hover:bg-muted"
                    >
                      <td className="px-3 py-3">
                        <p className="font-semibold text-fg">{order.document_number}</p>
                        <p className="text-xs text-muted-fg">{order.created_at?.split("T")[0]}</p>
                      </td>
                      <td className="px-3 py-3 text-sm text-fg">{order.supplier?.name || "-"}</td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          variant={statusVariant(order.status)}
                          label={statusLabels[order.status] || order.status}
                        />
                      </td>
                      <td className="px-3 py-3 text-sm text-fg">{order.items_count}</td>
                      <td className="px-3 py-3 text-sm text-fg">{order.creator?.name || "-"}</td>
                      <td className="px-3 py-3 text-center">
                        <Link href={purchaseOrders.show.url({ purchaseOrder: order.id })}>
                          <Button intent="plain" size="sq-sm">
                            <IconEye size={18} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-fg">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <IconShoppingCart size={28} className="text-muted-fg" />
                      </div>
                      <div>Belum ada purchase order.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {orders.last_page > 1 && <Pagination links={orders.links} />}
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
