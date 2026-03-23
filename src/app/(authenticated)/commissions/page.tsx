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
