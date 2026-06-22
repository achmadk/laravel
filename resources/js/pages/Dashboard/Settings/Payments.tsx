import { useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import { IconCreditCard, IconDeviceFloppy, IconBrandStripe, IconCash } from "@tabler/icons-react";
import toast from "react-hot-toast";
import settings from "@/routes/settings";

interface PaymentSettingSource {
  managed_by_environment?: boolean;
  configured?: boolean;
  masked?: string;
}

interface GatewayOption {
  value: string;
  label: string;
}

interface PaymentSetting {
  default_gateway?: string;
  bank_transfer_enabled?: boolean;
  midtrans_enabled?: boolean;
  midtrans_client_key?: string;
  midtrans_production?: boolean;
  xendit_enabled?: boolean;
  xendit_public_key?: string;
  xendit_production?: boolean;
}

interface PaymentProps {
  setting?: PaymentSetting;
  paymentSettingSources?: Record<string, PaymentSettingSource>;
  supportedGateways?: GatewayOption[];
  webhookUrls?: Record<string, string>;
  webhookWarnings?: string[];
}

export default function Payment({
  setting = {},
  paymentSettingSources = {},
  supportedGateways = [],
  webhookUrls = {},
  webhookWarnings = [],
}: PaymentProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { can } = useAuthorization();
  const canUpdatePaymentSettings = can("payment-settings-update");

  const { data, setData, put, errors, processing } = useForm({
    default_gateway: setting?.default_gateway ?? "cash",
    bank_transfer_enabled: setting?.bank_transfer_enabled ?? false,
    midtrans_enabled: setting?.midtrans_enabled ?? false,
    midtrans_server_key: "",
    midtrans_client_key: setting?.midtrans_client_key ?? "",
    midtrans_production: setting?.midtrans_production ?? false,
    xendit_enabled: setting?.xendit_enabled ?? false,
    xendit_secret_key: "",
    xendit_public_key: setting?.xendit_public_key ?? "",
    xendit_callback_token: "",
    xendit_production: setting?.xendit_production ?? false,
  });

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    put(settings.payments.update.url(), { preserveScroll: true });
  }

  function isGatewaySelectable(gateway: string) {
    if (gateway === "cash") return true;
    if (gateway === "midtrans") return data.midtrans_enabled;
    if (gateway === "xendit") return data.xendit_enabled;
    return false;
  }

  function renderSecretHint(field: string, keepMessage: string) {
    const source = paymentSettingSources?.[field];

    if (!source) return null;

    if (source.managed_by_environment) {
      return (
        <p className="text-xs text-warning">
          Secret dikelola oleh environment dan tidak bisa diubah dari dashboard.
        </p>
      );
    }

    if (source.configured) {
      return (
        <p className="text-xs text-muted-fg">
          Tersimpan: <span className="font-medium">{source.masked}</span>. {keepMessage}
        </p>
      );
    }

    return null;
  }

  return (
    <>
      <Head title="Pengaturan Payment" />

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
          <IconCreditCard size={28} className="text-primary-500" />
          Pengaturan Payment Gateway
        </h1>
        <p className="mt-1 text-sm text-muted-fg">Konfigurasi metode pembayaran dan gateway</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-bg p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
            <IconCash size={18} />
            Gateway Default
          </h3>
          <p className="mb-4 text-sm text-muted-fg">
            Gateway pembayaran default yang digunakan kasir saat membuka halaman transaksi.
          </p>
          {!canUpdatePaymentSettings && (
            <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              Anda hanya memiliki akses lihat. Perubahan payment settings memerlukan permission
              update dan konfirmasi password ulang.
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm font-medium text-fg">Pilih Gateway</label>
            <select
              value={data.default_gateway}
              onChange={(e) => setData("default_gateway", e.target.value)}
              disabled={!canUpdatePaymentSettings}
              className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg transition-all focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
            >
              {supportedGateways.map((gw) => (
                <option key={gw.value} value={gw.value} disabled={!isGatewaySelectable(gw.value)}>
                  {gw.label}
                  {!isGatewaySelectable(gw.value) && " (nonaktif)"}
                </option>
              ))}
            </select>
            {errors?.default_gateway && (
              <small className="mt-1 text-xs text-danger-500">{errors.default_gateway}</small>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <IconCreditCard size={18} />
              Transfer Bank
            </h3>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                data.bank_transfer_enabled ? "bg-success/15 text-success" : "bg-muted text-muted-fg"
              }`}
            >
              <input
                type="checkbox"
                checked={data.bank_transfer_enabled}
                onChange={(e) => setData("bank_transfer_enabled", e.target.checked)}
                disabled={!canUpdatePaymentSettings}
                className="rounded border-border text-primary-500"
              />
              {data.bank_transfer_enabled ? "Aktif" : "Nonaktif"}
            </label>
          </div>
          <p className="mb-4 text-sm text-muted-fg">
            Pembayaran manual via transfer bank. Kasir akan memasukkan transaksi dengan status
            pending, kemudian admin mengkonfirmasi setelah dana diterima.
          </p>
          <a
            href={settings.bankAccounts.index.url()}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-500 hover:text-primary-600"
          >
            Kelola Rekening Bank &rarr;
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <IconBrandStripe size={18} />
              Midtrans Snap
            </h3>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                data.midtrans_enabled ? "bg-success/15 text-success" : "bg-muted text-muted-fg"
              }`}
            >
              <input
                type="checkbox"
                checked={data.midtrans_enabled}
                onChange={(e) => setData("midtrans_enabled", e.target.checked)}
                disabled={!canUpdatePaymentSettings}
                className="rounded border-border text-primary-500"
              />
              {data.midtrans_enabled ? "Aktif" : "Nonaktif"}
            </label>
          </div>
          <div
            className={`space-y-4 ${
              !data.midtrans_enabled ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-fg">Server Key</label>
                <input
                  type="password"
                  value={data.midtrans_server_key}
                  onChange={(e) => setData("midtrans_server_key", e.target.value)}
                  placeholder={
                    paymentSettingSources?.midtrans_server_key?.configured
                      ? "Kosongkan untuk mempertahankan nilai saat ini"
                      : "SB-Mid-server-xxx"
                  }
                  disabled={
                    !canUpdatePaymentSettings ||
                    !!paymentSettingSources?.midtrans_server_key?.managed_by_environment
                  }
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors?.midtrans_server_key && (
                  <p className="mt-1 text-xs text-danger-500">{errors.midtrans_server_key}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-fg">Client Key</label>
                <input
                  type="text"
                  value={data.midtrans_client_key}
                  onChange={(e) => setData("midtrans_client_key", e.target.value)}
                  placeholder="SB-Mid-client-xxx"
                  disabled={!canUpdatePaymentSettings}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors?.midtrans_client_key && (
                  <p className="mt-1 text-xs text-danger-500">{errors.midtrans_client_key}</p>
                )}
              </div>
            </div>
            {renderSecretHint(
              "midtrans_server_key",
              "Isi ulang hanya jika ingin mengganti secret.",
            )}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={data.midtrans_production}
                onChange={(e) => setData("midtrans_production", e.target.checked)}
                disabled={!canUpdatePaymentSettings}
                className="rounded border-border text-primary-500"
              />
              <span className="text-sm text-muted-fg">Mode Produksi</span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <IconCreditCard size={18} />
              Xendit Invoice
            </h3>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                data.xendit_enabled ? "bg-success/15 text-success" : "bg-muted text-muted-fg"
              }`}
            >
              <input
                type="checkbox"
                checked={data.xendit_enabled}
                onChange={(e) => setData("xendit_enabled", e.target.checked)}
                disabled={!canUpdatePaymentSettings}
                className="rounded border-border text-primary-500"
              />
              {data.xendit_enabled ? "Aktif" : "Nonaktif"}
            </label>
          </div>
          <div
            className={`space-y-4 ${!data.xendit_enabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-fg">Secret Key</label>
                <input
                  type="password"
                  value={data.xendit_secret_key}
                  onChange={(e) => setData("xendit_secret_key", e.target.value)}
                  placeholder={
                    paymentSettingSources?.xendit_secret_key?.configured
                      ? "Kosongkan untuk mempertahankan nilai saat ini"
                      : "xnd_development_xxx"
                  }
                  disabled={
                    !canUpdatePaymentSettings ||
                    !!paymentSettingSources?.xendit_secret_key?.managed_by_environment
                  }
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors?.xendit_secret_key && (
                  <p className="mt-1 text-xs text-danger-500">{errors.xendit_secret_key}</p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-fg">Public Key</label>
                <input
                  type="text"
                  value={data.xendit_public_key}
                  onChange={(e) => setData("xendit_public_key", e.target.value)}
                  placeholder="xnd_public_development_xxx"
                  disabled={!canUpdatePaymentSettings}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                />
                {errors?.xendit_public_key && (
                  <p className="mt-1 text-xs text-danger-500">{errors.xendit_public_key}</p>
                )}
              </div>
            </div>
            {renderSecretHint("xendit_secret_key", "Isi ulang hanya jika ingin mengganti secret.")}
            <div>
              <label className="mb-2 block text-sm font-medium text-fg">Callback Token</label>
              <input
                type="password"
                value={data.xendit_callback_token}
                onChange={(e) => setData("xendit_callback_token", e.target.value)}
                placeholder={
                  paymentSettingSources?.xendit_callback_token?.configured
                    ? "Kosongkan untuk mempertahankan nilai saat ini"
                    : "xendit-callback-token"
                }
                disabled={
                  !canUpdatePaymentSettings ||
                  !!paymentSettingSources?.xendit_callback_token?.managed_by_environment
                }
                className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
              />
              {errors?.xendit_callback_token && (
                <p className="mt-1 text-xs text-danger-500">{errors.xendit_callback_token}</p>
              )}
            </div>
            {renderSecretHint(
              "xendit_callback_token",
              "Isi ulang hanya jika ingin mengganti token.",
            )}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={data.xendit_production}
                onChange={(e) => setData("xendit_production", e.target.checked)}
                disabled={!canUpdatePaymentSettings}
                className="rounded border-border text-primary-500"
              />
              <span className="text-sm text-muted-fg">Mode Produksi</span>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
            <IconCreditCard size={18} />
            Webhook URLs
          </h3>
          <p className="mb-4 text-sm text-muted-fg">
            Salin URL berikut dan paste ke dashboard Midtrans/Xendit sebagai Notification/Callback
            URL.
          </p>
          {webhookWarnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {webhookWarnings.map((warning) => (
                <div
                  key={warning}
                  className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
                >
                  {warning}
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-fg">
                Midtrans Notification URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrls.midtrans || ""}
                  className="h-10 flex-1 rounded-lg border border-input bg-bg px-3 text-sm text-muted-fg"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(webhookUrls.midtrans || "");
                    toast.success("URL disalin!");
                  }}
                  className="h-10 rounded-lg border border-input px-3 text-sm font-medium text-muted-fg hover:bg-muted"
                >
                  Salin
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-fg">
                Xendit Callback URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrls.xendit || ""}
                  className="h-10 flex-1 rounded-lg border border-input bg-bg px-3 text-sm text-muted-fg"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(webhookUrls.xendit || "");
                    toast.success("URL disalin!");
                  }}
                  className="h-10 rounded-lg border border-input px-3 text-sm font-medium text-muted-fg hover:bg-muted"
                >
                  Salin
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing || !canUpdatePaymentSettings}
            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
          >
            <IconDeviceFloppy size={18} />
            {processing ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </div>
      </form>
    </>
  );
}

Payment.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
