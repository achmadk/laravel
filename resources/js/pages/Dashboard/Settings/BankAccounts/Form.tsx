import { useEffect } from "react";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { IconArrowLeft, IconCheck, IconBuildingBank } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { useAuthorization } from "@/lib/auth";
import settings from "@/routes/settings";

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  logo: string | null;
  is_active: boolean;
}

interface BankAccountFormProps {
  bankAccount?: BankAccount | null;
}

export default function BankAccountForm({ bankAccount = null }: BankAccountFormProps) {
  const isEdit = !!bankAccount;
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { can } = useAuthorization();
  const canUpdatePaymentSettings = can("payment-settings-update");

  const { data, setData, post, processing, errors } = useForm({
    _method: (isEdit ? "PUT" : "POST") as string,
    bank_name: bankAccount?.bank_name || "",
    account_number: bankAccount?.account_number || "",
    account_name: bankAccount?.account_name || "",
    logo: null as File | null,
    is_active: bankAccount?.is_active ?? true,
  });

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit) {
      post(settings.bankAccounts.update.url(bankAccount!.id), {
        forceFormData: true,
      });
    } else {
      post(settings.bankAccounts.store.url(), {
        forceFormData: true,
      });
    }
  }

  return (
    <>
      <Head title={isEdit ? "Edit Rekening Bank" : "Tambah Rekening Bank"} />
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconBuildingBank size={28} className="text-primary-500" />
              {isEdit ? "Edit Rekening Bank" : "Tambah Rekening Bank"}
            </h1>
            <p className="mt-1 text-muted-fg text-sm">
              Masukkan detail rekening bank untuk pembayaran transfer.
            </p>
          </div>
          <Link
            href={settings.bankAccounts.index.url()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-muted-fg transition hover:bg-muted"
          >
            <IconArrowLeft size={18} />
            Kembali
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-bg p-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-fg text-sm">Nama Bank</label>
              <input
                placeholder="BCA, Mandiri, BNI..."
                value={data.bank_name}
                onChange={(e) => setData("bank_name", e.target.value)}
                disabled={!canUpdatePaymentSettings}
                className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
              />
              {errors.bank_name && (
                <p className="mt-1 text-danger-500 text-xs">{errors.bank_name}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block font-medium text-fg text-sm">Nomor Rekening</label>
              <input
                placeholder="1234567890"
                value={data.account_number}
                onChange={(e) => setData("account_number", e.target.value)}
                disabled={!canUpdatePaymentSettings}
                className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
              />
              {errors.account_number && (
                <p className="mt-1 text-danger-500 text-xs">{errors.account_number}</p>
              )}
            </div>
          </div>
          <div>
            <label className="mb-2 block font-medium text-fg text-sm">Atas Nama</label>
            <input
              placeholder="Nama pemilik rekening"
              value={data.account_name}
              onChange={(e) => setData("account_name", e.target.value)}
              disabled={!canUpdatePaymentSettings}
              className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
            />
            {errors.account_name && (
              <p className="mt-1 text-danger-500 text-xs">{errors.account_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-medium text-fg text-sm">Logo Bank (opsional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setData("logo", e.target.files?.[0] || null)}
                disabled={!canUpdatePaymentSettings}
                className="h-11 w-full rounded-xl border border-input bg-bg px-3 text-fg text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-medium file:text-primary-fg file:text-sm hover:file:bg-primary/90"
              />
              {errors.logo && <p className="mt-1 text-danger-500 text-xs">{errors.logo}</p>}
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-fg text-sm">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData("is_active", e.target.checked)}
                  disabled={!canUpdatePaymentSettings}
                  className="rounded border-border text-primary-600 focus:ring-primary-500"
                />
                Aktif
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={processing || !canUpdatePaymentSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 font-semibold text-sm text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
            >
              <IconCheck size={18} />
              {isEdit ? "Update" : "Simpan"}
            </button>
            <Link
              href={settings.bankAccounts.index.url()}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-muted-fg text-sm transition-colors hover:bg-muted"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

BankAccountForm.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
