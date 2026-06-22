## ADDED Requirements

### Requirement: Customer voucher management

The dashboard SHALL include Customer Voucher CRUD pages.

#### Scenario: Voucher index renders

- **WHEN** a user with `customer-vouchers-access` visits `/dashboard/customer-vouchers`
- **THEN** they SHALL see a list of vouchers with status and usage

#### Scenario: Voucher create/edit

- **WHEN** creating/editing a voucher
- **THEN** the form SHALL include voucher value, minimum purchase, expiry, and customer assignment
