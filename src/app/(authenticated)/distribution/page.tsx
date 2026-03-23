"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  Truck,
  Filter,
  Package,
  Clock,
  CheckCircle2,
  Timer,
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
  "Pending Shipment": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  "In Transit": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Delayed: "bg-red-500/20 text-red-400 border-red-500/30",
};

const stats = [
  { label: "Pending Shipment", value: "5", icon: Package, change: "2 ready today", color: "text-zinc-400" },
  { label: "In Transit", value: "8", icon: Truck, change: "3 arriving tomorrow", color: "text-blue-400" },
  { label: "Delivered", value: "42", icon: CheckCircle2, change: "+12 this week", color: "text-emerald-400" },
  { label: "Avg Lead Time", value: "12 days", icon: Timer, change: "-1.5 vs last month", color: "text-amber-400" },
];

const shipments = [
  { id: "SHP-2841", dealer: "Austin Kitchen & Bath", items: "Shaker Cabinets (12)", carrier: "FreightPro Logistics", status: "In Transit", eta: "2026-03-23" },
  { id: "SHP-2839", dealer: "Central TX Cabinets", items: "Quartz Slabs (3)", carrier: "StoneHaul Express", status: "Pending Shipment", eta: "2026-03-25" },
  { id: "SHP-2837", dealer: "Hill Country Renovations", items: "Base Cabinets (8), Hinges", carrier: "FreightPro Logistics", status: "In Transit", eta: "2026-03-22" },
  { id: "SHP-2835", dealer: "Round Rock Builders Supply", items: "Vanity 60\" Double Sink", carrier: "LTL National", status: "Delivered", eta: "2026-03-19" },
  { id: "SHP-2833", dealer: "Lakeway Home Design", items: "Custom Island - Walnut", carrier: "White Glove Delivery", status: "Pending Shipment", eta: "2026-03-27" },
  { id: "SHP-2831", dealer: "Georgetown Cabinetry", items: "LED Lighting Kits (4)", carrier: "UPS Freight", status: "Delivered", eta: "2026-03-18" },
  { id: "SHP-2829", dealer: "Austin Kitchen & Bath", items: "Granite Slabs (2)", carrier: "StoneHaul Express", status: "In Transit", eta: "2026-03-24" },
  { id: "SHP-2827", dealer: "Central TX Cabinets", items: "Pantry Cabinets (2), Shelves", carrier: "FreightPro Logistics", status: "Delayed", eta: "2026-03-26" },
];

export default function DistributionPage() {
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

  const filtered = shipments.filter((s) => {
    return filter === "all" || s.status.toLowerCase().replace(/ /g, "-") === filter;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Distribution & Shipping</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track shipments and manage logistics</p>
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="glass w-[200px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending-shipment">Pending Shipment</SelectItem>
            <SelectItem value="in-transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
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
              <TableHead className="text-muted-foreground">Shipment #</TableHead>
              <TableHead className="text-muted-foreground">Dealer</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Items</TableHead>
              <TableHead className="text-muted-foreground">Carrier</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">ETA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer">
                <TableCell className="font-medium text-foreground">{s.id}</TableCell>
                <TableCell className="text-muted-foreground">{s.dealer}</TableCell>
                <TableCell className="text-muted-foreground text-sm hidden lg:table-cell max-w-[240px] truncate">{s.items}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.carrier}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[s.status]}>{s.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(s.eta).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
