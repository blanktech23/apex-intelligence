"use client";

import { useState, useMemo } from "react";
import { DollarSign } from "lucide-react";
import { floorPlan } from "@/data/kb/floor-plan-data";
import { catalogItems } from "@/data/kb/catalog-data";
import {
  multiplierTiers,
  markupPresets,
  deliveryZones,
  defaultTaxRate,
} from "@/data/kb/pricing-data";

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface PricingPanelProps {
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function PricingPanel({ className }: PricingPanelProps) {
  const [tierKey, setTierKey] = useState<"standard" | "volume" | "promotional">(
    "standard"
  );
  const [markupIdx, setMarkupIdx] = useState(1); // Standard 30%
  const [zoneIdx, setZoneIdx] = useState(0); // Zone 1

  const manufacturer = "Fabuwood"; // all floor plan items are Fabuwood
  const tier = multiplierTiers.find((t) => t.manufacturer === manufacturer)!;
  const multiplier = tier[tierKey];
  const markup = markupPresets[markupIdx];
  const zone = deliveryZones[zoneIdx];
  const cabinetCount = floorPlan.cabinets.length;

  // Calculate list price total from catalog by matching SKUs
  const listPriceTotal = useMemo(() => {
    let total = 0;
    for (const cab of floorPlan.cabinets) {
      const catalogItem = catalogItems.find(
        (ci) => ci.sku === cab.sku && ci.manufacturer === cab.manufacturer
      );
      if (catalogItem) {
        total += catalogItem.listPrice;
      }
    }
    return total;
  }, []);

  const netCost = Math.round(listPriceTotal * multiplier * 100) / 100;
  const clientPrice =
    Math.round(netCost * (1 + markup.percent / 100) * 100) / 100;
  const deliveryCost = Math.max(
    zone.perCabinetFee * cabinetCount,
    zone.minFee
  );
  const taxAmount = Math.round(clientPrice * defaultTaxRate * 100) / 100;
  const grandTotal =
    Math.round((clientPrice + deliveryCost + taxAmount) * 100) / 100;
  const profitAmount = Math.round((clientPrice - netCost) * 100) / 100;
  const profitPercent =
    clientPrice > 0
      ? Math.round(((clientPrice - netCost) / clientPrice) * 10000) / 100
      : 0;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="size-3.5 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Pricing</h3>
      </div>

      <div className="space-y-2.5">
        {/* List Price */}
        <PriceLine label="List Price Total" value={fmt(listPriceTotal)} />

        {/* Multiplier Tier */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Multiplier Tier</span>
          <select
            value={tierKey}
            onChange={(e) =>
              setTierKey(
                e.target.value as "standard" | "volume" | "promotional"
              )
            }
            className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="standard">Standard ({tier.standard})</option>
            <option value="volume">Volume ({tier.volume})</option>
            <option value="promotional">Promotional ({tier.promotional})</option>
          </select>
        </div>

        {/* Net Cost */}
        <PriceLine label="Net Cost" value={fmt(netCost)} muted />

        {/* Markup */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Markup %</span>
          <select
            value={markupIdx}
            onChange={(e) => setMarkupIdx(Number(e.target.value))}
            className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {markupPresets.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label} ({p.percent}%)
              </option>
            ))}
          </select>
        </div>

        {/* Client Price */}
        <PriceLine label="Client Price" value={fmt(clientPrice)} bold />

        <div className="h-px bg-border" />

        {/* Delivery Zone */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Delivery Zone</span>
          <select
            value={zoneIdx}
            onChange={(e) => setZoneIdx(Number(e.target.value))}
            className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {deliveryZones.map((dz, i) => (
              <option key={dz.zone} value={i}>
                Zone {dz.zone} - {dz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Delivery Cost */}
        <PriceLine label="Delivery" value={fmt(deliveryCost)} />

        {/* Tax */}
        <PriceLine
          label={`Tax (${(defaultTaxRate * 100).toFixed(0)}%)`}
          value={fmt(taxAmount)}
        />

        <div className="h-px bg-border" />

        {/* Grand Total */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Grand Total
          </span>
          <span className="text-sm font-bold text-foreground font-mono">
            {fmt(grandTotal)}
          </span>
        </div>

        {/* Profit margin */}
        <div className="glass rounded-lg p-2.5 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
              Margin
            </span>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 font-mono">
              {fmt(profitAmount)} ({profitPercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                             */
/* ------------------------------------------------------------------ */

function fmt(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function PriceLine({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-mono ${
          bold
            ? "font-semibold text-foreground"
            : muted
              ? "text-muted-foreground"
              : "font-medium text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
