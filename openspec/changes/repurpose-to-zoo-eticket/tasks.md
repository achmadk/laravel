## 1. Setup & Data Layer

- [ ] 1.1 Create database migrations: ticket_types table, daily_availability table, gates table, shows table, show_sessions table, booking_visitors table, waitlist table
- [ ] 1.2 Create database migrations: add columns to transactions (type, visit_date, booking_reference, visitor_count, marketing_consent, cancellation_reason, refund_amount, refund_method, status extension)
- [ ] 1.3 Create database migrations: add columns to transaction_details (ticket_type_id, qr_token, qr_code_path, ticket_number, is_used, used_at, used_at_gate_id)
- [ ] 1.4 Create database migrations: add columns to customers (date_of_birth, id_card_number, nationality, emergency_contact, marketing_consent, total_visits, last_visit_date)
- [ ] 1.5 Create Eloquent models: TicketType, DailyAvailability, Gate, Show, ShowSession, BookingVisitor, Waitlist
- [ ] 1.6 Create model relationships: extend Transaction (type scoping, booking-specific accessors), extend TransactionDetail (ticket behaviors), extend Customer (visitor fields)
- [ ] 1.7 Create service classes: AvailabilityService (capacity check + atomic decrement), BookingService (cart→booking conversion), PaymentService (Xendit integration for bookings), QrCodeService, EmailTicketService
- [ ] 1.8 Create helpers: BookingReferenceGenerator (format ZOO-DDMMYY-XXXX), TicketNumberGenerator, CryptographicQrSigner
- [ ] 1.9 Create factory/seeders for TicketType, DailyAvailability, Gate, Show, ShowSession
- [ ] 1.10 Install new composer dependencies: simplesoftwareio/simple-qrcode, barryvdh/laravel-dompdf
- [ ] 1.11 Run data archive command: php artisan zoo:archive-pos-data

## 2. Admin Foundation — Ticket Types & Availability

- [ ] 2.1 Create TicketTypeController (CRUD) with FormRequest validation and permissions
- [ ] 2.2 Create Inertia pages: TicketTypeIndex, TicketTypeForm (create/edit) with react-aria-components
- [ ] 2.3 Create availability management UI: AvailabilityCalendar (date grid with per-ticket-type capacity)
- [ ] 2.4 Create bulk availability editor (set capacity for date range × ticket types)
- [ ] 2.5 Create date blocking UI with reason field
- [ ] 2.6 Create seasonal pricing override UI
- [ ] 2.7 Register routes, sidebar menu items, permissions for ticket-type CRUD
- [ ] 2.8 Create GateController (CRUD) with Inertia pages
- [ ] 2.9 Create ZooSettingController: refactor existing SettingController to zoo context

## 3. Public Booking Frontend

- [ ] 3.1 Create guest layout (no sidebar, public header/footer) in resources/js/layouts/guest/
- [ ] 3.2 Create ZooLanding page — hero section, zoo info, CTA to book
- [ ] 3.3 Create BookingCalendar page — date picker with availability indicators (green/yellow/red) using date picker component
- [ ] 3.4 Create TicketSelection component — quantity selectors per ticket type with real-time subtotal and age validation
- [ ] 3.5 Create VisitorInfoForm component — collect names, ages, contact info per ticket
- [ ] 3.6 Create CartSummary component — review cart before checkout
- [ ] 3.7 Create CheckoutPage — payment method selection (Xendit, bank transfer)
- [ ] 3.8 Create booking confirmation page — booking reference, ticket QR codes (inline), download link
- [ ] 3.9 Create ticket download portal — lookup by reference + email
- [ ] 3.10 Create booking status page — view booking, request new payment link

## 4. Booking Backend Logic

- [ ] 4.1 Implement availability check endpoint (POST /booking/check-availability)
- [ ] 4.2 Implement cart add/remove for public booking (reuse existing Cart model with date context)
- [ ] 4.3 Implement checkout flow: validate availability (with DB lock), create Transaction (type=booking), create TransactionDetails, generate ticket numbers
- [ ] 4.4 Implement payment initiation: create Xendit invoice on checkout, handle callback
- [ ] 4.5 Implement bank transfer flow: create booking as pending, admin confirmation triggers ticket generation
- [ ] 4.6 Implement payment expiry handling: void expired invoices, allow retry
- [ ] 4.7 Implement waitlist: join, notify on availability, time-limited claim window

## 5. E-Ticket Generation

- [ ] 5.1 Implement QrCodeService: generate HMAC-signed token per ticket, render QR code image (storage)
- [ ] 5.2 Create e-ticket PDF template (Laravel DomPDF): branded layout with zoo logo, QR per ticket, TnC, barcode
- [ ] 5.3 Implement e-ticket email delivery: Mailable class with PDF attachment, queue
- [ ] 5.4 Implement download portal backend: lookup booking by reference + email, return PDF
- [ ] 5.5 Implement resend e-ticket from admin dashboard

## 6. Gate Entry System

- [ ] 6.1 Create GateScanner React page with QR scanning (html5-qrcode library)
- [ ] 6.2 Implement validation endpoint: decode signed token → verify signature → check date/multi-entry/cancellation → mark used
- [ ] 6.3 Implement scan result UI: green/red animation, visitor info display, sound feedback
- [ ] 6.4 Implement manual code entry fallback (6-digit ticket number)
- [ ] 6.5 Create check-in log view (admin): today's entries filtered by gate, with export
- [ ] 6.6 Implement re-entry logic (multi-entry ticket types)
- [ ] 6.7 Register gate scanner route with Gate Officer role permission

## 7. Shows & Attractions

- [ ] 7.1 Create ShowController (CRUD) with Inertia pages
- [ ] 7.2 Create ShowSessionController: manage sessions per show (date, time, capacity)
- [ ] 7.3 Create public show schedule page
- [ ] 7.4 Implement show add-on during booking flow (optional, with capacity check)
- [ ] 7.5 Create show attendance tracking (scan show ticket at venue)

## 8. Reporting & Dashboard

- [ ] 8.1 Refactor DashboardController: zoo KPIs instead of retail KPIs
- [ ] 8.2 Create capacity utilization chart (real-time gauge + 30-day bar chart)
- [ ] 8.3 Create daily operations report (PDF): visitors, revenue, utilization, cancellations
- [ ] 8.4 Create visitor demographics report: age groups, new vs returning, group sizes
- [ ] 8.5 Create booking search/lookup UI with filters (reference, email, date, status)
- [ ] 8.6 Create booking detail page with cancellation/refund actions
- [ ] 8.7 Implement cancellation flow: free capacity, invalidate tickets, notify visitor
- [ ] 8.8 Implement refund processing (Xendit API + manual)
- [ ] 8.9 Configure zoo-specific RBAC roles: Admin, Ticketing Officer, Gate Officer, Manager, Viewer

## 9. POS Cleanup

- [ ] 9.1 Remove supplier-related controllers, models, routes, and Inertia pages
- [ ] 9.2 Remove purchase order / goods receiving controllers, models, routes, pages
- [ ] 9.3 Remove stock opname / stock mutation controllers, models, routes, pages
- [ ] 9.4 Remove receivables / payables controllers, models, routes, pages
- [ ] 9.5 Remove cashier shift controllers, models, routes, pages
- [ ] 9.6 Remove pricing rule controllers, models, routes, pages
- [ ] 9.7 Remove profit model and references
- [ ] 9.8 Remove shipping-related code (shipping cost column, shipping PDF)
- [ ] 9.9 Clean up sidebar menu — remove POS items, add zoo items
- [ ] 9.10 Drop unused tables migration (after data archive)
- [ ] 9.11 Final clean: php artisan optimize:clear, check for dead code references

## 10. Testing & QA

- [ ] 10.1 Write feature tests: booking flow (availability check → add to cart → checkout → payment)
- [ ] 10.2 Write feature tests: QR code generation and validation lifecycle
- [ ] 10.3 Write feature tests: gate scan — valid, expired, already-used, forged QR
- [ ] 10.4 Write feature tests: concurrency — overbooking prevention with parallel requests
- [ ] 10.5 Write feature tests: cancellation and refund flow
- [ ] 10.6 Write feature tests: admin CRUD for ticket types, gates, shows
- [ ] 10.7 Write feature tests: waitlist — join, notify, claim
- [ ] 10.8 Test PDF generation and email delivery (using Mail fake)
- [ ] 10.9 Run full test suite: php artisan test --compact
- [ ] 10.10 Run biome check and pint for code style
