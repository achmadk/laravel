# pos-tax-display Spec

## ADDED Requirements

### Requirement: Payment panel shows tax breakdown before payment

The POS payment panel displays the PPN amount and rate as an always-visible line when tax applies, so the cashier and customer can see how much of the grand total is tax before completing the sale.

#### Scenario: Tax applies to the cart
- **WHEN** the pricing preview summary has `tax_total > 0`
- **THEN** the payment panel shows a row labeled `PPN {rate}%` with the tax amount formatted in IDR, placed between the subtotal and the detail-toggle section, and the row is visible without expanding any details section

#### Scenario: No tax applies
- **WHEN** the pricing preview summary has `tax_total` of 0 or missing (rate 0)
- **THEN** the payment panel shows no PPN row, matching the receipt behavior

#### Scenario: Grand total remains tax-inclusive
- **WHEN** the payment panel renders the totals
- **THEN** the displayed grand total is the server-computed value that already includes the tax, and the tax row is a breakdown of that total, not an additional charge

### Requirement: Configurable PPN rate in store settings

The store settings page exposes the default PPN rate so operators can change it without touching the database.

#### Scenario: Store settings show the current rate
- **WHEN** an operator opens the Store settings page
- **THEN** the form shows a "Pajak PPN" percent input pre-filled with the current `tax_default_rate` setting (defaulting to `11.00` when unset)

#### Scenario: Rate updated successfully
- **WHEN** an operator submits a valid rate (numeric, 0–100)
- **THEN** the `tax_default_rate` setting is persisted and future pricing previews and receipts use the new rate

#### Scenario: Rate validation
- **WHEN** an operator submits a non-numeric value or a rate outside 0–100
- **THEN** the request is rejected with a validation error and the setting is unchanged
