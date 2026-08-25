# Agent notes

## Plans

PR and product plans live in `docs/plans/` — one markdown file per effort, not a single `docs/plan`. Include a `## PR Plan` section with `### PR N:` headings if `/execute-plan` should run it.

## Comments

Comments explain **why** or give context the code cannot: constraints, data quirks, domain rules. They do not narrate how.

Do not delete existing why-comments when reformatting, migrating APIs, or cleaning up.

Section labels that mark layers stay (`// core data shapes`, `// ui-form validation layer`).

## Feature schemas

Split **shape** from **form validation**. Follow `src/features/nfl-stadiums/schema.ts`.

- `// core data shapes` — structural constraints only (types, min/max, nullability). Cross-field domain refinements belong here. No user-facing `{ error }` copy on fields.
- `// ui-form validation layer` — restates the shape with practical limits and user-friendly messages. Reapply the same domain refinements.

List schemas wrap the core shape (`z.array(NFLStadiumSchema)`).

Shared primitives in `src/features/base` are building blocks, not form entities; they do not get a form layer.

## JSON ingest

Consumed JSON is always validated. Do not render from a file that failed validation.

If parse issues are fixable, load the data into the UI and invite the user to correct them. Only after it passes should that file drive rendered content (schedules, standings, picks, and the like).

Unusable input (cannot build a row, unknown team, broken kickoff, and similar) is rejected, not shown as a half-drawn page.
