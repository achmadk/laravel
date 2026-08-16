import { usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { Sidebar } from "@/layouts/dashboard/sidebar";
import { Flash } from "@/components/flash";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuLabel,
} from "@/components/ui/menu";
import { Link } from "@/components/ui/link";
import {
  IconMenu2,
  IconChevronLeft,
  IconLayoutDashboard,
  IconUser,
  IconLock,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { logout } from "@/routes";
import notifications from "@/routes/notifications";
import type { NotificationsProps } from "@/types/notifications";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const page = usePage<NotificationsProps>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const lowStockCount = page.props.notifications?.low_stock?.length ?? 0;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  const hovering = sidebarCollapsed && sidebarHover;

  return (
    <div className="rubick relative min-h-screen bg-primary dark:bg-bg">
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
        collapsed={sidebarCollapsed}
        hovering={hovering}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      />

      <div
        className={[
          "content relative z-10 h-screen px-7 pt-8 pb-12 transition-[margin] duration-100",
          "before:absolute before:inset-y-4 before:right-4 before:left-4 before:rounded-4xl before:bg-fg before:opacity-[.07] xl:before:left-0",
          "after:absolute after:inset-y-4 after:right-4 after:left-4 after:rounded-4xl after:border after:border-border after:bg-bg xl:after:left-0 dark:after:opacity-[.59]",
          hovering ? "xl:ml-[275px]" : sidebarCollapsed ? "xl:ml-[110px]" : "xl:ml-[275px]",
        ].join(" ")}
      >
        <div className="h-full overflow-x-hidden">
          <div
            onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
            className={[
              "relative z-20 -mr-7 h-full overflow-y-auto pr-11 pb-5 pl-4 transition-[margin] duration-100 xl:pl-0",
              hovering && !sidebarOpen && "-ml-[165px]",
            ].join(" ")}
          >
            <div
              className={[
                "relative z-50 -mt-2",
                scrolled && "sticky top-0 z-[999] mt-0",
              ].join(" ")}
            >
              <header
                className={[
                  "flex h-16 items-center gap-5 border-border border-b transition-all",
                  scrolled && "rounded-2xl border border-border bg-bg px-5 shadow-fg/5 shadow-lg",
                ].join(" ")}
              >
                <Button
                  onPress={toggleSidebar}
                  intent="plain"
                  size="sq-md"
                  aria-label="Toggle sidebar"
                  className="flex size-9 items-center justify-center rounded-xl border border-border bg-bg xl:hidden"
                >
                  <IconMenu2 className="size-5" />
                </Button>

                <Button
                  onPress={toggleCollapse}
                  intent="plain"
                  size="sq-md"
                  aria-label="Collapse sidebar"
                  className="hidden size-9 items-center justify-center rounded-xl border border-border bg-bg xl:flex"
                >
                  <IconChevronLeft
                    className={`size-5 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
                  />
                </Button>

                <div className="hidden h-6 w-px bg-border md:block" />
                <h1 className="mr-auto hidden font-semibold text-base text-fg md:block">
                  Point of Sales
                </h1>

                <div className="hidden items-center gap-2 sm:flex">
                  <ThemeSwitcher />
                  <NotificationBell />
                </div>

                {lowStockCount > 0 && (
                  <Link
                    href={notifications.index.url()}
                    className="hidden items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 font-medium text-danger text-xs sm:flex"
                  >
                    <span className="size-1.5 animate-pulse rounded-full bg-danger" />
                    {lowStockCount} stok habis
                  </Link>
                )}

                <div className="mx-1 hidden h-8 w-px bg-border sm:block" />

                <UserMenu />
              </header>
            </div>

            <main className="pt-5">
              <Flash />
              <div className="space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const { auth } = usePage<any>().props;
  return (
    <Menu>
      <Button intent="plain" isCircle aria-label="User menu" size="sq-md">
        <Avatar src={auth?.user?.gravatar} size="sm" />
      </Button>
      <MenuContent placement="bottom end" className="sm:min-w-56">
        <MenuSection>
          <MenuHeader separator>
            <div>{auth?.user?.name}</div>
            <div className="truncate pr-6 font-normal text-muted-fg text-sm">
              {auth?.user?.email}
            </div>
          </MenuHeader>
        </MenuSection>
        <MenuItem href="/dashboard">
          <IconLayoutDashboard className="size-4" />
          <MenuLabel>Dashboard</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings/profile">
          <IconUser className="size-4" />
          <MenuLabel>Profile</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings/password">
          <IconLock className="size-4" />
          <MenuLabel>Ubah Password</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings/appearance">
          <IconSettings className="size-4" />
          <MenuLabel>Tampilan</MenuLabel>
        </MenuItem>
        <MenuSeparator />
        <MenuItem onAction={() => router.post(logout().url)}>
          <MenuLabel>Logout</MenuLabel>
          <IconLogout className="size-4" />
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
