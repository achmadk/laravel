## 1. Shared Components

- [x] 1.1 Create `resources/js/components/auth-bot-guard-fields.tsx` — renders hidden honeypot + token inputs, typed with BotGuard payload, returns null when disabled
- [x] 1.2 Rewrite `resources/js/layouts/guest-layout.tsx` — split-panel layout with left form panel, right gradient hero panel (hidden on mobile), accepts `header`, `description`, `hero` props, supports optional `children` for status banners

## 2. Login Page

- [x] 2.1 Rewrite `resources/js/pages/auth/login.tsx` — BotGuard fields, email with IconMail, password with IconLock + show/hide toggle, remember checkbox, forgot password link (conditional on `canResetPassword`), gradient "Masuk" button with spinner, registration link (conditional on `canRegister`), hero panel with app features, all Indonesian text

## 3. Register Page

- [x] 3.1 Rewrite `resources/js/pages/auth/register.tsx` — BotGuard fields, name with IconUser, email with IconMail, password with IconLock + show/hide toggle, confirm password with IconLock + show/hide toggle, gradient "Daftar Sekarang" button with spinner, "Masuk disini" link, hero panel with platform benefits, all Indonesian text

## 4. Forgot Password Page

- [x] 4.1 Rewrite `resources/js/pages/auth/forgot-password.tsx` — BotGuard fields, email with IconMail, gradient "Kirim Link Reset" button with spinner, "Kembali" link to login page, status message display, hero panel with account recovery info, all Indonesian text

## 5. Reset Password Page

- [x] 5.1 Rewrite `resources/js/pages/auth/reset-password.tsx` — email input, password with show/hide toggle, confirm password with show/hide toggle, gradient "Reset Password" button, all Indonesian text

## 6. Confirm Password Page

- [x] 6.1 Rewrite `resources/js/pages/auth/confirm-password.tsx` — `challenge` prop context display ("Untuk melanjutkan {route}" or "Untuk melanjutkan aksi sensitif"), password with IconLock + show/hide toggle, gradient "Lanjutkan" button with spinner, IconShieldLock hero panel, all Indonesian text

## 7. Verify Email Page

- [x] 7.1 Rewrite `resources/js/pages/auth/verify-email.tsx` — BotGuard fields, status banner for verification-link-sent, spam-check tip box, gradient "Kirim Ulang Email Verifikasi" button with spinner, "Keluar" logout button, IconMailCheck hero panel, all Indonesian text

## 8. Cleanup

- [x] 8.1 Remove unused Wayfinder imports from auth pages (no longer needed with hardcoded action URLs)
- [x] 8.2 Remove commented-out Wayfinder code from auth pages
- [x] 8.3 Verify TypeScript compilation with `npx tsc --noEmit`
- [x] 8.4 Verify build with `vp build`
