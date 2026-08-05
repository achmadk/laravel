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
  IconBell,
  IconLayoutDashboard,
  IconUser,
  IconLock,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { logout } from "@/routes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const page = usePage<any>();
  const { auth, notifications: pageNotifications, flash } = page.props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const notificationCount = pageNotifications?.total ?? 0;
  const lowStockCount = pageNotifications?.low_stock?.length ?? 0;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar sidebarOpen={sidebarOpen} onClose={closeSidebar} collapsed={sidebarCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-border border-b bg-bg px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              onPress={toggleSidebar}
              intent="plain"
              size="sq-sm"
              aria-label="Toggle sidebar"
              className="md:hidden"
            >
              <IconMenu2 className="size-5" />
            </Button>

            <Button
              onPress={toggleCollapse}
              intent="plain"
              size="sq-sm"
              aria-label="Collapse sidebar"
              className="hidden md:flex"
            >
              <IconMenu2 className="size-5" />
            </Button>

            <div className="hidden h-6 w-px bg-border md:block" />
            <h1 className="hidden font-semibold text-base text-fg md:block">Point of Sales</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <ThemeSwitcher />
            </div>

            <Link
              href="/notifications"
              className="relative flex rounded-xl p-2.5 text-muted-fg transition-colors hover:bg-muted hover:text-fg"
              aria-label="Notifications"
            >
              <IconBell className="size-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-danger font-bold text-[10px] text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>

            {lowStockCount > 0 && (
              <Link
                href="/products"
                className="hidden items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-1.5 font-medium text-danger text-xs sm:flex"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-danger" />
                {lowStockCount} stok habis
              </Link>
            )}

            <div className="mx-1 h-8 w-px bg-border" />

            <UserMenu />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Flash />
          <div className="space-y-6 p-4 md:p-6 lg:p-8">{children}</div>
        </main>
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
