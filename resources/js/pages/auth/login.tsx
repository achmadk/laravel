import GuestLayout from "@/layouts/guest-layout";
import AuthBotGuardFields from "@/components/auth-bot-guard-fields";
import { Head, useForm, Link } from "@inertiajs/react";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconDeviceDesktopAnalytics,
  IconCoin,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { BotGuardPayload } from "@/types/auth";

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
  canRegister: boolean;
  botGuard?: BotGuardPayload;
}

export default function Login({ status, canResetPassword, canRegister, botGuard }: LoginProps) {
  const honeypotField = botGuard?.honeypot_field ?? "company_website";
  const tokenField = botGuard?.token_field ?? "bot_guard_token";
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
    [honeypotField]: "",
    [tokenField]: botGuard?.token ?? "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => reset("password");
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/login");
  };

  return (
    <>
      <Head title="Masuk" />

      <form onSubmit={submit} className="space-y-5">
        <AuthBotGuardFields
          botGuard={botGuard}
          data={data}
          setData={setData as (field: string, value: unknown) => void}
        />

        {errors.human && (
          <div className="stagger-1 animate-fade-up rounded-xl bg-danger-subtle px-4 py-3 text-danger text-sm">
            {errors.human}
          </div>
        )}

        {status && (
          <div className="stagger-1 animate-fade-up rounded-xl bg-success-subtle p-4 text-sm text-success">
            {status}
          </div>
        )}

        {/* Email */}
        <div className="stagger-1 animate-fade-up">
          <label className="mb-1.5 block font-medium text-[var(--fg)] text-xs">Email</label>
          <div className="relative">
            <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconMail size={18} />
            </div>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="nama@email.com"
              className={`h-11 w-full rounded-xl border bg-white pr-4 pl-10 text-[var(--fg)] text-sm placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.email
                  ? "border-danger"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="username"
              autoFocus
            />
          </div>
          {errors.email && <p className="mt-1 text-danger text-xs">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="stagger-2 animate-fade-up">
          <label className="mb-1.5 block font-medium text-[var(--fg)] text-xs">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconLock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="••••••••"
              className={`h-11 w-full rounded-xl border bg-white pr-11 pl-10 text-[var(--fg)] text-sm placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.password
                  ? "border-danger"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-danger text-xs">{errors.password}</p>}
        </div>

        {/* Remember & Forgot */}
        <div className="stagger-3 flex animate-fade-up items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={data.remember as boolean}
              onChange={(e) => setData("remember", e.target.checked)}
              className="size-4 appearance-none rounded-[5px] border border-[var(--input)] bg-white checked:border-[var(--primary)] checked:bg-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)] dark:bg-[var(--overlay)]"
              style={{
                backgroundImage: data.remember
                  ? "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'/%3E%3C/svg%3E\")"
                  : "none",
                backgroundSize: "12px",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <span className="text-[var(--muted-fg)] text-sm">Ingat saya</span>
          </label>

          {canResetPassword && (
            <Link
              href="/forgot-password"
              className="font-medium text-[var(--primary)] text-sm hover:text-[var(--primary)]/80"
            >
              Lupa password?
            </Link>
          )}
        </div>

        {/* Submit */}
        <div className="stagger-4 animate-fade-up">
          <button
            type="submit"
            disabled={processing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-[var(--primary-fg)] transition-all hover:opacity-90 focus:ring-3 focus:ring-[var(--primary-subtle)] active:scale-[0.985] disabled:opacity-50"
          >
            {processing ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk"
            )}
          </button>
        </div>

        {/* Register Link */}
        {canRegister && (
          <p className="stagger-5 animate-fade-up text-center text-[var(--muted-fg)] text-sm">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80"
            >
              Buat akun baru
            </Link>
          </p>
        )}
      </form>
    </>
  );
}

Login.layout = (page: React.ReactNode) => (
  <GuestLayout
    header="Masuk"
    description="Masuk ke akun Anda untuk melanjutkan"
    hero={
      <div className="max-w-sm text-white">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.08] px-3 py-1 font-medium text-[0.75rem] text-white/[0.85]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Solusi Kasir Terpercaya
        </div>

        <h2 className="mb-4 font-semibold text-[1.75rem] text-white leading-tight tracking-tight">
          Kelola toko Anda
          <br />
          dengan mudah &amp; cepat
        </h2>

        <p className="mb-8 text-[0.9375rem] text-white/75 leading-relaxed">
          Platform POS all-in-one untuk mengelola penjualan, stok, dan laporan bisnis Anda dalam
          satu tempat.
        </p>

        <div className="space-y-3">
          {[
            { icon: IconDeviceDesktopAnalytics, text: "Manajemen stok real-time" },
            { icon: IconCoin, text: "Laporan keuangan harian" },
            { icon: IconUsers, text: "Multi-kasir & multi-toko" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="flex size-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-white/[0.08] text-white/70">
                <feature.icon size={12} />
              </div>
              <span className="text-[0.8125rem] text-white/[0.85]">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    }
    children={page}
  />
);
