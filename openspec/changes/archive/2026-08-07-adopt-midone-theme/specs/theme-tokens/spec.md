# theme-tokens Specification

## Purpose

The application SHALL use midone-derived design tokens (slate palette, semantic colors, radius, dark-mode values) so the UI presents a cohesive visual identity and every state remains readable in both light and dark mode.

## ADDED Requirements

### Requirement: Semantic color tokens follow the midone slate palette

The design token layer SHALL define the semantic color set `primary`, `secondary`, `success`, `danger`, `pending`, `warning`, `info` (plus their `-fg` foreground and `-subtle` variants), the background `bg`/`fg`, `border`/`input`/`ring`, `sidebar` family, and `chart-1..5` tokens using the midone slate-based palette with a `blue-900` primary.

#### Scenario: Primary color matches midone light theme

- **WHEN** the app renders in light mode
- **THEN** `--primary` resolves to midone's `blue-900` (or its exact light-mode value) and `--primary-fg` to its foreground

#### Scenario: Primary color matches midone dark theme

- **WHEN** the app renders in dark mode (`.dark` applied)
- **THEN** `--primary` resolves to `#4874f6` and remains readable against the dark background

#### Scenario: Every status color has a foreground

- **WHEN** a success, danger, pending, or warning token is used as a background
- **THEN** the matching `-fg` token provides a contrasting readable foreground in both light and dark mode

### Requirement: Pending and info colors are both available

The token layer SHALL add `pending` (midone's orange range) as a semantic color while keeping `info` (a distinct blue, not the primary) so existing `info` usages remain valid alongside the new `pending` usages.

#### Scenario: Pending status renders in orange

- **WHEN** a component renders a pending/processing state
- **THEN** it uses the `pending` token family (orange) with a readable foreground

#### Scenario: Info status remains available

- **WHEN** a component renders an info state
- **THEN** it uses the `info` token family (blue, distinct from primary) and remains valid in light and dark mode

### Requirement: Radius matches midone

The design token layer SHALL set the base radius to midone's `0.625rem`, with derived radius steps (xs through 4xl) scaling from it.

#### Scenario: Default interactive elements use the base radius

- **WHEN** a button or input renders with default styling
- **THEN** its corner radius derives from the `0.625rem` base token

### Requirement: Typography stays on existing fonts

The token layer SHALL keep `Plus Jakarta Sans` (sans) and `JetBrains Mono` (mono) as the font stack; midone's system-ui stack SHALL NOT be adopted.

#### Scenario: Body text uses Plus Jakarta Sans

- **WHEN** the app renders body text
- **THEN** the font family resolves to the Plus Jakarta Sans stack defined in the theme
