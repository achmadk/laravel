## ADDED Requirements

### Requirement: Profit Report Page

The system SHALL provide a profit/loss report page at `dashboard/reports/profit` with summary metrics and a detailed transaction breakdown.

#### Scenario: Renders profit report page

- **WHEN** a user with appropriate permissions navigates to `/dashboard/reports/profit`
- **THEN** the system SHALL display summary cards (total revenue, total cost, gross profit, margin percentage) and a paginated transaction table with invoice, cashier, customer, revenue, cost, and profit columns

#### Scenario: Summary cards show profit metrics

- **WHEN** the page loads or filters change
- **THEN** the system SHALL display gradient-bg summary cards showing total revenue, total cost of goods sold, gross profit, and margin percentage

#### Scenario: Profit column shows color-coded values

- **WHEN** displaying the profit column per transaction
- **THEN** positive profits SHALL be shown in green and negative profits (losses) in red

#### Scenario: Filters by date range

- **WHEN** the user sets start_date and end_date and applies filters
- **THEN** the system SHALL reload the report scoped to that date range

#### Scenario: Filters by invoice/cashier/customer

- **WHEN** the user enters filter criteria
- **THEN** the system SHALL reload the report scoped to those filters

#### Scenario: Clears all filters

- **WHEN** the user clicks "Hapus Filter"
- **THEN** the system SHALL reset all filters and reload the report
