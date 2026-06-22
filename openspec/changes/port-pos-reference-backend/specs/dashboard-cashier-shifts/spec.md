## ADDED Requirements

### Requirement: Cashier shift management

The dashboard SHALL include Cashier Shifts pages for opening/closing shifts and viewing shift history.

#### Scenario: Cashier shift index renders

- **WHEN** a user with `cashier-shifts-access` permission visits `/dashboard/cashier-shifts`
- **THEN** they SHALL see shift history with open/close times and amounts

#### Scenario: Cashier shift detail renders

- **WHEN** a user clicks on a shift
- **THEN** they SHALL see detailed shift reconciliation data
