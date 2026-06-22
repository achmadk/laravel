import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconCreditCard,
  IconCirclePlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconAlertCircle,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import { useAuthorization } from "@/lib/auth";
import customerVouchers from "@/routes/customer-vouchers";

function formatPrice(value: number = 0) {
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
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Customer {
  id: number;
  name: string;
  no_telp: string | null;
}

interface Voucher {
  id: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  is_active: boolean;
  is_used: boolean;
  starts_at: string | null;
  expires_at: string | null;
  customer: Customer | null;
}

interface VouchersResponse {
  data: Voucher[];
  links: PaginationLink[];
  last_page: number;
}

interface IndexProps {
  vouchers: VouchersResponse;
  filters?: { search?: string; status?: string };
}

function statusBadge(voucher: Voucher) {
  if (voucher.is_used) {
    return {
      label: "Sudah Dipakai",
      className: "bg-muted text-muted-fg",
    };
  }

  const startsAt = voucher.starts_at ? new Date(voucher.starts_at) : null;
  const expiresAt = voucher.expires_at ? new Date(voucher.expires_at) : null;
  const now = new Date();

  if (!voucher.is_active) {
    return {
      label: "Nonaktif",
      className: "bg-danger/15 text-danger",
    };
  }

  if (startsAt && startsAt > now) {
    return {
      label: "Terjadwal",
      className: "bg-warning/15 text-warning",
    };
  }

  if (expiresAt && expiresAt < now) {
    return {
      label: "Expired",
      className: "bg-muted text-muted-fg",
    };
  }

  return {
    label: "Aktif",
    className: "bg-success/15 text-success",
  };
}

export default function CustomerVouchersIndex({ vouchers, filters = {} }: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { can } = useAuthorization();
  const hasData = vouchers.data.length > 0;

  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      customerVouchers.index.url(),
      { search, status },
      { preserveScroll: true, preserveState: true },
    );
  }

  function handleDelete(url: string) {
    if (confirm("Hapus voucher ini?")) {
      router.delete(url, { preserveScroll: true });
    }
  }

  return (
    <>
      <Head title="Voucher Customer" />
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
              <IconCreditCard size={26} className="text-primary-500" />
              Voucher Customer
            </h1>
            <p className="text-smtext-muted-fg">
              Voucher personal untuk promosi retensi dan reward pelanggan.
            </p>
          </div>
          {can("customer-vouchers-create") && (
            <Link
              href={customerVouchers.create.url()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-colors"
            >
              <IconCirclePlus size={18} />
              Buat Voucher
            </Link>
          )}
        </div>

        <form
          onSubmit={applyFilter}
          className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3 bg-bg border border-border rounded-2xl p-4"
        >
          <div className="relative w-full">
            <IconSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode, voucher, pelanggan..."
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-muted text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-sm"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="scheduled">Terjadwal</option>
            <option value="expired">Expired</option>
            <option value="used">Sudah Dipakai</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </form>

        <div className="bg-transparent border-0 shadow-none rounded-2xl sm:bg-bg sm:border sm:border-border sm:overflow-hidden">
          <div className="w-full overflow-x-auto hidden sm:block">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-3 text-xs font-semiboldtext-muted-fg uppercase tracking-wider border-b border-border">
                <div className="col-span-3">Kode</div>
                <div className="col-span-2">Pelanggan</div>
                <div className="col-span-3">Benefit</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Kedaluwarsa</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>
              {hasData ? (
                vouchers.data.map((voucher) => {
                  const badge = statusBadge(voucher);
                  return (
                    <div
                      key={voucher.id}
                      className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-3 items-center border-b border-border hover:bg-muted transition-colors"
                    >
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <IconCreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-fg">{voucher.code}</p>
                            <p className="text-xs text-muted-fg">{voucher.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-fg">
                          {voucher.customer?.name || "-"}
                        </p>
                        <p className="text-xs text-muted-fg">{voucher.customer?.no_telp || ""}</p>
                      </div>
                      <div className="col-span-3">
                        <p className="text-sm text-fg">
                          {voucher.discount_type === "percentage"
                            ? `${voucher.discount_value}%`
                            : formatPrice(voucher.discount_value)}
                        </p>
                        <p className="text-xs text-muted-fg">
                          Min. {formatPrice(voucher.minimum_order)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="col-span-1 text-sm text-muted-fg">
                        {formatDate(voucher.expires_at)}
                      </div>
                      <div className="col-span-1 flex justify-center gap-1">
                        {can("customer-vouchers-update") && (
                          <Link
                            href={customerVouchers.edit({ customer_voucher: voucher.id }).url}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                          >
                            <IconPencil size={14} />
                          </Link>
                        )}
                        {can("customer-vouchers-delete") && (
                          <button
                            onClick={() =>
                              handleDelete(
                                customerVouchers.destroy({ customer_voucher: voucher.id }).url,
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                          >
                            <IconTrash size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-centertext-muted-fg">
                  <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                  Belum ada data voucher customer.
                </div>
              )}
            </div>
          </div>

          <div className="sm:hidden flex flex-col gap-3 px-1">
            {hasData ? (
              vouchers.data.map((voucher) => {
                const badge = statusBadge(voucher);
                return (
                  <div
                    key={voucher.id}
                    className="p-4 space-y-3 bg-bg border border-border rounded-xl shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-fg">{voucher.code}</p>
                        <p className="text-xstext-muted-fg">{voucher.name}</p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xstext-muted-fg">Pelanggan</p>
                        <p className="font-medium text-fg">{voucher.customer?.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xstext-muted-fg">Diskon</p>
                        <p className="font-semibold text-fg">
                          {voucher.discount_type === "percentage"
                            ? `${voucher.discount_value}%`
                            : formatPrice(voucher.discount_value)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xstext-muted-fg">Min. Order</p>
                        <p className="text-fg">{formatPrice(voucher.minimum_order)}</p>
                      </div>
                      <div>
                        <p className="text-xstext-muted-fg">Kedaluwarsa</p>
                        <p className="text-fg">{formatDate(voucher.expires_at)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {can("customer-vouchers-update") && (
                        <Link
                          href={customerVouchers.edit({ customer_voucher: voucher.id }).url}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                        >
                          <IconPencil size={14} />
                        </Link>
                      )}
                      {can("customer-vouchers-delete") && (
                        <button
                          onClick={() =>
                            handleDelete(
                              customerVouchers.destroy({ customer_voucher: voucher.id }).url,
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-centertext-muted-fg bg-bg border border-border rounded-xl">
                <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada data voucher customer.
              </div>
            )}
          </div>
        </div>

        {vouchers.last_page > 1 && (
          <ul className="flex items-center justify-end gap-1">
            {vouchers.links.map((link, i) =>
              link.url != null ? (
                link.label.includes("Previous") ? (
                  <Link
                    key={i}
                    href={link.url}
                    className="p-1 text-sm border rounded-md bg-bg text-muted-fg hover:bg-muted border-border"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Link>
                ) : link.label.includes("Next") ? (
                  <Link
                    key={i}
                    href={link.url}
                    className="p-1 text-sm border rounded-md bg-bg text-muted-fg hover:bg-muted border-border"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ) : (
                  <Link
                    key={i}
                    href={link.url}
                    className={`px-2 py-1 text-sm border rounded-md ${
                      link.active ? "bg-muted text-fg" : "bg-bg text-muted-fg hover:bg-muted"
                    } border-border`}
                  >
                    {link.label}
                  </Link>
                )
              ) : null,
            )}
          </ul>
        )}
      </div>
    </>
  );
}

CustomerVouchersIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
