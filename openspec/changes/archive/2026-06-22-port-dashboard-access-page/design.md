## Context

The `port-pos-reference-backend` and `port-frontend-remaining-pages` changes ported 79/80 Dashboard pages. The last missing page is `Dashboard/Access.jsx` — a 114-line "access denied" landing page shown to authenticated users who lack the `dashboard-access` permission. The route already exists in `routes/web.php` (line 57-59) and renders `Inertia::render('Dashboard/Access')`, but the page component doesn't exist in the target project, causing a 500 error.

The established adaptation pattern has been proven across 79 ported pages:

- JSX → TSX
- Custom Dashboard UI → Justd components (but this page only uses Link/cards)
- Ziggy `route()` → Wayfinder typed imports
- Tailwind v3 config-based → v4 CSS-first
- `@/Utils/Permission` → `@/lib/auth` and `@/components/permission`
- `DashboardLayout` assignments → target's `@/layouts/dashboard-layout`

## Goals / Non-Goals

**Goals:**

- Port `Access.jsx` → `Access.tsx` following the established pattern
- Match existing ported page conventions (layout assignment, Wayfinder imports, permission checking)
- Resolve the 500 error on `/dashboard/access`

**Non-Goals:**

- No backend changes (route, controller, middleware already exist)
- No UI redesign — this is a faithful port with the established UI adaptation
- No changes to the card data (6 module cards remain the same)
- No new features or capabilities

## Decisions

| Decision             | Choice                                                 | Rationale                                                                                                                                               |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File location**    | `resources/js/pages/Dashboard/Access.tsx` (PascalCase) | The route renders `Dashboard/Access` — Inertia resolves PascalCase path. Matches existing `Categories/`, `Users/`, `StockOpnames/` convention in target |
| **Layout**           | `DashboardLayout` from `@/layouts/dashboard-layout`    | Matches source `DashboardLayout` usage and all other ported page patterns                                                                               |
| **Permission check** | `hasAnyPermission` from `@/components/permission`      | Existing wrapper in target that exposes the same API as source's `hasAnyPermission` from `@/Utils/Permission`                                           |
| **Route linking**    | Wayfinder from `@/routes/...`                          | Standard adaptation — source uses `route()` from Ziggy, target uses typed Wayfinder imports                                                             |
| **Card data**        | Keep same 6 cards (Indonesian labels and all)          | No reason to change labels or links; route names map 1:1 to existing Wayfinder routes                                                                   |
| **Tailwind v4**      | Keep existing class names (they work in v4)            | The source uses standard Tailwind utilities that are backward-compatible in v4; no v3-specific config classes                                           |

## Risks / Trade-offs

| Risk                                                                             | Mitigation                                                                                  |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Wayfinder route for `dashboard.access` might not be named `access` in the import | Already confirmed: `resources/js/routes/dashboard/index.ts` exports `access`                |
| The `dashboard.access` route might have different behavior after port            | Already confirmed: route is a simple GET closure that renders the page, identical to source |
