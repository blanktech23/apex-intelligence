"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Filter,
  TrendingUp,
  FolderKanban,
  DollarSign,
  Zap,
  ChevronRight,
  ChevronDown,
  X,
  ArrowLeft,
  User,
  Briefcase,
  Tag,
  Building2,
} from "lucide-react";
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

import {
  contacts,
  deals,
  CONTACT_TYPES,
  getContactTypeConfig,
  getContactsByType,
  getDealsByContact,
  getPipelineStats,
  type Contact,
  type ContactType,
} from "@/lib/crm-data";

const ITEMS_PER_PAGE = 10;

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lead: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

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

interface NewContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  contactType: ContactType | "";
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

const emptyForm: NewContactForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  companyName: "",
  contactType: "",
  website: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  status: "lead",
  assignedRep: "Unassigned",
  source: "",
  notes: "",
  tags: [],
};

export default function ContactsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<NewContactForm>({ ...emptyForm });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const updateField = useCallback(
    <K extends keyof NewContactForm>(key: K, value: NewContactForm[K]) => {
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
    if (!form.contactType) newErrors.contactType = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setAddOpen(false);
    setForm({ ...emptyForm });
    setErrors({});
    setTagInput("");
    toast.success(`Contact added — ${form.firstName} ${form.lastName}`);
  }, [form]);

  const handleClose = useCallback(() => {
    setAddOpen(false);
    setForm({ ...emptyForm });
    setErrors({});
    setTagInput("");
  }, []);

  // Compute stats from crm-data
  const pipelineStats = useMemo(() => getPipelineStats(), []);

  const activeDealsCount = useMemo(
    () => deals.filter((d) => d.dealStatus === "open").length,
    []
  );

  const avgSpeedToLead = useMemo(() => {
    const withSpeed = contacts.filter((c) => c.speedToLead !== null);
    if (withSpeed.length === 0) return 0;
    return Math.round(
      withSpeed.reduce((sum, c) => sum + c.speedToLead!, 0) / withSpeed.length
    );
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Total Contacts",
        value: String(contacts.length),
        icon: CONTACT_TYPES[0].icon,
        change: `${CONTACT_TYPES.map((t) => `${getContactsByType(t.key).length} ${t.label}`).join(", ")}`,
        color: "text-indigo-400",
      },
      {
        label: "Active Deals",
        value: String(activeDealsCount),
        icon: FolderKanban,
        change: "View pipeline",
        color: "text-emerald-400",
        link: "/crm/deals",
      },
      {
        label: "Pipeline Value",
        value: `$${(pipelineStats.totalPipelineValue / 1000).toFixed(0)}K`,
        icon: DollarSign,
        change: `Weighted: $${(pipelineStats.weightedValue / 1000).toFixed(0)}K`,
        color: "text-amber-400",
      },
      {
        label: "Speed-to-Lead",
        value: `${avgSpeedToLead} min`,
        icon: Zap,
        change: "Avg first response time",
        color: "text-purple-400",
      },
    ],
    [activeDealsCount, pipelineStats, avgSpeedToLead]
  );

  // Filter contacts
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || c.status === statusFilter;
      const matchesType = typeFilter === "all" || c.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedContacts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  if (loading) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-9 w-44 bg-muted/40" />
            <Skeleton className="mt-2 h-4 w-64 bg-muted/30" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md bg-muted/30" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass border-border p-5 rounded-xl space-y-2">
              <Skeleton className="h-3 w-28 bg-muted/20" />
              <Skeleton className="h-7 w-16 bg-muted/40" />
              <Skeleton className="h-3 w-24 bg-muted/20" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-md bg-muted/30" />
          <Skeleton className="h-10 w-[160px] rounded-md bg-muted/20" />
          <Skeleton className="h-10 w-[160px] rounded-md bg-muted/20" />
        </div>
        <Separator className="bg-border" />
        <Card className="glass border-border overflow-hidden">
          <div className="border-b border-border px-4 py-3 flex gap-6">
            {["w-32", "w-40", "w-20", "w-44", "w-28", "w-16", "w-20", "w-24"].map((w, i) => (
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
              <Skeleton className="h-5 w-20 rounded-full bg-muted/20" />
              <Skeleton className="h-4 w-44 bg-muted/15" />
              <Skeleton className="h-4 w-28 bg-muted/15" />
              <Skeleton className="h-5 w-16 rounded-full bg-muted/20" />
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
      {/* Back link */}
      <Link
        href="/crm"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to CRM
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage contacts and track relationships across all types
          </p>
        </div>
        <Button
          className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={`glass border-border p-5 cursor-pointer transition-all duration-200 hover:bg-foreground/[0.03] ${
              expandedCard === stat.label
                ? "ring-1 ring-indigo-500/30 border-indigo-500/20"
                : ""
            }`}
            onClick={() =>
              setExpandedCard(expandedCard === stat.label ? null : stat.label)
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`mt-1 text-xs ${stat.color}`}>{stat.change}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl bg-foreground/5 p-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                    expandedCard === stat.label ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Expanded Card Detail Panel */}
      {expandedCard && (
        <div className="glass border-border rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {expandedCard === "Total Contacts" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Breakdown by Type
              </h3>
              <div className="space-y-3">
                {CONTACT_TYPES.map((ct) => {
                  const count = getContactsByType(ct.key).length;
                  const TypeIcon = ct.icon;
                  return (
                    <div
                      key={ct.key}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-4 w-4 ${ct.color}`} />
                        <p className="text-sm text-foreground">{ct.label}</p>
                      </div>
                      <span className={`text-sm font-medium ${ct.color}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <span className="text-sm font-bold text-indigo-400">
                    {contacts.length}
                  </span>
                </div>
              </div>
            </div>
          )}
          {expandedCard === "Active Deals" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Open Deals by Stage
              </h3>
              <div className="space-y-3">
                {deals
                  .filter((d) => d.dealStatus === "open")
                  .slice(0, 5)
                  .map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0 cursor-pointer hover:bg-foreground/[0.03] rounded px-2 -mx-2"
                      onClick={() => router.push(`/crm/deals/${deal.id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {deal.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.assignedTo}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-emerald-400">
                        ${deal.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
              <Link
                href="/crm/deals"
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-3 transition-colors"
              >
                View all deals
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          {expandedCard === "Pipeline Value" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Pipeline Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Total Pipeline",
                    value: pipelineStats.totalPipelineValue,
                  },
                  {
                    label: "Weighted Pipeline",
                    value: pipelineStats.weightedValue,
                  },
                  {
                    label: "Won This Month",
                    value: pipelineStats.wonValue,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <p className="text-sm text-foreground">{row.label}</p>
                    <span className="text-sm font-medium text-amber-400">
                      ${row.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expandedCard === "Speed-to-Lead" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Response Times
              </h3>
              <div className="space-y-3">
                {contacts
                  .filter((c) => c.speedToLead !== null)
                  .sort((a, b) => a.speedToLead! - b.speedToLead!)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.company || "Homeowner"}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          c.speedToLead! <= 5
                            ? "text-emerald-400"
                            : c.speedToLead! <= 15
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {c.speedToLead} min
                      </span>
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
            placeholder="Search by name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => v && setTypeFilter(v)}
        >
          <SelectTrigger className="glass w-[180px] border-border bg-foreground/5 text-foreground">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Types</SelectItem>
            {CONTACT_TYPES.map((ct) => (
              <SelectItem key={ct.key} value={ct.key}>
                {ct.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v)}
        >
          <SelectTrigger className="glass w-[160px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      {/* Contacts Table - Desktop */}
      <Card className="glass border-border overflow-hidden hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Phone</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Revenue
              </TableHead>
              <TableHead className="text-muted-foreground">
                Last Contact
              </TableHead>
              <TableHead className="text-muted-foreground w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContacts.map((contact) => {
              const typeConfig = getContactTypeConfig(contact.type);
              const TypeIcon = typeConfig.icon;
              return (
                <TableRow
                  key={contact.id}
                  className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer group"
                  onClick={() => router.push(`/crm/contacts/${contact.id}`)}
                >
                  <TableCell>
                    <Link
                      href={`/crm/contacts/${contact.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-indigo-500/20 text-xs text-indigo-300">
                          {contact.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground group-hover:text-indigo-300 transition-colors">
                        {contact.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.company || "--"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${typeConfig.bgColor} ${typeConfig.color} border-transparent gap-1`}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.phone}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColors[contact.status]}
                    >
                      {contact.status.charAt(0).toUpperCase() +
                        contact.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {contact.totalRevenue > 0
                      ? `$${contact.totalRevenue.toLocaleString()}`
                      : "--"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(contact.lastContactDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedContacts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-12"
                >
                  No contacts match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Contacts Cards - Mobile */}
      <div className="space-y-3 md:hidden">
        {paginatedContacts.map((contact) => {
          const typeConfig = getContactTypeConfig(contact.type);
          const TypeIcon = typeConfig.icon;
          return (
            <Card
              key={contact.id}
              className="glass border-border p-4 cursor-pointer hover:bg-foreground/[0.03] transition-colors"
              onClick={() => router.push(`/crm/contacts/${contact.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-indigo-500/20 text-sm text-indigo-300">
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {contact.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contact.company || "Homeowner"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={statusColors[contact.status]}>
                  {contact.status.charAt(0).toUpperCase() +
                    contact.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`${typeConfig.bgColor} ${typeConfig.color} border-transparent gap-1 text-xs`}
                >
                  <TypeIcon className="h-3 w-3" />
                  {typeConfig.label}
                </Badge>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-muted-foreground">{contact.email}</p>
                <p className="text-muted-foreground">{contact.phone}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium text-foreground">
                    {contact.totalRevenue > 0
                      ? `$${contact.totalRevenue.toLocaleString()}`
                      : "--"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
            </Card>
          );
        })}
        {paginatedContacts.length === 0 && (
          <Card className="glass border-border p-8 text-center text-muted-foreground">
            No contacts match your filters.
          </Card>
        )}
      </div>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* Add Contact Modal */}
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
              Add New Contact
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new contact record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2 max-h-[60vh] overflow-y-auto">
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
                      errors.firstName
                        ? "border-red-500/50 ring-1 ring-red-500/30"
                        : ""
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
                      errors.lastName
                        ? "border-red-500/50 ring-1 ring-red-500/30"
                        : ""
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
                      errors.email
                        ? "border-red-500/50 ring-1 ring-red-500/30"
                        : ""
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

            {/* Company & Type */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Company & Type
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Company Name
                  </label>
                  <Input
                    placeholder="Company name (optional for homeowners)"
                    value={form.companyName}
                    onChange={(e) =>
                      updateField("companyName", e.target.value)
                    }
                    className="glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Contact Type <span className="text-red-400">*</span>
                  </label>
                  <Select
                    value={form.contactType}
                    onValueChange={(v) =>
                      updateField("contactType", v as ContactType)
                    }
                  >
                    <SelectTrigger
                      className={`glass border-border bg-foreground/5 text-foreground ${
                        errors.contactType
                          ? "border-red-500/50 ring-1 ring-red-500/30"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      {CONTACT_TYPES.map((ct) => {
                        const Icon = ct.icon;
                        return (
                          <SelectItem key={ct.key} value={ct.key}>
                            <span className="flex items-center gap-2">
                              <Icon className={`h-3.5 w-3.5 ${ct.color}`} />
                              {ct.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.contactType && (
                    <p className="text-xs text-red-400 mt-1">Required</p>
                  )}
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
                    onValueChange={(v) =>
                      updateField("status", v ?? "lead")
                    }
                  >
                    <SelectTrigger className="glass border-border bg-foreground/5 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-border bg-popover">
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Assigned Rep
                  </label>
                  <Select
                    value={form.assignedRep}
                    onValueChange={(v) =>
                      updateField("assignedRep", v ?? "Unassigned")
                    }
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
                    placeholder="Any relevant notes about this contact..."
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
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
