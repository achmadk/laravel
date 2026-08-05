## ADDED Requirements

### Requirement: System maintains a date × ticket-type capacity matrix

The system SHALL maintain a daily availability record for each active ticket type. Each record SHALL track the date, ticket type ID, total capacity, currently booked count, and price (which may differ from base price for seasonal/event pricing). Availability records SHALL be generated for a rolling window of 90 days.

#### Scenario: Availability record exists for query

- **WHEN** a visitor opens the booking calendar for the next 30 days
- **THEN** the system returns availability data showing total capacity and remaining slots per ticket type per date

#### Scenario: Availability record generation

- **WHEN** the 90-day window rolls forward past midnight
- **THEN** the system generates availability records for the new date

### Requirement: Real-time availability check with concurrency guard

The system SHALL check availability at the moment of booking confirmation (not just at page load). The system SHALL use database-level locking (pessimistic lock or atomic decrement) to prevent overbooking when multiple users book the same date/ticket type simultaneously.

#### Scenario: Concurrency — last slot booked

- **WHEN** two visitors both try to book the last remaining Adult ticket for June 25th simultaneously
- **THEN** one booking succeeds and the other receives a "Sold out" error

### Requirement: Date blocking

The system SHALL allow admins to block specific dates from public booking (for maintenance, special events, or holiday closures). Blocked dates SHALL return zero availability for all ticket types.

#### Scenario: Admin blocks a date

- **WHEN** an admin blocks December 25th
- **THEN** the public booking page shows no availability for December 25th

### Requirement: Seasonal pricing overrides

The system SHALL allow admins to override the base price of a ticket type for specific date ranges (peak season pricing, holiday pricing, promotional pricing).

#### Scenario: Peak season pricing

- **WHEN** an admin sets Adult ticket price to 100000 for July 1–July 31
- **THEN** the public booking page shows 100000 for Adult tickets on July 15, and 75000 on August 15
