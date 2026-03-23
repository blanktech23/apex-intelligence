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
  ChevronDown,
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

/* Detail data for expanded cards */
const pendingItems = [
  { shipment: "SHP-2839", dealer: "Central TX Cabinets", items: "Quartz Slabs (3)", readyDate: "Mar 22", carrier: "StoneHaul Express" },
  { shipment: "SHP-2833", dealer: "Lakeway Home Design", items: "Custom Island - Walnut", readyDate: "Mar 23", carrier: "White Glove Delivery" },
  { shipment: "SHP-2843", dealer: "Georgetown Cabinetry", items: "Cabinet Hardware (bulk)", readyDate: "Mar 23", carrier: "UPS Ground" },
  { shipment: "SHP-2845", dealer: "Round Rock Builders Supply", items: "Wall Cabinets - Espresso (6)", readyDate: "Mar 24", carrier: "FreightPro Logistics" },
  { shipment: "SHP-2847", dealer: "Hill Country Renovations", items: "Vanity Mirror Set (2)", readyDate: "Mar 24", carrier: "UPS Freight" },
];

const transitItems = [
  { shipment: "SHP-2841", carrier: "FreightPro Logistics", origin: "Austin, TX", location: "San Antonio, TX", eta: "Mar 23" },
  { shipment: "SHP-2837", carrier: "FreightPro Logistics", origin: "Austin, TX", location: "Dripping Springs, TX", eta: "Mar 22" },
  { shipment: "SHP-2829", carrier: "StoneHaul Express", origin: "Austin, TX", location: "Round Rock, TX", eta: "Mar 24" },
  { shipment: "SHP-2849", carrier: "LTL National", origin: "Austin, TX", location: "Georgetown, TX", eta: "Mar 25" },
  { shipment: "SHP-2851", carrier: "White Glove Delivery", origin: "Austin, TX", location: "Bee Cave, TX", eta: "Mar 23" },
  { shipment: "SHP-2853", carrier: "UPS Freight", origin: "Austin, TX", location: "Cedar Park, TX", eta: "Mar 24" },
  { shipment: "SHP-2855", carrier: "FreightPro Logistics", origin: "Austin, TX", location: "Pflugerville, TX", eta: "Mar 25" },
  { shipment: "SHP-2857", carrier: "StoneHaul Express", origin: "Austin, TX", location: "Kyle, TX", eta: "Mar 26" },
];

const deliveredByDay = [
  { day: "Monday", count: 8, onTime: true },
  { day: "Tuesday", count: 7, onTime: true },
  { day: "Wednesday", count: 9, onTime: true },
  { day: "Thursday", count: 6, onTime: false },
  { day: "Friday", count: 12, onTime: true },
];

const leadTimeTrend = [
  { month: "Oct", days: 15, trend: "down" },
  { month: "Nov", days: 14, trend: "down" },
  { month: "Dec", days: 13.5, trend: "down" },
  { month: "Jan", days: 14, trend: "up" },
  { month: "Feb", days: 13.5, trend: "down" },
  { month: "Mar", days: 12, trend: "down" },
];

export default function DistributionPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
          {expandedCard === "Pending Shipment" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Pending Shipments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Shipment #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Dealer</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Items</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Ready Date</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Carrier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingItems.map((row) => (
                      <tr key={row.shipment} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.shipment}</td>
                        <td className="py-2 text-muted-foreground">{row.dealer}</td>
                        <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">{row.items}</td>
                        <td className="py-2 text-center text-muted-foreground">{row.readyDate}</td>
                        <td className="py-2 text-right text-muted-foreground text-xs hidden sm:table-cell">{row.carrier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expandedCard === "In Transit" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Shipments In Transit</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Shipment #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Carrier</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Origin</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Current Location</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transitItems.map((row) => (
                      <tr key={row.shipment} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.shipment}</td>
                        <td className="py-2 text-muted-foreground text-xs">{row.carrier}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.origin}</td>
                        <td className="py-2 text-blue-400 text-xs">{row.location}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expandedCard === "Delivered" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">This Week&apos;s Deliveries</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                {deliveredByDay.map((d) => (
                  <div key={d.day} className="flex flex-col items-center rounded-lg border border-border bg-foreground/[0.02] px-4 py-3">
                    <span className="text-xs text-muted-foreground">{d.day}</span>
                    <span className="text-xl font-bold text-foreground mt-1">{d.count}</span>
                    <span className={`text-xs mt-1 ${d.onTime ? "text-emerald-400" : "text-amber-400"}`}>
                      {d.onTime ? "All on time" : "1 delayed"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Total: <span className="font-medium text-foreground">42 deliveries</span></span>
                <span>On-time: <span className="font-medium text-emerald-400">97.6%</span></span>
                <span>Issues: <span className="font-medium text-amber-400">1 delayed (Thursday)</span></span>
              </div>
            </div>
          )}

          {expandedCard === "Avg Lead Time" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Lead Time Trend (Last 6 Months)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Month</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Avg Lead Time</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Trend</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadTimeTrend.map((row) => (
                      <tr key={row.month} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.month}</td>
                        <td className="py-2 text-center text-muted-foreground">{row.days} days</td>
                        <td className={`py-2 text-center text-xs ${row.trend === "down" ? "text-emerald-400" : "text-amber-400"}`}>
                          {row.trend === "down" ? "Improving" : "Increased"}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${(row.days / 16) * 80}px` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Overall trend: <span className="text-emerald-400 font-medium">-3 days</span> improvement over 6 months</div>
            </div>
          )}
        </div>
      )}

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
              <TableRow
                key={s.id}
                className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                onClick={() => toast(s.id, { description: `Dealer: ${s.dealer} | Items: ${s.items} | Carrier: ${s.carrier} | Status: ${s.status}` })}
              >
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
