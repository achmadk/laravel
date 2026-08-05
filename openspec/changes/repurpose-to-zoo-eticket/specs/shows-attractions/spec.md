## ADDED Requirements

### Requirement: Zoo shows and attractions management

The system SHALL allow admins to define shows/attractions (name, description, location, capacity, duration, image). Each show SHALL have scheduled sessions with date, start time, end time, and per-session capacity.

#### Scenario: Admin creates a show

- **WHEN** an admin creates "Elephant Show" at "Amphitheater" with 200 capacity and 30-minute duration
- **THEN** the show appears in the shows management list

#### Scenario: Admin adds show sessions

- **WHEN** an admin adds sessions for "Elephant Show" at 10:00, 13:00, and 15:00 on June 25th
- **THEN** each session appears in the public show schedule

### Requirement: Show tickets as optional add-ons

Visitors SHALL be able to add show tickets during the booking flow as optional add-ons (free or paid). Show selection SHALL be per-session with capacity checks. Show tickets SHALL be linked to the main booking but tracked separately.

#### Scenario: Visitor adds show to booking

- **WHEN** a visitor booking Adult tickets for June 25th also selects the 10:00 Elephant Show
- **THEN** the show reservation is added to their cart with its own capacity check
- **AND** if the show session is full, the add-on is rejected with a message

### Requirement: Show schedule on public site

The public booking site SHALL display a show/attractions schedule showing available sessions, session times, and remaining capacity. Visitors SHALL be able to browse the schedule without booking.

#### Scenario: Visitor browses shows

- **WHEN** a visitor opens the shows page
- **THEN** they see a schedule of available shows with times, locations, and capacity status
