import type { BoardroomResult } from "@/lib/types";
import { PersonaCard } from "@/components/boardroom/PersonaCard";
import { ConvictionScore } from "@/components/boardroom/ConvictionScore";
import { ActionItem } from "@/components/boardroom/ActionItem";

export function BoardroomResultView({ result }: { result: BoardroomResult }) {
  return (
    <div className="space-y-4">
      <ConvictionScore result={result} />
      <ActionItem actionItem={result.actionItem} />
      <div className="space-y-3 pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Panel Feedback
        </p>
        {result.personas.map((persona, i) => (
          <PersonaCard key={i} result={persona} index={i} delay={0} />
        ))}
      </div>
    </div>
  );
}
