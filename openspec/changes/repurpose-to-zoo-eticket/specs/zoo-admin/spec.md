## ADDED Requirements

### Requirement: Zoo operations dashboard

The admin dashboard SHALL display zoo-specific KPIs replacing POS retail metrics. KPIs SHALL include: today's check-ins vs capacity, today's revenue (broken down by ticket type), upcoming bookings (next 7 days), current occupancy %, active bookings count, and recent cancellations.

#### Scenario: Admin views zoo dashboard

- **WHEN** an admin logs in
- **THEN** they see the zoo dashboard with today's check-ins (1200/5000), revenue (Rp 45M), and a booking calendar for the week

### Requirement: Booking lookup and management

The system SHALL allow admins to search bookings by reference, email, name, or date. Admins SHALL view booking details (all tickets, visitor info, payment status) and perform cancellations/refunds with reason logging.

#### Scenario: Admin cancels a booking

- **WHEN** an admin finds a booking, clicks Cancel, selects "Visitor request" as reason, and confirms
- **THEN** the booking status changes to cancelled, all tickets are invalidated
- **AND** freed capacity is restored to availability
- **AND** a notification is sent to the visitor's email

### Requirement: Refund processing

The system SHALL support full and partial refunds. Refunds SHALL be processed via the original payment gateway when possible, or marked as manual refund for cash/transfer payments. Refund SHALL be logged in the audit trail.

#### Scenario: Admin processes refund

- **WHEN** an admin processes a 50% refund for a cancelled booking
- **THEN** the system records the refund amount, method, reason, and timestamp
- **AND** updates the booking status

### Requirement: Staff roles for zoo operations

The system SHALL support zoo-specific roles in the RBAC system: Admin (full access), Ticketing Officer (manage bookings, refunds), Gate Officer (scan tickets only), Manager (reports, capacity configuration), and Viewer (read-only). The existing permission system SHALL be configured with these roles.

#### Scenario: Gate officer has limited access

- **WHEN** a gate officer logs in
- **THEN** they see only the gate scanner interface and their own shift log
- **AND** cannot access settings, reports, or booking management

### Requirement: Daily operations report

The system SHALL generate a printable daily report showing: total visitors, revenue by ticket type, capacity utilization %, gate entry breakdown, show attendance, and cancellations. This SHALL use the existing PDF generation infrastructure.

#### Scenario: Admin generates daily report

- **WHEN** an admin selects a date and clicks "Generate Daily Report"
- **THEN** the system generates and downloads a PDF with the day's operations data
