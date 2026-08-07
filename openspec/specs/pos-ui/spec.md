# pos-ui Specification

## Purpose

POS and management pages SHALL render all interactive, status, and alert states with the application's design-system tokens (no Tailwind numeric-scale color classes), so every state remains visible in both light and dark mode.

## Requirements

### Requirement: POS interactive states render with design-system tokens

POS pages (product grid, cart, payment, customer panels) SHALL render active, selected, and alert states using the application's design-system tokens, so every interactive state MUST be visible in both light and dark mode.

#### Scenario: Active category filter is visually distinct

- **WHEN** a user opens the transactions page and selects a product category
- **THEN** the active filter chip renders a filled primary background with readable foreground text, distinct from inactive chips

#### Scenario: Product in cart is highlighted

- **WHEN** a product is added to the cart
- **THEN** its card renders a visible primary-colored border and a visible checkmark badge

#### Scenario: Out-of-stock product shows an alert state

- **WHEN** a product has no stock
- **THEN** its card renders a visible danger-colored badge that is readable in light and dark mode

#### Scenario: Payment panel selected state is visible

- **WHEN** a user selects a payment method
- **THEN** the selected option renders a visible primary-colored active state

### Requirement: Dashboard and management pages render colored states with design-system tokens

Dashboard, auth, member, CRM, and settings pages SHALL render success, warning, and danger states (badges, buttons, alerts, form errors) using design-system tokens, so no state SHALL be invisible in either color mode.

#### Scenario: Status badges are readable in both color modes

- **WHEN** a member, campaign, or settings page renders a success or warning status badge
- **THEN** the badge has a filled token background and a readable foreground in light and dark mode

#### Scenario: Destructive actions are visible

- **WHEN** a form or list renders a delete or danger action
- **THEN** it uses the danger token colors and remains readable in light and dark mode
