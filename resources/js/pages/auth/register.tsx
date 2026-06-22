import GuestLayout from "@/layouts/guest-layout";
import AuthBotGuardFields from "@/components/auth-bot-guard-fields";
import { Head, useForm, Link } from "@inertiajs/react";
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconRocket,
  IconClock,
  IconHeadset,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { BotGuardPayload } from "@/types/auth";

interface RegisterProps {
  botGuard?: BotGuardPayload;
}

export default function Register({ botGuard }: RegisterProps) {
  const honeypotField = botGuard?.honeypot_field ?? "company_website";
  const tokenField = botGuard?.token_field ?? "bot_guard_token";
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    [honeypotField]: "",
    [tokenField]: botGuard?.token ?? "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    return () => reset("password", "password_confirmation");
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/register");
  };

  return (
    <>
      <Head title="Daftar" />

      <form onSubmit={submit} className="space-y-5">
        <AuthBotGuardFields
          botGuard={botGuard}
          data={data}
          setData={setData as (field: string, value: unknown) => void}
        />

        {errors.human && (
          <div className="animate-fade-up stagger-1 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600 dark:bg-danger-950/40 dark:text-danger-300">
            {errors.human}
          </div>
        )}

        {/* Name */}
        <div className="animate-fade-up stagger-1">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">Nama Lengkap</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconUser size={18} />
            </div>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              placeholder="Nama Anda"
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.name
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="name"
              autoFocus
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-danger-500">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="animate-fade-up stagger-2">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">Email</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconMail size={18} />
            </div>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              placeholder="nama@email.com"
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.email
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="username"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-danger-500">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="animate-fade-up stagger-3">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">Password</label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconLock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              placeholder="Minimal 8 karakter"
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.password
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="new-password"
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

        {/* Confirm Password */}
        <div className="animate-fade-up stagger-4">
          <label className="mb-1.5 block text-xs font-medium text-[var(--fg)]">
            Konfirmasi Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]">
              <IconLock size={18} />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              placeholder="Ulangi password"
              className={`h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-sm text-[var(--fg)] placeholder-[var(--muted-fg)] outline-none transition-all dark:bg-[var(--overlay)] ${
                errors.password_confirmation
                  ? "border-danger-500"
                  : "border-[var(--input)] focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary-subtle)]"
              }`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
              tabIndex={-1}
            >
              {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-danger-500">{errors.password_confirmation}</p>
          )}
        </div>

        {/* Submit */}
        <div className="animate-fade-up stagger-5">
          <button
            type="submit"
            disabled={processing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-[var(--primary-fg)] transition-all hover:opacity-90 active:scale-[0.985] focus:ring-3 focus:ring-[var(--primary-subtle)] disabled:opacity-50"
          >
            {processing ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Memproses...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </div>

        {/* Login Link */}
        <p className="animate-fade-up stagger-6 text-center text-sm text-[var(--muted-fg)]">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--primary)] hover:text-[var(--primary)]/80"
          >
            Masuk disini
          </Link>
        </p>
      </form>
    </>
  );
}

Register.layout = (page: React.ReactNode) => (
  <GuestLayout
    header="Buat Akun Baru"
    description="Daftarkan bisnis Anda sekarang"
    hero={
      <div className="max-w-sm text-white">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.08] px-3 py-1 text-[0.75rem] font-medium text-white/[0.85]">
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
          Mulai Gratis
        </div>

        <h2 className="mb-4 text-[1.75rem] font-semibold leading-tight tracking-tight text-white">
          Bergabung Bersama Kami
          <br />
          dan kelola bisnis dengan mudah
        </h2>

        <p className="mb-8 text-[0.9375rem] leading-relaxed text-white/75">
          Daftar sekarang dan nikmati kemudahan mengelola penjualan, stok, dan laporan bisnis dalam
          satu platform terintegrasi.
        </p>

        <div className="space-y-3">
          {[
            { icon: IconRocket, text: "Gratis untuk memulai" },
            { icon: IconClock, text: "Setup dalam 5 menit" },
            { icon: IconHeadset, text: "Dukungan penuh 24/7" },
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
