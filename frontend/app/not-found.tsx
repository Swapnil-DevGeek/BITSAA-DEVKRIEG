import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <Sparkles className="h-8 w-8 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Result not found</h1>
      <p className="text-muted-foreground text-sm max-w-xs">
        This simulation result doesn't exist or may have expired.
      </p>
      <Link
        href="/"
        className="mt-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
      >
        Start a new simulation
      </Link>
    </div>
  );
}
