import { usePage } from "@inertiajs/react";

export interface AuthState {
  permissions: Record<string, boolean>;
  super: boolean;
}

export function resolveAuthorizationState(auth: any = {}): AuthState {
  return {
    permissions: auth?.permissions ?? {},
    super: auth?.super === true,
  };
}

export function isSuperAdmin(auth: any = {}): boolean {
  return resolveAuthorizationState(auth).super;
}

export function can(permission: string, auth: any = {}): boolean {
  if (!permission) return true;
  const state = resolveAuthorizationState(auth);
  return state.super || state.permissions?.[permission] === true;
}

export function canAny(permissions: string[] = [], auth: any = {}): boolean {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  return permissions.some((p) => can(p, auth));
}

export function canAll(permissions: string[] = [], auth: any = {}): boolean {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }
  return permissions.every((p) => can(p, auth));
}

export function useAuthorization() {
  const { auth } = usePage().props as any;

  return {
    auth,
    can: (permission: string) => can(permission, auth),
    canAny: (permissions: string[]) => canAny(permissions, auth),
    canAll: (permissions: string[]) => canAll(permissions, auth),
    isSuperAdmin: () => isSuperAdmin(auth),
  };
}
