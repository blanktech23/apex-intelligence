"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Mock Collaborators                                                 */
/* ------------------------------------------------------------------ */

const collaborators = [
  { initials: "SJ", name: "Sarah Johnson", status: "viewing", color: "ring-emerald-400 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { initials: "MK", name: "Mike Kim", status: "editing", color: "ring-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-300" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CollaborationIndicator({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={`flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/40 transition-colors ${className ?? ""}`}
        >
          {/* Avatar stack */}
          <div className="flex -space-x-1.5">
            {collaborators.map((c) => (
              <div
                key={c.initials}
                className={`flex size-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ${c.color}`}
              >
                {c.initials}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground font-medium">
            {collaborators.length} viewing
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          <div className="space-y-1 text-xs">
            {collaborators.map((c) => (
              <div key={c.initials} className="flex items-center gap-2">
                <span
                  className={`size-1.5 rounded-full ${
                    c.status === "editing" ? "bg-amber-400" : "bg-green-400"
                  }`}
                />
                <span>
                  {c.name} ({c.status})
                </span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
