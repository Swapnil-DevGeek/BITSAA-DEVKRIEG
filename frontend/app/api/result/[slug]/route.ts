import { NextRequest, NextResponse } from "next/server";
import { getMockResult } from "@/lib/mock-data";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

interface BackendReply {
  id: string;
  agent: string;
  comment: string;
  likes: number;
  turn: number;
}

interface BackendComment {
  id: string;
  agent: string;
  type: string;
  comment: string;
  likes: number;
  turn: number;
  replies: BackendReply[];
}

function normalizeThread(thread: BackendComment[]) {
  return thread.map((c) => ({
    id: c.id,
    agent: c.agent,
    type: "vocal" as const,
    comment: c.comment,
    upvotes: c.likes,
    turn: c.turn,
    replies: (c.replies ?? []).map((r) => ({
      id: r.id,
      agent: r.agent,
      comment: r.comment,
      upvotes: r.likes,
      turn: r.turn,
    })),
  }));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try backend first
  const backendRes = await fetch(`${BACKEND_URL}/result/${slug}`, {
    headers: { "Cache-Control": "no-store" },
  }).catch(() => null);

  if (backendRes && backendRes.ok) {
    const data = await backendRes.json();
    const result = data.result ?? {};
    return NextResponse.json({
      id: data.slug,
      created_at: data.createdAt,
      idea: data.idea,
      target_user: data.targetUser,
      mode: "market",
      config: { subreddit: data.config?.subreddit },
      result: {
        subreddit: result.subreddit,
        thread: normalizeThread(result.thread ?? []),
        tractionScore: result.tractionScore,
        summary: result.summary,
      },
      conviction_score: result.tractionScore ?? null,
      slug: data.slug,
    });
  }

  // Fall back to in-memory store (used by boardroom)
  const saved = getMockResult(slug);
  if (saved) {
    return NextResponse.json(saved);
  }

  return NextResponse.json({ error: "not_found", message: "Result not found" }, { status: 404 });
}
