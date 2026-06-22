## ADDED Requirements

### Requirement: Auth routes protected by bot guard

Register, login, forgot-password, and email verification-notification POST routes SHALL include the `bot.guard` middleware to prevent automated abuse.

#### Scenario: Bot guard on registration

- **WHEN** a POST request is made to `/register`
- **THEN** the `bot.guard` middleware SHALL validate honeypot field and timing

#### Scenario: Bot guard on login

- **WHEN** a POST request is made to `/login`
- **THEN** the `bot.guard` middleware SHALL validate honeypot field and timing

#### Scenario: Bot guard on forgot-password

- **WHEN** a POST request is made to `/forgot-password`
- **THEN** the `bot.guard` middleware SHALL validate honeypot field and timing

#### Scenario: Bot guard on email verification notification

- **WHEN** a POST request is made to `/email/verification-notification`
- **THEN** the `bot.guard` middleware SHALL validate honeypot field and timing

### Requirement: Public registration toggle

The `/register` GET and POST routes SHALL include the `registration.enabled` middleware to respect the `AUTH_PUBLIC_REGISTRATION` env setting.

#### Scenario: Registration disabled

- **WHEN** `AUTH_PUBLIC_REGISTRATION` is `false`
- **THEN** GET and POST to `/register` SHALL return 404 or redirect

#### Scenario: Registration enabled

- **WHEN** `AUTH_PUBLIC_REGISTRATION` is `true`
- **THEN** GET `/register` SHALL render the registration form

### Requirement: Auth route throttling

Register POST SHALL be throttled at `config('security.auth.register_throttle')`. Forgot-password POST SHALL be throttled at `config('security.auth.forgot_password_throttle')`.

#### Scenario: Registration throttled

- **WHEN** `AUTH_REGISTER_THROTTLE` is `3,10`
- **THEN** more than 3 POST requests to `/register` within 10 minutes SHALL return 429

### Requirement: Password update route

A PUT route to update the authenticated user's password SHALL exist at `/password` named `password.update`.

#### Scenario: Password update accessible

- **WHEN** an authenticated user makes PUT to `/password`
- **THEN** the `PasswordController::update` method SHALL handle the request
