"use client";

import { useState } from "react";
import { Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { finishes, doorStyles, type Finish } from "@/data/kb/door-styles";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface FinishZonePanelProps {
  className?: string;
}

interface Zone {
  id: string;
  label: string;
  dotColor: string;
  defaultFinishId: string;
}

const zones: Zone[] = [
  { id: "perimeter", label: "Perimeter", dotColor: "bg-blue-500", defaultFinishId: "fin-frost" },
  { id: "island", label: "Island", dotColor: "bg-green-500", defaultFinishId: "fin-timber" },
  { id: "accent", label: "Accent", dotColor: "bg-amber-500", defaultFinishId: "fin-navy" },
  { id: "pantry", label: "Pantry", dotColor: "bg-violet-500", defaultFinishId: "fin-frost" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function FinishZonePanel({ className }: FinishZonePanelProps) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const zone of zones) {
      initial[zone.id] = zone.defaultFinishId;
    }
    return initial;
  });

  const currentDoorStyle = doorStyles.find((ds) => ds.id === "ds-shaker");

  const handleChange = (zoneId: string, finishId: string) => {
    setSelections((prev) => ({ ...prev, [zoneId]: finishId }));
  };

  const getFinishById = (id: string): Finish | undefined => {
    return finishes.find((f) => f.id === id);
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Paintbrush className="size-3.5 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Finish Zones</h3>
      </div>

      {/* Current door style */}
      {currentDoorStyle && (
        <div className="glass rounded-lg p-2.5 mb-3">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            Current Door Style
          </span>
          <p className="text-xs font-medium text-foreground mt-0.5">
            {currentDoorStyle.name} &middot; {currentDoorStyle.construction}
          </p>
        </div>
      )}

      {/* Zone selections */}
      <div className="space-y-3">
        {zones.map((zone) => {
          const selectedFinish = getFinishById(selections[zone.id]);
          return (
            <div key={zone.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`size-2.5 rounded-full ${zone.dotColor}`} />
                <label className="text-xs font-medium text-foreground">
                  {zone.label}
                </label>
              </div>
              <div className="flex items-center gap-2">
                {/* Color preview */}
                {selectedFinish && (
                  <div
                    className="size-6 rounded-md border border-border shrink-0"
                    style={{ backgroundColor: selectedFinish.hex }}
                  />
                )}
                <select
                  value={selections[zone.id]}
                  onChange={(e) => handleChange(zone.id, e.target.value)}
                  className="flex-1 rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <optgroup label="Paints">
                    {finishes
                      .filter((f) => f.category === "paint")
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Stains">
                    {finishes
                      .filter((f) => f.category === "stain")
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Glazes">
                    {finishes
                      .filter((f) => f.category === "glaze")
                      .map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Apply button */}
      <Button
        className="w-full mt-4 gap-2 text-xs font-semibold"
        onClick={() => {
          const zoneNames = zones
            .map((z) => {
              const finish = getFinishById(selections[z.id]);
              return `${z.label}: ${finish?.name ?? "None"}`;
            })
            .join(", ");
          toast.success(`Finishes applied — ${zoneNames}`);
        }}
      >
        <Paintbrush className="size-3.5" />
        Apply Finishes
      </Button>
    </div>
  );
}
