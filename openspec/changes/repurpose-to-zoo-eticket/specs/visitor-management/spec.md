## ADDED Requirements

### Requirement: Visitor database with booking history

The system SHALL maintain a visitor record for each unique email address. Visitor records SHALL accumulate booking history, total visits, and total spend. Existing Customer model SHALL be retrofitted with new fields: `date_of_birth`, `id_card_number`, `nationality`, `emergency_contact`, and `marketing_consent`.

#### Scenario: Returning visitor

- **WHEN** a visitor books using the same email address used in a previous booking
- **THEN** the system links the new booking to the existing visitor record and updates visit count and total spend

### Requirement: Age-based analytics

The system SHALL provide analytics on visitor demographics: age distribution (0-3, 4-12, 13-17, 18-55, 55+), group size distribution, and repeat vs new visitor ratio. These SHALL be accessible in the reports section.

#### Scenario: Admin views demographics

- **WHEN** an admin opens the visitor analytics report
- **THEN** they see a pie chart of age distribution and a bar chart of daily new vs returning visitors

### Requirement: Group booking management

The system SHALL allow a single booking to contain multiple tickets for different individuals (a group/family). The primary contact SHALL be stored on the booking record. Group bookings SHALL receive a single e-ticket PDF with all group member tickets.

#### Scenario: Family group booking

- **WHEN** a visitor selects 2 Adult + 2 Child tickets and enters names and ages for each
- **THEN** the system creates a single booking with 4 individual tickets under one group reference
- **AND** generates one PDF with all 4 tickets

### Requirement: Marketing consent and opt-out

The system SHALL store marketing consent status per visitor. Visitors SHALL be able to opt out during booking. The CRM campaign system (existing) SHALL respect marketing consent when sending promotional campaigns.

#### Scenario: Visitor opts out

- **WHEN** a visitor unchecks "Receive promotions and news" during booking
- **THEN** the marketing_consent flag is set to false
- **AND** the visitor is excluded from future CRM campaigns
