# Reuse ui-kit components in dashboard pages

## Purpose

Dashboard pages ported from the midone reference template render their chrome through the rtos ui-kit but still contain hand-rolled `<button>` elements and hand-rolled card surfaces. This change makes the named dashboard pages render all interactive elements and content surfaces through the existing ui-kit components, aligning them with the midone token language without changing behavior or component APIs.

## ADDED Requirements

### Requirement: Dashboard actions use the ui Button component
All interactive action elements in the `Categories`, `Products`, `Customers`, `Suppliers`, `Transactions`, `SalesReturns`, `Receivables`, and `StockOpnames` dashboard page directories SHALL render through the ui `Button` component or another ui-kit selection control. No raw `<button>` elements SHALL remain in those directories.

#### Scenario: Form submit button
- **WHEN** the StockOpnames create form renders its submit button with `type="submit"` and `disabled={processing}`
- **THEN** the button is a ui `Button` that forwards both attributes to the native button and the form still submits on click

#### Scenario: Disabled state passthrough
- **WHEN** a ui `Button` replaces a raw button whose disabled condition is `localItems.length === 0 || summary.hasMissingReasons`
- **THEN** the replaced button is non-interactive under the same condition

#### Scenario: Row and overlay actions
- **WHEN** a table row action or a grid-card delete overlay is rendered
- **THEN** it uses a ui `Button` with the intent matching its function (danger for deletes, primary/success/plain per action) and the original click handler

### Requirement: Dashboard content surfaces use the ui Card component
Content panels and grid cards in the named dashboard pages SHALL render through the ui `Card` component instead of hand-rolled `rounded-2xl border border-border bg-bg` divs, with the exception of print artifacts.

#### Scenario: Grid cards render with the Card surface
- **WHEN** the Categories, Products, or Customers index page renders a grid card
- **THEN** the card shows the ui `Card` surface (border-border, bg-overlay, gradient wash, shadow-md, rounded-xl) while preserving its hover border/shadow and overflow-hidden image treatment

#### Scenario: Stat, filter, and detail panels
- **WHEN** a stat/filter box or detail panel (SalesReturns, Receivables, StockOpnames) is rendered
- **THEN** its wrapper is the ui `Card` component with the original padding, grid layout, and `print:` variants preserved via className

#### Scenario: Print artifacts are exempt
- **WHEN** a surface is a print-only artifact (Transactions print sheets, Receivables print-area, StockOpnames custom overlay dialog)
- **THEN** it MAY remain a hand-rolled element

### Requirement: Payment method selection uses a ui-kit selection control
The Receivables payment method selector SHALL use the ui `ToggleGroup` single-selection control.

#### Scenario: Cash/transfer segmented selector
- **WHEN** the Receivables payment form renders the payment method options
- **THEN** the cash and transfer options are `ToggleGroupItem`s inside a single-selection `ToggleGroup` whose selected key reflects `data.method`, and changing selection calls `setData`

### Requirement: Behavior and component APIs are unchanged
This change SHALL NOT modify ui-kit component APIs or styling, and SHALL preserve existing handlers, permission gates, and page layouts.

#### Scenario: Permission gates preserved
- **WHEN** an action is gated by a permission check (e.g. `canConfirmPayment`, `canFinalizeStockOpname`, `canManageDraft`)
- **THEN** the ui `Button` renders only when the original raw button would have rendered

#### Scenario: ui-kit files untouched
- **WHEN** the change is complete
- **THEN** no file under `resources/js/components/ui/` is modified
