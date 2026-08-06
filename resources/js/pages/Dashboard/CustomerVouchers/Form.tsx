import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { IconArrowLeft, IconCreditCard, IconDeviceFloppy } from "@tabler/icons-react";
import customerVouchers from "@/routes/customer-vouchers";

interface Customer {
  id: number;
  name: string;
  no_telp: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
}

interface Voucher {
  id: number;
  customer_id: number | null;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  notes: string;
}

interface FormProps {
  mode?: "create" | "edit";
  voucher?: Voucher | null;
  customers?: Customer[];
}

function InputError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-rose-500 text-xs">{message}</p>;
}

export default function CustomerVoucherForm({
  mode = "create",
  voucher = null,
  customers = [],
}: FormProps) {
  const isEdit = mode === "edit";
  const { errors } = usePage().props as any;
  const { data, setData, post, put, processing } = useForm({
    customer_id: voucher?.customer_id ? String(voucher.customer_id) : "",
    code: voucher?.code ?? "",
    name: voucher?.name ?? "",
    discount_type: voucher?.discount_type ?? "fixed_amount",
    discount_value: voucher?.discount_value ? String(voucher.discount_value) : "",
    minimum_order: voucher?.minimum_order ? String(voucher.minimum_order) : "0",
    is_active: voucher?.is_active ?? true,
    starts_at: voucher?.starts_at ? new Date(voucher.starts_at).toISOString().slice(0, 16) : "",
    expires_at: voucher?.expires_at ? new Date(voucher.expires_at).toISOString().slice(0, 16) : "",
    notes: voucher?.notes ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isEdit && voucher) {
      put(customerVouchers.update.url({ customer_voucher: voucher.id }));
    } else {
      post(customerVouchers.store.url());
    }
  }

  return (
    <>
      <Head title={isEdit ? "Edit Voucher Customer" : "Buat Voucher Customer"} />
      <div className="space-y-6">
        <div>
          <Link
            href={customerVouchers.index.url()}
            className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary"
          >
            <IconArrowLeft size={16} />
            Kembali ke voucher customer
          </Link>
          <h1 className="font-bold text-2xl text-fg">
            {isEdit ? "Edit Voucher Customer" : "Buat Voucher Customer"}
          </h1>
          <p className="text-smtext-muted-fg">
            Distribusikan voucher promosi untuk pelanggan tertentu.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-2xl border border-border bg-bg p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
                <IconCreditCard size={22} />
              </div>
              <div>
                <h2 className="font-semibold text-fg text-lg">Informasi Voucher</h2>
                <p className="text-smtext-muted-fg">
                  Tentukan pelanggan, kode, dan identitas voucher personal.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-fg text-sm">Pelanggan</label>
                <select
                  value={data.customer_id}
                  onChange={(e) => setData("customer_id", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                >
                  <option value="">Pilih pelanggan</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} | {c.no_telp || "-"} |{" "}
                      {c.is_loyalty_member
                        ? `${c.loyalty_tier} / ${c.loyalty_points} poin`
                        : "non-member"}
                    </option>
                  ))}
                </select>
                <InputError message={(errors as any).customer_id} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Kode Voucher</label>
                <input
                  type="text"
                  value={data.code}
                  onChange={(e) => setData("code", e.target.value.toUpperCase())}
                  placeholder="Kosongkan untuk generate otomatis"
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).code} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Nama Voucher</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  placeholder="Contoh: Voucher Member Mei"
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).name} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 font-semibold text-fg text-lg">Benefit & Periode</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Tipe Diskon</label>
                <select
                  value={data.discount_type}
                  onChange={(e) => setData("discount_type", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                >
                  <option value="fixed_amount">Potongan Nominal</option>
                  <option value="percentage">Persentase (%)</option>
                </select>
                <InputError message={(errors as any).discount_type} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Nilai Diskon</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.discount_value}
                  onChange={(e) => setData("discount_value", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).discount_value} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Minimum Belanja</label>
                <input
                  type="number"
                  min="0"
                  value={data.minimum_order}
                  onChange={(e) => setData("minimum_order", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).minimum_order} />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-3">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => setData("is_active", e.target.checked)}
                  />
                  <span className="font-medium text-fg text-sm">Voucher aktif</span>
                </label>
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Mulai Berlaku</label>
                <input
                  type="datetime-local"
                  value={data.starts_at}
                  onChange={(e) => setData("starts_at", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).starts_at} />
              </div>
              <div>
                <label className="mb-2 block font-medium text-fg text-sm">Berakhir Pada</label>
                <input
                  type="datetime-local"
                  value={data.expires_at}
                  onChange={(e) => setData("expires_at", e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm"
                />
                <InputError message={(errors as any).expires_at} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-fg text-sm">Catatan</label>
                <textarea
                  rows={4}
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                  className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-sm"
                />
                <InputError message={(errors as any).notes} />
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={customerVouchers.index.url()}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-bg px-5 py-2.5 font-medium text-fg text-sm hover:bg-muted"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-fg hover:bg-primary/90 disabled:opacity-50"
            >
              <IconDeviceFloppy size={18} />
              {processing ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
