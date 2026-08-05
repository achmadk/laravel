## Context

The POS layout (`resources/js/layouts/pos-layout.tsx`) has a "Buka Shift" button in the header when no active shift exists. Currently it links to `/apps/cashier-shifts/create`, which doesn't exist—causing a 404.

The existing cashier shift workflow (in `CashierShifts/Index.tsx`) opens shifts via a form that POSTs to `/dashboard/cashier-shifts`. This same endpoint can be used from the POS layout.

The POS page already uses `NumpadModal` for entering numeric values (used elsewhere in the checkout flow), making it ideal for entering the opening cash amount.

## Goals / Non-Goals

**Goals:**

- Enable opening a cashier shift from the POS transactions page without leaving
- Reuse existing `NumpadModal` component for opening cash input
- Follow existing patterns (Inertia `router.post()`, toast notifications)

**Non-Goals:**

- Not creating a new shift creation API endpoint—reuse existing `POST /dashboard/cashier-shifts`
- Not modifying the CashierShiftService or existing shift logic
- Not adding shift validation beyond what the backend already does

## Decisions

### 1. Modal over dedicated page

**Chosen:** Use a modal dialog triggered from the header button
**Rationale:** Keeps user in POS context; less disruptive than navigating away

### 2. Reuse NumpadModal component

**Chosen:** Use `NumpadModal` for opening cash input
**Rationale:** Already exists in the POS component library with currency formatting and quick-amount buttons; consistent UX

### 3. Two-step confirmation (numpad → confirm)

**Chosen:** NumpadModal collects opening cash, then a confirmation step or direct POST
**Rationale:** `NumpadModal` has built-in confirm flow via `onConfirm(value)` callback

### 4. POST via router.post() over axios

**Chosen:** Use Inertia's `router.post()`
**Rationale:** Consistent with how `CashierShifts/Index.tsx` opens shifts; handles redirects/error handling automatically

## UI Flow

```
┌─────────────────────────────────────────────────────────────┐
│ POS Header (when no active shift)                           │
│                                                             │
│  [Buka Shift]  ←── click opens modal                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ NumpadModal appears                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  💰 Buka Shift Baru                                     │ │
│ │                                                         │ │
│ │  Modal Awal:                                            │ │
│ │  ┌─────────────────────────────────────────────────┐    │ │
│ │  │              Rp 0                              │    │ │
│ │  └─────────────────────────────────────────────────┘    │ │
│ │  [+10rb][+20rb][+50rb][+100rb]  ← quick amounts      │ │
│ │                                                         │ │
│ │  Catatan (opsional):                                    │ │
│ │  ┌─────────────────────────────────────────────────┐    │ │
│ │  │                                                  │    │ │
│ │  └─────────────────────────────────────────────────┘    │ │
│ │                                                         │ │
│ │  [Batal]                              [Buka Shift]      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## State Management

Added to `POSLayout`:

```typescript
const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
const [openingCash, setOpeningCash] = useState(0);
const [shiftNotes, setShiftNotes] = useState("");
const [isOpening, setIsOpening] = useState(false);
```

## Component Changes

**POSLayout changes:**

- Import `NumpadModal`, `router`, `toast`
- Replace `<Link href="/apps/cashier-shifts/create">` with `<button onClick={() => setShowOpenShiftModal(true)}>`
- Add `NumpadModal` component with `onConfirm` handler that:
    - Sets `openingCash` value
    - Optionally shows a confirmation (or directly posts)
- Add `handleOpenShift()` function that POSTs via `router.post('/dashboard/cashier-shifts', { opening_cash, notes })`

## Risks / Trade-offs

| Risk                               | Mitigation                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| User opens shift with wrong amount | Backend accepts any `opening_cash >= 0`; cashier can note discrepancy in closing   |
| Modal conflicts with other modals  | NumpadModal uses `z-50`; existing modals use lower z-index or are handled by state |
| Network failure on POST            | `router.post()` error callback shows toast; modal stays open for retry             |

## Open Questions

- Should the modal include a quick-confirm step before POSTing, or directly POST after numpad entry?
- Should the component handle the case where the user already has an active shift (backend may reject if shift already open)?
