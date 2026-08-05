import { Head, Link, router } from "@inertiajs/react";
import { IconCheck, IconCircleX, IconTruckReturn } from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import supplierReturns from "@/routes/supplier-returns";
import goodsReceivings from "@/routes/goods-receivings";
import payables from "@/routes/payables";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface Product {
  id: number;
  title: string;
  sku: string;
}

interface ReturnItem {
  id: number;
  product_id: number;
  product: Product | null;
  qty_returned: number;
  unit_price: number;
  reason: string | null;
}

interface GoodsReceiving {
  id: number;
  document_number: string;
}

interface Payable {
  id: number;
  total: number;
  paid: number;
}

interface Supplier {
  id: number;
  name: string;
}

interface Creator {
  id: number;
  name: string;
}

interface SupplierReturn {
  id: number;
  document_number: string;
  status: string;
  supplier: Supplier | null;
  creator: Creator | null;
  items: ReturnItem[];
  notes: string | null;
  goodsReceiving: GoodsReceiving | null;
  payable: Payable | null;
  created_at: string;
  returned_at: string | null;
}

interface ShowProps {
  return: SupplierReturn;
}

const formatPrice = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

function ReturnStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "warning" | "success" | "danger"> = {
    draft: "warning",
    completed: "success",
    cancelled: "danger",
  };
  const labels: Record<string, string> = {
    draft: "Draft",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return <StatusBadge variant={variantMap[status] || "warning"} label={labels[status] || status} />;
}

export default function Show({ return: ret }: ShowProps) {
  const { can } = useAuthorization();
  const canEdit = can("supplier-returns-update");

  const completeReturn = () => {
    router.post(
      supplierReturns.complete.url({ supplierReturn: ret.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Retur supplier berhasil diselesaikan"),
        onError: () => toast.error("Gagal menyelesaikan retur"),
      },
    );
  };

  const cancelReturn = () => {
    router.post(
      supplierReturns.cancel.url({ supplierReturn: ret.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("Retur supplier dibatalkan"),
        onError: () => toast.error("Gagal membatalkan retur"),
      },
    );
  };

  const total = ret.items?.reduce((sum, item) => sum + item.qty_returned * item.unit_price, 0) || 0;

  return (
    <>
      <Head title={ret.document_number} />
      <div className="space-y-6">
        <PageHeader
          title={ret.document_number}
          description={
            <>
              Supplier: {ret.supplier?.name || "-"} &bull; Dibuat oleh {ret.creator?.name || "-"}{" "}
              &bull; {formatDateTime(ret.created_at)}
              {ret.returned_at && <> &bull; Diselesaikan: {formatDateTime(ret.returned_at)}</>}
            </>
          }
          icon={<IconTruckReturn size={20} />}
          actions={
            <div className="flex items-center gap-2">
              <ReturnStatusBadge status={ret.status} />
              {ret.status === "draft" && canEdit && (
                <>
                  <Button intent="success" onPress={completeReturn}>
                    <IconCheck size={16} />
                    Selesaikan Retur
                  </Button>
                  <Button intent="danger" onPress={cancelReturn}>
                    <IconCircleX size={16} />
                    Batalkan
                  </Button>
                </>
              )}
            </div>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-fg text-lg">Item Retur</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Produk</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                          Qty Retur
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">Harga</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                          Subtotal
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Alasan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ret.items?.length > 0 ? (
                        ret.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-border border-b transition-colors hover:bg-muted"
                          >
                            <td className="px-3 py-3">
                              <p className="font-medium text-fg">
                                {item.product?.title || "Produk #" + item.product_id}
                              </p>
                              <p className="text-muted-fg text-xs">{item.product?.sku || "-"}</p>
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-fg">
                              {item.qty_returned}
                            </td>
                            <td className="px-3 py-3 text-right text-fg">
                              {formatPrice(item.unit_price)}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-fg">
                              {formatPrice(item.qty_returned * item.unit_price)}
                            </td>
                            <td className="px-3 py-3 text-muted-fg text-xs">
                              {item.reason || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-muted-fg">
                            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                              <IconTruckReturn size={28} className="text-muted-fg" />
                            </div>
                            <div>Tidak ada item.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {ret.items?.length > 0 && (
                  <div className="mt-4 flex justify-end border-border border-t pt-4">
                    <div className="text-right">
                      <p className="font-semibold text-muted-fg text-sm">Total Retur</p>
                      <p className="font-bold text-danger text-xl">{formatPrice(total)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {ret.notes && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="mb-3 font-semibold text-fg text-lg">Catatan</h2>
                  <p className="text-muted-fg text-sm">{ret.notes}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 font-semibold text-fg text-lg">Informasi</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Dokumen</span>
                    <span className="font-semibold text-fg">{ret.document_number}</span>
                  </div>
                  {ret.goodsReceiving && (
                    <div className="flex justify-between">
                      <span className="text-muted-fg">GR Referensi</span>
                      <Link
                        href={goodsReceivings.show.url({
                          goodsReceiving: ret.goodsReceiving.id,
                        })}
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        {ret.goodsReceiving.document_number}
                      </Link>
                    </div>
                  )}
                  {ret.payable && (
                    <div className="flex justify-between">
                      <span className="text-muted-fg">Hutang Supplier</span>
                      <Link
                        href={payables.show.url({ payable: ret.payable.id })}
                        className="font-medium text-primary hover:text-primary/80"
                      >
                        {formatPrice(ret.payable.total)} (Sisa:{" "}
                        {formatPrice(ret.payable.total - ret.payable.paid)})
                      </Link>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Supplier</span>
                    <span className="font-semibold text-fg">{ret.supplier?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Tanggal Dibuat</span>
                    <span className="text-fg">{formatDateTime(ret.created_at)}</span>
                  </div>
                  {ret.returned_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-fg">Tanggal Selesai</span>
                      <span className="text-fg">{formatDateTime(ret.returned_at)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
