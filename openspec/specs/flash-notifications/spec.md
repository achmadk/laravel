# flash-notifications Specification

## Purpose

TBD - created by syncing change fix-flash-session-key-mismatch. Update Purpose after archive.

## Requirements

### Requirement: Flash messages from both session conventions reach the UI

The `flash` prop shared by `HandleInertiaRequests` SHALL surface a message from either session flash convention: the `flash()` helper convention (keys `message`/`type`/`data`) and the controller `->with('success'|'error', ...)` convention.

The resolved `message` SHALL be the first non-empty value among session keys `message`, `success`, and `error`.

The resolved `type` SHALL be `error` when the `error` session key is present, `success` when the `success` session key is present, and otherwise the explicit `type` session key when set, falling back to `success`.

#### Scenario: Controller flashes a success message

- **WHEN** a controller returns `back()->with('success', 'Supplier berhasil ditambahkan.')`
- **THEN** the `flash` prop has `message` = "Supplier berhasil ditambahkan." and `type` = "success"
- **AND** the frontend `Flash` component renders a success toast with that message

#### Scenario: Controller flashes an error message

- **WHEN** a controller returns `back()->with('error', 'Nominal melebihi sisa hutang.')`
- **THEN** the `flash` prop has `message` = "Nominal melebihi sisa hutang." and `type` = "error"
- **AND** the frontend `Flash` component renders an error toast with that message

#### Scenario: flash() helper convention still works

- **WHEN** the `flash($message, $data, $type)` helper is called (as in `DeleteAccountController`)
- **THEN** the `flash` prop has the helper's `message` and `type` values verbatim
- **AND** the `data` key is still populated as before

#### Scenario: Both conventions set in the same request

- **WHEN** both the `message` key and the `success` key are present in the session
- **THEN** the resolved `message` is the `message` key value (helper convention wins)

#### Scenario: No flash data present

- **WHEN** no `message`, `success`, or `error` session key is set
- **THEN** the `flash` prop has an empty `message` and `type` defaults to `"success"`
- **AND** the frontend renders no toast