# pos-cart-clear-all Specification

## Purpose
TBD - created by archiving change pos-cart-clear-all. Update Purpose after archive.
## Requirements
### Requirement: Clear all active cart items

The cart panel in the POS transaction page SHALL provide a way to clear all active (non-held) cart items in one action, guarded by a confirmation dialog, without affecting held carts or per-item remove behavior.

#### Scenario: Cart can be cleared from a confirmation dialog

- **WHEN** a cashier has one or more active cart items and clicks the trash icon in the cart header
- **THEN** a confirmation dialog appears asking to empty the cart
- **AND** confirming deletes all active cart items for that cashier via the `transactions.clearCart` route
- **AND** the cart UI refreshes to its empty state (no items, zero count)

#### Scenario: Held carts are never cleared

- **WHEN** a cashier has both active and held cart items
- **THEN** the clear action removes only the active items
- **AND** held items remain intact

#### Scenario: Clear action only appears when the cart is non-empty

- **WHEN** the cart has zero active items
- **THEN** no clear-all trash icon is shown
- **AND** the icon appears only when there is at least one active item

