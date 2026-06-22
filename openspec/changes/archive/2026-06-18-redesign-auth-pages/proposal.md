## Why

Auth pages in the current project are the default Intent UI scaffold — a simple centered card with English text and basic form fields. The `../pos-reference` project has feature-rich auth pages with BotGuard security, bilingual Indonesian UX, show/hide password toggles, decorative hero layouts, and visual polish that the current implementation lacks. All backend controllers and routes were already ported in a previous session; the gap is now entirely frontend.

## What Changes

- **GuestLayout redesign**: From a simple centered card to a full split-panel layout (form left, decorative hero right)
- **AuthBotGuardFields component**: New shared component for honeypot + hidden token BotGuard fields
- **Login page**: Add BotGuard fields, `canRegister` gated registration link, show/hide password toggle, Indonesian text, gradient button, hero panel, icons, split layout
- **Register page**: Add BotGuard fields, show/hide password toggles, Indonesian text, gradient button, hero panel, icons, split layout
- **Forgot Password page**: Add BotGuard fields, Indonesian text, gradient button, hero panel, icons, back-to-login button, split layout
- **Reset Password page**: Polish with Indonesian text, gradient button, proper styling
- **Confirm Password page**: Add `challenge` prop display (shows what action triggered confirmation), show/hide password toggle, Indonesian text, gradient button, hero panel, icons, split layout
- **Verify Email page**: Add BotGuard fields, Indonesian text, gradient button, hero panel, icons, spam-check tip box, split layout

## Capabilities

### New Capabilities

- `auth-ui`: Auth pages UI components — GuestLayout, AuthBotGuardFields, and all 6 page components with their visual identity

### Modified Capabilities

- _(none — no existing specs to modify)_

## Impact

- **Frontend components**: Rewrite `resources/js/layouts/guest-layout.tsx`, create `resources/js/components/auth-bot-guard-fields.tsx`, rewrite all 6 pages in `resources/js/pages/auth/*.tsx`
- **Dependencies**: `@tabler/icons-react` is already installed; no new packages needed
- **No backend changes**: All controllers, routes, and services are already ported
