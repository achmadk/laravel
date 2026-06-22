## Why

The `port-pos-reference-backend` and `port-frontend-remaining-pages` changes ported 79/80 Dashboard pages from `pos-reference`. The one remaining page — `Dashboard/Access.jsx` — is a small "access denied" fallback that users land on when they lack dashboard-level permissions. The route (`/dashboard/access`) already exists in `routes/web.php` but returns a 500 error because the Inertia page component doesn't exist in the target project yet.

## What Changes

- Port `Access.jsx` (114 lines) from `../pos-reference/resources/js/Pages/Dashboard/Access.jsx` → `resources/js/pages/Dashboard/Access.tsx`
- Apply the established adaptation pattern: JSX → TSX, `route()` → Wayfinder, `DashboardLayout` → target layout, `hasAnyPermission` from `@/Utils/Permission` → `@/components/permission`, Tailwind v3 → v4
- No backend, route, or config changes — the `dashboard.access` route is already registered and functional
- No database changes

## Capabilities

### New Capabilities

- `dashboard-access-page`: Simple "access denied" page showing a grid of module cards filtered by the user's actual permissions. Serves as the landing page for users who have authenticated but lack the `dashboard-access` permission.

### Modified Capabilities

- None — no existing specs are affected

## Impact

- **New file**: `resources/js/pages/Dashboard/Access.tsx` (~110 lines TSX)
- **No backend changes**: Route, controller, middleware already exist
- **No dependency changes**: @tabler/icons-react already installed; Wayfinder already generated
- **Fixes**: Resolves a 500 error on `/dashboard/access` route
