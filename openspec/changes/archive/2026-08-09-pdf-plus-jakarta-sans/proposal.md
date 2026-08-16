## Why

The web app already uses Plus Jakarta Sans (loaded via Google Fonts in `app.blade.php`, defined first in `--font-sans` in `app.css`), but every generated PDF claims a font that is not present: `invoice.blade.php` references `public/inter/Inter_24pt-*.ttf` files that do not exist in the repo, and the other five PDF views (`payable`, `receivable`, `receipt_58`, `receipt_80`, `shipping_label`) name `Inter` in `font-family` stacks with no `@font-face` at all. Dompdf cannot resolve any of these, so every PDF silently renders in the fallback Helvetica. The PDFs should match the app's typography: Plus Jakarta Sans.

## What Changes

- Download the four static Plus Jakarta Sans weights (Regular 400, Medium 500, SemiBold 600, Bold 700) — OFL-licensed — into `public/plus-jakarta-sans/`.
- `resources/views/pdf/invoice.blade.php`: replace the four dead Inter `@font-face` blocks with Plus Jakarta Sans equivalents; update `$fontFamily` stack to `'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif`.
- `payable`, `receivable`: add the same four `@font-face` blocks; swap `font-family` from `'Inter', ...` to `'Plus Jakarta Sans', ...`.
- `receipt_58`, `receipt_80`: add the same `@font-face` blocks; swap the body `font-family`.
- `shipping_label`: add the same `@font-face` blocks; swap `font-family` (currently bare `'Helvetica'`).
- No controller, config, or layout changes. All 6 PDF documents are in scope (decision A/B/C).

## Capabilities

### New Capabilities
- `pdf-plus-jakarta-sans`: PDF documents (`pdf/*.blade.php`) render with the Plus Jakarta Sans typeface at 400/500/600/700, matching the app's web font.

### Modified Capabilities
<!-- None -->

## Impact

- New static font files under `public/plus-jakarta-sans/` (4× TTF, ~100KB each).
- 6 Blade views changed (all under `resources/views/pdf/`).
- No API, database, route, or dependency changes.
- Visual baseline shift: all PDFs go from Helvetica → Plus Jakarta Sans (wider, friendlier geometry; line-height at 11-12px receipt sizes may need minor tuning).