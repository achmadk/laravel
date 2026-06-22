## ADDED Requirements

### Requirement: Xendit payment gateway config

The `config/services.php` SHALL include a `xendit` section with `secret_key` and `callback_token` keys read from environment variables.

#### Scenario: Xendit config available

- **WHEN** `XENDIT_SECRET_KEY` is set in `.env`
- **THEN** `config('services.xendit.secret_key')` SHALL return the value

#### Scenario: Xendit callback token available

- **WHEN** `XENDIT_CALLBACK_TOKEN` is set in `.env`
- **THEN** `config('services.xendit.callback_token')` SHALL return the value

### Requirement: Midtrans payment gateway config

The `config/services.php` SHALL include a `midtrans` section with `server_key` key read from environment variable.

#### Scenario: Midtrans config available

- **WHEN** `MIDTRANS_SERVER_KEY` is set in `.env`
- **THEN** `config('services.midtrans.server_key')` SHALL return the value
