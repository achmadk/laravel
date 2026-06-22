import { Head, Link, router } from "@inertiajs/react";
import { IconCirclePlus, IconEye, IconSearch, IconTruckDelivery } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import goodsReceivings from "@/routes/goods-receivings";
import purchaseOrders from "@/routes/purchase-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";

interface Supplier {
  id: number;
  name: string;
}

interface PurchaseOrder {
  id: number;
  document_number: string;
}

interface GoodsReceiving {
  id: number;
  document_number: string;
  purchase_order_id: number;
  purchase_order: PurchaseOrder | null;
  supplier: Supplier | null;
  receiver: { id: number; name: string } | null;
  received_at: string;
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
}

interface IndexProps {
  receivings: PaginatedData<GoodsReceiving>;
  filters: Filters;
}

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

export default function Index({ receivings, filters }: IndexProps) {
  const { can } = useAuthorization();

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      goodsReceivings.index.url(),
      { ...filters, [key]: value },
      { preserveState: true, replace: true },
    );
  };

  return (
    <>
      <Head title="Penerimaan Barang" />
      <div className="space-y-6">
        <PageHeader
          title="Penerimaan Barang"
          description="Catat penerimaan barang dari supplier."
          icon={<IconTruckDelivery size={20} />}
          actions={
            can("goods-receivings-create") && (
              <Link href={goodsReceivings.create.url()}>
                <Button intent="primary">
                  <IconCirclePlus size={18} />
                  Terima Barang
                </Button>
              </Link>
            )
          }
        />

        <div className="bg-bg border border-border rounded-2xl p-4">
          <div className="relative">
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Cari nomor dokumen..."
              className="h-11 w-full rounded-xl border border-input bg-muted px-4 pr-11 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-muted-fg">
              <IconSearch size={18} />
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-fg">Daftar Penerimaan Barang</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">Dokumen</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">
                      PO Referensi
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">Supplier</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">
                      Tanggal Terima
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">
                      Diterima Oleh
                    </th>
                    <th className="w-24 px-3 py-2 text-center font-semibold text-muted-fg">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {receivings.data.length > 0 ? (
                    receivings.data.map((gr) => (
                      <tr
                        key={gr.id}
                        className="border-b border-border hover:bg-muted transition-colors"
                      >
                        <td className="px-3 py-3">
                          <p className="font-semibold text-fg">{gr.document_number}</p>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={purchaseOrders.show.url({ purchaseOrder: gr.purchase_order_id })}
                            className="text-sm font-medium text-primary hover:text-primary/80"
                          >
                            {gr.purchase_order?.document_number || "-"}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-sm text-fg">{gr.supplier?.name || "-"}</td>
                        <td className="px-3 py-3 text-sm text-fg">
                          {formatDateTime(gr.received_at)}
                        </td>
                        <td className="px-3 py-3 text-sm text-fg">{gr.receiver?.name || "-"}</td>
                        <td className="px-3 py-3 text-center">
                          <Link
                            href={goodsReceivings.show.url({ goodsReceiving: gr.id })}
                            className="inline-flex rounded-xl border border-border bg-muted p-2 text-muted-fg transition hover:border-primary/30 hover:text-primary"
                          >
                            <IconEye size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-muted-fg">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <IconTruckDelivery size={28} className="text-muted-fg" />
                        </div>
                        <div>Belum ada penerimaan barang.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {receivings.last_page > 1 && <Pagination links={receivings.links} />}
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
