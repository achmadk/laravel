## ADDED Requirements

### Requirement: Customer detail/show page

The dashboard SHALL include a Customer detail page at `/dashboard/customers/{customer}`.

#### Scenario: Customer detail renders

- **WHEN** a user with `customers-access` views a customer
- **THEN** they SHALL see customer info, transaction history, segment membership, and credit status
