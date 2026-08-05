## ADDED Requirements

### Requirement: Xendit as primary payment gateway

The system SHALL use Xendit as the primary online payment gateway. Existing Xendit integration in the codebase SHALL be configured and wired to the booking checkout flow. Xendit SHALL handle credit/debit cards, virtual accounts, QRIS, and e-wallet payments.

#### Scenario: Booking paid via Xendit

- **WHEN** a visitor completes checkout and selects Xendit
- **THEN** the system creates a Xendit invoice, redirects the visitor to the Xendit payment page
- **AND** on payment success, confirms the booking

### Requirement: Manual bank transfer fallback

The system SHALL support manual bank transfer as a payment option (existing bank account management reused). The booking SHALL remain in "pending" status until payment is confirmed. Admins SHALL confirm receipt via the existing payment confirmation workflow.

#### Scenario: Bank transfer booking

- **WHEN** a visitor selects bank transfer, the booking is created with "pending" status
- **AND** after the admin confirms payment, the booking status changes to "confirmed"
- **AND** e-tickets are sent

### Requirement: Refund processing via payment gateway

The system SHALL support processing refunds through Xendit's API. Refunds SHALL be initiated from the admin booking detail page. Partial refunds SHALL be supported.

#### Scenario: Admin initiates refund

- **WHEN** an admin processes a refund on a Xendit-paid booking
- **THEN** the system calls Xendit's refund API and records the refund reference

### Requirement: Payment retry for expired invoices

If a Xendit invoice expires (default 24 hours), the system SHALL allow visitors to request a new payment link from their booking status page. The original expired invoice SHALL be voided.

#### Scenario: Visitor requests new payment

- **WHEN** a visitor clicks "Pay Again" on a pending booking with an expired invoice
- **THEN** the system voids the old invoice and creates a new one
