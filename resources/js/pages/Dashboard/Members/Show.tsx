import DashboardLayout from "@/layouts/dashboard-layout";
import { Head, Link } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCoins,
  IconCrown,
  IconDatabaseOff,
  IconGift,
  IconPencil,
  IconReceipt,
  IconTags,
} from "@tabler/icons-react";
import members from "@/routes/members";

interface MemberStats {
  total_transactions: number;
  total_spent: number;
  last_visit: string | null;
}

interface Transaction {
  id: number;
  invoice: string;
  date: string;
  total: number;
}

interface RewardHistory {
  id: number;
  type: string;
  reference: string | null;
  notes: string | null;
  points_delta: number;
  created_at: string;
}

interface Segment {
  id: number;
  name: string;
  source: string;
}

interface Product {
  id: number;
  title: string;
  total_qty: number;
}

interface Voucher {
  id: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
}

interface Member {
  id: number;
  name: string;
  no_telp: string | null;
  address: string | null;
  member_code: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string;
  loyalty_points: number;
  loyalty_member_since: string | null;
}

interface ShowProps {
  member: Member;
  stats: MemberStats | null;
  recentTransactions?: Transaction[];
  frequentProducts?: Product[];
  rewardHistory?: RewardHistory[];
  vouchers?: Voucher[];
  segments?: Segment[];
}

const formatPrice = (value = 0) =>
  Number(value || 0).toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
};

export default function Show({
  member,
  stats,
  recentTransactions = [],
  frequentProducts = [],
  rewardHistory = [],
  vouchers = [],
  segments = [],
}: ShowProps) {
  const hasRecentTransactions = recentTransactions.length > 0;
  const hasRewardHistory = rewardHistory.length > 0;
  const hasFrequentProducts = frequentProducts.length > 0;
  const hasVouchers = vouchers.length > 0;
  const hasSegments = segments.length > 0;

  return (
    <>
      <Head title={`Member - ${member.name}`} />

      <div className="w-full">
        <div className="mb-6">
          <Link
            href={members.index().url}
            className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary-600"
          >
            <IconArrowLeft size={16} />
            Kembali ke Member
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-fg">{member.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg">
                  <IconCrown size={14} />
                  {member.loyalty_tier || "regular"}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    member.is_loyalty_member
                      ? "bg-success-100 text-success-700 dark:bg-success-950/30 dark:text-success-400"
                      : "bg-muted text-muted-fg"
                  }`}
                >
                  {member.is_loyalty_member ? "Aktif" : "Nonaktif"}
                </span>
              </div>
              <p className="text-sm text-muted-fg">
                {member.no_telp || "-"} {member.address ? `• ${member.address}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-fg">
                Nomor Anggota: {member.member_code || "-"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">
                <IconCoins size={14} />
                {member.loyalty_points || 0} poin
              </span>
              <Link
                href={members.edit(member.id).url}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-fg transition hover:border-primary hover:text-primary"
              >
                <IconPencil size={16} />
                Edit Member
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-bg p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Ringkasan Member</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">Total Transaksi</p>
                  <p className="mt-2 text-2xl font-bold text-fg">
                    {stats?.total_transactions || 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">Total Belanja</p>
                  <p className="mt-2 text-lg font-bold text-fg">
                    {formatPrice(stats?.total_spent || 0)}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">Member Sejak</p>
                  <p className="mt-2 text-sm font-semibold text-fg">
                    {member.loyalty_member_since
                      ? new Date(member.loyalty_member_since).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">Kunjungan Terakhir</p>
                  <p className="mt-2 text-sm font-semibold text-fg">
                    {stats?.last_visit
                      ? new Date(stats.last_visit).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-bg p-5">
              <div className="mb-4 flex items-center gap-2">
                <IconReceipt size={18} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-fg">Transaksi Member</h2>
              </div>
              {hasRecentTransactions ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-fg">{transaction.invoice}</p>
                        <p className="text-xs text-muted-fg">{formatDateTime(transaction.date)}</p>
                      </div>
                      <p className="text-sm font-bold text-primary-600 dark:text-primary-300">
                        {formatPrice(transaction.total)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-muted px-4 py-8 text-center">
                  <IconDatabaseOff size={28} className="mx-auto mb-3 text-muted-fg" />
                  <p className="text-sm text-muted-fg">Belum ada transaksi member.</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-bg p-5">
              <div className="mb-4 flex items-center gap-2">
                <IconGift size={18} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-fg">Histori Reward</h2>
              </div>
              {hasRewardHistory ? (
                <div className="space-y-3">
                  {rewardHistory.map((history) => (
                    <div key={history.id} className="rounded-2xl bg-muted px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-fg">
                            {history.reference || history.type}
                          </p>
                          <p className="text-xs text-muted-fg">{history.notes}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${
                              history.points_delta >= 0
                                ? "text-emerald-600 dark:text-emerald-300"
                                : "text-rose-600 dark:text-rose-300"
                            }`}
                          >
                            {history.points_delta >= 0 ? "+" : ""}
                            {history.points_delta} poin
                          </p>
                          <p className="text-xs text-muted-fg">
                            {formatDateTime(history.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-muted px-4 py-8 text-center">
                  <IconDatabaseOff size={28} className="mx-auto mb-3 text-muted-fg" />
                  <p className="text-sm text-muted-fg">Belum ada histori reward.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-bg p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Informasi Member</h2>
              <div className="space-y-3 text-sm text-muted-fg">
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">Tier Loyalty</p>
                  <p className="mt-1 font-semibold text-fg">{member.loyalty_tier || "regular"}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">Saldo Poin</p>
                  <p className="mt-1 font-semibold text-fg">{member.loyalty_points || 0} poin</p>
                </div>
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-widetext-muted-fg">
                    Total Nilai Transaksi
                  </p>
                  <p className="mt-1 font-semibold text-fg">
                    {formatPrice(stats?.total_spent || 0)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-bg p-5">
              <div className="mb-4 flex items-center gap-2">
                <IconTags size={18} className="text-primary-500" />
                <h2 className="text-lg font-semibold text-fg">Segment Terkait</h2>
              </div>
              {hasSegments ? (
                <div className="flex flex-wrap gap-2">
                  {segments.map((segment) => (
                    <span
                      key={segment.id}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        segment.source === "manual"
                          ? "bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {segment.name}
                      <span className="rounded-full bg-bg/70 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                        {segment.source}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-muted px-4 py-8 text-center">
                  <IconDatabaseOff size={28} className="mx-auto mb-3 text-muted-fg" />
                  <p className="text-sm text-muted-fg">Belum ada segment untuk member ini.</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-bg p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Produk Favorit</h2>
              {hasFrequentProducts ? (
                <div className="flex flex-wrap gap-2">
                  {frequentProducts.map((product) => (
                    <span
                      key={product.id}
                      className="inline-flex rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                    >
                      {product.title} x{product.total_qty}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-muted px-4 py-8 text-center">
                  <IconDatabaseOff size={28} className="mx-auto mb-3 text-muted-fg" />
                  <p className="text-sm text-muted-fg">Belum ada data produk favorit.</p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-bg p-5">
              <h2 className="mb-4 text-lg font-semibold text-fg">Voucher Member</h2>
              {hasVouchers ? (
                <div className="space-y-3">
                  {vouchers.map((voucher) => (
                    <div key={voucher.id} className="rounded-2xl border border-border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-fg">{voucher.code}</p>
                          <p className="text-xs text-muted-fg">{voucher.name}</p>
                        </div>
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-300">
                          {voucher.discount_type === "percentage"
                            ? `${voucher.discount_value}%`
                            : formatPrice(voucher.discount_value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-muted px-4 py-8 text-center">
                  <IconDatabaseOff size={28} className="mx-auto mb-3 text-muted-fg" />
                  <p className="text-sm text-muted-fg">Belum ada voucher untuk member ini.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
