## ADDED Requirements

### Requirement: PDF documents render in Plus Jakarta Sans

Every PDF view under `resources/views/pdf/` SHALL declare a `@font-face` for the Plus Jakarta Sans family at weights 400, 500, 600, and 700, sourced from TTF files vendored under `public/plus-jakarta-sans/`, and SHALL use `'Plus Jakarta Sans'` as the leading font in its body/document `font-family` stack, with Helvetica/sans-serif retained as fallback.

#### Scenario: Invoice renders with Plus Jakarta Sans

- **WHEN** `DocumentController::invoice()` generates the invoice PDF
- **THEN** the invoice body font-family is `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`
- **AND** the four `@font-face` blocks resolve to existing files under `public/plus-jakarta-sans/`

#### Scenario: Payable and receivable documents use the new font

- **WHEN** `DocumentController::payable` or `receivable` generates a PDF
- **THEN** the document body font-family leads with `'Plus Jakarta Sans'` and the `@font-face` blocks are declared

#### Scenario: Thermal receipts use the new font

- **WHEN** `DocumentController::receipt` generates a 58mm or 80mm receipt PDF
- **THEN** the receipt body font-family leads with `'Plus Jakarta Sans'` and the `@font-face` blocks are declared

#### Scenario: Shipping label uses the new font

- **WHEN** `DocumentController::shipping` generates the shipping label PDF
- **THEN** the label font-family is `'Plus Jakarta Sans', sans-serif` with `@font-face` blocks declared

### Requirement: Font files are vendored and licensed

The Plus Jakarta Sans font files SHALL be committed under `public/plus-jakarta-sans/` as static (non-variable) TrueType weights named `PlusJakartaSans-Regular.ttf`, `-Medium.ttf`, `-SemiBold.ttf`, `-Bold.ttf`, with the SIL OFL license file `OFL.txt` present alongside.

#### Scenario: Font files exist on disk

- **WHEN** the application generates any PDF
- **THEN** the referenced font file paths under `public/plus-jakarta-sans/` exist and are readable

#### Scenario: License compliance

- **WHEN** the repository is inspected
- **THEN** an `OFL.txt` license file is present in `public/plus-jakarta-sans/` documenting the font license

### Requirement: Rendering falls back gracefully

Every PDF view SHALL keep a generic `sans-serif` (or `Helvetica`) fallback so that if a font file is temporarily missing or unreadable, Dompdf still renders a legible document instead of failing.

#### Scenario: Font file missing

- **WHEN** a `PlusJakartaSans-*.ttf` file is absent at render time
- **THEN** Dompdf falls back through `Helvetica, Arial, sans-serif` and the PDF still streams successfully