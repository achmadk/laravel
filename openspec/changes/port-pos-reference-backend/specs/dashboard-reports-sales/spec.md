## ADDED Requirements

### Requirement: Sales report

The dashboard SHALL include a Sales report page at `/dashboard/reports/sales`.

#### Scenario: Sales report renders

- **WHEN** a user with `reports-access` visits the sales report page
- **THEN** they SHALL see sales data with date range, payment method, and category filters
