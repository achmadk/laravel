import { usePage } from "@inertiajs/react";
import { Fragment, useState } from "react";
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
  hovering: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function checkPermission(perms: Record<string, boolean>, name?: string): boolean {
  if (!name) return true;
  return perms[name] === true;
}

export function Sidebar({
  sidebarOpen,
  onClose,
  collapsed,
  hovering,
  onMouseEnter,
  onMouseLeave,
}: SidebarProps) {
  const page = usePage<any>();
  const { auth, storeProfile } = page.props;
  const permissions: Record<string, boolean> = page.props.permissions || {};

  const storeName = storeProfile?.name || "KASIR";
  const storeLogo = storeProfile?.logo || null;
  const storeInitial =
    storeName.charAt(0).toUpperCase() || auth?.user?.name?.charAt(0)?.toUpperCase() || "K";

  const expanded = !collapsed || hovering;

  return (
    <>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 cursor-default bg-black/80 backdrop-blur xl:hidden"
        />
      )}
      <aside
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={[
          "side-menu fixed top-0 left-0 z-50 h-screen bg-primary transition-[margin] duration-100 dark:bg-bg",
          sidebarOpen ? "ml-0" : "-ml-[275px]",
          "xl:ml-0",
          collapsed && "side-menu--collapsed",
          hovering && "side-menu--on-hover",
        ].join(" ")}
      >
        <div
          className={[
            "side-menu__content relative z-20 flex h-screen w-[275px] flex-col pt-5 pb-[7.5rem] transition-[width] duration-100",
            collapsed && !hovering && "xl:w-[110px]",
          ].join(" ")}
        >
          <div className="relative z-10 hidden h-[65px] w-full flex-none items-center overflow-hidden px-6 xl:flex">
            {storeLogo ? (
              <img src={storeLogo} alt={storeName} className="size-5 rounded-md object-cover" />
            ) : (
              <div className="flex size-5 flex-none items-center justify-center rounded-md bg-primary-fg/20 dark:bg-fg/20">
                <span className="font-bold text-[10px] text-primary-fg dark:text-fg">
                  {storeInitial}
                </span>
              </div>
            )}
            <span
              className={[
                "ml-3.5 text-nowrap transition-opacity",
                !expanded && "xl:opacity-0",
              ].join(" ")}
            >
              <span className="font-medium text-base text-primary-fg dark:text-fg">
                {storeName}
              </span>
            </span>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 [-webkit-mask-composite:_destination-in] [-webkit-mask-image:_linear-gradient(to_top,_rgba(0,_0,_0,_0),_black_30px),_linear-gradient(to_bottom,_rgba(0,_0,_0,_0),_black_30px)]">
            <ul className="scrollable">
              {menuNavigation.map((section) => {
                const hasAccess = section.details.some((d) =>
                  checkPermission(permissions, d.permission),
                );
                if (!hasAccess) return null;

                return (
                  <Fragment key={section.title}>
                    <li className="side-menu__group-label">{section.title}</li>
                    {section.details.map((detail) => {
                      if (!checkPermission(permissions, detail.permission)) return null;
                      if (detail.subdetails) {
                        return (
                          <li key={detail.title}>
                            <SidebarDropdown
                              item={detail}
                              permissions={permissions}
                              onNavigate={onClose}
                            />
                          </li>
                        );
                      }
                      const href = detail.href ? resolveUrl(detail.href) : "#";

                      return (
                        <li key={detail.title}>
                          <SidebarLink
                            title={detail.title}
                            icon={detail.icon}
                            href={href}
                            onNavigate={onClose}
                          />
                        </li>
                      );
                    })}
                  </Fragment>
                );
              })}
            </ul>
          </nav>

          <div className="absolute inset-x-0 bottom-0 mb-8 px-4">
            <p
              className={[
                "text-center text-[10px] transition-opacity",
                !expanded && "xl:opacity-0",
              ].join(" ")}
            >
              <span className="text-primary-fg/60 dark:text-fg/40">Point of Sales v2.0</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  title,
  icon,
  href,
  onNavigate,
}: {
  title: string;
  icon?: string;
  href: string;
  onNavigate: () => void;
}) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isActive = pathname === href;
  const Icon = icon ? iconMap[icon] : null;

  return (
    <Link
      href={href}
      onPress={onNavigate}
      className={["side-menu__link", isActive && "side-menu__link--active"].join(" ")}
    >
      {Icon && <Icon className="side-menu__link__icon" />}
      <div className="side-menu__link__title">{title}</div>
    </Link>
  );
}

function SidebarDropdown({
  item,
  permissions,
  onNavigate,
}: {
  item: MenuItem;
  permissions: Record<string, boolean>;
  onNavigate: () => void;
}) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const hasActiveSub =
    item.subdetails?.some((s) => s.href && pathname === resolveUrl(s.href)) ?? false;
  const [isOpen, setIsOpen] = useState(hasActiveSub);
  const Icon = item.icon ? iconMap[item.icon] : null;
  const hasAccess = item.subdetails?.some((s) => checkPermission(permissions, s.permission));
  if (!hasAccess) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={[
          "side-menu__link w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left font-normal",
          hasActiveSub && "side-menu__link--active",
        ].join(" ")}
      >
        {Icon && <Icon className="side-menu__link__icon" />}
        <div className="side-menu__link__title">{item.title}</div>
        <IconChevronDown
          className={[
            "side-menu__link__chevron transition-transform duration-300",
            isOpen && "rotate-180",
          ].join(" ")}
        />
      </button>
      <ul className={isOpen ? "block" : "hidden"}>
        {item.subdetails?.map((sub) => {
          if (!checkPermission(permissions, sub.permission)) return null;
          const subHref = sub.href ? resolveUrl(sub.href) : "#";
          const isSubActive = pathname === subHref;
          return (
            <li key={sub.title}>
              <Link
                href={subHref}
                onPress={onNavigate}
                className={[
                  "side-menu__link",
                  isSubActive && "side-menu__link--active",
                ].join(" ")}
              >
                <div className="side-menu__link__title">{sub.title}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
