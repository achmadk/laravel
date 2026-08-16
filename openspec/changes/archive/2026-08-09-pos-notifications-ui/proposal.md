# Why

`pos-reference` ships a notification bell dropdown (low stock, outstanding receivables, outstanding payables) that rtos already supports **backend-side** — the shared `notifications` prop, `NotificationController` (mark-read / mark-all), `ProductNotificationRead` model + routes (`notifications.stock.read` / `notifications.stock.readAll`) were ported earlier. But the frontend was never brought over:

- `resources/js/layouts/dashboard-layout.tsx` renders a bell with a **dead link** (`href="/notifications"` — no such route/page exists), and
- its badge reads `pageNotifications?.total`, but the backend shares `notifications.{low_stock, receivables, payables}` with **no `total` key** — so the badge always shows 0.

Users can't see low-stock or due-payment alerts. This change completes the port: the bell becomes a real dropdown (parity with pos-reference) and the dead link becomes a real notifications page.

# What Changes

- **Bell dropdown in the dashboard header**: port of `pos-reference/resources/js/Components/Dashboard/Notification.jsx` (desktop dropdown + mobile drawer, icons per type, per-item "Baca" + "Tandai semua dibaca"), adapted to rtos conventions:
  - headlessui → rtos react-aria / hand-rolled toggle (headlessui is NOT installed in rtos)
  - ziggy `route('...')` → Wayfinder `notifications.stock.read.url()`
  - flat props → rtos's nested `notifications.{low_stock, receivables, payables}` shared prop
  - badge count computed client-side from the 3 array lengths (drop dependence on a server `total`)
- **New `/dashboard/notifications` page**: `GET /dashboard/notifications` → `NotificationController@index` → Inertia-rendered `resources/js/pages/Dashboard/Notifications/Index.tsx`; three sections (Stok / Piutang / Hutang) rendering the same shared `notifications` props; per-item and mark-all read actions post to the existing routes.
- The "Stok Menipis" pill in the header links to the new page instead of `/products`.

No backend query changes: v1 renders the shared props as-is (10 low-stock / 5 receivables / 5 payables). The existing dead `<Link href="/notifications">` becomes a real link.

# Capabilities

## New Capabilities
- `pos-notifications-ui`: notification bell dropdown + dedicated notifications page surfacing low-stock, receivable, and payable alerts from the already-shared `notifications` props, with per-item and mark-all-read actions wired to the existing `notifications.stock.read`/`notifications.stock.readAll` routes.

## Modified Capabilities
- `dashboard-shell`: the dashboard header's notification bell stops being a dead link and gains a live badge/dropdown (behavior of the shell's header region changes). No `total` server key required.

# Impact

- `app/Http/Controllers/NotificationController.php` — add `index()` (Inertia render).
- `routes/web.php` — add `GET /dashboard/notifications` (auth + permission gate), name `notifications.index`.
- `resources/js/layouts/dashboard-layout.tsx` — replace dead bell link with dropdown; repoint "Stok Menipis" pill.
- New: `resources/js/components/dashboard/notification-bell.tsx` (or similar) + `resources/js/pages/Dashboard/Notifications/Index.tsx`.
- No DB/migration/model changes. No new dependencies (no headlessui).