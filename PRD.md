# PRD — Idea Validator (OASIS Engine)
**BITSAA Build-a-thon · April 19, 2026**

---

## The 3-Sentence PRD

**Problem:** Founders waste weeks building products nobody wants because they validate after building, not before. There's no fast, structured way to stress-test an idea in minutes.

**Target user:** A first-time founder at a hackathon at 9:15 AM who has an idea but isn't sure if it's worth spending the next 4 hours on.

**Success:** A founder types their idea, gets a structured multi-perspective verdict with a conviction score, and either commits to building or pivots — in under 3 minutes.

---

## What We're Building

A web app where a founder inputs their raw idea and gets back a simulated validation report — as if four expert voices (a VC, a real user, a failed founder, and a market analyst) reviewed it simultaneously. Powered by Claude as the OASIS simulation engine.

**One input. One result page. One shareable URL.**

---

## User Stories

| As a... | I want to... | So that... |
|---|---|---|
| Founder | Describe my idea in plain English | I don't have to format anything |
| Founder | See a VC's honest objection | I can address the hardest question before pitching |
| Founder | See a target user's gut reaction | I know if the pain point actually resonates |
| Founder | See what breaks similar ideas | I avoid known failure modes |
| Founder | Get a single conviction score | I can make a fast go/no-go decision |
| Founder | Share the result URL | I can show my team or mentor instantly |
| Judge | Click a live URL | I can see the product without being walked through it |

---

## Input Form — 3 Fields Only

| Field | Prompt shown to user | Example |
|---|---|---|
| Idea | Describe your idea in 2–3 sentences | "A tool that lets founders validate startup ideas before building, using AI to simulate expert feedback" |
| Target User | Who is this for? Be specific | "First-time founders at hackathons who don't have a mentor nearby" |
| Success in 30 days | How do you know it worked? | "100 validations run, 20% of users return to validate a second idea" |

---

## Output — Results Page

### 4 Persona Cards
Each card shows:
- Persona name + role
- One-line verdict (positive or negative)
- Top insight (2–3 sentences)
- Single biggest objection or endorsement

**Personas:**
1. 🏦 **Skeptical VC** — Would they fund it? What's the one thing that kills the deal?
2. 👤 **Target User** — Does the pain resonate? What would make them pay?
3. 💀 **Failed Founder** — Who tried this before? What broke it?
4. 📊 **Market Analyst** — What exists already? Where's the gap?

### Conviction Score
A 1–10 score with a one-line interpretation:
- 1–3: "High risk — validate the core assumption first"
- 4–6: "Promising — there's something here, but the wedge needs work"
- 7–9: "Strong signal — move fast, lock in your first user this week"
- 10: "Rare. Ship immediately."

### #1 Action Item
A single sentence: the most important thing to validate before writing any code.

---

## Claude API System Prompt

```
You are OASIS — an idea validation engine for early-stage founders.

Given a startup idea, target user, and 30-day success metric, simulate four expert perspectives and return a structured JSON object. Do not return markdown or any text outside the JSON.

Return this exact structure:
{
  "vc": {
    "verdict": "one-line verdict",
    "insight": "2-3 sentence analysis",
    "top_objection": "the single biggest concern"
  },
  "user": {
    "verdict": "one-line gut reaction",
    "insight": "2-3 sentence analysis",
    "would_pay": "yes/no and why in one sentence"
  },
  "failed_founder": {
    "verdict": "one-line warning or validation",
    "insight": "2-3 sentence analysis",
    "what_breaks": "the most likely failure mode"
  },
  "analyst": {
    "verdict": "one-line market read",
    "insight": "2-3 sentence analysis",
    "key_competitor": "closest existing solution"
  },
  "conviction_score": 7,
  "score_label": "Strong signal — move fast",
  "top_action": "single most important thing to validate before writing code"
}
```

---

## Technical Architecture

```
User fills form
      ↓
Next.js API route → Claude API (system prompt + idea JSON)
      ↓
Parse JSON response
      ↓
Save to Supabase (validations table) with UUID
      ↓
Redirect to /result/[uuid]
      ↓
Results page renders from Supabase row
      ↓
Shareable URL: https://yourapp.vercel.app/result/[uuid]
```

---

## Scope — What's In vs Out

| Feature | In scope | Notes |
|---|---|---|
| Input form (3 fields) | ✅ | Core |
| Claude API call + JSON | ✅ | Core |
| Results page with 4 personas | ✅ | Core |
| Conviction score | ✅ | Core |
| Shareable URL via Supabase | ✅ | Core |
| Loading state with progress text | ✅ | Easy, high polish |
| "Try an example" button | ✅ | Judges need this |
| Public feed of recent validations | ⚠️ | Build only if time allows |
| Auth / login | ❌ | Cut entirely |
| Email capture | ❌ | Cut |
| Comparison between two ideas | ❌ | V2 |

---

## Build Order (Prompt Sequence for Claude Code)

| # | Prompt | Done when... |
|---|---|---|
| 1 | Input form UI — 3 fields, Tailwind styled, no API yet | Form renders, fields work |
| 2 | Claude API route — POST idea → get JSON back, log to console | JSON appears in console |
| 3 | Results page — render 4 persona cards + score from JSON | Results display correctly |
| 4 | Supabase save + redirect to `/result/[uuid]` | URL is shareable and loads |
| 5 | Loading state — "Simulating 4 perspectives..." with steps | UX feels alive during wait |
| 6 | Landing page — one-line pitch + "Try an example" button | Judges can self-serve |
| 7 | Public feed (if time) | Recent validations visible |

---

## Definition of Done (for judging at 14:00)

- [ ] Live URL on Vercel
- [ ] Founder can input an idea and get a result in under 60 seconds
- [ ] Result page has 4 persona verdicts + conviction score + action item
- [ ] Result URL is shareable (paste it in the submission form)
- [ ] At least 2 pre-loaded example validations judges can click
- [ ] Works on mobile
