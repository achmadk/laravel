import { Head, Link } from "@inertiajs/react";
import { IconArrowLeft, IconTruckDelivery, IconPackage } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import goodsReceivings from "@/routes/goods-receivings";
import purchaseOrders from "@/routes/purchase-orders";
import { Card, CardContent } from "@/components/ui/card";

interface PurchasingOrderItem {
  unit_price: number;
}

interface Product {
  id: number;
  title: string;
  sku: string;
}

interface ReceivingItem {
  id: number;
  product_id: number;
  product: Product | null;
  purchase_order_item: PurchasingOrderItem | null;
  qty_received: number;
  notes: string | null;
}

interface PurchaseOrder {
  id: number;
  document_number: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface Receiver {
  id: number;
  name: string;
}

interface Receiving {
  id: number;
  document_number: string;
  purchase_order_id: number;
  purchase_order: PurchaseOrder | null;
  supplier: Supplier | null;
  receiver: Receiver | null;
  items: ReceivingItem[];
  notes: string | null;
  received_at: string;
}

interface ShowProps {
  receiving: Receiving;
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

export default function Show({ receiving }: ShowProps) {
  return (
    <>
      <Head title={receiving.document_number} />

      <div className="mb-6">
        <Link
          href={goodsReceivings.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke daftar penerimaan
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-fg">{receiving.document_number}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-fg">
          PO Referensi:{" "}
          <Link
            href={purchaseOrders.show.url({ purchaseOrder: receiving.purchase_order_id })}
            className="font-medium text-primary hover:text-primary/80"
          >
            {receiving.purchase_order?.document_number || "-"}
          </Link>{" "}
          &bull; Supplier: {receiving.supplier?.name || "-"} &bull; Diterima oleh{" "}
          {receiving.receiver?.name || "-"} &bull; {formatDateTime(receiving.received_at)}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-4 text-lg font-semibold text-fg">Item Diterima</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">Produk</th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                      Qty Diterima
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                      Harga Satuan
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-muted-fg">Subtotal</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-fg">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {receiving.items.length > 0 ? (
                    receiving.items.map((item) => {
                      const unitPrice = item.purchase_order_item?.unit_price || 0;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-border transition-colors hover:bg-muted"
                        >
                          <td className="px-3 py-3">
                            <p className="font-medium text-fg">
                              {item.product?.title || "Produk #" + item.product_id}
                            </p>
                            <p className="text-xs text-muted-fg">{item.product?.sku || "-"}</p>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-fg">
                            {item.qty_received}
                          </td>
                          <td className="px-3 py-3 text-right text-fg">{formatPrice(unitPrice)}</td>
                          <td className="px-3 py-3 text-right font-semibold text-fg">
                            {formatPrice(item.qty_received * unitPrice)}
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-fg">{item.notes || "-"}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-fg">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <IconPackage size={28} className="text-muted-fg" />
                        </div>
                        <div>Tidak ada item pada penerimaan ini.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {receiving.notes && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-lg font-semibold text-fg">Catatan</h2>
                <p className="text-sm text-muted-fg">{receiving.notes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 text-lg font-semibold text-fg">Informasi</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-fg">Dokumen</span>
                  <span className="font-medium text-fg">{receiving.document_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-fg">PO Referensi</span>
                  <Link
                    href={purchaseOrders.show.url({ purchaseOrder: receiving.purchase_order_id })}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    {receiving.purchase_order?.document_number || "-"}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-fg">Tanggal Terima</span>
                  <span className="font-medium text-fg">
                    {formatDateTime(receiving.received_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-fg">Diterima Oleh</span>
                  <span className="font-medium text-fg">{receiving.receiver?.name || "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
