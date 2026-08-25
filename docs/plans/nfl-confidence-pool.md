# NFL Confidence Pool App

## Concept

A weekly NFL pick’em site where every player ranks **all** games by confidence (forced unique ranks from highest to lowest).  
At the end of the week, points are awarded only for correct picks — equal to the confidence rank assigned.  
Wrong picks score zero.

Goal: real risk/reward on the highest-ranked games. A correct pick at the top of the list pays big; a miss there pays nothing.  
No free sandbagging of easy games. Do not call the top pick a “lock.”

## Location of this file

Plans live in `docs/plans/` — one markdown file per effort. `/execute-plan` can consume the **PR Plan** section below (`### PR N:` headings).

## What already exists

| Piece | Where |
|---|---|
| Season / week / game shapes | `src/features/nfl-schedule` (`NFLSeasonSchema`, `NFLWeekSchema`, `NFLGameSchema`) |
| Teams + logos | `src/features/nfl-teams` |
| Stadiums | `src/features/nfl-stadiums` |
| 2026 JSON | `src/pages/NFLConfidencePicks2026/data/{schedule-2026,teams,stadiums}.json` |
| Ingest rule | `AGENTS.md`: validate JSON; do not render a file that failed; invite fixes in the UI |
| 2025 winner-take-all pick’em | `src/pages/NFLPickem2025` (CSV, localStorage, QR). Not routed. Different scoring. Do not reuse its pick model. |

Bye weeks are not games (`awayTeamId: "bye"`, `stadiumId: null`). They are not ranked.

## Scoring

For a week with **N** real games (not byes):

- The player picks a winner for every game.
- The player assigns each game a unique integer rank in **1…N** via row order: **top of the list is N** (highest rank, most points), **bottom is 1**.
- After results: correct pick scores **that rank**; wrong pick scores **0**.
- **Whole week or nothing.** Do not score a week until every real game is terminal (`final` or `tie`). No running total off TNF alone.
- Week score is the sum. Season score is the sum of week scores.

Example: 16 games, KC at the top (16) and they win → +16. KC at the top and they lose → +0. A 3 at the bottom of the list that hits still pays 3.

No spreads. Straight up. Ties (if they happen): treat as wrong (score 0) unless we later add a “push” rule. There is no separate “lock” pick — the highest rank is just the top row.

## Domain (new schemas)

Add a feature module, e.g. `src/features/nfl-confidence-picks/`, following the core vs form split.

**Week entry** (one player, one week):

- `weekNumber`
- `picks`: one row per real game
  - `gameId` (branded `IdGuid`)
  - `winnerId` (`TeamAbbr`, must be home or away of that game)
  - `confidence` (int 1…N)
- Refine: every real game in the week appears exactly once; confidence values are a permutation of 1…N; no bye games.

**Results** (hand-edited JSON in the repo, see **Results file** below):

- Per game: home/away abbrs (natural keys, not UUIDs — this file is edited by hand), `winnerId`, `status: 'final' | 'tie'`, and box score `homeScore` / `awayScore`.
- A week with no entry (or fewer than N terminal games) is not posted. Whole week or nothing.
- Do not render scores from unvalidated results JSON.

**Player identity (v1):** email address, persisted in `localStorage` (same key pattern as 2025 `userEmail`). Email is what the weekly QR encodes so the commissioner can tell players apart. Internal `newId()` is still fine as a row key; it is not what we export.

## App behavior

1. **Boot:** parse `teams.json`, `stadiums.json`, `schedule-2026.json` with list/season schemas. If unusable → error page, do not draw the pool. If fixable issues → form UI, no pool render until parse succeeds.
2. **Week view:** see **Week pick UI** below. Pick a winner by mashing a team logo; rank by row order (drag). Incomplete weeks cannot be exported.
3. **Cutoff:** the list becomes **static** (no taps, no drag, no QR export) at **T−1 hour** of the week’s earliest **effective** kickoff. Dated games use `gameDateTimeUTC`. A `TBD` game’s effective kickoff is **8:00 PM America/New_York on that football week’s Thursday**. The only way the list changes after cutoff is uploading a valid week QR, which replaces row order and selected winners (still static). Each week has its own cutoff.
4. **Score file:** hand-edited `results-2026.json`. A week is scored only when **every** real game is in the file as `final` or `tie`. Then: box scores on the rows; if the static card is complete, right rail is games correct + total points. Incomplete result weeks do not score and do not show as posted.
5. **Board:** week table (player × game, confidence shown, correct/wrong) and season totals.
6. **Route:** e.g. `/nfl/2026` (keep `/nfl` free or redirect). Home “jet·sam” chip can point here when the page exists.

Stay on the current stack: Vite, React 19, React Router, MUI.

## Week pick UI

Desktop is the primary layout; phone is a strong second (stack the columns, keep week-switching and logo-taps usable). One page, one selected week — not the 2025 accordion-of-all-weeks.

```
NFL Confidence Picks                          (h1)
[ 1 ] [ 2 ] … [ 18 ]                          (week nav; current week selected)
Week 3 · Thu Sep 24 – Mon Sep 28              (h2)

[ games, ~2/3 ]                               [ rail: export while open;
                                                correct + points after cutoff
                                                once a score file exists ]
```

**Week nav.** Buttons or tabs, one per regular-season week (1–18). Default the **current** week: the week whose kickoff window contains now; before week 1 → week 1; after the week 18 finale → stay on 18 (or the board, later). Phone: horizontal scroll (MUI `Tabs` `scrollButtons` / chip row), not 18 wrapping buttons.

**Week heading.** `Week {n}` plus a date range. Intent is “that football week.” Derive the range from the week’s real (non-bye) kickoffs, not a naive calendar Thursday–Monday — 2026 week 1 already starts **Wednesday** (NE @ SEA) and has a Thursday international in Melbourne.

**Game list (left, ~2/3).**

- One row per real game. Byes are not ranked and do not appear in this list (optional later: a small “on bye” note).
- Initial sort: games with a known kickoff first (time, then home team name), then `TBD` games (home team name). That order is the starting rank; dragging replaces it.
- Row: **Away logo+name vs Home logo+name**, then known game deets to the right of the home logo (kickoff ET, stadium). No TV/network in the 2026 game schema.
- Mash a team’s logo to pick that side as the winner. Selected side is obvious; the other side recedes (2025 already does opacity on the unpicked radio).
- **Drag handle on the left of the row** (not the logos). Logos stay click-only so pick and reorder do not fight, including on phone.
- Rows are reorderable. **Row position is confidence: top = N, bottom = 1.** Rank number visible on every row so the permutation is not a secret. Keyboard: not drag-only — move up/down on the focused row (and/or the library’s keyboard pickup).
- Drag library: `@hello-pangea/dnd` would work (it is a vertical-list library and claims React 19). Prefer **`@dnd-kit/sortable`** for this app: React 19, touch as a first-class sensor, and we already owe keyboard ranks. Native HTML5 DnD is out.

**Right rail.** Sticky ~1/3 on desktop, stacked under the list on phone.

**Persistence.** One `localStorage` key per week, e.g. `nflConfidence2026-week-{n}`, holding that week’s card (order + winners). Email prefills from `userEmail` (same as 2025). QR upload after cutoff writes that week’s key so a refresh keeps the card.

While **open**:

- Count: `{picked} of {N}` where picked = games with a winner, **regardless of sort**. N = real games that week.
- Email field on this page (not a second route). Reuse `userEmail` in `localStorage`.
- Show `closesAt` on the rail.
- QR is **per week**, not the whole season. Encodes enough to rebuild that week’s entry: email, week number, winning team for each of the N rows **in current row order**. One NFL team plays at most once a week, so an ordered list of winner abbrs recovers game + side + confidence without game ids.
- **QR sits inside a button.** Click the button to download that QR’s SVG (ref on the QR node — never `document.querySelector('svg')`, this page is full of logo SVGs). Button is enabled only when all conditions are met; otherwise no download.
- Payload, versioned so it cannot be confused with 2025’s `email;0101…` blob: `v1;{email};{week};{abbr},{abbr},…` (N lowercase team abbrs, top-to-bottom). Filename along the lines of `nfl-confidence-w{n}-{email[at]}-{date}.svg`.
- **No QR download** unless all three are true: valid email, a winner on every real game that week, cutoff not passed. Missing email or an incomplete week → button disabled. Do not export a card that cannot round-trip.

After **cutoff**:

- No export QR button.
- File input to **upload a valid week QR** (the SVG they downloaded — not a 2025 commissioner “results” blob). A valid upload **replaces row order and selected winners** and writes that week’s localStorage key. The list stays static; showing those winners as frozen is correct.
- If the score file has this week **complete** (all N games `final` or `tie`) and the card is complete: right rail is **games they got right** and **total points**. Upload QR still works and re-scores.
- Otherwise: “Results not posted yet”; upload QR still updates the static card. No partial week score.

**Cutoff.** One clock per week: `closesAt = min(effectiveKickoff) − 1 hour`.

- Dated game: effective kickoff is `gameDateTimeUTC`.
- `TBD` game: effective kickoff is **8:00 PM America/New_York on that football week’s Thursday** (the Thursday three days before the week’s Sunday slate; if the week has dated games, that Sunday is the ET Sunday those games cluster on).
- **Any TBD in the week is enough.** That Thursday 8 PM enters the `min()`, so `closesAt` is **7:00 PM ET Thursday** even when the rest of the slate is dated Sunday. Intentional — better safe than sorry. Dated kickoffs earlier than that (Wednesday / Thursday night) can still freeze the week sooner.

At that instant: freeze taps and dragging, hide export. The on-screen card is the snapshot at cutoff until a valid QR overwrites it. Future weeks still export until *their* cutoff. Client clock is good enough for v1.

**Enforcing cutoff (no interval).** Time-check whenever that week’s view is shown (page load **and** week-nav change — key the week view on `weekNumber`, not only the document mount): if `now >= closesAt`, render static. Time-check again immediately **before QR download** and **before writing that week’s localStorage** (picks / reorder). If the check fails, **reload the page** — do not write, do not download — so the remount takes the static path. QR upload after cutoff is the allowed mutation and may write. A tab left open past freeze can still *look* open until they try to save or download; the reload snaps it shut.

2025 reference: `CreateNFLQR.tsx` + the right rail in `NFLPickem2025/index.tsx` (`Games Selected`, Save to QR). Reuse `qrcode.react` / SVG download and `jsQR` for ingest; do not reuse the 272-game bitstring or the extra `/nfl/create-qr` page.

### Week states

Same page, different rail and list behavior:

| State | When | List | Right rail |
|---|---|---|---|
| **Open** | before `closesAt` | pick + drag | `{picked} of {N}`, email, QR export |
| **Static, no score file** | cutoff passed, week absent or not complete in the score file | frozen snapshot; **upload QR** is the only mutation (rewrites order + winners, still frozen) | no export; upload QR; “Results not posted yet” |
| **Static, scored** | cutoff passed, score file has **all N** games as `final` or `tie` | frozen; **small text under each row** for the box score (`SEA 24, NE 13`, `Tie 17–17`); uploaded/frozen winners stay visible on the logos | **{correct} right** and **{points} points** when the card is complete; upload QR still replaces the card and re-scores |
| **Future** | this week’s `closesAt` is still in the future | same as Open | same as Open |

Navigating back to week 1 in week 12 is a static card, not a second chance to export.

**Upload QR (after cutoff).** File input (SVG/PNG), decode with `jsQR` (same idea as 2025 `ReadNFLQR`). Reject if the payload week ≠ the selected week, if the abbr list is not length N, or if an abbr is not playing that week. On success: reorder the list to the payload order, set each row’s selected winner, keep it static. If a score file is present, recompute the rail.

**Scoring.** Whole week or nothing. If the score file is missing this week, or any real game is not `final`/`tie`, do not score — rail stays “Results not posted yet,” no points. When the week is complete, join the static card: each `final` game is correct if selected winner = `winnerId` (counts as one “right” and adds that row’s rank); wrong or `tie` → not right, +0. Incomplete card (missing winners): still no rail score until they upload a complete QR.

Result text is the box score from the score file (`SEA 24, NE 13`). Winner for scoring still comes from `winnerId` / `status`, not from inferring at render time.

### Results file

Hand-edit and commit. One season file, not a CMS:

`src/pages/NFLConfidencePicks2026/data/results-2026.json`

```json
{
  "season": 2026,
  "weeks": [
    {
      "weekNumber": 1,
      "games": [
        { "awayTeamId": "ne", "homeTeamId": "sea", "winnerId": "sea", "status": "final", "awayScore": 13, "homeScore": 24 },
        { "awayTeamId": "sf", "homeTeamId": "lar", "winnerId": "lar", "status": "final", "awayScore": 17, "homeScore": 20 }
      ]
    }
  ]
}
```

- Home/away abbrs as keys so you never have to paste a UUID. `_summary` is allowed as optional grease, same as the schedule.
- **Omit the week until it is complete.** Whole week or nothing — do not add TNF-only stubs. A listed week must include every real game as `final` or `tie`; otherwise the UI treats it as not posted and does not score.
- `final`: `homeScore` and `awayScore` required (non-negative ints); `winnerId` is the side with the higher score and must be home or away.
- `tie`: scores required and equal; `winnerId` null; no points (same as wrong) until a push rule exists.
- Same ingest rule as the other JSON: `safeParse`; unusable file does not drive scores; fixable issues → form, no score render.

You add a finished week to this file after the slate. The UI then shows box scores under the rows plus correct/points in the rail.

## Key decisions

- **Top of the list is rank N, bottom is 1.** Highest rank, not a “lock.”
- **Straight up, no spread.** Concept is winner + rank, not covering.
- **Byes are excluded** from N and from the pick list.
- **T−1 hour of the earliest effective kickoff locks the page.** Dated games use `gameDateTimeUTC`. `TBD` uses Thursday 8:00 PM ET of that football week, so **any TBD means the week is frozen by 7:00 PM ET Thursday** unless an earlier dated kickoff already did. Freeze taps, drag, and QR export.
- **TBD games sort after the last known kickoff;** several TBDs sort by home team.
- **No email, or any game without a winner → no QR download.** QR lives in a button; click downloads only when conditions are met (ref on that QR, not a global `svg` query).
- **One `localStorage` key per week** (`nflConfidence2026-week-{n}`) plus shared `userEmail`.
- **Cutoff check on mount, and again before QR download or week-key writes.** If it fails, reload — do not write. QR upload after cutoff may write.
- **Drag handle on the left.** Logos are pick-only.
- **After cutoff, a valid week QR is the only mutation.** It rewrites order + selected winners; the list stays frozen. (The “results QR” in conversation is this player export, not a commissioner blob.)
- **Score file is a hand-edited repo file.** `results-2026.json`, abbr keys, box scores. **Whole week or nothing** — no score, no rail points, until all N games are `final`/`tie`. Then row box scores + games right + total points.
- **The static on-screen card is what we score** (cutoff snapshot or last successful QR upload) against the score file.
- **No multiplayer.** One browser, one player. QR is how a week leaves the machine; there are no accounts and no in-app shared pool.
- **Core schemas stay strict.** Ingest does not loosen `NFLGameSchema` (or the results schema) to make a bad file render.
- **2025 pick’em is a reference for UX chrome (logos, QR SVG download/ingest), not for pick shape or season-long QR.** 2025 is binary home/away with no ranks and one QR for 272 games.
- **v1 is a SPA with local persistence.** No backend in this plan. Weekly QR + email is how a completed week leaves the browser.
- **Row order is the confidence permutation.** Logo tap is the winner. Two gestures, one list.
- **Duplicate UUIDs in the 2026 JSON are a data bug** (logos/stadiums/games share ids). Fix before the UI keys lists on `id`.

## Happy-path shortfalls

Resolved: left drag handle; QR-in-a-button download via ref; one localStorage key per week; cutoff check on mount + before QR/localStorage write (reload if late); whole-week scoring only.

**Still real**

- **Fresh browser after cutoff.** No snapshot: frozen list, no winners, prompt to upload the week QR. Do not look like an editable blank slate.
- **Results week must match the schedule 1:1** (every real game, those home/away pairs, no extras). A well-formed JSON with the wrong N still must not score.
- **`closesAt` is live from the schedule JSON.** Dating a TBD after deploy can *reopen* a week. Adding a TBD can close it early. Do not loosen a week that already froze in production.
- **Default week between slates** (Tuesday after MNF, before next `closesAt`) is underspecified. Nav still works; landing week is fuzzy.
- **App behavior §5 “Board”** is leftover copy — post-MVP commish table, not this player week.
- Phone SVG download/upload is clumsy; acceptable for second-class, not a blocker.
- A tab left open past freeze still *looks* open until they try to save or download (then reload). Accepted.
- Tweaking picks after a download without clicking the QR button again means the SVG in Downloads can disagree with the week key. Same-browser scores the key; the file they email is the old one.

## Post-MVP: commissioner board

Not in this PR plan. After the player week path ships:

- Ingest a **collection of week QR SVGs** (the app reads them all, same idea as 2025 `Results.tsx` loading a folder).
- Board keyed by **email**.
- Columns: total points for each week we have a QR for that player, plus a season total.
- Weeks without a QR for that email stay empty — do not invent a card.
- Still not multiplayer: it is a commissioner tool over files, not accounts or live shared state.

## PR Plan

### PR 1: Unique ids in 2026 JSON

- **Files/components affected:** `src/pages/NFLConfidencePicks2026/data/teams.json`, `stadiums.json`, `schedule-2026.json`
- **Dependencies:** None
- **Description:** Regenerate colliding UUIDs so logo, stadium, game, and season ids are globally unique. Keep `homeStadium` / `stadiumId` / team abbr FKs valid. Do not change schema.

### PR 2: Season ingest gate

- **Files/components affected:** `src/pages/NFLConfidencePicks2026/` (loader), `src/features/nfl-teams`, `nfl-stadiums`, `nfl-schedule`, `src/routes/public.tsx`
- **Dependencies:** PR 1
- **Description:** Route a stub page. Load the three JSON files, `safeParse` with existing list/season schemas. Unusable input → reject. Fixable issues → form, no schedule render. Valid → render a read-only week list (games, teams, stadium names). No picks yet.

### PR 3: Confidence pick schemas

- **Files/components affected:** `src/features/nfl-confidence-picks/` (new: schema, types, barrel)
- **Dependencies:** PR 2
- **Description:** Core + form schemas for a week entry (winner + unique 1…N confidence) and for the hand-edited results file (season + weeks + home/away/winner abbrs + status + box scores). Refinements: permutation of ranks, winner ∈ {home, away}, no byes, `final` scores agree with `winnerId`. Unit-parse a couple of valid/invalid fixtures (even if `npm test` stays a stub, keep fixtures next to the schema).

### PR 4: Week pick UI

- **Files/components affected:** `src/pages/NFLConfidencePicks2026/` (week view, pick controls), MUI, `@dnd-kit/sortable` (or `@hello-pangea/dnd` if we reverse that)
- **Dependencies:** PR 3
- **Description:** Layout from **Week pick UI**: h1, week nav, week h2 + date range, 2/3 game list + 1/3 rail. Logo tap picks the winner; **left drag handle** reorders; rank = position (top = N). Initial sort: known kickoffs, then TBD by home team. Persist each week to its own `localStorage` key plus `userEmail`. Keyboard ranks, not drag-only. Live `{picked} of {N}`. QR in a button (`qrcode.react`, download via ref); payload `v1;email;week;ordered-winner-abbrs`. Button enabled only with valid email **and** N winners **and** now before `closesAt`. Time-check when the week view is shown (`key={weekNumber}`) and before download/write; if cutoff passed, reload. At cutoff: freeze the list, hide export, allow QR upload to replace the static card and write that week’s key. No separate create-QR route.

### PR 5: Results and scoring

- **Files/components affected:** `src/features/nfl-confidence-picks/` (score helper), `src/pages/NFLConfidencePicks2026/data/results-2026.json`, week-view scoring UI, `jsQR`
- **Dependencies:** PR 4
- **Description:** Hand-edited score file + schema parse (same ingest rule; abbr keys + box scores). A week scores only when all N games are `final`/`tie` — whole week or nothing. Then: box-score text under each row; rail is games-correct + total points when the static card is complete. QR upload still rewrites order/winners and re-scores. Incomplete or missing week → “Results not posted yet,” QR upload still applies.

### PR 6: Site link and this-player empty states

- **Files/components affected:** `src/pages/NFLConfidencePicks2026/`, `src/pages/Home/index.tsx` or About, `src/routes/public.tsx`
- **Dependencies:** PR 5
- **Description:** Link from site chrome / Home jet·sam chip to `/nfl/2026`. Empty states for weeks without picks or results. This-player season total from weeks scored on this device is fine; the commissioner QR-collection board is **post-MVP**.

## Out of scope (this plan)

- Betting spreads / over-under
- Live odds
- Auth, accounts, payments, multiplayer
- Commissioner board (collection of QRs by email) — see Post-MVP
- Replacing 2025 pick’em
- Regenerating the 2025 CSV/QR pipeline
- Backend or database
