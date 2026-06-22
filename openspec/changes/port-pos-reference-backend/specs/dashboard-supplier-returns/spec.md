## ADDED Requirements

### Requirement: Supplier return management

The dashboard SHALL include Supplier Return pages for creating, viewing, completing, and canceling returns to suppliers.

#### Scenario: Supplier return index renders

- **WHEN** a user with `supplier-returns-access` visits `/dashboard/supplier-returns`
- **THEN** they SHALL see a list of returns with status

#### Scenario: Supplier return create

- **WHEN** a user visits the create page
- **THEN** they SHALL select a supplier and add return items with quantities and reasons

#### Scenario: Supplier return detail

- **WHEN** viewing a return
- **THEN** they SHALL see all items, status, and complete/cancel actions
