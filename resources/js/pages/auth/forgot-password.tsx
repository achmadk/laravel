import GuestLayout from "@/layouts/guest-layout";
import AuthBotGuardFields from "@/components/auth-bot-guard-fields";
import { Head, useForm, Link } from "@inertiajs/react";
import {
  IconMail,
  IconLoader2,
  IconArrowLeft,
  IconShieldLock,
  IconDeviceMobile,
  IconRefresh,
} from "@tabler/icons-react";
import type { BotGuardPayload } from "@/types/auth";

interface ForgotPasswordProps {
  status?: string;
  botGuard?: BotGuardPayload;
}

export default function ForgotPassword({ status, botGuard }: ForgotPasswordProps) {
  const honeypotField = botGuard?.honeypot_field ?? "company_website";
  const tokenField = botGuard?.token_field ?? "bot_guard_token";
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    [honeypotField]: "",
    [tokenField]: botGuard?.token ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/forgot-password");
  };

  return (
    <>
      <Head title="Lupa Password" />

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
              autoComplete="email"
              autoFocus
            />
          </div>
          {errors.email && <p className="mt-1 text-danger text-xs">{errors.email}</p>}
        </div>

        {/* Actions */}
        <div className="stagger-2 flex animate-fade-up gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white font-semibold text-[var(--fg)] transition-all hover:bg-[var(--muted)] dark:bg-transparent"
          >
            <IconArrowLeft size={18} />
            Kembali
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-[var(--primary-fg)] transition-all hover:opacity-90 focus:ring-3 focus:ring-[var(--primary-subtle)] active:scale-[0.985] disabled:opacity-50"
          >
            {processing ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Link Reset"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

ForgotPassword.layout = (page: React.ReactNode) => (
  <GuestLayout
    header="Reset Password"
    description="Masukkan email Anda untuk menerima link reset password."
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
          Pemulihan Akun
        </div>

        <h2 className="mb-4 font-semibold text-[1.75rem] text-white leading-tight tracking-tight">
          Jangan khawatir,
          <br />
          kami bantu Anda kembali
        </h2>

        <p className="mb-8 text-[0.9375rem] text-white/75 leading-relaxed">
          Masukkan email terdaftar Anda dan kami akan kirimkan tautan aman untuk mereset password.
        </p>

        <div className="space-y-3">
          {[
            { icon: IconShieldLock, text: "Tautan aman & terenkripsi" },
            { icon: IconDeviceMobile, text: "Akses dari perangkat apa pun" },
            { icon: IconRefresh, text: "Proses cepat hanya 2 menit" },
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
