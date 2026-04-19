import { NextResponse } from "next/server";
import { MOCK_BOARDROOM } from "@/lib/mock-data";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST() {
  // Simulate the ~15s expert panel consultation
  await delay(3000);
  return NextResponse.json(MOCK_BOARDROOM);
}
