## ADDED Requirements

### Requirement: Aging analysis page

The dashboard SHALL include an Aging page at `/dashboard/aging` that displays receivables and payables grouped by aging brackets (0-30, 31-60, 61-90, 90+ days overdue).

#### Scenario: Aging page renders

- **WHEN** a user with `receivables-access` permission visits `/dashboard/aging`
- **THEN** they SHALL see aging tables for both receivables and payables

#### Scenario: Aging data is calculated

- **WHEN** aging data is loaded
- **THEN** each receivable/payable SHALL be categorized by days overdue
