## ADDED Requirements

### Requirement: Payable accounts management

The dashboard SHALL include Payable pages for listing and viewing payables with payment tracking.

#### Scenario: Payable index renders

- **WHEN** a user with `payables-access` visits `/dashboard/payables`
- **THEN** they SHALL see a list of payables with amounts, due dates, and status

#### Scenario: Payable detail renders

- **WHEN** viewing a payable
- **THEN** they SHALL see payment history, related purchase order, and remaining balance
