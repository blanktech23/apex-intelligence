"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Search,
  DollarSign,
  TrendingUp,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  { name: "Carlos Medina", territory: "Southeast FL", accountsManaged: 18, ordersMTD: 34, commissionMTD: 6800, status: "Active", lastActivity: "2026-03-22" },
  { name: "Jessica Palmer", territory: "DFW Metro", accountsManaged: 22, ordersMTD: 28, commissionMTD: 5450, status: "Active", lastActivity: "2026-03-22" },
  { name: "Derek Washington", territory: "Atlanta Metro", accountsManaged: 15, ordersMTD: 31, commissionMTD: 6200, status: "Active", lastActivity: "2026-03-21" },
  { name: "Natalie Tran", territory: "SoCal Inland", accountsManaged: 20, ordersMTD: 26, commissionMTD: 4900, status: "Active", lastActivity: "2026-03-21" },
  { name: "Brian Kowalski", territory: "Chicagoland", accountsManaged: 16, ordersMTD: 22, commissionMTD: 4100, status: "Active", lastActivity: "2026-03-20" },
  { name: "Amanda Reeves", territory: "Nashville / TN", accountsManaged: 12, ordersMTD: 19, commissionMTD: 3650, status: "Active", lastActivity: "2026-03-20" },
  { name: "Kevin O'Brien", territory: "Northeast OH", accountsManaged: 14, ordersMTD: 17, commissionMTD: 3200, status: "Active", lastActivity: "2026-03-19" },
  { name: "Maria Santos", territory: "Phoenix Metro", accountsManaged: 11, ordersMTD: 15, commissionMTD: 2800, status: "Active", lastActivity: "2026-03-18" },
  { name: "Tyler Jameson", territory: "Charlotte / NC", accountsManaged: 9, ordersMTD: 0, commissionMTD: 0, status: "On Leave", lastActivity: "2026-03-05" },
  { name: "Lisa Huang", territory: "Bay Area", accountsManaged: 0, ordersMTD: 0, commissionMTD: 0, status: "Inactive", lastActivity: "2026-02-14" },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Sales Reps</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your field sales representatives, territories, and performance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-zinc-900/50 border-zinc-800 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-zinc-500">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search reps or territories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600"
          />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-[140px] bg-zinc-900/50 border-zinc-800 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Rep</TableHead>
              <TableHead className="text-zinc-400">Territory</TableHead>
              <TableHead className="text-zinc-400 text-center">Accounts</TableHead>
              <TableHead className="text-zinc-400 text-center">Orders MTD</TableHead>
              <TableHead className="text-zinc-400 text-right">Commission MTD</TableHead>
              <TableHead className="text-zinc-400 text-center">Status</TableHead>
              <TableHead className="text-zinc-400 text-right">Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rep) => (
              <TableRow
                key={rep.name}
                className="border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer"
              >
                <TableCell className="font-medium text-white">
                  {rep.name}
                </TableCell>
                <TableCell className="text-zinc-300">{rep.territory}</TableCell>
                <TableCell className="text-center text-zinc-300">
                  {rep.accountsManaged}
                </TableCell>
                <TableCell className="text-center text-zinc-300">
                  {rep.ordersMTD}
                </TableCell>
                <TableCell className="text-right text-zinc-300">
                  ${rep.commissionMTD.toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={statusColors[rep.status]}
                  >
                    {rep.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-zinc-500 text-sm">
                  {rep.lastActivity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
