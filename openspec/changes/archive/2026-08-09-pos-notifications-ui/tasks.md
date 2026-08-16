## 1. Backend — page route

- [x] 1.1 `routes/web.php`: add `GET /dashboard/notifications` in the dashboard auth+prefix group, name `notifications.index`
- [x] 1.2 `app/Http/Controllers/NotificationController.php`: add `index()` rendering `Inertia::render('Dashboard/Notifications/Index', [...])`
- [x] 1.3 Feature test `tests/Feature/Apps/NotificationsTest.php`: authenticated user with access GETs `/dashboard/notifications` → OK and renders `Dashboard/Notifications/Index` Inertia page with the notifications sections

## 2. Frontend — notification bell dropdown

- [x] 2.1 `resources/js/types/notifications.ts`: add `NotificationItem`/`NotificationsProps` types (id, title, subtitle, time, type, stock/remaining, originalId)
- [x] 2.2 New `resources/js/components/dashboard/notification-bell.tsx`: bell button with badge (count = low_stock+receivables+payables lengths), click-toggle dropdown (no headlessui — hand-rolled outside-click/escape close), per-type icons (rose stock / amber receivable / emerald payable per pos-reference), "Baca" per item (optimistic + `router.post(notifications.stock.read.url(), {product_id})` preserveScroll preserveState), "Tandai dibaca" all (`router.post(notifications.stock.readAll.url(), {}, ...)`), "Lihat semua" footer link, empty state "Tidak ada notifikasi"
- [x] 2.3 `resources/js/layouts/dashboard-layout.tsx`: replace the dead `<Link href="/notifications">` bell block with the new `NotificationBell` component; repoint "Stok Menipis" pill link to `notifications.index.url()`

## 3. Frontend & notifications page

- [x] 3.1 New `resources/js/pages/Dashboard/Notifications/Index.tsx`: `DashboardLayout`, `PageHeader` ("Notifikasi", description showing total), three `Card` sections (Stok habis / Piutang / Hutang) rendering shared `notifications` props with EmptyState per section, per-item "Baca" for stock items, mark-all for stock
- [x] 3.2 `tsc --noEmit` clean (via `~/.vite-plus/js_runtime/node/24.19.0/bin/node node_modules/.pnpm/typescript@7.0.2/node_modules/typescript/bin/tsc --noEmit`)

## 4. Verification

- [x] 4.1 `php artisan test --compact` → baseline 55 + new tests green
- [x] 4.2 Browser check (Playwright / `php artisan serve`) on /dashboard/notifications and the header bell (badge count, open dropdown, scroll/state preserved after mark-read)
- [x] 4.3 `vendor/bin/pint --dirty --format agent` on changed PHP