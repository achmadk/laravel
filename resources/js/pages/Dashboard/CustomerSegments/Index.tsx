import { useEffect, useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  IconUsersGroup,
  IconCirclePlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconAlertCircle,
} from "@tabler/icons-react";
import DashboardLayout from "@/layouts/dashboard-layout";
import toast from "react-hot-toast";
import { useAuthorization } from "@/lib/auth";
import customerSegments from "@/routes/customer-segments";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Segment {
  id: number;
  name: string;
  description: string | null;
  slug: string;
  type: string;
  is_active: boolean;
  memberships_count: number;
}

interface SegmentsResponse {
  data: Segment[];
  links: PaginationLink[];
  last_page: number;
}

interface IndexProps {
  segments: SegmentsResponse;
  filters?: { search?: string; type?: string };
}

export default function CustomerSegmentsIndex({ segments, filters = {} }: IndexProps) {
  const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
  const { can } = useAuthorization();
  const hasData = segments.data.length > 0;

  const [search, setSearch] = useState(filters.search || "");
  const [type, setType] = useState(filters.type || "");

  useEffect(() => {
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
  }, [flash]);

  function applyFilter(e: React.FormEvent) {
    e.preventDefault();
    router.get(
      customerSegments.index.url(),
      { search, type },
      { preserveScroll: true, preserveState: true },
    );
  }

  function handleDelete(url: string) {
    if (confirm("Hapus segment ini?")) {
      router.delete(url, { preserveScroll: true });
    }
  }

  return (
    <>
      <Head title="Customer Segments" />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 font-bold text-2xl text-fg">
              <IconUsersGroup size={26} className="text-primary" />
              Customer Segments
            </h1>
            <p className="text-smtext-muted-fg">
              Kelola tag manual dan auto segment untuk CRM dan automation.
            </p>
          </div>
          {can("customer-segments-create") && (
            <Link
              href={customerSegments.create.url()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-sm text-primary-fg shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              <IconCirclePlus size={18} />
              Buat Segment
            </Link>
          )}
        </div>

        <form
          onSubmit={applyFilter}
          className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-3"
        >
          <div className="relative w-full sm:col-span-2">
            <IconSearch
              size={18}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama segment..."
              className="h-11 w-full rounded-xl border border-border bg-muted pr-3 pl-10 text-sm"
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-muted px-3 text-sm"
          >
            <option value="">Semua Tipe</option>
            <option value="manual">Manual</option>
            <option value="auto">Auto</option>
          </select>
        </form>

        <div className="rounded-2xl border-0 bg-transparent shadow-none sm:overflow-hidden sm:border sm:border-border sm:bg-bg">
          <div className="hidden w-full overflow-x-auto sm:block">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-12 gap-2 border-border border-b px-3 py-3 font-semiboldtext-muted-fg text-xs uppercase tracking-wider sm:px-4">
                <div className="col-span-4">Segment</div>
                <div className="col-span-2">Tipe</div>
                <div className="col-span-2">Anggota</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-center">Aksi</div>
              </div>
              {hasData ? (
                segments.data.map((segment) => (
                  <div
                    key={segment.id}
                    className="grid grid-cols-12 items-center gap-2 border-border border-b px-3 py-3 transition-colors hover:bg-muted sm:px-4"
                  >
                    <div className="col-span-4">
                      <Link
                        href={customerSegments.show.url({ customer_segment: segment.id })}
                        className="font-semibold text-fg text-sm hover:text-primary"
                      >
                        {segment.name}
                      </Link>
                      <p className="text-muted-fg text-xs">{segment.description || segment.slug}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 font-semibold text-fg text-xs">
                        {segment.type}
                      </span>
                    </div>
                    <div className="col-span-2 text-fg text-sm">{segment.memberships_count}</div>
                    <div className="col-span-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 font-semibold text-xs ${
                          segment.is_active
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-fg"
                        }`}
                      >
                        {segment.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center gap-1">
                      {can("customer-segments-update") && (
                        <Link
                          href={customerSegments.edit.url({ customer_segment: segment.id })}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
                        >
                          <IconPencil size={14} />
                        </Link>
                      )}
                      {can("customer-segments-delete") && (
                        <button
                          onClick={() =>
                            handleDelete(
                              customerSegments.destroy.url({ customer_segment: segment.id }),
                            )
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-centertext-muted-fg">
                  <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                  Belum ada data segment customer.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-1 sm:hidden">
            {hasData ? (
              segments.data.map((segment) => (
                <div
                  key={segment.id}
                  className="space-y-3 rounded-xl border border-border bg-bg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link
                        href={customerSegments.show.url({ customer_segment: segment.id })}
                        className="font-semibold text-fg text-sm hover:text-primary"
                      >
                        {segment.name}
                      </Link>
                      <p className="text-xstext-muted-fg">{segment.description || segment.slug}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 font-semibold text-xs ${
                        segment.is_active
                          ? "bg-success-subtle text-success"
                          : "bg-muted text-muted-fg"
                      }`}
                    >
                      {segment.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xstext-muted-fg">Tipe</p>
                      <p className="font-medium text-fg">
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 font-semibold text-muted-fg text-xs">
                          {segment.type}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xstext-muted-fg">Anggota</p>
                      <p className="font-medium text-fg">{segment.memberships_count}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    {can("customer-segments-update") && (
                      <Link
                        href={customerSegments.edit.url({ customer_segment: segment.id })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600"
                      >
                        <IconPencil size={14} />
                      </Link>
                    )}
                    {can("customer-segments-delete") && (
                      <button
                        onClick={() =>
                          handleDelete(
                            customerSegments.destroy.url({ customer_segment: segment.id }),
                          )
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600"
                      >
                        <IconTrash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-bg p-6 text-centertext-muted-fg">
                <IconAlertCircle size={28} className="mx-auto mb-2 text-muted-fg" />
                Belum ada data segment customer.
              </div>
            )}
          </div>
        </div>

        {segments.last_page > 1 && (
          <ul className="flex items-center justify-end gap-1">
            {segments.links.map((link, i) =>
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

CustomerSegmentsIndex.layout = (page: React.ReactNode) => <DashboardLayout children={page} />;
