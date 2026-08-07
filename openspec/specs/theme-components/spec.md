# theme-components Specification

## Purpose

The ui kit SHALL render components (buttons, badges, inputs, fields, cards, dialogs, tables, toasts, checkboxes, menus) using midone's component visual language — layered-gradient filled look, outline/flat/text variants, bold filled badges — implemented in the existing `tailwind-variants` + react-aria-components stack without changing component APIs.

## Requirements

### Requirement: Buttons follow midone's layered-gradient look

Button components SHALL support the variant set `primary`, `secondary`, `success`, `danger`, `pending`, `warning`, `ghost` and the looks `filled`, `outline`, `flat`, `text`, with the filled look using midone's layered `before`/`after` gradient overlay technique and a base radius derived from the theme token.

#### Scenario: Filled primary button renders with gradient sheen

- **WHEN** a button renders with the default filled primary variant
- **THEN** it shows a primary background, readable foreground, and the midone layered-gradient overlay (lighter top, subtle bottom sheen)

#### Scenario: Every variant has a distinct look

- **WHEN** a button renders in any variant and look combination
- **THEN** the combination is visually distinct from the others and readable in light and dark mode

#### Scenario: Button API is unchanged

- **WHEN** a page consumes the Button component
- **THEN** its props (`intent`, `size`, `isCircle`) and behavior (press, focus ring, disabled, pending) behave as before the migration

### Requirement: Badges use bold filled token backgrounds

Status badges SHALL render with filled token backgrounds and readable foregrounds (e.g., `bg-success text-success-fg`) instead of subtle backgrounds, and SHALL support the full semantic set including `pending`.

#### Scenario: Status badge renders filled

- **WHEN** a status badge renders a success, warning, danger, pending, or info state
- **THEN** it has a filled token background with a readable foreground in both light and dark mode

#### Scenario: Pending badge is available

- **WHEN** a component renders a pending badge
- **THEN** it uses the pending token family and remains readable in light and dark mode

### Requirement: Inputs and fields match midone styling

Input, field, textarea, and select components SHALL adopt midone's control styling — background, border, focus ring, radius — while preserving react-aria validation states (error borders/rings) and disabled styling.

#### Scenario: Input renders with midone control styling

- **WHEN** a text input renders
- **THEN** it shows the midone border/background/radius styling and a clear focus ring

#### Scenario: Validation state remains visible

- **WHEN** an input is in an invalid state
- **THEN** it renders the danger-colored border/ring and remains readable in light and dark mode

### Requirement: Remaining ui-kit components adopt the midone look

Card, dialog, table, toast, checkbox, menu, and the other ui-kit components SHALL adopt midone's corresponding styling (borders, shadows, radii, active/selected states) while keeping their existing react-aria behavior and props.

#### Scenario: Dialog and table render with midone styling

- **WHEN** a dialog or table renders
- **THEN** its borders, shadows, radius, and header/row styling follow midone's design language

#### Scenario: Component behavior is unchanged

- **WHEN** any ui-kit component renders after migration
- **THEN** its interactive behavior (open/close, select, focus, disabled, keyboard) matches pre-migration behavior
