## Why

The current codebase is a fully-functional Retail POS (Point of Sale) system — but the core architecture (Laravel 12 + Inertia.js v2 + React 19 + Tailwind CSS v4), RBAC, payment gateways, transaction engine, customer management, and dashboard patterns are a near-perfect foundation for an online zoo e-ticket booking system. Rather than starting from scratch, repurposing this codebase saves ~60% of initial development effort by reusing auth, admin UI patterns, CRUD scaffolding, payment processing, PDF generation, and reporting infrastructure.

The zoo needs a digital ticketing platform with: public online booking (date/type selection → payment → e-ticket), gate-side QR validation, daily capacity management, show scheduling, and an admin dashboard for operations. This proposal maps the existing POS domain onto the zoo ticketing domain and identifies what to keep, what to adapt, and what to build new.

## What Changes

### Keep (Reuse As-Is)

- **Auth system** — login, registration, email verification, password management, RBAC (roles/permissions)
- **Settings system** — store profile → zoo profile, target settings → capacity/sales targets
- **Payment gateways** — Midtrans + Xendit already integrated; bank transfer for manual payments
- **Cart engine** — add-to-cart, hold/resume cart, cart pricing flows
- **Transaction engine** — checkout flow, invoice numbering, payment tracking
- **PDF generation** — invoice template → e-ticket template
- **Reporting** — sales reports, insights dashboard (relabel product → ticket)
- **Audit logs** — activity tracking for staff operations
- **Dashboard layout** — sidebar nav, CRUD page patterns, Inertia + React component architecture
- **Customer management** — rename to visitors; CRM segments/campaigns reusable for zoo marketing
- **Voucher/loyalty system** — reusable for promo codes and loyalty points
- **UI component library** — react-aria-components (Justd/IntentUI) already present

### Adapt (Modify Existing)

- **Products → Ticket Types** — strip physical-goods fields (SKU, stock quantity); add `is_active`, `description`, `terms`, `max_per_order`
- **Categories → Ticket Categories** — rename; use for ticket tiers (Adult, Child, VIP, Student, Group)
- **Customers → Visitors** — add `date_of_birth` (age-based pricing), `id_card_number`, `nationality`, `phone` required
- **Transactions → Bookings** — add `visit_date`, `visitor_count`, `booking_reference`, `status` enum (pending/confirmed/cancelled/used/expired), `checked_in_at`, `gate_id`, `cancelled_at`, `cancel_reason`
- **Transaction Details → Booking Items** — each line item is a ticket; add `qr_code`, `ticket_number`, `is_used`, `used_at`, `used_at_gate_id`
- **Settings → Zoo Settings** — reframe store profile (name, address → zoo name, address, operating hours); add capacity defaults
- **Reports** — relabel product-centric metrics to ticket-type metrics; add capacity utilization reports

### Build New (Not in Codebase)

- **Daily Availability Engine** — date × ticket-type capacity matrix; real-time slot availability queries; database-level concurrency guards
- **Public Booking Site** — no-auth-required pages: landing/zoo info, date picker with availability, ticket selection, visitor info form, checkout, payment, e-ticket download
- **E-Ticket Generator** — unique QR code per ticket (booking item), PDF with branded template, email delivery
- **Gate Entry Management** — QR scanner interface (webcam or manual code entry), ticket validation, entry logging, re-entry rules
- **Shows / Attractions Module** — show schedules (time, location, capacity), show ticket or reservation, capacity per show session
- **Capacity Dashboard** — real-time occupancy gauge, daily/weekly/monthly capacity trends, overbooking alerts
- **Waivers / Terms** — mandatory digital waiver acceptance during booking for certain ticket types

### Remove (POS-Specific Dead Code)

- Suppliers, Purchase Orders, Goods Receiving, Supplier Returns — supply chain
- Stock Opname, Stock Mutations — physical inventory
- Receivables / Payables — credit accounts
- Cashier Shifts — retail cash handling
- Pricing Rules (bundles, qty breaks, buy-get) — retail promotions (replace with simple date-based promos)
- Shipping cost, shipping documents — physical delivery
- Midtrans payment webhook — keep if needed, but Xendit is more common in Indonesia for ticketing

## Capabilities

### New Capabilities

- `ticket-types`: Ticket type definition (name, category, base price, description, terms, max per order, age range)
- `date-availability`: Daily capacity matrix per ticket type; real-time availability queries; date blocking
- `public-booking`: Guest-facing booking flow — date picker, ticket selection, visitor info, checkout, confirmation
- `e-ticket-generation`: QR code generation, PDF ticket rendering, email delivery, download portal
- `gate-entry`: QR scanning, ticket validation, entry logging, gate management, re-entry control
- `capacity-management`: Capacity configuration, overbooking prevention, utilization monitoring, waitlist
- `shows-attractions`: Show/event schedules, show ticket add-ons, session capacity, calendar display
- `zoo-admin`: Zoo dashboard (capacity %, today's check-ins, revenue), ticket type CRUD, booking lookup, refunds/cancellations
- `visitor-management`: Visitor database with booking history, age-based analytics, group bookings, VIP tracking
- `payment-config`: Payment gateway configuration (Xendit primary, bank transfer fallback), refund processing

### Modified Capabilities

_(No existing specs to modify — this is the first capability set.)_

## Impact

- **BREAKING**: Existing POS data model migrations for products, stock, suppliers, purchase orders, and cashier shifts become unused. A cleanup migration should deprecate or archive these tables.
- **BREAKING**: The `Transaction` model gains new required fields (`visit_date`, `status`, `booking_reference`). Existing POS transactions remain but new flows use the extended schema.
- **New dependencies**: `simplesoftwareio/simple-qrcode` (QR generation), `barryvdh/laravel-dompdf` or `laravel-dompdf` (PDF), email service (Mailgun/SMTP).
- **Frontend**: The public booking site requires new Inertia pages under a guest layout (no sidebar). The admin dashboard largely reuses existing layouts.
- **Database**: ~15 new tables (availability matrix, ticket types, gates, shows, show sessions). ~10 tables become unused.
- **Routes**: New public route group (no auth middleware), new webhook for e-ticket open/rate tracking.
