import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconChartInfographic,
  IconCirclePlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconAlertCircle,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { toast } from "sonner";
import { useAuthorization } from "@/lib/auth";
import pricingRules from "@/routes/pricing-rules";

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
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function discountLabel(rule: PricingRule) {
  if (rule.kind === "bundle_price") {
    return `Bundle ${formatCurrency(rule.discount_value)}`;
  }
  if (rule.kind === "buy_x_get_y") {
    return `${rule.buy_get_items_count || 0} item`;
  }
  if (rule.discount_type === "percentage") {
    return `${Number(rule.discount_value)}%`;
  }
  if (rule.discount_type === "fixed_price") {
    return `Harga ${formatCurrency(rule.discount_value)}`;
  }
  return `Potong ${formatCurrency(rule.discount_value)}`;
}

function targetLabel(rule: PricingRule) {
  if (rule.target_type === "product") return rule.product?.title || "Produk";
  if (rule.target_type === "category") return rule.category?.name || "Kategori";
  return "Semua Produk";
}

function customerScopeLabel(scope: string | null) {
  if (scope === "walk_in") return "Umum";
  if (scope === "registered") return "Pelanggan";
  if (scope === "member") return "Member";
  return "Semua";
}

function kindLabel(kind: string) {
  if (kind === "qty_break") return "Grosir";
  if (kind === "bundle_price") return "Bundle";
  if (kind === "buy_x_get_y") return "BXGY";
  return "Standar";
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PricingRule {
  id: number;
  name: string;
  kind: string;
  discount_type: string;
  discount_value: number;
  target_type: string;
  customer_scope: string | null;
  priority: number;
  status_label: string;
  starts_at: string | null;
  product: { title: string } | null;
  category: { name: string } | null;
  buy_get_items_count: number | null;
}

interface Summary {
  active: number;
  scheduled: number;
  expired: number;
  inactive: number;
}

interface Audit {
  id: number;
  description: string;
  event: string;
  created_at: string;
}

interface IndexProps {
  rules: { data: PricingRule[]; links: PaginationLink[]; last_page: number };
  filters?: { search?: string; status?: string; target_type?: string; kind?: string };
  summary?: Summary;
  recentAudits?: Audit[];
}

export default function PricingRulesIndex({
  rules,
  filters = {},
  summary = {} as Summary,
  recentAudits = [],
}: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { can } = useAuthorization();
  const hasData = rules.data.length > 0;

  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");
  const [targetType, setTargetType] = useState(filters.target_type || "");
  const [kind, setKind] = useState(filters.kind || "");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      pricingRules.index.url(),
      { search, status: status, target_type: targetType, kind },
      { preserveScroll: true, preserveState: true },
    );
  }

  function handleDelete(url: string) {
    if (confirm("Hapus rule ini?")) {
      router.delete(url, { preserveScroll: true });
    }
  }

  const summaryCards = [
    { label: "Aktif", value: summary.active || 0 },
    { label: "Terjadwal", value: summary.scheduled || 0 },
    { label: "Expired", value: summary.expired || 0 },
    { label: "Inactive", value: summary.inactive || 0 },
  ];

  return (
    <>
      <Head title="Promo Harga" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconChartInfographic size={26} className="text-primary" />
              Promo Harga
            </h1>
            <p className="text-smtext-muted-fg">Atur diskon dan harga otomatis untuk POS.</p>
          </div>
          {can("pricing-rules-create") && (
            <Link
              href={pricingRules.create.url()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-sm text-primary-fg shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              <IconCirclePlus size={18} />
              Buat Rule
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {summaryCards.map((item) => (
            <div key={item.label} className="rounded-2xl border border-border bg-bg p-4">
              <p className="text-muted-fg text-xs uppercase tracking-wide">{item.label}</p>
              <p className="mt-2 font-bold text-2xl text-fg">{item.value}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={applyFilter}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="relative w-full lg:col-span-2">
            <IconSearch
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama rule..."
              className="h-11 w-full rounded-xl border border-border bg-muted pr-3 pl-10 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="">Semua Target</option>
            <option value="all">Semua Produk</option>
            <option value="product">Produk</option>
            <option value="category">Kategori</option>
          </select>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="">Semua Jenis</option>
            <option value="qty_break">Grosir</option>
            <option value="bundle_price">Bundle</option>
            <option value="buy_x_get_y">BXGY</option>
            <option value="standard_discount">Standar</option>
          </select>
          <div className="flex justify-end lg:col-span-5">
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-sm text-white"
            >
              Terapkan
            </button>
          </div>
        </form>

        <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-border sm:bg-bg">
          <div className="hidden w-full overflow-x-auto sm:block">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-12 gap-2 border-border border-b px-3 py-3 font-semiboldtext-muted-fg text-xs uppercase tracking-wider sm:px-4">
                <div className="col-span-3">Rule</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-1">Scope</div>
                <div className="col-span-1">Jenis</div>
                <div className="col-span-2">Diskon</div>
                <div className="col-span-1 text-center">Priority</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>
              {hasData ? (
                rules.data.map((rule) => (
                  <div
                    key={rule.id}
                    className="grid grid-cols-12 items-center gap-2 border-border border-b px-3 py-3 transition-colors hover:bg-muted sm:px-4"
                  >
                    <div className="col-span-3">
                      <div className="flex items-start gap-3">
                        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary sm:flex">
                          <IconChartInfographic size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-fg text-sm">{rule.name}</p>
                          <p className="text-muted-fg text-xs">{formatDate(rule.starts_at)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-fg text-sm">{targetLabel(rule)}</div>
                    <div className="col-span-1 text-fg text-sm">
                      {customerScopeLabel(rule.customer_scope)}
                    </div>
                    <div className="col-span-1">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 font-semibold text-fg text-xs">
                        {kindLabel(rule.kind)}
                      </span>
                    </div>
                    <div className="col-span-2 font-semibold text-fg text-sm">
                      {discountLabel(rule)}
                    </div>
                    <div className="col-span-1 text-center text-fg text-sm">{rule.priority}</div>
                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-semibold text-xs ${
                          rule.status_label === "active"
                            ? "bg-success/15 text-success"
                            : rule.status_label === "scheduled"
                              ? "bg-warning/15 text-warning"
                              : "bg-muted text-muted-fg"
                        }`}
                      >
                        {rule.status_label}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-center gap-1">
                      {can("pricing-rules-update") && (
                        <Link
                          href={pricingRules.edit.url({ pricing_rule: rule.id })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                        >
                          <IconPencil size={14} />
                        </Link>
                      )}
                      {can("pricing-rules-delete") && (
                        <button
                          onClick={() =>
                            handleDelete(pricingRules.destroy.url({ pricing_rule: rule.id }))
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-centertext-muted-fg">
                  <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                  Belum ada data rule promo harga.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1 sm:hidden">
            {hasData ? (
              rules.data.map((rule) => (
                <div
                  key={rule.id}
                  className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold text-fg text-sm">{rule.name}</p>
                      <p className="text-xstext-muted-fg">{formatDate(rule.starts_at)}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-semibold text-xs ${
                        rule.status_label === "active"
                          ? "bg-success-subtle text-success"
                          : rule.status_label === "scheduled"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-fg"
                      }`}
                    >
                      {rule.status_label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xstext-muted-fg">Target</p>
                      <p className="font-medium text-fg">{targetLabel(rule)}</p>
                    </div>
                    <div>
                      <p className="text-xstext-muted-fg">Diskon</p>
                      <p className="font-semibold text-fg">{discountLabel(rule)}</p>
                    </div>
                    <div>
                      <p className="text-xstext-muted-fg">Jenis</p>
                      <p className="font-medium text-fg">{kindLabel(rule.kind)}</p>
                    </div>
                    <div>
                      <p className="text-xstext-muted-fg">Priority</p>
                      <p className="font-medium text-fg">{rule.priority}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {can("pricing-rules-update") && (
                      <Link
                        href={pricingRules.edit.url({ pricing_rule: rule.id })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                      >
                        <IconPencil size={14} />
                      </Link>
                    )}
                    {can("pricing-rules-delete") && (
                      <button
                        onClick={() =>
                          handleDelete(pricingRules.destroy.url({ pricing_rule: rule.id }))
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-bg p-6 text-centertext-muted-fg">
                <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada data rule promo harga.
              </div>
            )}
          </div>
        </div>

        {rules.last_page > 1 && (
          <ul className="flex items-center justify-end gap-1">
            {rules.links.map((link, i) =>
              link.url != null ? (
                link.label.includes("Previous") ? (
                  <Link
                    key={i}
                    href={link.url}
                    className="rounded-md border border-border bg-bg p-1 text-muted-fg text-sm hover:bg-muted"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="rounded-md border border-border bg-bg p-1 text-muted-fg text-sm hover:bg-muted"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`rounded-md border px-2 py-1 text-sm ${
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

        {recentAudits.length > 0 && (
          <div className="rounded-2xl border border-border bg-bg p-4">
            <h2 className="font-semibold text-base text-fg">Aktivitas Promo Terbaru</h2>
            <div className="mt-4 space-y-3">
              {recentAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-fg">{audit.description}</p>
                    <p className="text-muted-fg text-xs">{audit.event}</p>
                  </div>
                  <span className="text-muted-fg text-xs">{formatDate(audit.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

PricingRulesIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
