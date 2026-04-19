# OASIS Engine: Dual-Mode Idea Validator — Technical Plan

## Context

BITSAA Build-a-thon hackathon project. A web app that validates startup ideas via two AI simulations: "The Boardroom" (parallel expert persona feedback) and "The Market" (live Reddit-style agent debate). The team is split: frontend+Boardroom in Next.js, OASIS agent simulation in Python. This plan covers both sides and the API contract between them.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend + Boardroom API | Next.js 14 (App Router, TypeScript) | Full-stack, Vercel-native, SSE-friendly |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, hackathon-optimized |
| Python OASIS Backend | FastAPI + CAMEL-AI OASIS library | Multi-agent simulation with SSE streaming |
| Python deployment | Railway or Render | Supports long-lived SSE connections (Vercel doesn't) |
| Database (Next.js) | Turso (hosted SQLite / libSQL) | SQLite-compatible, works on Vercel (ephemeral FS won't persist), free tier |
| Database (Python) | SQLite file via `aiosqlite` | Railway has persistent disk; stdlib, zero config |
| LLM — Boardroom | Anthropic Claude Sonnet OR GPT-4o | Quality structured JSON output |
| LLM — Market Agents | Claude Haiku OR GPT-4o-mini | Speed + cost efficiency |
| Streaming | Server-Sent Events (SSE) | One-directional, browser-native |
| Deployment | Vercel (Next.js) + Railway (Python) | Separate hosts for different runtimes |

---

## Database Schema (SQLite)

> **Note:** Vercel's serverless functions have an ephemeral filesystem — a local `.db` file won't survive between cold starts. Use **Turso** (hosted libSQL, SQLite-wire-compatible) for the Next.js side via `@libsql/client`. The Python backend runs on Railway (persistent disk) and uses a plain SQLite file via `aiosqlite`.

### Schema (SQLite syntax — used in both Turso and Python SQLite)

```sql
CREATE TABLE IF NOT EXISTS validations (
  id               TEXT PRIMARY KEY,          -- UUID generated in app (crypto.randomUUID())
  created_at       TEXT DEFAULT (datetime('now')),
  idea             TEXT NOT NULL,
  target_user      TEXT NOT NULL,
  mode             TEXT NOT NULL CHECK (mode IN ('boardroom', 'market')),
  config           TEXT,                       -- JSON string: personas[] or { subreddit }
  result           TEXT NOT NULL,             -- JSON string: full simulation payload
  conviction_score REAL,                      -- 1.0–10.0
  slug             TEXT UNIQUE NOT NULL        -- UUID slug, generated in app
);

CREATE INDEX IF NOT EXISTS idx_validations_slug ON validations(slug);
```

### Result shape — Boardroom
```json
{
  "personas": [
    {
      "name": "Skeptical VC",
      "verdict": "FAIL",
      "score": 4,
      "steelman_against": "<strongest single argument this idea fails>",
      "insight": "...",
      "objection": "...",
      "recommendation": "..."
    }
  ],
  "convictionScore": 5.75,
  "actionItem": "...",
  "flags": [],
  "blindSpot": "<panel moderator warning, or null>"
}
```

Possible `flags` values:
- `"unanimous_optimism"` — all 4 gave PASS (treat with skepticism)
- `"unanimous_rejection"` — 0 gave PASS
- `"groupthink_risk"` — all scores within 1 point of each other

### Result shape — Market
```json
{
  "subreddit": "r/SaaS",
  "thread": [
    {
      "id": "c1",
      "agent": "PowerUser_42",
      "type": "vocal",
      "comment": "...",
      "upvotes": 47,
      "turn": 1,
      "replies": [{ "id": "c1r1", "agent": "Skeptic_9", "comment": "...", "upvotes": 12, "turn": 2 }]
    }
  ],
  "tractionScore": 7.2,
  "summary": "..."
}
```

---

## User Flow

```
/ (Launchpad)
  └─ IdeaForm: "Describe your idea" + "Who is your target user?"
  └─ ModeSelector: [Consult The Boardroom] [Test The Market]
        │                      │
        ▼                      ▼
/boardroom               /market
  └─ PersonaConfig          └─ SubredditPicker
     modal (4 editable         modal (r/SaaS,
     persona slots)            r/GenZ, r/DevOps...)
        │                      │
        ▼                      ▼
  Loading state           Live Reddit Feed
  (spinner + estimated    (SSE stream: comments
  time: ~15 seconds)       appear in real-time,
        │                  vote counters tick)
        ▼                      │
  Boardroom Results       After ~60s: AggregationOverlay
  - 4 PersonaCards          (Market Traction Score)
  - Conviction Score              │
  - #1 Action Item               ▼
        │                  Save to SQLite (Turso)
        └────────────┬─────────────┘
                     ▼
             /result/[slug]
             (shareable static page)
```

---

## API Reference

### Next.js API Routes

#### `POST /api/boardroom`
Runs all 4 persona calls in parallel, returns structured result.

**Request:**
```json
{
  "idea": "...",
  "targetUser": "...",
  "personas": [
    { "name": "Skeptical VC", "description": "Series A investor focused on unit economics" },
    { "name": "Target User", "description": "The exact person this product is for" },
    { "name": "Failed Founder", "description": "Someone who tried this exact idea and failed" },
    { "name": "Market Analyst", "description": "Expert in this specific market vertical" }
  ]
}
```

**Response:** `200 OK`
```json
{
  "personas": [ /* 4 persona result objects with steelman_against */ ],
  "convictionScore": 5.75,
  "actionItem": "...",
  "flags": [],
  "blindSpot": null
}
```

**Error:** `500` with `{ "error": "..." }`

---

#### `GET /api/market/stream?idea=...&targetUser=...&subreddit=...`
SSE proxy — opens a connection to Python OASIS backend and pipes the event stream to the frontend.

**SSE Event types piped through:**
```
event: agent_comment
data: {"id":"c1","agent":"PowerUser_42","comment":"...","turn":1}

event: lurker_vote
data: {"commentId":"c1","delta":7}

event: agent_reply
data: {"id":"c1r1","agent":"Skeptic_9","comment":"...","parentId":"c1","turn":2}

event: simulation_complete
data: {"tractionScore":7.2,"summary":"...","thread":[...]}

event: error
data: {"message":"..."}
```

---

#### `POST /api/save`
Saves a completed simulation result to Turso (SQLite) and returns the shareable URL.

**Request:**
```json
{
  "idea": "...",
  "targetUser": "...",
  "mode": "boardroom",
  "config": { "personas": [...] },
  "result": { /* full result payload */ },
  "convictionScore": 5.75
}
```

**Response:** `201 Created`
```json
{ "slug": "3f4a...", "url": "https://yourapp.vercel.app/result/3f4a..." }
```

---

#### `GET /api/result/[slug]`
Fetches a saved result by slug for the shareable page.

**Response:** `200 OK` — full `validations` row as JSON, or `404`.

---

### Python OASIS Backend API

**Base URL:** `https://oasis-backend.railway.app` (or Render equivalent)

#### `POST /simulate/market`
Starts a market simulation and streams SSE events.

**Request body:**
```json
{
  "idea": "...",
  "targetUser": "...",
  "subreddit": "r/SaaS",
  "numVocal": 5,
  "turns": 2
}
```

`numVocal` is the only agent count parameter. `numLurkers` is derived automatically as `numVocal * 4` (1:4 ratio). Defaults: `numVocal=5` → 5 vocal + 20 lurkers. For a quick demo, use `numVocal=3` → 3 vocal + 12 lurkers.

**Response:** `Content-Type: text/event-stream` (same event schema as above)

#### `GET /health`
Health check endpoint. Returns `{ "status": "ok" }`.

---

## Boardroom Prompt Template

```
You are {{persona.name}}: {{persona.description}}.

IMPORTANT: You are NOT a coach or mentor. You are a decision-maker
who has seen hundreds of pitches fail. A score above 7 means you
would personally bet money on this. Be honest, even if uncomfortable.
Founders need real feedback, not validation.

A founder is pitching you this idea:
IDEA: {{idea}}
TARGET USER: {{targetUser}}

Score calibration — use this strictly:
  1–3  Fatal flaw at the concept level; can't be fixed without changing the core
  4–5  Could work, but most attempts here fail
  6–7  Viable with significant execution risk
  8–9  Strong — clear market need, execution is the primary risk
  10   Near-certain winner — almost never give this

Step 1: Write the single strongest argument against this idea succeeding.
Step 2: Evaluate the idea WITH that argument in mind, then score it.

Respond ONLY with valid JSON. No preamble, no explanation:
{
  "steelman_against": "<strongest single argument this idea fails>",
  "verdict": "PASS" | "FAIL" | "CONDITIONAL",
  "score": <integer 1-10>,
  "insight": "<2-3 sentences from your perspective>",
  "objection": "<your single biggest concern OR endorsement>",
  "recommendation": "<one specific thing to change or double down on>"
}
```

All 4 calls run in `Promise.all()`.

### Conviction Score Formula (server-side, post-parse)

```
base            = arithmetic mean of persona scores
failPenalty     = 0.5 × (count of FAIL verdicts)
convictionScore = base − failPenalty   (floor at 1.0)

flags = []
if all 4 verdicts === 'PASS'                      → flags.push('unanimous_optimism')
if 0 verdicts === 'PASS'                          → flags.push('unanimous_rejection')
if max(scores) − min(scores) <= 1                 → flags.push('groupthink_risk')
```

### Verdict–Score Consistency (auto-clamp, prevents LLM contradictions)

```
verdict === 'FAIL'        → clamp score to ≤ 5
verdict === 'PASS'        → clamp score to ≥ 6
verdict === 'CONDITIONAL' → clamp score to 4–7
```

---

## Market Agent Architecture (Python OASIS)

### Agent Ratio: 1 vocal : 4 lurkers

`numLurkers = numVocal * 4` — always. Only `numVocal` is an input.

```
OASIS Simulation Setup (example: numVocal=5 → 5 vocal + 20 lurkers)
│
├── Vocal Agent Pool (LLM-powered, Claude Haiku / GPT-4o-mini)
│   Exactly numVocal agents sampled from the pool below:
│   ├── EarlyAdopter    — enthusiastic, sees potential
│   ├── Skeptic         — questions everything, price-sensitive
│   ├── PowerUser       — technical, asks about integrations
│   ├── LoudLurker      — passive until triggered, then opinionated
│   ├── Competitor       — dismissive, "we already do this"
│   ├── InvestorMindset — ROI focused, asks about moats
│   ├── DevAdvocate     — cares about APIs and open source
│   └── CasualUser      — confused by complexity, wants simplicity
│   (pool has 8 defined; sample numVocal of them, shuffle for variety)
│
└── Lurker Agents: numVocal × 4 (Programmatic — NO LLM calls)
    └── Rule: positive sentiment keywords → +rand(3-12) upvotes
        negative sentiment keywords   → +rand(1-5) upvotes (controversy drives engagement)
        base upvote rate: rand(1-8) per comment per turn
```

**Turn 1:** All `numVocal` vocal agents independently react to the pitch. Batched in groups of 4 (`asyncio.gather`) to respect rate limits.

**Turn 2:** Each vocal agent receives the pitch + max 2 comments from Turn 1 (randomly sampled, excludes their own). Generates 1 reply. Lurker votes applied after each turn.

**Termination:** After Turn 2 completes → emit `simulation_complete` with aggregated traction score.

**Traction Score calculation:**
- Average upvotes across all comments (normalized 1-10)
- Weighted by ratio of PASS-sentiment to FAIL-sentiment comments
- Single LLM call (Sonnet/GPT-4o) to generate the final summary

---

## Environment Variables

### Next.js (.env.local)
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=
PYTHON_OASIS_BACKEND_URL=https://oasis-backend.railway.app
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
```

### Python Backend (.env)
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

---

## Task Breakdown

### Phase 1 — Project Setup (parallel: Next.js team + Python team)

**T1.1** Init Next.js 14 project
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router
- Install: `shadcn/ui`, `@anthropic-ai/sdk`, `openai`, `@libsql/client`, `lucide-react`

**T1.2** Set up Turso (Next.js DB)
- Create DB at turso.tech: `turso db create oasis`
- Run schema SQL (validations table + index) via Turso shell
- Copy `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` to env
- Install `@libsql/client` in Next.js project
- `lib/db.ts`: init `createClient({ url, authToken })`, export typed `query()` helper

**T1.3** Init Python OASIS backend
- `fastapi`, `uvicorn`, `camel-ai[oasis]`, `anthropic`, `openai`, `python-dotenv`, `aiosqlite`
- Scaffold `main.py` with `/health` and `/simulate/market` stubs
- Deploy skeleton to Railway

**T1.4** Deploy Next.js skeleton to Vercel
- Connect GitHub repo
- Set all env vars

---

### Phase 2 — Launchpad UI

**T2.1** `app/page.tsx` — IdeaForm
- Two textareas: "Describe your idea" (max 300 chars) and "Who is your target user?" (max 150 chars)
- Character counter
- Form validation (both fields required)

**T2.2** ModeSelector
- Two large clickable cards (not just buttons): icon, title, 1-line description
- Boardroom card: structured icon, "Expert Panel Feedback"
- Market card: Reddit-style icon, "Simulate Public Reaction"
- On click → open respective config modal

**T2.3** State: `useReducer` or Zustand store for `{ idea, targetUser, mode, config }`
- Persist to sessionStorage so browser back doesn't lose the form

---

### Phase 3 — Boardroom Feature

**T3.1** `components/boardroom/PersonaConfig.tsx` — modal
- 4 persona slots shown as cards
- Each card: editable name field + editable description field
- Default values pre-filled (VC, Target User, Failed Founder, Market Analyst)
- "Run The Boardroom" CTA button

**T3.2** `app/api/boardroom/route.ts`
- Parse + validate request body
- Build 4 prompts from template (with anti-sycophancy + score anchors + steelman instruction)
- `Promise.all()` across 4 Claude/OpenAI calls
- Parse JSON from each response (try/catch per call; on parse failure, retry once)
- **Clamp scores** for verdict-score consistency before any calculation
- **Calculate conviction score**: `mean(scores) − (0.5 × failCount)`, floored at 1.0
- **Generate flags**: unanimous_optimism / unanimous_rejection / groupthink_risk
- **Pick actionItem**: highest-priority objection from FAIL personas, or top recommendation if all PASS
- **Call meta-validation** (T3.7) with all 4 persona responses → attach `blindSpot`
- Return full result

**T3.3** `app/boardroom/page.tsx`
- On mount: POST to `/api/boardroom` with form state
- Loading state: animated spinner + "Consulting the board..." (~15s estimate)
- Results: render 4 PersonaCards + ConvictionScore + ActionItem

**T3.4** `components/boardroom/PersonaCard.tsx`
- Verdict badge (PASS=green, FAIL=red, CONDITIONAL=yellow)
- Score out of 10
- **"Biggest Risk" callout** (red-bordered box): surfaces `steelman_against` prominently — this is the most honest signal
- Insight text
- Objection/endorsement highlighted
- Recommendation in muted text at the bottom

**T3.5** `components/boardroom/ConvictionScore.tsx`
- Animated circular gauge (0-10) showing penalty-adjusted conviction score
- Color scale: 0-4 red, 5-7 yellow, 8-10 green
- **Score distribution bar** below the gauge: shows each persona's individual score as mini bars so the user sees spread, not just the mean (a 5.8 from [3,8,4,8] looks very different from [5,6,6,6])
- **Flag banners**: if `flags` contains `unanimous_optimism` → amber warning "All panelists agreed — consider seeking harsher critics"; `groupthink_risk` → "Scores are suspiciously uniform"
- **Blind spot alert** (if `blindSpot` is non-null): collapsible panel below the gauge labeled "Panel Blind Spot — what everyone missed"

**T3.6** `components/boardroom/ActionItem.tsx`
- Prominent callout box: "#1 Thing To Fix Before You Build"

**T3.7** Meta-validation call (`lib/boardroom-engine.ts`)
- Runs after all 4 persona responses are collected
- Single LLM call (Claude Sonnet / GPT-4o) acting as "panel moderator"
- Prompt: given the 4 evaluations, identify any major market risk or obvious failure mode ALL reviewers missed; if the panel seems unreasonably positive, flag it explicitly
- Response: `{ "blindSpot": "<warning string or null>", "overallAssessment": "calibrated" | "overly_optimistic" | "overly_harsh" }`
- `overallAssessment === 'overly_optimistic'` → reduce convictionScore by 1 additional point and surface a warning
- This call runs in parallel with the save step, not blocking the results render

---

### Phase 4 — Python OASIS Backend (OASIS team)

**T4.1** Agent definitions (`agents/personas.py`)
- Define pool of 8 vocal agent configs: name, personality prompt, model assignment
- `get_vocal_agents(n: int)` → returns `n` agents sampled (shuffled) from pool
- `get_lurker_count(num_vocal: int) -> int` → returns `num_vocal * 4`
- Keep system prompts short (<100 tokens) to save cost
- SQLite DB setup: `aiosqlite`, auto-create `validations` table on startup at `./data/validations.db`

**T4.2** Turn 1 simulation (`simulation/turns.py`)
- `run_turn(agents, pitch, context_comments=None)` → batch agents in groups of 4 via `asyncio.gather()`
- Each agent call: returns comment string + emits SSE event immediately

**T4.3** Turn 2 simulation
- For each vocal agent: sample 2 comments from Turn 1 (exclude their own)
- Generate reply
- Batch in groups of 4 (same rate-limit pattern)

**T4.4** Lurker vote logic (`simulation/lurkers.py`)
- Define positive/negative keyword lists
- Apply vote delta after each turn
- Emit `lurker_vote` SSE events in burst

**T4.5** Traction score + summary (`simulation/scoring.py`)
- Aggregate upvotes, compute normalized score
- Single LLM call for summary paragraph

**T4.6** SSE FastAPI endpoint (`main.py`)
- `StreamingResponse` with `text/event-stream`
- Async generator that yields formatted SSE strings: `f"event: {type}\ndata: {json}\n\n"`
- CORS configured for Vercel frontend origin

---

### Phase 5 — Market UI

**T5.1** `components/market/SubredditPicker.tsx` — modal
- Grid of subreddit option cards: r/SaaS, r/GenZ, r/DevOps, r/startups, r/Entrepreneur
- Single select, "Start Simulation" CTA

**T5.2** `app/api/market/stream/route.ts` — SSE proxy
- Open HTTP connection to Python backend
- Pipe response stream to Next.js `ReadableStream`
- Return with `Content-Type: text/event-stream` headers

**T5.3** `app/market/page.tsx`
- On mount: connect to `/api/market/stream` via `EventSource`
- Handle each event type: `agent_comment`, `lurker_vote`, `agent_reply`, `simulation_complete`
- On `simulation_complete`: show AggregationOverlay

**T5.4** `components/market/RedditFeed.tsx`
- Fake subreddit header (r/SaaS branding)
- Stacked CommentThread components
- New comments slide in from top (CSS transition)

**T5.5** `components/market/CommentThread.tsx`
- Avatar (generated from agent name initials)
- Comment text (streams in word by word or appears instantly)
- Upvote counter: animates +N when lurker votes arrive
- Nested replies indented

**T5.6** `components/market/AggregationOverlay.tsx`
- Blurs the feed background
- Shows: Market Traction Score (large number), summary paragraph
- "View Thread" button dismisses overlay

---

### Phase 6 — Save & Share

**T6.1** `app/api/save/route.ts`
- Generate `id` and `slug` via `crypto.randomUUID()`
- Serialize `config` and `result` as JSON strings (SQLite has no native JSON column)
- Insert into Turso (`@libsql/client` execute with named params)
- Return `{ slug, url }`

**T6.2** Auto-save trigger
- Boardroom: call `/api/save` after results load
- Market: call `/api/save` on `simulation_complete` event
- Show shareable URL + copy button in results UI

**T6.3** `app/result/[slug]/page.tsx`
- Server component: fetch from `/api/result/[slug]`
- Render read-only view of either Boardroom or Market result
- Static-looking, suitable for judges to open
- Open Graph meta tags for rich link previews

---

### Phase 7 — Polish & Deploy

**T7.1** Loading states
- Boardroom: skeleton cards while waiting
- Market: "Warming up the simulation..." before first SSE event

**T7.2** Error handling
- API failures: toast notification + retry button
- SSE disconnect: auto-reconnect once, then show error

**T7.3** Mobile check
- Test Launchpad and Results pages on 375px width
- Persona cards stack vertically on mobile

**T7.4** Final deploy
- Merge all to `main`
- Verify Vercel build passes
- Smoke-test both modes end-to-end with a real idea
- Confirm shareable URLs load correctly

---

## Verification / Testing Checklist

- [ ] Boardroom: submit form → 4 persona cards appear with valid JSON data including `steelman_against`
- [ ] Boardroom: FAIL verdict with score > 5 gets auto-clamped to 5 (test with a clearly bad idea)
- [ ] Boardroom: conviction score uses penalty formula, not plain mean
- [ ] Boardroom: `unanimous_optimism` flag appears when all 4 give PASS
- [ ] Boardroom: `groupthink_risk` flag appears when all scores within 1 point
- [ ] Boardroom: `blindSpot` panel appears when meta-validation flags an issue
- [ ] Boardroom: score distribution bar shows individual scores, not just aggregate
- [ ] Boardroom: result auto-saves and `/result/[slug]` loads the saved data
- [ ] Market: SSE connection opens, events stream in real-time
- [ ] Market: vote counters animate when `lurker_vote` events arrive
- [ ] Market: AggregationOverlay appears after `simulation_complete`
- [ ] Market: result saves and shareable URL is generated
- [ ] Both modes complete in under 3 minutes
- [ ] SQLite/Turso: row inserted correctly, `config` and `result` are valid JSON strings
- [ ] Vercel: production build passes, no env var issues
- [ ] Python backend: `/health` returns 200 on Railway

---

## Token Budget Estimate

| Call | Model | Count | ~Tokens | ~Cost |
|---|---|---|---|---|
| Boardroom personas | Claude Sonnet | 4 parallel | 900/call | ~$0.022 |
| Boardroom meta-validation | Claude Sonnet | 1 | 1200 | ~$0.004 |
| Market vocal agents | Claude Haiku | `numVocal×2` turns (e.g. 10 for numVocal=5) | 350/call | ~$0.004 |
| Market traction summary | Claude Sonnet | 1 | 600 | ~$0.002 |
| **Total per session** | | | | **~$0.032** |
