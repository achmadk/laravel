## ADDED Requirements

### Requirement: GuestLayout uses split-panel layout

The system SHALL render auth pages inside a split-panel layout with a form panel on the left and a decorative hero panel on the right, collapsing to a single-column layout on mobile viewports.

#### Scenario: Desktop renders two panels

- **WHEN** a user visits any auth page on a viewport ≥ 1024px wide
- **THEN** the page SHALL display a left form panel and a right decorative hero panel side by side

#### Scenario: Mobile renders single column

- **WHEN** a user visits any auth page on a viewport < 1024px wide
- **THEN** the page SHALL display only the form panel at full width

### Requirement: GuestLayout accepts header and hero slot

The GuestLayout SHALL accept optional `header` text, `description` text, and a `hero` ReactNode for the right panel decorative content.

#### Scenario: Custom hero content rendered

- **WHEN** a page passes a `hero` prop to GuestLayout
- **THEN** the hero panel SHALL render the provided content

### Requirement: AuthBotGuardFields component

The system SHALL provide an `AuthBotGuardFields` component that renders a hidden honeypot input and a hidden token input for bot detection.

#### Scenario: BotGuard disabled renders nothing

- **WHEN** `botGuard.enabled` is `false`
- **THEN** the component SHALL return `null`

#### Scenario: BotGuard enabled renders hidden fields

- **WHEN** `botGuard.enabled` is `true`
- **THEN** the component SHALL render a hidden text input with `tabIndex={-1}` using the honeypot field name, and a hidden input for the bot guard token

### Requirement: Login page features

The login page SHALL display: BotGuard fields, email input with icon, password input with show/hide toggle and icon, "Remember me" checkbox, "Forgot password?" link (conditional), gradient submit button with loading spinner, registration link (conditional on `canRegister`), and split-panel layout with Indonesian text.

#### Scenario: Login renders with all features

- **WHEN** a user visits `/login`
- **THEN** the page SHALL render BotGuard fields, email with `IconMail`, password with `IconLock` and show/hide toggle, remember checkbox, forgot password link, gradient "Masuk" button, and conditional "Daftar" link if `canRegister` is true

#### Scenario: Login processing shows spinner

- **WHEN** the user submits the login form
- **THEN** the submit button SHALL show a spinning `IconLoader2` icon and read "Memproses..."

#### Scenario: Login success redirects

- **WHEN** login succeeds
- **THEN** the user SHALL be redirected to the dashboard

### Requirement: Register page features

The register page SHALL display: BotGuard fields, name input with icon, email input with icon, password input with show/hide toggle and icon, confirm password input with show/hide toggle and icon, gradient submit button with loading spinner, login link, and split-panel layout with Indonesian text.

#### Scenario: Register renders with all fields

- **WHEN** a user visits `/register`
- **THEN** the page SHALL render BotGuard fields, name with `IconUser`, email with `IconMail`, password with `IconLock`, confirm password with `IconLock`, gradient "Daftar Sekarang" button, and "Masuk disini" link

### Requirement: Forgot Password page features

The forgot password page SHALL display: BotGuard fields, email input with icon, gradient submit button with loading spinner, back-to-login button, status message, and split-panel layout with Indonesian text.

#### Scenario: Forgot password renders with features

- **WHEN** a user visits `/forgot-password`
- **THEN** the page SHALL render BotGuard fields, email with `IconMail`, gradient "Kirim Link Reset" button, and "Kembali" button linking to login

### Requirement: Reset Password page features

The reset password page SHALL display: email input, password input with show/hide toggle, confirm password input, gradient submit button, and Indonesian text.

#### Scenario: Reset password renders

- **WHEN** a user visits `/reset-password/{token}`
- **THEN** the page SHALL render email, password with toggle, confirm password, and gradient "Reset Password" button

### Requirement: Confirm Password page features

The confirm password page SHALL display: challenge context label derived from the route that triggered the confirmation, password input with show/hide toggle and icon, gradient submit button with loading spinner, hero panel, and Indonesian text.

#### Scenario: Confirm password with challenge context

- **WHEN** a user visits `/confirm-password` with a `challenge` prop containing a route name
- **THEN** the page SHALL display "Untuk melanjutkan {route}" as context and render password input with toggle, gradient "Lanjutkan" button, and `IconShieldLock` hero

#### Scenario: Confirm password without challenge

- **WHEN** a user visits `/confirm-password` without a `challenge` prop
- **THEN** the page SHALL display "Untuk melanjutkan aksi sensitif" as default context

### Requirement: Verify Email page features

The verify email page SHALL display: BotGuard fields, status message, spam-check tip box, gradient resend button with loading spinner, logout button, hero panel, and Indonesian text.

#### Scenario: Verify email renders

- **WHEN** a user visits `/verify-email`
- **THEN** the page SHALL render BotGuard fields, `IconMailCheck` hero, spam-check tip, "Kirim Ulang Email Verifikasi" gradient button, and "Keluar" logout button

#### Scenario: Verification link sent shows status

- **WHEN** `status` is `"verification-link-sent"`
- **THEN** the page SHALL display a success banner with Indonesian text confirming a new verification link was sent

### Requirement: All auth pages use Indonesian text

All labels, placeholders, headings, descriptions, button text, and error messages in auth pages SHALL use Indonesian language.

#### Scenario: Indonesian text rendered

- **WHEN** a user views any auth page
- **THEN** all user-facing text SHALL be in Indonesian

### Requirement: Show/hide password toggles on all password fields

Every password input across auth pages SHALL have a toggle button to show/hide the password, using `IconEye` and `IconEyeOff` icons.

#### Scenario: Password toggle toggles input type

- **WHEN** a user clicks the eye icon on a password field
- **THEN** the input type SHALL toggle between `password` and `text`, and the icon SHALL toggle between `IconEye` and `IconEyeOff`
