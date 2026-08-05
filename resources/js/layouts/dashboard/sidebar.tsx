import { usePage } from "@inertiajs/react";
import { useState } from "react";
import { Link } from "@/components/ui/link";
import { menuNavigation, type MenuItem } from "@/lib/menu";
import { resolveUrl } from "@/lib/route-resolver";
import {
  IconChevronDown,
  IconLayoutDashboard,
  IconBox,
  IconFolder,
  IconUsersPlus,
  IconBuildingWarehouse,
  IconShoppingCart,
  IconClockHour6,
  IconFileCertificate,
  IconFileInvoice,
  IconChartBar,
  IconFileDescription,
  IconChartArrowsVertical,
  IconClipboardCheck,
  IconTruckDelivery,
  IconTruckReturn,
  IconCurrencyDollar,
  IconCrown,
  IconChartInfographic,
  IconCreditCard,
  IconUsers,
  IconSpeakerphone,
  IconBuildingStore,
  IconGift,
  IconWallet,
  IconFileSearch,
  IconUserBolt,
  IconUserShield,
  IconTable,
  IconCirclePlus,
} from "@tabler/icons-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  IconLayout2: IconLayoutDashboard,
  IconFolder,
  IconBox,
  IconUsersPlus,
  IconBuildingWarehouse,
  IconShoppingCart,
  IconClockHour6,
  IconFileCertificate,
  IconFileInvoice,
  IconChartBar,
  IconChartBarPopular: IconChartBar,
  IconChartInfographic,
  IconFileDescription,
  IconChartArrowsVertical,
  IconClipboardCheck,
  IconTruckDelivery,
  IconTruckReturn,
  IconCurrencyDollar,
  IconCrown,
  IconCreditCard,
  IconUsers,
  IconSpeakerphone,
  IconBuildingStore,
  IconGift,
  IconWallet,
  IconFileSearch,
  IconUserBolt,
  IconUserShield,
  IconTable,
  IconCirclePlus,
};

interface SidebarProps {
  sidebarOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
}

function checkPermission(perms: Record<string, boolean>, name?: string): boolean {
  if (!name) return true;
  return perms[name] === true;
}

export function Sidebar({ sidebarOpen, onClose, collapsed }: SidebarProps) {
  const page = usePage<any>();
  const { auth, storeProfile } = page.props;
  const permissions: Record<string, boolean> = page.props.permissions || {};

  const storeName = storeProfile?.name || "KASIR";
  const storeLogo = storeProfile?.logo || null;
  const storeInitial =
    storeName.charAt(0).toUpperCase() || auth?.user?.name?.charAt(0)?.toUpperCase() || "K";

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col",
          "border-border border-r bg-bg",
          "transition-all duration-300 ease-in-out",
          "md:sticky md:top-0 md:shrink-0 md:self-stretch",
          sidebarOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full",
          "md:translate-x-0",
          collapsed ? "md:w-[72px]" : "md:w-[260px]",
        ].join(" ")}
      >
        <div className="flex h-16 shrink-0 items-center justify-center border-border border-b">
          {collapsed ? (
            storeLogo ? (
              <img src={storeLogo} alt={storeName} className="size-9 rounded-md object-cover" />
            ) : (
              <div className="flex size-9 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-fg">
                <span className="font-bold text-sm text-white">{storeInitial}</span>
              </div>
            )
          ) : (
            <div className="flex w-full items-center gap-2 px-4">
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="size-10 rounded-md object-cover" />
              ) : (
                <div className="flex size-10 items-center justify-center bg-gradient-to-br from-primary to-primary-fg">
                  <span className="font-bold text-sm text-white">{storeInitial}</span>
                </div>
              )}
              <span className="truncate font-bold text-fg text-lg">{storeName}</span>
            </div>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          {menuNavigation.map((section) => {
            const hasAccess = section.details.some((d) =>
              checkPermission(permissions, d.permission),
            );
            if (!hasAccess) return null;

            return (
              <div key={section.title} className="mb-2">
                {!collapsed && (
                  <div className="px-2 py-2">
                    <span className="font-bold text-[10px] text-muted-fg uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                )}
                <div className={collapsed ? "flex flex-col items-center" : "space-y-0.5"}>
                  {section.details.map((detail) => {
                    if (!checkPermission(permissions, detail.permission)) return null;
                    if (detail.subdetails) {
                      return (
                        <SidebarDropdown
                          key={detail.title}
                          item={detail}
                          collapsed={collapsed}
                          permissions={permissions}
                          onNavigate={onClose}
                        />
                      );
                    }
                    const href = detail.href ? resolveUrl(detail.href) : "#";

                    return (
                      <SidebarLink
                        key={detail.title}
                        title={detail.title}
                        icon={detail.icon}
                        href={href}
                        collapsed={collapsed}
                        onNavigate={onClose}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="border-border border-t p-4">
            <p className="text-center text-[10px] text-muted-fg">Point of Sales v2.0</p>
          </div>
        )}
      </aside>
    </>
  );
}

function SidebarLink({
  title,
  icon,
  href,
  collapsed,
  onNavigate,
}: {
  title: string;
  icon?: string;
  href: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = pathname === href;
  const Icon = icon ? iconMap[icon] : null;

  return (
    <Link
      href={href}
      onPress={onNavigate}
      className={[
        "flex items-center gap-3 rounded-lg font-medium text-sm transition-all duration-200",
        isActive
          ? "relative bg-primary/10 font-semibold text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-r-full before:bg-primary"
          : "text-muted-fg hover:bg-muted hover:text-fg",
        collapsed ? "flex-col gap-1 px-0 py-3 text-[10px]" : "px-3 py-2.5",
      ].join(" ")}
    >
      {Icon && <Icon className="size-5 shrink-0" />}
      {collapsed ? (
        <span className="truncate text-[10px]">{title}</span>
      ) : (
        <span className="truncate">{title}</span>
      )}
    </Link>
  );
}

function SidebarDropdown({
  item,
  collapsed,
  permissions,
  onNavigate,
}: {
  item: MenuItem;
  collapsed: boolean;
  permissions: Record<string, boolean>;
  onNavigate: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon ? iconMap[item.icon] : null;
  const hasAccess = item.subdetails?.some((s) => checkPermission(permissions, s.permission));
  if (!hasAccess) return null;

  if (collapsed) {
    return (
      <div className="group relative">
        <div className="flex cursor-pointer flex-col items-center px-0 py-3 text-[10px] text-muted-fg transition-colors hover:text-fg">
          {Icon && <Icon className="size-5" />}
          <span className="mt-1 truncate">{item.title}</span>
        </div>
        <div className="invisible absolute top-0 left-full z-50 ml-2 translate-x-[-8px] opacity-0 transition-all delay-100 duration-200 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100 group-hover:delay-0">
          <div className="w-48 rounded-lg border border-border bg-bg py-2 shadow-lg">
            {item.subdetails?.map((sub) => {
              if (!checkPermission(permissions, sub.permission)) return null;
              const subHref = sub.href ? resolveUrl(sub.href) : "#";
              const pathname = typeof window !== "undefined" ? window.location.pathname : "";
              const isSubActive = pathname === subHref;
              return (
                <Link
                  key={sub.title}
                  href={subHref}
                  onPress={onNavigate}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    isSubActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-fg hover:bg-muted hover:text-fg"
                  }`}
                >
                  {sub.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-medium text-muted-fg text-sm transition-colors hover:bg-muted hover:text-fg"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="size-5 shrink-0" />}
          <span>{item.title}</span>
        </div>
        <IconChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mt-0.5 ml-4 space-y-0.5 border-border border-l-2 pl-2">
          {item.subdetails?.map((sub) => {
            if (!checkPermission(permissions, sub.permission)) return null;
            const subHref = sub.href ? resolveUrl(sub.href) : "#";
            const pathname = typeof window !== "undefined" ? window.location.pathname : "";
            const isSubActive = pathname === subHref;
            return (
              <Link
                key={sub.title}
                href={subHref}
                onPress={onNavigate}
                className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                  isSubActive
                    ? "relative bg-primary/10 font-medium text-primary before:absolute before:inset-y-1.5 before:-left-2 before:w-0.5 before:rounded-r-full before:bg-primary"
                    : "text-muted-fg hover:bg-muted hover:text-fg"
                }`}
              >
                {sub.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
