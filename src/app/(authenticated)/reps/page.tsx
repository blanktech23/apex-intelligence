"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserCheck,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  MapPin,
  Briefcase,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  "On Leave": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const stats = [
  { label: "Total Reps", value: "14", icon: UserCheck, change: "+2 this quarter", color: "text-indigo-400" },
  { label: "Active Territories", value: "11", icon: MapPin, change: "79% coverage", color: "text-emerald-400" },
  { label: "Orders Placed MTD", value: "218", icon: Briefcase, change: "+22% vs last month", color: "text-amber-400" },
  { label: "Commission Paid MTD", value: "$38.4K", icon: DollarSign, change: "+9.1% MoM", color: "text-purple-400" },
];

const reps = [
  { id: "rep-1", name: "Carlos Medina", territory: "Southeast FL", accountsManaged: 18, ordersMTD: 34, commissionMTD: 6800, status: "Active", lastActivity: "2026-03-22" },
  { id: "rep-2", name: "Jessica Palmer", territory: "DFW Metro", accountsManaged: 22, ordersMTD: 28, commissionMTD: 5450, status: "Active", lastActivity: "2026-03-22" },
  { id: "rep-3", name: "Derek Washington", territory: "Atlanta Metro", accountsManaged: 15, ordersMTD: 31, commissionMTD: 6200, status: "Active", lastActivity: "2026-03-21" },
  { id: "rep-4", name: "Natalie Tran", territory: "SoCal Inland", accountsManaged: 20, ordersMTD: 26, commissionMTD: 4900, status: "Active", lastActivity: "2026-03-21" },
  { id: "rep-5", name: "Brian Kowalski", territory: "Chicagoland", accountsManaged: 16, ordersMTD: 22, commissionMTD: 4100, status: "Active", lastActivity: "2026-03-20" },
  { id: "rep-6", name: "Amanda Reeves", territory: "Nashville / TN", accountsManaged: 12, ordersMTD: 19, commissionMTD: 3650, status: "Active", lastActivity: "2026-03-20" },
  { id: "rep-7", name: "Kevin O'Brien", territory: "Northeast OH", accountsManaged: 14, ordersMTD: 17, commissionMTD: 3200, status: "Active", lastActivity: "2026-03-19" },
  { id: "rep-8", name: "Maria Santos", territory: "Phoenix Metro", accountsManaged: 11, ordersMTD: 15, commissionMTD: 2800, status: "Active", lastActivity: "2026-03-18" },
  { id: "rep-9", name: "Tyler Jameson", territory: "Charlotte / NC", accountsManaged: 9, ordersMTD: 0, commissionMTD: 0, status: "On Leave", lastActivity: "2026-03-05" },
  { id: "rep-10", name: "Lisa Huang", territory: "Bay Area", accountsManaged: 0, ordersMTD: 0, commissionMTD: 0, status: "Inactive", lastActivity: "2026-02-14" },
];

export default function RepsPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && persona !== "dealer") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "dealer") return null;

  const filtered = reps.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.territory.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || r.status.toLowerCase().replace(" ", "-") === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Sales Reps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your field sales representatives, territories, and performance
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
          onClick={() => toast.success("Invitation sent!")}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Rep
        </Button>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reps or territories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
          />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="glass w-[160px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Rep</TableHead>
              <TableHead className="text-muted-foreground">Territory</TableHead>
              <TableHead className="text-muted-foreground text-center">Accounts</TableHead>
              <TableHead className="text-muted-foreground text-center">Orders MTD</TableHead>
              <TableHead className="text-muted-foreground text-right">Commission MTD</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rep) => (
              <TableRow
                key={rep.id}
                className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                onClick={() => router.push(`/reps/${rep.id}`)}
              >
                <TableCell className="font-medium text-foreground">
                  <Link
                    href={`/reps/${rep.id}`}
                    className="hover:text-indigo-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {rep.name}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{rep.territory}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {rep.accountsManaged}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {rep.ordersMTD}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {rep.commissionMTD > 0 ? `$${rep.commissionMTD.toLocaleString()}` : "--"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[rep.status]}
                  >
                    {rep.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(rep.lastActivity).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
