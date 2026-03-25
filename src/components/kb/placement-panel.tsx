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
  onMove?: (direction: "up" | "down" | "left" | "right", offset: number) => void;
  onAdd?: (direction: "up" | "down" | "left" | "right", offset: number) => void;
  onCopy?: (direction: "up" | "down" | "left" | "right", offset: number) => void;
}

type PlacementMode = "add" | "move" | "copy";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PlacementPanel({
  selectedItemName,
  selectedItemSku,
  posX,
  posY,
  onMove,
  onAdd,
  onCopy,
}: PlacementPanelProps) {
  const [mode, setMode] = useState<PlacementMode>("move");
  const [offset, setOffset] = useState("1");

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

      {/* Selected item */}
      <div className="glass rounded-lg p-2.5">
        <p className="text-xs font-medium text-foreground truncate">
          {selectedItemSku} &mdash; {selectedItemName}
        </p>
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

      {/* Directional arrows */}
      <div className="flex flex-col items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => handleDirection("up")}
          title="Up"
        >
          <ArrowUp className="size-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handleDirection("left")}
            title="Left"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="size-8 flex items-center justify-center rounded-md border border-border bg-muted/30">
            <span className="text-[9px] font-mono text-muted-foreground">{offsetVal}&quot;</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handleDirection("right")}
            title="Right"
          >
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => handleDirection("down")}
          title="Down"
        >
          <ArrowDown className="size-4" />
        </Button>
      </div>

      {/* Mode toggle */}
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
                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Coords display */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/10 px-3 py-2">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">X</span>
          <p className="text-xs font-mono font-medium text-foreground">{Math.round(posX)}&quot;</p>
        </div>
        <div className="h-6 w-px bg-border" />
        <div>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60">Y</span>
          <p className="text-xs font-mono font-medium text-foreground">{Math.round(posY)}&quot;</p>
        </div>
      </div>
    </div>
  );
}
