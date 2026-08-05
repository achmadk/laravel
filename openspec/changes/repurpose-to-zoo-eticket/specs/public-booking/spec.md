## ADDED Requirements

### Requirement: Guest visitors can browse and book without login

The system SHALL allow unauthenticated visitors to browse ticket types, check availability, select dates, add tickets to cart, enter visitor information, and complete payment — without creating an account. An email address SHALL be required for e-ticket delivery.

#### Scenario: Guest completes a booking

- **WHEN** an unauthenticated visitor selects a date, chooses 2 Adult + 1 Child tickets, enters their email and visitor names, and completes payment via Xendit
- **THEN** the system creates a confirmed booking, generates e-tickets, and sends them to the provided email
- **AND** the visitor can also download tickets from a confirmation page

### Requirement: Date picker with availability visual indicators

The public booking page SHALL display a calendar date picker where available dates are visually distinct from sold-out or blocked dates. Selecting a date SHALL show per-ticket-type availability counts.

#### Scenario: Visitor sees availability

- **WHEN** a visitor opens the booking page
- **THEN** they see a calendar with green (available), yellow (limited, <20% remaining), and red (sold out) indicators per date

### Requirement: Ticket quantity selector with limits

The system SHALL enforce per-ticket-type max-per-order limits and SHALL show real-time subtotal as quantities change. The system SHALL prevent selecting more tickets than available capacity for the selected date.

#### Scenario: Quantity exceeds availability

- **WHEN** a visitor tries to select 5 Adult tickets but only 3 remain
- **THEN** the quantity selector caps at 3 and shows "Only 3 remaining"

### Requirement: Visitor info collection per ticket

The system SHALL collect visitor name per ticket and SHALL require date of birth for age-restricted ticket types. For group bookings, a primary contact name and phone SHALL be collected.

#### Scenario: Age-restricted ticket requires DOB

- **WHEN** a visitor selects a Child ticket
- **THEN** the system requires entry of the child's date of birth before proceeding to checkout

### Requirement: Booking confirmation page

After successful payment, the system SHALL display a confirmation page with booking reference, summary of tickets, QR codes (for immediate download), and a link to resend e-tickets via email.

#### Scenario: Successful payment redirects to confirmation

- **WHEN** payment is confirmed
- **THEN** the visitor is redirected to `/booking/{reference}/confirmation` with ticket QR codes displayed
