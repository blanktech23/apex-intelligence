"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

type ConnectionState = "connected" | "reconnecting" | "offline";

const stateConfig: Record<
  ConnectionState,
  { label: string; dotClass: string }
> = {
  connected: {
    label: "Connected",
    dotClass: "bg-emerald-400",
  },
  reconnecting: {
    label: "Reconnecting...",
    dotClass: "bg-amber-400 animate-pulse",
  },
  offline: {
    label: "Offline",
    dotClass: "bg-gray-500",
  },
};

const stateOrder: ConnectionState[] = ["connected", "reconnecting", "offline"];

export function ConnectionStatus() {
  const [state, setState] = useState<ConnectionState>("connected");

  const cycle = () => {
    const idx = stateOrder.indexOf(state);
    setState(stateOrder[(idx + 1) % stateOrder.length]);
  };

  const { label, dotClass } = stateConfig[state];

  return (
    <div className="fixed bottom-[5.5rem] right-5 z-50 hidden lg:block">
      <button
        onClick={cycle}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-[var(--background)] px-3 py-1.5 text-xs text-muted-foreground shadow-md transition-all duration-200 hover:border-primary/30 hover:text-foreground",
        )}
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", dotClass)} />
        <span>{label}</span>
        {state === "offline" && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setState("connected");
            }}
            className="ml-1 flex items-center gap-1 text-primary hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </span>
        )}
      </button>
    </div>
  );
}
