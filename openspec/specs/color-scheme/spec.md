# color-scheme Specification

## Purpose

The application SHALL support six primary-color schemes (default, 1–5) selectable by the user, persisted in localStorage, and composable with the existing light/dark/system mode so theme hue and luminance are independent.

## Requirements

### Requirement: Six color schemes are available

The application SHALL expose the color schemes `default` (blue-900), `1` (blue-950), `2` (sky-800), `3` (cyan-800), `4` (indigo-900), and `5` (gray-900, gray-300 in dark), applied via a `data-theme` attribute that overrides the primary color token.

#### Scenario: Default scheme applies blue-900

- **WHEN** no color scheme is chosen
- **THEN** the app uses the default `blue-900` primary

#### Scenario: Each scheme changes the primary hue

- **WHEN** a user selects scheme 2, 3, or 4
- **THEN** the primary color changes to the corresponding sky/cyan/indigo value

#### Scenario: Scheme 5 adapts to dark mode

- **WHEN** a user selects scheme 5 and dark mode is active
- **THEN** the primary renders as gray-300 and remains readable

### Requirement: Color scheme is persisted

The chosen color scheme SHALL be stored in localStorage and restored on next visit, independent of the light/dark/system setting.

#### Scenario: Selection survives reload

- **WHEN** a user selects a scheme and reloads the app
- **THEN** the same scheme is applied

#### Scenario: Light/dark and scheme compose

- **WHEN** a user changes light/dark mode while a non-default scheme is active
- **THEN** the scheme's primary is preserved and adjusted for the new luminance mode

### Requirement: Settings UI exposes the scheme picker

The Appearance settings page and the theme switcher SHALL offer controls to choose the color scheme alongside the existing light/dark/system toggle.

#### Scenario: Appearance page lists schemes

- **WHEN** a user opens Appearance settings
- **THEN** they can pick among the six schemes with a visible preview or label for each

#### Scenario: Scheme applies immediately

- **WHEN** a user picks a scheme
- **THEN** the app applies it immediately without a reload
