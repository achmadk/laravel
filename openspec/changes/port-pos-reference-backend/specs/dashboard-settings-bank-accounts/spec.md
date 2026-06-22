## ADDED Requirements

### Requirement: Bank account management

The dashboard SHALL include Bank Account CRUD pages with reorder and toggle-active functionality.

#### Scenario: Bank account index renders

- **WHEN** a user with `payment-settings-access` visits `/dashboard/settings/bank-accounts`
- **THEN** they SHALL see a list of bank accounts with active status and sort order

#### Scenario: Bank account create/edit

- **WHEN** a user visits the create/edit page
- **THEN** they SHALL see a form with bank name, account number, account holder, and active toggle
