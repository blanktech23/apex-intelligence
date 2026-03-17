"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  Filter,
  TrendingUp,
  FolderKanban,
  DollarSign,
  Star,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Lead: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const stats = [
  {
    label: "Total Customers",
    value: "342",
    icon: Users,
    change: "+12 this month",
    color: "text-indigo-400",
  },
  {
    label: "Active Projects",
    value: "47",
    icon: FolderKanban,
    change: "+5 this week",
    color: "text-emerald-400",
  },
  {
    label: "Monthly Revenue",
    value: "$284K",
    icon: DollarSign,
    change: "+8.2% MoM",
    color: "text-amber-400",
  },
  {
    label: "Avg Satisfaction",
    value: "4.6/5",
    icon: Star,
    change: "+0.3 vs last quarter",
    color: "text-purple-400",
  },
];

const customers = [
  {
    id: "cust-001",
    name: "Marcus Rivera",
    company: "Rivera General Contracting",
    email: "marcus@riveragc.com",
    phone: "(512) 555-0147",
    status: "Active",
    projects: 4,
    revenue: 128500,
    lastContact: "2026-03-14",
    initials: "MR",
  },
  {
    id: "cust-002",
    name: "Sarah Chen",
    company: "Summit Builders LLC",
    email: "sarah@summitbuilders.com",
    phone: "(512) 555-0293",
    status: "Active",
    projects: 3,
    revenue: 95200,
    lastContact: "2026-03-13",
    initials: "SC",
  },
  {
    id: "cust-003",
    name: "James Thornton",
    company: "Thornton Roofing & Siding",
    email: "james@thorntonroof.com",
    phone: "(737) 555-0182",
    status: "Lead",
    projects: 0,
    revenue: 0,
    lastContact: "2026-03-12",
    initials: "JT",
  },
  {
    id: "cust-004",
    name: "Olivia Martinez",
    company: "Lone Star Foundations",
    email: "olivia@lonestarfound.com",
    phone: "(512) 555-0361",
    status: "Active",
    projects: 2,
    revenue: 67800,
    lastContact: "2026-03-11",
    initials: "OM",
  },
  {
    id: "cust-005",
    name: "David Park",
    company: "Parkway Electrical Services",
    email: "david@parkwayelectric.com",
    phone: "(737) 555-0429",
    status: "Active",
    projects: 5,
    revenue: 214300,
    lastContact: "2026-03-14",
    initials: "DP",
  },
  {
    id: "cust-006",
    name: "Angela Foster",
    company: "BlueLine Plumbing Co.",
    email: "angela@bluelineplumb.com",
    phone: "(512) 555-0518",
    status: "Inactive",
    projects: 1,
    revenue: 32400,
    lastContact: "2026-02-20",
    initials: "AF",
  },
  {
    id: "cust-007",
    name: "Robert Nguyen",
    company: "Harbor View Construction",
    email: "robert@harborviewcon.com",
    phone: "(512) 555-0674",
    status: "Active",
    projects: 3,
    revenue: 156700,
    lastContact: "2026-03-10",
    initials: "RN",
  },
  {
    id: "cust-008",
    name: "Karen Whitfield",
    company: "Whitfield Custom Homes",
    email: "karen@whitfieldhomes.com",
    phone: "(737) 555-0785",
    status: "Lead",
    projects: 0,
    revenue: 0,
    lastContact: "2026-03-15",
    initials: "KW",
  },
  {
    id: "cust-009",
    name: "Michael Brooks",
    company: "Brooks Concrete & Masonry",
    email: "michael@brooksconcrete.com",
    phone: "(512) 555-0892",
    status: "Active",
    projects: 6,
    revenue: 289100,
    lastContact: "2026-03-13",
    initials: "MB",
  },
  {
    id: "cust-010",
    name: "Linda Castillo",
    company: "Castillo Landscape Design",
    email: "linda@castillodesign.com",
    phone: "(737) 555-0936",
    status: "Active",
    projects: 2,
    revenue: 48900,
    lastContact: "2026-03-09",
    initials: "LC",
  },
];

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || c.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your clients and track relationships
          </p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="glass border-border p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`mt-1 text-xs ${stat.color}`}>
                  {stat.change}
                </p>
              </div>
              <div className="rounded-xl bg-foreground/5 p-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
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
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      {/* Customers Table */}
      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-center">
                Projects
              </TableHead>
              <TableHead className="text-muted-foreground text-right">
                Total Revenue
              </TableHead>
              <TableHead className="text-muted-foreground">Last Contact</TableHead>
              <TableHead className="text-muted-foreground w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow
                key={customer.id}
                className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer group"
                onClick={() => router.push(`/customers/${customer.id}`)}
              >
                <TableCell>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarFallback className="bg-indigo-500/20 text-xs text-indigo-300">
                        {customer.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground group-hover:text-indigo-300 transition-colors">
                      {customer.name}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.company}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.email}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.phone}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColors[customer.status]}
                  >
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {customer.projects}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {customer.revenue > 0
                    ? `$${customer.revenue.toLocaleString()}`
                    : "--"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(customer.lastContact).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Link href={`/customers/${customer.id}`}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
