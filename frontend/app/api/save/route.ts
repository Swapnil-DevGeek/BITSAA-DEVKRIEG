import { NextRequest, NextResponse } from "next/server";
import { saveMockResult } from "@/lib/mock-data";
import type { SavedValidation } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = crypto.randomUUID().slice(0, 8);

  const saved: SavedValidation = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    idea: body.idea,
    target_user: body.targetUser,
    mode: body.mode,
    config: body.config,
    result: body.result,
    conviction_score: body.convictionScore ?? null,
    slug,
  };

  saveMockResult(slug, saved);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.json({ slug, url: `${appUrl}/result/${slug}` }, { status: 201 });
}
