## 1. POSLayout State Management

- [x] 1.1 Add state variables: `showOpenShiftModal`, `openingCash`, `shiftNotes`, `isOpening` using `useState`
- [x] 1.2 Import `NumpadModal`, `router`, and `toast` at top of pos-layout.tsx

## 2. Replace Broken Link with Modal Button

- [x] 2.1 Change `<Link href="/apps/cashier-shifts/create">` to `<button onClick={() => setShowOpenShiftModal(true)}>`
- [x] 2.2 Apply same styling classes (warning color, rounded-lg) to the button

## 3. Create Open Shift Modal UI

- [x] 3.1 Add NumpadModal component with `isOpen={showOpenShiftModal}`
- [x] 3.2 Configure NumpadModal props: `title="Buka Shift Baru"`, `isCurrency={true}`, `initialValue={0}`, `minValue={0}`
- [x] 3.3 Add `onConfirm` handler to capture the opening cash value
- [x] 3.4 Add notes text input field below NumpadModal
- [x] 3.5 Add "Buka Shift" submit button and "Batal" cancel button

## 4. Implement Shift Opening Handler

- [x] 4.1 Create `handleOpenShift()` function that POSTs via `router.post('/dashboard/cashier-shifts', { opening_cash, notes })`
- [x] 4.2 Add `onStart` callback to set `isOpening=true`
- [x] 4.3 Add `onSuccess` callback: show toast "Shift berhasil dibuka", close modal, reload page
- [x] 4.4 Add `onError` callback: show toast with error message, set `isOpening=false`
- [x] 4.5 Connect submit button to `handleOpenShift()`

## 5. Verification

- [ ] 5.1 Test: Click "Buka Shift" → modal appears
- [ ] 5.2 Test: Enter opening cash via numpad → value formats as currency
- [ ] 5.3 Test: Click "Buka Shift" → modal closes, toast shows, shift opens
- [ ] 5.4 Test: Enter notes, submit → notes are sent to backend
- [ ] 5.5 Test: Cancel modal → modal closes without API call
