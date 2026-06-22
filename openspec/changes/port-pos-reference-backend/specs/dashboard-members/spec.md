## ADDED Requirements

### Requirement: Member management

The dashboard SHALL include Member pages for managing membership customers (extended customer profiles).

#### Scenario: Member index renders

- **WHEN** a user visits `/dashboard/members`
- **THEN** they SHALL see a list of members with membership info

#### Scenario: Member create/edit with form

- **WHEN** creating/editing a member
- **THEN** the form SHALL include member-specific fields (join date, points, tier)

#### Scenario: Member show detail

- **WHEN** viewing a member
- **THEN** they SHALL see full member profile with purchase history and loyalty points
