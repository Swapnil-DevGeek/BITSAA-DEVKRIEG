import { NextRequest, NextResponse } from "next/server";
import { getMockResult, MOCK_BOARDROOM, MOCK_IDEA, MOCK_TARGET_USER } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const saved = getMockResult(slug);

  if (saved) {
    return NextResponse.json(saved);
  }

  // Return a static fallback so direct URL visits always work during dev
  return NextResponse.json({
    id: "mock-id",
    created_at: new Date().toISOString(),
    idea: MOCK_IDEA,
    target_user: MOCK_TARGET_USER,
    mode: "boardroom",
    config: { personas: [] },
    result: MOCK_BOARDROOM,
    conviction_score: MOCK_BOARDROOM.convictionScore,
    slug,
  });
}
