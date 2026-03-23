"use client";

import { useState, useEffect, useCallback } from "react";
import { PaginationBar } from "@/components/ui/pagination-bar";
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
  ChevronDown,
  X,
  Building2,
  User,
  Briefcase,
  Tag,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
    value: "$127.4K",
    icon: DollarSign,
    change: "+8% MoM",
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

const initialCustomers = [
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
    company: "Lone Star Renovations",
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
    company: "Parkway Home Design",
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
    company: "BlueLine Kitchen Studio",
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
    company: "Brooks Design-Build",
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

const companyTypes = [
  "Contractor / Remodeler",
  "Design-Build Firm",
  "General Contractor",
  "Kitchen & Bath Showroom",
  "Custom Home Builder",
  "Other",
];

const sourceOptions = [
  "Referral",
  "Trade Show",
  "Website",
  "Cold Outreach",
  "Partner",
  "Other",
];

const repOptions = [
  "Unassigned",
  "Jordan Mitchell",
  "Priya Sharma",
  "Alex Thompson",
  "Casey Rodriguez",
];

const suggestedTags = [
  "K&B",
  "High Volume",
  "New Construction",
  "Remodel",
  "Commercial",
  "Residential",
  "VIP",
  "Austin Metro",
];

interface NewCustomerForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  companyType: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  assignedRep: string;
  source: string;
  notes: string;
  tags: string[];
}

const emptyForm: NewCustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  companyName: "",
  companyType: "",
  website: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  status: "Lead",
  assignedRep: "Unassigned",
  source: "",
  notes: "",
  tags: [],
};

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState(initialCustomers);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<NewCustomerForm>({ ...emptyForm });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const updateField = useCallback(
    <K extends keyof NewCustomerForm>(key: K, value: NewCustomerForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: false }));
    },
    []
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !form.tags.includes(trimmed)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      }
      setTagInput("");
    },
    [form.tags]
  );

  const removeTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, boolean> = {};
    if (!form.firstName.trim()) newErrors.firstName = true;
    if (!form.lastName.trim()) newErrors.lastName = true;
    if (!form.email.trim()) newErrors.email = true;
    if (!form.companyName.trim()) newErrors.companyName = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const initials =
      form.firstName.charAt(0).toUpperCase() +
      form.lastName.charAt(0).toUpperCase();
    const today = new Date().toISOString().split("T")[0];

    const newCustomer = {
      id: `cust-${String(customers.length + 1).padStart(3, "0")}`,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      company: form.companyName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || "--",
      status: form.status,
      projects: 0,
      revenue: 0,
      lastContact: today,
      initials,
    };

    setCustomers((prev) => [newCustomer, ...prev]);
    setAddOpen(false);
    setForm({ ...emptyForm });
    setErrors({});
    setTagInput("");
    toast.success(`Customer added — ${newCustomer.company}`);
  }, [form, customers.length]);

  const handleClose = useCallback(() => {
    setAddOpen(false);
    setForm({ ...emptyForm });
    setErrors({});
    setTagInput("");
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || c.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-9 w-44 bg-muted/40" />
            <Skeleton className="mt-2 h-4 w-64 bg-muted/30" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md bg-muted/30" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass border-border p-5 rounded-xl space-y-2">
              <Skeleton className="h-3 w-28 bg-muted/20" />
              <Skeleton className="h-7 w-16 bg-muted/40" />
              <Skeleton className="h-3 w-24 bg-muted/20" />
            </div>
          ))}
        </div>

        {/* Search skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md bg-muted/30" />
          <Skeleton className="h-10 w-[160px] rounded-md bg-muted/20" />
        </div>

        <Separator className="bg-border" />

        {/* Table skeleton */}
        <Card className="glass border-border overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex gap-6">
            {["w-32", "w-40", "w-44", "w-28", "w-16", "w-16", "w-24", "w-24"].map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w} bg-muted/20`} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 border-b border-border/50 px-4 py-3">
              <div className="flex items-center gap-3 w-32">
                <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
                <Skeleton className="h-4 w-24 bg-muted/20" />
              </div>
              <Skeleton className="h-4 w-40 bg-muted/15" />
              <Skeleton className="h-4 w-44 bg-muted/15" />
              <Skeleton className="h-4 w-28 bg-muted/15" />
              <Skeleton className="h-5 w-16 rounded-full bg-muted/20" />
              <Skeleton className="h-4 w-8 bg-muted/15" />
              <Skeleton className="h-4 w-20 bg-muted/20" />
              <Skeleton className="h-4 w-20 bg-muted/15" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your clients and track relationships
          </p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`glass border-border p-5 cursor-pointer transition-all duration-200 hover:bg-foreground/[0.03] ${expandedCard === stat.label ? "ring-1 ring-indigo-500/30 border-indigo-500/20" : ""}`}
            onClick={() => setExpandedCard(expandedCard === stat.label ? null : stat.label)}
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
          {expandedCard === "Total Customers" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Breakdown by Type</h3>
              <div className="space-y-3">
                {[
                  { type: "Contractors", count: 142 },
                  { type: "Design-Build", count: 86 },
                  { type: "Showrooms", count: 64 },
                  { type: "Custom Builders", count: 50 },
                ].map((row) => (
                  <div key={row.type} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground">{row.type}</p>
                    <span className="text-sm font-medium text-indigo-400">{row.count}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <span className="text-sm font-bold text-indigo-400">342</span>
                </div>
              </div>
            </div>
          )}
          {expandedCard === "Active Projects" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 Active Projects</h3>
              <div className="space-y-3">
                {[
                  { customer: "Michael Brooks", project: "Lakeside Kitchen Remodel", value: "$89,100" },
                  { customer: "David Park", project: "Modern Bathroom Suite", value: "$72,300" },
                  { customer: "Robert Nguyen", project: "Custom Cabinetry Install", value: "$56,700" },
                  { customer: "Marcus Rivera", project: "Commercial Kitchen Build", value: "$48,500" },
                  { customer: "Sarah Chen", project: "Countertop Replacement", value: "$35,200" },
                ].map((row) => (
                  <div key={row.project} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.project}</p>
                      <p className="text-xs text-muted-foreground">{row.customer}</p>
                    </div>
                    <span className="text-sm font-medium text-emerald-400">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expandedCard === "Monthly Revenue" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Revenue by Customer Type</h3>
              <div className="space-y-3">
                {[
                  { type: "Contractors", revenue: "$52,800" },
                  { type: "Design-Build", revenue: "$38,400" },
                  { type: "Showrooms", revenue: "$22,600" },
                  { type: "Custom Builders", revenue: "$13,600" },
                ].map((row) => (
                  <div key={row.type} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground">{row.type}</p>
                    <span className="text-sm font-medium text-amber-400">{row.revenue}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <span className="text-sm font-bold text-amber-400">$127,400</span>
                </div>
              </div>
            </div>
          )}
          {expandedCard === "Avg Satisfaction" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Recent Satisfaction Ratings</h3>
              <div className="space-y-3">
                {[
                  { customer: "Marcus Rivera", company: "Rivera General Contracting", rating: 5.0 },
                  { customer: "Sarah Chen", company: "Summit Builders LLC", rating: 4.8 },
                  { customer: "Michael Brooks", company: "Brooks Design-Build", rating: 4.7 },
                  { customer: "David Park", company: "Parkway Home Design", rating: 4.5 },
                  { customer: "Robert Nguyen", company: "Harbor View Construction", rating: 4.2 },
                ].map((row) => (
                  <div key={row.customer} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.customer}</p>
                      <p className="text-xs text-muted-foreground">{row.company}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-purple-400 fill-purple-400" />
                      <span className="text-sm font-medium text-purple-400">{row.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Customers Table - Desktop */}
      <Card className="glass border-border overflow-hidden hidden md:block">
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

      {/* Customers Cards - Mobile */}
      <div className="space-y-3 md:hidden">
        {filtered.map((customer) => (
          <Card
            key={customer.id}
            className="glass border-border p-4 cursor-pointer hover:bg-foreground/[0.03] transition-colors"
            onClick={() => router.push(`/customers/${customer.id}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-indigo-500/20 text-sm text-indigo-300">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{customer.name}</p>
                  <p className="text-xs text-muted-foreground">{customer.company}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={statusColors[customer.status]}
              >
                {customer.status}
              </Badge>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-muted-foreground">{customer.email}</p>
              <p className="text-muted-foreground">{customer.phone}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-medium text-foreground">
                  {customer.revenue > 0
                    ? `$${customer.revenue.toLocaleString()}`
                    : "--"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalItems={342}
        itemsPerPage={25}
        onPageChange={setCurrentPage}
      />

      {/* Add Customer Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="sm:max-w-2xl glass-strong border-border bg-background"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Plus className="h-4 w-4 text-indigo-400" />
              </div>
              Add New Customer
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new customer record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Contact Information
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={`glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60 ${
                      errors.firstName ? "border-red-500/50 ring-1 ring-red-500/30" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-400 mt-1">Required</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={`glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60 ${
                      errors.lastName ? "border-red-500/50 ring-1 ring-red-500/30" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-400 mt-1">Required</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="email@company.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={`glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60 ${
                      errors.email ? "border-red-500/50 ring-1 ring-red-500/30" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">Required</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 555-0000"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Job Title / Role
                  </label>
                  <Input
                    placeholder="e.g. Owner, Project Manager, Designer"
                    value={form.jobTitle}
                    onChange={(e) => updateField("jobTitle", e.target.value)}
                    className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Company Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Company Information
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    placeholder="Company name"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className={`glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60 ${
                      errors.companyName ? "border-red-500/50 ring-1 ring-red-500/30" : ""
                    }`}
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-400 mt-1">Required</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Company Type
                  </label>
                  <Select
                    value={form.companyType}
                    onValueChange={(v) => updateField("companyType", v ?? "")}
                  >
                    <SelectTrigger className="glass border-border bg-foreground/5 text-foreground">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      {companyTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Website
                  </label>
                  <Input
                    placeholder="https://company.com"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Street Address
                  </label>
                  <Input
                    placeholder="123 Main St, Suite 100"
                    value={form.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    City
                  </label>
                  <Input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      State
                    </label>
                    <Input
                      placeholder="TX"
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Zip
                    </label>
                    <Input
                      placeholder="78701"
                      value={form.zip}
                      onChange={(e) => updateField("zip", e.target.value)}
                      className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Account Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Details
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Status
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => updateField("status", v ?? "Lead")}
                  >
                    <SelectTrigger className="glass border-border bg-foreground/5 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Assigned Rep
                  </label>
                  <Select
                    value={form.assignedRep}
                    onValueChange={(v) => updateField("assignedRep", v ?? "Unassigned")}
                  >
                    <SelectTrigger className="glass border-border bg-foreground/5 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      {repOptions.map((rep) => (
                        <SelectItem key={rep} value={rep}>
                          {rep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Source
                  </label>
                  <Select
                    value={form.source}
                    onValueChange={(v) => updateField("source", v ?? "")}
                  >
                    <SelectTrigger className="glass border-border bg-foreground/5 text-foreground">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      {sourceOptions.map((src) => (
                        <SelectItem key={src} value={src}>
                          {src}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Notes
                  </label>
                  <textarea
                    placeholder="Any relevant notes about this customer..."
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                    className="w-full rounded-md glass border border-border bg-foreground/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </h3>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 cursor-pointer hover:border-red-500/30 group transition-colors"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400" />
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:text-foreground"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {suggestedTags
                  .filter((t) => !form.tags.includes(t))
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-foreground/5 text-muted-foreground border-border cursor-pointer hover:bg-foreground/10 hover:text-foreground transition-colors text-xs"
                      onClick={() => addTag(tag)}
                    >
                      <Plus className="h-2.5 w-2.5 mr-0.5" />
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-border bg-foreground/[0.02]">
            <Button
              variant="outline"
              className="border-border text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              onClick={handleSubmit}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
