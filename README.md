# Starfield — starred repos explorer

Client-side single-page app for exploring MABAIStrategies' GitHub stars, with shared state persisted in Neon Postgres.

## Run

Open `index.html` directly, or serve it locally:

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080>. Note: `/api/state` only exists on Vercel — running fully locally (repos/lists/metrics persistence) requires `vercel dev` with `DATABASE_URL` set, otherwise the app falls back to in-memory defaults for that session.

## Data storage (Neon)

Repos, list-cart assignments, metrics, and last-sync time are stored server-side as a single JSONB row in Neon Postgres, via the serverless function at `api/state.js`. This replaced the earlier `localStorage`-only version, which kept a separate, unsynced copy of the data in every browser/origin.

- **Neon project:** `Starfield` (id `broad-forest-23510123`), org `Mark` (`org-cold-base-87492813`)
- **Table:**
  ```sql
  CREATE TABLE starfield_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT single_row CHECK (id = 1)
  );
  ```
- **Required Vercel env var:** `DATABASE_URL` — the pooled Neon connection string (Project Settings → Environment Variables on the Vercel dashboard, or Neon console → Connection Details). Must be set for both Production and Preview if you want preview deployments to work.
- **API contract:** `GET /api/state` returns the stored `{ repos, lists, metrics, lastSync }` object (or `null` if nothing has been saved yet). `POST /api/state` overwrites the whole row — same all-or-nothing semantics the old `saveState()` had with `localStorage`.
- **Offline fallback:** if `/api/state` is unreachable, the app renders from its built-in seed data and shows "Sync: Offline" in the KPI banner. Changes made while offline are not persisted — they're local to that page load only.

## Sync and privacy

The app reads `https://api.github.com/users/MABAIStrategies/starred`. A GitHub PAT is optional for public stars and useful for private stars/rate limits. The token is stored only in browser localStorage and is never committed or sent to the Neon-backed API. Synced repos, list assignments, and metrics now live in Neon (see above) rather than being browser-local.

GitHub's public REST API exposes starred repositories but does not expose arbitrary user-created named lists. The app therefore supports importing named carts as JSON and preserves 26 starter carts until the user's actual list names/membership are supplied.

Import shape:

```json
{"AI Agents":["openai/codex","anthropics/claude-code"],"Production":[]}
```

## Included

- Search, category filtering, sorting, expandable list carts, and JSON downloads
- GitHub star sync and README loading in repo modals
- Clone command and prerequisites guidance
- Personalized use-case cards with difficulty, setup time/cost, ROI target/value fields
- Metrics dashboard for usage, production mainstay, client usage, time/revenue impact, profit, quality, adoption, maintenance, satisfaction, and more
- Evolving impact ranking and complete workspace export
- Server-side persistence via Neon Postgres, shared across every browser/device
