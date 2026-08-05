## ADDED Requirements

### Requirement: Open Shift Modal in POS Layout

The POS layout SHALL provide a modal dialog for opening a cashier shift when no active shift exists. The modal SHALL allow the cashier to enter an opening cash balance and optional notes before submitting.

#### Scenario: User clicks Buka Shift button

- **WHEN** user clicks the "Buka Shift" button in the POS header (when no active shift exists)
- **THEN** system displays a modal dialog with opening cash input (using NumpadModal) and optional notes field

#### Scenario: User enters opening cash via numpad

- **WHEN** user enters a numeric value using the numpad or quick-amount buttons
- **THEN** system displays the formatted value as Indonesian Rupiah currency

#### Scenario: User confirms opening cash

- **WHEN** user clicks "Konfirmasi" after entering opening cash
- **THEN** system stores the entered value and optionally shows a confirmation step before POST

#### Scenario: User submits shift opening

- **WHEN** user clicks "Buka Shift" button in the modal (after entering opening cash)
- **THEN** system POSTs to `/dashboard/cashier-shifts` with `{ opening_cash: number, notes: string|null }`
- **AND** system shows loading state on the button during the request

#### Scenario: Shift opens successfully

- **WHEN** the POST to `/dashboard/cashier-shifts` succeeds (HTTP 200-299)
- **THEN** system displays success toast message "Shift berhasil dibuka"
- **AND** system closes the modal
- **AND** system reloads the page to refresh `activeCashierShift` prop
- **AND** the header badge updates to show "Shift Aktif" status

#### Scenario: Shift opening fails

- **WHEN** the POST to `/dashboard/cashier-shifts` fails (HTTP 4xx/5xx or exception)
- **THEN** system displays error toast with the error message
- **AND** the modal remains open for retry
- **AND** the submit button is re-enabled

#### Scenario: User cancels shift opening

- **WHEN** user clicks "Batal" or clicks outside the modal overlay
- **THEN** system closes the modal without making any API call
- **AND** no toast is shown

### Requirement: Reuse Existing NumpadModal Component

The system SHALL reuse the existing `NumpadModal` component from `resources/js/components/pos/NumpadModal.tsx` for the opening cash input.

#### Scenario: NumpadModal renders correctly

- **WHEN** the open shift modal is displayed
- **THEN** the `NumpadModal` is rendered with `isCurrency=true` for currency formatting
- **AND** `title="Buka Shift Baru"` is passed
- **AND** `initialValue=0` is passed
- **AND** `minValue=0` is passed
- **AND** `maxValue=999999999` is passed

### Requirement: State Management in POSLayout

The system SHALL manage all open shift modal state locally within `POSLayout` component.

#### Scenario: Modal visibility state

- **WHEN** user clicks "Buka Shift" button
- **THEN** `showOpenShiftModal` state is set to `true`
- **WHEN** user closes/cancels the modal
- **THEN** `showOpenShiftModal` state is set to `false`

#### Scenario: Opening cash state

- **WHEN** user confirms a value in NumpadModal
- **THEN** `openingCash` state is set to the confirmed numeric value
- **AND** modal is closed or transitions to confirmation view

#### Scenario: Notes state

- **WHEN** user types in the notes field
- **THEN** `shiftNotes` state is updated with the input value

#### Scenario: Loading state during submission

- **WHEN** the POST request is in progress
- **THEN** `isOpening` state is set to `true`
- **AND** the submit button is disabled and shows loading indicator
- **WHEN** the POST request completes (success or failure)
- **THEN** `isOpening` state is set to `false`
