import DashboardLayout from "@/layouts/dashboard-layout";
import { Head, Link, router } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconBrandWhatsapp,
  IconChecks,
  IconPlayerPlay,
  IconPlayerStop,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import crmCampaigns from "@/routes/crm-campaigns";
import crmCampaignLogs from "@/routes/crm-campaign-logs";
import customers from "@/routes/customers";

interface Customer {
  id: number;
  name: string;
  no_telp: string | null;
}

interface CampaignLog {
  id: number;
  status: string;
  payload: {
    message?: string;
    whatsapp_url?: string;
  } | null;
  customer: Customer | null;
}

interface Campaign {
  id: number;
  name: string;
  type: string;
  status: string;
  processed_at: string | null;
  message_template: string;
  audience_snapshot: unknown[] | null;
  logs: CampaignLog[];
}

interface ShowProps {
  campaign: Campaign;
}

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
};

export default function Show({ campaign }: ShowProps) {
  const processCampaign = () => {
    router.post(crmCampaigns.process(campaign.id).url, undefined, {
      // router.post(route("crm-campaigns.process", campaign.id), undefined, {
      preserveScroll: true,
      onSuccess: () => toast.success("Campaign berhasil diproses"),
      onError: () => toast.error("Gagal memproses campaign"),
    });
  };

  const cancelCampaign = () => {
    router.post(crmCampaigns.cancel(campaign.id).url, undefined, {
      preserveScroll: true,
      onSuccess: () => toast.success("Campaign dibatalkan"),
      onError: () => toast.error("Gagal membatalkan campaign"),
    });
  };

  return (
    <>
      <Head title={campaign.name} />

      <div className="mb-6">
        <Link
          href={crmCampaigns.index().url}
          className="mb-3 inline-flex items-center gap-2 text-smtext-muted-fg hover:text-primary"
        >
          <IconArrowLeft size={16} />
          Kembali ke CRM campaigns
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-bold text-2xl text-fg">{campaign.name}</h1>
            <p className="text-muted-fg text-sm">
              {campaign.type} &bull; status {campaign.status} &bull; diproses{" "}
              {formatDateTime(campaign.processed_at)}
            </p>
          </div>
          <div className="flex gap-2">
            {campaign.status === "draft" && (
              <button
                type="button"
                onClick={processCampaign}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-medium text-sm text-primary-fg hover:bg-primary/90"
              >
                <IconPlayerPlay size={16} />
                Proses Audience
              </button>
            )}
            {campaign.status !== "cancelled" && campaign.status !== "processed" && (
              <button
                type="button"
                onClick={cancelCampaign}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 font-medium text-sm text-white hover:bg-rose-600"
              >
                <IconPlayerStop size={16} />
                Batalkan
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 font-semibold text-fg text-lg">Delivery Logs</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="px-4 py-3 font-semibold text-muted-fg">Customer</th>
                  <th className="px-4 py-3 font-semibold text-muted-fg">Status</th>
                  <th className="px-4 py-3 font-semibold text-muted-fg">Payload</th>
                  <th className="w-36 px-4 py-3 text-center font-semibold text-muted-fg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {campaign.logs.length > 0 ? (
                  campaign.logs.map((log) => (
                    <tr key={log.id} className="border-border border-b">
                      <td className="px-4 py-3">
                        <Link
                          href={log.customer ? customers.show(log.customer.id).url : "#"}
                          className="font-semibold text-fg hover:text-primary"
                        >
                          {log.customer?.name || "Tanpa customer"}
                        </Link>
                        <p className="text-muted-fg text-xs">{log.customer?.no_telp || "-"}</p>
                      </td>
                      <td className="px-4 py-3 text-fg">{log.status}</td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-2 text-fg text-sm">
                          {log.payload?.message || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {log.payload?.whatsapp_url && (
                            <a
                              href={log.payload.whatsapp_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300"
                            >
                              <IconBrandWhatsapp size={16} />
                            </a>
                          )}
                          {log.status !== "sent" && (
                            <button
                              type="button"
                              onClick={() =>
                                router.post(crmCampaignLogs.markSent(log.id).url, undefined, {
                                  preserveScroll: true,
                                })
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-subtle text-primary hover:bg-primary-subtle"
                            >
                              <IconChecks size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-fg text-sm">
                      Belum ada delivery log untuk campaign ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 font-semibold text-fg text-lg">Audience Snapshot</h2>
            <div className="rounded-2xl bg-muted p-4">
              <pre className="overflow-x-auto whitespace-pre-wrap text-fg text-xs">
                {JSON.stringify(campaign.audience_snapshot || [], null, 2)}
              </pre>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg p-5">
            <h2 className="mb-4 font-semibold text-fg text-lg">Template Pesan</h2>
            <p className="whitespace-pre-wrap text-fg text-sm">
              {campaign.message_template || "-"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
