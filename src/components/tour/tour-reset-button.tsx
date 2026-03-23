"use client";

import { RotateCcw } from "lucide-react";
import { useTour } from "./use-tour";
import { toast } from "sonner";

export function TourResetButton() {
  const { resetAllTours } = useTour();

  return (
    <button
      onClick={() => {
        resetAllTours();
        toast.success("Tours reset — refresh to re-experience them.");
      }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      <span>Reset Tours</span>
    </button>
  );
}
