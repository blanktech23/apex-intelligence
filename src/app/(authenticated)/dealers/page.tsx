"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  Store,
  Search,
  Plus,
  Filter,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Suspended: "bg-red-500/20 text-red-400 border-red-500/30",
};

const stats = [
  { label: "Active Dealers", value: "12", icon: Store, change: "+1 this month", color: "text-emerald-400" },
  { label: "Pending Applications", value: "2", icon: Clock, change: "Avg 3 day review", color: "text-amber-400" },
  { label: "Total Revenue MTD", value: "$342K", icon: DollarSign, change: "+15.2% MoM", color: "text-indigo-400" },
];

const dealers = [
  { name: "Austin Kitchen & Bath", region: "Central TX", ordersMTD: 18, revenueMTD: 68400, status: "Active", rep: "Jessica Torres" },
  { name: "Central TX Cabinets", region: "Central TX", ordersMTD: 14, revenueMTD: 52100, status: "Active", rep: "Marcus Hall" },
  { name: "Hill Country Renovations", region: "Hill Country", ordersMTD: 10, revenueMTD: 38700, status: "Active", rep: "Jessica Torres" },
  { name: "Lakeway Home Design", region: "Lake Travis", ordersMTD: 7, revenueMTD: 29300, status: "Active", rep: "Marcus Hall" },
  { name: "Round Rock Builders Supply", region: "North Austin", ordersMTD: 12, revenueMTD: 45600, status: "Active", rep: "Diana Reyes" },
  { name: "Georgetown Cabinetry", region: "North Austin", ordersMTD: 5, revenueMTD: 18200, status: "Active", rep: "Diana Reyes" },
  { name: "Cedar Park Interiors", region: "North Austin", ordersMTD: 0, revenueMTD: 0, status: "Pending", rep: "Unassigned" },
  { name: "San Marcos Design Center", region: "South TX", ordersMTD: 0, revenueMTD: 0, status: "Pending", rep: "Unassigned" },
];

export default function DealersPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && persona !== "manufacturer") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "manufacturer") return null;

  const filtered = dealers.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesRegion = region === "all" || d.region.toLowerCase().replace(/ /g, "-") === region;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dealer Network</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage authorized dealers and applications</p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2" onClick={() => toast.success("Invitation sent successfully")}>
          <Plus className="h-4 w-4" />
          Invite Dealer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search dealers..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50" />
        </div>
        <Select value={region} onValueChange={(v) => v && setRegion(v)}>
          <SelectTrigger className="glass w-[180px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="central-tx">Central TX</SelectItem>
            <SelectItem value="north-austin">North Austin</SelectItem>
            <SelectItem value="hill-country">Hill Country</SelectItem>
            <SelectItem value="lake-travis">Lake Travis</SelectItem>
            <SelectItem value="south-tx">South TX</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Dealer Name</TableHead>
              <TableHead className="text-muted-foreground">Region</TableHead>
              <TableHead className="text-muted-foreground text-center">Orders MTD</TableHead>
              <TableHead className="text-muted-foreground text-right">Revenue MTD</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Rep Assigned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => (
              <TableRow key={d.name} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer">
                <TableCell className="font-medium text-foreground">{d.name}</TableCell>
                <TableCell className="text-muted-foreground">{d.region}</TableCell>
                <TableCell className="text-center text-muted-foreground">{d.ordersMTD}</TableCell>
                <TableCell className="text-right font-medium text-foreground">{d.revenueMTD > 0 ? `$${d.revenueMTD.toLocaleString()}` : "--"}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[d.status]}>{d.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{d.rep}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
