## 1. Phase B — Backend Config & Middleware

- [x] 1.1 Create `config/security.php` from pos-reference (auth throttling, bot guard, session, step-up configs)
- [x] 1.2 Update `config/services.php` — add `xendit` and `midtrans` sections
- [x] 1.3 Update `routes/auth.php` — add `registration.enabled`, `bot.guard`, `throttle` middleware to register/login/forgot-password/verification routes; add `PasswordController::update` route
- [x] 1.4 Update `.env.example` — add `AUTH_PUBLIC_REGISTRATION`, `AUTH_REGISTER_THROTTLE`, `AUTH_FORGOT_PASSWORD_THROTTLE`, `SESSION_SECURE_COOKIE`, `XENDIT_CALLBACK_TOKEN`
- [x] 1.5 Update `.env` — add the same 5 env vars
- [x] 1.6 Verify: run `php artisan config:cache` and check no errors; run `lsp_diagnostics` on changed files

## 2. Phase A — Core Business Pages

- [x] 2.1 Port Customer Show page (`Dashboard/Customers/Show`): TSX, Wayfinder routes, customer info + transaction history + segment membership
- [~] 2.2 Product pages (`Dashboard/Products/Index`, `Create`, `Edit`): already exist in rtos (verified) — no porting needed
- [~] 2.3 Category pages (`Dashboard/Categories/Index`, `Create`, `Edit`): already exist in rtos (verified) — no porting needed
- [x] 2.4 Port Supplier pages (`Dashboard/Suppliers/Index`): supplier listing with create/edit dialog

## 3. Phase A — Transaction Pages

- [~] 3.1 Sales Return pages (`Dashboard/SalesReturns/Index`, `Create`, `Show`): already exist in rtos (verified) — no porting needed
- [x] 3.2 Port Purchase Order pages (`Dashboard/PurchaseOrders/Index`, `Create`, `Show`): PO listing, create with supplier+items, detail with place/cancel
- [x] 3.3 Port Goods Receiving pages (`Dashboard/GoodsReceivings/Index`, `Create`, `Show`): receiving listing, create from PO, detail with discrepancies
- [x] 3.4 Port Supplier Return pages (`Dashboard/SupplierReturns/Index`, `Create`, `Show`): return listing, create with supplier+items, detail with complete/cancel

## 4. Phase A — Finance Pages

- [x] 4.1 Port Receivable pages (`Dashboard/Receivables/Index`, `Show`): receivable listing with filters, detail with payment history
- [ ] 4.2 Port Payable pages (`Dashboard/Payables/Index`, `Show`): payable listing, detail with payment history
- [ ] 4.3 Port Aging page (`Dashboard/Aging/Index`): aging analysis with overdue brackets

## 5. Phase A — Promotions & CRM Pages

- [ ] 5.1 Port Pricing Rule pages (`Dashboard/PricingRules/Index`, `Create`, `Edit`): rule listing, form with qty breaks/bundles/buy-get, preview
- [ ] 5.2 Port Customer Voucher pages (`Dashboard/CustomerVouchers/Index`, `Create`, `Edit`): voucher listing, form with value/conditions
- [ ] 5.3 Port Customer Segment pages (`Dashboard/CustomerSegments/Index`, `Create`, `Edit`, `Show`): segment listing, rule-based form, detail with member management
- [ ] 5.4 Port CRM Campaign pages (`Dashboard/CrmCampaigns/Index`, `Create`, `Edit`, `Show`): campaign listing, form with type/message/schedule, detail with delivery logs
- [ ] 5.5 Port CRM Reminders page (`Dashboard/CrmReminders/Index`): reminder listing
- [ ] 5.6 Port Member pages (`Dashboard/Members/Index`, `Create`, `Edit`, `Show`): member listing, form, detail with purchase history + points

## 6. Phase A — Operations Pages

- [ ] 6.1 Port Stock Opname pages (`Dashboard/StockOpnames/Index`, `Create`, `Show`): stock take listing, create with product counts, detail with finalize
- [ ] 6.2 Port Stock Mutation page (`Dashboard/StockMutations/Index`): mutation history listing
- [x] 6.3 Port Cashier Shift pages (`Dashboard/CashierShifts/Index`, `Show`): shift listing, detail with reconciliation
- [ ] 6.4 Port Audit Log pages (`Dashboard/AuditLogs/Index`, `Show`): log listing with filters, detail view

## 7. Phase A — Admin Pages

- [ ] 7.1 Port User pages (`Dashboard/Users/Index`, `Create`, `Edit`): user listing, create/edit forms with role assignment
- [ ] 7.2 Port Role page (`Dashboard/Roles/Index`): role listing
- [ ] 7.3 Port Permission page (`Dashboard/Permissions/Index`): permission matrix
- [ ] 7.4 Port Access/Error pages (`Dashboard/Access`, `Error`): access denied and error pages

## 8. Phase A — Report Pages

- [ ] 8.1 Port Sales Report page (`Dashboard/Reports/Sales`): sales report with date/payment/category filters
- [ ] 8.2 Port Profit Report page (`Dashboard/Reports/Profit`): profit/loss summary with date filter
- [ ] 8.3 Port Insights page (`Dashboard/Reports/Insights`): advanced sales insights with charts

## 9. Phase A — Settings Pages

- [x] 9.1 Port Payment Settings page (`Dashboard/Settings/Payment`): payment gateway configuration form
- [x] 9.2 Port Bank Account pages (`Dashboard/Settings/BankAccounts`, `BankAccountForm`): bank account listing, create/edit form
- [x] 9.3 Port Store Settings page (`Dashboard/Settings/Store`): store profile form
- [x] 9.4 Port Target Settings page (`Dashboard/Settings/Target`): sales target form
- [x] 9.5 Port Loyalty Settings page (`Dashboard/Settings/Loyalty`): loyalty program configuration

## 10. Verification & Cleanup

- [ ] 10.1 Run `lsp_diagnostics` on all changed/new TSX files — fix any type errors
- [ ] 10.2 Browse each new page and verify it renders without console errors
- [ ] 10.3 Run `vp check` to verify lint, types, and formatting
- [ ] 10.4 Test auth flows: registration, login, forgot-password with new middleware
- [ ] 10.5 Run `php artisan test --compact` to verify existing tests pass
