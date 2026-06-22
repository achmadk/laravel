## ADDED Requirements

### Requirement: Pricing rule management

The dashboard SHALL include Pricing Rule CRUD pages with quantity breaks, bundles, and buy-get promotions.

#### Scenario: Pricing rule index renders

- **WHEN** a user with `pricing-rules-access` visits `/dashboard/pricing-rules`
- **THEN** they SHALL see a list of pricing rules with type and status

#### Scenario: Pricing rule create/edit

- **WHEN** creating/editing a pricing rule
- **THEN** the form SHALL include rule type (qty break, bundle, buy-get), conditions, and discounts

#### Scenario: Pricing rule preview

- **WHEN** previewing a pricing rule
- **THEN** the system SHALL calculate and display the discounted price
