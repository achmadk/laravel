import GuestLayout from "@/layouts/guest-layout";
import AuthBotGuardFields from "@/components/auth-bot-guard-fields";
import { Head, useForm, Link } from "@inertiajs/react";
import { IconMailCheck, IconLoader2, IconLogout, IconRefresh } from "@tabler/icons-react";
import type { BotGuardPayload } from "@/types/auth";

interface VerifyEmailProps {
  status?: string;
  botGuard?: BotGuardPayload;
}

export default function VerifyEmail({ status, botGuard }: VerifyEmailProps) {
  const honeypotField = botGuard?.honeypot_field ?? "company_website";
  const tokenField = botGuard?.token_field ?? "bot_guard_token";
  const { data, setData, post, processing, errors } = useForm({
    [honeypotField]: "",
    [tokenField]: botGuard?.token ?? "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/verify-email");
  };

  return (
    <>
      <Head title="Verifikasi Email" />

      {status === "verification-link-sent" && (
        <div className="stagger-1 mb-6 animate-fade-up rounded-xl bg-success-subtle p-4 text-sm text-success">
          Link verifikasi baru sudah dikirim ke email Anda.
        </div>
      )}

      <div className="stagger-1 animate-fade-up rounded-[20px] border border-[var(--border)] bg-white p-6 dark:bg-[var(--overlay)]">
        {/* Spam check tip */}
        <div className="mb-5 rounded-xl bg-[var(--muted)] p-4 text-[var(--muted-fg)] text-sm">
          Pastikan juga memeriksa folder spam atau promotion jika email belum terlihat di inbox.
        </div>

        {errors.human && (
          <div className="mb-5 rounded-xl bg-danger-subtle px-4 py-3 text-danger text-sm">
            {errors.human}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <AuthBotGuardFields
            botGuard={botGuard}
            data={data}
            setData={setData as (field: string, value: unknown) => void}
          />

          {/* Resend button */}
          <button
            type="submit"
            disabled={processing}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] font-semibold text-[var(--primary-fg)] transition-all hover:opacity-90 focus:ring-3 focus:ring-[var(--primary-subtle)] active:scale-[0.985] disabled:opacity-50"
          >
            {processing ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Mengirim ulang...
              </>
            ) : (
              <>
                <IconRefresh size={18} />
                Kirim Ulang Email Verifikasi
              </>
            )}
          </button>

          {/* Logout */}
          <Link
            href="/logout"
            method="post"
            as="button"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white font-semibold text-[var(--fg)] transition-all hover:bg-[var(--muted)] dark:bg-transparent"
          >
            <IconLogout size={18} />
            Keluar
          </Link>
        </form>
      </div>
    </>
  );
}

VerifyEmail.layout = (page: React.ReactNode) => (
  <GuestLayout
    header="Verifikasi Email Anda"
    description="Sebelum masuk ke dashboard, klik link verifikasi yang sudah kami kirim ke email Anda. Jika email belum diterima, kirim ulang dari halaman ini."
    hero={
      <div className="text-center text-white">
        <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-2xl bg-white/20">
          <IconMailCheck size={48} />
        </div>
        <h2 className="mb-4 font-bold text-3xl">Aktivasi Akun Lebih Aman</h2>
        <p className="text-lg opacity-90">
          Verifikasi email membantu memastikan hanya akun yang valid yang dapat mengakses dashboard
          dan data operasional toko.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Akses Terverifikasi", "Perlindungan Akun", "Dashboard Aman"].map((item, index) => (
            <span key={index} className="rounded-full bg-white/20 px-4 py-2 font-medium text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    }
    children={page}
  />
);
