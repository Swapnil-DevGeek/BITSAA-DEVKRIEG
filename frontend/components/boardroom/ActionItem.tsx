"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface Props {
  actionItem: string;
}

export function ActionItem({ actionItem }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
      className="rounded-xl border border-foreground/20 bg-foreground/[0.03] p-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-foreground" />
        <p className="text-xs font-semibold uppercase tracking-wider">#1 Thing To Fix Before You Build</p>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{actionItem}</p>
    </motion.div>
  );
}
