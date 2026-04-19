"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-md bg-muted animate-pulse", className)} />
  );
}

export function BoardroomSkeleton() {
  return (
    <div className="space-y-4">
      {/* Conviction score skeleton */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-10 w-20" />
        <Shimmer className="h-2 w-full" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-3 flex-1" />)}
        </div>
      </div>

      {/* Action item skeleton */}
      <div className="rounded-xl border border-border p-5 space-y-2">
        <Shimmer className="h-4 w-48" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-3/4" />
      </div>

      {/* Loading message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-6 space-y-1"
      >
        <p className="text-sm font-medium">Consulting the board…</p>
        <p className="text-xs text-muted-foreground">4 experts are reviewing your idea simultaneously</p>
        <div className="flex justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Persona card skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border border-l-4 border-l-muted p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-2/3" />
            </div>
            <Shimmer className="h-8 w-12 ml-4" />
          </div>
          <div className="rounded-lg border p-2.5 space-y-1.5">
            <Shimmer className="h-3 w-20" />
            <Shimmer className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
