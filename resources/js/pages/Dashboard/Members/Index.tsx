import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconUsers,
  IconCirclePlus,
  IconPencil,
  IconSearch,
  IconCrown,
  IconAlertCircle,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import {
  edit as editMember,
  create as createMember,
  index as indexMembers,
  show as showMember,
} from "@/routes/members";

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

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Member {
  id: number;
  name: string;
  member_code: string | null;
  no_telp: string | null;
  loyalty_tier: string | null;
  is_loyalty_member: boolean;
  loyalty_points: number;
  loyalty_total_spent: number;
  loyalty_transaction_count: number;
  last_purchase_at: string | null;
}

interface MembersResponse {
  data: Member[];
  links: PaginationLink[];
  last_page: number;
}

interface Summary {
  total_members: number;
  active_members: number;
  member_revenue: number;
  repeat_rate: number;
  top_member: { name: string; total_spent: number } | null;
}

interface TierOption {
  value: string;
  label: string;
}

interface IndexProps {
  members: MembersResponse;
  filters?: { search?: string; tier?: string; status?: string };
  tierOptions?: TierOption[];
  summary?: Summary;
}

export default function MembersIndex({
  members,
  filters = {},
  tierOptions = [],
  summary = {} as Summary,
}: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const hasData = members.data.length > 0;

  const [search, setSearch] = useState(filters.search || "");
  const [tier, setTier] = useState(filters.tier || "");
  const [status, setStatus] = useState(filters.status || "active");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      indexMembers().url,
      { search, tier, status },
      { preserveScroll: true, preserveState: true },
    );
  }

  const summaryCards = [
    {
      label: "Total Member",
      value: summary?.total_members || 0,
      helper: "Seluruh member yang pernah terdaftar",
    },
    {
      label: "Member Aktif",
      value: summary?.active_members || 0,
      helper: "Masih menerima benefit member",
    },
    {
      label: "Omzet Member",
      value: formatCurrency(summary?.member_revenue || 0),
      helper: "Kontribusi transaksi dari member",
    },
    {
      label: "Repeat Rate",
      value: `${summary?.repeat_rate || 0}%`,
      helper: summary?.top_member?.name
        ? `Top member: ${summary.top_member.name}`
        : "Belum ada top member",
    },
  ];

  return (
    <>
      <Head title="Member" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconUsers size={26} className="text-primary" />
              Member
            </h1>
            <p className="text-smtext-muted-fg">
              Kelola pendaftaran, status, dan performa member tanpa memisahkan data dari customer
              inti.
            </p>
          </div>
          <Link
            href={createMember().url}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-sm text-primary-fg shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
          >
            <IconCirclePlus size={18} />
            Daftarkan Member
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-bg p-4">
              <p className="font-semibold text-xs uppercase tracking-widetext-muted-fg">
                {card.label}
              </p>
              <p className="mt-2 font-bold text-2xl text-fg">{card.value}</p>
              <p className="mt-2 text-muted-fg text-xs">{card.helper}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={applyFilter}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-4"
        >
          <div className="relative w-full sm:col-span-2">
            <IconSearch
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama member atau nomor anggota..."
              className="h-11 w-full rounded-xl border border-border bg-muted pr-3 pl-10 text-sm"
            />
          </div>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="">Semua Tier</option>
            {tierOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="active">Member Aktif</option>
            <option value="inactive">Member Nonaktif</option>
            <option value="all">Semua Status</option>
          </select>
        </form>

        <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-border sm:bg-bg">
          <div className="hidden w-full overflow-x-auto sm:block">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-2 border-border border-b px-3 py-3 font-semiboldtext-muted-fg text-xs uppercase tracking-wider sm:px-4">
                <div className="col-span-3">Member</div>
                <div className="col-span-2">Tier</div>
                <div className="col-span-1 text-right">Poin</div>
                <div className="col-span-2 text-right">Total Belanja</div>
                <div className="col-span-2 text-right">Transaksi</div>
                <div className="col-span-1">Terakhir</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>
              {hasData ? (
                members.data.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-12 items-center gap-2 border-border border-b px-3 py-3 transition-colors hover:bg-muted sm:px-4"
                  >
                    <div className="col-span-3">
                      <Link
                        href={showMember({ member: member.id }).url}
                        className="font-semibold text-fg text-sm hover:text-primary"
                      >
                        {member.name}
                      </Link>
                      <p className="text-muted-fg text-xs">
                        {member.member_code || "Belum ada nomor anggota"}
                      </p>
                      <p className="text-muted-fg text-xs">{member.no_telp || "-"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-1 font-semibold text-primary text-xs">
                        {member.loyalty_tier || "regular"}
                      </span>
                      <p className="mt-1 text-[11px] text-muted-fg">
                        {member.is_loyalty_member ? "Aktif" : "Nonaktif"}
                      </p>
                    </div>
                    <div className="col-span-1 text-right text-fg text-sm">
                      {member.loyalty_points || 0}
                    </div>
                    <div className="col-span-2 text-right font-semibold text-fg text-sm">
                      {formatCurrency(member.loyalty_total_spent || 0)}
                    </div>
                    <div className="col-span-2 text-right text-fg text-sm">
                      {member.loyalty_transaction_count || 0}
                    </div>
                    <div className="col-span-1 text-muted-fg text-sm">
                      {formatDate(member.last_purchase_at)}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Link
                        href={editMember({ member: member.id }).url}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                      >
                        <IconPencil size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-centertext-muted-fg">
                  <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                  Belum ada member yang sesuai dengan filter.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1 sm:hidden">
            {hasData ? (
              members.data.map((member) => (
                <div
                  key={member.id}
                  className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link
                        href={showMember({ member: member.id }).url}
                        className="font-semibold text-fg text-sm hover:text-primary"
                      >
                        {member.name}
                      </Link>
                      <p className="text-xstext-muted-fg">
                        {member.member_code || member.no_telp || "-"}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-primary/15 px-2.5 py-1 font-semibold text-primary text-xs">
                      {member.loyalty_tier || "regular"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xstext-muted-fg">Poin</p>
                      <p className="font-semibold text-fg">{member.loyalty_points || 0}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xstext-muted-fg">Total Belanja</p>
                      <p className="font-semibold text-fg">
                        {formatCurrency(member.loyalty_total_spent || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xstext-muted-fg">
                      {member.loyalty_transaction_count || 0} transaksi
                    </p>
                    <Link
                      href={editMember({ member: member.id }).url}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                    >
                      <IconPencil size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-bg p-6 text-centertext-muted-fg">
                <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada member yang sesuai dengan filter.
              </div>
            )}
          </div>
        </div>

        {summary?.top_member && (
          <div className="rounded-2xl border border-border bg-bg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <IconCrown size={20} />
              </div>
              <div>
                <p className="font-semibold text-fg text-sm">Top Member by Spending</p>
                <p className="text-muted-fg text-xs">
                  {summary.top_member.name} &bull; {formatCurrency(summary.top_member.total_spent)}
                </p>
              </div>
            </div>
          </div>
        )}

        {members.last_page > 1 && (
          <ul className="flex items-center justify-end gap-1">
            {members.links.map((link, i) =>
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

        <div className="rounded-2xl border border-border border-dashed bg-muted p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-muted-fg">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-fg text-sm">Bantuan cepat</p>
              <p className="mt-1 text-muted-fg text-xs leading-6">
                Daftarkan member baru dari halaman ini atau langsung dari POS. Untuk upgrade
                pelanggan biasa menjadi member, gunakan tombol upgrade di detail pelanggan atau
                picker pelanggan di POS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

MembersIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
