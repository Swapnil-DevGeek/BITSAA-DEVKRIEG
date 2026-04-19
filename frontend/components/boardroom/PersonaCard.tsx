"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { PersonaResult, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

const VERDICT_CONFIG: Record<Verdict, { label: string; icon: React.ReactNode; classes: string; scoreBg: string }> = {
  PASS: {
    label: "Pass",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    classes: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20",
    scoreBg: "text-green-600 dark:text-green-400",
  },
  FAIL: {
    label: "Fail",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    classes: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
    scoreBg: "text-red-600 dark:text-red-400",
  },
  CONDITIONAL: {
    label: "Conditional",
    icon: <MinusCircle className="h-3.5 w-3.5" />,
    classes: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    scoreBg: "text-yellow-600 dark:text-yellow-400",
  },
};

const PERSONA_COLORS = [
  "border-l-blue-400",
  "border-l-green-400",
  "border-l-orange-400",
  "border-l-purple-400",
];

interface Props {
  result: PersonaResult;
  index: number;
  delay?: number;
}

export function PersonaCard({ result, index, delay = 0 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const cfg = VERDICT_CONFIG[result.verdict];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={cn(
        "rounded-xl border border-border border-l-4 bg-card overflow-hidden",
        PERSONA_COLORS[index % 4]
      )}
    >
      {/* Top row */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{result.name}</p>
            <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border", cfg.classes)}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.insight}</p>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <span className={cn("text-2xl font-bold tabular-nums", cfg.scoreBg)}>{result.score}</span>
          <span className="text-xs text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Steelman (always visible) */}
      <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-500/5">
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Biggest risk</p>
        <p className="text-xs text-foreground/80 leading-relaxed">{result.steelman_against}</p>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <span>{expanded ? "Hide details" : "Show objection & recommendation"}</span>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 pt-2 space-y-3">
          <DetailRow label="Objection / Endorsement" value={result.objection} />
          <DetailRow label="Recommendation" value={result.recommendation} muted />
        </div>
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xs leading-relaxed", muted ? "text-muted-foreground" : "text-foreground/80")}>{value}</p>
    </div>
  );
}
