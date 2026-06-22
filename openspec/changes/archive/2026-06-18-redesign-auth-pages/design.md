## Context

The current auth pages use the default Intent UI scaffold — a `<GuestLayout>` wrapping centered card with React Aria Components form fields and English text. The backend controllers were already ported from `../pos-reference` in a previous session (BotGuard, AuditLogService, step-up security, etc.), but the frontend still lacks these features.

The `../pos-reference` project serves as the reference UI with:

- Split screen layout (form left, decorative hero right)
- BotGuard honeypot + token fields on Login, Register, ForgotPassword, VerifyEmail
- Show/hide password toggles
- Indonesian text throughout
- Tabler icons in form fields and hero panels
- Gradient buttons with loading spinners
- Challenge context display on ConfirmPassword

Both projects share `@tabler/icons-react`, Tailwind CSS v4, and TypeScript. The current project additionally uses React Aria Components for form widgets, which should be preserved where possible.

## Goals / Non-Goals

**Goals:**

- Match `../pos-reference` auth page UX in visual design, language, and features
- Integrate BotGuard fields (honeypot + token) into all auth forms that need them
- Implement show/hide password toggles on all password fields
- Localize UI text to Indonesian
- Use split-panel layout with hero decoration on all auth pages
- Preserve React Aria Components form primitives where they don't conflict with the design
- TypeScript everything with proper types

**Non-Goals:**

- No backend changes — controllers, routes, and services are already ported
- No new npm packages — `@tabler/icons-react` is already installed
- No changes to Settings pages or other non-auth UI
- No changes to route names or structure

## Decisions

### 1. Approach: Rewrite pages from scratch vs. incremental edit

- **Decision**: Rewrite each page entirely, using the pos-reference version as a structural template but adapted to React Aria Components + TypeScript
- **Rationale**: The current pages are too structurally different (simple card vs. split layout) to edit incrementally. The layout structure, content, icons, and features are all different. Starting fresh with the pos-reference structure and porting into TSX + React Aria primitives is cleaner
- **Alternative considered**: Incremental edits — rejected because it would be 90% replacement anyway

### 2. Form library: React Aria `<Form>` vs. plain `<form>`

- **Decision**: Use React Aria `<Form>` component where possible, falling back to plain `<form>` with `useForm` for pages that need custom `handleSubmit` with BotGuard dynamic field names
- **Rationale**: React Aria's `<Form>` has built-in validation handling but doesn't cleanly support dynamic field names (like `company_website` for honeypot) through its declarative `name` prop mapping. Pages with BotGuard will use manual `useForm` + plain `<form>` like the pos-reference does. Pages without BotGuard can use the `<Form>` component
- **Pages with BotGuard**: Login, Register, ForgotPassword, VerifyEmail → manual `useForm` + `<form>`
- **Pages without BotGuard**: ResetPassword, ConfirmPassword → React Aria `<Form>`

### 3. GuestLayout: Split layout architecture

```
┌──────────────────────────────────────────────┐
│  Left Panel (flex-1, p-8)  │  Right Panel     │
│  ┌────────────┐            │  (hidden lg:flex) │
│  │ Logo row   │            │  ┌────────────┐  │
│  │ Title      │            │  │ Hero icon  │  │
│  │ Subtitle   │            │  │ Headline   │  │
│  │            │            │  │ Tagline    │  │
│  │ Form       │            │  │ Features   │  │
│  └────────────┘            │  └────────────┘  │
└──────────────────────────────────────────────┘
```

- **Decision**: Create a new `GuestLayout` component with flex-row container, gradient right panel, and responsive collapse (right panel hidden on mobile)
- **Rationale**: All 6 auth pages share this same layout shell. The pos-reference uses an inline layout per page, but extracting it into the GuestLayout avoids duplication

### 4. AuthBotGuardFields component

- **Decision**: Create a typed React component that renders hidden honeypot input + hidden token input
- **Rationale**: Used across 4 pages. Keeps bot guard logic in one place
- **TypeScript signature**: `{ botGuard, data, setData }` where `botGuard` is typed as the payload from `BotGuard::payload()`

### 5. Styling: Tailwind CSS v4 overrides for React Aria

- **Decision**: Style React Aria Components with Tailwind utility classes to match pos-reference visual (rounded-xl, border-2, gradient backgrounds, etc.)
- **Rationale**: The project already uses React Aria everywhere. Replacing them with raw inputs would break consistency. Instead, style them to look like the reference

### 6. Show/Hide password toggle

- **Decision**: Each password field gets an `IconEye`/`IconEyeOff` button positioned absolutely inside the input wrapper
- **Rationale**: Matches pos-reference UX exactly

### 7. Wayfinder vs. hardcoded URLs

- **Decision**: Use hardcoded action URLs (`/login`, `/register`, etc.) like the current codebase does for the `<Form>` component, matching the stable auth route structure. No Wayfinder imports needed for auth pages
- **Rationale**: Auth route URLs are stable and defined in `routes/auth.php`. The current code already uses this pattern. Avoids Wayfinder generation dependency

## Risks / Trade-offs

- **BotGuard field name config drift**: The honeypot field name is configurable via `config('security.bot_guard.honeypot_field')`. If changed, frontend won't automatically update. → Mitigation: Use the `botGuard` prop values (from controller) to dynamically set field names, matching pos-reference approach exactly
- **React Aria form compatibility**: React Aria's `<Form>` may not handle dynamic field names cleanly. → Mitigation: Pages with BotGuard use standard `<form>` + `useForm`; only simple pages use `<Form>`
- **GuestLayout too opinionated**: If a future auth page needs different hero content, making GuestLayout accept hero content as props might be needed. → Mitigation: Accept `hero` optional prop slot for customization
