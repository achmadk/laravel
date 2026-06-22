# Tasks

## Phase 1: Shared Dashboard Components

- [x] Create `SearchField` component at `resources/js/components/dashboard/search-field.tsx`
    - Accepts: `placeholder`, `value`, `onChange`, `debounceMs`, `className`
    - Uses `Input` from `@/components/ui/input`
    - Has search icon (Lucide `Search`) on the left
    - Optional debounce via `useEffect` + `setTimeout`

- [x] Create `Pagination` component at `resources/js/components/dashboard/pagination.tsx`
    - Accepts: `links` (`{ url: string | null, label: string, active: boolean }[]`)
    - Returns `null` if only 1 page
    - Previous/Next buttons with chevron icons
    - Page number links with active state highlighting
    - Uses design tokens (`text-muted-fg`, `bg-bg`, `border-border`)

- [x] Create `EmptyState` component at `resources/js/components/dashboard/empty-state.tsx`
    - Accepts: `icon`, `title`, `description`, `action` (ReactNode for optional CTA)
    - Centered layout with muted colors
    - Uses design tokens

- [x] Create `SummaryCards` component at `resources/js/components/dashboard/summary-cards.tsx`
    - Accepts: `items` (`{ label: string, value: string | number, helper?: string }[]`)
    - Responsive grid layout
    - Uses design tokens

- [x] Create `StatusBadge` component at `resources/js/components/dashboard/status-badge.tsx`
    - Accepts: `variant` (`"success" | "warning" | "danger" | "info" | "neutral"`), `label`
    - Pill badge with semantic colors

- [x] Create `PageHeader` component at `resources/js/components/dashboard/page-header.tsx`
    - Accepts: `title`, `description`, `icon`, `actions`
    - Uses `Heading` from `@/components/ui/heading` for title
    - Page header layout consistent across all dashboard pages

- [x] Create `FilterBar` component at `resources/js/components/dashboard/filter-bar.tsx`
    - Renders `SearchField` + filters in styled bar
    - Form wrapper for search submit

## Phase 2: Pilot — Categories

- [x] Migrate `Dashboard/Categories/Index.tsx`
- [x] Migrate `Dashboard/Categories/Create.tsx`
- [x] Migrate `Dashboard/Categories/Edit.tsx`

## Phase 3: Core CRUD (Customers, Suppliers, Products)

- [x] Migrate `Dashboard/Customers/Index.tsx`
- [x] Migrate `Dashboard/Customers/Create.tsx`
- [x] Migrate `Dashboard/Customers/Edit.tsx`
- [x] Migrate `Dashboard/Suppliers/Index.tsx`
    - Note: Suppliers uses inline CRUD — no separate Create/Edit pages exist
- [x] Migrate `Dashboard/Products/Index.tsx`
- [x] Migrate `Dashboard/Products/Create.tsx`
- [x] Migrate `Dashboard/Products/Edit.tsx`

## Phase 4: Table-Heavy Index Pages (kebab-case dirs)

- [x] Migrate `Dashboard/purchase-orders/index.tsx`
    - FilterBar + SearchField + table + StatusBadge + Pagination
- [x] Migrate `Dashboard/supplier-returns/index.tsx`
    - Same pattern with create button
- [x] Migrate `Dashboard/sales-returns/index.tsx`
    - Filter form with Card wrapper + table + StatusBadge + Pagination
- [x] Migrate `Dashboard/stock-mutations/index.tsx`
    - Filter selects + table + Pagination + empty state
- [x] Migrate `Dashboard/transactions/history.tsx`
    - Large page: PageHeader, filter toggle panel, desktop table + mobile card views, Pagination, Modal for payment confirmation
- [x] Migrate `Dashboard/payables/index.tsx`
    - Inline create form + filter + desktop table + mobile cards
- [x] Migrate `Dashboard/receivables/index.tsx`
    - Dual tab: list + aging (KPI cards, aging buckets, top customers table)

## Phase 5: Complex Pages (Create/Edit + Remaining Table-Heavy)

- [x] Migrate `Dashboard/purchase-orders/create.tsx`
- [x] Migrate `Dashboard/purchase-orders/show.tsx`
- [x] Migrate `Dashboard/supplier-returns/create.tsx`
- [x] Migrate `Dashboard/supplier-returns/show.tsx`
- [x] Migrate `Dashboard/sales-returns/form.tsx`
    - Note: create.tsx and show.tsx are thin wrappers delegating to form.tsx — no styling to migrate
- [x] Migrate `Dashboard/aging/index.tsx`
- [x] Migrate `Dashboard/payables/show.tsx`
- [x] Migrate `Dashboard/receivables/show.tsx`
- [x] Migrate `Dashboard/transactions/index.tsx` (uses POSLayout, deferred)
- [x] Migrate `Dashboard/transactions/print.tsx`
- [x] Migrate `Dashboard/cashier-shifts/index.tsx`
- [x] Migrate `Dashboard/cashier-shifts/show.tsx`
- [x] Migrate `Dashboard/goods-receivings/index.tsx`
- [x] Migrate `Dashboard/goods-receivings/create.tsx`
- [x] Migrate `Dashboard/goods-receivings/show.tsx`
- [x] Migrate `Dashboard/reports/sales.tsx`
- [x] Migrate `Dashboard/reports/profits.tsx`
- [x] Migrate `Dashboard/reports/insights.tsx`
- [x] Migrate `Dashboard/settings/store.tsx`
- [x] Migrate `Dashboard/settings/payments.tsx`
- [x] Migrate `Dashboard/settings/loyalty.tsx`
- [x] Migrate `Dashboard/settings/target.tsx`
- [x] Migrate `Dashboard/StockOpnames/Index.tsx`
- [x] Migrate `Dashboard/StockOpnames/Create.tsx`
- [x] Migrate `Dashboard/StockOpnames/Show.tsx`

## Phase 6: Remaining Pages

- [x] Migrate `Dashboard/Index.tsx`
- [x] Migrate `Dashboard/Access.tsx`
- [x] Migrate `Dashboard/Users/Index.tsx`
- [x] Migrate `Dashboard/Users/create.tsx`
- [x] Migrate `Dashboard/Users/edit.tsx`
- [x] Migrate `Dashboard/audit-logs/index.tsx`
- [x] Migrate `Dashboard/audit-logs/show.tsx`
- [x] Migrate `Dashboard/permissions/index.tsx`
- [x] Migrate `Dashboard/roles/index.tsx`
- [x] Migrate `Dashboard/crm-campaigns/index.tsx`
- [x] Migrate `Dashboard/crm-campaigns/create.tsx`
- [x] Migrate `Dashboard/crm-campaigns/edit.tsx`
- [x] Migrate `Dashboard/crm-campaigns/form.tsx`
- [x] Migrate `Dashboard/crm-campaigns/show.tsx`
- [x] Migrate `Dashboard/crm-reminders/index.tsx`
- [x] Migrate `Dashboard/customer-segments/index.tsx`
- [x] Migrate `Dashboard/customer-segments/create.tsx`
- [x] Migrate `Dashboard/customer-segments/edit.tsx`
- [x] Migrate `Dashboard/customer-segments/form.tsx`
- [x] Migrate `Dashboard/customer-segments/show.tsx`
- [x] Migrate `Dashboard/customer-vouchers/index.tsx`
- [x] Migrate `Dashboard/customer-vouchers/create.tsx`
- [x] Migrate `Dashboard/customer-vouchers/edit.tsx`
- [x] Migrate `Dashboard/customer-vouchers/form.tsx`
- [x] Migrate `Dashboard/members/index.tsx`
- [x] Migrate `Dashboard/members/create.tsx`
- [x] Migrate `Dashboard/members/edit.tsx`
- [x] Migrate `Dashboard/members/form.tsx`
- [x] Migrate `Dashboard/members/show.tsx`
- [x] Migrate `Dashboard/pricing-rules/index.tsx`
- [x] Migrate `Dashboard/pricing-rules/create.tsx`
- [x] Migrate `Dashboard/pricing-rules/edit.tsx`
- [x] Migrate `Dashboard/pricing-rules/form.tsx`
