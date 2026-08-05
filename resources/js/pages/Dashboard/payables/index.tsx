import { useEffect, useState } from "react";
import { Head, Link, router, usePage, useForm } from "@inertiajs/react";
import {
  IconClockHour6,
  IconSearch,
  IconCalendar,
  IconAlertCircle,
  IconPlus,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import payables from "@/routes/payables";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";

function formatCurrency(value: number = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

interface PayableItem {
  id: number;
  document_number: string;
  total: number;
  paid: number;
  remaining: number;
  due_date: string;
  status: string;
  supplier: { name: string; phone?: string } | null;
}

interface PayablesResponse {
  data: PayableItem[];
  total: number;
  links: PaginationLink[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Supplier {
  id: number;
  name: string;
}

interface IndexProps {
  payables: PayablesResponse;
  filters?: { invoice?: string; status?: string; supplier?: string };
  suppliers?: Supplier[];
}

function PayablesBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
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
    <StatusBadge
      variant={(map[value] || "warning") as "success" | "warning" | "danger" | "info" | "neutral"}
      label={labels[value] || "Belum Lunas"}
    />
  );
}

export default function PayablesIndex({
  payables: data,
  filters = {},
  suppliers = [],
}: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const [search, setSearch] = useState(filters.invoice || "");
  const [status, setStatus] = useState(filters.status || "");
  const [supplierId, setSupplierId] = useState(filters.supplier || "");

  const {
    data: formData,
    setData,
    post,
    processing,
    reset,
    errors,
  } = useForm({
    supplier_id: "",
    document_number: "",
    total: "",
    due_date: "",
    note: "",
  });

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      payables.index.url(),
      { invoice: search, status, supplier: supplierId },
      { preserveScroll: true, preserveState: true },
    );
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    post(payables.store.url(), {
      onSuccess: () => reset(),
    });
  }

  const rows = data?.data || [];

  return (
    <>
      <Head title="Hutang Supplier" />
      <div className="space-y-6">
        <PageHeader
          title="Hutang Supplier"
          description="Catat dan lacak pembayaran hutang ke supplier."
          icon={<IconClockHour6 size={20} />}
        />

        <form
          onSubmit={submitCreate}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 md:grid-cols-5"
        >
          <div>
            <label className="font-semibold text-muted-fg text-sm">Supplier</label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setData("supplier_id", e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
            >
              <option value="">Umum</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-muted-fg text-sm">Nomor Dokumen</label>
            <input
              value={formData.document_number}
              onChange={(e) => setData("document_number", e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm placeholder:text-muted-fg"
              placeholder="Opsional"
            />
          </div>
          <div>
            <label className="font-semibold text-muted-fg text-sm">Total</label>
            <input
              type="number"
              min="1"
              value={formData.total}
              onChange={(e) => setData("total", e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
              required
            />
            {errors.total && <p className="text-danger text-xs">{errors.total}</p>}
          </div>
          <div>
            <label className="font-semibold text-muted-fg text-sm">Jatuh Tempo</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setData("due_date", e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" isDisabled={processing} intent="primary" className="h-11 w-full">
              <IconPlus size={16} />
              Simpan
            </Button>
          </div>
          <div className="md:col-span-5">
            <label className="font-semibold text-muted-fg text-sm">Catatan</label>
            <textarea
              rows={2}
              value={formData.note}
              onChange={(e) => setData("note", e.target.value)}
              className="w-full rounded-xl border border-input bg-muted px-3 py-2 text-fg text-sm placeholder:text-muted-fg"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </form>

        <form
          onSubmit={applyFilter}
          className="grid grid-cols-1 items-end gap-3 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="relative w-full">
            <IconSearch
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor dokumen"
              className="h-11 w-full rounded-xl border border-input bg-muted pr-3 pl-10 text-fg text-sm placeholder:text-muted-fg"
            />
          </div>
          <div className="w-full">
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-muted px-3 text-fg text-sm"
            >
              <option value="">Semua Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-full">
            <IconCalendar
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 w-full rounded-xl border border-input bg-muted pr-3 pl-10 text-fg text-sm"
            >
              <option value="">Semua Status</option>
              <option value="unpaid">Belum Lunas</option>
              <option value="partial">Parsial</option>
              <option value="paid">Lunas</option>
              <option value="overdue">Jatuh Tempo</option>
            </select>
          </div>
          <Button type="submit" intent="primary" className="w-full sm:w-auto">
            Terapkan
          </Button>
        </form>

        <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-border sm:bg-bg">
          <div className="hidden w-full overflow-x-auto sm:block">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-12 border-border border-b px-3 py-3 font-semibold text-muted-fg text-xs uppercase tracking-wider sm:px-4">
                <div className="col-span-2">Dokumen</div>
                <div className="col-span-2">Supplier</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-2 text-right">Sisa</div>
                <div className="col-span-2 text-right">Jatuh Tempo</div>
                <div className="col-span-2 min-w-[140px] text-center">Status</div>
              </div>
              {rows.length > 0 ? (
                rows.map((item) => (
                  <Link
                    key={item.id}
                    href={payables.show.url({ payable: item.id })}
                    className="grid grid-cols-12 items-center gap-2 border-border border-b px-3 py-3 transition-colors hover:bg-muted sm:px-4"
                  >
                    <div className="col-span-2">
                      <p className="font-semibold text-fg text-sm">{item.document_number}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-fg text-sm">{item.supplier?.name || "-"}</p>
                    </div>
                    <div className="col-span-2 text-right font-semibold text-fg text-sm">
                      {formatCurrency(item.total)}
                    </div>
                    <div className="col-span-2 text-right font-semibold text-primary text-sm">
                      {formatCurrency(item.remaining)}
                    </div>
                    <div className="col-span-2 text-right text-muted-fg text-sm">
                      {formatDate(item.due_date)}
                    </div>
                    <div className="col-span-2 flex justify-center whitespace-nowrap">
                      <PayablesBadge value={item.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-fg">
                  <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                  Belum ada data hutang.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1 sm:hidden">
            {rows.length > 0 ? (
              rows.map((item) => (
                <Link
                  key={item.id}
                  href={payables.show.url({ payable: item.id })}
                  className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-muted-fg text-xs">Dokumen</p>
                      <p className="font-semibold text-base text-fg">
                        {item.document_number || "-"}
                      </p>
                      <p className="text-muted-fg text-xs">
                        Jatuh tempo: {formatDate(item.due_date)}
                      </p>
                    </div>
                    <div className="space-y-2 text-right">
                      <PayablesBadge value={item.status} />
                      <p className="font-semibold text-fg text-sm">{formatCurrency(item.total)}</p>
                      <p className="text-primary text-xs">Sisa {formatCurrency(item.remaining)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-fg text-sm">
                    <div>
                      <p className="text-muted-fg text-xs">Supplier</p>
                      <p className="font-medium text-fg">{item.supplier?.name || "-"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-fg text-xs">Status</p>
                      <p className="font-medium text-fg capitalize">{item.status}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-bg p-6 text-center text-muted-fg">
                <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada data hutang.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

PayablesIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
