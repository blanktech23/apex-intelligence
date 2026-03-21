"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  DollarSign,
  FileText,
  Send,
} from "lucide-react";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BomItem {
  id: string;
  item: string;
  category: string;
  manufacturer: string;
  sku: string;
  qty: number;
  unitCost: number;
  total: number;
  status: "confirmed" | "stale" | "discontinued" | "unresolved";
  priceNote?: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const bomItems: BomItem[] = [
  { id: "1", item: "Base Cabinet B36", category: "Base Cabinet", manufacturer: "KraftMaid", sku: "B36-QUAJ-QUMD", qty: 4, unitCost: 842, total: 3368, status: "confirmed" },
  { id: "2", item: "Base Cabinet B24", category: "Base Cabinet", manufacturer: "KraftMaid", sku: "B24-QUAJ-QUMD", qty: 3, unitCost: 624, total: 1872, status: "confirmed" },
  { id: "3", item: "Wall Cabinet W3612", category: "Wall Cabinet", manufacturer: "KraftMaid", sku: "W3612-QUAJ", qty: 4, unitCost: 498, total: 1992, status: "confirmed" },
  { id: "4", item: "Wall Cabinet W3012", category: "Wall Cabinet", manufacturer: "KraftMaid", sku: "W3012-QUAJ", qty: 3, unitCost: 442, total: 1326, status: "stale", priceNote: "Price last verified 95 days ago" },
  { id: "5", item: "Tall Pantry TP2484", category: "Tall Cabinet", manufacturer: "KraftMaid", sku: "TP2484-QUAJ", qty: 1, unitCost: 1120, total: 1120, status: "confirmed" },
  { id: "6", item: "Island Base Cabinet", category: "Base Cabinet", manufacturer: "KraftMaid", sku: "ISL-36x60-QUAJ", qty: 1, unitCost: 1890, total: 1890, status: "confirmed" },
  { id: "7", item: "Quartz Countertop - Calacatta", category: "Countertop", manufacturer: "Caesarstone", sku: "CS-5031-?"  , qty: 1, unitCost: 4200, total: 4200, status: "unresolved", priceNote: "Template measurements pending" },
  { id: "8", item: "Island Countertop w/ Overhang", category: "Countertop", manufacturer: "Caesarstone", sku: "CS-5031-ISL", qty: 1, unitCost: 2100, total: 2100, status: "confirmed" },
  { id: "9", item: "Gas Range 30\" Pro", category: "Appliance", manufacturer: "Viking", sku: "VGIC53014BSS", qty: 1, unitCost: 3280, total: 3280, status: "confirmed" },
  { id: "10", item: "Double Wall Oven 30\"", category: "Appliance", manufacturer: "Viking", sku: "VDOE530SS", qty: 1, unitCost: 4650, total: 4650, status: "stale", priceNote: "Price last verified 62 days ago" },
  { id: "11", item: "French Door Refrigerator", category: "Appliance", manufacturer: "Sub-Zero", sku: "CL3650UFDST", qty: 1, unitCost: 8900, total: 8900, status: "confirmed" },
  { id: "12", item: "Dishwasher Panel-Ready", category: "Appliance", manufacturer: "Bosch", sku: "SHPM88Z75N", qty: 1, unitCost: 1240, total: 1240, status: "confirmed" },
  { id: "13", item: "Farmhouse Sink 33\"", category: "Fixture", manufacturer: "Kohler", sku: "K-6489-0", qty: 1, unitCost: 780, total: 780, status: "confirmed" },
  { id: "14", item: "Pull-Down Faucet", category: "Fixture", manufacturer: "Delta", sku: "9159T-DST", qty: 1, unitCost: 420, total: 420, status: "confirmed" },
  { id: "15", item: "Backsplash Tile - Herringbone", category: "Tile", manufacturer: "Daltile", sku: "M313-HB-38", qty: 32, unitCost: 12.5, total: 400, status: "discontinued", priceNote: "Discontinued by manufacturer" },
  { id: "16", item: "Cabinet Hardware - Pull 5\"", category: "Hardware", manufacturer: "Amerock", sku: "BP36800BBR", qty: 24, unitCost: 8.75, total: 210, status: "confirmed" },
  { id: "17", item: "Cabinet Hardware - Knob", category: "Hardware", manufacturer: "Amerock", sku: "BP36802BBR", qty: 10, unitCost: 6.50, total: 65, status: "confirmed" },
  { id: "18", item: "Under-Cabinet LED Strip", category: "Lighting", manufacturer: "WAC", sku: "LED-TX2430", qty: 3, unitCost: 89, total: 267, status: "confirmed" },
];

const statusConfig = {
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-green-400 bg-green-500/10" },
  stale: { label: "Stale Price", icon: Clock, color: "text-amber-400 bg-amber-500/10" },
  discontinued: { label: "Discontinued", icon: AlertTriangle, color: "text-red-400 bg-red-500/10" },
  unresolved: { label: "Unresolved", icon: HelpCircle, color: "text-gray-400 bg-gray-500/10" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BomPreview({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const totalItems = bomItems.reduce((acc, i) => acc + i.qty, 0);
  const materialCost = bomItems.reduce((acc, i) => acc + i.total, 0);
  const unresolvedCount = bomItems.filter((i) => i.status === "unresolved").length;
  const warningCount = bomItems.filter((i) => i.status === "stale" || i.status === "discontinued").length;

  const markup = materialCost * 0.3;
  const laborEstimate = 8400;
  const contingency = (materialCost + markup + laborEstimate) * 0.1;
  const grandTotal = materialCost + markup + laborEstimate + contingency;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="size-5 text-indigo-400" />
            Bill of Materials — Kitchen Design v3
          </DialogTitle>
          <DialogDescription>
            Complete material list with pricing and availability status
          </DialogDescription>
        </DialogHeader>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Items", value: totalItems.toString(), icon: Package, iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10" },
            { label: "Material Cost", value: `$${materialCost.toLocaleString()}`, icon: DollarSign, iconColor: "text-green-400", iconBg: "bg-green-500/10" },
            { label: "Unresolved", value: unresolvedCount.toString(), icon: HelpCircle, iconColor: "text-gray-400", iconBg: "bg-gray-500/10" },
            { label: "Price Warnings", value: warningCount.toString(), icon: AlertTriangle, iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
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

        {/* BOM table */}
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Item</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Category</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Manufacturer</TableHead>
                <TableHead className="text-xs hidden md:table-cell">SKU</TableHead>
                <TableHead className="text-xs text-right">Qty</TableHead>
                <TableHead className="text-xs text-right">Unit Cost</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bomItems.map((item) => {
                const sc = statusConfig[item.status];
                const StatusIcon = sc.icon;
                return (
                  <TableRow key={item.id} className="text-xs">
                    <TableCell className="font-medium text-foreground">
                      {item.item}
                      {item.priceNote && (
                        <span className="block text-[10px] text-amber-400 mt-0.5">
                          {item.priceNote}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{item.category}</TableCell>
                    <TableCell className="text-muted-foreground hidden md:table-cell">{item.manufacturer}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground hidden md:table-cell">{item.sku}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{item.qty}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${item.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.color}`}>
                        <StatusIcon className="size-3" />
                        {sc.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Cost breakdown */}
        <div className="glass rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Cost Breakdown</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Materials subtotal</span>
              <span className="font-medium text-foreground">${materialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Markup (30%)</span>
              <span className="font-medium text-foreground">${markup.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Labor estimate</span>
              <span className="font-medium text-foreground">${laborEstimate.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Contingency (10%)</span>
              <span className="font-medium text-foreground">${contingency.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Grand Total</span>
              <span className="text-lg font-bold text-foreground">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
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
            className="gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              toast.success("BOM sent to Estimate Engine");
              onOpenChange(false);
            }}
          >
            <Send className="size-3.5" />
            Generate Estimate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
