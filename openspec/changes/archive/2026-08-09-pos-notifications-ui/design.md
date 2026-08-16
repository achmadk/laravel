# Design

## Goal

Make rtos's dashboard notification bell functional and give it a real destination page, reusing the already-ported backend (`notifications` shared prop, `NotificationController`, `ProductNotificationRead`).

## Decisions

### 1. Data source: the existing shared `notifications` prop (no query changes)

`HandleInertiaRequests` already shares (inside `if ($request->user())`):

```ts
notifications: {
  low_stock:    {id, title, stock, time}[]        // stock <= 0, unread-tracked, max 10
  receivables:  {id, title, customer_id, due_date, remaining, total, paid, status, time}[]  // max 5
  payables:     {id, title, supplier_id, due_date, remaining, total, paid, status, time}[]  // max 5
}
```

- Cap counts are server-fixed (10/5/5). A "full list" page query (`per_page` etc.) is a **later enhancement** — v1 renders exactly what the shared props carry, on both surfaces. This keeps v1 to pure frontend + one route.
- **Badge count**: computed client-side as `low_stock.length + receivables.length + payables.length`. Do NOT add a `total` key server-side (avoids touching the middleware).

### 2a. Bell dropdown (header) — port of pos-reference, adapted

Source: `pos-reference/resources/js/Components/Dashboard/Notification.jsx` (headlessui `Menu`/`Transition`, 600px desktop dropdown, mobile slide-in drawer, icons rose/amber/emerald, "Dibaca" + "Tandai dibaca" actions, optimistic local removal).

rtos adaptations:
- **No headlessui** → use rtos-aria: implement as a self-contained component with `useState` open/close, outside-click close (ref + pointerdown listener, same pattern as rtos dropdowns), Escape to close. No new dependency.
- **Wayfinder instead of ziggy**: `notifications.stock.read.url()` and `notifications.stock.readAll.url()` via `router.post(..., {preserveScroll: true, preserveState: true})`.
- **Nested props**: read `usePage().props.notifications` (default `{}`), derive the three arrays with `?? []`.
- Items merge: stock entries get `id: 'stock-'+id`, `originalId`, type; Piutang/Hutang map as-is. Mark-read only posts for `type === 'stock'` (matches backend — receivable/payable have no read endpoint).
- "Lihat semua" link (`Link href={notifications.index.url()}`) inside dropdown → page.
- Component file: `resources/js/components/dashboard/notification-bell.tsx`; mounted in `dashboard-layout.tsx` header replacing the dead `<Link href="/notifications">`.

### 2b. `/dashboard/notifications` page

- Route: `GET /dashboard/notifications` inside the existing `dashboard` auth+permission group in `routes/web.php`, name `notifications.index`, permission gate matching sibling dashboard routes (e.g. `permission:notifications-access` — **new permission, seeded per app pattern**; fallback if user lacks it: route just requires auth like the bell — decide: gate it with the same permission used by dashboard-access? See open Q below).
- Controller: add `index()` to existing `app/Http/Controllers/NotificationController.php` → `Inertia::render('Dashboard/Notifications/Index', ['notifications' => <same shape as shared>])`. Simplest: read the same three arrays from the shared-building logic. To avoid duplicating the query logic, extract the three builders into a small `App\Services\NotificationService` (query+eager only, ~60 lines) used by BOTH `HandleInertiaRequests` and `NotificationController::index`. (Alternative: pass `'notifications' => null` and let the page read `usePage().props.notifications` — zero duplication. **Take this** for v1: controller renders page with `['notifications' => null]` place-holder is wrong though; better: page reads shared props only, controller sends nothing extra. But explicit is better for a routed page — page can merge: `const items = page.props.notifications ?? {}`.)
- Page `resources/js/pages/Dashboard/Notifications/Index.tsx`: `DashboardLayout`, `PageHeader` ("Notifikasi", description with total), three `Card` sections (Stok habis / Piutang / Hutang) each a list with icon, title, subtitle, time, per-item "Baca" button, plus per-section or global "Tandai semua dibaca" for stock. Uses existing ui kit (Card, Button, EmptyState, Badge). Table/pagination: none in v1 (server cap already).
- "Stok Menipis" pill in dashboard-layout: `Link` to `notifications.index.url()`.

### 3. Types

`resources/js/types/pos.ts` (add) or a new `types/notifications.ts`:
- `NotificationItem { id: number|string; title: string; subtitle?: string; stock?: number; time?: string|null; status?: string; originalId?: number; type?: 'stock'|'receivable'|'payable' }`
- `NotificationsProps { low_stock: NotificationItem[]; receivables: NotificationItem[]; payables: NotificationItem[] }`

### 4. Open questions (flag to user before implementation)

1. **Permission gate**: does `/dashboard/notifications` belong to an existing permission (e.g. dashboard-access), or a new `notifications-access`? pos-reference had the bell unconditional in layout (no permission). Suggest: no separate permission — reuse the dashboard group auth; keep bell for all authenticated dashboard users. 
2. **Page route shape**: `/dashboard/notifications` (dashboard group) — confirm.
3. Per-item mark-read on the page calls same `notifications.stock.read` (stock only); receivable/payable items show no action (matches backend).

## Files touched

- `routes/web.php` (+1 route)
- `app/Http/Controllers/NotificationController.php` (+index)
- `resources/js/layouts/dashboard-layout.tsx` (bell blocks)
- new `resources/js/components/dashboard/notification-bell.tsx`
- new `resources/js/pages/Dashboard/Notifications/Index.tsx`
- new `resources/js/types/notifications.ts`
- tests: `tests/Feature/Apps/NotificationsTest.php` (route returns Inertia page + props filtered by permission; maybe mark-read already covered)