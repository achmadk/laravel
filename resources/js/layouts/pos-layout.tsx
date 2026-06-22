import { PropsWithChildren } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft, IconShoppingCart } from "@tabler/icons-react";

export default function POSLayout({ children }: PropsWithChildren) {
  const { props, component } = usePage();
  const auth = (props as Record<string, unknown>).auth as {
    user: { data: { id: number; name: string; email: string } };
  };
  const storeProfile = (props as Record<string, unknown>).storeProfile as {
    name: string;
    address: string | null;
    phone: string | null;
  } | null;
  const activeCashierShift = (props as Record<string, unknown>).activeCashierShift as {
    id: number;
    cashier_id: number;
    opened_at: string;
    initial_balance: number;
  } | null;

  const pageTitle =
    typeof component === "string" ? component.replace("Dashboard/", "").replace("/", " - ") : "POS";

  return (
    <>
      <Head title={`${pageTitle} - ${storeProfile?.name || "POS"}`} />

      <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IconArrowLeft size={20} className="text-slate-500 dark:text-slate-400" />
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <IconShoppingCart size={20} className="text-primary-500" />
              <div>
                <h1 className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                  {storeProfile?.name || "POS"}
                </h1>
                {activeCashierShift && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Shift aktif · Buka{" "}
                    {new Date(activeCashierShift.opened_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCashierShift ? (
              <span className="px-2.5 py-1 rounded-full bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                Shift Aktif
              </span>
            ) : (
              <Link
                href="/apps/cashier-shifts/create"
                className="px-3 py-1.5 rounded-lg bg-warning-100 dark:bg-warning-900/50 text-warning-700 dark:text-warning-400 text-xs font-medium hover:bg-warning-200 dark:hover:bg-warning-900 transition-colors"
              >
                Buka Shift
              </Link>
            )}

            <Link
              href={route("profile.edit")}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {auth.user.data?.name?.charAt(0)?.toUpperCase() ?? "-"}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </>
  );
}

function route(name: string): string {
  const routes: Record<string, string> = {
    "profile.edit": "/profile",
  };
  return routes[name] || "/";
}
