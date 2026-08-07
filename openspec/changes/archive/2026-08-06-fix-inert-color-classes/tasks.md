## 1. POS Components (`resources/js/components/pos/`)

Use the mapping table in `design.md` D1 for every replacement. After each file, confirm its numeric-scale classes are gone.

- [x] 1.1 `ProductGrid.tsx`: Replace 16 instances (active chip gradient `from-primary-500 to-primary-600 text-white` → `bg-primary text-primary-fg`, `border-primary-500` → `border-primary`, `bg-danger-500` HABIS → `bg-danger text-danger-fg`, price `text-primary-600` → `text-primary`, tinted bgs → `bg-primary-subtle`/`bg-danger-subtle`) - active chip renders primary, grid grep clean
- [x] 1.2 `CartPanel.tsx`: Replace 9 instances - cart highlight states visible
- [x] 1.3 `SearchBar.tsx`: Replace 9 instances (focus/active borders → `border-primary`, text → `text-primary`)
- [x] 1.4 `NumpadModal.tsx`: Replace 15 instances (key active state → `bg-primary text-primary-fg`)
- [x] 1.5 `CustomerSelect.tsx`: Replace 14 instances (selected option → primary token states)
- [x] 1.6 `PaymentPanel.tsx`: Replace 40 instances (selected payment method → `bg-primary text-primary-fg`, QRIS/danger notes → danger tokens)
- [x] 1.7 `AddCustomerModal.tsx`: Replace 31 instances (focus rings, error text → `border-danger`/`text-danger`)
- [x] 1.8 `CustomerHistoryPanel.tsx`: Replace 19 instances (amount `text-primary-600` → `text-primary`, status badges → token badges)

## 2. POS Layout + Dashboard Page

- [x] 2.1 `layouts/pos-layout.tsx`: Replace 17 instances (nav active item, sale badge → token colors)
- [x] 2.2 `pages/dashboard.tsx`: Replace 6 instances (access-page card accents → `text-primary`, tinted tiles → `bg-primary-subtle`)

## 3. Auth Pages (`resources/js/pages/auth/`)

- [x] 3.1 `login.tsx`: Replace 12 instances (focus rings `ring-primary-500` → `ring-primary`, button gradient → `bg-primary text-primary-fg`)
- [x] 3.2 `register.tsx`: Replace 12 instances (same pattern)
- [x] 3.3 `forgot-password.tsx`: Replace 10 instances
- [x] 3.4 `verify-email.tsx`: Replace 8 instances
- [x] 3.5 `reset-password.tsx`: Replace 6 instances
- [x] 3.6 `confirm-password.tsx`: Replace 2 instances

## 4. Dashboard Settings Pages

- [x] 4.1 `Dashboard/Settings/Payments.tsx`: Replace 16 instances (bank/EWallet tiles active state, status badges)
- [x] 4.2 `Dashboard/Settings/BankAccounts/Index.tsx`: Replace 8 instances
- [x] 4.3 `Dashboard/Settings/BankAccounts/Form.tsx`: Replace 9 instances

## 5. Members, CRM & Reports Pages

- [x] 5.1 `Dashboard/Members/Show.tsx`: Replace 24 instances (segment/tier badges → success/danger tokens)
- [x] 5.2 `Dashboard/Members/Index.tsx`: Replace 5 instances
- [x] 5.3 `Dashboard/Members/Form.tsx`: Replace 4 instances
- [x] 5.4 `Dashboard/CustomerVouchers/Index.tsx`: Replace 4 instances
- [x] 5.5 `Dashboard/CustomerVouchers/Form.tsx`: Replace 7 instances
- [x] 5.6 `Dashboard/CustomerSegments/Index.tsx`: Replace 7 instances
- [x] 5.7 `Dashboard/CustomerSegments/Form.tsx`: Replace 7 instances
- [x] 5.8 `Dashboard/CustomerSegments/Show.tsx`: Replace 4 instances
- [x] 5.9 `Dashboard/CrmCampaigns/Index.tsx`: Replace 5 instances
- [x] 5.10 `Dashboard/CrmCampaigns/Form.tsx`: Replace 7 instances
- [x] 5.11 `Dashboard/CrmCampaigns/Show.tsx`: Replace 8 instances
- [x] 5.12 `Dashboard/CrmReminders/Index.tsx`: Replace 2 instances
- [x] 5.13 `Dashboard/PricingRules/Index.tsx`: Replace 6 instances
- [x] 5.14 `Dashboard/PricingRules/Form.tsx`: Replace 3 instances
- [x] 5.15 `Dashboard/Reports/Insights.tsx`: Replace 5 instances

## 6. Verification

- [x] 6.1 Grep guard: `grep -rE "(primary|danger|success|warning|secondary|info)-[0-9]+" resources/js --include="*.tsx"` returns 0 matches
- [x] 6.2 Run `vp check` (tsc + biome) - clean
- [x] 6.3 Manual visual pass, light + dark mode: `/dashboard/transactions` active category chip renders primary, product in-cart border + checkmark visible, HABIS badge visible; spot-check one Members page and one CrmCampaigns page
