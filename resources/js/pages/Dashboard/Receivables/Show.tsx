import { useEffect, useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCreditCard,
  IconBrandWhatsapp,
  IconCash,
  IconPrinter,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { toast } from "sonner";
import { useAuthorization } from "@/lib/auth";
import receivables from "@/routes/receivables";
import pdf from "@/routes/pdf";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={receivables.index.url()}
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-muted-fg transition-colors hover:bg-muted/80"
            >
              <IconArrowLeft size={18} />
              Kembali
            </Link>
            <div>
              <p className="text-muted-fg text-xs">Invoice</p>
              <h1 className="font-bold text-2xl text-fg">{receivable.invoice}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canCreateCrmCampaign && (
              <Link
                href={receivables.shareCampaign.url({ receivable: receivable.id })}
                method="post"
                as="button"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 font-semibold text-sm text-white transition-colors hover:bg-primary/90"
              >
                <IconBrandWhatsapp size={18} />
                Campaign WA
              </Link>
            )}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-success px-3 py-2 font-semibold text-sm text-white transition-colors hover:bg-success/90"
            >
              <IconBrandWhatsapp size={18} />
              Share WhatsApp
            </a>
            <ReceivableStatusBadge value={receivable.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card
            className="space-y-4 p-4 [--gutter:0] lg:col-span-2 print:border-0 print:shadow-none"
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-fg">Pelanggan</p>
                <p className="font-semibold text-fg">{receivable.customer?.name || "Umum"}</p>
                {receivable.customer?.phone && (
                  <p className="text-muted-fg text-xs">{receivable.customer.phone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-muted-fg">Jatuh Tempo</p>
                <p className="font-semibold text-fg">{formatDate(receivable.due_date)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-muted p-3">
                <p className="text-muted-fg text-xs">Total</p>
                <p className="font-bold text-fg text-lg">{formatCurrency(receivable.total)}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted p-3">
                <p className="text-muted-fg text-xs">Terbayar</p>
                <p className="font-bold text-lg text-success">{formatCurrency(receivable.paid)}</p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                <p className="text-warning text-xs">Sisa</p>
                <p className="font-bold text-lg text-warning">
                  {formatCurrency(receivable.remaining)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-fg text-sm">Riwayat Pembayaran</p>
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
                    className="flex items-center justify-between rounded-xl border border-border bg-muted p-3"
                  >
                    <div>
                      <p className="font-semibold text-fg text-sm">{formatCurrency(pay.amount)}</p>
                      <p className="text-muted-fg text-xs">
                        {pay.paid_at || "-"} &bull; {pay.method || "metode"}
                        {pay.bank_account && ` • ${pay.bank_account.bank_name}`}
                      </p>
                      {pay.note && <p className="mt-1 text-muted-fg text-xs">{pay.note}</p>}
                    </div>
                    <span className="text-muted-fg text-xs">{pay.user?.name || "-"}</span>
                  </div>
                ))
              ) : (
                <div className="text-muted-fg text-sm">Belum ada pembayaran.</div>
              )}
            </div>
          </Card>

          <Card className="space-y-4 p-4 [--gutter:0] print:hidden">
            <div>
              <p className="mb-3 font-semibold text-fg text-sm">Detail Nota</p>
              <div className="space-y-2 text-muted-fg text-sm">
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
              <label htmlFor="collection-notes" className="font-semibold text-fg text-sm">Catatan Penagihan</label>
              <textarea
                id="collection-notes"
                rows={3}
                value={collectionNotesForm.data.collection_notes}
                onChange={(e) => collectionNotesForm.setData("collection_notes", e.target.value)}
                className="w-full rounded-xl border border-input bg-muted px-3 py-2 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                placeholder="Catatan proses penagihan..."
              />
              {collectionNotesForm.errors.collection_notes && (
                <p className="text-danger text-xs">{collectionNotesForm.errors.collection_notes}</p>
              )}
              {collectionNotesForm.wasSuccessful && (
                <p className="text-success text-xs">Tersimpan!</p>
              )}
              <Button
                type="submit"
                isDisabled={collectionNotesForm.processing}
                intent="secondary"
                className="h-10 w-full"
              >
                {collectionNotesForm.processing ? "Menyimpan..." : "Simpan Catatan"}
              </Button>
            </form>

            {showForm && canPayReceivable && (
              <form onSubmit={submitPayment} className="space-y-3">
                <div>
                  <label htmlFor="payment-amount" className="font-medium text-fg text-sm">Nominal</label>
                  <input
                    id="payment-amount"
                    type="number"
                    min="1"
                    value={data.amount}
                    onChange={(e) => setData("amount", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
                    required
                  />
                  {errors.amount && <p className="mt-1 text-danger text-xs">{errors.amount}</p>}
                </div>
                <div>
                  <label htmlFor="payment-date" className="font-medium text-fg text-sm">Tanggal Bayar</label>
                  <input
                    id="payment-date"
                    type="date"
                    value={data.paid_at}
                    onChange={(e) => setData("paid_at", e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm focus:border-ring focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                <ToggleGroup
                  selectionMode="single"
                  size="lg"
                  selectedKeys={new Set([data.method])}
                  onSelectionChange={(keys) => setData("method", String(Array.from(keys)[0]))}
                  className="grid w-full grid-cols-2"
                >
                  <ToggleGroupItem id="cash">
                    <IconCash />
                    Tunai
                  </ToggleGroupItem>
                  <ToggleGroupItem id="bank_transfer">
                    <IconCreditCard />
                    Transfer
                  </ToggleGroupItem>
                </ToggleGroup>
                {data.method === "bank_transfer" && (
                  <div>
                    <label htmlFor="payment-account" className="font-medium text-fg text-sm">Rekening</label>
                    <select
                      id="payment-account"
                      value={data.bank_account_id}
                      onChange={(e) => setData("bank_account_id", e.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
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
                  <label htmlFor="payment-note" className="font-medium text-fg text-sm">Catatan (opsional)</label>
                  <textarea
                    id="payment-note"
                    rows={2}
                    value={data.note}
                    onChange={(e) => setData("note", e.target.value)}
                    className="w-full rounded-xl border border-input bg-muted px-3 py-2 text-fg text-sm placeholder:text-muted-fg"
                    placeholder="Catatan pembayaran"
                  />
                </div>
                <Button
                  type="submit"
                  isDisabled={processing}
                  intent="primary"
                  className="h-11 w-full"
                >
                  Simpan Pembayaran
                </Button>
              </form>
            )}

            <Button intent="secondary" className="h-11 w-full" onPress={() => setShowPreview(true)}>
              <IconPrinter size={18} />
              Preview / PDF
            </Button>
          </Card>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fg/60 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-bg shadow-2xl">
            <div className="flex items-center justify-between border-border border-b px-4 py-3">
              <div>
                <p className="text-muted-fg text-xs">Preview Nota Barang</p>
                <p className="font-semibold text-fg text-sm">{receivable.invoice}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdf.receivables.show.url({ receivable: receivable.id })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 font-semibold text-sm text-white hover:bg-primary/90"
                >
                  <IconPrinter size={16} />
                  PDF / Cetak
                </a>
                <Button intent="plain" onPress={() => setShowPreview(false)}>
                  Tutup
                </Button>
              </div>
            </div>
            <div className="bg-muted p-6">
              <div className="print-area rounded-2xl border border-border bg-bg p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-border">
                      {storeProfile?.logo ? (
                        <img
                          src={storeProfile.logo}
                          alt={storeProfile.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="font-bold text-primary">
                          {storeProfile?.name?.[0] || "T"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-fg text-lg">{storeProfile?.name}</p>
                      {storeProfile?.address && (
                        <p className="text-muted-fg text-xs">{storeProfile.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-fg text-xs">Invoice</p>
                    <p className="font-bold text-fg text-lg">{receivable.invoice}</p>
                    <p className="text-muted-fg text-xs">
                      Jatuh tempo: {formatDate(receivable.due_date)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-fg">Pelanggan</p>
                    <p className="font-semibold text-fg">{receivable.customer?.name || "Umum"}</p>
                    {receivable.customer?.phone && (
                      <p className="text-muted-fg text-xs">{receivable.customer.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-muted-fg">Status</p>
                    <ReceivableStatusBadge value={receivable.status} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border bg-muted p-3">
                    <p className="text-muted-fg text-xs">Total</p>
                    <p className="font-bold text-fg text-lg">{formatCurrency(receivable.total)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-3">
                    <p className="text-muted-fg text-xs">Terbayar</p>
                    <p className="font-bold text-lg text-success">
                      {formatCurrency(receivable.paid)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                    <p className="text-warning text-xs">Sisa</p>
                    <p className="font-bold text-lg text-warning">
                      {formatCurrency(receivable.remaining)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 font-semibold text-fg text-sm">Riwayat Pembayaran</p>
                  <div className="space-y-2 text-sm">
                    {receivable.payments?.length ? (
                      receivable.payments.map((pay) => (
                        <div
                          key={pay.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted p-3"
                        >
                          <div>
                            <p className="font-semibold text-fg">{formatCurrency(pay.amount)}</p>
                            <p className="text-muted-fg text-xs">
                              {formatDate(pay.paid_at)} &bull; {pay.method || "metode"}
                              {pay.bank_account && ` • ${pay.bank_account.bank_name}`}
                            </p>
                          </div>
                          <span className="text-muted-fg text-xs">{pay.user?.name || "-"}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-fg text-xs">Belum ada pembayaran.</div>
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
