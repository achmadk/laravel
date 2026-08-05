import { Head, Link, router } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCheck,
  IconCircleX,
  IconPackage,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import purchaseOrders from "@/routes/purchase-orders";
import goodsReceivings from "@/routes/goods-receivings";
import payables from "@/routes/payables";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: number;
  title: string;
  sku: string;
}

interface OrderItem {
  id: number;
  product_id: number;
  product: Product | null;
  qty_ordered: number;
  qty_received: number;
  unit_price: number;
}

interface GoodsReceiving {
  id: number;
  document_number: string;
  received_at: string;
  items: unknown[];
}

interface Payable {
  id: number;
  document_number: string;
  total: number;
  paid: number;
}

interface Order {
  id: number;
  document_number: string;
  status: string;
  supplier: { id: number; name: string } | null;
  creator: { id: number; name: string } | null;
  items: OrderItem[];
  goods_receivings: GoodsReceiving[];
  notes: string | null;
  payable: Payable | null;
  created_at: string;
  ordered_at: string | null;
}

interface ShowProps {
  order: Order;
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

const statusBadge = (status: string) => {
  const base = "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold";
  const map: Record<string, string> = {
    draft: "bg-warning/10 text-warning",
    ordered: "bg-primary/10 text-primary",
    partial_received: "bg-[--color-accent]/10 text-[--color-accent]",
    completed: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
  };
  const labels: Record<string, string> = {
    draft: "Draft",
    ordered: "Dipesan",
    partial_received: "Sebagian Diterima",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return <span className={`${base} ${map[status] || map.draft}`}>{labels[status] || status}</span>;
};

export default function Show({ order }: ShowProps) {
  const { can } = useAuthorization();
  const canEdit = can("purchase-orders-update");
  const canCreateReceiving = can("goods-receivings-create");

  const placeOrder = () => {
    router.post(
      purchaseOrders.place.url({ purchaseOrder: order.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("PO berhasil dipesan"),
        onError: () => toast.error("Gagal memesan PO"),
      },
    );
  };

  const cancelOrder = () => {
    router.post(
      purchaseOrders.cancel.url({ purchaseOrder: order.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast.success("PO dibatalkan"),
        onError: () => toast.error("Gagal membatalkan PO"),
      },
    );
  };

  const canPlace = order.status === "draft" && canEdit;
  const canCancel = ["draft", "ordered", "partial_received"].includes(order.status) && canEdit;

  return (
    <>
      <Head title={order.document_number} />

      <div className="mb-6">
        <Link
          href={purchaseOrders.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke daftar PO
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h1 className="font-bold text-2xl text-fg">{order.document_number}</h1>
              {statusBadge(order.status)}
            </div>
            <p className="text-muted-fg text-sm">
              Supplier: {order.supplier?.name || "-"} &bull; Dibuat oleh{" "}
              {order.creator?.name || "-"} &bull; {formatDateTime(order.created_at)}
            </p>
            {order.ordered_at && (
              <p className="text-muted-fg text-sm">Dipesan: {formatDateTime(order.ordered_at)}</p>
            )}
          </div>
          <div className="flex gap-2">
            {canPlace && (
              <button
                type="button"
                onClick={placeOrder}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-semibold text-sm text-white hover:bg-primary/90"
              >
                <IconCheck size={18} />
                Pesan ke Supplier
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={cancelOrder}
                className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 font-semibold text-sm text-white hover:bg-danger/90"
              >
                <IconCircleX size={18} />
                Batalkan PO
              </button>
            )}
            {canCreateReceiving && ["ordered", "partial_received"].includes(order.status) && (
              <Link
                // @ts-expect-error
                href={goodsReceivings.create(order.id).url}
                className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 font-semibold text-sm text-white hover:bg-success/90"
              >
                <IconTruckDelivery size={18} />
                Terima Barang
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 font-semibold text-fg text-lg">Item Purchase Order</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="px-3 py-2 text-left font-semibold text-muted-fg">Produk</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                        Qty Dipesan
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                        Qty Diterima
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-fg">Sisa</th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                        Harga Satuan
                      </th>
                      <th className="px-3 py-2 text-right font-semibold text-muted-fg">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.length > 0 ? (
                      order.items.map((item) => {
                        const remaining = item.qty_ordered - item.qty_received;
                        return (
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
                            <td className="px-3 py-3 text-right text-fg">{item.qty_ordered}</td>
                            <td className="px-3 py-3 text-right text-fg">{item.qty_received}</td>
                            <td className="px-3 py-3 text-right">
                              <span
                                className={`font-semibold ${
                                  remaining > 0 ? "text-warning" : "text-success"
                                }`}
                              >
                                {remaining}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right text-fg">
                              {formatPrice(item.unit_price)}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-fg">
                              {formatPrice(item.qty_ordered * item.unit_price)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-3 py-8 text-center text-muted-fg">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <IconPackage size={28} className="text-muted-fg" />
                          </div>
                          <div>Tidak ada item pada PO ini.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {order.goods_receivings?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-fg text-lg">Riwayat Penerimaan Barang</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Dokumen</th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">
                          Tanggal Terima
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Item</th>
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.goods_receivings.map((gr) => (
                        <tr
                          key={gr.id}
                          className="border-border border-b transition-colors hover:bg-muted"
                        >
                          <td className="px-3 py-3 font-medium text-fg">{gr.document_number}</td>
                          <td className="px-3 py-3 text-fg text-sm">
                            {formatDateTime(gr.received_at)}
                          </td>
                          <td className="px-3 py-3 text-fg text-sm">{gr.items?.length || 0}</td>
                          <td className="px-3 py-3">
                            <Link
                              href={goodsReceivings.show.url({ goodsReceiving: gr.id })}
                              className="font-medium text-primary text-sm hover:text-primary/80"
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {order.notes && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 font-semibold text-fg text-lg">Catatan</h2>
                <p className="text-muted-fg text-sm">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {order.payable && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 font-semibold text-fg text-lg">Hutang Supplier</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Dokumen</span>
                    <span className="font-medium text-fg">{order.payable.document_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Total</span>
                    <span className="font-medium text-fg">{formatPrice(order.payable.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Dibayar</span>
                    <span className="font-medium text-fg">{formatPrice(order.payable.paid)}</span>
                  </div>
                  <Link
                    href={payables.show.url({ payable: order.payable.id })}
                    className="mt-3 inline-flex font-medium text-primary text-sm hover:text-primary/80"
                  >
                    Lihat Detail Hutang &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 font-semibold text-fg text-lg">Informasi</h2>
              <div className="space-y-3 text-muted-fg text-sm">
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="font-medium text-fg">Alur PO</p>
                  <ul className="mt-2 space-y-2">
                    <li>1. Buat PO dengan status Draft.</li>
                    <li>2. Pesan ke supplier untuk mengubah status menjadi Ordered.</li>
                    <li>3. Terima barang melalui menu Terima Barang.</li>
                    <li>4. Hutang supplier akan otomatis tercatat.</li>
                  </ul>
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
