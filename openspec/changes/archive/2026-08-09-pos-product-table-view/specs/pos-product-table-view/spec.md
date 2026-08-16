## ADDED Requirements

### Requirement: View mode toggle in ProductGrid header

The POS product picker grid SHALL provide a view-mode toggle inside its header row that switches between card grid and table view. The card grid SHALL remain the default view.

#### Scenario: Toggling to table view

- **WHEN** the cashier clicks the view toggle while the grid shows cards
- **THEN** the same products display as a table with columns Nama, Barcode, Harga, Stok
- **AND** no product image is shown

#### Scenario: Toggling back to card grid

- **WHEN** the cashier clicks the view toggle while the table is shown
- **THEN** the card grid renders exactly as before, including images

### Requirement: View preference is persisted

The chosen view SHALL be persisted so it survives a page refresh or navigation. The persistence mechanism SHALL be `localStorage` under a namespaced key.

#### Scenario: Refresh keeps table view

- **WHEN** the cashier switches to table view and reloads `/dashboard/transactions`
- **THEN** the product picker opens directly in table view

#### Scenario: First visit defaults to grid

- **WHEN** no view preference has been stored yet
- **THEN** the card grid is shown by default

#### Scenario: localStorage unavailable

- **WHEN** `localStorage` reads or writes fail (private mode, disabled storage)
- **THEN** the grid remains functional and no error is surfaced to the user

### Requirement: Table rows behave like card clicks

Clicking a product row in table view SHALL trigger exactly the same behavior as clicking the equivalent card: same add-to-cart/toggle semantics, same in-cart highlight, and same disabled state for out-of-stock products.

#### Scenario: Clicking an in-stock row

- **WHEN** the cashier clicks a row whose stock is greater than zero
- **THEN** the same `onProductClick(product)` handler runs as for a card click

#### Scenario: In-cart row highlighted

- **WHEN** a product is already in the cart
- **THEN** its table row shows the in-cart highlight state

#### Scenario: Out-of-stock row disabled

- **WHEN** a product has a stock of zero
- **THEN** its table row is visually disabled and does not trigger `onProductClick`