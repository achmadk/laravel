import { useMemo } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { IconEye, IconFileSearch } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import auditLogsRouter from "@/routes/audit-logs";
import { Pagination } from "@/components/dashboard/pagination";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface AuditLog {
  id: number;
  user: { id: number; name: string; email: string } | null;
  module: string;
  event: string;
  target_label: string | null;
  description: string;
  created_at: string;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface AuditLogsResponse {
  data: AuditLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface UserOption {
  id: number;
  name: string;
}

interface IndexProps {
  auditLogs: AuditLogsResponse;
  filters: {
    user_id?: string;
    module?: string;
    event?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
  users?: UserOption[];
  modules?: string[];
  events?: string[];
}

export default function Index({
  auditLogs,
  filters,
  users = [],
  modules = [],
  events = [],
}: IndexProps) {
  const currentFilters = useMemo(
    () => ({
      user_id: filters?.user_id || "",
      module: filters?.module || "",
      event: filters?.event || "",
      date_from: filters?.date_from || "",
      date_to: filters?.date_to || "",
      search: filters?.search || "",
    }),
    [filters],
  );

  function updateFilters(nextFilters: typeof currentFilters) {
    router.get(auditLogsRouter.index().url, nextFilters, {
      preserveState: true,
      replace: true,
    });
  }

  return (
    <>
      <Head title="Audit Log" />

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
          <IconFileSearch size={28} className="text-primary" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-fg">
          Histori aktivitas sensitif untuk investigasi operasional dan administratif.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 md:grid-cols-3">
        <select
          value={currentFilters.user_id}
          onChange={(e) => updateFilters({ ...currentFilters, user_id: e.target.value })}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Aktor</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.module}
          onChange={(e) => updateFilters({ ...currentFilters, module: e.target.value })}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Modul</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>

        <select
          value={currentFilters.event}
          onChange={(e) => updateFilters({ ...currentFilters, event: e.target.value })}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Event</option>
          {events.map((eventName) => (
            <option key={eventName} value={eventName}>
              {eventName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={currentFilters.date_from}
          onChange={(e) => updateFilters({ ...currentFilters, date_from: e.target.value })}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
        />

        <input
          type="date"
          value={currentFilters.date_to}
          onChange={(e) => updateFilters({ ...currentFilters, date_to: e.target.value })}
          className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
        />

        <input
          type="text"
          value={currentFilters.search}
          onChange={(e) => updateFilters({ ...currentFilters, search: e.target.value })}
          placeholder="Cari target atau deskripsi"
          className="h-11 rounded-xl border border-input bg-muted px-4 text-sm text-fg outline-none transition focus:border-ring focus:ring-2 focus:ring-ring placeholder:text-muted-fg"
        />
      </div>

      <div className="bg-bg rounded-lg border border-border overflow-hidden">
        <div className="p-4 rounded-t-lg border-b bg-bg border-border">
          <div className="flex items-center gap-2 font-semibold text-sm text-fg">Histori Audit</div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted border-border">
              <tr>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                  Waktu
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                  Aktor
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                  Modul
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                  Event
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                  Target
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-fg">
                  Deskripsi
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-fg w-20">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y bg-bg divide-border">
              {auditLogs.data.length > 0 ? (
                auditLogs.data.map((log) => (
                  <tr key={log.id} className="hover:bg-muted transition-colors">
                    <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="whitespace-nowrap p-4 align-middle">
                      <div>
                        <p className="font-medium text-fg">{log.user?.name || "System"}</p>
                        <p className="text-xs text-muted-fg">{log.user?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                      {log.module}
                    </td>
                    <td className="whitespace-nowrap p-4 align-middle">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-fg">
                        {log.event}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                      {log.target_label || "-"}
                    </td>
                    <td className="whitespace-nowrap p-4 align-middle text-muted-fg">
                      {log.description}
                    </td>
                    <td className="whitespace-nowrap p-4 align-middle text-center">
                      <Link
                        href={auditLogsRouter.show({ auditLog: log.id }).url}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg hover:bg-muted"
                      >
                        <IconEye size={14} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-fg">Belum ada data audit log.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination links={auditLogs.links} />
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
