import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { IconBuildingStore, IconDeviceFloppy, IconPhoto } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import settings from "@/routes/settings";
import { Card, CardContent } from "@/components/ui/card";

interface StoreSettings {
  store_name?: string;
  store_logo?: string | null;
  store_address?: string | null;
  store_phone?: string | null;
  store_email?: string | null;
  store_website?: string | null;
  store_city?: string | null;
}

interface StoreProps {
  settings: StoreSettings;
}

export default function Store({ settings: storeSettings }: StoreProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    store_name: storeSettings.store_name || "",
    store_logo: null as File | null,
    store_address: storeSettings.store_address || "",
    store_phone: storeSettings.store_phone || "",
    store_email: storeSettings.store_email || "",
    store_website: storeSettings.store_website || "",
    store_city: storeSettings.store_city || "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(storeSettings.store_logo || null);

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(settings.store.update.url(), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Profil toko disimpan");
        reset("store_logo");
      },
      onError: () => toast.error("Gagal menyimpan profil toko"),
    });
  }

  return (
    <>
      <Head title="Profil Toko" />

      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-2xl text-fg">Pengaturan Toko</h1>
          <p className="text-muted-fg text-sm">
            Atur identitas toko yang muncul di struk dan laporan.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-6">
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="lg:w-1/3">
                  <label className="mb-3 flex items-center gap-2 font-semibold text-fg text-sm">
                    <IconPhoto size={18} />
                    Logo Toko
                  </label>
                  <div className="mb-3 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-border border-dashed bg-muted">
                    {logoPreview ? (
                      <img
                        src={
                          logoPreview.startsWith("http") || logoPreview.startsWith("/storage")
                            ? logoPreview
                            : `/storage/${logoPreview}`
                        }
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <IconBuildingStore size={36} className="text-muted-fg" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setData("store_logo", file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-muted-fg text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:font-medium file:text-primary file:text-sm hover:file:bg-primary/20"
                  />
                  {errors.store_logo && (
                    <p className="mt-1 text-danger text-xs">{errors.store_logo}</p>
                  )}
                </div>

                <div className="space-y-4 lg:flex-1">
                  <div>
                    <label className="mb-2 block font-medium text-fg text-sm">Nama Toko</label>
                    <input
                      value={data.store_name}
                      onChange={(e) => setData("store_name", e.target.value)}
                      placeholder="Nama toko"
                      className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                    />
                    {errors.store_name && (
                      <p className="mt-1 text-danger text-xs">{errors.store_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block font-medium text-fg text-sm">Alamat Lengkap</label>
                    <textarea
                      value={data.store_address}
                      onChange={(e) => setData("store_address", e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                    />
                    {errors.store_address && (
                      <p className="mt-1 text-danger text-xs">{errors.store_address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-medium text-fg text-sm">
                        Kota/Kabupaten
                      </label>
                      <input
                        value={data.store_city}
                        onChange={(e) => setData("store_city", e.target.value)}
                        placeholder="contoh: Surabaya"
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {errors.store_city && (
                        <p className="mt-1 text-danger text-xs">{errors.store_city}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block font-medium text-fg text-sm">
                        Nomor Telepon
                      </label>
                      <input
                        value={data.store_phone}
                        onChange={(e) => setData("store_phone", e.target.value)}
                        placeholder="0812xxxxxxx"
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {errors.store_phone && (
                        <p className="mt-1 text-danger text-xs">{errors.store_phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-medium text-fg text-sm">Email</label>
                      <input
                        type="email"
                        value={data.store_email}
                        onChange={(e) => setData("store_email", e.target.value)}
                        placeholder="email@toko.com"
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {errors.store_email && (
                        <p className="mt-1 text-danger text-xs">{errors.store_email}</p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block font-medium text-fg text-sm">
                        Website / Sosial Media
                      </label>
                      <input
                        value={data.store_website}
                        onChange={(e) => setData("store_website", e.target.value)}
                        placeholder="https://"
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {errors.store_website && (
                        <p className="mt-1 text-danger text-xs">{errors.store_website}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-border border-t pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <IconDeviceFloppy size={18} />
                  {processing ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

Store.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
