import { Head, Link } from "@inertiajs/react";
import {
  IconArrowLeft,
  IconDeviceDesktopAnalytics,
  IconHistory,
  IconUser,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import auditLogs from "@/routes/audit-logs";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value as any);
}

function KeyValueTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data || {});

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-fg">
        Tidak ada data.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="min-w-full divide-y divide-border">
        <tbody className="divide-y divide-border bg-bg">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="w-64 bg-muted px-4 py-3 text-sm font-medium text-fg">{key}</td>
              <td className="px-4 py-3 text-sm text-muted-fg">
                <pre className="whitespace-pre-wrap break-words font-sans">
                  {renderValue(value)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface AuditLogDetail {
  id: number;
  user: { id: number; name: string; email: string } | null;
  module: string;
  event: string;
  target_label: string | null;
  auditable_type: string | null;
  auditable_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  description: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

interface ShowProps {
  auditLog: AuditLogDetail;
}

export default function Show({ auditLog }: ShowProps) {
  return (
    <>
      <Head title={`Audit Log ${auditLog.id}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
              <IconHistory size={28} className="text-primary" />
              Detail Audit Log
            </h1>
            <p className="text-sm text-muted-fg">
              Event {auditLog.event} pada modul {auditLog.module}.
            </p>
          </div>
          <Link
            href={auditLogs.index.url()}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-fg hover:bg-muted"
          >
            <IconArrowLeft size={18} />
            Kembali
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-border bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Waktu</p>
            <p className="mt-2 text-sm font-semibold text-fg">
              {formatDateTime(auditLog.created_at)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-fg">
              <IconUser size={14} />
              Aktor
            </p>
            <p className="mt-2 text-sm font-semibold text-fg">{auditLog.user?.name || "System"}</p>
            <p className="text-xs text-muted-fg">{auditLog.user?.email || "-"}</p>
          </div>
          <div className="rounded-2xl border border-border bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">Target</p>
            <p className="mt-2 text-sm font-semibold text-fg">{auditLog.target_label || "-"}</p>
            <p className="text-xs text-muted-fg">
              {auditLog.auditable_type || "-"}#{auditLog.auditable_id || "-"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-bg p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-fg">
              <IconDeviceDesktopAnalytics size={14} />
              Client
            </p>
            <p className="mt-2 text-sm font-semibold text-fg">{auditLog.ip_address || "-"}</p>
            <p className="line-clamp-2 text-xs text-muted-fg">{auditLog.user_agent || "-"}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <p className="text-sm font-semibold text-fg">Deskripsi</p>
          <p className="mt-2 text-sm text-muted-fg">{auditLog.description}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-fg">Before</h2>
            <KeyValueTable data={auditLog.before || {}} />
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-fg">After</h2>
            <KeyValueTable data={auditLog.after || {}} />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-fg">Meta</h2>
          <KeyValueTable data={auditLog.meta || {}} />
        </div>
      </div>
    </>
  );
}

Show.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
