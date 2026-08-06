## ADDED Requirements

### Requirement: Login respects email verification configuration

The system SHALL respect the `security.auth.verify_email` configuration (env `APP_VERIFY_EMAIL`) when deciding where to redirect a user after login. When verification is not enforced, unverified users SHALL NOT be sent to the verification notice page.

#### Scenario: Unverified user logs in with verification disabled

- **WHEN** a user with an unverified email logs in and `APP_VERIFY_EMAIL` is `false` (default)
- **THEN** the user is redirected to the `dashboard.access` route and never to `verification.notice`

#### Scenario: Unverified user logs in with verification enforced

- **WHEN** a user with an unverified email logs in and `APP_VERIFY_EMAIL` is `true`
- **THEN** the user is redirected to the `verification.notice` route

#### Scenario: Verified user logs in

- **WHEN** a user with a verified email logs in
- **THEN** the user is redirected to the `dashboard.access` route

### Requirement: Registration respects email verification configuration

The system SHALL respect the `security.auth.verify_email` configuration (env `APP_VERIFY_EMAIL`) when deciding where to redirect a newly registered user. When verification is not enforced, new users SHALL NOT be sent to the verification notice page.

#### Scenario: New user registers with verification disabled

- **WHEN** a user registers while `APP_VERIFY_EMAIL` is `false` (default) and public registration is enabled
- **THEN** the new user is redirected to the `dashboard.access` route and never to `verification.notice`

#### Scenario: New user registers with verification enforced

- **WHEN** a user registers while `APP_VERIFY_EMAIL` is `true` and public registration is enabled
- **THEN** the new user is redirected to the `verification.notice` route

### Requirement: Post-auth landing is dashboard.access for all users

The system SHALL redirect all authenticated users to the `dashboard.access` route as the default landing after login and registration, regardless of role or permissions. The `dashboard.access` route SHALL be reachable without any permission.

#### Scenario: User without dashboard-access permission logs in

- **WHEN** a user who does not hold the `dashboard-access` permission successfully logs in
- **THEN** the user is redirected to the `dashboard.access` route and receives a successful response (no 403)
