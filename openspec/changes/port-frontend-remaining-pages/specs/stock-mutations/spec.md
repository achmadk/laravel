## ADDED Requirements

### Requirement: Stock Mutation Index Page

The system SHALL provide a stock mutation history page at `dashboard/stock-mutations` displaying all stock quantity changes with server-side filtering.

#### Scenario: Renders index page with mutation list

- **WHEN** a user with `stock-mutations-access` permission navigates to `/dashboard/stock-mutations`
- **THEN** the system SHALL display a paginated table of stock mutations showing product name, SKU, mutation type, quantity change, reference, and timestamp

#### Scenario: Filters by product

- **WHEN** the user selects a product from the product filter dropdown
- **THEN** the system SHALL reload the table showing only mutations for that product

#### Scenario: Filters by date range

- **WHEN** the user enters start and end dates
- **THEN** the system SHALL reload the table showing only mutations within that date range

#### Scenario: Filters by mutation type

- **WHEN** the user selects a mutation type (addition, subtraction, adjustment) from a filter
- **THEN** the system SHALL reload the table showing only mutations of that type
