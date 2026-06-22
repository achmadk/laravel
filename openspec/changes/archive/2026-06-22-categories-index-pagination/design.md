## Context

The `CategoryController@index` method uses `paginate(2)` to limit category results. This is inconsistent with every other listing controller in the `Apps` namespace — the standard is `paginate(10)`, adopted by 12+ controllers (Members, Transactions, Customers, Pricing Rules, CRM, etc.). The `ProductController` and `CustomerController` use `paginate(5)`, making `paginate(2)` the lowest in the entire app.

This was likely a development scaffolding artifact or copy-paste mistake. No business requirement justifies the 2-item limit — it is a bug.

## Goals / Non-Goals

**Goals:**

- Match the `CategoryController` pagination to the codebase convention of `paginate(10)`
- Zero frontend changes — the React `Index.tsx` renders paginated data generically

**Non-Goals:**

- No design system changes
- No migration or seed adjustments
- No new frontend features

## Decisions

| Decision                      | Choice                                              | Rationale                                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pagination size               | `paginate(10)` over `paginate(5)` or `paginate(15)` | 10 is the most common value across the codebase (12/16 App controllers). Matches user expectation for a manageable listing page.                                                                   |
| No `withQueryString()` needed | Not required                                        | The current query builder only supports `search` via the `when()` helper. Pagination links are client-rendered via Inertia. If search support is added later, `withQueryString()` should be added. |
| No config value               | Direct integer                                      | The rest of the codebase uses hardcoded integers. Adding a config layer would be over-engineering for a single value.                                                                              |

## Risks / Trade-offs

- **[Minimal]** Users who relied on the 2-item view will see more items. This is a positive change — it reduces pagination clicks.
- **[None]** No rollback needed — reverting the single line is trivial.
