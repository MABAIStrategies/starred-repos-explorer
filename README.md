# Starfield — starred repos explorer

Private, client-side single-page app for exploring MABAIStrategies' GitHub stars.

## Run

Open `index.html`, or serve it locally:

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.

## Sync and privacy

The app reads `https://api.github.com/users/MABAIStrategies/starred`. A GitHub PAT is optional for public stars and useful for private stars/rate limits. The token is stored only in browser localStorage and is never committed. Metrics, list assignments, and notes are also browser-local until exported.

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
