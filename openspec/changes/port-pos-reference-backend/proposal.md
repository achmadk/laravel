## Why

The project's backend was scaffolded from the `../pos-reference` codebase, but several configuration files, security middleware wiring, and route protections were not carried over. Additionally, ~60 Inertia frontend pages that the existing controllers already reference were never ported. This creates a gap where controllers render pages that don't exist, and security middleware (bot guard, registration toggle, throttling) is not active on auth routes.

Fixing this in two phases: first the missing backend config/middleware/routes, then the frontend pages with tech stack adaptation.

## What Changes

### Phase B — Backend config & middleware (immediate)

- **New:** `config/security.php` — auth throttling limits, bot guard config, session lifetime, step-up password timeout
- **Update:** `config/services.php` — add `xendit` and `midtrans` gateway config sections (removed during scaffold)
- **Update:** `routes/auth.php` — add `registration.enabled`, `bot.guard`, and `throttle` middleware to register/login/forgot-password/verification routes; add `PasswordController::update` route
- **Update:** `.env.example` and `.env` — add the 5 missing env vars consumed by `config/security.php`

### Phase A — Inertia frontend pages (follows Phase B)

Port ~60 Inertia page components from pos-reference's JSX + custom Dashboard UI → rtos's TypeScript + react-aria-components (Justd/IntentUI) + Tailwind v4 + Wayfinder routes.

Pages include: Aging, AuditLogs, CashierShifts, CrmCampaigns, CrmReminders, CustomerSegments, CustomerVouchers, GoodsReceivings, Members, Payables, Permissions, PricingRules, PurchaseOrders, Reports, Roles, StockMutations, StockOpnames, Suppliers, SupplierReturns, Users, Settings, and various sub-pages.

## Capabilities

### New Capabilities

- `auth-security`: Bot guard protection, registration toggle, and throttling configuration for auth routes. Protects login, registration, forgot-password, and email verification endpoints from automated abuse.
- `payment-gateway-config`: Xendit and Midtrans service credentials in config/services.php, already consumed by existing PaymentGatewayManager but missing from configuration.
- `dashboard-aging`: Aging analysis page for receivables/payables showing overdue brackets.
- `dashboard-audit-logs`: Activity log viewer with detail pages, filterable by user/action/date.
- `dashboard-cashier-shifts`: Cashier shift management — open/close shifts, shift history, cash reconciliation.
- `dashboard-crm-campaigns`: Campaign management — create, process, monitor WhatsApp/email campaigns with logs.
- `dashboard-crm-reminders`: CRM reminder list view.
- `dashboard-customer-segments`: Customer segmentation CRUD with dynamic member assignment.
- `dashboard-customer-vouchers`: Customer voucher management.
- `dashboard-customer-detail`: Customer detail/show page with transaction history.
- `dashboard-goods-receivings`: Goods receiving note management — create, index, show.
- `dashboard-members`: Member management (membership CRUD with detail).
- `dashboard-payables`: Payable accounts management with payment tracking.
- `dashboard-permissions`: Permission management UI.
- `dashboard-pricing-rules`: Pricing rule CRUD with quantity breaks, bundles, buy-get promotions.
- `dashboard-purchase-orders`: Purchase order lifecycle — create, place, cancel, receive.
- `dashboard-reports-insights`: Advanced sales insights dashboard.
- `dashboard-reports-profit`: Profit/loss report.
- `dashboard-reports-sales`: Sales report.
- `dashboard-roles`: Role management UI.
- `dashboard-stock-mutations`: Stock mutation history viewer.
- `dashboard-stock-opnames`: Stock opname (physical count) — create, finalize, review.
- `dashboard-suppliers`: Supplier CRUD.
- `dashboard-supplier-returns`: Supplier return management.
- `dashboard-users`: User management CRUD.
- `dashboard-settings-payment`: Payment gateway settings page.
- `dashboard-settings-target`: Sales target settings.
- `dashboard-settings-store`: Store profile settings.
- `dashboard-settings-loyalty`: Loyalty program settings.
- `dashboard-settings-bank-accounts`: Bank account management (CRUD, reorder, toggle).

## Impact

- **No breaking changes** — all changes are additive or restore removed config
- `config/security.php` introduces new config keys consumed by existing middleware (`EnsureBotGuard`, `EnsurePublicRegistrationEnabled`, `EnforceAbsoluteSessionLifetime`, `EnsureRecentPasswordConfirmation`)
- `config/services.php` restores `xendit` and `midtrans` entries — these are already referenced by `PaymentGatewayManager` and `XenditGateway` so this fixes a latent bug
- `routes/auth.php` changes only add middleware (no route removals) — existing functionality preserved
- Frontend pages follow the existing Justd/IntentUI component patterns already established in the project
