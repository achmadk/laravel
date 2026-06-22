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
          className="inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary mb-3"
        >
          <IconArrowLeft size={16} />
          Kembali ke Pengguna
        </Link>
        <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
          <IconUserPlus size={28} className="text-primary" />
          Tambah Pengguna Baru
        </h1>
      </div>

      <form onSubmit={submit}>
        <div className="max-w-2xl space-y-6">
          <div className="bg-bg rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-fg mb-4">Informasi Akun</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-fg mb-2">Avatar</label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted overflow-hidden flex items-center justify-center text-muted-fg font-semibold">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
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
                    className="block w-full text-sm text-muted-fg file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                {errors.avatar && <p className="text-xs text-danger mt-1">{errors.avatar}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Masukkan nama"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">Email</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">Kata Sandi</label>
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={data.password_confirmation}
                  onChange={(e) => setData("password_confirmation", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors.password_confirmation && (
                  <p className="text-xs text-danger mt-1">{errors.password_confirmation}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-bg rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-fg mb-4 flex items-center gap-2">
              <IconShield size={16} />
              Akses Group
            </h3>
            <div className="flex flex-wrap gap-4">
              {roles.map((role, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
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
                  <span className="text-sm font-medium text-fg capitalize">{role.name}</span>
                </label>
              ))}
            </div>
            {errors.selectedRoles && (
              <p className="text-xs text-danger mt-3">{errors.selectedRoles}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={users.index.url()}
              className="px-5 py-2.5 rounded-xl border border-border text-muted-fg hover:bg-muted font-medium transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-50"
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
