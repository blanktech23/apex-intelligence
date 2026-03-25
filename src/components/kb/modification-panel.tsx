"use client";

import { useState, useMemo } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { modifications, type Modification } from "@/data/kb/door-styles";
import { floorPlan, type Cabinet } from "@/data/kb/floor-plan-data";
import { catalogItems } from "@/data/kb/catalog-data";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ModificationPanelProps {
  selectedItemId: string | null;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getCabinetTypeForMods(cab: Cabinet): string {
  if (cab.type === "corner") return "corner";
  return cab.type;
}

function getModIdFromShorthand(shorthand: string): string | undefined {
  const map: Record<string, string> = {
    "soft-close": "mod-soft-close",
    "glass-insert": "mod-glass-insert",
    "mullion": "mod-mullion",
    "applied-molding": "mod-applied-molding",
    "roll-out-tray": "mod-roll-out-tray",
    "finished-end": "mod-finished-end",
  };
  return map[shorthand];
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ModificationPanel({
  selectedItemId,
  className,
}: ModificationPanelProps) {
  const cabinet = useMemo(() => {
    if (!selectedItemId) return null;
    return floorPlan.cabinets.find((c) => c.id === selectedItemId) ?? null;
  }, [selectedItemId]);

  const catalogItem = useMemo(() => {
    if (!cabinet) return null;
    return (
      catalogItems.find(
        (ci) =>
          ci.sku === cabinet.sku &&
          ci.manufacturer === cabinet.manufacturer
      ) ?? null
    );
  }, [cabinet]);

  const availableMods = useMemo(() => {
    if (!cabinet) return [];
    const cabType = getCabinetTypeForMods(cabinet);
    return modifications.filter((m) => m.applicableTo.includes(cabType));
  }, [cabinet]);

  // Pre-toggled modifications based on cabinet's existing mods
  const initialToggles = useMemo(() => {
    if (!cabinet) return {};
    const toggles: Record<string, boolean> = {};
    for (const mod of availableMods) {
      const isPreApplied = cabinet.modifications.some(
        (shorthand) => getModIdFromShorthand(shorthand) === mod.id
      );
      toggles[mod.id] = isPreApplied;
    }
    return toggles;
  }, [cabinet, availableMods]);

  const [toggles, setToggles] = useState<Record<string, boolean>>(initialToggles);

  // Reset toggles when cabinet changes
  const [lastCabinetId, setLastCabinetId] = useState<string | null>(null);
  if (cabinet && cabinet.id !== lastCabinetId) {
    setLastCabinetId(cabinet.id);
    const newToggles: Record<string, boolean> = {};
    for (const mod of availableMods) {
      const isPreApplied = cabinet.modifications.some(
        (shorthand) => getModIdFromShorthand(shorthand) === mod.id
      );
      newToggles[mod.id] = isPreApplied;
    }
    setToggles(newToggles);
  }

  const runningTotal = useMemo(() => {
    return availableMods.reduce((sum, mod) => {
      return sum + (toggles[mod.id] ? mod.priceAdder : 0);
    }, 0);
  }, [availableMods, toggles]);

  if (!cabinet) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="size-3.5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Modifications</h3>
        </div>
        <p className="text-xs text-muted-foreground/60 italic">
          Select a cabinet to modify
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Settings2 className="size-3.5 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Modifications</h3>
      </div>

      {/* Cabinet info */}
      <div className="glass rounded-lg p-2.5 mb-3">
        <p className="text-xs font-medium text-foreground">{cabinet.name}</p>
        <p className="text-[10px] font-mono text-muted-foreground/60">
          {cabinet.sku} &middot; {cabinet.manufacturer}
        </p>
      </div>

      {/* Modification list */}
      <div className="space-y-2">
        {availableMods.map((mod) => (
          <ModRow
            key={mod.id}
            mod={mod}
            enabled={!!toggles[mod.id]}
            onToggle={() =>
              setToggles((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
            }
          />
        ))}
      </div>

      {/* Running total */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs font-medium text-muted-foreground">
          Modifications
        </span>
        <span className="text-sm font-semibold text-green-600 dark:text-green-400 font-mono">
          +${runningTotal.toLocaleString()}
        </span>
      </div>

      {/* Apply button */}
      <Button
        className="w-full mt-3 gap-2 text-xs font-semibold"
        onClick={() => {
          const count = Object.values(toggles).filter(Boolean).length;
          toast.success(
            `${count} modification${count !== 1 ? "s" : ""} applied to ${cabinet.name}`
          );
        }}
      >
        Apply
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modification Row                                                    */
/* ------------------------------------------------------------------ */

function ModRow({
  mod,
  enabled,
  onToggle,
}: {
  mod: Modification;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left flex items-start gap-2.5 rounded-lg border p-2.5 transition-all ${
        enabled
          ? "border-primary/40 bg-primary/5"
          : "border-border/50 bg-muted/20 hover:bg-muted/40"
      }`}
    >
      {/* Toggle indicator */}
      <div
        className={`mt-0.5 size-4 shrink-0 rounded-sm border-2 flex items-center justify-center transition-all ${
          enabled
            ? "border-primary bg-primary"
            : "border-muted-foreground/30 bg-transparent"
        }`}
      >
        {enabled && (
          <svg viewBox="0 0 12 12" className="size-2.5 text-primary-foreground">
            <path
              d="M10 3L4.5 8.5L2 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-foreground truncate">
            {mod.name}
          </span>
          <span className="text-xs font-mono font-medium text-green-600 dark:text-green-400 shrink-0">
            +${mod.priceAdder}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed mt-0.5">
          {mod.description}
        </p>
        <span className="text-[10px] text-muted-foreground/50">{mod.unit}</span>
      </div>
    </button>
  );
}
