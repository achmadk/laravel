import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonStyles } from "@/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuHeader,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuLabel,
} from "@/components/ui/menu";
import {
  Navbar,
  NavbarGap,
  NavbarItem,
  NavbarMobile,
  NavbarProvider,
  NavbarSection,
  NavbarSpacer,
  NavbarStart,
  NavbarTrigger,
} from "@/components/ui/navbar";
import { Logo } from "@/components/logo";
import type { SharedData } from "@/types/shared";
import { Link } from "@/components/ui/link";
import { ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { logout } from "@/routes";

const defaultNavigations = [
  {
    name: "Home",
    textValue: "Home",
    href: "/",
  },
];

const authNavigations = [
  {
    name: "Home",
    textValue: "Home",
    href: "/home",
  },
];

export function AppNavbar({ children, ...props }: React.ComponentProps<typeof Navbar>) {
  const page = usePage();
  const { auth } = usePage<SharedData>().props;
  const [isOpen, setIsOpen] = useState(false);
  const navigations = auth.user ? authNavigations : defaultNavigations;
  useEffect(() => setIsOpen(false), [page.url]);
  return (
    <NavbarProvider isOpen={isOpen} onOpenChange={setIsOpen}>
      <Navbar {...props}>
        <NavbarStart>
          <Link href={auth.user ? "/home" : "/"} aria-label="Goto homepage">
            <Logo />
          </Link>
        </NavbarStart>
        <NavbarGap />

        <NavbarSection>
          {navigations.map((item) => (
            <NavbarItem isCurrent={item.href === page.url} key={item.href} href={item.href}>
              {item.name}
            </NavbarItem>
          ))}
          <NavbarItem target="_blank" href="https://intentui.com" className="justify-between">
            Documentation
          </NavbarItem>
          <NavbarItem target="_blank" href="https://design.intentui.com">
            Blocks
          </NavbarItem>
        </NavbarSection>
        <NavbarSpacer />
        <NavbarSection className="ml-auto hidden gap-x-2 lg:flex">
          {auth.user ? (
            <UserMenu />
          ) : (
            <>
              <NavbarItem href="/login">Login</NavbarItem>
              <NavbarItem href="/register">Register</NavbarItem>
            </>
          )}
        </NavbarSection>
      </Navbar>
      <NavbarMobile>
        <NavbarTrigger />
        <NavbarSpacer />
        <NavbarSection>
          {auth.user ? (
            <UserMenu />
          ) : (
            <NavbarItem
              className={buttonStyles({
                intent: "outline",
                size: "sm",
              })}
              href="/login"
            >
              Login
            </NavbarItem>
          )}
        </NavbarSection>
      </NavbarMobile>
    </NavbarProvider>
  );
}

function UserMenu() {
  const { auth } = usePage<SharedData>().props;
  return (
    <Menu>
      <Button size="sq-md" intent="plain" isCircle aria-label="Open menu">
        <Avatar src={auth.user.gravatar} size="sm" />
      </Button>
      <MenuContent placement="bottom end" className="sm:min-w-56">
        <MenuSection>
          <MenuHeader separator className="relative">
            <div>{auth.user.name}</div>
            <div className="truncate whitespace-nowrap pr-6 font-normal text-muted-fg text-sm">
              {auth.user.email}
            </div>
          </MenuHeader>
        </MenuSection>
        <MenuItem href="/dashboard">
          <MenuLabel>Dashboard</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings/profile" className="justify-between">
          <MenuLabel>Update profile</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings/password" className="justify-between">
          <MenuLabel>Change password</MenuLabel>
        </MenuItem>
        <MenuItem href="/settings/appearance" className="justify-between">
          <MenuLabel>Appearance</MenuLabel>
        </MenuItem>
        <MenuSeparator />
        <MenuItem onAction={() => router.post(logout().url)}>
          <MenuLabel>Logout</MenuLabel>
          <ArrowRightEndOnRectangleIcon />
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
