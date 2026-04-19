"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import type { MarketComment, MarketReply } from "@/lib/types";
import { cn } from "@/lib/utils";

function AgentAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.slice(0, 2).toUpperCase();
  const hue = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        size === "md" ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]"
      )}
      style={{ background: `hsl(${hue}, 60%, 45%)` }}
    >
      {initials}
    </div>
  );
}

function VoteCounter({ upvotes }: { upvotes: number }) {
  return (
    <motion.div
      key={upvotes}
      initial={{ scale: 1.3, color: "var(--color-primary)" }}
      animate={{ scale: 1, color: "var(--color-muted-foreground)" }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-1 text-xs text-muted-foreground"
    >
      <ArrowUp className="h-3 w-3" />
      <span className="tabular-nums font-medium">{upvotes}</span>
    </motion.div>
  );
}

function ReplyCard({ reply }: { reply: MarketReply }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex gap-2 mt-2"
    >
      <div className="w-px bg-border mx-1 shrink-0" />
      <AgentAvatar name={reply.agent} size="sm" />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{reply.agent}</span>
          <VoteCounter upvotes={reply.upvotes} />
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">{reply.comment}</p>
      </div>
    </motion.div>
  );
}

interface Props {
  comment: MarketComment;
}

export function CommentThread({ comment }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="px-4 py-3 border-b border-border last:border-0"
    >
      <div className="flex gap-3">
        <AgentAvatar name={comment.agent} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{comment.agent}</span>
            <VoteCounter upvotes={comment.upvotes} />
            <span className="text-xs text-muted-foreground/50">Turn {comment.turn}</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{comment.comment}</p>

          {/* Replies */}
          <AnimatePresence>
            {comment.replies?.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
