# pos-transactions Delta

## ADDED Requirements

### Requirement: Manual quantity input with keyboard

The cart panel SHALL allow a cashier to edit a line item's quantity by typing into a numeric input between the minus and plus buttons. The input SHALL be edited locally and SHALL commit at most one request to `transactions.updateCart` per edit, on blur or Enter — never per keystroke. Empty or below-minimum values SHALL revert to the last valid quantity without issuing a request.

#### Scenario: Type a new quantity and commit with Enter

- **WHEN** a cashier focuses the quantity input, types a new value, and presses Enter
- **THEN** the client issues exactly one Inertia visit to `transactions.updateCart` with the typed quantity
- **AND** the cart panel re-renders from the refreshed `carts` prop

#### Scenario: Commit on blur

- **WHEN** a cashier types a new value into the quantity input and the input loses focus
- **THEN** the client issues exactly one Inertia visit to `transactions.updateCart` with the typed quantity

#### Scenario: Empty or invalid value reverts without a request

- **WHEN** a cashier clears the input or types a value below 1 and the input loses focus
- **THEN** the input reverts to the last valid quantity
- **AND** no request is issued

#### Scenario: Escape cancels the edit

- **WHEN** a cashier edits the quantity input and presses Escape
- **THEN** the input reverts to the last valid quantity
- **AND** no request is issued

#### Scenario: Focus selects the current value

- **WHEN** a cashier focuses the quantity input
- **THEN** the current value is selected so that typing replaces it entirely

#### Scenario: Input stays in sync with cart state

- **WHEN** the `carts` prop changes (successful update response, hold/resume, clear-all, or plus/minus clicks)
- **THEN** the input value reflects the new quantity

#### Scenario: Over-stock quantity is rejected by the server

- **WHEN** a cashier commits a quantity exceeding the product's stock
- **THEN** the server rejects the update with the existing validation error
- **AND** the error is surfaced to the user via toast
