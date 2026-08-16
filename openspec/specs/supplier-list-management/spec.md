# supplier-list-management Specification

## Purpose

TBD - created by syncing change suppliers-search-filter-pagination. Update Purpose after archive.

## Requirements

### Requirement: Supplier list is searchable

The Suppliers page SHALL filter the supplier list client-intent via a server-side `search` query parameter matching `name`, `phone`, or `email`, so only suppliers whose name, phone, or email contains the search text are returned.

#### Scenario: Search by name

- **WHEN** the user types "PT Maju" in the search field
- **THEN** only suppliers whose name contains "PT Maju" are returned
- **AND** the page URL contains `?search=PT%20Maju`

#### Scenario: Search by phone

- **WHEN** the user types a phone fragment such as "0812" in the search field
- **THEN** suppliers whose phone contains "0812" are returned even if their name does not

#### Scenario: Clearing the search

- **WHEN** the user clears the search field
- **THEN** the supplier list returns to the full unpaginated-fresh first page without a `search` query param

### Requirement: Supplier list is paginated

The Suppliers page SHALL paginate results, returning a paginated response shape (data, current_page, last_page, per_page, total, links) and provide pagination links that preserve the active search.

#### Scenario: More than one page of suppliers

- **WHEN** the matching supplier count exceeds the page size
- **THEN** the page shows pagination links
- **AND** navigating to page 2 keeps the current `search` parameter in the link URLs

#### Scenario: Single page of suppliers

- **WHEN** the matching supplier count is at or below the page size
- **THEN** no pagination links are rendered

### Requirement: Add/edit supplier form is hidden by default

The supplier add/edit form SHALL NOT be visible when the page is empty; it SHALL be revealed explicitly by the user.

#### Scenario: Page loads

- **WHEN** the suppliers page loads with permission `suppliers-access`
- **THEN** the list is shown and no add/edit form is visible

#### Scenario: Opening the add form

- **WHEN** the user clicks "Tambah Supplier"
- **THEN** the add form is shown with empty fields and focus suitable for entry

#### Scenario: Editing a supplier

- **WHEN** the user clicks the edit action on a supplier row
- **THEN** the form is shown pre-filled with that supplier's data

#### Scenario: Cancelling the form

- **WHEN** the user clicks cancel in the visible form
- **THEN** the form is hidden and the list remains unchanged

#### Scenario: Searching or paginating while the form is open

- **WHEN** the user submits a search or navigates pagination while the add/edit form is open
- **THEN** the form remains open with its current state (single-form, never auto-hidden behavior)

### Requirement: Search and pagination do not lose the flash feedback

The Suppliers page SHALL use Inertia-native navigation (`router.get` with `preserveState` / `preserveScroll`) so server-flashed success/error messages continue to surface as toasts (per the `flash-notifications` capability).

#### Scenario: Search submit while a flash message is pending

- **WHEN** the user submits a search after saving a supplier
- **THEN** the pending success toast still renders and the page does not fully reload