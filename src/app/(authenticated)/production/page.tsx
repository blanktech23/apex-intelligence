"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  Factory,
  Filter,
  Clock,
  Wrench,
  CheckCircle2,
  Package,
  ChevronDown,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "In Queue": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  "In Production": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Quality Check": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Ready to Ship": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const stats = [
  { label: "In Queue", value: "12", icon: Clock, change: "3 urgent", color: "text-zinc-400" },
  { label: "In Production", value: "8", icon: Wrench, change: "On schedule", color: "text-blue-400" },
  { label: "Quality Check", value: "3", icon: CheckCircle2, change: "1 flagged", color: "text-amber-400" },
  { label: "Ready to Ship", value: "5", icon: Package, change: "2 today", color: "text-emerald-400" },
];

const production = [
  { order: "ORD-4821", dealer: "Austin Kitchen & Bath", productLine: "Shaker Series - White", qty: 12, status: "In Queue", est: "2026-04-02" },
  { order: "ORD-4820", dealer: "Central TX Cabinets", productLine: "Quartz Countertop - Calacatta", qty: 3, status: "In Production", est: "2026-03-28" },
  { order: "ORD-4819", dealer: "Hill Country Renovations", productLine: "Shaker Series - Gray", qty: 8, status: "In Production", est: "2026-03-26" },
  { order: "ORD-4817", dealer: "Austin Kitchen & Bath", productLine: "Vanity - Double Sink 60\"", qty: 1, status: "Ready to Ship", est: "2026-03-22" },
  { order: "ORD-4815", dealer: "Lakeway Home Design", productLine: "Custom Island - Walnut", qty: 1, status: "Quality Check", est: "2026-03-25" },
  { order: "ORD-4813", dealer: "Round Rock Builders Supply", productLine: "Wall Cabinets - Espresso", qty: 6, status: "In Queue", est: "2026-04-05" },
  { order: "ORD-4810", dealer: "Georgetown Cabinetry", productLine: "LED Under-Cabinet Kit", qty: 4, status: "Ready to Ship", est: "2026-03-21" },
  { order: "ORD-4808", dealer: "Cedar Park Interiors", productLine: "Outdoor Kitchen Set - SS", qty: 1, status: "In Production", est: "2026-03-30" },
  { order: "ORD-4805", dealer: "Central TX Cabinets", productLine: "Granite Slab - Absolute Black", qty: 2, status: "Quality Check", est: "2026-03-24" },
  { order: "ORD-4802", dealer: "Hill Country Renovations", productLine: "Pantry Cabinet 84\" Tall", qty: 2, status: "Ready to Ship", est: "2026-03-21" },
];

/* Detail data for expanded cards */
const queuedOrders = [
  { order: "ORD-4821", dealer: "Austin Kitchen & Bath", product: "Shaker Series - White", priority: "Normal", received: "Mar 18" },
  { order: "ORD-4813", dealer: "Round Rock Builders Supply", product: "Wall Cabinets - Espresso", priority: "Urgent", received: "Mar 16" },
  { order: "ORD-4826", dealer: "Central TX Cabinets", product: "Base Cabinets - Maple", priority: "Normal", received: "Mar 20" },
  { order: "ORD-4828", dealer: "Lakeway Home Design", product: "Vanity - Single 36\"", priority: "Rush", received: "Mar 21" },
  { order: "ORD-4830", dealer: "Georgetown Cabinetry", product: "Pantry 96\" Tall - White", priority: "Normal", received: "Mar 21" },
  { order: "ORD-4831", dealer: "Hill Country Renovations", product: "Corner Cabinet - Oak", priority: "Normal", received: "Mar 20" },
  { order: "ORD-4832", dealer: "Cedar Park Interiors", product: "Floating Shelves (set 4)", priority: "Normal", received: "Mar 19" },
  { order: "ORD-4833", dealer: "Austin Kitchen & Bath", product: "Crown Molding - 12ft", priority: "Normal", received: "Mar 18" },
  { order: "ORD-4834", dealer: "Round Rock Builders Supply", product: "Lazy Susan Cabinet", priority: "Urgent", received: "Mar 17" },
  { order: "ORD-4835", dealer: "Central TX Cabinets", product: "Drawer Base 3-Drawer", priority: "Normal", received: "Mar 17" },
  { order: "ORD-4836", dealer: "Lakeway Home Design", product: "Wall Oven Cabinet", priority: "Normal", received: "Mar 16" },
  { order: "ORD-4837", dealer: "Georgetown Cabinetry", product: "Sink Base 36\"", priority: "Urgent", received: "Mar 15" },
];

const activeProduction = [
  { order: "ORD-4820", product: "Quartz Countertop - Calacatta", stage: "Cutting", pct: 35, estCompletion: "Mar 28" },
  { order: "ORD-4819", product: "Shaker Series - Gray", stage: "Assembly", pct: 60, estCompletion: "Mar 26" },
  { order: "ORD-4808", product: "Outdoor Kitchen Set - SS", stage: "Cutting", pct: 20, estCompletion: "Mar 30" },
  { order: "ORD-4822", product: "Base Cabinets - Cherry", stage: "Finishing", pct: 85, estCompletion: "Mar 24" },
  { order: "ORD-4823", product: "Quartz Countertop - Carrara", stage: "Cutting", pct: 15, estCompletion: "Apr 01" },
  { order: "ORD-4824", product: "Pantry Cabinet 84\" - Espresso", stage: "Assembly", pct: 50, estCompletion: "Mar 27" },
  { order: "ORD-4825", product: "Custom Island - Maple", stage: "Finishing", pct: 90, estCompletion: "Mar 23" },
  { order: "ORD-4826", product: "Vanity - Double 72\"", stage: "Assembly", pct: 45, estCompletion: "Mar 29" },
];

const qcItems = [
  { order: "ORD-4815", product: "Custom Island - Walnut", inspector: "Maria Santos", issue: "Minor edge chip - repaired", result: "Pass" },
  { order: "ORD-4805", product: "Granite Slab - Absolute Black", inspector: "James Chen", issue: "None", result: "Pending" },
  { order: "ORD-4822", product: "Base Cabinets - Cherry", inspector: "Maria Santos", issue: "Drawer alignment off 2mm", result: "Fail" },
];

const readyToShip = [
  { order: "ORD-4817", dealer: "Austin Kitchen & Bath", items: "Vanity - Double Sink 60\"", weight: "185 lbs", method: "White Glove", pickup: "Mar 23" },
  { order: "ORD-4810", dealer: "Georgetown Cabinetry", items: "LED Under-Cabinet Kit (4)", weight: "12 lbs", method: "UPS Ground", pickup: "Mar 22" },
  { order: "ORD-4802", dealer: "Hill Country Renovations", items: "Pantry Cabinet 84\" (2)", weight: "320 lbs", method: "FreightPro LTL", pickup: "Mar 22" },
  { order: "ORD-4809", dealer: "Round Rock Builders Supply", items: "Crown Molding Bundle", weight: "45 lbs", method: "UPS Ground", pickup: "Mar 24" },
  { order: "ORD-4811", dealer: "Cedar Park Interiors", items: "Hardware Kit - Brushed Nickel", weight: "8 lbs", method: "USPS Priority", pickup: "Mar 23" },
];

const priorityColors: Record<string, string> = {
  Normal: "text-muted-foreground",
  Urgent: "text-amber-400 font-medium",
  Rush: "text-red-400 font-medium",
};

const qcResultColors: Record<string, string> = {
  Pass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Fail: "bg-red-500/20 text-red-400 border-red-500/30",
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function ProductionPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<(typeof production)[number] | null>(null);

  const productionSteps = ["Order Received", "In Production", "QC Check", "Ready to Ship"];
  const stepMap: Record<string, number> = { "In Queue": 0, "In Production": 1, "Quality Check": 2, "Ready to Ship": 3 };

  function handleUpdateStatus(newStatus: string) {
    if (selectedItem) {
      setSelectedItem({ ...selectedItem, status: newStatus });
      toast.success(`Status updated to "${newStatus}" for ${selectedItem.order}`);
    }
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && persona !== "manufacturer") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "manufacturer") return null;

  const filtered = production.filter((p) => {
    return filter === "all" || p.status.toLowerCase().replace(/ /g, "-") === filter;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Production Queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor manufacturing progress and fulfillment</p>
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="glass w-[180px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="in-queue">In Queue</SelectItem>
            <SelectItem value="in-production">In Production</SelectItem>
            <SelectItem value="quality-check">Quality Check</SelectItem>
            <SelectItem value="ready-to-ship">Ready to Ship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`glass border-border p-5 cursor-pointer transition-all duration-200 hover:bg-foreground/[0.03] ${expandedCard === stat.label ? "ring-1 ring-indigo-500/30 border-indigo-500/20" : ""}`}
            onClick={() => setExpandedCard(expandedCard === stat.label ? null : stat.label)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className={`mt-1 text-xs ${stat.color}`}>{stat.change}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl bg-foreground/5 p-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedCard === stat.label ? "rotate-180" : ""}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Expanded Card Detail Panel */}
      {expandedCard && (
        <div className="glass border-border rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {expandedCard === "In Queue" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Queued Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Dealer</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Product</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Priority</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queuedOrders.map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-muted-foreground">{row.dealer}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.product}</td>
                        <td className={`py-2 text-center text-xs ${priorityColors[row.priority]}`}>{row.priority}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.received}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expandedCard === "In Production" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Active Production</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Product Line</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Stage</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">% Complete</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Est. Completion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProduction.map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.product}</td>
                        <td className="py-2 text-center">
                          <Badge variant="outline" className={
                            row.stage === "Cutting" ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" :
                            row.stage === "Assembly" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                            "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          }>{row.stage}</Badge>
                        </td>
                        <td className="py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-foreground/10">
                              <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${row.pct}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground">{row.pct}%</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{row.estCompletion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expandedCard === "Quality Check" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Quality Check Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Product</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Inspector</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Issue Found</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qcItems.map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-muted-foreground">{row.product}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.inspector}</td>
                        <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">{row.issue}</td>
                        <td className="py-2 text-center">
                          <Badge variant="outline" className={qcResultColors[row.result]}>{row.result}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expandedCard === "Ready to Ship" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Ready to Ship</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Dealer</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Weight</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Shipping</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Pickup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readyToShip.map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-muted-foreground">{row.dealer}</td>
                        <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">{row.items}</td>
                        <td className="py-2 text-center text-muted-foreground text-xs hidden md:table-cell">{row.weight}</td>
                        <td className="py-2 text-center text-xs text-muted-foreground">{row.method}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.pickup}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <Separator className="bg-border" />

      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Order #</TableHead>
              <TableHead className="text-muted-foreground">Dealer</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Product Line</TableHead>
              <TableHead className="text-muted-foreground text-center">Qty</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Est. Completion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.order}
                className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                onClick={() => setSelectedItem(p)}
              >
                <TableCell className="font-medium text-foreground">{p.order}</TableCell>
                <TableCell className="text-muted-foreground">{p.dealer}</TableCell>
                <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">{p.productLine}</TableCell>
                <TableCell className="text-center text-muted-foreground">{p.qty}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[p.status]}>{p.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(p.est).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Production Detail Slide-out Panel */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedItem(null)} />
          <div className="relative z-10 h-full w-full max-w-md overflow-y-auto border-l border-border bg-background p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <button onClick={() => setSelectedItem(null)} className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedItem.order}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{selectedItem.productLine}</p>
                <Badge variant="outline" className={`mt-2 ${statusColors[selectedItem.status]}`}>{selectedItem.status}</Badge>
              </div>

              <Separator className="bg-border" />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Dealer</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedItem.dealer}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Quantity</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedItem.qty}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Product Line</p>
                  <p className="text-sm text-foreground mt-0.5">{selectedItem.productLine}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Est. Completion</p>
                  <p className="text-sm text-foreground mt-0.5">{new Date(selectedItem.est).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Timeline / Progress */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Production Timeline</p>
                <div className="space-y-3">
                  {productionSteps.map((step, i) => {
                    const currentStep = stepMap[selectedItem.status] ?? 0;
                    const isComplete = i < currentStep;
                    const isCurrent = i === currentStep;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                          isComplete ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                          isCurrent ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" :
                          "bg-foreground/5 text-muted-foreground border border-border"
                        }`}>
                          {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <span className={`text-sm ${isCurrent ? "font-medium text-foreground" : isComplete ? "text-emerald-400" : "text-muted-foreground"}`}>{step}</span>
                        {isCurrent && <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px] px-1.5 py-0">Current</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Actions */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Update Status</p>
                  <Select value={selectedItem.status} onValueChange={(v) => v && handleUpdateStatus(v)}>
                    <SelectTrigger className="glass border-border bg-foreground/5 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      <SelectItem value="In Queue">In Queue</SelectItem>
                      <SelectItem value="In Production">In Production</SelectItem>
                      <SelectItem value="Quality Check">QC Check</SelectItem>
                      <SelectItem value="Ready to Ship">Ready to Ship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => toast.success("Shipping label generated")}
                  className="w-full rounded-lg border border-border bg-foreground/5 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/10"
                >
                  Print Label
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
