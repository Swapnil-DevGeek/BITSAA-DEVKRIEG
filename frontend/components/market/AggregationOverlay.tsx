"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tractionScore: number;
  summary: string;
  onDismiss: () => void;
}

export function AggregationOverlay({ tractionScore, summary, onDismiss }: Props) {
  const isHigh = tractionScore >= 7;
  const isMid = tractionScore >= 4;

  const Icon = isHigh ? TrendingUp : isMid ? Minus : TrendingDown;
  const color = isHigh
    ? "text-green-600 dark:text-green-400"
    : isMid
    ? "text-yellow-600 dark:text-yellow-400"
    : "text-red-600 dark:text-red-400";
  const label = isHigh ? "Strong Traction" : isMid ? "Mixed Signal" : "Low Traction";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-background/80 rounded-xl"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
        className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-4"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Market Traction Score
          </p>
          <div className="flex items-center justify-center gap-2">
            <Icon className={cn("h-7 w-7", color)} />
            <span className={cn("text-6xl font-bold tabular-nums", color)}>
              {tractionScore.toFixed(1)}
            </span>
          </div>
          <p className={cn("text-sm font-semibold", color)}>{label}</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>

        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          View Full Thread
        </button>
      </motion.div>
    </motion.div>
  );
}
