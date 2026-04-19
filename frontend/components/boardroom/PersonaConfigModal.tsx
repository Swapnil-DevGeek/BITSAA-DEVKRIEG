"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil } from "lucide-react";
import { useIdeaStore, DEFAULT_PERSONAS } from "@/lib/store";
import type { Persona } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PersonaConfigModal({ open, onOpenChange, onConfirm }: Props) {
  const { personas, setPersonas } = useIdeaStore();
  const [editing, setEditing] = useState<number | null>(null);

  function updatePersona(index: number, field: keyof Persona, value: string) {
    const next = personas.map((p, i) => (i === index ? { ...p, [field]: value } : p));
    setPersonas(next);
  }

  function resetToDefaults() {
    setPersonas(DEFAULT_PERSONAS);
    setEditing(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div>
                  <h2 className="font-semibold text-base">Configure the Board</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Rename personas to match your idea's specific audience
                  </p>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Persona list */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                {personas.map((persona, i) => (
                  <PersonaSlot
                    key={i}
                    index={i}
                    persona={persona}
                    isEditing={editing === i}
                    onEdit={() => setEditing(editing === i ? null : i)}
                    onUpdate={(field, value) => updatePersona(i, field, value)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-border flex items-center gap-3 shrink-0">
                <button
                  onClick={resetToDefaults}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reset to defaults
                </button>
                <div className="flex-1" />
                <button
                  onClick={onConfirm}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-medium transition-colors",
                    "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  Run The Boardroom →
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── PersonaSlot ───────────────────────────────────────────────────────────────

function PersonaSlot({
  index, persona, isEditing, onEdit, onUpdate,
}: {
  index: number;
  persona: Persona;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (field: keyof Persona, value: string) => void;
}) {
  const colors = [
    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    "bg-green-500/10 text-green-600 dark:text-green-400",
    "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  ];

  return (
    <div className={cn("rounded-lg border border-border p-3.5 transition-colors", isEditing && "border-ring/50 bg-muted/30")}>
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div className={cn("mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", colors[index])}>
          {index + 1}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input
                autoFocus
                value={persona.name}
                onChange={(e) => onUpdate("name", e.target.value)}
                placeholder="Persona name"
                className="w-full text-sm font-medium bg-transparent border-b border-input focus:outline-none focus:border-ring pb-1"
              />
              <textarea
                rows={2}
                value={persona.description}
                onChange={(e) => onUpdate("description", e.target.value)}
                placeholder="Brief description of this persona's perspective"
                className="w-full text-xs text-muted-foreground bg-transparent border border-input rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium leading-tight">{persona.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{persona.description}</p>
            </>
          )}
        </div>

        <button
          onClick={onEdit}
          className={cn(
            "flex-shrink-0 p-1.5 rounded-md transition-colors",
            isEditing ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
