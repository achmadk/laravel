import GuestLayout from "@/layouts/guest-layout";
import { Head, useForm } from "@inertiajs/react";
import { IconShieldLock, IconLock, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

interface ConfirmPasswordProps {
  challenge?: {
    route?: string;
  } | null;
}

export default function ConfirmPassword({ challenge }: ConfirmPasswordProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => reset("password");
  }, []);

  const challengeLabel = useMemo(() => {
    if (!challenge?.route) {
      return "aksi sensitif";
    }
    return challenge.route.replaceAll(".", " / ");
  }, [challenge]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/confirm-password");
  };

  return (
    <>
      <Head title="Konfirmasi Password" />

      <div className="animate-fade-up stagger-1 mb-6">
        <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[var(--primary-subtle)]">
          <IconShieldLock size={22} className="text-[var(--primary)]" />
        </div>
        <p className="text-sm text-[var(--muted-fg)]">
          Untuk melanjutkan {challengeLabel}, masukkan kembali password akun Anda.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Password */}
        <div className="animate-fade-up stagger-2">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconLock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Masukkan password Anda"
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.password
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-danger-500">{errors.password}</p>}
        </div>

        {/* Submit */}
        <div className="animate-fade-up stagger-3">
          <button
            type="submit"
            disabled={processing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-[var(--primary-fg)] transition-all hover:opacity-90 active:scale-[0.985] focus:ring-3 focus:ring-[var(--primary-subtle)] disabled:opacity-50"
          >
            {processing ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Lanjutkan"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

ConfirmPassword.layout = (page: React.ReactNode) => (
  <GuestLayout
    header="Konfirmasi Password"
    hero={
      <div className="text-center text-white">
        <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-2xl bg-white/20">
          <IconShieldLock size={48} />
        </div>
        <h2 className="mb-4 text-3xl font-bold">Proteksi Aksi Admin</h2>
        <p className="text-lg opacity-90">
          Konfirmasi password ulang membantu menahan aksi sensitif saat sesi admin sudah lama aktif.
        </p>
      </div>
    }
    children={page}
  />
);
