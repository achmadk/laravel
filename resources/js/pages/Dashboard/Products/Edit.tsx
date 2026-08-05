import { useState } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import {
  IconPackage,
  IconDeviceFloppy,
  IconArrowLeft,
  IconPhoto,
  IconBarcode,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { imageUrl } from "@/lib/image-url";
import products from "@/routes/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  title: string;
  image: string | null;
  barcode: string | null;
  sku: string | null;
  buy_price: number;
  sell_price: number;
  stock: number;
  category_id: number | null;
  description: string | null;
}

interface EditProps {
  categories: Category[];
  product: Product;
}

export default function Edit({ categories, product }: EditProps) {
  const { errors } = usePage().props as any;
  const { data, setData, post, processing } = useForm({
    _method: "PUT",
    image: "" as string | File,
    barcode: product.barcode ?? "",
    sku: product.sku ?? "",
    title: product.title,
    category_id: product.category_id ?? "",
    description: product.description ?? "",
    buy_price: product.buy_price,
    sell_price: product.sell_price,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    product.image ? imageUrl(product.image) : null,
  );

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setData("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(products.update.url({ product: product.id }));
  }

  return (
    <>
      <Head title="Edit Produk" />

      <div className="mb-6">
        <Link
          href={products.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke Produk
        </Link>
        <Heading level={1} className="flex items-center gap-2">
          <IconPackage size={28} className="text-primary" />
          Edit Produk
        </Heading>
        <p className="mt-1 text-muted-fg text-sm">{product.title}</p>
      </div>

      <form onSubmit={submit} encType="multipart/form-data">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconPhoto size={18} />
                  Gambar Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-border border-dashed bg-muted">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="p-6 text-center">
                      <IconPhoto size={48} className="mx-auto mb-2 text-muted-fg" strokeWidth={1} />
                      <p className="text-muted-fg text-sm">Belum ada gambar</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full cursor-pointer text-muted-fg text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-fg file:text-sm hover:file:brightness-110"
                />
                {errors.image && <p className="mt-1 text-danger text-xs">{errors.image}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconBarcode size={18} />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                      Kategori
                    </label>
                    <select
                      value={data.category_id}
                      onChange={(e) => setData("category_id", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
                    >
                      <option value="">Pilih kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="mt-1 text-danger text-xs">{errors.category_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                      Barcode
                    </label>
                    <Input
                      type="text"
                      value={data.barcode}
                      onChange={(e) => setData("barcode", e.target.value)}
                      placeholder="Kode produk"
                      // @ts-expect-error
                      isInvalid={!!errors.barcode}
                    />
                    {errors.barcode && <p className="mt-1 text-danger text-xs">{errors.barcode}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">SKU</label>
                    <Input
                      type="text"
                      value={data.sku}
                      onChange={(e) => setData("sku", e.target.value)}
                      placeholder="SKU unik"
                      // @ts-expect-error
                      isInvalid={!!errors.sku}
                    />
                    {errors.sku && <p className="mt-1 text-danger text-xs">{errors.sku}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                      Nama Produk
                    </label>
                    <Input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData("title", e.target.value)}
                      placeholder="Nama produk"
                      // @ts-expect-error
                      isInvalid={!!errors.title}
                    />
                    {errors.title && <p className="mt-1 text-danger text-xs">{errors.title}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                      Deskripsi
                    </label>
                    <textarea
                      value={data.description}
                      onChange={(e) => setData("description", e.target.value)}
                      placeholder="Deskripsi produk"
                      rows={3}
                      className="dark:scheme-dark relative block w-full appearance-none rounded-lg border border-input bg-(--control-bg,transparent) in-disabled:bg-muted px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-fg outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20 enabled:hover:border-muted-fg/30 focus:enabled:hover:border-ring/80 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6"
                    />
                    {errors.description && (
                      <p className="mt-1 text-danger text-xs">{errors.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <IconCurrencyDollar size={18} />
                  Harga Produk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                      Harga Beli
                    </label>
                    <Input
                      type="number"
                      value={data.buy_price}
                      onChange={(e) => setData("buy_price", Number(e.target.value))}
                      placeholder="0"
                      // @ts-expect-error
                      isInvalid={!!errors.buy_price}
                    />
                    {errors.buy_price && (
                      <p className="mt-1 text-danger text-xs">{errors.buy_price}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                      Harga Jual
                    </label>
                    <Input
                      type="number"
                      value={data.sell_price}
                      onChange={(e) => setData("sell_price", Number(e.target.value))}
                      placeholder="0"
                      // @ts-expect-error
                      isInvalid={!!errors.sell_price}
                    />
                    {errors.sell_price && (
                      <p className="mt-1 text-danger text-xs">{errors.sell_price}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-muted/50 px-4 py-3">
                  <p className="font-semibold text-muted-fg text-xs uppercase tracking-wide">
                    Stok Saat Ini
                  </p>
                  <p className="mt-1 font-bold text-fg text-lg">{product.stock}</p>
                  <p className="mt-1 text-muted-fg text-xs">
                    Perubahan stok dilakukan melalui transaksi atau stock opname.
                  </p>
                </div>

                {Number(data.buy_price) > 0 && Number(data.sell_price) > 0 && (
                  <div className="mt-4 rounded-2xl border border-success/30 bg-success-subtle/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-success">Estimasi Profit per Item</p>
                        <p className="mt-1 font-bold text-2xl text-success">
                          + Rp{" "}
                          {(Number(data.sell_price) - Number(data.buy_price)).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm text-success">Margin</p>
                        <p className="mt-1 font-bold text-success text-xl">
                          {(
                            ((Number(data.sell_price) - Number(data.buy_price)) /
                              Number(data.buy_price)) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href={products.index.url()}>
                <Button intent="outline">Batal</Button>
              </Link>
              <Button type="submit" isDisabled={processing} intent="primary">
                <IconDeviceFloppy size={18} />
                {processing ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

Edit.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
