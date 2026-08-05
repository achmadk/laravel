# pos-transactions Specification

## Purpose

TBD - created by archiving change fix-transactions-inertia-contract. Update Purpose after archive.

## Requirements

### Requirement: Transactions page hydrates from server Inertia props

The transactions page (`Dashboard/Transactions/Index`) SHALL initialize its cart, customer, product, and pricing state from the exact prop keys emitted by `TransactionController@index`. The client MUST read the `carts` prop for cart line items (not `cart`) and MUST NOT ignore server-provided pricing or customer context.

#### Scenario: Existing cart renders on page load

- **WHEN** a cashier with active cart items navigates to `/dashboard/transactions`
- **THEN** the page renders those items in the cart panel from the `carts` prop without requiring a client fetch

#### Scenario: Server pricing preview hydrates the summary

- **WHEN** the page loads with an `initialPricingPreview` prop
- **THEN** the payment summary displays subtotal, promo, voucher, loyalty, shipping, and grand total from that preview rather than a client-recomputed subtotal

#### Scenario: Empty cart on load

- **WHEN** a cashier with no active cart items opens the page
- **THEN** the cart panel shows the empty state and no cart mutation request is issued on mount

### Requirement: POS client uses dashboard-prefixed routes

All client requests originating from the POS transaction screens SHALL target the `/dashboard/*` routes (preferably via named `route()` helpers), and SHALL NOT reference any `/apps/*` path or a `select-customer` endpoint that does not exist in `routes/web.php`.

#### Scenario: No apps-prefixed calls remain

- **WHEN** the POS pages (`Index`, `PaymentPanel`, `Print`, `History`) issue any HTTP request
- **THEN** every request path resolves to a registered `/dashboard/*` route and none target `/apps/*`

#### Scenario: Removed customer-select endpoint is not called

- **WHEN** a cashier selects or clears a customer
- **THEN** the client does not issue a request to a `select-customer` route and no unhandled promise rejection occurs

### Requirement: Cart mutations use Inertia redirects

Adding, updating, removing, and holding cart items SHALL be performed through Inertia `router` visits that follow the controller's `redirect()` response and re-render from the refreshed `carts` prop. The client MUST NOT assume a JSON `{ cart: [...] }` body from these endpoints.

#### Scenario: Add product to cart

- **WHEN** a cashier clicks a product (or scans a barcode that resolves to a product)
- **THEN** the client issues an Inertia visit to `transactions.addToCart` and the cart panel reflects the updated `carts` prop after the redirect

#### Scenario: Update cart quantity

- **WHEN** a cashier changes a line item quantity
- **THEN** the client issues an Inertia visit to `transactions.updateCart` and the refreshed `carts` prop drives the re-render, with server validation errors surfaced to the user

#### Scenario: Remove cart item

- **WHEN** a cashier removes a line item
- **THEN** the client issues an Inertia visit to `transactions.destroyCart` and the item disappears after the redirect-refreshed `carts` prop

#### Scenario: Hold current cart

- **WHEN** a cashier holds the active cart
- **THEN** the client issues an Inertia visit to `transactions.hold` and the cart is cleared from the refreshed props

### Requirement: Checkout submits to the transactions store route

Checkout SHALL be submitted to the `transactions.store` route (`POST /dashboard/transactions/store`) with the payload fields the controller expects, and SHALL follow the resulting redirect to the print/receipt route.

#### Scenario: Successful checkout

- **WHEN** a cashier completes payment for a non-empty cart with a valid payment method
- **THEN** the client posts to `transactions.store` and is redirected to `transactions.print` for the created invoice

#### Scenario: Checkout with no active shift

- **WHEN** a cashier attempts a cart mutation or checkout without an open shift
- **THEN** the `active_shift` middleware response is handled and the cashier is informed they must open a shift rather than failing silently

### Requirement: Home dashboard renders recent transactions

The home dashboard (`GET /home`) SHALL render the five most recent transactions without error, showing each transaction's invoice, formatted date, customer, and total. The date SHALL be derived from the `Transaction` model's `created_at` attribute as returned by the model (currently a pre-formatted string via the `createdAt()` accessor) and formatted as `d M Y` without throwing.

#### Scenario: Authenticated user opens home

- **WHEN** an authenticated user requests `GET /home`
- **THEN** the response is 200 and includes the `recentTransactions` list with `date` values in `d M Y` format

#### Scenario: Home has no transactions

- **WHEN** an authenticated user requests `GET /home` and the store has zero transactions
- **THEN** the response is 200 with an empty `recentTransactions` list

### Requirement: Member purchase history returns ISO transaction dates

The member purchase-history endpoint SHALL return each transaction's `created_at` as an ISO-8601 string without throwing, regardless of the `Transaction` model's attribute representation.

#### Scenario: Member history includes transactions

- **WHEN** the member purchase-history endpoint returns a transaction
- **THEN** the payload includes `created_at` as a valid ISO-8601 string and the request completes without error
