import { useMemo, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCashBanknote,
  IconReceipt,
  IconRotateClockwise2,
  IconWallet,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import cashierShifts from "@/routes/cashier-shifts";
import { Card, CardContent } from "@/components/ui/card";

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

interface ShiftUser {
  id: number;
  name: string;
}

interface CashierShift {
  id: number;
  user: ShiftUser | null;
  opened_by: ShiftUser | null;
  closed_by: ShiftUser | null;
  status: string;
  opening_cash: number;
  expected_cash: number;
  actual_cash: number | null;
  cash_difference: number | null;
  cash_sales_total: number;
  cash_refund_total: number;
  non_cash_sales_total: number;
  non_cash_refund_total: number;
  transactions_count: number;
  sales_returns_count: number;
  notes: string | null;
  close_notes: string | null;
  opened_at: string;
  closed_at: string | null;
}

interface ShowProps {
  cashierShift: CashierShift;
  canForceClose?: boolean;
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-fg">
          <Icon size={18} />
          <span>{title}</span>
        </div>
        <p className="mt-3 text-xl font-semibold text-fg">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function Show({ cashierShift, canForceClose = false }: ShowProps) {
  const { auth, errors } = usePage<{
    auth: { user: { id: number }; super?: boolean };
    errors: Record<string, string>;
  }>().props;
  const { can } = useAuthorization();
  const [actualCash, setActualCash] = useState(
    cashierShift.actual_cash !== null ? String(cashierShift.actual_cash) : "",
  );
  const [closeNotes, setCloseNotes] = useState(cashierShift.close_notes || "");

  const canCloseShift = useMemo(() => {
    if (cashierShift.status !== "open") return false;
    return (
      can("cashier-shifts-close") &&
      (cashierShift.user?.id === auth?.user?.id || auth?.super || canForceClose)
    );
  }, [auth?.super, auth?.user?.id, can, canForceClose, cashierShift.status, cashierShift.user?.id]);

  const actualCashNumber = Number(actualCash || 0);
  const difference =
    actualCash === "" ? null : actualCashNumber - Number(cashierShift.expected_cash || 0);

  function handleCloseShift(e: React.FormEvent) {
    e.preventDefault();
    router.post(cashierShifts.close.url({ cashierShift: cashierShift.id }), {
      actual_cash: actualCashNumber,
      close_notes: closeNotes,
    });
  }

  const statusStyle =
    cashierShift.status === "open"
      ? "bg-success/10 text-success"
      : cashierShift.status === "force_closed"
        ? "bg-danger/10 text-danger"
        : "bg-muted text-muted-fg";

  const statusLabel =
    cashierShift.status === "open"
      ? "Shift Aktif"
      : cashierShift.status === "force_closed"
        ? "Force Closed"
        : "Shift Closed";

  return (
    <>
      <Head title={`Shift #${cashierShift.id}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href={cashierShifts.index.url()}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted-fg transition hover:text-primary"
            >
              <IconArrowLeft size={16} />
              <span>Kembali ke histori shift</span>
            </Link>
            <h1 className="text-2xl font-bold text-fg">
              Shift Kasir {cashierShift.user?.name || "-"}
            </h1>
            <p className="text-sm text-muted-fg">Dibuka {formatDateTime(cashierShift.opened_at)}</p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Modal Awal"
            value={formatCurrency(cashierShift.opening_cash)}
            icon={IconWallet}
          />
          <MetricCard
            title="Expected Cash"
            value={formatCurrency(cashierShift.expected_cash)}
            icon={IconCashBanknote}
          />
          <MetricCard
            title="Penjualan Tunai"
            value={formatCurrency(cashierShift.cash_sales_total)}
            icon={IconReceipt}
          />
          <MetricCard
            title="Refund Tunai"
            value={formatCurrency(cashierShift.cash_refund_total)}
            icon={IconRotateClockwise2}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-lg font-semibold text-fg">Ringkasan Shift</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Kasir
                  </p>
                  <p className="mt-2 text-sm text-fg">{cashierShift.user?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Dibuka Oleh
                  </p>
                  <p className="mt-2 text-sm text-fg">{cashierShift.opened_by?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Waktu Tutup
                  </p>
                  <p className="mt-2 text-sm text-fg">{formatDateTime(cashierShift.closed_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Ditutup Oleh
                  </p>
                  <p className="mt-2 text-sm text-fg">{cashierShift.closed_by?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Total Transaksi
                  </p>
                  <p className="mt-2 text-sm text-fg">{cashierShift.transactions_count}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Total Retur
                  </p>
                  <p className="mt-2 text-sm text-fg">{cashierShift.sales_returns_count}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Penjualan Non Tunai
                  </p>
                  <p className="mt-2 text-sm text-fg">
                    {formatCurrency(cashierShift.non_cash_sales_total)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Refund Non Tunai
                  </p>
                  <p className="mt-2 text-sm text-fg">
                    {formatCurrency(cashierShift.non_cash_refund_total)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Catatan Shift
                  </p>
                  <p className="mt-2 text-sm text-fg">
                    {cashierShift.notes || "Tidak ada catatan pembukaan."}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                    Catatan Closing
                  </p>
                  <p className="mt-2 text-sm text-fg">
                    {cashierShift.close_notes || "Tidak ada catatan penutupan."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold text-fg">Cash Closing</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <span className="text-sm text-muted-fg">Expected Cash</span>
                    <span className="font-semibold text-fg">
                      {formatCurrency(cashierShift.expected_cash)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <span className="text-sm text-muted-fg">Actual Cash</span>
                    <span className="font-semibold text-fg">
                      {cashierShift.actual_cash === null
                        ? "-"
                        : formatCurrency(cashierShift.actual_cash)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-3">
                    <span className="text-sm text-muted-fg">Selisih</span>
                    <span className="font-semibold text-fg">
                      {cashierShift.cash_difference === null
                        ? "-"
                        : formatCurrency(cashierShift.cash_difference)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {canCloseShift && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="text-lg font-semibold text-fg">Tutup Shift</h2>
                  <p className="mt-1 text-sm text-muted-fg">
                    Input kas fisik akhir untuk finalisasi cash closing.
                  </p>
                  <form onSubmit={handleCloseShift} className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-fg">
                        Kas Fisik Aktual
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={actualCash}
                        onChange={(e) => setActualCash(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
                      />
                      {(errors as Record<string, string>)?.actual_cash && (
                        <p className="mt-2 text-xs text-danger">
                          {(errors as Record<string, string>).actual_cash}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-fg">
                        Catatan Closing
                      </label>
                      <textarea
                        rows={4}
                        value={closeNotes}
                        onChange={(e) => setCloseNotes(e.target.value)}
                        className="w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                        placeholder="Opsional"
                      />
                    </div>
                    {difference !== null && (
                      <div
                        className={`rounded-xl px-4 py-3 text-sm ${
                          difference === 0
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        Selisih closing: {formatCurrency(difference)}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                    >
                      <IconCashBanknote size={18} />
                      <span>Finalisasi Closing</span>
                    </button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
