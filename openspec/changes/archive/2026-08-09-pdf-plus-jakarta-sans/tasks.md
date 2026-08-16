## 1. Font Assets

- [x] 1.1 Download Plus Jakarta Sans static TTFs (Regular/Medium/SemiBold/Bold) from the OFL google/fonts repo into `public/plus-jakarta-sans/`, named `PlusJakartaSans-{Regular,Medium,SemiBold,Bold}.ttf`
- [x] 1.2 Add `OFL.txt` license file beside the TTFs

## 2. View Updates (6 Blade files)

- [x] 2.1 `pdf/invoice.blade.php`: replace 4 dead Inter `@font-face` blocks with Plus Jakarta Sans (same weights); set `$fontFamily` to `"'Plus Jakarta Sans', 'Helvetica', 'Arial', sans-serif"`
- [x] 2.2 `pdf/payable.blade.php`: add 4 `@font-face` blocks; swap body `font-family`
- [x] 2.3 `pdf/receivable.blade.php`: add 4 `@font-face` blocks; swap body `font-family`
- [x] 2.4 `pdf/receipt_58.blade.php`: add 4 `@font-face` blocks; swap body `font-family`
- [x] 2.5 `pdf/receipt_80.blade.php`: add 4 `@font-face` blocks; swap body `font-family`
- [x] 2.6 `pdf/shipping_label.blade.php`: add 4 `@font-face` blocks; swap body `font-family`

## 3. Verification

- [x] 3.1 Generate each of the 6 PDFs in a browser/HTTP flow (user id=3, running server) and confirm each streams without Dompdf font warnings; spot-check visually that body text uses Plus Jakarta Sans (not Helvetica)
- [x] 3.2 `tsc --noEmit` not needed (no TS); run `php artisan test --compact` — confirm 55 passed / 316 assertions still green
- [x] 3.3 `vendor/bin/pint --dirty --format agent` on any changed PHP (expect none)