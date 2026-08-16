## Context

Dompdf (barryvdh/laravel-dompdf ^3.1) renders 6 Blade views from `DocumentController` (invoice/receipt/payable/receivable/shipping). Views reference fonts via `public_path()` URLs — Dompdf loads TTFs at render time from those paths; its own font cache (`storage/fonts`) holds only metric JSONs for the base-14 fonts. Today: `invoice` points at missing `public/inter/Inter_24pt-*.ttf`; the other 5 views have no `@font-face` at all; all output falls back to Helvetica. The app web font stack (`resources/css/app.css --font-sans`) already puts "Plus Jakarta Sans" first, served via Google Fonts CSS2 in `app.blade.php`.

## Goals / Non-Goals

**Goals:**
- All 6 PDF views render Plus Jakarta Sans at weights 400/500/600/700.
- Font files vendored in-repo under `public/plus-jakarta-sans/` (no runtime network needed — Dompdf fetches from the local path).
- Zero controller/config changes; PDF generation flow untouched.

**Non-Goals:**
- No font weight above 700 (no PDF uses extrabold).
- No switch to Dompdf's font-cache/`Installer` — the existing `public_path()` convention works and is less invasive.
- No change to PDF layouts, page sizes, or barcode rendering.

## Decisions

**1. Source: Google Fonts static TTFs, vendored into `public/plus-jakarta-sans/`.**
Download the four static (non-variable) weights from the OFL GitHub/google-fonts repo: `PlusJakartaSans[wght].ttf` static instances — Regular(400), Medium(500), SemiBold(600), Bold(700). Why static not variable: Dompdf 3.x has limited variable-font support; static weights are the reliable choice and match how Inter was intended (4 face files). Verified license: SIL OFL 1.1, permits embedding/redistribution in derived works.

**2. One shared `@font-face` pattern repeated in each view.**
Each Blade gets 4 `@font-face` blocks (`font-family: 'Plus Jakarta Sans'`, weights 400/500/600/700, `src: url("{{ public_path('plus-jakarta-sans/PlusJakartaSans-<Weight>.ttf') }}") format('truetype')`), exactly mirroring invoice's current (dead) Inter pattern. No Blade partials extracted — keeping the diff mechanical and view-local (matches current per-view styles).

**3. Font-family stacks updated per view.**
- invoice: `$fontFamily = "'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif"`.
- payable/receivable/receipt_58/receipt_80: body stack `'Plus Jakarta Sans','Helvetica','Arial',sans-serif`.
- shipping_label: `font-family: 'Plus Jakarta Sans', sans-serif`.
Helvetica stays as the unconditional fallback so dompdf degraded original output.

**4. Receipt line-height stays as-is initially.**
No proactive font-metric tuning. Receipts inherit current 11px/12px line-height; any visible crowding after the swap is a separate follow-up. (Keep a `ponytail:` note in each changed Bla view.)

## Context
- `DocumentController.php` — 6 methods load views `pdf.{invoice,receipt_58,receipt_80,payable,receivable,shipping_label}`; no font-related code henceforth.
- `config/dompdf.php` — default `font_dir`/`font_cache` = `storage/fonts`; unchanged. `public_path()` resolution needs the files on disk; they're missing today (that's the bug).

## Risks / Trade-offs

- **Missing/variable TTF hand-named files** → Mitigation: fetch static-weight releases from the official `google/fonts` repo, name files `PlusJakartaSans-Regular|Medium|SemiBold|Bold.ttf`, verify each loads via a smoke render.
- **PDF visual regression at small sizes** → Dompdf uses `pt`/cM at 96dpi; Plus Jakarta Sans is slightly wider than Helvetica. Accepted; verified visually + receipts checked before archive.
- **License** → SIL OFL 1.1 permits bundling; include `OFL.txt` alongside the TTFs in `public/plus-jakarta-sans/`.
- **Barcode width shift in shipping/receipt** → barcode is an embedded PNG (base64 data URI), unaffected by font metrics.