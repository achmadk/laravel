import type { ReactNode } from "react";
import { useAuthorization } from "@/lib/auth";

interface PermissionProps {
  permission?: string | string[];
  fallback?: ReactNode;
  children: ReactNode;
}

export default function Permission({ permission, fallback = null, children }: PermissionProps) {
  const { canAny, isSuperAdmin } = useAuthorization();

  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  if (!permission) {
    return <>{children}</>;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];

  if (canAny(permissions)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export function hasAnyPermission(permissions: string[]): boolean {
  const { canAny, isSuperAdmin } = useAuthorization();
  if (isSuperAdmin()) return true;
  return canAny(permissions);
}
