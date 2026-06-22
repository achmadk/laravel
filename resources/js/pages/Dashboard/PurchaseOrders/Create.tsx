import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconPackage,
  IconPlus,
  IconTrash,
  IconShoppingCart,
} from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/dashboard-layout";
import purchaseOrders from "@/routes/purchase-orders";
// import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  sku: string | null;
  stock: number;
  buy_price: number | string;
}

interface CreateProps {
  suppliers: Supplier[];
  products: Product[];
}

interface Item {
  product_id: number;
  product_title: string;
  product_sku: string;
  qty_ordered: number;
  unit_price: number;
}

const formatPrice = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function Create({ suppliers, products }: CreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    supplier_id: "",
    document_number: "",
    notes: "",
    items: [] as Item[],
  });

  const [searchProduct, setSearchProduct] = useState("");
  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchProduct.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchProduct.toLowerCase())),
  );

  const addItem = (product: Product) => {
    if (data.items.some((i) => i.product_id === product.id)) {
      toast.error("Produk sudah ada di daftar.");
      return;
    }
    setData("items", [
      ...data.items,
      {
        product_id: product.id,
        product_title: product.title,
        product_sku: product.sku || "-",
        qty_ordered: 1,
        unit_price: Number(product.buy_price) || 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setData(
      "items",
      data.items.filter((_, i) => i !== index),
    );
  };

  const updateItem = (index: number, key: string, value: string) => {
    const items = [...data.items];
    items[index] = {
      ...items[index],
      [key]: key === "qty_ordered" ? parseInt(value) || 0 : Number(value) || 0,
    };
    setData("items", items);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.items.length === 0) {
      toast.error("Tambahkan minimal satu item.");
      return;
    }
    post(purchaseOrders.store.url(), {
      onError: () => toast.error("Gagal membuat purchase order"),
    });
  };

  const total = data.items.reduce((sum, item) => sum + item.qty_ordered * item.unit_price, 0);

  return (
    <>
      <Head title="Buat Purchase Order" />

      <div className="mb-6">
        <Link
          href={purchaseOrders.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke daftar PO
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
          <IconShoppingCart size={28} className="text-primary" />
          Buat Purchase Order
        </h1>
      </div>

      <form onSubmit={submit} className="max-w-5xl">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Informasi PO</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-fg">Supplier</label>
                  <select
                    value={data.supplier_id}
                    onChange={(e) => setData("supplier_id", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Pilih Supplier</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplier_id && (
                    <p className="mt-1 text-xs text-danger">{errors.supplier_id}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-fg">Nomor Dokumen</label>
                  <input
                    type="text"
                    value={data.document_number}
                    onChange={(e) => setData("document_number", e.target.value)}
                    placeholder="Kosongkan untuk auto-generate"
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-fg">Catatan</label>
                  <input
                    type="text"
                    value={data.notes}
                    onChange={(e) => setData("notes", e.target.value)}
                    placeholder="Catatan PO"
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                  />
                  {errors.notes && <p className="mt-1 text-xs text-danger">{errors.notes}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Item Pembelian</h2>
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Cari produk untuk ditambahkan..."
                  className="h-11 flex-1 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
              </div>
              {searchProduct && filteredProducts.length > 0 && (
                <div className="mb-4 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addItem(product)}
                      className="flex w-full items-center justify-between rounded-lg border border-border bg-muted px-4 py-3 text-left text-sm transition hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div>
                        <p className="font-medium text-fg">{product.title}</p>
                        <p className="text-xs text-muted-fg">
                          {product.sku || "-"} &bull; Stok: {product.stock}
                        </p>
                      </div>
                      <span className="text-xs text-muted-fg">
                        {formatPrice(product.buy_price as number)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {data.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-semibold text-muted-fg">Produk</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">Qty</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">Harga</th>
                        <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                          Subtotal
                        </th>
                        <th className="w-16 px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, index) => (
                        <tr key={index} className="border-b border-border">
                          <td className="px-3 py-3">
                            <p className="font-medium text-fg">{item.product_title}</p>
                            <p className="text-xs text-muted-fg">{item.product_sku}</p>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.qty_ordered}
                              onChange={(e) => updateItem(index, "qty_ordered", e.target.value)}
                              className="h-10 w-20 rounded-lg border border-input bg-muted px-3 text-right text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={item.unit_price}
                              onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                              className="h-10 w-28 rounded-lg border border-input bg-muted px-3 text-right text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="px-3 py-3 text-right font-medium text-fg">
                            {formatPrice(item.qty_ordered * item.unit_price)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="rounded-lg p-1.5 text-muted-fg transition hover:bg-danger/10 hover:text-danger"
                            >
                              <IconTrash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border">
                        <td colSpan={3} className="px-3 py-3 text-right font-bold text-fg">
                          Total
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-primary">
                          {formatPrice(total)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <IconPackage size={40} className="mx-auto text-muted-fg" />
                  <p className="mt-2 text-sm text-muted-fg">
                    Cari produk di atas untuk ditambahkan ke PO.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link
              href={purchaseOrders.index.url()}
              className="flex h-11 items-center rounded-xl border border-border bg-bg px-6 text-sm font-semibold text-muted-fg transition hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <IconPlus size={18} />
              {processing ? "Menyimpan..." : "Simpan PO"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
