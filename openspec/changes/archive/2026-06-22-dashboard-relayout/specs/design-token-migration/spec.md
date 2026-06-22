## ADDED Requirements

### Requirement: Replace hardcoded slate/gray color classes with design tokens

All Dashboard page TSX files SHALL replace hardcoded Tailwind color utility classes with design system CSS token equivalents.

The following mappings SHALL be applied:

| Old Class                                                            | New Class                                                  | Rationale            |
| -------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------- |
| `text-slate-900`, `text-gray-900`, `text-slate-800`, `text-gray-800` | `text-fg`                                                  | Primary foreground   |
| `text-slate-700`, `text-gray-700`                                    | `text-fg` (headings/labels) or `text-muted-fg` (secondary) | Context-dependent    |
| `text-slate-600`, `text-gray-600`                                    | `text-muted-fg`                                            | Muted foreground     |
| `text-slate-500`, `text-gray-500`                                    | `text-muted-fg`                                            | Muted foreground     |
| `text-slate-400`, `text-gray-400`                                    | `text-muted-fg`                                            | Muted foreground     |
| `text-slate-200`, `text-gray-200` (dark mode)                        | `text-muted-fg`                                            | Dark mode muted      |
| `bg-white`, `dark:bg-slate-900`                                      | `bg-bg`                                                    | Default background   |
| `dark:bg-slate-950`, `dark:bg-gray-950`                              | `bg-bg`                                                    | Dark mode background |
| `dark:bg-slate-800`, `dark:bg-gray-900`                              | `bg-muted` (if subtle bg) or `bg-bg` (if main bg)          | Dark mode variants   |
| `border-slate-200`, `border-gray-200`                                | `border-border`                                            | Default border       |
| `dark:border-slate-800`, `dark:border-gray-900`                      | `border-border`                                            | Dark mode border     |
| `dark:border-slate-700`, `dark:border-gray-800`                      | `border-border`                                            | Dark mode border     |
| `hover:bg-slate-100`, `hover:bg-gray-100`                            | `hover:bg-muted`                                           | Hover background     |
| `bg-slate-50`, `dark:bg-slate-800`                                   | `bg-muted`                                                 | Subtle background    |
| `bg-slate-100`, `dark:bg-slate-800`                                  | `bg-muted`                                                 | Muted background     |

The following semantic color tokens SHALL replace their corresponding explicit colors:

- `text-primary-600`, `text-primary-700`, `dark:text-primary-400` → `text-primary`
- `bg-primary-50`, `bg-primary-100`, `dark:bg-primary-950/40` → `bg-primary-subtle`
- `text-primary-700`, `dark:text-primary-300` → `text-primary-subtle-fg`
- `text-danger-600`, `dark:text-danger-400` → `text-danger`
- `bg-danger-100`, `dark:bg-danger-900/50` → `bg-danger-subtle`
- `text-warning-600`, `dark:text-warning-400` → `text-warning`
- `bg-warning-100`, `dark:bg-warning-900/50` → `bg-warning-subtle`
- `text-success-600`, `dark:text-success-400` → `text-success`
- `bg-success-100`, `dark:bg-success-950/30` → `bg-success-subtle`
- `shadow-lg shadow-primary-500/30` → `shadow-lg shadow-primary/30`

#### Scenario: Page text color changes from slate to fg token

- **WHEN** a page has `<h1 className="text-slate-900 dark:text-white">Title</h1>`
- **THEN** it becomes `<h1 className="text-fg">Title</h1>`

#### Scenario: Card background changes from white to bg token

- **WHEN** a page has `<div className="bg-white dark:bg-slate-900">`
- **THEN** it becomes `<div className="bg-bg">`

#### Scenario: Border color changes from slate to border token

- **WHEN** a page has `<div className="border border-slate-200 dark:border-slate-800">`
- **THEN** it becomes `<div className="border border-border">`

### Requirement: Consistent dark mode via CSS variables

All Dashboard pages SHALL rely on the CSS variable system for dark mode instead of explicit `dark:` variant classes where a single token covers both modes.

The `dark:` variant SHALL still be used when:

- Semantic token doesn't adequately cover the case (e.g., specific overlay backgrounds)
- Different values are needed beyond what `--color-muted`, `--color-bg` provide

#### Scenario: Dark mode works without explicit dark: classes on migrated elements

- **WHEN** a `bg-bg` class is used on an element
- **THEN** it automatically renders the dark background in dark mode because `--bg` CSS variable changes in `.dark` selector

### Requirement: No regressions in visual appearance

After applying token replacements, each page SHALL appear visually identical in both light and dark modes.

#### Scenario: Visual comparison shows no unexpected changes

- **WHEN** a migrated page is rendered in light mode and dark mode
- **THEN** colors appear consistent — no missing backgrounds, invisible text, or contrast issues
