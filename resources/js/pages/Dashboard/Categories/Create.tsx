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
          className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconPhoto size={18} />
                  Gambar Kategori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-border border-dashed bg-muted">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="p-6 text-center">
                      <IconPhoto size={48} className="mx-auto mb-2 text-muted-fg" />
                      <p className="text-muted-fg text-sm">Belum ada gambar</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full cursor-pointer text-muted-fg text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-primary-subtle file:px-4 file:py-2 file:font-medium file:text-primary file:text-sm hover:file:bg-primary-subtle/80"
                />
                {errors.image && <p className="mt-1 text-danger text-xs">{errors.image}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Informasi Kategori</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-medium text-muted-fg text-sm">
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
                  {errors.name && <p className="mt-1 text-danger text-xs">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-muted-fg text-sm">
                    Deskripsi
                  </label>
                  <textarea
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Deskripsi kategori (opsional)"
                    rows={3}
                    className="dark:scheme-dark relative block w-full appearance-none rounded-lg border border-input bg-(--control-bg,transparent) in-disabled:bg-muted px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] text-base/6 text-fg outline-hidden placeholder:text-muted-fg focus:border-ring/70 focus:ring-3 focus:ring-ring/20 enabled:hover:border-muted-fg/30 focus:enabled:hover:border-ring/80 sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6"
                  />
                  {errors.description && (
                    <p className="mt-1 text-danger text-xs">{errors.description}</p>
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
