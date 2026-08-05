## ADDED Requirements

### Requirement: Zoo-wide daily capacity limit

The system SHALL support a zoo-wide maximum daily visitor capacity in addition to per-ticket-type limits. The booking system SHALL prevent exceeding the zoo-wide cap even if individual ticket types have remaining slots.

#### Scenario: Zoo-wide cap reached

- **WHEN** the zoo-wide daily capacity of 5000 is reached but VIP tickets still have availability
- **THEN** the system blocks all bookings for that date regardless of per-type availability

### Requirement: Capacity utilization dashboard

The zoo admin dashboard SHALL display real-time and historical capacity utilization. Metrics SHALL include: current occupancy (checked-in / total sold), today's forecasted occupancy (confirmed bookings), daily utilization for the past 30 days (bar chart), and peak days alert.

#### Scenario: Admin views capacity dashboard

- **WHEN** an admin opens the dashboard
- **THEN** they see a gauge showing current occupancy at 65%, a bar chart of the past 30 days, and an alert if tomorrow is projected to exceed 90% capacity

### Requirement: Overbooking prevention safeguards

The system SHALL prevent overbooking at multiple levels: (1) UI-level — disable date/ticket type when capacity reached, (2) API-level — validate before cart-to-order conversion, (3) Database-level — atomic decrement with rollback on failure. Audit log SHALL record any booking failures due to capacity.

#### Scenario: Race condition prevented

- **WHEN** concurrent requests attempt to book the last slot
- **THEN** the database-level check ensures only one succeeds

### Requirement: Waitlist for sold-out dates

The system SHALL allow visitors to join a waitlist for sold-out dates. When capacity becomes available (cancellation or admin release), the system SHALL notify waitlisted visitors via email on a first-come-first-served basis with a time-limited booking window (default 2 hours).

#### Scenario: Visitor joins waitlist

- **WHEN** a visitor clicks "Notify me" on a sold-out date and enters their email
- **THEN** they are added to the waitlist and receive a confirmation email

#### Scenario: Waitlist notification

- **WHEN** a cancellation frees capacity
- **THEN** the system emails the next waitlisted visitor with a link to claim the slot within 2 hours
