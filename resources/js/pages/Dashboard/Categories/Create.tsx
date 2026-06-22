import { useState } from "react";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { IconCategory, IconDeviceFloppy, IconArrowLeft, IconPhoto } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import categories from "@/routes/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";

export default function Create() {
  const { errors } = usePage().props as any;
  const { data, setData, post, processing } = useForm({
    image: "" as string | File,
    name: "",
    description: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setData("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(categories.store.url());
  }

  return (
    <>
      <Head title="Tambah Kategori" />

      <div className="mb-6">
        <Link
          href={categories.index.url()}
          className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary mb-3"
        >
          <IconArrowLeft size={16} />
          Kembali ke Kategori
        </Link>
        <Heading level={1} className="flex items-center gap-2">
          <IconCategory size={28} className="text-primary" />
          Tambah Kategori Baru
        </Heading>
      </div>

      <form onSubmit={submit} encType="multipart/form-data">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconPhoto size={18} />
                  Gambar Kategori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <IconPhoto size={48} className="mx-auto text-muted-fg mb-2" />
                      <p className="text-sm text-muted-fg">Belum ada gambar</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-muted-fg file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary-subtle file:text-primary hover:file:bg-primary-subtle/80 cursor-pointer"
                />
                {errors.image && <p className="mt-1 text-xs text-danger">{errors.image}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Informasi Kategori</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-fg mb-1.5">
                    Nama Kategori
                  </label>
                  <Input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="Masukkan nama kategori"
                    aria-label="Nama Kategori"
                    // @ts-expect-error
                    isInvalid={!!errors.name}
                  />
                  {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-fg mb-1.5">
                    Deskripsi
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Deskripsi kategori (opsional)"
                    rows={3}
                    className="relative block w-full appearance-none rounded-lg bg-(--control-bg,transparent) px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] text-base/6 text-fg placeholder:text-muted-fg sm:text-sm/6 border border-input enabled:hover:border-muted-fg/30 outline-hidden focus:border-ring/70 focus:ring-3 focus:ring-ring/20 focus:enabled:hover:border-ring/80 in-disabled:bg-muted dark:scheme-dark"
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-danger">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Link href={categories.index.url()}>
                <Button intent="outline">Batal</Button>
              </Link>
              <Button type="submit" isDisabled={processing} intent="primary">
                <IconDeviceFloppy size={18} />
                {processing ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
