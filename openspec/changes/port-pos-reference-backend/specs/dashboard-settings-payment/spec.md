## ADDED Requirements

### Requirement: Payment gateway settings page

The dashboard SHALL include a Payment Settings page at `/dashboard/settings/payments`.

#### Scenario: Payment settings renders

- **WHEN** a user with `payment-settings-access` visits the page
- **THEN** they SHALL see/edit payment gateway configuration (Midtrans, Xendit) with API keys
