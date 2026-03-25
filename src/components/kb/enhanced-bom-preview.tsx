"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  FileSpreadsheet,
  Send,
  ChevronDown,
  Wrench,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { floorPlan } from "@/data/kb/floor-plan-data";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BomLineItem {
  id: string;
  sku: string;
  name: string;
  qty: number;
  listPrice: number;
  total: number;
  leadTime: string;
  leadTimeColor: string;
  status: "confirmed" | "stale" | "discontinued";
  staleDays?: number;
  modifications?: { label: string; cost: number }[];
}

interface BomSection {
  title: string;
  items: BomLineItem[];
}

/* ------------------------------------------------------------------ */
/*  Mock BOM Data (~35 items)                                          */
/* ------------------------------------------------------------------ */

const cabinetItems: BomLineItem[] = floorPlan.cabinets.map((cab, i) => {
  const prices: Record<string, number> = {
    BBC36: 512, B18: 312, SB36: 398, B21: 348, DB15: 395,
    W3630: 335, W3030: 298, BBC42: 548, DB18: 428, B24: 385,
    WDC2430: 365, W1830: 225, T189624: 895, BLS33: 685,
    DB24: 465, B30: 425,
  };
  const skuBase = cab.sku.replace(/-LH|-RH/, "");
  const price = prices[skuBase] ?? 350;

  const modMap: Record<string, { label: string; cost: number }[]> = {
    "soft-close": [{ label: "Soft-Close Upgrade", cost: 45 }],
    "roll-out-tray": [{ label: "Roll-Out Tray x2", cost: 190 }],
    "glass-insert": [{ label: "Glass Door Insert", cost: 125 }],
    "finished-end": [{ label: "Finished End Panel", cost: 85 }],
  };

  const mods = cab.modifications.flatMap((m) => modMap[m] ?? []);
  const statuses: Array<"confirmed" | "stale"> = ["confirmed", "confirmed", "confirmed", "confirmed", "stale"];
  const status = i === 6 ? "stale" as const : statuses[i % statuses.length];

  return {
    id: cab.id,
    sku: cab.sku,
    name: `${cab.name} (${cab.width}")`,
    qty: 1,
    listPrice: price,
    total: price,
    leadTime: i < 10 ? "In Stock" : "2-3 Weeks",
    leadTimeColor: i < 10 ? "text-green-600 dark:text-green-400 bg-green-500/10" : "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    status,
    staleDays: status === "stale" ? 87 : undefined,
    modifications: mods.length > 0 ? mods : undefined,
  };
});

const countertopItems: BomLineItem[] = [
  { id: "ct-01", sku: "QTZ-CAL-PERIM", name: "Quartz Countertop - Calacatta (Perimeter)", qty: 1, listPrice: 4200, total: 4200, leadTime: "4-6 Weeks", leadTimeColor: "text-red-600 dark:text-red-400 bg-red-500/10", status: "confirmed" },
  { id: "ct-02", sku: "QTZ-CAL-ISL", name: "Quartz Countertop - Calacatta (Island)", qty: 1, listPrice: 2100, total: 2100, leadTime: "4-6 Weeks", leadTimeColor: "text-red-600 dark:text-red-400 bg-red-500/10", status: "confirmed" },
];

const applianceItems: BomLineItem[] = [
  { id: "app-b01", sku: "GE-PGB960", name: '30" Gas Range - GE Profile', qty: 1, listPrice: 2849, total: 2849, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "app-b02", sku: "LG-LRMVS3006S", name: '36" Refrigerator - LG', qty: 1, listPrice: 3299, total: 3299, leadTime: "2-3 Weeks", leadTimeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10", status: "confirmed" },
  { id: "app-b03", sku: "BOSCH-SHPM88Z75N", name: '24" Dishwasher - Bosch', qty: 1, listPrice: 1049, total: 1049, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "app-b04", sku: "WP-WMH53521HZ", name: '30" Over-Range Microwave Hood', qty: 1, listPrice: 549, total: 549, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "stale", staleDays: 62 },
];

const fixtureItems: BomLineItem[] = [
  { id: "fix-b01", sku: "BLANCO-442025", name: '33" Undermount Sink - Blanco', qty: 1, listPrice: 680, total: 680, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "fix-b02", sku: "DELTA-9159T-DST", name: "Pull-Down Faucet - Delta Trinsic", qty: 1, listPrice: 420, total: 420, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
];

const hardwareItems: BomLineItem[] = [
  { id: "hw-01", sku: "AMR-BP36800BBR", name: 'Cabinet Pull 5" - Amerock', qty: 24, listPrice: 8.75, total: 210, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "hw-02", sku: "AMR-BP36802BBR", name: "Cabinet Knob - Amerock", qty: 10, listPrice: 6.50, total: 65, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "hw-03", sku: "BLM-B071020-NP", name: "Soft-Close Hinge - Blum", qty: 48, listPrice: 4.25, total: 204, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
];

const trimItems: BomLineItem[] = [
  { id: "tr-01", sku: "FAB-TF396", name: "Crown Molding - Stacked", qty: 1, listPrice: 18.50, total: 370, leadTime: "2-3 Weeks", leadTimeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10", status: "confirmed" },
  { id: "tr-02", sku: "FAB-LR196", name: "Light Rail Molding", qty: 1, listPrice: 8.75, total: 140, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "tr-03", sku: "FAB-SM396", name: "Scribe Molding", qty: 1, listPrice: 6.25, total: 50, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
  { id: "tr-04", sku: "FAB-FIL3", name: 'Filler Strip 3"', qty: 4, listPrice: 22, total: 88, leadTime: "In Stock", leadTimeColor: "text-green-600 dark:text-green-400 bg-green-500/10", status: "confirmed" },
];

const bomSections: BomSection[] = [
  { title: "Cabinets", items: cabinetItems },
  { title: "Countertops", items: countertopItems },
  { title: "Appliances", items: applianceItems },
  { title: "Fixtures", items: fixtureItems },
  { title: "Hardware", items: hardwareItems },
  { title: "Trim & Molding", items: trimItems },
];

/* ------------------------------------------------------------------ */
/*  Status Config                                                      */
/* ------------------------------------------------------------------ */

const statusConfig = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-green-600 dark:text-green-400 bg-green-500/10" },
  stale: { label: "Stale Price", icon: Clock, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  discontinued: { label: "Discontinued", icon: AlertTriangle, color: "text-red-600 dark:text-red-400 bg-red-500/10" },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EnhancedBomPreview({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Cabinets: true,
    Countertops: true,
    Appliances: true,
    Fixtures: false,
    Hardware: false,
    "Trim & Molding": false,
  });

  const toggle = (section: string) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  // Compute totals
  const allItems = bomSections.flatMap((s) => s.items);
  const totalItems = allItems.reduce((acc, i) => acc + i.qty, 0);
  const materialCost = allItems.reduce((acc, i) => acc + i.total, 0);
  const modificationsCost = allItems.reduce(
    (acc, i) => acc + (i.modifications?.reduce((a, m) => a + m.cost, 0) ?? 0),
    0
  );
  const warningCount = allItems.filter((i) => i.status === "stale" || i.status === "discontinued").length;

  // Cost breakdown
  const subtotal = materialCost;
  const modsTotal = modificationsCost;
  const delivery = 200; // Zone 2
  const taxRate = 0.07;
  const multiplier = 0.42; // Fabuwood standard
  const dealerNet = Math.round((subtotal + modsTotal) * multiplier * 100) / 100;
  const markupPercent = 30;
  const clientBeforeTax = Math.round(dealerNet * (1 + markupPercent / 100) * 100) / 100;
  const tax = Math.round((clientBeforeTax + delivery) * taxRate * 100) / 100;
  const clientTotal = clientBeforeTax + delivery + tax;
  const profit = clientBeforeTax - dealerNet;
  const marginPercent = Math.round((profit / clientBeforeTax) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="size-5 text-indigo-600 dark:text-indigo-400" />
            Bill of Materials — Johnson Kitchen v3
          </DialogTitle>
          <DialogDescription>
            Full material schedule with pricing, modifications, lead times, and cost breakdown
          </DialogDescription>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Items", value: totalItems.toString(), icon: Package, iconColor: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10" },
            { label: "Material Cost", value: `$${fmt(materialCost)}`, icon: DollarSign, iconColor: "text-green-600 dark:text-green-400", iconBg: "bg-green-500/10" },
            { label: "Modifications", value: `$${fmt(modificationsCost)}`, icon: Wrench, iconColor: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
            { label: "Warnings", value: warningCount.toString(), icon: AlertTriangle, iconColor: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="glass rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className={`inline-flex rounded-md p-1.5 ${card.iconBg}`}>
                    <Icon className={`size-3.5 ${card.iconColor}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="mt-1.5 text-xl font-bold text-foreground">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Grouped sections */}
        <div className="space-y-1">
          {bomSections.map((section) => (
            <div key={section.title} className="rounded-lg border border-border overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggle(section.title)}
                className="flex w-full items-center justify-between bg-muted/30 px-4 py-2.5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{section.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {section.items.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-foreground">
                    ${fmt(section.items.reduce((a, i) => a + i.total, 0))}
                  </span>
                  <ChevronDown
                    className={`size-3.5 text-muted-foreground transition-transform ${
                      expanded[section.title] ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Section items */}
              {expanded[section.title] && (
                <div className="divide-y divide-border">
                  {section.items.map((item) => {
                    const sc = statusConfig[item.status];
                    const StatusIcon = sc.icon;
                    return (
                      <div key={item.id}>
                        <div className="grid grid-cols-12 items-center gap-2 px-4 py-2 text-xs">
                          <div className="col-span-4 sm:col-span-3">
                            <span className="font-mono text-[10px] text-muted-foreground block">{item.sku}</span>
                            <span className="font-medium text-foreground">{item.name}</span>
                          </div>
                          <div className="col-span-1 text-center text-muted-foreground">{item.qty}</div>
                          <div className="col-span-2 text-right text-muted-foreground">
                            ${fmt(item.listPrice)}
                          </div>
                          <div className="col-span-2 text-right font-medium text-foreground">
                            ${fmt(item.total)}
                          </div>
                          <div className="col-span-1 hidden sm:block">
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${item.leadTimeColor}`}>
                              {item.leadTime}
                            </span>
                          </div>
                          <div className="col-span-2 sm:col-span-2 flex justify-end">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.color}`}>
                              <StatusIcon className="size-3" />
                              <span className="hidden sm:inline">{sc.label}</span>
                              {item.staleDays && (
                                <span className="text-[9px]">({item.staleDays}d)</span>
                              )}
                            </span>
                          </div>
                        </div>
                        {/* Modifications */}
                        {item.modifications && item.modifications.length > 0 && (
                          <div className="px-4 pb-2">
                            {item.modifications.map((mod) => (
                              <div
                                key={mod.label}
                                className="flex items-center justify-between pl-6 text-[11px] text-indigo-600 dark:text-indigo-400"
                              >
                                <span>+ {mod.label}</span>
                                <span>+${fmt(mod.cost)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cost breakdown */}
        <div className="glass rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Materials Subtotal</span>
              <span className="font-medium text-foreground">${fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Modifications Total</span>
              <span className="font-medium text-foreground">${fmt(modsTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Truck className="size-3" />
                Delivery (Zone 2: Regional)
              </span>
              <span className="font-medium text-foreground">${fmt(delivery)}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-muted-foreground">
              <span>Dealer Net (x{multiplier} multiplier)</span>
              <span className="font-medium text-foreground">${fmt(dealerNet)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Markup ({markupPercent}%)</span>
              <span className="font-medium text-foreground">${fmt(profit)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (7%)</span>
              <span className="font-medium text-foreground">${fmt(tax)}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Client Total</span>
              <span className="text-lg font-bold text-foreground">${fmt(clientTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Profit Margin</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                {marginPercent}% (${fmt(profit)})
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 text-xs"
              onClick={() => {
                toast.success("BOM exported as PDF");
                onOpenChange(false);
              }}
            >
              <FileText className="size-3.5" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              className="gap-2 text-xs"
              onClick={() => {
                toast.success("BOM exported as CSV");
                onOpenChange(false);
              }}
            >
              <FileSpreadsheet className="size-3.5" />
              Export CSV
            </Button>
          </div>
          <Button
            className="gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              toast.success("Proposal generated and ready for review");
              onOpenChange(false);
            }}
          >
            <Send className="size-3.5" />
            Generate Proposal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
