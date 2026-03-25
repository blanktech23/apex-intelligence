"use client";

import type { VisibilityFilter } from "./enhanced-floor-plan";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ViewFilterTabsProps {
  activeFilter: VisibilityFilter;
  onFilterChange: (filter: VisibilityFilter) => void;
}

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

const TABS: { key: VisibilityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "cabinets", label: "Cabinets" },
  { key: "wallCabs", label: "Wall Cabs" },
  { key: "countertops", label: "Countertops" },
  { key: "appliances", label: "Appliances" },
  { key: "nkba", label: "NKBA" },
  { key: "legend", label: "Legend" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ViewFilterTabs({ activeFilter, onFilterChange }: ViewFilterTabsProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-t border-border bg-muted/20 px-2 py-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-medium transition-all ${
            activeFilter === tab.key
              ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
