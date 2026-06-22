## Context

Our project (rtos) was scaffolded from `intentui/laravel` (Justd stack: Laravel 13 + Inertia v3 + React 19 + react-aria-components + Tailwind v4), while pos-reference was built on Laravel 12 + Inertia v2 + React 18 + custom Dashboard UI + Tailwind v3.

The backend PHP files (controllers, models, services, migrations) were already copied from pos-reference and are mostly identical. However, the configuration layer and frontend pages were not carried over.

### Current state

- All controllers, models, services, routes exist and are functional backend code
- `config/security.php` was never copied — bot guard, auth throttling, session config missing
- `config/services.php` is missing `xendit` and `midtrans` sections (PaymentGatewayManager uses them)
- `routes/auth.php` lacks middleware protections present in pos-reference
- ~60 Inertia page components that controllers render don't exist in `resources/js/pages/`

## Goals / Non-Goals

**Goals:**

- Phase B: Restore missing backend config and middleware wiring so auth security works correctly
- Phase A: Port all missing Inertia frontend pages from pos-reference's JSX + custom components → rtos's TSX + react-aria-components

**Non-Goals:**

- No backend PHP logic changes — controllers/services/models are already in place and correct
- No database schema changes — all migrations are identical
- No new features beyond what pos-reference already has
- No CSS/design system overhaul — use existing Justd components as-is

## Decisions

### Phase B — Backend config

| Decision                                      | Rationale                                                                                                                                                      | Alternatives Considered                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Copy `config/security.php` verbatim           | Config is pure data, no tech stack dependency                                                                                                                  | —                                             |
| Restore `xendit`/`midtrans` in `services.php` | These are consumed by `PaymentGatewayManager` and `XenditGateway` already in the codebase; removing them was a scaffolding error                               | Skip (would break payment gateway at runtime) |
| Restore auth route middleware as-is           | Security middleware (`bot.guard`, `registration.enabled`) and middleware aliases already exist in `bootstrap/app.php` — only the route registration is missing | —                                             |

### Phase A — Frontend page porting

| Decision                                                                           | Rationale                                                                                                                 | Alternatives Considered                                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Port pages individually (not bulk copy)                                            | Each page needs significant adaptation: JSX→TSX, custom components→react-aria-components, Ziggy→Wayfinder, Tailwind v3→v4 | Bulk copy + regex replace (too error-prone, would break imports and types) |
| Use existing Justd components from `resources/js/components/ui/`                   | Project already has them, maintains visual consistency                                                                    | Creating new custom components (duplication with existing library)         |
| Adapt Inertia v2 patterns → v3                                                     | Inertia v3 changes: `useForm` API, `router` API, deferred props. Must use current v3 APIs                                 | —                                                                          |
| Convert route references: `route('...')` (Ziggy) → `import` from Wayfinder actions | rtos uses Laravel Wayfinder, not Ziggy; TypeScript type-safe route functions in `resources/js/actions/`                   | Keep Ziggy (would need to add package, contradicts project conventions)    |
| Use `inertia()` helper (kebab-case page paths) for Inertia::render                 | rtos uses kebab-case file names in `pages/`, controllers that were updated use `inertia('dashboard/...')` pattern         | —                                                                          |

### Page rendering patterns

Each pos-reference page needs:

1. **JSX → TSX** — add TypeScript types for props
2. **Custom Dashboard components → Justd equivalents** — Button, Modal, Table, Input, Select, etc.
3. **`route('...')` calls → Wayfinder imports** — e.g., `import { index } from '@/actions/.../ProductController'`
4. **Inertia v2 `useForm` → v3 API** — check current v3 patterns
5. **Tailwind v3 classes → v4** — primarily `space-x/y`→`gap`, `shadow-*` adjustments
6. **CSS imports** — update paths for v4

## Risks / Trade-offs

| Risk                                                                                                                  | Mitigation                                                                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase B**: Missing `config/security.php` env vars in `.env` cause runtime errors                                    | Add sensible defaults in config file; add all env vars to `.env.example`                                                                                                                                                               |
| **Phase A**: react-aria-components may not have 1:1 equivalents for all custom Dashboard widgets                      | Use Justd's existing primitives; fall back to native HTML + Tailwind for truly unique cases                                                                                                                                            |
| **Phase A**: ~60 pages is a large surface area; manual errors in adaptation                                           | Delegate in parallel batches (6-8 pages per subagent); verify with `lsp_diagnostics` after each batch                                                                                                                                  |
| **Phase A**: Inertia v3 API differences from v2 break form submissions                                                | Review Inertia v3 migration docs first; test one page before bulk porting                                                                                                                                                              |
| **Phase B+ A**: Controllers reference `Dashboard/Settings/BankAccountForm` (PascalCase) but rtos pages use kebab-case | Controllers already use Pascal-case page names matching pos-reference. Inertia resolves case-insensitively in dev. If issues arise, update controller → `inertia('dashboard/settings/bank-accounts/form')` to match file path exactly. |

## Migration Plan

```
Phase B (backend config)
├── 1. Create config/security.php
├── 2. Update config/services.php (add xendit + midtrans)
├── 3. Update routes/auth.php (add middleware + PasswordController route)
└── 4. Update .env.example and .env

Phase A (frontend pages)
├── Wave 1: Core business — Customers (show), Products, Categories, Suppliers
├── Wave 2: Transactions — Sales Returns, Purchase Orders, Goods Receivings
├── Wave 3: Finance — Receivables, Payables, Aging
├── Wave 4: Promotions — Pricing Rules, Customer Vouchers, Customer Segments
├── Wave 5: CRM — Campaigns, Reminders, Members
├── Wave 6: Operations — Stock Opnames, Stock Mutations, Supplier Returns, Cashier Shifts
├── Wave 7: Admin — Users, Roles, Permissions, Audit Logs
├── Wave 8: Reports — Sales, Profit, Insights
├── Wave 9: Settings — Payment, Bank Accounts, Store, Target, Loyalty
└── Verify: Check all pages render, forms submit, no 404s
```

## Open Questions

- Should we update controller `inertia('Dashboard/X/Y')` calls to kebab-case `inertia('dashboard/x/y')` to match rtos file paths exactly? (Inertia resolves both in dev, but kebab-case is the project convention)
- Do any Justd components need customization to match pos-reference's page layouts, or should we stick strictly to existing library components?
