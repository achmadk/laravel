## ADDED Requirements

### Requirement: Sales Report Page

The system SHALL provide a sales report page at `dashboard/reports/sales` with summary cards, date filters, and a paginated transaction table.

#### Scenario: Renders sales report page

- **WHEN** a user with appropriate permissions navigates to `/dashboard/reports/sales`
- **THEN** the system SHALL display summary cards (total transactions, total revenue, average transaction value), a filter panel, and a paginated transaction table with invoice number, cashier, customer, payment method, total, and timestamp

#### Scenario: Summary cards show aggregated data

- **WHEN** the page loads or filters change
- **THEN** the system SHALL display gradient-bg summary cards with total revenue (IDR formatted), transaction count, and average transaction value

#### Scenario: Filters by date range

- **WHEN** the user sets start_date and end_date and applies filters
- **THEN** the system SHALL reload the report data scoped to that date range

#### Scenario: Filters by invoice number

- **WHEN** the user types an invoice number and applies filters
- **THEN** the system SHALL show only the transaction matching that invoice

#### Scenario: Filters by cashier

- **WHEN** the user selects a cashier from the dropdown
- **THEN** the system SHALL reload the report scoped to that cashier's transactions

#### Scenario: Filters by customer

- **WHEN** the user selects a customer from the dropdown
- **THEN** the system SHALL reload the report scoped to that customer's transactions

#### Scenario: Clears all filters

- **WHEN** the user clicks "Hapus Filter"
- **THEN** the system SHALL reset all filters to their default values and reload the report

#### Scenario: Toggles filter panel visibility

- **WHEN** the user clicks the filter toggle button
- **THEN** the system SHALL show or hide the advanced filter panel

#### Scenario: Formats currency in IDR

- **WHEN** displaying monetary values in summary cards or the table
- **THEN** the system SHALL format values as IDR currency using Indonesian locale
