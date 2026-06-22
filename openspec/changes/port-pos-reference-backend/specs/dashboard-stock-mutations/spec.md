## ADDED Requirements

### Requirement: Stock mutation history viewer

The dashboard SHALL include a Stock Mutations index page at `/dashboard/stock-mutations`.

#### Scenario: Stock mutation index renders

- **WHEN** a user with `stock-mutations-access` visits the page
- **THEN** they SHALL see a list of stock movements with product, type, quantity, and date
