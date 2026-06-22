## ADDED Requirements

### Requirement: Customer segment management

The dashboard SHALL include Customer Segment CRUD pages with dynamic member assignment.

#### Scenario: Segment index renders

- **WHEN** a user with `customer-segments-access` visits `/dashboard/customer-segments`
- **THEN** they SHALL see a list of customer segments with member counts

#### Scenario: Segment create/edit with rules

- **WHEN** creating/editing a segment
- **THEN** the form SHALL include segment criteria/rules and member preview

#### Scenario: Segment detail shows members

- **WHEN** viewing a segment
- **THEN** they SHALL see the list of customers in that segment with add/remove options
