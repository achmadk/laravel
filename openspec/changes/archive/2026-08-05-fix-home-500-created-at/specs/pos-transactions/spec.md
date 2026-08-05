## ADDED Requirements

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
