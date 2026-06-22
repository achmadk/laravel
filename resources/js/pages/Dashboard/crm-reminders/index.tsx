import { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconBellRinging, IconBrandWhatsapp, IconAlertCircle } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
// import crmReminders from "@/routes/crm-reminders";
import crmCampaigns from "@/routes/crm-campaigns";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface CampaignLog {
  id: number;
  payload: { whatsapp_url?: string } | null;
  customer: { name: string } | null;
}

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  logs: CampaignLog[];
}

interface CampaignsResponse {
  data: Campaign[];
  links: PaginationLink[];
  last_page: number;
}

interface IndexProps {
  campaigns: CampaignsResponse;
  filters?: { type?: string; status?: string };
}

export default function CrmRemindersIndex({ campaigns, filters = {} }: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const hasData = campaigns.data.length > 0;

  const [type, setType] = useState(filters.type || "");
  const [status, setStatus] = useState(filters.status || "");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  // function handleFilterChange(key: string, value: string) {
  //   router.get(
  //     crmReminders.index().url,
  //     { ...filters, [key]: value },
  //     { preserveState: true, replace: true },
  //   );
  // }

  return (
    <>
      <Head title="CRM Reminders" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-fg flex items-center gap-2">
            <IconBellRinging size={26} className="text-primary-500" />
            CRM Reminders
          </h1>
          <p className="text-smtext-muted-fg">
            Queue reminder internal untuk piutang, repeat order, invoice share, dan promo broadcast.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-bg border border-border rounded-2xl p-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-sm"
          >
            <option value="">Semua Tipe</option>
            <option value="promo_broadcast">Promo Broadcast</option>
            <option value="invoice_share">Invoice Share</option>
            <option value="due_date_reminder">Due Date Reminder</option>
            <option value="repeat_order_reminder">Repeat Order Reminder</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-border bg-muted text-sm"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="ready">Ready</option>
            <option value="processed">Processed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-transparent border-0 shadow-none rounded-2xl sm:bg-bg sm:border sm:border-border sm:overflow-hidden">
          <div className="w-full overflow-x-auto hidden sm:block">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-3 text-xs font-semiboldtext-muted-fg uppercase tracking-wider border-b border-border">
                <div className="col-span-4">Campaign</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Target</div>
                <div className="col-span-4">Aksi Cepat</div>
              </div>
              {hasData ? (
                campaigns.data.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="grid grid-cols-12 gap-2 px-3 sm:px-4 py-3 items-center border-b border-border hover:bg-muted transition-colors"
                  >
                    <div className="col-span-4">
                      <Link
                        href={crmCampaigns.show(campaign.id).url}
                        className="font-semibold text-sm text-fg hover:text-primary"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xs text-muted-fg">{campaign.type}</p>
                    </div>
                    <div className="col-span-2 text-sm text-fg capitalize">{campaign.status}</div>
                    <div className="col-span-2 text-sm text-fg">
                      {campaign.logs?.length || 0} target
                    </div>
                    <div className="col-span-4 flex flex-wrap gap-2">
                      {campaign.logs?.slice(0, 2).map((log) =>
                        log.payload?.whatsapp_url ? (
                          <a
                            key={log.id}
                            href={log.payload.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/30 px-3 py-2 text-xs font-semibold text-green-700 dark:text-green-300 hover:bg-green-100"
                          >
                            <IconBrandWhatsapp size={14} />
                            {log.customer?.name || "WhatsApp"}
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-centertext-muted-fg">
                  <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                  Belum ada reminder atau campaign queue.
                </div>
              )}
            </div>
          </div>

          <div className="sm:hidden flex flex-col gap-3 px-1">
            {hasData ? (
              campaigns.data.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 space-y-3 bg-bg border border-border rounded-xl shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link
                        href={crmCampaigns.show(campaign.id).url}
                        className="text-sm font-semibold text-fg hover:text-primary-600"
                      >
                        {campaign.name}
                      </Link>
                      <p className="text-xstext-muted-fg">{campaign.type}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-fg capitalize">
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xstext-muted-fg">{campaign.logs?.length || 0} target</p>
                    <div className="flex gap-1">
                      {campaign.logs?.slice(0, 2).map((log) =>
                        log.payload?.whatsapp_url ? (
                          <a
                            key={log.id}
                            href={log.payload.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                          >
                            <IconBrandWhatsapp size={12} />
                            {log.customer?.name || "WA"}
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-centertext-muted-fg bg-bg border border-border rounded-xl">
                <IconBellRinging size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada reminder atau campaign queue.
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

CrmRemindersIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
