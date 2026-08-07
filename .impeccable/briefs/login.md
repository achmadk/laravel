# Surface Brief — Login (auth)

<!-- impeccable:surface-brief 1 -->

**Surface:** `resources/js/pages/auth/login.tsx` + `resources/js/layouts/guest-layout.tsx` (shared by all auth pages)
**Mode:** Operate — the visitor's success is logging in with zero friction and trustworthy feedback.

## Job and audience

Kasir atau pemilik toko membuka aplikasi di counter/laptop, dalam keadaan "mulai kerja" — ingin masuk secepat mungkin, tanpa bertanya kenapa tombol tidak merespons. Tindakan utama: isi email/password, tekan **Masuk**.

## Outcome and proof

Submit selalu bisa diklik di seluruh area tombol (tidak ada overlay tak terlihat yang menelan klik), dan interaksi submit memberi feedback yang jelas: loading saat diproses, tombol non-aktif agar tidak dobel-submit, fokus keyboard tetap terlihat.

- **Proof (bug):** `document.elementFromPoint(center tombol)` mengembalikan *tombol itu sendiri*, bukan glow orb. Setelah fix, tidak ada elemen `pointer-events: auto` yang menutupi form.
- **Proof (interaksi):** saat submit, tombol disabled + spinner + teks "Memproses…"; Enter di field mana pun ikut submit; fokus ring tetap tampak.

## Selected direction

**Perbaikan akar masalah di tempat bersama, tanpa mengubah identitas visual.**

- **Root cause:** dua decorative glow orb di `guest-layout.tsx` (`absolute top-10 right-10 size-[480px] … blur-[60px]` dan `absolute bottom-20 left-20 size-[360px] … blur-[80px]`) tidak punya `pointer-events-none`. Karena kontaining block-nya bukan hero panel (panel tidak `relative`), `overflow-hidden` panel tidak meng-clip mereka, dan dengan `z-index:auto` + `pointer-events:auto` mereka melukis **di atas** form statis — orb kiri-bawah menutupi area tengah/kiri tombol submit (terkonfirmasi via `elementFromPoint` pada `localhost:8000/login`).
- **Fix:** tambahkan `pointer-events-none` ke **kedua** orb di `guest-layout.tsx`. Satu tempat, memperbaiki **semua** halaman auth (login, register, forgot/reset-password, verify-email, confirm-password).
- **Interaksi submit** (di `login.tsx`): pertahankan pola yang sudah ada (`disabled={processing}` + spinner `IconLoader2` + "Memproses…"), pastikan `cursor-pointer` tetap, dan pastikan fokus ring tidak hilang saat disabled (jangan `pointer-events:none` pada tombol).

## Scope and boundaries

- **In scope:** kedua glow orb di `guest-layout.tsx`; state/feedback tombol submit di `login.tsx` bila perlu disempurnakan (tetap setia pada pola incumbent).
- **Untouched:** hero panel (gradient, grid pattern, brand, feature list), teks "Masuk"/brand, layout dua kolom, `Flash`/sonner, honeypot `AuthBotGuardFields`, seluruh halaman lain.
- **Anti-goals:** tidak ada redesign, tidak ada komponen baru, tidak ada perubahan visual world, tidak ada perubahan copy.

## States and ranges

- **Idle:** tombol penuh interaktif, kursor pointer di seluruh area.
- **Processing:** tombol `disabled` + spinner + "Memproses…" (sudah ada — pastikan konsisten & tidak dobel-submit).
- **Error:** validasi Inertia per-field + flash toast sonner (inkumbent).
- **Keyboard:** Tab sampai tombol, Enter submit, fokus ring terlihat (jangan tertutup orb/elemen lain).

## Constraints and open decisions

- Web, Inertia SPA + Tailwind v4; bahasa UI wajib Bahasa Indonesia.
- Aksesibilitas: tombol tetap `focusable` saat disabled; jangan pakai `pointer-events:none` pada tombol (mematikan cursor feedback).
- Tidak ada open decision yang menghalangi; fix siap dieksekusi satu-edit.
