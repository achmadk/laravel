## ADDED Requirements

### Requirement: POS customer discovery via JSON-capable index

POS customer selection SHALL discover customers through the `customers.index` endpoint returning JSON, not through a preloaded prop. When `TransactionController@index` renders the POS page it SHALL send an empty `customers` list; the `AddCustomerModal` is the sole customer-discovery path. `CustomerController@index` SHALL return a JSON array of customers when the request accepts JSON and is not an Inertia navigation, and SHALL continue rendering the Inertia page for normal navigation. The index search filter SHALL match on customer name, phone (`no_telp`), and member code. POS cashiers SHALL hold the permissions required to both search (`customers-access`) and create (`customers-create`) customers from the modal.

#### Scenario: Modal search returns JSON results

- **WHEN** a cashier types at least two characters into the customer search field
- **THEN** the client requests `customers.index` with `Accept: application/json` (no `X-Inertia` header) and receives a JSON array of matching customers that populates the result list

#### Scenario: Normal navigation still renders the page

- **WHEN** a user navigates to `/dashboard/customers` as a normal navigation (default `Accept`, or an Inertia visit carrying the `X-Inertia` header)
- **THEN** the controller returns the Inertia page component, not the JSON array

#### Scenario: Search matches phone number

- **WHEN** a cashier searches by a customer's phone number
- **THEN** the JSON results include customers whose `no_telp` matches, consistent with the "nama atau nomor telepon" search affordance

#### Scenario: Transactions page does not preload customers

- **WHEN** the POS transactions page loads
- **THEN** the `customers` prop is an empty array and no full customer table is serialized into the page payload

#### Scenario: Cashier can search and create customers

- **WHEN** a user with the seeded `cashier` role opens the customer modal
- **THEN** the search request is authorized (`customers-access`) and creating a new customer via `storeAjax` is authorized (`customers-create`) without a 403
