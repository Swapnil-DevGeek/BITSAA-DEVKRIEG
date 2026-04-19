import type { MarketResult } from "@/lib/types";
import { CommentThread } from "@/components/market/CommentThread";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketResultView({ result }: { result: MarketResult }) {
  const isHigh = result.tractionScore >= 7;
  const isMid = result.tractionScore >= 4;
  const Icon = isHigh ? TrendingUp : isMid ? Minus : TrendingDown;
  const color = isHigh
    ? "text-green-600 dark:text-green-400"
    : isMid ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="space-y-4">
      {/* Traction score */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Market Traction Score
          </p>
          <div className="flex items-center gap-2">
            <Icon className={cn("h-6 w-6", color)} />
            <span className={cn("text-4xl font-bold tabular-nums", color)}>
              {result.tractionScore.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
        </div>
        <div className="flex-1 text-sm text-muted-foreground leading-relaxed">{result.summary}</div>
      </div>

      {/* Thread */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Simulation Thread · {result.subreddit}
          </p>
        </div>
        {result.thread.map((comment) => (
          <CommentThread key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
