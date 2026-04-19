"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, Check, Hash } from "lucide-react";
import { useIdeaStore } from "@/lib/store";
import { buildMarketStreamUrl, saveResult } from "@/lib/api";
import type { MarketComment, MarketSSEEvent } from "@/lib/types";
import { CommentThread } from "@/components/market/CommentThread";
import { AggregationOverlay } from "@/components/market/AggregationOverlay";
import { cn } from "@/lib/utils";

export default function MarketPage() {
  const router = useRouter();
  const { idea, targetUser, subreddit } = useIdeaStore();

  const [comments, setComments] = useState<MarketComment[]>([]);
  const [overlayData, setOverlayData] = useState<{ score: number; summary: string } | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [status, setStatus] = useState<"connecting" | "live" | "done" | "error">("connecting");
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!idea || !targetUser) { router.replace("/"); return; }

    const url = buildMarketStreamUrl({ idea, targetUser, subreddit });
    const es = new EventSource(url);

    es.addEventListener("agent_comment", (e) => {
      const data = JSON.parse(e.data) as Extract<MarketSSEEvent, { type: "agent_comment" }>;
      setStatus("live");
      setComments((prev) => [
        ...prev,
        { id: data.id, agent: data.agent, type: "vocal", comment: data.comment, upvotes: 0, turn: data.turn, replies: [] },
      ]);
      scrollFeed();
    });

    es.addEventListener("lurker_vote", (e) => {
      const data = JSON.parse(e.data) as Extract<MarketSSEEvent, { type: "lurker_vote" }>;
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === data.commentId) return { ...c, upvotes: c.upvotes + data.delta };
          const reply = c.replies.find((r) => r.id === data.commentId);
          if (reply) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === data.commentId ? { ...r, upvotes: r.upvotes + data.delta } : r
              ),
            };
          }
          return c;
        })
      );
    });

    es.addEventListener("agent_reply", (e) => {
      const data = JSON.parse(e.data) as Extract<MarketSSEEvent, { type: "agent_reply" }>;
      setComments((prev) =>
        prev.map((c) =>
          c.id === data.parentId
            ? { ...c, replies: [...c.replies, { id: data.id, agent: data.agent, comment: data.comment, upvotes: 0, turn: data.turn }] }
            : c
        )
      );
      scrollFeed();
    });

    es.addEventListener("simulation_complete", async (e) => {
      const data = JSON.parse(e.data) as Extract<MarketSSEEvent, { type: "simulation_complete" }>;
      setStatus("done");
      setOverlayData({ score: data.tractionScore, summary: data.summary });
      setShowOverlay(true);
      es.close();

      try {
        const saved = await saveResult({
          idea, targetUser, mode: "market",
          config: { subreddit },
          result: { subreddit, thread: data.thread, tractionScore: data.tractionScore, summary: data.summary },
          convictionScore: data.tractionScore,
        });
        setShareUrl(saved.url);
      } catch { /* non-blocking */ }
    });

    es.addEventListener("error", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setError(data.message);
      } catch {
        setError("Stream disconnected");
      }
      setStatus("error");
      es.close();
    });

    es.onerror = () => {
      if (status === "connecting") {
        setError("Could not connect to simulation");
        setStatus("error");
      }
      es.close();
    };

    return () => es.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollFeed() {
    setTimeout(() => {
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold">{subreddit}</p>
          <StatusDot status={status} />
        </div>

        <button
          onClick={copyShareUrl}
          disabled={!shareUrl}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-md",
            shareUrl ? "text-foreground hover:bg-muted" : "text-muted-foreground/40 cursor-not-allowed"
          )}
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
        </button>
      </header>

      {/* Post header */}
      <div className="px-4 sm:px-6 py-3 border-b border-border bg-muted/20 shrink-0">
        <p className="text-sm font-medium line-clamp-2">{idea}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Posted in {subreddit} · AI simulation</p>
      </div>

      {/* Feed */}
      <main className="flex-1 overflow-hidden relative max-w-2xl w-full mx-auto flex flex-col">
        {error ? (
          <ErrorState message={error} onRetry={() => router.replace("/market")} />
        ) : (
          <div ref={feedRef} className="flex-1 overflow-y-auto relative">
            {status === "connecting" && comments.length === 0 && <ConnectingState />}

            <AnimatePresence initial={false}>
              {comments.map((comment) => (
                <CommentThread key={comment.id} comment={comment} />
              ))}
            </AnimatePresence>

            {/* Overlay */}
            {showOverlay && overlayData && (
              <AggregationOverlay
                tractionScore={overlayData.score}
                summary={overlayData.summary}
                onDismiss={() => setShowOverlay(false)}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatusDot({ status }: { status: "connecting" | "live" | "done" | "error" }) {
  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className={cn(
          "w-2 h-2 rounded-full",
          status === "live" ? "bg-green-500" :
          status === "connecting" ? "bg-yellow-500" :
          status === "done" ? "bg-blue-500" : "bg-red-500"
        )}
        animate={status === "live" ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className="text-xs text-muted-foreground capitalize">{status}</span>
    </div>
  );
}

function ConnectingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4"
    >
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
      <p className="text-sm font-medium">Warming up the simulation…</p>
      <p className="text-xs text-muted-foreground">Agents are reading your pitch</p>
    </motion.div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
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
