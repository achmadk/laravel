import { useMemo, useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { IconCashBanknote, IconClockHour4, IconEye, IconHistory } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { useAuthorization } from "@/lib/auth";
import cashierShifts from "@/routes/cashier-shifts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { Pagination } from "@/components/dashboard/pagination";
import { StatusBadge } from "@/components/dashboard/status-badge";

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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface Cashier {
  id: number;
  name: string;
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

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface ShiftsResponse {
  data: CashierShift[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface IndexProps {
  shifts: ShiftsResponse;
  filters: {
    cashier_id?: string;
    status?: string;
    opened_from?: string;
    opened_to?: string;
  };
  cashiers?: Cashier[];
  activeShift: CashierShift | null;
}

function ShiftStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "neutral" | "danger"> = {
    open: "success",
    closed: "neutral",
    force_closed: "danger",
  };
  const labels: Record<string, string> = {
    open: "Open",
    closed: "Closed",
    force_closed: "Force Closed",
  };
  return <StatusBadge variant={variantMap[status] || "neutral"} label={labels[status] || status} />;
}

export default function Index({ shifts, filters, cashiers = [], activeShift }: IndexProps) {
  const { can } = useAuthorization();
  const canOpenShift = can("cashier-shifts-open");

  const [openingCash, setOpeningCash] = useState("");
  const [notes, setNotes] = useState("");

  const currentFilters = useMemo(
    () => ({
      cashier_id: filters?.cashier_id || "",
      status: filters?.status || "",
      opened_from: filters?.opened_from || "",
      opened_to: filters?.opened_to || "",
    }),
    [filters],
  );

  function handleFilterChange(key: string, value: string) {
    router.get(
      cashierShifts.index.url(),
      { ...currentFilters, [key]: value },
      {
        preserveState: true,
        replace: true,
      },
    );
  }

  function handleOpenShift(e: React.FormEvent) {
    e.preventDefault();
    router.post(cashierShifts.store.url(), {
      opening_cash: Number(openingCash || 0),
      notes,
    });
  }

  return (
    <>
      <Head title="Shift Kasir" />
      <div className="space-y-6">
        <PageHeader
          title="Shift Kasir"
          description="Buka shift, pantau shift aktif, dan review cash closing."
          icon={<IconHistory size={20} />}
          actions={
            activeShift && (
              <Link href={cashierShifts.show.url({ cashierShift: activeShift.id })}>
                <Button intent="primary">
                  <IconEye size={18} />
                  Lihat Shift Aktif
                </Button>
              </Link>
            )
          }
        />

        {!activeShift && canOpenShift && (
          <Card>
            <CardContent className="p-5">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-fg">Buka Shift Baru</h2>
                <p className="text-sm text-muted-fg">
                  Shift aktif diperlukan sebelum kasir dapat memproses transaksi.
                </p>
              </div>

              <form onSubmit={handleOpenShift} className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-fg">Modal Awal</label>
                  <input
                    type="number"
                    min="0"
                    value={openingCash}
                    onChange={(e) => setOpeningCash(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-fg">Catatan</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                    placeholder="Opsional"
                  />
                </div>
                <div className="md:col-span-3">
                  <Button type="submit" intent="primary">
                    <IconCashBanknote size={18} />
                    Buka Shift
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {activeShift && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-success">
                Shift Aktif
              </p>
              <p className="mt-2 text-lg font-semibold text-fg">{activeShift.user?.name}</p>
              <p className="mt-1 text-sm text-muted-fg">{formatDateTime(activeShift.opened_at)}</p>
            </div>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                  Modal Awal
                </p>
                <p className="mt-2 text-lg font-semibold text-fg">
                  {formatCurrency(activeShift.opening_cash)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                  Expected Cash
                </p>
                <p className="mt-2 text-lg font-semibold text-fg">
                  {formatCurrency(activeShift.expected_cash)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
                  Total Transaksi
                </p>
                <p className="mt-2 text-lg font-semibold text-fg">
                  {activeShift.transactions_count}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 bg-bg border border-border rounded-2xl p-4 md:grid-cols-4">
          {cashiers.length > 1 ? (
            <select
              value={currentFilters.cashier_id}
              onChange={(e) => handleFilterChange("cashier_id", e.target.value)}
              className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
            >
              <option value="">Semua Kasir</option>
              {cashiers.map((cashier) => (
                <option key={cashier.id} value={cashier.id}>
                  {cashier.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex h-11 items-center rounded-xl border border-input bg-muted px-4 text-sm text-muted-fg">
              <IconHistory size={18} className="mr-2" />
              {cashiers[0]?.name}
            </div>
          )}
          <select
            value={currentFilters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
          >
            <option value="">Semua Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="force_closed">Force Closed</option>
          </select>
          <input
            type="date"
            value={currentFilters.opened_from}
            onChange={(e) => handleFilterChange("opened_from", e.target.value)}
            className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none focus:border-ring focus:ring-2 focus:ring-ring"
          />
          <input
            type="date"
            value={currentFilters.opened_to}
            onChange={(e) => handleFilterChange("opened_to", e.target.value)}
            className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 font-semibold text-sm text-fg">
                Histori Shift Kasir
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Kasir
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Buka
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Tutup
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Expected Cash
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                      Selisih
                    </th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-bg">
                  {shifts.data.length > 0 ? (
                    shifts.data.map((shift) => (
                      <tr key={shift.id} className="hover:bg-muted transition-colors">
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          <div>
                            <p className="font-semibold text-fg">{shift.user?.name || "-"}</p>
                            <p className="text-xs text-muted-fg">
                              Modal {formatCurrency(shift.opening_cash)}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle">
                          <ShiftStatusBadge status={shift.status} />
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {formatDateTime(shift.opened_at)}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {formatDateTime(shift.closed_at)}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {formatCurrency(shift.expected_cash)}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                          {shift.cash_difference === null
                            ? "-"
                            : formatCurrency(shift.cash_difference)}
                        </td>
                        <td className="whitespace-nowrap p-4 align-middle text-center">
                          <Link
                            href={cashierShifts.show.url({ cashierShift: shift.id })}
                            className="inline-flex rounded-xl border border-border bg-muted p-2 text-muted-fg transition hover:border-primary/30 hover:text-primary"
                          >
                            <IconEye size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <IconClockHour4 size={28} className="text-muted-fg" />
                          </div>
                          <p className="text-muted-fg">Belum ada histori shift kasir.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {shifts.last_page > 1 && <Pagination links={shifts.links} />}
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
