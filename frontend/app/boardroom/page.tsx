"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Check } from "lucide-react";
import { useIdeaStore } from "@/lib/store";
import { runBoardroom, saveResult } from "@/lib/api";
import type { BoardroomResult } from "@/lib/types";
import { PersonaCard } from "@/components/boardroom/PersonaCard";
import { ConvictionScore } from "@/components/boardroom/ConvictionScore";
import { ActionItem } from "@/components/boardroom/ActionItem";
import { BoardroomSkeleton } from "@/components/boardroom/BoardroomSkeleton";
import { cn } from "@/lib/utils";

export default function BoardroomPage() {
  const router = useRouter();
  const { idea, targetUser, personas } = useIdeaStore();

  const [result, setResult] = useState<BoardroomResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!idea || !targetUser) { router.replace("/"); return; }

    runBoardroom({ idea, targetUser, personas })
      .then(async (res) => {
        setResult(res);
        // Auto-save in background
        try {
          const saved = await saveResult({
            idea, targetUser, mode: "boardroom",
            config: { personas },
            result: res,
            convictionScore: res.convictionScore,
          });
          setShareUrl(saved.url);
        } catch {
          // non-blocking — save failure shouldn't break the UX
        }
      })
      .catch((e) => setError(e.message ?? "Something went wrong"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="text-center flex-1">
          <p className="text-sm font-semibold">The Boardroom</p>
          {idea && (
            <p className="text-xs text-muted-foreground truncate max-w-xs mx-auto hidden sm:block">
              {idea.slice(0, 60)}{idea.length > 60 ? "…" : ""}
            </p>
          )}
        </div>

        <button
          onClick={copyShareUrl}
          disabled={!shareUrl}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-md",
            shareUrl
              ? "text-foreground hover:bg-muted"
              : "text-muted-foreground/40 cursor-not-allowed"
          )}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full">
        {error ? (
          <ErrorState message={error} onRetry={() => router.replace("/boardroom")} />
        ) : !result ? (
          <BoardroomSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Conviction score + flags */}
            <ConvictionScore result={result} />

            {/* Action item */}
            <ActionItem actionItem={result.actionItem} />

            {/* Persona cards */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Panel Feedback
              </p>
              {result.personas.map((persona, i) => (
                <PersonaCard key={i} result={persona} index={i} delay={i * 0.08} />
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
