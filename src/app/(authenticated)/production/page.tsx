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

export default function ProductionPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");

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
          <Card key={stat.label} className="glass border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                <p className={`mt-1 text-xs ${stat.color}`}>{stat.change}</p>
              </div>
              <div className="rounded-xl bg-foreground/5 p-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

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
              <TableRow key={p.order} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer">
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
    </div>
  );
}
