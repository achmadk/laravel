import DashboardLayout from "@/layouts/dashboard-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconDatabaseOff, IconTrash, IconUsersGroup } from "@tabler/icons-react";

import { show } from "@/routes/customers";
import customerSegments from "@/routes/customer-segments";

interface Membership {
  id: number;
  source: string;
  matched_at: string | null;
  customer: {
    id: number;
    name: string;
    no_telp: string | null;
  } | null;
}

interface SegmentStats {
  total_members: number;
  manual_members: number;
  auto_members: number;
}

interface Segment {
  id: number;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
  auto_rule_type: string | null;
  stats: SegmentStats;
  memberships: Membership[];
}

interface Customer {
  id: number;
  name: string;
  no_telp: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
}

interface ShowProps {
  segment: Segment;
  customers?: Customer[];
}

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
};

export default function Show({ segment, customers = [] }: ShowProps) {
  const { data, setData, post, processing } = useForm({
    customer_id: "",
  });
  const isManual = segment.type === "manual";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(customerSegments.members.store(segment.id).url);
  };

  return (
    <>
      <Head title={segment.name} />

      <div className="mb-6">
        <Link
          // href={route("customer-segments.index")}
          href={customerSegments.index().url}
          className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary-600"
        >
          <IconArrowLeft size={16} />
          Kembali ke segment customer
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-2xl font-bold text-fg">{segment.name}</h1>
              <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg">
                {segment.type}
              </span>
            </div>
            <p className="text-sm text-muted-fg">{segment.description || "Segment CRM customer"}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-bg px-4 py-3 shadow-sm ring-1 ring-border">
              <p className="text-xs uppercase tracking-widetext-muted-fg">Total</p>
              <p className="mt-1 text-xl font-bold text-fg">{segment.stats.total_members}</p>
            </div>
            <div className="rounded-2xl bg-bg px-4 py-3 shadow-sm ring-1 ring-border">
              <p className="text-xs uppercase tracking-widetext-muted-fg">Manual</p>
              <p className="mt-1 text-xl font-bold text-fg">{segment.stats.manual_members}</p>
            </div>
            <div className="rounded-2xl bg-bg px-4 py-3 shadow-sm ring-1 ring-border">
              <p className="text-xs uppercase tracking-widetext-muted-fg">Auto</p>
              <p className="mt-1 text-xl font-bold text-fg">{segment.stats.auto_members}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <h2 className="mb-4 text-lg font-semibold text-fg">Anggota Segment</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-semibold text-muted-fg">Customer</th>
                <th className="px-4 py-3 font-semibold text-muted-fg">Source</th>
                <th className="px-4 py-3 font-semibold text-muted-fg">Matched</th>
                <th className="w-28 px-4 py-3 text-center font-semibold text-muted-fg">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {segment.memberships.length > 0 ? (
                segment.memberships.map((membership) => (
                  <tr key={membership.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={show(membership.customer?.id ?? 0).url}
                        className="font-semibold text-fg hover:text-primary"
                      >
                        {membership.customer?.name || "-"}
                      </Link>
                      <p className="text-xs text-muted-fg">{membership.customer?.no_telp || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-fg">{membership.source}</td>
                    <td className="px-4 py-3 text-fg">{formatDateTime(membership.matched_at)}</td>
                    <td className="px-4 py-3 text-center">
                      {isManual && membership.customer ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Hapus anggota dari segment ini?")) {
                              const form = document.createElement("form");
                              form.method = "POST";
                              form.action = customerSegments.members.destroy([
                                segment.id,
                                membership.customer!.id,
                              ]).url;
                              form.style.display = "none";
                              const methodInput = document.createElement("input");
                              methodInput.type = "hidden";
                              methodInput.name = "_method";
                              methodInput.value = "DELETE";
                              form.appendChild(methodInput);
                              document.body.appendChild(form);
                              form.submit();
                            }
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                        >
                          <IconTrash size={16} />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-fg">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <IconDatabaseOff size={28} className="text-muted-fg" />
                    </div>
                    <p className="text-sm text-muted-fg">Belum ada anggota segment.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {isManual && (
            <div className="rounded-2xl border border-border bg-bg p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Tambah Anggota Manual</h2>
              <form onSubmit={submit} className="space-y-4">
                <select
                  value={data.customer_id}
                  onChange={(e) => setData("customer_id", e.target.value)}
                  className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
                >
                  <option value="">Pilih customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} | {customer.no_telp || "-"} |{" "}
                      {customer.is_loyalty_member ? customer.loyalty_tier : "non-member"}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                >
                  Tambahkan ke Segment
                </button>
              </form>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-bg p-5">
            <div className="mb-4 flex items-center gap-2">
              <IconUsersGroup size={18} className="text-primary-500" />
              <h2 className="text-lg font-semibold text-fg">Ringkasan Rule</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-fg">Slug</dt>
                <dd className="font-medium text-fg">{segment.slug}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-fg">Rule Type</dt>
                <dd className="font-medium text-fg">{segment.auto_rule_type || "-"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-fg">Status</dt>
                <dd className="font-medium text-fg">{segment.is_active ? "Aktif" : "Nonaktif"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
