# Tasks: adopt-midone-theme

## 1. Phase 1 — Design tokens (`theme-tokens`)

- [x] 1.1 Read midone `src/index.css` tokens and rtos `resources/css/app.css`; build the token value mapping (slate palette → rtos variable names, pending/info values, radius 0.625rem, dark `#4874f6`)
- [x] 1.2 Replace the `:root` / `.dark` variable blocks in `resources/css/app.css` with the midone-derived values, keeping rtos's variable names (`--bg`, `--fg`, `--primary`, `--sidebar`, `--chart-1..5`, etc.) and adding `--pending*` while keeping `--info*`
- [x] 1.3 Verify token swap renders correctly in light + dark mode across dashboard, POS, auth, and landing pages (`pnpm dev`, visual check)

## 2. Phase 2 — Component styles (`theme-components`)

- [x] 2.1 Transcribe midone's button visual language (filled/outline/flat/text, layered-gradient `before`/`after` sheen) into `resources/js/components/ui/button.tsx` `tv()` variants, mapping @zag data-attributes to react-aria equivalents; verify all 34 consuming pages still render with unchanged props
- [x] 2.2 Re-skin `resources/js/components/dashboard/status-badge.tsx` to bold filled token backgrounds (`bg-<color> text-<color>-fg`) with the full semantic set including `pending`; verify all 16 consuming usages
- [x] 2.3 Re-skin input/field components (`input.tsx`, `field.tsx`, textarea, select/native-select) to midone control styling, preserving react-aria validation and disabled states
- [x] 2.4 Re-skin remaining ui kit (~25 files: card, dialog, table, toast, checkbox, menu, popover, sheet, tabs, avatar, separator, pagination, etc.) to midone's corresponding styles, deriving analogs where midone lacks a component (menu → menu.styles.ts, sheet → dialog.styles.ts)
- [x] 2.5 Run `pnpm build` (tsc + vite) and visual QA in light + dark mode across dashboard, POS, auth pages; confirm no component API changes

## 3. Phase 3 — Dashboard shell (`dashboard-shell`)

- [x] 3.1 Read `midone-dashboard-theme/src/themes/Rubick/SideMenu/SideMenu.vue` + `src/assets/css/themes/rubick/side-menu.css`; extract the shell structure, collapsed-state (110px) and hover-expand behaviors, group-label ellipsis, brand area
- [x] 3.2 Rebuild `resources/js/layouts/dashboard-layout.tsx` + `resources/js/layouts/dashboard/sidebar.tsx` to the Rubick side-menu shell, reusing `menuNavigation` and `checkPermission` unchanged; add scroll-area nav and sticky header
- [x] 3.3 Verify collapsed toggle + hover-expand animations, active-item highlight, permission filtering, and mobile behavior; confirm POS layout untouched

## 4. Phase 4 — Color scheme theming (`color-scheme`)

- [x] 4.1 Add the six `data-theme` primary overrides (`default` blue-900, `1` blue-950, `2` sky-800, `3` cyan-800, `4` indigo-900, `5` gray-900/gray-300 dark) to `resources/css/app.css`, mirroring midone's `[data-theme]` block
- [x] 4.2 Extend `resources/js/hooks/use-theme.ts` with a persisted color-scheme dimension (localStorage, independent of light/dark/system)
- [x] 4.3 Extend `theme-switcher.tsx` and `pages/settings/appearance.tsx` with a scheme picker (six options with labels/previews); scheme applies immediately, survives reload
- [x] 4.4 Verify all 6 schemes × light/dark render correctly; run `pnpm build` and final visual QA

## 5. Validation

- [x] 5.1 Run full build (`pnpm build`), lint (`pnpm lint`), and existing tests; confirm no regressions
- [x] 5.2 Confirm `pos-ui` spec scenarios still hold (tokens only, readable in both modes); review final diff per phase for rollback readiness
