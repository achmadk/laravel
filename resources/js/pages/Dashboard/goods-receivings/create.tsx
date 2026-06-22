import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconTruckDelivery } from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/dashboard-layout";
import goodsReceivings from "@/routes/goods-receivings";
// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderItem {
  id: number;
  product_id: number;
  product: { id: number; title: string; sku: string } | null;
  qty_ordered: number;
  qty_received: number;
  unit_price: number;
}

interface Order {
  id: number;
  document_number: string;
  supplier: { id: number; name: string } | null;
  items: OrderItem[];
}

interface CreateProps {
  orders: Order[];
}

interface ItemForm {
  purchase_order_item_id: number;
  product_title: string;
  product_sku: string;
  qty_ordered: number;
  qty_received_already: number;
  outstanding: number;
  qty_received: number;
  notes: string;
}

export default function Create({ orders }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    purchase_order_id: "",
    notes: "",
    items: [] as ItemForm[],
  });

  const [selectedPoId, setSelectedPoId] = useState("");
  const selectedOrder = orders.find((o) => o.id === Number(selectedPoId));

  const selectPO = (poId: string) => {
    setSelectedPoId(poId);
    const order = orders.find((o) => o.id === Number(poId));
    if (order) {
      const initialItems = order.items
        .filter((item) => {
          const outstanding = item.qty_ordered - (item.qty_received || 0);
          return outstanding > 0;
        })
        .map((item) => ({
          purchase_order_item_id: item.id,
          product_title: item.product?.title || "Produk #" + item.product_id,
          product_sku: item.product?.sku || "-",
          qty_ordered: item.qty_ordered,
          qty_received_already: item.qty_received || 0,
          outstanding: item.qty_ordered - (item.qty_received || 0),
          qty_received: item.qty_ordered - (item.qty_received || 0),
          notes: "",
        }));
      setData({
        purchase_order_id: poId,
        notes: "",
        items: initialItems,
      });
    }
  };

  const updateItem = (index: number, value: string) => {
    const items = [...data.items];
    const maxQty = items[index].outstanding;
    items[index] = {
      ...items[index],
      qty_received: Math.min(parseInt(value) || 0, maxQty),
    };
    setData("items", items);
  };

  const updateItemNotes = (index: number, value: string) => {
    const items = [...data.items];
    items[index] = { ...items[index], notes: value };
    setData("items", items);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.purchase_order_id) {
      toast.error("Pilih purchase order terlebih dahulu.");
      return;
    }
    const validItems = data.items.filter((item) => item.qty_received > 0);
    if (validItems.length === 0) {
      toast.error("Terima minimal satu item.");
      return;
    }
    // const formData = { ...data, items: validItems };
    post(goodsReceivings.store.url(), {
      // data: formData,
      onSuccess: () => toast.success("Penerimaan barang berhasil dicatat"),
      onError: () => toast.error("Gagal mencatat penerimaan"),
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title="Terima Barang" />

      <div className="mb-6">
        <Link
          href={goodsReceivings.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke daftar penerimaan
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
          <IconTruckDelivery size={28} className="text-primary" />
          Terima Barang
        </h1>
      </div>

      <form onSubmit={submit} className="max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Pilih Purchase Order</h2>
              <select
                value={selectedPoId}
                onChange={(e) => selectPO(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
              >
                <option value="">Pilih PO yang sudah dipesan...</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.document_number} - {order.supplier?.name || "Tanpa Supplier"}
                  </option>
                ))}
              </select>
              {errors.purchase_order_id && (
                <p className="mt-1 text-xs text-danger">{errors.purchase_order_id}</p>
              )}
            </CardContent>
          </Card>

          {selectedOrder && data.items.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold text-fg">Item Diterima</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Produk</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">Qty PO</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                          Sudah Diterima
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">Sisa</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                          Qty Diterima
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                          Catatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, index) => (
                        <tr key={item.purchase_order_item_id} className="border-b border-border">
                          <td className="px-3 py-3">
                            <p className="font-medium text-fg">{item.product_title}</p>
                            <p className="text-xs text-muted-fg">{item.product_sku}</p>
                          </td>
                          <td className="px-3 py-3 text-right text-fg">{item.qty_ordered}</td>
                          <td className="px-3 py-3 text-right text-muted-fg">
                            {item.qty_received_already}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-warning">
                            {item.outstanding}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              max={item.outstanding}
                              value={item.qty_received}
                              onChange={(e) => updateItem(index, e.target.value)}
                              className="h-10 w-24 rounded-lg border border-input bg-muted px-3 text-right text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <input
                              type="text"
                              value={item.notes || ""}
                              onChange={(e) => updateItemNotes(index, e.target.value)}
                              placeholder="-"
                              className="h-10 w-32 rounded-lg border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedOrder && data.items.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold text-fg">Catatan Penerimaan</h2>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  placeholder="Catatan penerimaan barang (opsional)"
                />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Link
              href={goodsReceivings.index.url()}
              className="flex h-11 items-center rounded-xl border border-border bg-bg px-6 text-sm font-semibold text-muted-fg transition hover:bg-muted"
            >
              Batal
            </Link>
            {selectedOrder && data.items.length > 0 && (
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-success/30 hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <IconTruckDelivery size={18} />
                {processing ? "Menyimpan..." : "Konfirmasi Penerimaan"}
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
