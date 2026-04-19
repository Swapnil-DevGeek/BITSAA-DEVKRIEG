export type Verdict = "PASS" | "FAIL" | "CONDITIONAL";

export type SimulationFlag =
  | "unanimous_optimism"
  | "unanimous_rejection"
  | "groupthink_risk";

export interface Persona {
  name: string;
  description: string;
}

export interface PersonaResult {
  name: string;
  verdict: Verdict;
  score: number;
  steelman_against: string;
  insight: string;
  objection: string;
  recommendation: string;
}

export interface BoardroomResult {
  personas: PersonaResult[];
  convictionScore: number;
  actionItem: string;
  flags: SimulationFlag[];
  blindSpot: string | null;
}

// ── Market ────────────────────────────────────────────────────────────────────

export interface MarketReply {
  id: string;
  agent: string;
  comment: string;
  upvotes: number;
  turn: number;
}

export interface MarketComment {
  id: string;
  agent: string;
  type: "vocal" | "lurker";
  comment: string;
  upvotes: number;
  turn: number;
  replies: MarketReply[];
}

export interface MarketResult {
  subreddit: string;
  thread: MarketComment[];
  tractionScore: number;
  summary: string;
}

// ── SSE events (Market stream) ────────────────────────────────────────────────

export type MarketSSEEvent =
  | { type: "agent_comment"; id: string; agent: string; comment: string; turn: number }
  | { type: "lurker_vote"; commentId: string; delta: number }
  | { type: "agent_reply"; id: string; agent: string; comment: string; parentId: string; turn: number }
  | { type: "simulation_complete"; tractionScore: number; summary: string; thread: MarketComment[] }
  | { type: "error"; message: string };

// ── Saved validation (DB row shape returned by /api/result/[slug]) ────────────

export type SimulationMode = "boardroom" | "market";

export interface SavedValidation {
  id: string;
  created_at: string;
  idea: string;
  target_user: string;
  mode: SimulationMode;
  config: { personas?: Persona[]; subreddit?: string };
  result: BoardroomResult | MarketResult;
  conviction_score: number | null;
  slug: string;
}
