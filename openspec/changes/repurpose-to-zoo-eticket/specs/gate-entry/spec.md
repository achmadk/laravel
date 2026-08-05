## ADDED Requirements

### Requirement: Gate officers can scan and validate tickets

The system SHALL provide an interface for gate officers to scan QR codes (via webcam or manual entry) and instantly validate tickets. Validation SHALL check: ticket exists, visit date matches today, ticket not already used, ticket not cancelled. The interface SHALL show a success (green) or failure (red) indicator with a message.

#### Scenario: Valid ticket scanned

- **WHEN** a gate officer scans a valid, unused ticket for today's date
- **THEN** the system shows a green checkmark with the visitor's name and ticket type
- **AND** marks the ticket as used with current timestamp and gate ID

#### Scenario: Expired ticket scanned

- **WHEN** a gate officer scans a ticket for yesterday's date
- **THEN** the system shows a red indicator with "Ticket expired"

#### Scenario: Already-used ticket scanned

- **WHEN** a gate officer scans a ticket that was already used 30 minutes ago
- **THEN** the system shows a red indicator with "Ticket already used at Main Gate at 09:30"

### Requirement: Gate management

The system SHALL allow admins to define gates (name, location, type: entry/exit). Each gate scan SHALL be logged with gate ID, timestamp, and officer ID. Gates can be active or inactive.

#### Scenario: Admin creates a gate

- **WHEN** an admin adds a gate named "East Entrance"
- **THEN** the gate appears in the gate scanner interface for officers at that location

### Requirement: Re-entry rules

The system SHALL support configurable re-entry policy per ticket type. Single-entry tickets SHALL be marked used on first scan. Multi-entry tickets (e.g., VIP, annual pass) SHALL allow re-entry within the valid period.

#### Scenario: Single-entry ticket scanned again

- **WHEN** a visitor with a single-entry Adult ticket tries to re-enter
- **THEN** the system shows "Ticket already used — re-entry not allowed"

#### Scenario: Multi-entry ticket re-entry

- **WHEN** a visitor with a VIP all-day pass exits and re-enters
- **THEN** the system logs the re-entry and allows access

### Requirement: Daily check-in log

The system SHALL maintain a real-time log of all check-ins for operational monitoring. The zoo admin dashboard SHALL display today's check-in count, remaining capacity, and peak entry times.

#### Scenario: Admin views check-in log

- **WHEN** an admin opens the check-in log
- **THEN** they see a live-updating list of today's entries with timestamps, ticket types, and gate
