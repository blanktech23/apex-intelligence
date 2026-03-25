"use client";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Clock, History } from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Version History                                                    */
/* ------------------------------------------------------------------ */

const versionHistory = [
  { version: 3, label: "AI layout iteration", timeAgo: "2 min ago", current: true },
  { version: 2, label: "Added island cabinets", timeAgo: "15 min ago", current: false },
  { version: 1, label: "Initial room setup", timeAgo: "1 hour ago", current: false },
];

/* ------------------------------------------------------------------ */
/*  Save State Cycle                                                   */
/* ------------------------------------------------------------------ */

type SaveState = "saving" | "just-now" | "2s" | "5s";

const saveLabels: Record<SaveState, string> = {
  saving: "Saving...",
  "just-now": "Saved just now",
  "2s": "Saved 2s ago",
  "5s": "Saved 5s ago",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AutosaveIndicator({ className }: { className?: string }) {
  const [saveState, setSaveState] = useState<SaveState>("2s");
  const [showHistory, setShowHistory] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cycle through save states
  useEffect(() => {
    const states: SaveState[] = ["saving", "just-now", "2s", "5s"];
    let idx = 2; // start at "2s"

    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setSaveState(states[idx]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    }
    if (showHistory) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showHistory]);

  const isSaving = saveState === "saving";

  return (
    <div className={`relative flex items-center gap-2 ${className ?? ""}`} ref={dropdownRef}>
      {/* Save indicator */}
      <div className="flex items-center gap-1.5">
        {isSaving ? (
          <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
        ) : (
          <span className="size-2 rounded-full bg-green-400" />
        )}
        <span className="text-[11px] text-muted-foreground font-medium">
          {saveLabels[saveState]}
        </span>
      </div>

      {/* Version history button */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
      >
        <History className="size-3" />
        <span className="hidden sm:inline">Version History</span>
        <ChevronDown className={`size-3 transition-transform ${showHistory ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {showHistory && (
        <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-lg border border-border bg-[var(--background)] shadow-lg">
          <div className="p-2 space-y-0.5">
            {versionHistory.map((v) => (
              <button
                key={v.version}
                onClick={() => {
                  toast.success(`Previewing version ${v.version}`);
                  setShowHistory(false);
                }}
                className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted/40 ${
                  v.current ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5">
                  {v.current ? (
                    <Check className="size-3 text-green-600 dark:text-green-400" />
                  ) : (
                    <Clock className="size-3" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">v{v.version}</span>
                    {v.current && (
                      <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-medium text-green-600 dark:text-green-400">
                        current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{v.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{v.timeAgo}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
