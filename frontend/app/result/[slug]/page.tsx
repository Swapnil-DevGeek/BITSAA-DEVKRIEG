import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchResult } from "@/lib/api";
import type { BoardroomResult, MarketResult, SavedValidation } from "@/lib/types";
import { BoardroomResultView } from "@/components/shared/BoardroomResultView";
import { MarketResultView } from "@/components/shared/MarketResultView";
import { ShareButton } from "@/components/shared/ShareButton";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const validation = await fetchResult(slug);
    const score = validation.conviction_score?.toFixed(1) ?? "?";
    const mode = validation.mode === "boardroom" ? "Boardroom" : "Market";
    return {
      title: `${mode} Results — ${score}/10 · OASIS Engine`,
      description: `"${validation.idea.slice(0, 120)}" — validated by OASIS Engine`,
      openGraph: {
        title: `Idea Validation: ${score}/10`,
        description: validation.idea.slice(0, 200),
      },
    };
  } catch {
    return { title: "Result · OASIS Engine" };
  }
}

export default async function ResultPage({ params }: Props) {
  const { slug } = await params;
  let validation: SavedValidation;
  try {
    validation = await fetchResult(slug);
  } catch {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/result/${slug}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:opacity-70 transition-opacity">
          <Sparkles className="h-4 w-4" />
          OASIS Engine
        </Link>
        <ShareButton url={shareUrl} />
      </header>

      {/* Meta */}
      <div className="px-4 sm:px-6 py-4 border-b border-border bg-muted/20 max-w-2xl mx-auto w-full">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
          {validation.mode === "boardroom" ? "Boardroom Simulation" : `Market Simulation · ${(validation.config as { subreddit?: string }).subreddit ?? ""}`}
        </p>
        <p className="text-sm font-medium leading-relaxed">{validation.idea}</p>
        <p className="text-xs text-muted-foreground mt-1">Target user: {validation.target_user}</p>
      </div>

      {/* Result */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full">
        {validation.mode === "boardroom" ? (
          <BoardroomResultView result={validation.result as BoardroomResult} />
        ) : (
          <MarketResultView result={validation.result as MarketResult} />
        )}
      </main>

      {/* CTA footer */}
      <footer className="border-t border-border px-4 sm:px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground mb-2">Validate your own idea</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Try OASIS Engine
        </Link>
      </footer>
    </div>
  );
}
