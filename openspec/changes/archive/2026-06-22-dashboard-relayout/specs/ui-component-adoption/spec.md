## ADDED Requirements

### Requirement: Replace raw `<button>` with `Button` component

All Dashboard pages SHALL replace native `<button>` elements with the `Button` component from `@/components/ui/button` where the element performs an action.

The `Button` component SHALL be used with:

- `intent="primary"` for primary actions
- `intent="secondary"` or `intent="outline"` for secondary/cancel actions
- `intent="danger"` for destructive actions (delete)
- `intent="warning"` for edit/update actions
- `size="sm"` or `size="md"` appropriately
- Icons passed as children

#### Scenario: Primary action button uses Button component

- **WHEN** a "Simpan" submit button exists
- **THEN** it uses `<Button type="submit" intent="primary">Simpan</Button>`

#### Scenario: Delete action button uses danger intent

- **WHEN** a delete button exists
- **THEN** it uses `<Button onPress={...} intent="danger" size="sm"><IconTrash /></Button>`

#### Scenario: Cancel button uses outline intent

- **WHEN** a cancel/back link styled as button exists
- **THEN** it uses `<Button intent="outline">Batal</Button>`

### Requirement: Replace raw input/textarea with `Input` component

Dashboard form pages SHALL use the `Input` component from `@/components/ui/input` for text inputs, and the native `<textarea>` wrapped with design token classes.

Raw `<input type="text">`, `<input type="email">`, `<input type="number">` elements SHALL be replaced with:

```tsx
<Input value={data.field} onChange={(e) => setData("field", e.target.value)} placeholder="..." />
```

For inputs with icons, `InputGroup` from `@/components/ui/input` SHALL be used.

#### Scenario: Text input uses Input component

- **WHEN** a form has `<input type="text" className="rounded-xl border ..." />`
- **THEN** it uses `<Input value={...} onChange={...} placeholder="..." />`

#### Scenario: Search input with icon uses InputGroup

- **WHEN** a search input has an icon inside it
- **THEN** it uses `<InputGroup><IconSearch data-slot="icon" /><Input placeholder="Cari..." /></InputGroup>`

### Requirement: Replace card-like divs with `Card` component

Dashboard pages SHALL use the `Card` component from `@/components/ui/card` for section containers that follow the card pattern (header + content + optional footer).

The `Card` subcomponents SHALL be used:

- `CardHeader` + `CardTitle` for section headers
- `CardContent` for body content
- `CardFooter` for action bars

#### Scenario: Form section uses Card

- **WHEN** a form page has a section like `<div className="bg-white dark:bg-slate-900 rounded-2xl border ... p-5"><h3>...</h3>...content...</div>`
- **THEN** it uses `<Card><CardHeader><CardTitle>...</CardTitle></CardHeader><CardContent>...content...</CardContent></Card>`

### Requirement: Replace page title h1 with `Heading` component

Dashboard pages SHALL use the `Heading` component from `@/components/ui/heading` for page titles.

- `level={1}` for main page titles
- `level={2}` for section titles
- `level={3}` for card/section headings

#### Scenario: Page title uses Heading level 1

- **WHEN** a page has `<h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategori</h1>`
- **THEN** it uses `<Heading level={1}>Kategori</Heading>`

### Requirement: Replace hardcoded confirmation dialogs with `Modal` component

Dashboard pages SHALL use the `Modal` component from `@/components/ui/modal` for confirmation dialogs instead of `window.confirm()`.

#### Scenario: Delete confirmation uses Modal

- **WHEN** a delete action triggers a confirmation
- **THEN** it opens a `<Modal>` with `<ModalHeader><ModalTitle>Konfirmasi Hapus</ModalTitle></ModalHeader><ModalBody>...</ModalBody><ModalFooter><Button>Batal</Button><Button intent="danger">Hapus</Button></ModalFooter>`
