import { Head, Link, useForm } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconCoins,
  IconCrown,
  IconDatabaseOff,
  IconGift,
  IconReceipt,
  IconTags,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import customers from "@/routes/customers";
import segments from "@/routes/customers/segments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const formatPrice = (value = 0) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const formatDateTime = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "-";

interface Transaction {
  id: number;
  invoice: string;
  date: string;
  total: number;
}

interface Segment {
  id: number;
  name: string;
  source: string;
}

interface RewardHistory {
  id: number;
  reference: string | null;
  type: string;
  notes: string | null;
  points_delta: number;
  created_at: string;
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

interface Customer {
  id: number;
  name: string;
  no_telp: string | null;
  address: string | null;
  member_code: string | null;
  is_loyalty_member: boolean;
  loyalty_tier: string | null;
  loyalty_points: number;
  loyalty_member_since: string | null;
  total_spent: number;
}

interface Stats {
  total_transactions: number;
  total_spent: number;
  last_visit: string | null;
}

interface ManualSegmentOption {
  value: number;
  label: string;
  description: string | null;
}

interface ShowProps {
  customer: Customer;
  segments?: Segment[];
  manualSegmentIds?: number[];
  manualSegmentOptions?: ManualSegmentOption[];
  stats: Stats;
  recentTransactions: Transaction[];
  frequentProducts: Product[];
  rewardHistory: RewardHistory[];
  vouchers: Voucher[];
}

function TierBadge({ tier, isMember }: { tier: string | null; isMember: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-fg">
      <IconCrown size={14} />
      {isMember ? tier : "non-member"}
    </span>
  );
}

function PointsBadge({ points }: { points: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <IconCoins size={14} />
      {points} poin
    </span>
  );
}

function EmptySection({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-muted/50 px-4 py-8 text-center">
      {icon || <IconDatabaseOff size={28} className="mx-auto mb-3 text-muted-fg" />}
      <p className="text-sm text-muted-fg">{title}</p>
    </div>
  );
}

export default function Show({
  customer,
  segments: customerSegments = [],
  manualSegmentIds = [],
  manualSegmentOptions = [],
  stats,
  recentTransactions,
  frequentProducts,
  rewardHistory,
  vouchers,
}: ShowProps) {
  const segmentForm = useForm({ segment_ids: manualSegmentIds });

  const hasRecentTransactions = recentTransactions.length > 0;
  const hasRewardHistory = rewardHistory.length > 0;
  const hasFrequentProducts = frequentProducts.length > 0;
  const hasVouchers = vouchers.length > 0;
  const hasSegments = customerSegments.length > 0;

  const submitSegments = (event: React.FormEvent) => {
    event.preventDefault();
    segmentForm.put(segments.sync.url({ customer: customer.id }), {
      preserveScroll: true,
    });
  };

  return (
    <>
      <Head title={`Pelanggan - ${customer.name}`} />

      <div className="space-y-6">
        <div>
          <Link
            href={customers.index.url()}
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-fg hover:text-primary"
          >
            <IconArrowLeft size={16} />
            Kembali ke Pelanggan
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h1 className="text-2xl font-bold text-fg">{customer.name}</h1>
                <TierBadge tier={customer.loyalty_tier} isMember={customer.is_loyalty_member} />
              </div>
              <p className="text-sm text-muted-fg">
                {customer.no_telp || "-"} {customer.address ? `• ${customer.address}` : ""}
              </p>
              {customer.member_code && (
                <p className="mt-1 text-sm text-muted-fg">Member Code: {customer.member_code}</p>
              )}
            </div>
            <div className="flex gap-2">
              <PointsBadge points={customer.loyalty_points} />
              {!customer.is_loyalty_member && (
                <Link
                  href={customers.upgradeMember.url({ customer: customer.id })}
                  method="post"
                  as="button"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary/90"
                >
                  <IconCrown size={14} />
                  Jadikan Member
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold text-fg">Ringkasan Pelanggan</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">Total Transaksi</p>
                    <p className="mt-2 text-2xl font-bold text-fg">
                      {stats?.total_transactions || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">Total Belanja</p>
                    <p className="mt-2 text-lg font-bold text-fg">
                      {formatPrice(stats?.total_spent || 0)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">Member Sejak</p>
                    <p className="mt-2 text-sm font-semibold text-fg">
                      {customer.loyalty_member_since
                        ? new Date(customer.loyalty_member_since).toLocaleDateString("id-ID")
                        : "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">
                      Kunjungan Terakhir
                    </p>
                    <p className="mt-2 text-sm font-semibold text-fg">
                      {stats?.last_visit
                        ? new Date(stats.last_visit).toLocaleDateString("id-ID")
                        : "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <IconTags size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-fg">Segment Customer</h2>
                </div>
                {hasSegments ? (
                  <div className="flex flex-wrap gap-2">
                    {customerSegments.map((segment) => (
                      <span
                        key={segment.id}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          segment.source === "manual"
                            ? "bg-primary/10 text-primary"
                            : "bg-success/10 text-success"
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
                  <EmptySection title="Customer belum memiliki segment." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <IconReceipt size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-fg">Transaksi Terakhir</h2>
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
                          <p className="text-xs text-muted-fg">
                            {formatDateTime(transaction.date)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-primary">
                          {formatPrice(transaction.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySection title="Belum ada transaksi pelanggan." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <IconGift size={18} className="text-primary" />
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
                                history.points_delta >= 0 ? "text-success" : "text-danger"
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
                  <EmptySection title="Belum ada histori reward." />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold text-fg">Informasi</h2>
                <div className="space-y-3 text-sm text-muted-fg">
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">Tier Loyalty</p>
                    <p className="mt-1 font-semibold text-fg">
                      {customer.is_loyalty_member ? customer.loyalty_tier : "Belum menjadi member"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">Saldo Poin</p>
                    <p className="mt-1 font-semibold text-fg">{customer.loyalty_points} poin</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-fg">
                      Total Nilai Transaksi
                    </p>
                    <p className="mt-1 font-semibold text-fg">
                      {formatPrice(customer.total_spent || stats?.total_spent || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <IconTags size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-fg">Tag Manual</h2>
                </div>
                {manualSegmentOptions.length > 0 ? (
                  <form onSubmit={submitSegments} className="space-y-4">
                    <div className="space-y-3">
                      {manualSegmentOptions.map((segment) => (
                        <label
                          key={segment.value}
                          className="flex items-start gap-3 rounded-xl border border-border bg-muted p-3 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={segmentForm.data.segment_ids.includes(segment.value)}
                            onChange={(event) => {
                              const nextIds = event.target.checked
                                ? [...segmentForm.data.segment_ids, segment.value]
                                : segmentForm.data.segment_ids.filter(
                                    (v: number) => v !== segment.value,
                                  );
                              segmentForm.setData("segment_ids", nextIds);
                            }}
                            className="mt-0.5 rounded border-border text-primary focus:ring-ring"
                          />
                          <div>
                            <p className="font-medium text-fg">{segment.label}</p>
                            {segment.description ? (
                              <p className="text-xs text-muted-fg">{segment.description}</p>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                    {segmentForm.errors.segment_ids && (
                      <p className="text-sm text-danger">{segmentForm.errors.segment_ids}</p>
                    )}
                    <Button type="submit" isDisabled={segmentForm.processing} intent="primary">
                      {segmentForm.processing ? "Menyimpan..." : "Simpan Segment"}
                    </Button>
                  </form>
                ) : (
                  <EmptySection title="Belum ada segment manual yang tersedia." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold text-fg">Produk Favorit</h2>
                {hasFrequentProducts ? (
                  <div className="flex flex-wrap gap-2">
                    {frequentProducts.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {product.title} x{product.total_qty}
                      </span>
                    ))}
                  </div>
                ) : (
                  <EmptySection title="Belum ada data produk favorit." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 text-lg font-semibold text-fg">Voucher</h2>
                {hasVouchers ? (
                  <div className="space-y-3">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className="rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-fg">{voucher.code}</p>
                            <p className="text-xs text-muted-fg">{voucher.name}</p>
                          </div>
                          <span className="text-xs font-medium text-primary">
                            {voucher.discount_type === "percentage"
                              ? `${voucher.discount_value}%`
                              : formatPrice(voucher.discount_value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptySection title="Belum ada voucher untuk pelanggan ini." />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
