import { useEffect, useState, useRef } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCreditCard,
  IconBrandWhatsapp,
  IconCash,
  IconPrinter,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import { useAuthorization } from "@/lib/auth";
import receivables from "@/routes/receivables";
import pdf from "@/routes/pdf";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_number: string;
}

interface Payment {
  id: number;
  amount: number;
  paid_at: string;
  method: string;
  note: string | null;
  bank_account: { bank_name: string } | null;
  user: { name: string } | null;
}

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

interface Receivable {
  id: number;
  invoice: string;
  transaction_id: number | null;
  total: number;
  paid: number;
  remaining: number;
  due_date: string;
  status: string;
  collection_notes: string | null;
  customer: Customer | null;
  payments: Payment[];
}

interface ShowProps {
  receivable: Receivable;
  bankAccounts?: BankAccount[];
}

function ReceivableStatusBadge({ value }: { value: string }) {
  const variantMap: Record<string, "success" | "info" | "danger" | "warning"> = {
    paid: "success",
    partial: "info",
    overdue: "danger",
  };
  const labels: Record<string, string> = {
    paid: "Lunas",
    partial: "Parsial",
    overdue: "Jatuh Tempo",
  };
  return (
    <StatusBadge variant={variantMap[value] || "warning"} label={labels[value] || "Belum Lunas"} />
  );
}

export default function ReceivableShow({ receivable, bankAccounts = [] }: ShowProps) {
  const { flash, storeProfile } = usePage<{
    flash: { success?: string; error?: string };
    storeProfile?: { logo?: string; name?: string; address?: string };
  }>().props;
  const { can } = useAuthorization();
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { data, setData, post, processing, reset, errors } = useForm({
    amount: "",
    paid_at: new Date().toISOString().slice(0, 10),
    method: "cash" as string,
    bank_account_id: "",
    note: "",
  });
  const collectionNotesForm = useForm({
    collection_notes: receivable.collection_notes || "",
  });
  const canPayReceivable = can("receivables-pay");
  const canCreateCrmCampaign = can("crm-campaigns-create");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  const shareText = `Invoice ${receivable.invoice} - Total ${formatCurrency(receivable.total)} - Sisa ${formatCurrency(receivable.remaining)}`;

  function formatDate(value: string | null | undefined) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    post(receivables.pay.url({ receivable: receivable.id }), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setShowForm(false);
      },
    });
  }

  function submitCollectionNotes(e: React.FormEvent) {
    e.preventDefault();
    collectionNotesForm.patch(receivables.collectionNotes.url({ receivable: receivable.id }), {
      preserveScroll: true,
      onSuccess: () => toast.success("Catatan penagihan berhasil disimpan"),
      onError: () => toast.error("Gagal menyimpan catatan penagihan"),
    });
  }

  // function handlePrint() {
  //   window.print();
  // }

  return (
    <>
      <Head title={`Nota ${receivable.invoice}`} />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href={receivables.index.url()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-muted text-muted-fg hover:bg-muted/80 transition-colors"
            >
              <IconArrowLeft size={18} />
              Kembali
            </Link>
            <div>
              <p className="text-xs text-muted-fg">Invoice</p>
              <h1 className="text-2xl font-bold text-fg">{receivable.invoice}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canCreateCrmCampaign && (
              <Link
                href={receivables.shareCampaign.url({ receivable: receivable.id })}
                method="post"
                as="button"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                <IconBrandWhatsapp size={18} />
                Campaign WA
              </Link>
            )}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-success px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-success/90"
            >
              <IconBrandWhatsapp size={18} />
              Share WhatsApp
            </a>
            <ReceivableStatusBadge value={receivable.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            ref={printRef}
            className="lg:col-span-2 bg-bg border border-border rounded-2xl p-4 space-y-4 print:border-0 print:shadow-none"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-fg">Pelanggan</p>
                <p className="font-semibold text-fg">{receivable.customer?.name || "Umum"}</p>
                {receivable.customer?.phone && (
                  <p className="text-xs text-muted-fg">{receivable.customer.phone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-muted-fg">Jatuh Tempo</p>
                <p className="font-semibold text-fg">{formatDate(receivable.due_date)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs text-muted-fg">Total</p>
                <p className="text-lg font-bold text-fg">{formatCurrency(receivable.total)}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted border border-border">
                <p className="text-xs text-muted-fg">Terbayar</p>
                <p className="text-lg font-bold text-success">{formatCurrency(receivable.paid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
                <p className="text-xs text-warning">Sisa</p>
                <p className="text-lg font-bold text-warning">
                  {formatCurrency(receivable.remaining)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-fg">Riwayat Pembayaran</p>
              {receivable.status !== "paid" && canPayReceivable && (
                <Button intent="primary" onPress={() => setShowForm(!showForm)}>
                  Tambah Pembayaran
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {receivable.payments?.length ? (
                receivable.payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted"
                  >
                    <div>
                      <p className="text-sm font-semibold text-fg">{formatCurrency(pay.amount)}</p>
                      <p className="text-xs text-muted-fg">
                        {pay.paid_at || "-"} &bull; {pay.method || "metode"}
                        {pay.bank_account && ` • ${pay.bank_account.bank_name}`}
                      </p>
                      {pay.note && <p className="text-xs text-muted-fg mt-1">{pay.note}</p>}
                    </div>
                    <span className="text-xs text-muted-fg">{pay.user?.name || "-"}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-fg">Belum ada pembayaran.</div>
              )}
            </div>
          </div>

          <div className="bg-bg border border-border rounded-2xl p-4 print:hidden space-y-4">
            <div>
              <p className="mb-3 text-sm font-semibold text-fg">Detail Nota</p>
              <div className="space-y-2 text-sm text-muted-fg">
                <div className="flex justify-between">
                  <span>Invoice</span>
                  <span className="font-semibold text-fg">{receivable.invoice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jatuh Tempo</span>
                  <span>{formatDate(receivable.due_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <ReceivableStatusBadge value={receivable.status} />
                </div>
                {receivable.transaction_id && (
                  <div className="flex justify-between">
                    <span>ID Transaksi</span>
                    <Link href="#" className="font-semibold text-primary">
                      Lihat
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={submitCollectionNotes} className="space-y-3">
              <label className="text-sm font-semibold text-fg">Catatan Penagihan</label>
              <textarea
                rows={3}
                value={collectionNotesForm.data.collection_notes}
                onChange={(e) => collectionNotesForm.setData("collection_notes", e.target.value)}
                className="w-full rounded-xl border border-input bg-muted px-3 py-2 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                placeholder="Catatan proses penagihan..."
              />
              {collectionNotesForm.errors.collection_notes && (
                <p className="text-xs text-danger">{collectionNotesForm.errors.collection_notes}</p>
              )}
              {collectionNotesForm.wasSuccessful && (
                <p className="text-xs text-success">Tersimpan!</p>
              )}
              <Button
                type="submit"
                isDisabled={collectionNotesForm.processing}
                intent="secondary"
                className="w-full h-10"
              >
                {collectionNotesForm.processing ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </form>

            {showForm && canPayReceivable && (
              <form onSubmit={submitPayment} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-fg">Nominal</label>
                  <input
                    type="number"
                    min="1"
                    value={data.amount}
                    onChange={(e) => setData("amount", e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-muted text-sm text-fg focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-fg"
                    required
                  />
                  {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-fg">Tanggal Bayar</label>
                  <input
                    type="date"
                    value={data.paid_at}
                    onChange={(e) => setData("paid_at", e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-input bg-muted text-sm text-fg focus:ring-2 focus:ring-ring focus:border-ring"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setData("method", "cash")}
                    className={`h-11 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold ${
                      data.method === "cash"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-fg"
                    }`}
                  >
                    <IconCash size={16} />
                    Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => setData("method", "bank_transfer")}
                    className={`h-11 rounded-xl border-2 flex items-center justify-center gap-2 text-sm font-semibold ${
                      data.method === "bank_transfer"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-fg"
                    }`}
                  >
                    <IconCreditCard size={16} />
                    Transfer
                  </button>
                </div>
                {data.method === "bank_transfer" && (
                  <div>
                    <label className="text-sm font-medium text-fg">Rekening</label>
                    <select
                      value={data.bank_account_id}
                      onChange={(e) => setData("bank_account_id", e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-input bg-muted text-sm text-fg"
                    >
                      <option value="">Pilih rekening</option>
                      {bankAccounts.map((bank) => (
                        <option key={bank.id} value={bank.id}>
                          {bank.bank_name} - {bank.account_number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-fg">Catatan (opsional)</label>
                  <textarea
                    rows={2}
                    value={data.note}
                    onChange={(e) => setData("note", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-muted text-sm text-fg placeholder:text-muted-fg"
                    placeholder="Catatan pembayaran"
                  />
                </div>
                <Button
                  type="submit"
                  isDisabled={processing}
                  intent="primary"
                  className="w-full h-11"
                >
                  Simpan Pembayaran
                </Button>
              </form>
            )}

            <Button intent="secondary" className="w-full h-11" onPress={() => setShowPreview(true)}>
              <IconPrinter size={18} />
              Preview / PDF
            </Button>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fg/60 p-4">
          <div className="bg-bg rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-xs text-muted-fg">Preview Nota Barang</p>
                <p className="text-sm font-semibold text-fg">{receivable.invoice}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdf.receivables.show.url({ receivable: receivable.id })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  <IconPrinter size={16} />
                  PDF / Cetak
                </a>
                <Button intent="plain" onPress={() => setShowPreview(false)}>
                  Tutup
                </Button>
              </div>
            </div>
            <div className="p-6 bg-muted">
              <div className="bg-bg rounded-2xl border border-border p-6 print-area">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 border border-border rounded-md flex items-center justify-center overflow-hidden">
                      {storeProfile?.logo ? (
                        <img
                          src={storeProfile.logo}
                          alt={storeProfile.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="font-bold text-primary">
                          {storeProfile?.name?.[0] || "T"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-fg">{storeProfile?.name}</p>
                      {storeProfile?.address && (
                        <p className="text-xs text-muted-fg">{storeProfile.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-fg">Invoice</p>
                    <p className="text-lg font-bold text-fg">{receivable.invoice}</p>
                    <p className="text-xs text-muted-fg">
                      Jatuh tempo: {formatDate(receivable.due_date)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <p className="text-muted-fg">Pelanggan</p>
                    <p className="font-semibold text-fg">{receivable.customer?.name || "Umum"}</p>
                    {receivable.customer?.phone && (
                      <p className="text-xs text-muted-fg">{receivable.customer.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-muted-fg">Status</p>
                    <ReceivableStatusBadge value={receivable.status} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-muted border border-border">
                    <p className="text-xs text-muted-fg">Total</p>
                    <p className="text-lg font-bold text-fg">{formatCurrency(receivable.total)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted border border-border">
                    <p className="text-xs text-muted-fg">Terbayar</p>
                    <p className="text-lg font-bold text-success">
                      {formatCurrency(receivable.paid)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
                    <p className="text-xs text-warning">Sisa</p>
                    <p className="text-lg font-bold text-warning">
                      {formatCurrency(receivable.remaining)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-fg">Riwayat Pembayaran</p>
                  <div className="space-y-2 text-sm">
                    {receivable.payments?.length ? (
                      receivable.payments.map((pay) => (
                        <div
                          key={pay.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border"
                        >
                          <div>
                            <p className="font-semibold text-fg">{formatCurrency(pay.amount)}</p>
                            <p className="text-xs text-muted-fg">
                              {formatDate(pay.paid_at)} &bull; {pay.method || "metode"}
                              {pay.bank_account && ` • ${pay.bank_account.bank_name}`}
                            </p>
                          </div>
                          <span className="text-xs text-muted-fg">{pay.user?.name || "-"}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-fg">Belum ada pembayaran.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}

ReceivableShow.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
