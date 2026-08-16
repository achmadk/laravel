import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconMailForward,
  IconCirclePlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconAlertCircle,
  IconPlayerPlayFilled,
  IconPlayerStopFilled,
  IconEye,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { toast } from "sonner";
import { useAuthorization } from "@/lib/auth";
import crmCampaigns from "@/routes/crm-campaigns";

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

interface Campaign {
  id: number;
  name: string;
  type: string;
  channel: string;
  status: string;
  audience_count: number;
  starts_at: string | null;
  created_at: string;
}

interface CampaignsResponse {
  data: Campaign[];
  links: PaginationLink[];
  last_page: number;
}

interface Summary {
  total: number;
  active: number;
  draft: number;
  completed: number;
}

interface IndexProps {
  campaigns: CampaignsResponse;
  filters?: { search?: string; status?: string };
  summary?: Summary;
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return {
        label: "Aktif",
        className: "bg-success/15 text-success",
      };
    case "draft":
      return {
        label: "Draft",
        className: "bg-muted text-muted-fg",
      };
    case "completed":
      return {
        label: "Selesai",
        className: "bg-info/15 text-info",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        className: "bg-danger/15 text-danger",
      };
    default:
      return {
        label: status,
        className: "bg-muted text-muted-fg",
      };
  }
}

export default function CrmCampaignsIndex({
  campaigns,
  filters = {},
  summary = {} as Summary,
}: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { can } = useAuthorization();
  const hasData = campaigns.data.length > 0;

  const [search, setSearch] = useState(filters.search || "");
  const [status, setStatus] = useState(filters.status || "");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      crmCampaigns.index.url(),
      { search, status },
      { preserveScroll: true, preserveState: true },
    );
  }

  function handleDelete(url: string) {
    if (confirm("Hapus campaign ini?")) {
      router.delete(url, { preserveScroll: true });
    }
  }

  function handleProcess(id: number) {
    router.post(crmCampaigns.process.url({ crmCampaign: id }), {}, { preserveScroll: true });
  }

  function handleCancel(id: number) {
    router.post(crmCampaigns.cancel.url({ crmCampaign: id }), {}, { preserveScroll: true });
  }

  const summaryCards = [
    { label: "Total", value: summary.total || 0 },
    { label: "Aktif", value: summary.active || 0 },
    { label: "Draft", value: summary.draft || 0 },
    { label: "Selesai", value: summary.completed || 0 },
  ];

  return (
    <>
      <Head title="CRM Campaigns" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconMailForward size={26} className="text-primary" />
              CRM Campaigns
            </h1>
            <p className="text-smtext-muted-fg">
              Kelola campaign marketing dan automation untuk customer.
            </p>
          </div>
          {can("crm-campaigns-create") && (
            <Link
              href={crmCampaigns.create.url()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-sm text-primary-fg shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              <IconCirclePlus size={18} />
              Buat Campaign
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
          className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-[1fr_220px]"
        >
          <div className="relative w-full">
            <IconSearch
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari campaign..."
              className="h-11 w-full rounded-xl border border-border bg-muted pr-3 pl-10 text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </form>

        <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-border sm:bg-bg">
          <div className="hidden w-full overflow-x-auto sm:block">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-12 gap-2 border-border border-b px-3 py-3 font-semiboldtext-muted-fg text-xs uppercase tracking-wider sm:px-4">
                <div className="col-span-3">Campaign</div>
                <div className="col-span-2">Channel</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Mulai</div>
                <div className="col-span-2 text-center">Aksi</div>
              </div>
              {hasData ? (
                campaigns.data.map((campaign) => {
                  const badge = statusBadge(campaign.status);
                  return (
                    <div
                      key={campaign.id}
                      className="grid grid-cols-12 items-center gap-2 border-border border-b px-3 py-3 transition-colors hover:bg-muted sm:px-4"
                    >
                      <div className="col-span-3">
                        <Link
                          href={crmCampaigns.show({ crm_campaign: campaign.id }).url}
                          className="font-semibold text-fg text-sm hover:text-primary"
                        >
                          {campaign.name}
                        </Link>
                        <p className="text-muted-fg text-xs capitalize">{campaign.type}</p>
                      </div>
                      <div className="col-span-2 text-fg text-sm capitalize">
                        {campaign.channel}
                      </div>
                      <div className="col-span-2 text-fg text-sm">
                        {campaign.audience_count} penerima
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 font-semibold text-xs ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="col-span-1 text-muted-fg text-sm">
                        {formatDate(campaign.starts_at)}
                      </div>
                      <div className="col-span-2 flex justify-center gap-1">
                        <Link
                          href={crmCampaigns.show.url({ crm_campaign: campaign.id })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-fg hover:bg-muted"
                        >
                          <IconEye size={14} />
                        </Link>
                        {can("crm-campaigns-update") && campaign.status === "draft" && (
                          <Link
                            href={crmCampaigns.edit.url({ crm_campaign: campaign.id })}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                          >
                            <IconPencil size={14} />
                          </Link>
                        )}
                        {campaign.status === "draft" && (
                          <button
                            onClick={() => handleProcess(campaign.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success hover:bg-success/20"
                            title="Proses campaign"
                          >
                            <IconPlayerPlayFilled size={14} />
                          </button>
                        )}
                        {campaign.status === "active" && (
                          <button
                            onClick={() => handleCancel(campaign.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                            title="Batalkan campaign"
                          >
                            <IconPlayerStopFilled size={14} />
                          </button>
                        )}
                        {can("crm-campaigns-delete") && (
                          <button
                            onClick={() =>
                              handleDelete(crmCampaigns.destroy.url({ crm_campaign: campaign.id }))
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
                  Belum ada data campaign.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1 sm:hidden">
            {hasData ? (
              campaigns.data.map((campaign) => {
                const badge = statusBadge(campaign.status);
                return (
                  <div
                    key={campaign.id}
                    className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Link
                          href={crmCampaigns.show.url({ crm_campaign: campaign.id })}
                          className="font-semibold text-fg text-sm hover:text-primary"
                        >
                          {campaign.name}
                        </Link>
                        <p className="text-xstext-muted-fg capitalize">
                          {campaign.type} · {campaign.channel}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-semibold text-xs ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-fg text-sm">
                      {campaign.audience_count} penerima · Mulai {formatDate(campaign.starts_at)}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Link
                        href={crmCampaigns.show.url({ crm_campaign: campaign.id })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-fg"
                      >
                        <IconEye size={14} />
                      </Link>
                      {can("crm-campaigns-update") && campaign.status === "draft" && (
                        <Link
                          href={crmCampaigns.edit.url({ crm_campaign: campaign.id })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                        >
                          <IconPencil size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-border bg-bg p-6 text-centertext-muted-fg">
                <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada data campaign.
              </div>
            )}
          </div>
        </div>

        {campaigns.last_page > 1 && (
          <ul className="flex items-center justify-end gap-1">
            {campaigns.links.map((link, i) =>
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
      </div>
    </>
  );
}

CrmCampaignsIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
