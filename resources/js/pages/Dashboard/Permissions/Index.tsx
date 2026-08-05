import { Head, router, usePage } from "@inertiajs/react";
import { IconKey, IconShield } from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import permissionsRoute from "@/routes/permissions";
import { Pagination } from "@/components/dashboard/pagination";
import { EmptyState } from "@/components/dashboard/empty-state";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Permission {
  id: number;
  name: string;
}

interface PermissionsResponse {
  data: Permission[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

export default function Index() {
  const { permissions } = usePage().props as unknown as { permissions: PermissionsResponse };

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    router.get(
      permissionsRoute.index.url({ query: { search } }),
      {},
      { preserveState: true, replace: true },
    );
  }

  return (
    <>
      <Head title="Hak Akses" />

      <div className="mb-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconKey size={28} className="text-primary" />
              Hak Akses
            </h1>
            <p className="text-muted-fg text-sm">
              {permissions.total || permissions.data?.length || 0} hak akses terdaftar
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 w-full sm:w-80">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            name="search"
            placeholder="Cari hak akses..."
            className="h-11 w-full rounded-xl border border-input bg-muted px-4 text-fg text-sm outline-none transition placeholder:text-muted-fg focus:border-ring focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      {permissions.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {permissions.data.map((permission) => (
            <div
              key={permission.id}
              className="rounded-xl border border-border bg-bg p-4 transition-all hover:border-primary hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <IconShield size={16} className="text-primary" />
                </div>
                <span className="truncate font-medium text-fg text-sm">{permission.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Hak Akses"
          description="Hak akses tidak ditemukan."
          icon={<IconKey size={32} className="text-muted-fg" strokeWidth={1.5} />}
        />
      )}

      {permissions.last_page !== 1 && permissions.last_page !== undefined && (
        <Pagination links={permissions.links} />
      )}
    </>
  );
}

Index.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
