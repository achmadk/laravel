## ADDED Requirements

### Requirement: Stock opname management

The dashboard SHALL include Stock Opname pages for creating physical counts, finalizing, and reviewing results.

#### Scenario: Stock opname index renders

- **WHEN** a user with `stock-opnames-access` visits `/dashboard/stock-opnames`
- **THEN** they SHALL see a list of stock takes with status

#### Scenario: Stock opname create

- **WHEN** a user visits the create page
- **THEN** they SHALL select products and enter physical counts

#### Scenario: Stock opname detail

- **WHEN** viewing a stock opname
- **THEN** they SHALL see all counted items, discrepancies, and finalize option
