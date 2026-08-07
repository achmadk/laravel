# dashboard-shell Specification

## Purpose

The dashboard layout SHALL present the Rubick side-menu shell — brand area, collapsible sidebar with hover-expand, group labels, scroll-area navigation, and sticky header — while preserving the existing menu data model, permission checks, and POS layout.

## Requirements

### Requirement: Dashboard shell matches the Rubick side-menu theme

The dashboard layout SHALL render a side-menu shell in the Rubick style: brand/logo area, sidebar navigation, sticky header, and content region, using the application's design tokens.

#### Scenario: Sidebar renders with brand and navigation

- **WHEN** a user opens any dashboard page
- **THEN** the sidebar shows the brand area and the full navigation tree from the existing menu model

#### Scenario: Header is sticky

- **WHEN** a user scrolls a dashboard page
- **THEN** the header remains fixed at the top with the page title and action controls

### Requirement: Sidebar collapses with hover-expand

The sidebar SHALL support a collapsed state (~110px wide) where group labels collapse to an ellipsis, link titles hide, and hovering the collapsed sidebar temporarily expands it to reveal full labels.

#### Scenario: Sidebar collapses

- **WHEN** a user toggles collapse
- **THEN** the sidebar narrows, group labels render as ellipsis, and link titles fade out

#### Scenario: Hover expands a collapsed sidebar

- **WHEN** the collapsed sidebar is hovered
- **THEN** it temporarily expands with full labels, and returns to collapsed on mouse leave

### Requirement: Navigation preserves menu model and permissions

The shell SHALL reuse the existing menu data model (`menuNavigation`) and permission checks (`checkPermission`) unchanged; only presentation changes.

#### Scenario: Permissioned menu items still filter

- **WHEN** a user without a permission views the dashboard
- **THEN** the corresponding menu items are hidden exactly as before the migration

#### Scenario: Active item is highlighted

- **WHEN** a navigation item matches the current route
- **THEN** it renders the active state using the primary token

### Requirement: POS layout is unchanged

The POS shell SHALL NOT be restyled as part of the dashboard shell migration; it inherits tokens and component styles only.

#### Scenario: POS layout structure is preserved

- **WHEN** a user opens the POS
- **THEN** its layout structure (product grid, cart, payment panels) matches pre-migration structure
