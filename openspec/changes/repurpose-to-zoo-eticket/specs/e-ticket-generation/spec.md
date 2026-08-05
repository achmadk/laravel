## ADDED Requirements

### Requirement: Each ticket has a unique QR code

The system SHALL generate a unique QR code for every individual ticket (booking item) at the time of booking confirmation. The QR code SHALL encode a signed token containing the booking reference, ticket number, ticket type ID, and visit date. The token SHALL be cryptographically signed to prevent forgery.

#### Scenario: QR code generation on booking confirmation

- **WHEN** a booking is confirmed
- **THEN** each ticket in the booking receives a unique QR code token and the QR code image is generated

#### Scenario: QR code validation

- **WHEN** a gate officer scans a QR code
- **THEN** the system decodes the token, verifies the signature, and validates the ticket

### Requirement: E-ticket PDF with branded template

The system SHALL generate a downloadable PDF for each booking containing all purchased tickets. The PDF SHALL include the zoo name, logo, booking reference, visitor names, ticket types, visit date, QR codes (one per ticket), terms & conditions, and a barcode of the booking reference.

#### Scenario: PDF generation

- **WHEN** a booking is confirmed
- **THEN** the system generates a PDF e-ticket and stores it for download

### Requirement: Email delivery of e-tickets

The system SHALL send an email to the visitor's provided address containing the e-ticket PDF attachment and a link to the online download page. The email SHALL be sent using the existing Laravel mail infrastructure.

#### Scenario: E-ticket email sent

- **WHEN** a booking is confirmed
- **THEN** the system sends an email with subject "Your Zoo E-Tickets - [Zoo Name]" containing the PDF

### Requirement: Ticket download portal

The system SHALL provide a public page where visitors can download their e-tickets by entering their booking reference and email address. This allows re-download of lost tickets without logging in.

#### Scenario: Visitor re-downloads tickets

- **WHEN** a visitor enters their booking reference and email on the download page
- **THEN** the system displays their tickets for download
