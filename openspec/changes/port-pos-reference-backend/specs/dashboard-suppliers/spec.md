## ADDED Requirements

### Requirement: Supplier management

The dashboard SHALL include Supplier pages for creating, editing, viewing, and deleting suppliers.

#### Scenario: Supplier index renders

- **WHEN** a user with `suppliers-access` visits `/dashboard/suppliers`
- **THEN** they SHALL see a list of suppliers with contact info and outstanding payables
