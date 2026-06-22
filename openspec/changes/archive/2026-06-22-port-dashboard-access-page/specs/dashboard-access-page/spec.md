## ADDED Requirements

### Requirement: Access denied landing page

The system SHALL display an "access denied" landing page at `/dashboard/access` when users lack the `dashboard-access` permission. The page SHALL show a grid of module cards filtered to only display modules the user has permission to access.

#### Scenario: User has partial permissions

- **WHEN** an authenticated user navigates to `/dashboard/access`
- **THEN** the system SHALL render a grid of module link cards
- **AND** each card SHALL link to a module route
- **AND** cards SHALL be filtered to only show modules where the user has the required permission
- **AND** if no cards match, the system SHALL display a "Tidak ada akses tersedia" message

#### Scenario: Card list

- **WHEN** the access page renders
- **THEN** the system SHALL show cards for: Transaksi (transactions-access), Pelanggan (customers-access), Piutang (receivables-access), Hutang (payables-access), Supplier (suppliers-access), and Laporan (reports-access)
- **AND** each card SHALL display an icon, title, and description
- **AND** each card SHALL link to the corresponding module index route

#### Scenario: Route existence

- **WHEN** the Laravel router processes a GET request for `/dashboard/access`
- **THEN** the named route `dashboard.access` SHALL resolve to rendering `Dashboard/Access` Inertia page
- **AND** the route SHALL be protected by `auth` and `verified` middleware

#### Scenario: Layout assignment

- **WHEN** the access page renders
- **THEN** the page SHALL use the `DashboardLayout` layout
- **AND** the layout SHALL display the sidebar navigation and header consistent with other dashboard pages
