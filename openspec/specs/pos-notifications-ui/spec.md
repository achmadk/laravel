# pos-notifications-ui Specification

## Purpose
TBD - created by archiving change pos-notifications-ui. Update Purpose after archive.
## Requirements
### Requirement: A notification bell dropdown in the dashboard header shows pending alerts

The dashboard header SHALL display a notification bell with a live unread badge (count = sum of low-stock + receivable + payable notification lengths from the shared `notifications` props) and a dropdown listing those alerts grouped or merged with icon and per-type styling, plus a "mark all read" action for stock alerts.

#### Scenario: Badge shows the total of active notifications
- **WHEN** the current user has low-stock, receivable, and payable notifications present in the shared `notifications` props
- **THEN** the bell badge displays the sum of the three counts, and a count of 0 renders no badge

#### Scenario: Dropdown lists notifications by type
- **WHEN** the user opens the bell dropdown
- **THEN** the dropdown lists low-stock entries with a "Stok habis: {title}" label and stock count, receivable entries ("Piutang: {invoice}", remaining amount), and payable entries ("Hutang: {document}", remaining), each with its own icon and empty state "Tidak ada notifikasi" when none exist

#### Scenario: Marking a stock notification read
- **WHEN** the user clicks "Dibaca" on a low-stock item
- **THEN** the item is optimistically removed from the dropdown and a `POST notifications.stock.read` request is sent with its `product_id`, preserving scroll and state

#### Scenario: Marking all stock notifications read
- **WHEN** the user clicks the mark-all-read action
- **THEN** the list is cleared and a `POST notifications.stock.readAll` request is sent, preserving scroll and state

#### Scenario: Bell opens a notifications page
- **WHEN** the user clicks "Lihat semua" in the dropdown footer
- **THEN** the app navigates to the notifications page

### Requirement: A dedicated notifications page lists all active alerts

The SAME shared `notifications` props SHALL also be rendered on a dedicated page at `/dashboard/notifications` with three sections (Stok / Piutang / Hutang), each listing its items with action buttons that reuse the same mark-read and mark-all-read routes.

#### Scenario: Page renders three sections
- **WHEN** an authenticated user with access opens `/dashboard/notifications`
- **THEN** the page renders a Stok section, a Piutang section, and a Hutang section, each listing its items with title, subtitle, and time, and an empty state when a section has no items

#### Scenario: Marking read from the page
- **WHEN** the user clicks "Baca" on a low-stock item on the page
- **THEN** the item disappears and a `notifications.stock.read` POST is made with its `product_id`, preserving scroll and state

#### Scenario: Permissions respected
- **WHEN** a user without access to the notifications page requests it
- **THEN** they are redirected or denied, consistent with sibling dashboard routes

### Requirement: The dashboard header dead link is replaced

The bell icon in the dashboard header SHALL no longer link to a nonexistent `/notifications` route; it SHALL become the dropdown from (requirement **bell dropdown**), and the "Stok Menipis" pill SHALL link to the notifications page.

#### Scenario: No dead link remains
- **WHEN** the dashboard header renders
- **THEN** the bell is functional (opens the dropdown) and both the bell and the "Stok Menipis" pill navigate to real routes

#### Scenario: Badge works without a server-side total
- **WHEN** the shared `notifications` props contain no `total` key
- **THEN** the bell badge count is still computed correctly from the three array lengths

