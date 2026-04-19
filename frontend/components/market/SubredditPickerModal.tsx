"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { useIdeaStore, SUBREDDIT_OPTIONS } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SubredditPickerModal({ open, onOpenChange, onConfirm }: Props) {
  const { subreddit, setSubreddit } = useIdeaStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h2 className="font-semibold text-base">Pick a Subreddit</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose the audience demographic for the simulation
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Options */}
              <div className="p-4 space-y-2">
                {SUBREDDIT_OPTIONS.map((option) => {
                  const selected = subreddit === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSubreddit(option.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors",
                        selected
                          ? "border-foreground/40 bg-foreground/5"
                          : "border-border hover:border-foreground/20 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        selected ? "border-foreground bg-foreground" : "border-muted-foreground"
                      )}>
                        {selected && <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <button
                  onClick={onConfirm}
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  Start Simulation →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
