## ADDED Requirements

### Requirement: Goods receiving management

The dashboard SHALL include Goods Receiving pages for creating, listing, and viewing goods receive notes.

#### Scenario: Goods receiving index renders

- **WHEN** a user with `goods-receivings-access` visits `/dashboard/goods-receivings`
- **THEN** they SHALL see a list of goods receiving notes with status

#### Scenario: Goods receiving create

- **WHEN** a user visits the create page
- **THEN** they SHALL select a purchase order and enter received quantities

#### Scenario: Goods receiving show

- **WHEN** viewing a goods receiving note
- **THEN** they SHALL see all items received with quantities and any discrepancies
