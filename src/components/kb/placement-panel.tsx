"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Move, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PlacementPanelProps {
  selectedItemName: string;
  selectedItemSku: string;
  posX: number;
  posY: number;
  length?: number;
  angle?: number;
  onMove?: (direction: "up" | "down" | "left" | "right", offset: number) => void;
  onAdd?: (direction: "up" | "down" | "left" | "right", offset: number) => void;
  onCopy?: (direction: "up" | "down" | "left" | "right", offset: number) => void;
}

type PlacementMode = "add" | "move" | "copy";
type PlacementTab = "place" | "coords";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlacementPanel({
  selectedItemName,
  selectedItemSku,
  posX,
  posY,
  length = 36,
  angle = 0,
  onMove,
  onAdd,
  onCopy,
}: PlacementPanelProps) {
  const [mode, setMode] = useState<PlacementMode>("move");
  const [offset, setOffset] = useState("1");
  const [activeTab, setActiveTab] = useState<PlacementTab>("place");

  const offsetVal = parseFloat(offset) || 1;

  const handleDirection = (dir: "up" | "down" | "left" | "right") => {
    if (mode === "add") {
      onAdd?.(dir, offsetVal);
      toast.success(`Added new item ${dir} at ${offsetVal}" offset`);
    } else if (mode === "move") {
      onMove?.(dir, offsetVal);
      toast.success(`Moved ${dir} by ${offsetVal}"`);
    } else {
      onCopy?.(dir, offsetVal);
      toast.success(`Copied ${dir} at ${offsetVal}" offset`);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
        Placement
      </h4>

      {/* Circular wheel */}
      <div className="flex flex-col items-center">
        <div className="relative" style={{ width: 120, height: 120 }}>
          {/* Circle border */}
          <div
            className="absolute inset-0 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50"
          />

          {/* Center SKU label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">
              {selectedItemSku}
            </span>
          </div>

          {/* North arrow */}
          <button
            onClick={() => handleDirection("up")}
            className="absolute left-1/2 -translate-x-1/2 -top-3 size-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-colors"
            title="Move Up"
          >
            <ArrowUp className="size-3.5 text-slate-700 dark:text-slate-300" />
          </button>

          {/* South arrow */}
          <button
            onClick={() => handleDirection("down")}
            className="absolute left-1/2 -translate-x-1/2 -bottom-3 size-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-colors"
            title="Move Down"
          >
            <ArrowDown className="size-3.5 text-slate-700 dark:text-slate-300" />
          </button>

          {/* West arrow */}
          <button
            onClick={() => handleDirection("left")}
            className="absolute top-1/2 -translate-y-1/2 -left-3 size-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-colors"
            title="Move Left"
          >
            <ArrowLeft className="size-3.5 text-slate-700 dark:text-slate-300" />
          </button>

          {/* East arrow */}
          <button
            onClick={() => handleDirection("right")}
            className="absolute top-1/2 -translate-y-1/2 -right-3 size-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 transition-colors"
            title="Move Right"
          >
            <ArrowRight className="size-3.5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>

      {/* Offset input */}
      <div className="flex items-center gap-2">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60 shrink-0">
          Offset
        </label>
        <Input
          type="number"
          value={offset}
          onChange={(e) => setOffset(e.target.value)}
          className="h-7 w-20 text-xs font-mono"
          min={0}
          step={0.25}
        />
        <span className="text-[10px] text-muted-foreground">inches</span>
      </div>

      {/* Mode toggle: Add / Move / Copy */}
      <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-muted/20">
        {([
          { key: "add" as const, icon: Plus, label: "Add" },
          { key: "move" as const, icon: Move, label: "Move" },
          { key: "copy" as const, icon: Copy, label: "Copy" },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-all ${
              mode === key
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Place / Coords tabs */}
      <div className="flex items-center rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => setActiveTab("place")}
          className={`flex-1 px-3 py-1.5 text-[10px] font-medium transition-all ${
            activeTab === "place"
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground bg-muted/10"
          }`}
        >
          Place
        </button>
        <div className="w-px h-6 bg-border" />
        <button
          onClick={() => setActiveTab("coords")}
          className={`flex-1 px-3 py-1.5 text-[10px] font-medium transition-all ${
            activeTab === "coords"
              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              : "text-muted-foreground hover:text-foreground bg-muted/10"
          }`}
        >
          Coords
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "place" ? (
        <div className="glass rounded-lg p-2.5">
          <p className="text-xs font-medium text-foreground truncate">
            {selectedItemSku} &mdash; {selectedItemName}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Use arrows to place relative to selection
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "X", value: `${Math.round(posX)}"` },
            { label: "Y", value: `${Math.round(posY)}"` },
            { label: "Length", value: `${length}"` },
            { label: "Angle", value: `${angle}°` },
          ].map((field) => (
            <div key={field.label} className="rounded-lg border border-border bg-muted/10 px-2.5 py-1.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">
                {field.label}
              </span>
              <p className="text-xs font-mono font-medium text-foreground">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
