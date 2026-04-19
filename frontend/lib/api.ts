import type {
  BoardroomResult,
  Persona,
  SavedValidation,
  MarketResult,
} from "@/lib/types";

// ── Boardroom ─────────────────────────────────────────────────────────────────

export interface RunBoardroomParams {
  idea: string;
  targetUser: string;
  personas: Persona[];
}

export async function runBoardroom(
  params: RunBoardroomParams
): Promise<BoardroomResult> {
  const res = await fetch("/api/boardroom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Boardroom simulation failed");
  }
  return res.json();
}

// ── Market (SSE) ──────────────────────────────────────────────────────────────

export interface MarketStreamParams {
  idea: string;
  targetUser: string;
  subreddit: string;
  numVocal?: number;
}

export function buildMarketStreamUrl(params: MarketStreamParams): string {
  const q = new URLSearchParams({
    idea: params.idea,
    targetUser: params.targetUser,
    subreddit: params.subreddit,
    numVocal: String(params.numVocal ?? 5),
  });
  return `/api/market/stream?${q.toString()}`;
}

// ── Save & share ──────────────────────────────────────────────────────────────

export interface SaveParams {
  idea: string;
  targetUser: string;
  mode: "boardroom" | "market";
  config: { personas?: Persona[]; subreddit?: string };
  result: BoardroomResult | MarketResult;
  convictionScore?: number;
}

export async function saveResult(
  params: SaveParams
): Promise<{ slug: string; url: string }> {
  const res = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error("Failed to save result");
  return res.json();
}

// ── Fetch saved result ────────────────────────────────────────────────────────

export async function fetchResult(slug: string): Promise<SavedValidation> {
  const res = await fetch(`/api/result/${slug}`);
  if (res.status === 404) throw new Error("Result not found");
  if (!res.ok) throw new Error("Failed to fetch result");
  return res.json();
}
