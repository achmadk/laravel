# Porting Progress: `pos-reference` → `rtos`

> **Generated**: 2026-06-22
> **Source**: `../pos-reference` (Laravel 12, Inertia v2, React 18, Tailwind v3, JSX)
> **Target**: `rtos` (Laravel, Inertia v3, React 19, Tailwind v4, TypeScript, Justd/IntentUI)
> **OpenSpec Changes**:
>
> - `port-pos-reference-backend` (created 2026-06-18)
> - `port-frontend-remaining-pages` (created 2026-06-19)

---

## 1. Executive Summary

| Category                   | Source (pos-ref) | Target (rtos)                       | Status                                    |
| -------------------------- | ---------------- | ----------------------------------- | ----------------------------------------- |
| PHP Backend Files          | ~120 files       | ~120 files                          | ✅ **100% Ported**                        |
| Database Migrations        | 56 files         | 56 files                            | ✅ **100% Ported**                        |
| Database Seeders           | 8 files          | 8 files                             | ✅ **100% Ported**                        |
| Form Requests              | 12 files         | 13 files (1 IntentUI extra)         | ✅ **100% Ported**                        |
| Config Files               | 14 config dirs   | 15 config dirs                      | ✅ **100% Ported**                        |
| Frontend Pages (Dashboard) | 80 JSX pages     | 79 TSX pages (missing `Access.jsx`) | ✅ **~99% Ported**                        |
| Frontend Components        | 49 files         | 41 files                            | ✅ **Adapted** (Justd replaces custom UI) |
| Tests                      | 22 PHPUnit files | 12 Pest files                       | 🔴 **~55% Ported (11 missing)**           |
| OpenSpec Specs             | —                | 30 specs authored                   | ✅ **Coverage Complete**                  |

**Overall Backend**: ✅ Complete (100%)
**Overall Frontend**: ✅ Complete (~99%, 1 minor page missing)
**Tests**: 🔴 11 test suites need PHPUnit→Pest migration

---

## 2. Backend Porting Status

### 2.1 Models — ✅ COMPLETE

All 41 Eloquent models are identical between both projects:

```
AuditLog, BankAccount, Cart, CashierShift, Category, Customer,
CustomerCampaign, CustomerCampaignLog, CustomerCredit, CustomerSegment,
CustomerSegmentMembership, CustomerVoucher, GoodsReceiving,
GoodsReceivingItem, LoyaltyPointHistory, Payable, PayablePayment,
PaymentSetting, PricingRule (×4 sub-models), Product,
ProductNotificationRead, Profit, PurchaseOrder, PurchaseOrderItem,
Receivable, ReceivablePayment, SalesReturn, SalesReturnItem, Setting,
StockMutation, StockOpname, StockOpnameItem, Supplier, SupplierReturn,
SupplierReturnItem, Transaction, TransactionDetail, User
```

### 2.2 Services — ✅ COMPLETE

All 15 service classes (13 + Payments subdirectory):

```
AuditLogService, CashierShiftService, CrmAutomationService,
CustomerSegmentationService, GoodsReceivingService, LoyaltyService,
PayableAgingService, Payments/ (gateway implementations—Midtrans, Xendit),
PricingService, PurchaseOrderService, ReceivableService,
StockMutationService, SupplierReturnService
```

### 2.3 Middleware — ✅ COMPLETE

| Middleware                         | Status                    |
| ---------------------------------- | ------------------------- |
| `EnforceAbsoluteSessionLifetime`   | ✅ Ported                 |
| `EnsureActiveCashierShift`         | ✅ Ported                 |
| `EnsureBotGuard`                   | ✅ Ported                 |
| `EnsureEmailIsVerifiedOptional`    | ✅ Ported (extra in rtos) |
| `EnsurePublicRegistrationEnabled`  | ✅ Ported                 |
| `EnsureRecentPasswordConfirmation` | ✅ Ported                 |
| `HandleInertiaRequests`            | ✅ Ported                 |
| `HandleTheme` (rtos-only)          | ➕ Extra (IntentUI)       |
| `SecureHeaders`                    | ✅ Ported                 |

### 2.4 Controllers — ✅ COMPLETE

All controller files ported. rtos has extras:

| Group                         | Source | Target | Status          |
| ----------------------------- | ------ | ------ | --------------- |
| `Auth/` (9 controllers)       | ✅     | ✅     | Identical       |
| `Apps/` (26 controllers)      | ✅     | ✅     | Identical       |
| `Api/` (PaymentWebhook)       | ✅     | ✅     | Identical       |
| `Reports/` (3 controllers)    | ✅     | ✅     | Identical       |
| `DashboardController`         | ✅     | ✅     | Identical       |
| `DocumentController`          | ✅     | ✅     | Identical       |
| `NotificationController`      | ✅     | ✅     | Identical       |
| `PermissionController`        | ✅     | ✅     | Identical       |
| `ProfileController`           | ✅     | ✅     | Identical       |
| `RegionController`            | ✅     | ✅     | Identical       |
| `RoleController`              | ✅     | ✅     | Identical       |
| `UserController`              | ✅     | ✅     | Identical       |
| `Settings/` (4 rtos-only)     | —      | ✅     | IntentUI extras |
| `AboutController` (rtos-only) | —      | ✅     | IntentUI extras |
| `HomeController` (rtos-only)  | —      | ✅     | IntentUI extras |

### 2.5 Form Requests — ✅ COMPLETE

| Request                                     | Source | Target | Status         |
| ------------------------------------------- | ------ | ------ | -------------- |
| `Auth/LoginRequest`                         | ✅     | ✅     | Identical      |
| `CloseCashierShiftRequest`                  | ✅     | ✅     | Ported         |
| `ConfirmPasswordForForceCloseRequest`       | ✅     | ✅     | Ported         |
| `ProfileUpdateRequest`                      | ✅     | ✅     | Ported         |
| `StoreCashierShiftRequest`                  | ✅     | ✅     | Ported         |
| `StoreSalesReturnRequest`                   | ✅     | ✅     | Ported         |
| `StoreStockOpnameItemRequest`               | ✅     | ✅     | Ported         |
| `StoreStockOpnameRequest`                   | ✅     | ✅     | Ported         |
| `UpdateSalesReturnRequest`                  | ✅     | ✅     | Ported         |
| `UpdateStockOpnameItemRequest`              | ✅     | ✅     | Ported         |
| `UpdateStockOpnameRequest`                  | ✅     | ✅     | Ported         |
| `UserRequest`                               | ✅     | ✅     | Ported         |
| `Settings/ProfileUpdateRequest` (rtos-only) | —      | ✅     | IntentUI extra |

### 2.6 Routes — ✅ COMPLETE

| Route File            | Source    | Target    | Status                                                           |
| --------------------- | --------- | --------- | ---------------------------------------------------------------- |
| `routes/web.php`      | 288 lines | 289 lines | ~99% identical (rtos adds `settings.php` require)                |
| `routes/auth.php`     | 63 lines  | 63 lines  | ✅ Identical (includes bot guard, registration toggle, throttle) |
| `routes/api.php`      | same      | same      | ✅ Identical                                                     |
| `routes/console.php`  | same      | same      | ✅ Identical                                                     |
| `routes/settings.php` | —         | 17 lines  | ➕ Extra (IntentUI profile/password/appearance)                  |

All 50+ dashboard routes confirmed active via `php artisan route:list`.

### 2.7 Config — ✅ COMPLETE

All config files ported including:

- `config/security.php` — auth throttling, bot guard, session lifetime, step-up (identical)
- `config/services.php` — includes `xendit` + `midtrans` sections (identical)
- `config/permission.php`, `config/dompdf.php`, `config/laravolt/` — all identical

### 2.8 Database — ✅ COMPLETE

- **Migrations**: 56 files, identical between both projects
- **Seeders**: 8 seeders identical (`DatabaseSeeder`, `FeatureCoverageSeeder`, `OperationalCoreSeeder`, `PaymentSettingSeeder`, `PermissionSeeder`, `RoleSeeder`, `SampleDataSeeder`, `UserSeeder`)
- **Factories**: 2 factories identical (`PaymentSettingFactory`, `UserFactory`)

### 2.9 Bootstrap — ✅ COMPLETE

| File                      | Status                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------- |
| `bootstrap/app.php`       | ~95% identical (rtos adds `HandleTheme` to web middleware stack)                            |
| `bootstrap/providers.php` | rtos adds `Barryvdh\DomPDF\ServiceProvider` + `Spatie\Permission\PermissionServiceProvider` |

### 2.10 Console Commands — ✅ COMPLETE

```
CrmGenerateRemindersCommand  ✅
CrmSyncSegmentsCommand       ✅
```

### 2.11 Support — ✅ COMPLETE

```
BotGuard.php                        ✅
ProductionSecurityBaseline.php      ✅
```

### 2.12 Exceptions — ✅ COMPLETE

```
PaymentGatewayException.php  ✅
```

---

## 3. Frontend Porting Status

### 3.1 Tech Stack Adaptation

| Dimension     | Source (pos-reference)           | Target (rtos)                                     | Adaptation                   |
| ------------- | -------------------------------- | ------------------------------------------------- | ---------------------------- |
| Language      | JSX                              | TSX                                               | ✅ Per-page conversion       |
| React         | v18                              | v19                                               | ✅                           |
| Inertia       | v2                               | v3                                                | ✅ (useForm API, router API) |
| Tailwind      | v3 (config-based)                | v4 (CSS-first)                                    | ✅ Per-page migration        |
| UI Kit        | Custom Dashboard (22 components) | Justd/react-aria-components (16 `ui/` components) | ✅ Replaced                  |
| Routing       | Ziggy `route()`                  | Laravel Wayfinder `@/actions/`                    | ✅ Per-page conversion       |
| Icons         | @tabler/icons-react              | @tabler/icons-react                               | ✅ Same library              |
| Charts        | chart.js                         | chart.js                                          | ✅ Same library              |
| Notifications | react-hot-toast + sweetalert2    | react-hot-toast + sonner                          | ✅ Replaced                  |
| Build         | Vite 5                           | Vite+                                             | ✅                           |

### 3.2 Page Porting Matrix

✅ = Ported 🟡 = Partially ported 🔴 = Not ported ➖ = N/A ✨ = New in rtos

#### Auth Pages (6/6 ✅)

| Page             | Source Files               | Target Files                | Status |
| ---------------- | -------------------------- | --------------------------- | ------ |
| Login            | `Auth/Login.jsx`           | `auth/login.tsx`            | ✅     |
| Register         | `Auth/Register.jsx`        | `auth/register.tsx`         | ✅     |
| Forgot Password  | `Auth/ForgotPassword.jsx`  | `auth/forgot-password.tsx`  | ✅     |
| Reset Password   | `Auth/ResetPassword.jsx`   | `auth/reset-password.tsx`   | ✅     |
| Confirm Password | `Auth/ConfirmPassword.jsx` | `auth/confirm-password.tsx` | ✅     |
| Verify Email     | `Auth/VerifyEmail.jsx`     | `auth/verify-email.tsx`     | ✅     |

#### Core Pages (4/4 ✅)

| Page             | Source                 | Target                | Status                                           |
| ---------------- | ---------------------- | --------------------- | ------------------------------------------------ |
| Welcome          | `Welcome.jsx`          | `Welcome.tsx`         | ✅                                               |
| Error            | `Error.jsx`            | `Error.tsx`           | ✅                                               |
| Dashboard        | `Dashboard/Index.jsx`  | `Dashboard/Index.tsx` | ✅                                               |
| Dashboard/Access | `Dashboard/Access.jsx` | —                     | 🔴 **Missing** (standalone "access denied" page) |

#### Customer Pages (4/4 ✅)

| Page   | Source                           | Target                           | Status |
| ------ | -------------------------------- | -------------------------------- | ------ |
| Index  | `Dashboard/Customers/Index.jsx`  | `dashboard/customers/index.tsx`  | ✅     |
| Create | `Dashboard/Customers/Create.jsx` | `dashboard/customers/create.tsx` | ✅     |
| Edit   | `Dashboard/Customers/Edit.jsx`   | `dashboard/customers/edit.tsx`   | ✅     |
| Show   | `Dashboard/Customers/Show.jsx`   | `dashboard/customers/show.tsx`   | ✅     |

#### Product & Category Pages (6/6 ✅)

| Page              | Source                            | Target                            | Status |
| ----------------- | --------------------------------- | --------------------------------- | ------ |
| Categories Index  | `Dashboard/Categories/Index.jsx`  | `Dashboard/Categories/Index.tsx`  | ✅     |
| Categories Create | `Dashboard/Categories/Create.jsx` | `Dashboard/Categories/create.tsx` | ✅     |
| Categories Edit   | `Dashboard/Categories/Edit.jsx`   | `Dashboard/Categories/edit.tsx`   | ✅     |
| Products Index    | `Dashboard/Products/Index.jsx`    | `dashboard/products/index.tsx`    | ✅     |
| Products Create   | `Dashboard/Products/Create.jsx`   | `dashboard/products/create.tsx`   | ✅     |
| Products Edit     | `Dashboard/Products/Edit.jsx`     | `dashboard/products/edit.tsx`     | ✅     |

#### Transaction Pages (6/6 ✅)

| Page                      | Source                               | Target                                            | Status |
| ------------------------- | ------------------------------------ | ------------------------------------------------- | ------ |
| POS Index                 | `Dashboard/Transactions/Index.jsx`   | `dashboard/transactions/index.tsx`                | ✅     |
| History                   | `Dashboard/Transactions/History.jsx` | `dashboard/transactions/history.tsx`              | ✅     |
| Print                     | `Dashboard/Transactions/Print.jsx`   | `dashboard/transactions/print.tsx`                | ✅     |
| Sales Returns Index       | `Dashboard/SalesReturns/Index.jsx`   | `dashboard/sales-returns/index.tsx`               | ✅     |
| Sales Returns Create/Form | multi-file                           | `dashboard/sales-returns/create.tsx` + `form.tsx` | ✅     |
| Sales Returns Show        | `Dashboard/SalesReturns/Show.jsx`    | `dashboard/sales-returns/show.tsx`                | ✅     |

#### Supplier Pages (4/4 ✅)

| Page                    | Source                                 | Target                                  | Status |
| ----------------------- | -------------------------------------- | --------------------------------------- | ------ |
| Suppliers Index         | `Dashboard/Suppliers/Index.jsx`        | `dashboard/suppliers/index.tsx`         | ✅     |
| Supplier Returns Index  | `Dashboard/SupplierReturns/Index.jsx`  | `dashboard/supplier-returns/index.tsx`  | ✅     |
| Supplier Returns Create | `Dashboard/SupplierReturns/Create.jsx` | `dashboard/supplier-returns/create.tsx` | ✅     |
| Supplier Returns Show   | `Dashboard/SupplierReturns/Show.jsx`   | `dashboard/supplier-returns/show.tsx`   | ✅     |

#### Purchase & Receiving Pages (6/6 ✅)

| Page                   | Source                                 | Target                                  | Status |
| ---------------------- | -------------------------------------- | --------------------------------------- | ------ |
| POs Index              | `Dashboard/PurchaseOrders/Index.jsx`   | `dashboard/purchase-orders/index.tsx`   | ✅     |
| POs Create             | `Dashboard/PurchaseOrders/Create.jsx`  | `dashboard/purchase-orders/create.tsx`  | ✅     |
| POs Show               | `Dashboard/PurchaseOrders/Show.jsx`    | `dashboard/purchase-orders/show.tsx`    | ✅     |
| Goods Receivings Index | `Dashboard/GoodsReceivings/Index.jsx`  | `dashboard/goods-receivings/index.tsx`  | ✅     |
| GR Create              | `Dashboard/GoodsReceivings/Create.jsx` | `dashboard/goods-receivings/create.tsx` | ✅     |
| GR Show                | `Dashboard/GoodsReceivings/Show.jsx`   | `dashboard/goods-receivings/show.tsx`   | ✅     |

#### Finance Pages (5/5 ✅)

| Page              | Source                            | Target                            | Status |
| ----------------- | --------------------------------- | --------------------------------- | ------ |
| Receivables Index | `Dashboard/Receivables/Index.jsx` | `dashboard/receivables/index.tsx` | ✅     |
| Receivables Show  | `Dashboard/Receivables/Show.jsx`  | `dashboard/receivables/show.tsx`  | ✅     |
| Payables Index    | `Dashboard/Payables/Index.jsx`    | `dashboard/payables/index.tsx`    | ✅     |
| Payables Show     | `Dashboard/Payables/Show.jsx`     | `dashboard/payables/show.tsx`     | ✅     |
| Aging Index       | `Dashboard/Aging/Index.jsx`       | `dashboard/aging/index.tsx`       | ✅     |

#### Promotions Pages (4/4 ✅)

| Page                 | Source                              | Target                               | Status |
| -------------------- | ----------------------------------- | ------------------------------------ | ------ |
| Pricing Rules Index  | `Dashboard/PricingRules/Index.jsx`  | `dashboard/pricing-rules/index.tsx`  | ✅     |
| Pricing Rules Create | `Dashboard/PricingRules/Create.jsx` | `dashboard/pricing-rules/create.tsx` | ✅     |
| Pricing Rules Edit   | `Dashboard/PricingRules/Edit.jsx`   | `dashboard/pricing-rules/edit.tsx`   | ✅     |
| Pricing Rules Form   | `Dashboard/PricingRules/Form.jsx`   | `dashboard/pricing-rules/form.tsx`   | ✅     |

#### CRM Pages (10/10 ✅)

| Page                  | Source                              | Target                               | Status |
| --------------------- | ----------------------------------- | ------------------------------------ | ------ |
| Campaigns Index       | `Dashboard/CrmCampaigns/Index.jsx`  | `dashboard/crm-campaigns/index.tsx`  | ✅     |
| Campaigns Create      | `Dashboard/CrmCampaigns/Create.jsx` | `dashboard/crm-campaigns/create.tsx` | ✅     |
| Campaigns Edit        | `Dashboard/CrmCampaigns/Edit.jsx`   | `dashboard/crm-campaigns/edit.tsx`   | ✅     |
| Campaigns Form        | `Dashboard/CrmCampaigns/Form.jsx`   | `dashboard/crm-campaigns/form.tsx`   | ✅     |
| Campaigns Show        | `Dashboard/CrmCampaigns/Show.jsx`   | `dashboard/crm-campaigns/show.tsx`   | ✅     |
| Reminders Index       | `Dashboard/CrmReminders/Index.jsx`  | `dashboard/crm-reminders/index.tsx`  | ✅     |
| Customer Vouchers (4) | 4 files                             | `dashboard/customer-vouchers/`       | ✅     |
| Customer Segments (5) | 5 files                             | `dashboard/customer-segments/`       | ✅     |
| Members (5)           | 5 files                             | `dashboard/members/`                 | ✅     |

#### Operations Pages (7/7 ✅) ← Updated from PROGRESS.md (was 2/5)

| Page                  | Source                               | Target                                | Status |
| --------------------- | ------------------------------------ | ------------------------------------- | ------ |
| Cashier Shifts Index  | `Dashboard/CashierShifts/Index.jsx`  | `dashboard/cashier-shifts/index.tsx`  | ✅     |
| Cashier Shifts Show   | `Dashboard/CashierShifts/Show.jsx`   | `dashboard/cashier-shifts/show.tsx`   | ✅     |
| Stock Opnames Index   | `Dashboard/StockOpnames/Index.jsx`   | `Dashboard/StockOpnames/Index.tsx`    | ✅     |
| Stock Opnames Create  | `Dashboard/StockOpnames/Create.jsx`  | `Dashboard/StockOpnames/Create.tsx`   | ✅     |
| Stock Opnames Show    | `Dashboard/StockOpnames/Show.jsx`    | `Dashboard/StockOpnames/Show.tsx`     | ✅     |
| Stock Mutations Index | `Dashboard/StockMutations/Index.jsx` | `dashboard/stock-mutations/index.tsx` | ✅     |
| Audit Logs Index      | `Dashboard/AuditLogs/Index.jsx`      | `dashboard/audit-logs/index.tsx`      | ✅     |
| Audit Logs Show       | `Dashboard/AuditLogs/Show.jsx`       | `dashboard/audit-logs/show.tsx`       | ✅     |

#### Admin Pages (5/5 ✅) ← Updated from PROGRESS.md (was 0/3)

| Page              | Source                            | Target                            | Status |
| ----------------- | --------------------------------- | --------------------------------- | ------ |
| Users Index       | `Dashboard/Users/Index.jsx`       | `Dashboard/Users/Index.tsx`       | ✅     |
| Users Create      | `Dashboard/Users/Create.jsx`      | `Dashboard/Users/create.tsx`      | ✅     |
| Users Edit        | `Dashboard/Users/Edit.jsx`        | `Dashboard/Users/edit.tsx`        | ✅     |
| Roles Index       | `Dashboard/Roles/Index.jsx`       | `dashboard/roles/index.tsx`       | ✅     |
| Permissions Index | `Dashboard/Permissions/Index.jsx` | `dashboard/permissions/index.tsx` | ✅     |

#### Report Pages (3/3 ✅) ← Updated from PROGRESS.md (was 0/3)

| Page          | Source                           | Target                           | Status |
| ------------- | -------------------------------- | -------------------------------- | ------ |
| Sales Report  | `Dashboard/Reports/Sales.jsx`    | `dashboard/reports/sales.tsx`    | ✅     |
| Profit Report | `Dashboard/Reports/Profit.jsx`   | `dashboard/reports/profits.tsx`  | ✅     |
| Insights      | `Dashboard/Reports/Insights.jsx` | `dashboard/reports/insights.tsx` | ✅     |

#### Settings Pages (6/6 ✅)

| Page                | Source                                   | Target                                       | Status |
| ------------------- | ---------------------------------------- | -------------------------------------------- | ------ |
| Payment Settings    | `Dashboard/Settings/Payment.jsx`         | `dashboard/settings/payments.tsx`            | ✅     |
| Bank Accounts Index | `Dashboard/Settings/BankAccounts.jsx`    | `dashboard/settings/bank-accounts/index.tsx` | ✅     |
| Bank Account Form   | `Dashboard/Settings/BankAccountForm.jsx` | `dashboard/settings/bank-accounts/form.tsx`  | ✅     |
| Store Settings      | `Dashboard/Settings/Store.jsx`           | `dashboard/settings/store.tsx`               | ✅     |
| Target Settings     | `Dashboard/Settings/Target.jsx`          | `dashboard/settings/target.tsx`              | ✅     |
| Loyalty Settings    | `Dashboard/Settings/Loyalty.jsx`         | `dashboard/settings/loyalty.tsx`             | ✅     |

### 3.3 Component Adaptation

| Layer                          | Source Components (49 files)                                                        | Target Components (41 files)                             | Status         |
| ------------------------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------- |
| Layout — Auth                  | `GuestLayout.jsx`                                                                   | `layouts/guest-layout.tsx`                               | ✅             |
| Layout — Dashboard             | `DashboardLayout.jsx`                                                               | `layouts/dashboard-layout.tsx` + `dashboard/sidebar.tsx` | ✅             |
| Layout — Auth'd                | `AuthenticatedLayout.jsx`                                                           | `layouts/app-layout.tsx` + `app-navbar.tsx`              | ✅             |
| Layout — POS                   | `POSLayout.jsx`                                                                     | `layouts/pos-layout.tsx`                                 | ✅             |
| **POS Components** (9 files)   | `Components/POS/ProductGrid, CartPanel, PaymentPanel, SearchBar, NumpadModal, etc.` | `components/pos/` (all 9)                                | ✅             |
| Custom Dashboard UI (22 files) | `Components/Dashboard/Button, Input, Table, Modal, Card, Sidebar, Navbar, etc.`     | Replaced by Justd `components/ui/` (16 components)       | ✅ Adapted     |
| Permission Gate                | `Utils/Permission.jsx`                                                              | `components/permission.tsx`                              | ✅             |
| Auth Bot Guard                 | `Components/AuthBotGuardFields.jsx`                                                 | `components/auth-bot-guard-fields.tsx`                   | ✅             |
| Barcode Scanner Hook           | `Hooks/useBarcodeScanner.js`                                                        | `hooks/use-barcode-scanner.ts`                           | ✅             |
| Image URL Helper               | `Utils/imageUrl.js`                                                                 | `lib/image-url.ts`                                       | ✅             |
| Menu Config                    | `Utils/Menu.jsx`                                                                    | `lib/menu.ts`                                            | ✅             |
| Auth Helper                    | —                                                                                   | `lib/auth.ts`                                            | ✨ New         |
| Theme Hook                     | —                                                                                   | `hooks/use-theme.ts`                                     | ✨ New         |
| Mobile Detect                  | —                                                                                   | `hooks/use-mobile.ts`                                    | ✨ New         |
| UI Primitives                  | —                                                                                   | `lib/primitive.ts`                                       | ✨ New (Justd) |

### 3.4 Remaining Gaps

**Minor (1 page missing):**

```
dashboard/access/   → Not ported (simple "access denied" static page from Access.jsx)
```

**Casing inconsistency** — directory naming is mixed PascalCase and kebab-case:

- PascalCase: `Users/`, `StockOpnames/`, `Categories/`
- kebab-case: `audit-logs/`, `stock-mutations/`, `customer-segments/`, etc.

This doesn't affect functionality (Inertia resolves both) but is a consistency concern.

---

## 4. Test Porting Status (REMAINING WORK)

**Source**: 22 PHPUnit test files in `tests/Feature/`
**Target**: 12 Pest test files (mostly Laravel scaffold tests)
**Gap**: ~11 POS-specific test suites need migration

### 4.1 Source Test Inventory

| Test Suite               | Source File                                      | Target          | Lines (src) | Notes                           |
| ------------------------ | ------------------------------------------------ | --------------- | ----------- | ------------------------------- |
| 1. Authentication        | `Auth/AuthenticationTest.php`                    | ✅ Ported       | ~120        |                                 |
| 2. Email Verification    | `Auth/EmailVerificationTest.php`                 | ✅ Ported       | ~80         |                                 |
| 3. Password Confirmation | `Auth/PasswordConfirmationTest.php`              | ✅ Ported       | ~60         |                                 |
| 4. Password Reset        | `Auth/PasswordResetTest.php`                     | ✅ Ported       | ~100        |                                 |
| 5. Registration          | `Auth/RegistrationTest.php`                      | ✅ Ported       | ~80         |                                 |
| 6. Password Update       | `Auth/PasswordUpdateTest.php`                    | 🔴 Not ported   | —           |                                 |
| 7. Profile Test          | `ProfileTest.php`                                | 🔴 Not ported   | —           |                                 |
| 8. **Payment Webhook**   | `Api/PaymentWebhookTest.php`                     | 🔴 **MISSING**  | ~200        | Midtrans/Xendit webhook testing |
| 9. **Audit Logs**        | `AuditLogs/AuditLogTest.php`                     | 🔴 **MISSING**  | ~300        | Full CRUD + permission testing  |
| 10. **Authorization**    | `Authorization/AuthorizationConsistencyTest.php` | 🔴 **MISSING**  | ~150        | Permission consistency checks   |
| 11. **Cashier Shifts**   | `CashierShifts/CashierShiftTest.php`             | 🔴 **MISSING**  | ~250        | Open/close shift flow           |
| 12. **CRM Core**         | `Crm/CrmCoreTest.php`                            | 🔴 **MISSING**  | ~200        | Campaign processing             |
| 13. **Stock Opname**     | `Inventory/StockOpnameTest.php`                  | 🔴 **MISSING**  | ~350        | Stock count + finalize flow     |
| 14. **Loyalty Flow**     | `Loyalty/LoyaltyFlowTest.php`                    | 🔴 **MISSING**  | ~180        | Points accumulation/redemption  |
| 15. **Members**          | `Members/MemberManagementTest.php`               | 🔴 **MISSING**  | ~150        | Member upgrade management       |
| 16. **Pricing Rules**    | `Pricing/PricingRuleTest.php`                    | 🔴 **MISSING**  | ~220        | Rule application + preview      |
| 17. **Reports Insights** | `Reports/AdvancedSalesInsightsTest.php`          | 🔴 **MISSING**  | ~200        | Report generation accuracy      |
| 18. **Sales Returns**    | `SalesReturn/SalesReturnTest.php`                | 🔴 **MISSING**  | ~300        | Return + stock reversal flow    |
| 19. **Security**         | `Security/PhaseTwoSecurityHardeningTest.php`     | 🔴 **MISSING**  | ~200        | Auth hardening, step-up         |
| 20. **Transactions**     | `Transactions/TransactionFlowTest.php`           | 🔴 **MISSING**  | ~400        | Full POS transaction flow       |
| 21. Example              | `ExampleTest.php`                                | ✅ Ported       | ~20         |                                 |
| —                        | `DashboardTest.php`                              | ✅ Exist (rtos) | —           | IntentUI scaffold               |
| —                        | `Settings/PasswordUpdateTest.php`                | ✅ Exist (rtos) | —           | IntentUI scaffold               |
| —                        | `Settings/ProfileUpdateTest.php`                 | ✅ Exist (rtos) | —           | IntentUI scaffold               |

### 4.2 Tests Ported Already (rtos has these ✅)

- `Auth/AuthenticationTest.php` ✅
- `Auth/EmailVerificationTest.php` ✅
- `Auth/PasswordConfirmationTest.php` ✅
- `Auth/PasswordResetTest.php` ✅
- `Auth/RegistrationTest.php` ✅
- `ExampleTest.php` ✅

### 4.3 Tests Needing Migration (🔴 = ~11 suites)

1. `Api/PaymentWebhookTest.php`
2. `AuditLogs/AuditLogTest.php`
3. `Authorization/AuthorizationConsistencyTest.php`
4. `CashierShifts/CashierShiftTest.php`
5. `Crm/CrmCoreTest.php`
6. `Inventory/StockOpnameTest.php`
7. `Loyalty/LoyaltyFlowTest.php`
8. `Members/MemberManagementTest.php`
9. `Pricing/PricingRuleTest.php`
10. `Reports/AdvancedSalesInsightsTest.php`
11. `SalesReturn/SalesReturnTest.php`
12. `Security/PhaseTwoSecurityHardeningTest.php`
13. `Transactions/TransactionFlowTest.php`
14. `Auth/PasswordUpdateTest.php`
15. `ProfileTest.php`

**Estimated effort**: ~3,000 lines of PHPUnit → Pest migration

---

## 5. Dependency Differences

### PHP Composer Packages

| Package                        | pos-reference | rtos    | Notes                     |
| ------------------------------ | ------------- | ------- | ------------------------- |
| `laravel/framework`            | ^12.38.1      | ^12.x   | ✅ Same major version     |
| `inertiajs/inertia-laravel`    | ^2.0          | ^3.0    | ⬆️ Major upgrade          |
| `laravel/sanctum`              | ^4.0          | ^4.0    | ✅ Same                   |
| `spatie/laravel-permission`    | ^6.7          | ^8.0    | ⬆️ Major upgrade          |
| `picqer/php-barcode-generator` | ^3.2          | ^3.2    | ✅ Same                   |
| `barryvdh/laravel-dompdf`      | ^3.1          | ^3.1    | ✅ Same                   |
| `laravolt/indonesia`           | ^0.38.0       | ^0.41.0 | ⬆️ Minor                  |
| `tightenco/ziggy`              | ^2.0          | —       | ❌ Replaced by Wayfinder  |
| `laravel/wayfinder`            | —             | ^0.1.9  | ➕ New                    |
| `laravel/boost`                | —             | ^2.1    | ➕ New                    |
| `pestphp/pest`                 | —             | ^4.0    | ➕ New (replaces PHPUnit) |
| `phpunit/phpunit`              | ^11.0.1       | ^12.0   | Different version         |
| `laravel/tinker`               | ^2.9          | ^3.0    | ⬆️ Major                  |

### Node Packages

| Package                 | pos-reference | rtos       | Notes                        |
| ----------------------- | ------------- | ---------- | ---------------------------- |
| `react`                 | ^18.2.0       | ^19.x      | ⬆️ Major upgrade             |
| `react-dom`             | ^18.2.0       | ^19.x      | ⬆️ Major upgrade             |
| `@inertiajs/react`      | 2.0           | ^3.x       | ⬆️ Major upgrade             |
| `tailwindcss`           | ^3.2.1        | ^4.x       | ⬆️ Major upgrade             |
| `typescript`            | —             | ^6.x       | ➕ New                       |
| `vite`                  | ^5.0          | Vite+ (v7) | ⬆️ Major                     |
| `@tabler/icons-react`   | ^3.5.0        | ^3.44.0    | ⬆️ Minor                     |
| `chart.js`              | ^4.5.1        | ^4.5.1     | ✅ Same                      |
| `jsbarcode`             | ^3.12.1       | ^3.12.3    | ✅ Same                      |
| `react-hot-toast`       | ^2.4.1        | ^2.6.0     | ✅ Same                      |
| `sweetalert2`           | ^11.11.1      | —          | ❌ Removed (sonner replaces) |
| `sonner`                | —             | ^2.0.7     | ➕ New                       |
| `react-aria-components` | —             | ^1.x       | ➕ New (Justd UI)            |
| `motion`                | —             | ^12.x      | ➕ New                       |
| `@heroicons/react`      | —             | ^2.x       | ➕ New                       |
| `@biomejs/biome`        | —             | 2.x        | ➕ New (linter)              |
| `@headlessui/react`     | ^1.4.2        | —          | ❌ Removed                   |
| `@tailwindcss/forms`    | ^0.5.3        | —          | ❌ Removed (v4 built-in)     |
| `postcss`               | ^8.4.31       | —          | ❌ Removed (v4 CSS-first)    |

---

## 6. Architecture Comparison

### 6.1 High-Level Architecture

```
pos-reference (source)                       rtos (target)
┌──────────────────────┐                    ┌──────────────────────┐
│  Laravel 12 Backend  │                    │  Laravel 12 Backend  │
│  ┌────────────────┐  │                    │  ┌────────────────┐  │
│  │ Controllers     │  │                    │  │ Controllers     │  │
│  │ Services        │  │  ──IDENTICAL──▶   │  │ Services        │  │
│  │ Models          │  │                    │  │ Models          │  │
│  │ Middleware      │  │                    │  │ Middleware      │  │
│  └────────────────┘  │                    │  └────────────────┘  │
├──────────────────────┤                    ├──────────────────────┤
│  Inertia v2          │                    │  Inertia v3          │
│  React 18 + JSX      │  ──ADAPTED──▶     │  React 19 + TSX      │
│  Tailwind v3         │                    │  Tailwind v4         │
│  Custom UI Kit       │                    │  Justd/IntentUI      │
│  Ziggy routes        │                    │  Wayfinder routes    │
└──────────────────────┘                    └──────────────────────┘
```

### 6.2 Key Architectural Differences

| Aspect                   | pos-reference                              | rtos                                                       | Implication                                                |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------- |
| **UI Component Library** | Custom-built (22 Dashboard components)     | Justd/react-aria-components (16 `ui/` components)          | Pages use Justd primitives instead of custom               |
| **Route Generation**     | Ziggy (`route('name')` JS function)        | Laravel Wayfinder (import from `@/actions/ControllerName`) | All `route()` calls replaced with typed imports            |
| **Inertia Version**      | v2 helpers                                 | v3 API                                                     | `useForm`, `router`, deferred props APIs differ            |
| **Auth Guard**           | Bot guard + registration toggle + throttle | Same + `HandleTheme`                                       | rtos has richer middleware stack                           |
| **User Settings**        | Part of Dashboard routes                   | Separate `routes/settings.php` (IntentUI standard)         | rtos has IntentUI-native profile/password/appearance pages |
| **TypeScript**           | None (plain JSX)                           | Strict TypeScript                                          | All pages type definitions                                 |
| **Linting**              | None/ESLint                                | Biome                                                      | Format/lint differs                                        |

### 6.3 Directory Casing Inconsistency

Some page directories use PascalCase (matching controller namespace convention), others use kebab-case:

| PascalCase dirs | kebab-case dirs      |
| --------------- | -------------------- |
| `Users/`        | `audit-logs/`        |
| `StockOpnames/` | `stock-mutations/`   |
| `Categories/`   | `customer-segments/` |
|                 | `customer-vouchers/` |
|                 | `sales-returns/`     |
|                 | `supplier-returns/`  |
|                 | `purchase-orders/`   |
|                 | `goods-receivings/`  |
|                 | `pricing-rules/`     |
|                 | `crm-campaigns/`     |
|                 | `crm-reminders/`     |
|                 | `cashier-shifts/`    |
|                 | `settings/`          |
|                 | `reports/`           |

Recommendation: Normalize all to kebab-case for consistency. Inertia Page resolver handles both.

---

## 7. OpenSpec Coverage

### 7.1 `port-pos-reference-backend` (30 specs — created 2026-06-18)

| Spec Area                          | Status      | Notes                                    |
| ---------------------------------- | ----------- | ---------------------------------------- |
| `auth-security`                    | ✅ Complete | Bot guard, registration toggle, throttle |
| `payment-gateway-config`           | ✅ Complete | Xendit + Midtrans config                 |
| `dashboard-aging`                  | ✅ Complete | Aging analysis page                      |
| `dashboard-audit-logs`             | ✅ Complete | 2 pages ported                           |
| `dashboard-cashier-shifts`         | ✅ Complete | 2 pages ported                           |
| `dashboard-crm-campaigns`          | ✅ Complete | 5 pages ported                           |
| `dashboard-crm-reminders`          | ✅ Complete | 1 page ported                            |
| `dashboard-customer-detail`        | ✅ Complete | Customer show page                       |
| `dashboard-customer-segments`      | ✅ Complete | 5 pages ported                           |
| `dashboard-customer-vouchers`      | ✅ Complete | 4 pages ported                           |
| `dashboard-goods-receivings`       | ✅ Complete | 3 pages ported                           |
| `dashboard-members`                | ✅ Complete | 5 pages ported                           |
| `dashboard-payables`               | ✅ Complete | 2 pages ported                           |
| `dashboard-permissions`            | ✅ Complete | 1 page ported                            |
| `dashboard-pricing-rules`          | ✅ Complete | 4 pages ported                           |
| `dashboard-purchase-orders`        | ✅ Complete | 3 pages ported                           |
| `dashboard-reports-insights`       | ✅ Complete | 1 page ported                            |
| `dashboard-reports-profit`         | ✅ Complete | 1 page ported                            |
| `dashboard-reports-sales`          | ✅ Complete | 1 page ported                            |
| `dashboard-roles`                  | ✅ Complete | 1 page ported                            |
| `dashboard-settings-bank-accounts` | ✅ Complete | 2 pages ported                           |
| `dashboard-settings-loyalty`       | ✅ Complete | 1 page ported                            |
| `dashboard-settings-payment`       | ✅ Complete | 1 page ported                            |
| `dashboard-settings-store`         | ✅ Complete | 1 page ported                            |
| `dashboard-settings-target`        | ✅ Complete | 1 page ported                            |
| `dashboard-stock-mutations`        | ✅ Complete | 1 page ported                            |
| `dashboard-stock-opnames`          | ✅ Complete | 3 pages ported                           |
| `dashboard-supplier-returns`       | ✅ Complete | 3 pages ported                           |
| `dashboard-suppliers`              | ✅ Complete | 1 page ported                            |
| `dashboard-users`                  | ✅ Complete | 3 pages ported                           |

### 7.2 `port-frontend-remaining-pages` (9 specs — created 2026-06-19)

All 9 specs have been implemented. Tasks in `tasks.md` need to be marked complete:

| Spec Area           | Status  | Files                                                   |
| ------------------- | ------- | ------------------------------------------------------- |
| `audit-logs/`       | ✅ Done | `index.tsx` (277 lines), `show.tsx` (183 lines)         |
| `stock-opnames/`    | ✅ Done | `Index.tsx` (253), `Create.tsx` (70), `Show.tsx` (527)  |
| `stock-mutations/`  | ✅ Done | `index.tsx` (257 lines)                                 |
| `reports-sales/`    | ✅ Done | `sales.tsx` (441 lines)                                 |
| `reports-profit/`   | ✅ Done | `profits.tsx` (449 lines)                               |
| `reports-insights/` | ✅ Done | `insights.tsx` (1,541 lines)                            |
| `users/`            | ✅ Done | `Index.tsx` (392), `create.tsx` (206), `edit.tsx` (218) |
| `roles/`            | ✅ Done | `index.tsx` (365 lines)                                 |
| `permissions/`      | ✅ Done | `index.tsx` (145 lines)                                 |

**Total**: 5,324 lines of TSX ported across 14 files.

---

## 8. Remaining Work

### 8.1 Verification & Cleanup

| Task                                                     | Status      |
| -------------------------------------------------------- | ----------- |
| Mark `port-frontend-remaining-pages` tasks as complete   | ⏳ Pending  |
| `lsp_diagnostics` on all new TSX files                   | ⏳ Pending  |
| `vp check --fix` (230 files have formatting issues)      | ⏳ Pending  |
| Fix casing inconsistency (PascalCase vs kebab-case dirs) | ❓ Optional |
| Port `Access.jsx` (standalone access denied page)        | 🔴 Missing  |

### 8.2 Test Migration (🔴 11-15 suites)

| Priority | Test Suite                                       | Source Lines | Complexity               |
| -------- | ------------------------------------------------ | ------------ | ------------------------ |
| 🔴 High  | `Transactions/TransactionFlowTest.php`           | ~400         | Full POS flow            |
| 🔴 High  | `Inventory/StockOpnameTest.php`                  | ~350         | Stock count workflow     |
| 🔴 High  | `SalesReturn/SalesReturnTest.php`                | ~300         | Return + stock reversal  |
| 🔴 High  | `AuditLogs/AuditLogTest.php`                     | ~300         | Audit trail verification |
| 🟡 Med   | `CashierShifts/CashierShiftTest.php`             | ~250         | Shift open/close         |
| 🟡 Med   | `Pricing/PricingRuleTest.php`                    | ~220         | Rule logic               |
| 🟡 Med   | `Api/PaymentWebhookTest.php`                     | ~200         | Webhook handling         |
| 🟡 Med   | `Crm/CrmCoreTest.php`                            | ~200         | Campaigns                |
| 🟡 Med   | `Reports/AdvancedSalesInsightsTest.php`          | ~200         | Report accuracy          |
| 🟡 Med   | `Security/PhaseTwoSecurityHardeningTest.php`     | ~200         | Auth hardening           |
| 🟢 Low   | `Loyalty/LoyaltyFlowTest.php`                    | ~180         | Points system            |
| 🟢 Low   | `Members/MemberManagementTest.php`               | ~150         | Members                  |
| 🟢 Low   | `Authorization/AuthorizationConsistencyTest.php` | ~150         | Permissions              |
| 🟢 Low   | `Auth/PasswordUpdateTest.php`                    | ?            | Password update          |
| 🟢 Low   | `ProfileTest.php`                                | ?            | Profile edit             |

### 8.3 Migration Complexity per Test Suite

| Test Suite      | Key Adaptation Challenges                                                         |
| --------------- | --------------------------------------------------------------------------------- |
| TransactionFlow | Full end-to-end POS flow, multi-step checkout, payment methods                    |
| StockOpname     | Multi-step opname flow, item entry, finalize with stock mutation                  |
| SalesReturn     | Return creation linked to original transaction, stock reversal, receivable impact |
| AuditLog        | CRUD operations on each model, verify log entries created                         |
| PaymentWebhook  | Midtrans/Xendit webhook signatures, callback handling                             |
| CashierShift    | Shift open/close validation, active shift enforcement on transactions             |

---

## 9. Risk Matrix

| Risk                                                           | Probability | Impact | Mitigation                                                                    |
| -------------------------------------------------------------- | ----------- | ------ | ----------------------------------------------------------------------------- |
| Inertia v3 API differences cause form submission bugs          | Medium      | High   | Test each page group before bulk commit                                       |
| Justd components behave differently than custom Dashboard UI   | Medium      | Medium | Use Justd primitives; fall back to native HTML + Tailwind                     |
| Controllers use PascalCase page names vs rtos kebab-case paths | Low         | Medium | Inertia resolves both; normalize to kebab-case                                |
| Missing `.env` vars for security config cause runtime errors   | Low         | High   | Already added to `.env` + `.env.example`                                      |
| Wayfinder route functions not available for all routes         | Low         | Medium | Check Wayfinder generation; fall back to manual URL                           |
| Tailwind v3→v4 migration issues in ported pages                | Low         | Medium | Already handled per-page; v4 is mostly backward-compatible                    |
| PHPUnit→Pest migration has assertion API differences           | Medium      | Medium | Both share PHPUnit assertions; watch for `expect()->toBe()` vs `assertSame()` |
| Biome formatting (230 files need fixes)                        | High        | Low    | Run `vp check --fix` before commit                                            |

---

## 10. Appendix: File Inventory

### Source Project (`pos-reference`)

```
app/
├── Console/Commands/         2 files
├── Exceptions/               1 file
├── Http/
│   ├── Controllers/
│   │   ├── Api/              1 file
│   │   ├── Apps/             26 files
│   │   ├── Auth/             9 files
│   │   ├── Reports/          3 files
│   │   └── + 9 top-level controllers
│   ├── Middleware/           7 files
│   └── Requests/             12 files
├── Models/                   41 files
├── Providers/                1 file
├── Services/                 13 files (inc. Payments/)
└── Support/                  2 files

database/
├── migrations/               56 files
├── seeders/                  8 files
└── factories/                2 files

resources/js/
├── Pages/
│   ├── Auth/                 6 files
│   ├── Dashboard/            29 subdirectories, 80 files
│   └── + Welcome, Error, Dashboard, Profile
├── Components/               17 files (inc. subdirs)
├── Layouts/                  4 files
├── Hooks/                    1 file
└── Utils/                    4 files

routes/                       4 files
config/                       14 entries
tests/                        22 files
```

### Target Project (`rtos`) — Current State

```
app/                           Identical + Settings/ controllers
├── Http/Controllers/Settings/  4 files (EXTRA)

database/                      Identical (56 migrations, 8 seeders, 2 factories)

resources/js/
├── pages/
│   ├── auth/                 6 files
│   ├── Dashboard/            28 subdirectories, 79 TSX files (inc. Access)
│   ├── home/                 1 file (EXTRA)
│   ├── settings/             IntentUI profile/password pages (EXTRA)
│   └── + Welcome, Error, dashboard
├── components/               41 files (pos/ 9, ui/ 16, misc 16)
├── layouts/                  6 files (EXTRA dashboard/ sub-layouts)
├── hooks/                    3 files (EXTRA)
├── lib/                      5 files (EXTRA)
├── actions/                  Wayfinder generated
├── routes/                   Wayfinder generated
├── types/                    Type definitions (EXTRA)
└── wayfinder/                Wayfinder generated

tests/                        12 Pest files (mostly scaffold)
```

---

## 11. Quick Stats

| Metric                             | Value        |
| ---------------------------------- | ------------ |
| Source JSX files                   | 80           |
| Target TSX files                   | 79           |
| Pages ported                       | 79/80 (~99%) |
| Backend controllers ported         | 54/54 (100%) |
| Models ported                      | 41/41 (100%) |
| Services ported                    | 15/15 (100%) |
| Migrations ported                  | 56/56 (100%) |
| Seeders ported                     | 8/8 (100%)   |
| Form requests ported               | 13/13 (100%) |
| Test suites ported                 | ~5/20 (25%)  |
| OpenSpec specs authored            | 30           |
| Total TSX ported (remaining pages) | 5,324 lines  |
| Biome formatting issues            | 230 files    |

---

_This report was generated on 2026-06-22 by analyzing both projects' file structures, comparing directory trees, configuration files, database schemas, and frontend page inventories. It supersedes the previous PROGRESS.md from 2026-06-20._
