## ADDED Requirements

### Requirement: Admin can create and manage ticket types

The system SHALL allow zoo administrators to define ticket types that visitors can purchase. Each ticket type SHALL have a name, category (Adult/Child/VIP/Student/Group), base price, description, terms & conditions, minimum and maximum age, maximum quantity per order, and active status. Ticket types SHALL be soft-deletable.

#### Scenario: Admin creates a new ticket type

- **WHEN** an admin fills in the ticket type form (name "Adult", category "Adult", base price 75000, description, max per order 10) and clicks Save
- **THEN** the system creates the ticket type and displays it in the ticket types list

#### Scenario: Admin deactivates a ticket type

- **WHEN** an admin toggles a ticket type to inactive
- **THEN** the ticket type no longer appears in the public booking page

#### Scenario: Admin edits a ticket type price

- **WHEN** an admin changes the base price of a ticket type
- **THEN** the new price applies to future bookings only; existing confirmed bookings retain the original price

### Requirement: Ticket types feed availability calculation

The system SHALL use active ticket types as the basis for daily availability records. When a ticket type is created or modified, the system SHALL ensure daily availability records exist for a configurable future window (default 90 days).

#### Scenario: New ticket type generates availability slots

- **WHEN** an admin creates a new ticket type
- **THEN** the system generates daily availability records for that ticket type for the next 90 days

### Requirement: Age-based pricing validation

The system SHALL validate visitor ages against ticket type age ranges at booking time. If a ticket type has a minimum age of 3 and maximum of 17 (Child), the system SHALL require the visitor's date of birth and validate eligibility.

#### Scenario: Age validation passes

- **WHEN** a visitor selects a Child ticket and enters a date of birth showing age 10
- **THEN** the system accepts the selection

#### Scenario: Age validation fails

- **WHEN** a visitor selects a Child ticket but enters a date of birth showing age 25
- **THEN** the system rejects the selection and shows a message "This ticket type requires age 3-17"
