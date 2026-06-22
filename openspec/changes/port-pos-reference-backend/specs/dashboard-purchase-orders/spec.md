## ADDED Requirements

### Requirement: Purchase order lifecycle

The dashboard SHALL include Purchase Order pages for creating, listing, viewing, placing, and canceling POs.

#### Scenario: Purchase order index renders

- **WHEN** a user with `purchase-orders-access` visits `/dashboard/purchase-orders`
- **THEN** they SHALL see a list of POs with status (draft, placed, partially received, completed, canceled)

#### Scenario: Purchase order create

- **WHEN** a user visits the create page
- **THEN** they SHALL select a supplier and add line items with quantities and prices

#### Scenario: Purchase order detail

- **WHEN** viewing a PO
- **THEN** they SHALL see all items, supplier info, and receiving history
