"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Persona, SimulationMode } from "@/lib/types";

export const DEFAULT_PERSONAS: Persona[] = [
  { name: "Skeptical VC", description: "Series A investor laser-focused on unit economics and market size" },
  { name: "Target User", description: "The exact person this product is built for — has the problem right now" },
  { name: "Failed Founder", description: "Someone who tried building this exact idea and shut it down" },
  { name: "Market Analyst", description: "Expert in this specific market vertical who tracks competitors daily" },
];

export const SUBREDDIT_OPTIONS = [
  { value: "r/SaaS", label: "r/SaaS", description: "B2B software builders & buyers" },
  { value: "r/startups", label: "r/startups", description: "Founders & early-stage builders" },
  { value: "r/Entrepreneur", label: "r/Entrepreneur", description: "General entrepreneurship community" },
  { value: "r/DevOps", label: "r/DevOps", description: "Technical infrastructure practitioners" },
  { value: "r/GenZ", label: "r/GenZ", description: "18-26 year old consumer audience" },
];

interface IdeaStore {
  // Form inputs
  idea: string;
  targetUser: string;
  // Selected mode
  mode: SimulationMode | null;
  // Mode-specific config
  personas: Persona[];
  subreddit: string;
  // Actions
  setIdea: (idea: string) => void;
  setTargetUser: (targetUser: string) => void;
  setMode: (mode: SimulationMode) => void;
  setPersonas: (personas: Persona[]) => void;
  setSubreddit: (subreddit: string) => void;
  reset: () => void;
}

const initialState = {
  idea: "",
  targetUser: "",
  mode: null as SimulationMode | null,
  personas: DEFAULT_PERSONAS,
  subreddit: "r/SaaS",
};

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set) => ({
      ...initialState,
      setIdea: (idea) => set({ idea }),
      setTargetUser: (targetUser) => set({ targetUser }),
      setMode: (mode) => set({ mode }),
      setPersonas: (personas) => set({ personas }),
      setSubreddit: (subreddit) => set({ subreddit }),
      reset: () => set(initialState),
    }),
    {
      name: "oasis-idea-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
