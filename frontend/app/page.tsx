"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, ArrowRight, Sparkles, FlaskConical } from "lucide-react";
import { useIdeaStore } from "@/lib/store";
import { PersonaConfigModal } from "@/components/boardroom/PersonaConfigModal";
import { SubredditPickerModal } from "@/components/market/SubredditPickerModal";
import { MOCK_IDEA, MOCK_TARGET_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const IDEA_MAX = 300;
const USER_MAX = 150;

export default function LaunchpadPage() {
  const router = useRouter();
  const { idea, targetUser, setIdea, setTargetUser, setMode } = useIdeaStore();

  const [boardroomOpen, setBoardroomOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  function fillDemo() {
    setIdea(MOCK_IDEA);
    setTargetUser(MOCK_TARGET_USER);
  }

  const isFormValid = idea.trim().length >= 10 && targetUser.trim().length >= 5;

  function handleModeClick(mode: "boardroom" | "market") {
    if (!isFormValid) return;
    setMode(mode);
    if (mode === "boardroom") setBoardroomOpen(true);
    else setMarketOpen(true);
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-6 py-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-foreground" />
          <span className="font-semibold tracking-tight text-sm">OASIS Engine</span>
        </header>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-2xl space-y-10"
          >
            {/* Title */}
            <div className="space-y-3 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                Will your idea survive
                <br />
                <span className="text-muted-foreground">contact with reality?</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Pitch to an AI expert panel or drop it into a live market simulation — brutal honest feedback in under 3 minutes.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={fillDemo}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 border border-dashed border-border rounded-md px-2.5 py-1"
                >
                  <FlaskConical className="h-3 w-3" />
                  Fill with demo idea
                </button>
              </div>
              <FormField
                label="Your idea"
                placeholder="Describe your idea in 2–3 sentences. What does it do and why is it different?"
                value={idea}
                onChange={setIdea}
                maxLength={IDEA_MAX}
                rows={4}
              />
              <FormField
                label="Target user"
                placeholder="Who exactly is this for? Be precise — 'busy B2B sales managers at 10-50 person startups', not just 'sales teams'."
                value={targetUser}
                onChange={setTargetUser}
                maxLength={USER_MAX}
                rows={2}
              />
            </div>

            {/* Mode selector */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-center">
                Choose your simulation
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModeCard
                  icon={<Users className="h-5 w-5" />}
                  title="The Boardroom"
                  subtitle="Structured Expert Feedback"
                  description="4 AI personas — VC, target user, failed founder, market analyst — each give a scored verdict and their biggest objection."
                  badge="~15 sec"
                  disabled={!isFormValid}
                  onClick={() => handleModeClick("boardroom")}
                />
                <ModeCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="The Market"
                  subtitle="Live Reddit Simulation"
                  description="Drop your idea into a live subreddit. Watch AI agents argue, upvote, and reply in real-time across 2 simulation turns."
                  badge="~60 sec"
                  disabled={!isFormValid}
                  onClick={() => handleModeClick("market")}
                  accent
                />
              </div>

              <AnimatePresence>
                {!isFormValid && (idea.length > 0 || targetUser.length > 0) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-muted-foreground text-center pt-1"
                  >
                    Fill in both fields to unlock the simulations
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>
      </div>

      <PersonaConfigModal
        open={boardroomOpen}
        onOpenChange={setBoardroomOpen}
        onConfirm={() => { setBoardroomOpen(false); router.push("/boardroom"); }}
      />
      <SubredditPickerModal
        open={marketOpen}
        onOpenChange={setMarketOpen}
        onConfirm={() => { setMarketOpen(false); router.push("/market"); }}
      />
    </>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({
  label, placeholder, value, onChange, maxLength, rows,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; maxLength: number; rows: number;
}) {
  const remaining = maxLength - value.length;
  const nearLimit = remaining <= 40;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full resize-none rounded-lg border border-input bg-transparent px-3.5 py-2.5",
          "text-sm placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "transition-colors duration-150"
        )}
      />
      <div className="flex justify-end">
        <span className={cn("text-xs tabular-nums", nearLimit ? "text-destructive" : "text-muted-foreground")}>
          {remaining}
        </span>
      </div>
    </div>
  );
}

// ── ModeCard ──────────────────────────────────────────────────────────────────

function ModeCard({
  icon, title, subtitle, description, badge, disabled, onClick, accent = false,
}: {
  icon: React.ReactNode; title: string; subtitle: string; description: string;
  badge: string; disabled: boolean; onClick: () => void; accent?: boolean;
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.015 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border p-5 text-left w-full",
        "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled
          ? "cursor-not-allowed opacity-40"
          : accent
          ? "border-primary/20 bg-primary/[0.03] hover:border-primary/50 hover:bg-primary/[0.06] cursor-pointer"
          : "border-border hover:border-foreground/20 hover:bg-muted/40 cursor-pointer"
      )}
    >
      <span className="absolute top-4 right-4 text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
        {badge}
      </span>

      <div className={cn("p-2 rounded-md w-fit", accent ? "bg-primary/10 text-primary" : "bg-muted text-foreground")}>
        {icon}
      </div>

      <div className="space-y-1 pr-14">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{description}</p>
      </div>

      {!disabled && (
        <div className="flex items-center gap-1 text-xs font-medium text-foreground/60">
          <span>Configure & start</span>
          <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </motion.button>
  );
}
