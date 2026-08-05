import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconPlus, IconTrash, IconTruckReturn } from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardLayout from "@/layouts/dashboard-layout";
import supplierReturns from "@/routes/supplier-returns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";

interface Supplier {
  id: number;
  name: string;
}

interface GoodsReceivingItem {
  id: number;
  product_id: number;
  product: { id: number; title: string; sku: string } | null;
  purchase_order_item: { unit_price: number } | null;
  qty_received: number;
}

interface GoodsReceiving {
  id: number;
  document_number: string;
  items: GoodsReceivingItem[];
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
  goodsReceivings: GoodsReceiving[];
  products: Product[];
}

interface Item {
  product_id?: number;
  goods_receiving_item_id?: number;
  product_title: string;
  product_sku: string;
  qty_returned: number;
  unit_price: number;
  reason: string;
  notes: string;
}

const formatPrice = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function Create({ suppliers, goodsReceivings, products }: CreateProps) {
  const { data, setData, post, processing } = useForm({
    supplier_id: "",
    goods_receiving_id: "",
    payable_id: "",
    notes: "",
    items: [] as Item[],
  });

  const [selectedGrId, setSelectedGrId] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const selectedGr = goodsReceivings.find((gr) => gr.id === Number(selectedGrId));

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchProduct.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchProduct.toLowerCase())),
  );

  const addItemFromProduct = (product: Product) => {
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
        qty_returned: 1,
        unit_price: Number(product.buy_price) || 0,
        reason: "",
        notes: "",
      },
    ]);
  };

  const addItemFromGr = (grItem: GoodsReceivingItem) => {
    if (data.items.some((i) => i.goods_receiving_item_id === grItem.id)) {
      toast.error("Item sudah ada di daftar.");
      return;
    }
    setData("items", [
      ...data.items,
      {
        goods_receiving_item_id: grItem.id,
        product_id: grItem.product_id,
        product_title: grItem.product?.title || "Produk #" + grItem.product_id,
        product_sku: grItem.product?.sku || "-",
        qty_returned: 1,
        unit_price: Number(grItem.purchase_order_item?.unit_price) || 0,
        reason: "",
        notes: "",
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
    if (key === "qty_returned") {
      items[index] = { ...items[index], qty_returned: parseInt(value) || 0 };
    } else if (key === "unit_price") {
      items[index] = { ...items[index], unit_price: Number(value) || 0 };
    } else {
      items[index] = { ...items[index], [key]: value };
    }
    setData("items", items);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.items.length === 0) {
      toast.error("Tambahkan minimal satu item.");
      return;
    }
    if (!data.supplier_id) {
      toast.error("Pilih supplier.");
      return;
    }
    post(supplierReturns.store.url(), {
      onError: () => toast.error("Gagal membuat retur supplier"),
    });
  };

  const total = data.items.reduce((sum, item) => sum + item.qty_returned * item.unit_price, 0);

  return (
    <>
      <Head title="Buat Retur Supplier" />
      <div className="space-y-6">
        <PageHeader
          title="Buat Retur Supplier"
          description={
            <Link
              href={supplierReturns.index.url()}
              className="inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
            >
              <IconArrowLeft size={16} />
              Kembali ke daftar retur
            </Link>
          }
          icon={<IconTruckReturn size={20} />}
        />

        <form onSubmit={submit} className="max-w-5xl">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-fg text-lg">Informasi Retur</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block font-semibold text-fg text-sm">Supplier</label>
                    <select
                      value={data.supplier_id}
                      onChange={(e) => {
                        setData({
                          supplier_id: e.target.value,
                          goods_receiving_id: "",
                          payable_id: "",
                          items: [],
                        });
                        setSelectedGrId("");
                      }}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Pilih Supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-fg text-sm">
                      Penerimaan Barang (Opsional)
                    </label>
                    <select
                      value={selectedGrId}
                      onChange={(e) => {
                        setSelectedGrId(e.target.value);
                        setData("goods_receiving_id", e.target.value);
                      }}
                      disabled={!data.supplier_id}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="">Tidak terkait GR</option>
                      {goodsReceivings.map((gr) => (
                        <option key={gr.id} value={gr.id}>
                          {gr.document_number} ({gr.items?.length || 0} item)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold text-fg text-sm">Catatan</label>
                    <input
                      type="text"
                      value={data.notes}
                      onChange={(e) => setData("notes", e.target.value)}
                      placeholder="Catatan retur"
                      className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 font-semibold text-fg text-lg">Item Retur</h2>

                {selectedGr && (
                  <div className="mb-4">
                    <p className="mb-2 font-medium text-muted-fg text-sm">
                      Item dari GR {selectedGr.document_number}
                    </p>
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
                      {selectedGr.items?.map((grItem) => {
                        const outstanding = grItem.qty_received || 0;
                        return outstanding > 0 ? (
                          <button
                            key={grItem.id}
                            type="button"
                            onClick={() => addItemFromGr(grItem)}
                            className="flex w-full items-center justify-between rounded-lg border border-border bg-muted px-4 py-2 text-left text-sm transition hover:border-primary/30 hover:bg-primary/5"
                          >
                            <div>
                              <p className="font-medium text-fg">
                                {grItem.product?.title || "Produk #" + grItem.product_id}
                              </p>
                              <p className="text-muted-fg text-xs">
                                {grItem.product?.sku || "-"} &bull; Harga:{" "}
                                {formatPrice(grItem.purchase_order_item?.unit_price || 0)}
                              </p>
                            </div>
                            <span className="text-primary text-xs">+ Tambah</span>
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-4 flex gap-3">
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Cari produk untuk ditambahkan..."
                    className="h-11 flex-1 rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                  />
                </div>
                {searchProduct && filteredProducts.length > 0 && (
                  <div className="mb-4 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addItemFromProduct(product)}
                        className="flex w-full items-center justify-between rounded-lg border border-border bg-muted px-4 py-3 text-left text-sm transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div>
                          <p className="font-medium text-fg">{product.title}</p>
                          <p className="text-muted-fg text-xs">
                            {product.sku || "-"} &bull; Stok: {product.stock}
                          </p>
                        </div>
                        <span className="text-muted-fg text-xs">
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
                        <tr className="border-border border-b">
                          <th className="px-3 py-2 text-left font-semibold text-muted-fg">
                            Produk
                          </th>
                          <th className="px-3 py-2 text-right font-semibold text-muted-fg">Qty</th>
                          <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                            Harga
                          </th>
                          <th className="px-3 py-2 text-right font-semibold text-muted-fg">
                            Subtotal
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-muted-fg">
                            Alasan
                          </th>
                          <th className="w-16 px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.items.map((item, index) => (
                          <tr key={index} className="border-border border-b">
                            <td className="px-3 py-3">
                              <p className="font-medium text-fg">{item.product_title}</p>
                              <p className="text-muted-fg text-xs">{item.product_sku}</p>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <input
                                type="number"
                                min="1"
                                value={item.qty_returned}
                                onChange={(e) => updateItem(index, "qty_returned", e.target.value)}
                                className="h-10 w-20 rounded-lg border border-input bg-muted px-3 text-right text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                              />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                                className="h-10 w-28 rounded-lg border border-input bg-muted px-3 text-right text-fg text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                              />
                            </td>
                            <td className="px-3 py-3 text-right font-semibold text-fg">
                              {formatPrice(item.qty_returned * item.unit_price)}
                            </td>
                            <td className="px-3 py-3">
                              <input
                                type="text"
                                value={item.reason || ""}
                                onChange={(e) => updateItem(index, "reason", e.target.value)}
                                placeholder="Alasan retur"
                                className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                              />
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
                        <tr className="border-border border-t-2">
                          <td colSpan={3} className="px-3 py-3 text-right font-bold text-fg">
                            Total
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-danger">
                            {formatPrice(total)}
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border border-dashed p-8 text-center">
                    <p className="text-muted-fg text-sm">
                      Pilih supplier, lalu tambahkan item dari GR atau cari produk di atas.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link
                href={supplierReturns.index.url()}
                className="flex h-11 items-center rounded-xl border border-border bg-bg px-6 font-semibold text-muted-fg text-sm transition hover:bg-muted"
              >
                Batal
              </Link>
              <Button type="submit" isDisabled={processing} intent="primary">
                <IconPlus size={18} />
                {processing ? "Menyimpan..." : "Simpan Retur"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
