## ADDED Requirements

### Requirement: SearchField component

The system SHALL provide a reusable `SearchField` component for Dashboard search inputs.

The component SHALL:

- Render an input with a search icon on the left side
- Accept `placeholder`, `value`, `onChange`, `className` props
- Support optional debounce (default 300ms) via `debounceMs` prop
- Use the `Input` component from `@/components/ui/input` internally
- Support dark mode via CSS design tokens
- Be importable from `@/components/dashboard/search-field`

#### Scenario: SearchField renders with placeholder

- **WHEN** `<SearchField placeholder="Cari..." value="" onChange={...} />` is rendered
- **THEN** it displays an input with a search icon and the placeholder text "Cari..."

#### Scenario: SearchField calls onChange on input

- **WHEN** user types in the SearchField
- **THEN** `onChange` fires with the new value

#### Scenario: SearchField debounces onChange

- **WHEN** `debounceMs={300}` is set and user types rapidly
- **THEN** `onChange` fires only 300ms after the last keystroke

### Requirement: Pagination component

The system SHALL provide a reusable `Pagination` component for Dashboard data tables.

The component SHALL:

- Accept `links` array (matching the existing `PaginationLink` interface: `{ url: string | null, label: string, active: boolean }`)
- Render Previous/Next buttons with chevron icons
- Render page number links with active state highlighting
- Use design system tokens for colors (`text-muted-fg`, `bg-bg`, `border-border`)
- Support dark mode
- Be importable from `@/components/dashboard/pagination`
- Replace all ~15 inline pagination implementations across Dashboard pages

#### Scenario: Pagination renders page links

- **WHEN** `<Pagination links={links} />` is rendered with 5 pages
- **THEN** it shows Previous, 1, 2, 3, 4, 5, Next buttons with the active page highlighted

#### Scenario: Pagination handles single page

- **WHEN** `<Pagination links={links} />` has only 1 page
- **THEN** nothing is rendered

### Requirement: EmptyState component

The system SHALL provide a reusable `EmptyState` component for "no data" states.

The component SHALL:

- Accept `icon`, `title`, `description`, `action` (optional CTA button/link) props
- Use design system tokens for styling
- Support dark mode
- Be importable from `@/components/dashboard/empty-state`
- Replace all inline empty state implementations across Dashboard pages

#### Scenario: EmptyState renders with icon and text

- **WHEN** `<EmptyState icon={IconDatabaseOff} title="Belum Ada Data" description="Tambahkan data pertama." />` is rendered
- **THEN** it displays the icon, title, and description centered in a bordered container

#### Scenario: EmptyState renders with CTA button

- **WHEN** `<EmptyState ... action={<Link href="/create">Tambah</Link>} />` is rendered
- **THEN** it displays the CTA button below the description

### Requirement: SummaryCards component

The system SHALL provide a reusable `SummaryCards` component for KPI summary sections.

The component SHALL:

- Accept `items` array of `{ label: string, value: string | number, helper?: string }`
- Render a responsive grid of summary cards
- Use design system tokens for styling
- Support dark mode
- Be importable from `@/components/dashboard/summary-cards`

#### Scenario: SummaryCards renders a grid of cards

- **WHEN** `<SummaryCards items={[{label:"Total",value:100},{label:"Aktif",value:50}]} />` is rendered
- **THEN** it shows 2 cards with labels "Total"/"Aktif" and values "100"/"50" in a responsive grid

### Requirement: StatusBadge component

The system SHALL provide a reusable `StatusBadge` component for status indicators.

The component SHALL:

- Accept `variant` prop: `"success"`, `"warning"`, `"danger"`, `"info"`, `"neutral"` (default)
- Accept `label` string prop
- Render a rounded pill badge with appropriate colors from the design system
- Support dark mode
- Be importable from `@/components/dashboard/status-badge`

#### Scenario: StatusBadge renders success variant

- **WHEN** `<StatusBadge variant="success" label="Lunas" />` is rendered
- **THEN** it shows a green pill badge with text "Lunas"

#### Scenario: StatusBadge renders danger variant

- **WHEN** `<StatusBadge variant="danger" label="Jatuh Tempo" />` is rendered
- **THEN** it shows a red pill badge with text "Jatuh Tempo"

### Requirement: PageHeader component

The system SHALL provide a reusable `PageHeader` component for consistent page title sections.

The component SHALL:

- Accept `title`, `description`, `icon`, `actions` (ReactNode for action buttons) props
- Use `Heading` component from `@/components/ui/heading` for the title
- Use design system tokens for styling
- Be importable from `@/components/dashboard/page-header`
- Replace inline header patterns across all Dashboard pages

#### Scenario: PageHeader renders with title and action

- **WHEN** `<PageHeader title="Kategori" description="10 kategori terdaftar" icon={IconCategory} actions={<Button>Tambah</Button>} />` is rendered
- **THEN** it shows the title, description, icon, and action button in a consistent layout

### Requirement: FilterBar component

The system SHALL provide a reusable `FilterBar` component for search + filter sections.

The component SHALL:

- Render the `SearchField` component and any filter controls as children
- Wrap in a form element with appropriate styling
- Use design system tokens
- Be importable from `@/components/dashboard/filter-bar`

#### Scenario: FilterBar renders with search and filters

- **WHEN** `<FilterBar onSubmit={...}><SearchField ... /><select>...</select></FilterBar>` is rendered
- **THEN** it renders the search field and select in a styled horizontal bar
