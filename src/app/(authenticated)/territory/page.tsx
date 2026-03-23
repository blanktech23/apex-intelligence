"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  Filter,
  Users,
  TrendingUp,
  DollarSign,
  UserPlus,
  Eye,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Prospect: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "At Risk": "bg-red-500/20 text-red-400 border-red-500/30",
};

const stats = [
  { label: "Total Accounts", value: "32", icon: Users, change: "+2 this quarter", color: "text-indigo-400" },
  { label: "Active", value: "24", icon: TrendingUp, change: "75% of total", color: "text-emerald-400" },
  { label: "Prospects", value: "8", icon: UserPlus, change: "3 warm leads", color: "text-blue-400" },
  { label: "Revenue MTD", value: "$67K", icon: DollarSign, change: "+9.4% MoM", color: "text-amber-400" },
];

const accounts = [
  { company: "Austin Kitchen & Bath", lastVisit: "2026-03-18", status: "Active", pipeline: 34200 },
  { company: "Central TX Cabinets", lastVisit: "2026-03-15", status: "Active", pipeline: 28700 },
  { company: "Hill Country Renovations", lastVisit: "2026-03-14", status: "Active", pipeline: 19800 },
  { company: "Lakeway Home Design", lastVisit: "2026-03-12", status: "Prospect", pipeline: 45000 },
  { company: "Round Rock Builders Supply", lastVisit: "2026-03-10", status: "Active", pipeline: 22400 },
  { company: "Georgetown Cabinetry", lastVisit: "2026-03-08", status: "At Risk", pipeline: 12300 },
  { company: "Cedar Park Interiors", lastVisit: "2026-03-06", status: "Prospect", pipeline: 38500 },
  { company: "San Marcos Design Center", lastVisit: "2026-03-04", status: "Active", pipeline: 16900 },
  { company: "Dripping Springs K&B", lastVisit: "2026-03-02", status: "Prospect", pipeline: 52000 },
  { company: "Pflugerville Home Pro", lastVisit: "2026-02-28", status: "Active", pipeline: 8400 },
];

export default function TerritoryPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && persona !== "rep") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "rep") return null;

  const filtered = accounts.filter((a) => {
    const matchesSearch = a.company.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = region === "all" || a.status.toLowerCase().replace(" ", "-") === region;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">My Territory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Central Texas Region - Account overview</p>
        </div>
        <Select value={region} onValueChange={(v) => v && setRegion(v)}>
          <SelectTrigger className="glass w-[180px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="at-risk">At Risk</SelectItem>
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

      <Card className="glass border-border p-0 overflow-hidden">
        <div className="bg-foreground/[0.02] h-48 flex items-center justify-center border-b border-border">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Territory Map</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Central Texas - Austin Metro Area</p>
          </div>
        </div>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50" />
      </div>

      <Separator className="bg-border" />

      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Last Visit</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Pipeline Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((a) => (
              <TableRow key={a.company} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer">
                <TableCell className="font-medium text-foreground">{a.company}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(a.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[a.status]}>{a.status}</Badge></TableCell>
                <TableCell className="text-right font-medium text-foreground">${a.pipeline.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
