## ADDED Requirements

### Requirement: Stock Opname Index Page

The system SHALL provide a stock opname listing page at `dashboard/stock-opnames` displaying all physical count sessions with status indicators.

#### Scenario: Renders index page with session list

- **WHEN** a user with `stock-opnames-access` permission navigates to `/dashboard/stock-opnames`
- **THEN** the system SHALL display a paginated table of stock opname sessions showing code, notes, status (draft/completed/cancelled), item count, total adjustment, and timestamps

#### Scenario: Filters by search keyword

- **WHEN** the user types a search query in the search field
- **THEN** the system SHALL filter sessions by code or notes matching the query

#### Scenario: Creates a new session

- **WHEN** the user clicks the "Buat Sesi Opname" button
- **THEN** the system SHALL navigate to the stock opname create page

#### Scenario: Views session detail

- **WHEN** the user clicks "Lihat" on a session
- **THEN** the system SHALL navigate to the stock opname show page

### Requirement: Stock Opname Create Page

The system SHALL provide a stock opname creation page where users start a new physical count session.

#### Scenario: Creates session with notes

- **WHEN** the user fills in session notes and submits
- **THEN** the system SHALL create a new draft stock opname session and redirect to the show page

#### Scenario: Validation on empty submission

- **WHEN** the user submits without required fields
- **THEN** the system SHALL display validation errors inline

### Requirement: Stock Opname Show Page

The system SHALL provide a stock opname detail page where users can view session info, manage item counts, and finalize the session.

#### Scenario: Renders session detail

- **WHEN** a user navigates to `/dashboard/stock-opnames/{id}`
- **THEN** the system SHALL display session summary (status, code, notes, creator, dates) with summary cards showing total items, counted items, and adjustments

#### Scenario: Displays item-level counts

- **WHEN** viewing a draft session
- **THEN** the system SHALL display a table of all products with columns: product name/sku, system stock, physical count, difference, and actions

#### Scenario: Edits individual item count inline

- **WHEN** the user clicks "edit" on a product row in a draft session
- **THEN** the system SHALL open an inline or modal form to enter the physical count for that product

#### Scenario: Saves item count

- **WHEN** the user enters a physical count and saves
- **THEN** the system SHALL save the count and update the difference calculation

#### Scenario: Adds new products to session

- **WHEN** the user clicks "Tambah Produk" in a draft session
- **THEN** the system SHALL open a product selection modal with search, allowing selection of products to add to the count

#### Scenario: Finalizes session

- **WHEN** the user clicks "Finalisasi" on a completed draft session and confirms
- **THEN** the system SHALL finalize the opname, adjust stock levels, and redirect to the show page in completed status

#### Scenario: Back navigation

- **WHEN** the user clicks "Kembali" on the show page
- **THEN** the system SHALL navigate to the stock opname index page
