# pos-product-average-cost Specification

## ADDED Requirements

### Requirement: POS product payload exposes weighted-average purchase cost

The POS product list payload (`TransactionController::index`) SHALL include an `average_cost` field for each product, computed as the weighted average of `unit_price` over received quantities (`qty_received > 0`) from `purchase_order_items`, rounded to a whole number. Products with no received purchase history SHALL have `average_cost` equal to `0`.

#### Scenario: Product with received purchases

- **WHEN** a product has `purchase_order_items` with `qty_received > 0` at various `unit_price` values
- **THEN** the payload `average_cost` equals `ROUND(SUM(unit_price * qty_received) / SUM(qty_received))` over those items

#### Scenario: Product without purchase history

- **WHEN** a product has no `purchase_order_items` with `qty_received > 0`
- **THEN** the payload `average_cost` is `0`

#### Scenario: Product with zero received total

- **WHEN** a product's `purchase_order_items` sum of `qty_received` is zero
- **THEN** the payload `average_cost` is `0` (no division-by-zero error)

### Requirement: POS product table shows Modal column

The POS product table view (`ProductGrid`, viewMode "table") SHALL render an `average_cost` column labeled "Modal" between the Harga and Stok columns, formatted as IDR currency. The grid (card) view SHALL NOT display the average cost.

#### Scenario: Table view with average cost

- **WHEN** the POS catalog is displayed in table view and a product has `average_cost = 12500`
- **THEN** a "Modal" column shows "Rp 12.500" between the Harga and Stok cells for that product

#### Scenario: Table view with zero average cost

- **WHEN** the POS catalog is displayed in table view and a product has `average_cost = 0`
- **THEN** the Modal cell shows "Rp 0"

#### Scenario: Grid view unaffected

- **WHEN** the POS catalog is displayed in grid (card) view
- **THEN** no average-cost value is rendered
