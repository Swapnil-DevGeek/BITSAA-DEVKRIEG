"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { BoardroomResult, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

const FLAG_CONFIG: Record<string, { message: string; variant: "warn" | "info" }> = {
  unanimous_optimism: {
    message: "All 4 panelists agreed — scores may be inflated. Consider seeking harsher critics.",
    variant: "warn",
  },
  unanimous_rejection: {
    message: "The entire board rejected this idea. Fundamental rethink may be needed.",
    variant: "warn",
  },
  groupthink_risk: {
    message: "All scores are suspiciously close together — the panel may not be independent enough.",
    variant: "info",
  },
};

interface Props {
  result: BoardroomResult;
}

export function ConvictionScore({ result }: Props) {
  const [blindSpotOpen, setBlindSpotOpen] = useState(false);
  const score = result.convictionScore;
  const pct = (score / 10) * 100;

  const color =
    score >= 8 ? "text-green-600 dark:text-green-400" :
    score >= 5 ? "text-yellow-600 dark:text-yellow-400" :
    "text-red-600 dark:text-red-400";

  const trackColor =
    score >= 8 ? "bg-green-500" :
    score >= 5 ? "bg-yellow-500" :
    "bg-red-500";

  const verdictCounts = result.personas.reduce<Record<Verdict, number>>(
    (acc, p) => { acc[p.verdict]++; return acc; },
    { PASS: 0, FAIL: 0, CONDITIONAL: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-xl border border-border bg-card p-5 space-y-5"
    >
      {/* Score row */}
      <div className="flex items-end gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Conviction Score
          </p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-5xl font-bold tabular-nums leading-none", color)}>
              {score.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
          </div>
        </div>

        {/* Verdict breakdown pills */}
        <div className="flex gap-1.5 pb-1 flex-wrap">
          {verdictCounts.PASS > 0 && (
            <VerdictPill count={verdictCounts.PASS} label="Pass" className="bg-green-500/10 text-green-600 dark:text-green-400" />
          )}
          {verdictCounts.CONDITIONAL > 0 && (
            <VerdictPill count={verdictCounts.CONDITIONAL} label="Conditional" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" />
          )}
          {verdictCounts.FAIL > 0 && (
            <VerdictPill count={verdictCounts.FAIL} label="Fail" className="bg-red-500/10 text-red-600 dark:text-red-400" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className={cn("h-full rounded-full", trackColor)}
          />
        </div>

        {/* Per-persona score dots */}
        <div className="flex items-center gap-2">
          {result.personas.map((p, i) => (
            <div key={i} className="flex-1 text-center">
              <div className="text-xs tabular-nums font-medium text-muted-foreground">{p.score}</div>
              <div className="text-[10px] text-muted-foreground/60 truncate">{p.name.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="space-y-2">
          {result.flags.map((flag) => {
            const cfg = FLAG_CONFIG[flag];
            if (!cfg) return null;
            return (
              <div
                key={flag}
                className={cn(
                  "flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs",
                  cfg.variant === "warn"
                    ? "border-yellow-300 dark:border-yellow-800 bg-yellow-500/5 text-yellow-700 dark:text-yellow-400"
                    : "border-blue-200 dark:border-blue-900 bg-blue-500/5 text-blue-700 dark:text-blue-400"
                )}
              >
                {cfg.variant === "warn"
                  ? <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  : <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                }
                <span className="leading-relaxed">{cfg.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Blind spot */}
      {result.blindSpot && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setBlindSpotOpen(!blindSpotOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium hover:bg-muted/30 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
              Panel Blind Spot — what everyone missed
            </span>
            {blindSpotOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <motion.div
            initial={false}
            animate={{ height: blindSpotOpen ? "auto" : 0, opacity: blindSpotOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1">
              <p className="text-xs text-muted-foreground leading-relaxed">{result.blindSpot}</p>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function VerdictPill({ count, label, className }: { count: number; label: string; className: string }) {
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", className)}>
      {count} {label}
    </span>
  );
}
