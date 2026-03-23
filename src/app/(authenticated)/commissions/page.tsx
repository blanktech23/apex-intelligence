"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
  CheckCircle2,
  Clock,
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

const statusColors: Record<string, string> = {
  Paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const stats = [
  { label: "MTD Commission", value: "$2,109", icon: DollarSign, change: "+$370 this week", color: "text-emerald-400" },
  { label: "Projected", value: "$2,500", icon: TrendingUp, change: "Based on pipeline", color: "text-blue-400" },
  { label: "YTD Total", value: "$9,640", icon: Calendar, change: "+22% vs last year", color: "text-amber-400" },
  { label: "Avg Rate", value: "2.1%", icon: Percent, change: "Across all orders", color: "text-purple-400" },
];

const commissions = [
  { order: "ORD-4821", contractor: "Rivera General Contracting", total: 18450, rate: 2, commission: 369, status: "Pending", date: "2026-03-20" },
  { order: "ORD-4820", contractor: "Summit Builders LLC", total: 8720, rate: 2.5, commission: 218, status: "Pending", date: "2026-03-19" },
  { order: "ORD-4819", contractor: "Harbor View Construction", total: 12340, rate: 2, commission: 247, status: "Processing", date: "2026-03-18" },
  { order: "ORD-4817", contractor: "Brooks Design-Build", total: 3280, rate: 3, commission: 98, status: "Paid", date: "2026-03-17" },
  { order: "ORD-4815", contractor: "Whitfield Custom Homes", total: 14500, rate: 2, commission: 290, status: "Processing", date: "2026-03-16" },
  { order: "ORD-4813", contractor: "Lone Star Renovations", total: 9870, rate: 2.5, commission: 247, status: "Pending", date: "2026-03-16" },
  { order: "ORD-4810", contractor: "Parkway Home Design", total: 1240, rate: 3, commission: 37, status: "Paid", date: "2026-03-15" },
  { order: "ORD-4808", contractor: "Castillo Landscape Design", total: 22100, rate: 1.5, commission: 332, status: "Processing", date: "2026-03-14" },
  { order: "ORD-4805", contractor: "Rivera General Contracting", total: 6450, rate: 2, commission: 129, status: "Paid", date: "2026-03-13" },
  { order: "ORD-4802", contractor: "Summit Builders LLC", total: 5680, rate: 2.5, commission: 142, status: "Paid", date: "2026-03-12" },
];

export default function CommissionsPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [month, setMonth] = useState("march");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && persona !== "rep") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "rep") return null;

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Commissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your earnings and commission history</p>
        </div>
        <Select value={month} onValueChange={(v) => v && setMonth(v)}>
          <SelectTrigger className="glass w-[160px] border-border bg-foreground/5 text-foreground">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="january">January</SelectItem>
            <SelectItem value="february">February</SelectItem>
            <SelectItem value="march">March</SelectItem>
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
          {expandedCard === "MTD Commission" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Commission Breakdown by Order</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-center py-2 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { order: "ORD-4821", amount: "$369", status: "Pending", date: "Mar 20" },
                      { order: "ORD-4820", amount: "$218", status: "Pending", date: "Mar 19" },
                      { order: "ORD-4819", amount: "$247", status: "Processing", date: "Mar 18" },
                      { order: "ORD-4817", amount: "$98", status: "Paid", date: "Mar 17" },
                      { order: "ORD-4815", amount: "$290", status: "Processing", date: "Mar 16" },
                      { order: "ORD-4813", amount: "$247", status: "Pending", date: "Mar 16" },
                      { order: "ORD-4810", amount: "$37", status: "Paid", date: "Mar 15" },
                      { order: "ORD-4808", amount: "$332", status: "Processing", date: "Mar 14" },
                    ].map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-right text-emerald-400 font-medium">{row.amount}</td>
                        <td className="py-2 text-center">
                          <Badge variant="outline" className={statusColors[row.status]}>{row.status}</Badge>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {expandedCard === "Projected" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Pipeline Breakdown</h3>
              <div className="space-y-3">
                {[
                  { order: "ORD-4821", contractor: "Rivera General Contracting", expected: "$369" },
                  { order: "ORD-4820", contractor: "Summit Builders LLC", expected: "$218" },
                  { order: "ORD-4813", contractor: "Lone Star Renovations", expected: "$247" },
                  { order: "Pending quotes", contractor: "3 additional prospects", expected: "~$166" },
                ].map((row) => (
                  <div key={row.order} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.order}</p>
                      <p className="text-xs text-muted-foreground">{row.contractor}</p>
                    </div>
                    <p className="text-sm font-medium text-blue-400">{row.expected}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total Projected</p>
                  <p className="text-sm font-bold text-blue-400">$2,500</p>
                </div>
              </div>
            </div>
          )}
          {expandedCard === "YTD Total" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Monthly Trend</h3>
              <div className="space-y-3">
                {[
                  { month: "January", amount: "$3,240", running: "$3,240" },
                  { month: "February", amount: "$4,291", running: "$7,531" },
                  { month: "March (MTD)", amount: "$2,109", running: "$9,640" },
                ].map((row) => (
                  <div key={row.month} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <p className="text-sm font-medium text-foreground">{row.month}</p>
                    <div className="flex items-center gap-6">
                      <p className="text-sm font-medium text-amber-400">{row.amount}</p>
                      <p className="text-xs text-muted-foreground w-20 text-right">Running: {row.running}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expandedCard === "Avg Rate" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Rate Distribution</h3>
              <div className="space-y-3">
                {[
                  { rate: "1.5%", orders: 1, label: "Large volume orders" },
                  { rate: "2.0%", orders: 4, label: "Standard rate" },
                  { rate: "2.5%", orders: 3, label: "Preferred accounts" },
                  { rate: "3.0%", orders: 2, label: "Premium rate" },
                ].map((row) => (
                  <div key={row.rate} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-purple-400 w-10">{row.rate}</span>
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{row.orders} orders</span>
                  </div>
                ))}
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
              <TableHead className="text-muted-foreground">Contractor</TableHead>
              <TableHead className="text-muted-foreground text-right">Order Total</TableHead>
              <TableHead className="text-muted-foreground text-center">Rate</TableHead>
              <TableHead className="text-muted-foreground text-right">Commission</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commissions.map((c) => (
              <TableRow key={c.order} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer" onClick={() => router.push(`/orders/${c.order}`)}>
                <TableCell className="font-medium text-foreground">{c.order}</TableCell>
                <TableCell className="text-muted-foreground">{c.contractor}</TableCell>
                <TableCell className="text-right text-muted-foreground">${c.total.toLocaleString()}</TableCell>
                <TableCell className="text-center text-muted-foreground">{c.rate}%</TableCell>
                <TableCell className="text-right font-medium text-emerald-400">${c.commission.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(c.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
