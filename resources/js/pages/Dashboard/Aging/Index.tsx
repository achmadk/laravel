import type { PageProps } from "@inertiajs/core";
import { Head, Link, usePage } from "@inertiajs/react";
import {
  IconAlertTriangle,
  IconChartBar,
  IconClock,
  IconTruck,
  IconReceipt,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import payables from "@/routes/payables";
import receivables from "@/routes/receivables";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";

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

interface AgingBucket {
  bucket: string;
  remaining: number;
  count: number;
}

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  subtitle: string;
}

interface AgingPageProps extends PageProps {
  payableAgingSummary?: AgingBucket[];
  receivableAgingSummary?: AgingBucket[];
  payableNotifications?: NotificationItem[];
  receivableNotifications?: NotificationItem[];
}

function agingBucketLabel(bucket: string) {
  const map: Record<string, string> = {
    current: "Belum Jatuh Tempo",
    "0-30": "1-30 Hari",
    "31-60": "31-60 Hari",
    "61-90": "61-90 Hari",
    "90+": "90+ Hari",
    paid: "Lunas",
  };
  return map[bucket] || bucket;
}

function agingBucketClass(bucket: string) {
  const map: Record<string, string> = {
    current: "bg-success/10 text-success",
    "0-30": "bg-success/10 text-success",
    "31-60": "bg-warning/10 text-warning",
    "61-90": "bg-warning text-warning-fg",
    "90+": "bg-danger/10 text-danger",
    paid: "bg-muted text-muted-fg",
  };
  return map[bucket] || "bg-muted text-muted-fg";
}

export default function AgingIndex() {
  const {
    payableAgingSummary = [],
    receivableAgingSummary = [],
    payableNotifications = [],
    receivableNotifications = [],
  } = usePage<AgingPageProps>().props;

  const payableTotalOutstanding = payableAgingSummary.reduce((s, b) => s + (b.remaining || 0), 0);
  const receivableTotalOutstanding = receivableAgingSummary.reduce(
    (s, b) => s + (b.remaining || 0),
    0,
  );

  const payablesDueSoon = payableNotifications.length;
  const receivablesDueSoon = receivableNotifications.length;

  const payableOverdue =
    (payableAgingSummary.find((b) => b.bucket === "90+")?.remaining || 0) +
    (payableAgingSummary.find((b) => b.bucket === "61-90")?.remaining || 0);

  const receivableOverdue =
    (receivableAgingSummary.find((b) => b.bucket === "90+")?.remaining || 0) +
    (receivableAgingSummary.find((b) => b.bucket === "61-90")?.remaining || 0);

  return (
    <>
      <Head title="Aging & Pengingat" />
      <div className="space-y-6">
        <PageHeader
          title="Aging & Pengingat"
          description="Ringkasan piutang dan hutang berdasarkan aging bucket, plus pengingat jatuh tempo."
          icon={<IconChartBar size={20} />}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-danger/10">
                  <IconTruck size={20} className="text-danger" />
                </div>
                <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
                  Total Hutang
                </p>
              </div>
              <p className="text-2xl font-bold text-fg">
                {formatCurrency(payableTotalOutstanding)}
              </p>
              <p className="text-xs text-muted-fg mt-1">{payablesDueSoon} akan jatuh tempo</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconReceipt size={20} className="text-primary" />
                </div>
                <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
                  Total Piutang
                </p>
              </div>
              <p className="text-2xl font-bold text-fg">
                {formatCurrency(receivableTotalOutstanding)}
              </p>
              <p className="text-xs text-muted-fg mt-1">{receivablesDueSoon} akan jatuh tempo</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <IconAlertTriangle size={20} className="text-warning" />
                </div>
                <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
                  Hutang Overdue
                </p>
              </div>
              <p className="text-2xl font-bold text-warning">{formatCurrency(payableOverdue)}</p>
              <p className="text-xs text-muted-fg mt-1">61+ hari</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-danger/10">
                  <IconReceipt size={20} className="text-danger" />
                </div>
                <p className="text-xs font-semibold text-muted-fg uppercase tracking-wide">
                  Piutang Overdue
                </p>
              </div>
              <p className="text-2xl font-bold text-danger">{formatCurrency(receivableOverdue)}</p>
              <p className="text-xs text-muted-fg mt-1">61+ hari</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
                  <IconTruck size={20} className="text-danger" />
                  Aging Hutang Supplier
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3 mb-6">
                  {payableAgingSummary.length > 0 ? (
                    payableAgingSummary.map((bucket) => (
                      <div key={bucket.bucket} className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${agingBucketClass(bucket.bucket)}`}
                        >
                          {agingBucketLabel(bucket.bucket)}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-fg">
                            {formatCurrency(bucket.remaining)}
                          </p>
                          <p className="text-xs text-muted-fg">{bucket.count} nota</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-fg text-center py-4">Belum ada data hutang.</p>
                  )}
                </div>

                {payableNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-fg mb-3 flex items-center gap-1.5">
                      <IconClock size={16} className="text-warning" />
                      Akan Jatuh Tempo
                    </h3>
                    <div className="space-y-2">
                      {payableNotifications.map((item) => (
                        <Link
                          key={item.id}
                          href={payables.show.url({ payable: item.id })}
                          className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-fg">{item.title}</p>
                            <p className="text-xs text-muted-fg">{item.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-warning">{item.subtitle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-fg flex items-center gap-2">
                  <IconReceipt size={20} className="text-primary" />
                  Aging Piutang Pelanggan
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3 mb-6">
                  {receivableAgingSummary.length > 0 ? (
                    receivableAgingSummary.map((bucket) => (
                      <div key={bucket.bucket} className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${agingBucketClass(bucket.bucket)}`}
                        >
                          {agingBucketLabel(bucket.bucket)}
                        </span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-fg">
                            {formatCurrency(bucket.remaining)}
                          </p>
                          <p className="text-xs text-muted-fg">{bucket.count} nota</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-fg text-center py-4">
                      Belum ada data piutang.
                    </p>
                  )}
                </div>

                {receivableNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-fg mb-3 flex items-center gap-1.5">
                      <IconClock size={16} className="text-warning" />
                      Akan Jatuh Tempo
                    </h3>
                    <div className="space-y-2">
                      {receivableNotifications.map((item) => (
                        <Link
                          key={item.id}
                          href={receivables.show.url({ receivable: item.id })}
                          className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-fg">{item.title}</p>
                            <p className="text-xs text-muted-fg">{item.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-warning">{item.subtitle}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

AgingIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
