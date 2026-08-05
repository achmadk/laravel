## Context

This project is a production-grade Retail POS system built on Laravel 12 + Inertia.js v2 + React 19 + Tailwind CSS v4. It has 41 Eloquent models, 56 migration files, 37+ controllers, a full RBAC system, integrated payment gateways (Midtrans/Xendit), PDF generation, and an admin dashboard with ~60 Inertia page components.

We are repurposing this codebase into a zoo e-ticket booking system. The strategy is: **keep the infrastructure, adapt the domain models, remove POS-specific modules, and build zoo-specific modules on top**.

The existing architecture — Laravel backend, Inertia/React frontend with react-aria-components (Justd/IntentUI), Tailwind CSS v4, Wayfinder routes, RBAC with step-up authentication, payment gateway abstraction — is all well-suited to a ticketing system.

## Goals / Non-Goals

**Goals:**

- Reuse existing auth, RBAC, settings, payment gateways, PDF generation, and admin dashboard layout
- Create a public-facing booking site (no auth required) that reuses the existing Inertia/React stack
- Implement date-based availability and capacity management
- Generate scannable QR e-tickets with PDF download and email delivery
- Provide gate-side QR validation interface
- Show/attraction scheduling and add-on booking
- Maintain clean separation between public and admin interfaces
- Remove POS dead code cleanly (no orphan tables or routes)

**Non-Goals:**

- Multi-language support (future enhancement)
- Mobile native apps (responsive web is sufficient)
- Integration with external ticketing platforms (traveloka, tiket.com) — API layer for resellers is future scope
- POS functionality — retail features are removed, not maintained in parallel
- Hardware integration (turnstiles, biometrics) — QR scanning via webcam/manual entry only
- Membership/yearly pass management — basic support only, not a full CRM

## Decisions

### Decision 1: Separate public booking as a distinct Inertia page group under a guest layout

**Rationale**: The existing admin layout has sidebar navigation, auth middleware, and permission checks — none of which apply to the public booking flow. Rather than fighting the existing layout, we create a new layout group (`resources/js/layouts/guest/`) for public pages. Both share the same component library, ensuring visual consistency.
**Alternatives considered**: Separate SPA (Vite + React standalone) — rejected due to duplicated auth/session handling and payment gateway integration effort.

### Decision 2: Extend Transaction model rather than creating a separate Booking model

**Rationale**: The Transaction model already handles order creation, payment tracking, invoice numbering, and payment gateway integration. Creating a parallel Booking model duplicates this logic. Instead, we add `visit_date`, `status` (extended enum), `booking_reference` (public-facing readable ID like `ZOO-250625-0001`), and a polymorphic `transactionable` relationship for extensibility.
**Risk**: Existing POS transaction queries need careful scoping to exclude bookings. Mitigation: add a `type` column (enum: pos, booking) to scope all queries.

### Decision 3: DailyAvailability as a separate model (not Product extension)

**Rationale**: POS products have scalar stock. Tickets have 2D availability (date × capacity). Overloading the `products` table with date-joined data would be messy. A clean `daily_availability` table with `ticket_type_id`, `date`, `total_capacity`, `booked`, `price_override` is simpler to query and reason about.
**Consequence**: The existing cart and pricing systems need minor adaptation to read from `daily_availability.price_override` instead of `products.price`.

### Decision 4: QR codes as signed tokens (not random UUIDs)

**Rationale**: Random UUIDs in QR codes require a database lookup on every scan. Signed tokens (HMAC-SHA256 over booking ref + ticket number + date) can be verified cryptographically without a database hit for the initial validation. The DB is only queried to mark the ticket as used. This reduces gate scan latency significantly.
**Implementation**: `CryptographicQrSigner` service class; token format: `{booking_ref}.{ticket_number}.{expires_at}.{hmac_signature}` base64-encoded.

### Decision 5: Gate scanner on web (no native app)

**Rationale**: A web-based scanner using the Camera API (MediaDevices.getUserMedia) and a QR scanning library (instascan or `html5-qrcode`) works on any device with a browser — no app store deployment, no update coordination, works on cheap Android tablets at gates. The page auto-detects camera and falls back to manual code entry.
**Alternative considered**: Native apps — rejected for deployment complexity and cost.

### Decision 6: Xendit primary, manual bank transfer fallback

**Rationale**: Xendit is already partially integrated. It supports the payment methods most relevant for Indonesian zoo visitors (QRIS, virtual accounts, e-wallets). Manual bank transfer reuse existing bank account management UI. Midtrans is kept as a secondary option in config but not actively used.

### Decision 7: Remove POS modules, don't soft-disable

**Rationale**: Keeping dead POS code (suppliers, purchase orders, stock opname, receivables, payables, cashier shifts) creates confusion and increases maintenance surface. These modules are removed cleanly — migrations to drop tables, controllers/routes deleted, menu items removed. The code remains accessible via git history.
**Migration**: Archive existing POS data before table drops via a console command.

## Data Model — Key Schema Changes

```
-- NEW TABLES

ticket_types
  id, name, category (enum: adult/child/vip/student/group), base_price,
  description, terms, min_age, max_age, max_per_order, is_active,
  sort_order, created_at, updated_at, deleted_at

daily_availability
  id, ticket_type_id (FK), date, total_capacity, booked (default 0),
  price_override (nullable), is_blocked (default false),
  created_at, updated_at
  UNIQUE(ticket_type_id, date)

gates
  id, name, location, type (enum: entry/exit), is_active, created_at, updated_at

shows
  id, name, description, location, capacity, duration_minutes,
  image_url, is_active, created_at, updated_at, deleted_at

show_sessions
  id, show_id (FK), date, start_time, end_time, capacity, booked,
  created_at, updated_at
  UNIQUE(show_id, date, start_time)

booking_visitors (pivot for booking_item → visitor details)
  id, booking_item_id (FK), name, date_of_birth, id_card_number,
  is_admitted, admitted_at, admitted_gate_id (FK)
  -- Each booking item = 1 ticket = 1 visitor

waitlist
  id, ticket_type_id (FK), date, email, name, claimed_at,
  notified_at, expires_at, created_at

-- MODIFIED TABLES

transactions (rename conceptual to "bookings")
  + type: enum (pos, booking) default 'pos'
  + visit_date: date nullable
  + booking_reference: string nullable unique
  + status: extend enum with 'pending', 'confirmed', 'cancelled', 'refunded', 'partially_refunded'
  + visitor_count: int nullable
  + checked_in_at: timestamp nullable
  + cancellation_reason: text nullable
  + refund_amount: decimal nullable
  + refund_method: string nullable
  + marketing_consent: boolean default true

transaction_details (renamed conceptual to "tickets")
  + ticket_type_id: FK nullable
  + qr_token: text nullable
  + qr_code_path: string nullable
  + ticket_number: string nullable unique
  + is_used: boolean default false
  + used_at: timestamp nullable
  + used_at_gate_id: FK nullable

customers
  + date_of_birth: date nullable
  + id_card_number: string nullable
  + nationality: string nullable
  + emergency_contact: string nullable
  + marketing_consent: boolean default true
  + total_visits: int default 0
  + last_visit_date: date nullable

-- REMOVED TABLES (drop after data archive)
  suppliers, purchase_orders, purchase_order_items, goods_receivings,
  goods_receiving_items, supplier_returns, supplier_return_items,
  stock_opnames, stock_opname_items, stock_mutations,
  receivables, receivable_payments, payables, payable_payments,
  cashier_shifts, pricing_rules, pricing_rule_qty_breaks,
  pricing_rule_bundle_items, pricing_rule_buy_get_items, profits
```

## Route Design

```
# Public (no auth)
GET  /                          → Zoo landing / hero page
GET  /booking                   → Date picker + ticket selection
POST /booking/check-availability → Availability check API
POST /booking/cart/add          → Add to cart
GET  /booking/cart              → View cart
POST /booking/checkout          → Create booking (pending payment)
GET  /booking/{reference}/pay   → Payment page
POST /booking/{reference}/pay   → Initiate payment
GET  /booking/{reference}/confirmation → Confirmation + ticket download
GET  /booking/download          → Download tickets by ref+email
POST /booking/download          → Lookup booking for download
GET  /booking/{reference}/status → Booking status lookup
POST /booking/waitlist          → Join waitlist
GET  /shows                     → Show schedule public

# Admin (auth + RBAC)
GET  /dashboard/zoo             → Zoo operations dashboard
RESOURCE /dashboard/ticket-types  → Ticket type CRUD
POST /dashboard/ticket-types/{id}/availability → Manage availability
GET  /dashboard/availability    → Capacity calendar overview
POST /dashboard/availability/block → Block dates
POST /dashboard/availability/seasonal-pricing → Seasonal pricing
GET  /dashboard/bookings        → Booking list/search
GET  /dashboard/bookings/{ref}  → Booking detail
POST /dashboard/bookings/{ref}/cancel → Cancel booking
POST /dashboard/bookings/{ref}/refund → Process refund
POST /dashboard/bookings/{ref}/resend-tickets → Resend e-tickets
GET  /dashboard/gates           → Gate management
RESOURCE /dashboard/gates       → Gate CRUD
GET  /dashboard/scanner         → Gate scanner interface
POST /dashboard/scanner/validate → Validate QR code
GET  /dashboard/shows           → Show management
RESOURCE /dashboard/shows       → Show CRUD
POST /dashboard/shows/{id}/sessions → Manage show sessions
GET  /dashboard/reports/daily   → Daily operations report
GET  /dashboard/reports/demographics → Visitor demographics
GET  /dashboard/reports/capacity → Capacity utilization report

# Webhooks
POST /api/webhooks/xendit       → Payment notification (exists, extend)
POST /api/webhooks/email/open   → Email open tracking

# Keep (existing, minimally modified)
GET  /dashboard/settings        → Zoo settings (was store settings)
GET  /dashboard/settings/payments → Payment config
GET  /dashboard/settings/bank-accounts → Bank accounts
     /dashboard/users           → User management
     /dashboard/roles           → RBAC
     /dashboard/permissions     → Permissions
     /dashboard/profile         → Profile
```

## Risks / Trade-offs

| Risk                                                             | Mitigation                                                                                                                                                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overbooking during high-concurrency** (popular dates)          | Database-level pessimistic lock on `daily_availability` row during booking confirmation. Atomic `UPDATE ... SET booked = booked + 1 WHERE booked < total_capacity` with affected rows check. |
| **QR code forgery**                                              | HMAC-signed tokens with server-side secret. Signature verified on scan before any DB query.                                                                                                  |
| **E-ticket PDF delivery failure**                                | Queue email sending (already using queues). Store PDF on S3/local as fallback. Provide download page as alternative.                                                                         |
| **Gate scanner offline**                                         | Manual code entry fallback (6-digit ticket number). Printed QR as backup.                                                                                                                    |
| **Data loss during POS module removal**                          | Archive script dumps removed tables to JSON files before migration. Git history preserves all code.                                                                                          |
| **Existing POS queries breaking from Transaction model changes** | `type` column scoping: all existing queries default to `where('type', 'pos')`. No change to existing POS behavior.                                                                           |
| **Public booking site performance under load**                   | Cache availability matrix (Redis) with 5-minute TTL. Only the atomic decrement at booking confirmation hits the DB.                                                                          |
| **Refund gateway limitations**                                   | Not all Xendit payment methods support partial refunds. Handle with manual refund workflow + audit trail.                                                                                    |

## Migration Plan

1. **Phase 0 — Data Archive**: Run `php artisan zoo:archive-pos-data` to dump POS tables to JSON
2. **Phase 0 — Schema Migrations**: Run all new migrations (create tables, modify existing, drop unused)
3. **Phase 1 — Admin Foundation**: Ticket type CRUD, daily availability management, gate CRUD, zoo settings
4. **Phase 2 — Public Booking**: Date picker UI, cart flow, checkout, Xendit integration, booking confirmation
5. **Phase 3 — E-Tickets**: QR generation, PDF template, email delivery, download portal
6. **Phase 4 — Gate Scanner**: QR scanning interface, validation logic, entry logging
7. **Phase 5 — Shows**: Show management, show sessions, add-on in booking flow
8. **Phase 6 — Reporting & Polish**: Capacity dashboard, visitor analytics, daily reports, RBAC reconfiguration
9. **Phase 7 — Cleanup**: Remove POS routes, controllers, menu items, frontend pages

**Rollback**: Each phase is independently revertible via migration rollback + git revert. The POS data archive enables full restoration.

## Open Questions

- Should waitlist notifications be push (email) or pull (check page)? Email chosen for MVP.
- Should we support ticket transfers (renaming a ticket to another person)? Not for MVP.
- What is the exact QR code scanning library for the web gate interface? Evaluate `html5-qrcode` vs `instascan` vs native `BarcodeDetector` API.
- Annual membership / season pass — simple flag on ticket type or separate module? Simple flag for now.
