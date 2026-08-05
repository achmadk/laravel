import { useState } from "react";
import { Head, usePage, useForm, Link } from "@inertiajs/react";
import { IconUserPlus, IconDeviceFloppy, IconArrowLeft, IconShield } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import users from "@/routes/users";

interface Role {
  id: number;
  name: string;
}

export default function Create() {
  const { roles } = usePage().props as unknown as { roles: Role[] };

  const { data, setData, post, errors, processing } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    selectedRoles: [] as string[],
    avatar: null as File | null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  function setSelectedRoles(e: React.ChangeEvent<HTMLInputElement>) {
    const items = data.selectedRoles.includes(e.target.value)
      ? data.selectedRoles.filter((name) => name !== e.target.value)
      : [...data.selectedRoles, e.target.value];
    setData("selectedRoles", items);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(users.store.url());
  }

  return (
    <>
      <Head title="Tambah Pengguna" />

      <div className="mb-6">
        <Link
          href={users.index.url()}
          className="mb-3 inline-flex items-center gap-2 text-muted-fg text-sm hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke Pengguna
        </Link>
        <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
          <IconUserPlus size={28} className="text-primary" />
          Tambah Pengguna Baru
        </h1>
      </div>

      <form onSubmit={submit}>
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border border-border bg-bg p-6">
            <h3 className="mb-4 font-semibold text-fg text-sm">Informasi Akun</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-fg text-sm">Avatar</label>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold text-muted-fg">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{data.name ? data.name.charAt(0).toUpperCase() : "?"}</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setData("avatar", file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="block w-full text-muted-fg text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:font-medium file:text-primary file:text-sm hover:file:bg-primary/20"
                  />
                </div>
                {errors.avatar && <p className="mt-1 text-danger text-xs">{errors.avatar}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.name && <p className="mt-1 text-danger text-xs">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.email && <p className="mt-1 text-danger text-xs">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Kata Sandi</label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.password && <p className="mt-1 text-danger text-xs">{errors.password}</p>}
              </div>

              <div>
                <label className="mb-2 block font-medium text-fg text-sm">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={data.password_confirmation}
                  onChange={(e) => setData("password_confirmation", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                />
                {errors.password_confirmation && (
                  <p className="mt-1 text-danger text-xs">{errors.password_confirmation}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg text-sm">
              <IconShield size={16} />
              Akses Group
            </h3>
            <div className="flex flex-wrap gap-4">
              {roles.map((role, i) => (
                <label
                  key={i}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 transition-all ${
                    data.selectedRoles.includes(role.name)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={role.name}
                    onChange={setSelectedRoles}
                    checked={data.selectedRoles.includes(role.name)}
                    className="rounded border-border text-primary focus:ring-ring"
                  />
                  <span className="font-medium text-fg text-sm capitalize">{role.name}</span>
                </label>
              ))}
            </div>
            {errors.selectedRoles && (
              <p className="mt-3 text-danger text-xs">{errors.selectedRoles}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={users.index.url()}
              className="rounded-xl border border-border px-5 py-2.5 font-medium text-muted-fg transition-colors hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

Create.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
