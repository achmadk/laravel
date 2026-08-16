import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconHistory,
  IconSearch,
  IconCalendar,
  IconAlertCircle,
  IconChartBar,
  IconUsers,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { toast } from "sonner";
import receivables from "@/routes/receivables";
import transactions from "@/routes/transactions";
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

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

interface ReceivableItem {
  id: number;
  invoice: string;
  transaction_id: number | null;
  total: number;
  remaining: number;
  paid: number;
  due_date: string;
  status: string;
  customer: { name: string } | null;
}

interface ReceivablesResponse {
  data: ReceivableItem[];
  total: number;
  links: PaginationLink[];
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface AgingBucket {
  bucket: string;
  remaining: number;
  count: number;
}

interface TopCustomer {
  id: number;
  name: string;
  remaining: number;
  total_receivable: number;
}

interface AgingData {
  collection_rate: {
    total_receivables_amount: number;
    total_paid_amount: number;
    collection_rate: number;
    paid_count: number;
    total_count: number;
  };
  aging_summary: AgingBucket[];
  top_customers: TopCustomer[];
}

interface IndexProps {
  receivables: ReceivablesResponse;
  filters?: { invoice?: string; status?: string };
}

function ReceivableBadge({ value }: { value: string }) {
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

export default function ReceivablesIndex({ receivables: data, filters = {} }: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const [search, setSearch] = useState(filters.invoice || "");
  const [status, setStatus] = useState(filters.status || "");
  const [activeTab, setActiveTab] = useState("list");
  const [agingData, setAgingData] = useState<AgingData | null>(null);
  const [loadingAging, setLoadingAging] = useState(false);

  useEffect(() => {
    if (flash?.success) toast.success(flash.success as string);
    if (flash?.error) toast.error(flash.error as string);
  }, [flash]);

  useEffect(() => {
    if (activeTab !== "aging" || agingData) return;
    setLoadingAging(true);
    fetch(receivables.aging.url())
      .then((res) => res.json())
      .then((json: AgingData) => {
        setAgingData(json);
        setLoadingAging(false);
      })
      .catch(() => {
        setLoadingAging(false);
        toast.error("Gagal memuat data aging");
      });
  }, [activeTab, agingData]);

  const bucketClasses: Record<string, string> = {
    current: "bg-success/10 text-success",
    "0-30": "bg-success/10 text-success",
    "31-60": "bg-warning/10 text-warning",
    "61-90": "bg-warning text-warning-fg",
    "90+": "bg-danger/10 text-danger",
  };

  const bucketLabels: Record<string, string> = {
    current: "Belum Jatuh Tempo",
    "0-30": "1-30 Hari",
    "31-60": "31-60 Hari",
    "61-90": "61-90 Hari",
    "90+": "90+ Hari",
  };

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      receivables.index.url(),
      { invoice: search, status },
      { preserveScroll: true, preserveState: true },
    );
  }

  const rows = data?.data || [];

  return (
    <>
      <Head title="Nota Barang" />
      <div className="space-y-6">
        <PageHeader
          title="Nota Barang (Piutang)"
          description="Pantau piutang pelanggan dan pembayaran parsialnya."
          icon={<IconHistory size={20} />}
          actions={
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-border bg-muted p-1">
                <Button
                  intent={activeTab === "list" ? "primary" : "plain"}
                  size="sq-sm"
                  onPress={() => setActiveTab("list")}
                >
                  Daftar
                </Button>
                <Button
                  intent={activeTab === "aging" ? "primary" : "plain"}
                  size="sq-sm"
                  onPress={() => setActiveTab("aging")}
                >
                  <IconChartBar size={16} />
                  Aging
                </Button>
              </div>
              <Link href={transactions.index.url()}>
                <Button intent="primary">Buat Dari POS</Button>
              </Link>
            </div>
          }
        />

        {activeTab === "aging" ? (
          <div className="space-y-6">
            {loadingAging ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2"></div>
              </div>
            ) : agingData ? (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="p-5">
                      <p className="font-medium text-muted-fg text-xs uppercase tracking-wide">
                        Total Piutang
                      </p>
                      <p className="mt-2 font-bold text-2xl text-fg">
                        {formatCurrency(agingData.collection_rate?.total_receivables_amount || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="font-medium text-muted-fg text-xs uppercase tracking-wide">
                        Sudah Dibayar
                      </p>
                      <p className="mt-2 font-bold text-2xl text-success">
                        {formatCurrency(agingData.collection_rate?.total_paid_amount || 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="font-medium text-muted-fg text-xs uppercase tracking-wide">
                        Collection Rate
                      </p>
                      <p className="mt-2 font-bold text-2xl text-primary">
                        {agingData.collection_rate?.collection_rate || 0}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5">
                      <p className="font-medium text-muted-fg text-xs uppercase tracking-wide">
                        Lunas / Total
                      </p>
                      <p className="mt-2 font-bold text-2xl text-fg">
                        {agingData.collection_rate?.paid_count || 0} /{" "}
                        {agingData.collection_rate?.total_count || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="mb-4 font-semibold text-fg text-lg">Aging Piutang</h3>
                        <div className="space-y-3">
                          {agingData.aging_summary?.map((bucket) => (
                            <div key={bucket.bucket} className="flex items-center justify-between">
                              <span
                                className={`rounded-full px-2.5 py-1 font-semibold text-xs ${bucketClasses[bucket.bucket] || "bg-muted text-muted-fg"}`}
                              >
                                {bucketLabels[bucket.bucket] || bucket.bucket}
                              </span>
                              <div className="text-right">
                                <p className="font-bold text-fg text-sm">
                                  {formatCurrency(bucket.remaining)}
                                </p>
                                <p className="text-muted-fg text-xs">{bucket.count} nota</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-3">
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg text-lg">
                          <IconUsers size={20} />
                          Pelanggan Terbesar
                        </h3>
                        <div className="space-y-3">
                          {agingData.top_customers?.length > 0 ? (
                            agingData.top_customers.map((customer) => (
                              <div
                                key={customer.id}
                                className="flex items-center justify-between border-border border-b py-2 last:border-0"
                              >
                                <div>
                                  <p className="font-medium text-fg">{customer.name}</p>
                                  <p className="text-muted-fg text-xs">Piutang</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-warning">
                                    {formatCurrency(customer.remaining)}
                                  </p>
                                  <p className="text-muted-fg text-xs">
                                    Total: {formatCurrency(customer.total_receivable)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="py-4 text-center text-muted-fg text-sm">
                              Belum ada data piutang.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <>
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
                  placeholder="Cari invoice / nomor nota"
                  className="h-11 w-full rounded-xl border border-input bg-muted pr-3 pl-10 text-fg text-sm placeholder:text-muted-fg"
                />
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

            <Card>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-12 border-border border-b px-4 py-3 font-semibold text-muted-fg text-xs uppercase tracking-wider">
                      <div className="col-span-2">Invoice</div>
                      <div className="col-span-2">Pelanggan</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-2 text-right">Sisa</div>
                      <div className="col-span-2 text-right">Jatuh Tempo</div>
                      <div className="col-span-2 text-center">Status</div>
                    </div>
                    {rows.length > 0 ? (
                      rows.map((item) => (
                        <Link
                          key={item.id}
                          href={receivables.show.url({ receivable: item.id })}
                          className="grid grid-cols-12 items-center gap-2 border-border border-b px-4 py-3 transition-colors hover:bg-muted"
                        >
                          <div className="col-span-2">
                            <p className="font-semibold text-fg text-sm">{item.invoice}</p>
                            {item.transaction_id && (
                              <p className="text-[11px] text-muted-fg">
                                POS #{item.transaction_id}
                              </p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-fg text-sm">{item.customer?.name || "Umum"}</p>
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
                          <div className="col-span-2 flex justify-center">
                            <ReceivableBadge value={item.status} />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-fg">
                        <IconAlertCircle size={28} className="mx-auto mb-2" />
                        Belum ada data nota barang.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {data?.links && data.links.length > 3 && <Pagination links={data.links} />}
          </>
        )}
      </div>
    </>
  );
}

ReceivablesIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
