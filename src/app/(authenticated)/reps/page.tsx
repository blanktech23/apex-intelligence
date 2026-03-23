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
  ChevronDown,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  { label: "Commission Paid MTD", value: "$10.9K", icon: DollarSign, change: "+9.1% MoM", color: "text-purple-400" },
];

const defaultReps = [
  { id: "rep-1", name: "Carlos Medina", territory: "Southeast FL", accountsManaged: 18, ordersMTD: 34, commissionMTD: 2523, status: "Active", lastActivity: "2026-03-22" },
  { id: "rep-2", name: "Jessica Palmer", territory: "DFW Metro", accountsManaged: 22, ordersMTD: 28, commissionMTD: 1640, status: "Active", lastActivity: "2026-03-22" },
  { id: "rep-3", name: "Derek Washington", territory: "Atlanta Metro", accountsManaged: 15, ordersMTD: 31, commissionMTD: 1820, status: "Active", lastActivity: "2026-03-21" },
  { id: "rep-4", name: "Natalie Tran", territory: "SoCal Inland", accountsManaged: 20, ordersMTD: 26, commissionMTD: 1368, status: "Active", lastActivity: "2026-03-21" },
  { id: "rep-5", name: "Brian Kowalski", territory: "Chicagoland", accountsManaged: 16, ordersMTD: 22, commissionMTD: 1300, status: "Active", lastActivity: "2026-03-20" },
  { id: "rep-6", name: "Amanda Reeves", territory: "Nashville / TN", accountsManaged: 12, ordersMTD: 19, commissionMTD: 840, status: "Active", lastActivity: "2026-03-20" },
  { id: "rep-7", name: "Kevin O'Brien", territory: "Northeast OH", accountsManaged: 14, ordersMTD: 17, commissionMTD: 750, status: "Active", lastActivity: "2026-03-19" },
  { id: "rep-8", name: "Maria Santos", territory: "Phoenix Metro", accountsManaged: 11, ordersMTD: 15, commissionMTD: 660, status: "Active", lastActivity: "2026-03-18" },
  { id: "rep-9", name: "Tyler Jameson", territory: "Charlotte / NC", accountsManaged: 9, ordersMTD: 0, commissionMTD: 0, status: "On Leave", lastActivity: "2026-03-05" },
  { id: "rep-10", name: "Lisa Huang", territory: "Bay Area", accountsManaged: 0, ordersMTD: 0, commissionMTD: 0, status: "Inactive", lastActivity: "2026-02-14" },
];

const territories = [
  "Southeast FL",
  "DFW Metro",
  "Atlanta Metro",
  "SoCal Inland",
  "Chicagoland",
  "Nashville / TN",
  "Northeast OH",
  "Phoenix Metro",
  "Charlotte / NC",
  "Bay Area",
  "Central TX",
  "Pacific NW",
];

interface RepForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  territory: string;
  commissionRate: number;
  startDate: string;
  notes: string;
}

const defaultForm = (): RepForm => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  territory: "",
  commissionRate: 2.0,
  startDate: new Date().toISOString().split("T")[0],
  notes: "",
});

export default function RepsPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [reps, setReps] = useState(defaultReps);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<RepForm>(defaultForm());
  const [errors, setErrors] = useState<Record<string, boolean>>({});

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

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.firstName.trim()) newErrors.firstName = true;
    if (!form.lastName.trim()) newErrors.lastName = true;
    if (!form.email.trim()) newErrors.email = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const fullName = `${form.firstName} ${form.lastName}`;
    const newRep = {
      id: `rep-${reps.length + 1}`,
      name: fullName,
      territory: form.territory || "Unassigned",
      accountsManaged: 0,
      ordersMTD: 0,
      commissionMTD: 0,
      status: "Active",
      lastActivity: new Date().toISOString().split("T")[0],
    };

    setReps((prev) => [newRep, ...prev]);
    setDialogOpen(false);
    setForm(defaultForm());
    setErrors({});
    toast.success(`Invitation sent to ${fullName}`);
  };

  const updateField = (field: keyof RepForm, value: string | number) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: false }));
  };

  const inputClass = "glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60";
  const errorClass = "border-red-500/50 ring-1 ring-red-500/30";

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
          onClick={() => setDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Rep
        </Button>
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
          {expandedCard === "Total Reps" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Breakdown by Status</h3>
              <div className="space-y-3">
                {[
                  { status: "Active", count: 11, color: "text-emerald-400" },
                  { status: "On Leave", count: 1, color: "text-amber-400" },
                  { status: "Inactive", count: 2, color: "text-zinc-400" },
                ].map((row) => (
                  <div key={row.status} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${row.color.replace("text-", "bg-")}`} />
                      <p className="text-sm text-foreground">{row.status}</p>
                    </div>
                    <span className={`text-sm font-medium ${row.color}`}>{row.count}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <span className="text-sm font-bold text-indigo-400">14</span>
                </div>
              </div>
            </div>
          )}
          {expandedCard === "Active Territories" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Territory Assignments</h3>
              <div className="space-y-3">
                {[
                  { territory: "Southeast FL", rep: "Carlos Medina" },
                  { territory: "DFW Metro", rep: "Jessica Palmer" },
                  { territory: "Atlanta Metro", rep: "Derek Washington" },
                  { territory: "SoCal Inland", rep: "Natalie Tran" },
                  { territory: "Chicagoland", rep: "Brian Kowalski" },
                  { territory: "Nashville / TN", rep: "Amanda Reeves" },
                  { territory: "Northeast OH", rep: "Kevin O'Brien" },
                  { territory: "Phoenix Metro", rep: "Maria Santos" },
                  { territory: "Central TX", rep: "Unassigned" },
                  { territory: "Pacific NW", rep: "Unassigned" },
                  { territory: "Bay Area", rep: "Unassigned" },
                ].map((row) => (
                  <div key={row.territory} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground">{row.territory}</p>
                    <span className={`text-sm ${row.rep === "Unassigned" ? "text-muted-foreground italic" : "text-emerald-400 font-medium"}`}>{row.rep}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expandedCard === "Orders Placed MTD" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 Reps by Order Count</h3>
              <div className="space-y-3">
                {[
                  { rep: "Carlos Medina", orders: 34 },
                  { rep: "Derek Washington", orders: 31 },
                  { rep: "Jessica Palmer", orders: 28 },
                  { rep: "Natalie Tran", orders: 26 },
                  { rep: "Brian Kowalski", orders: 22 },
                ].map((row, i) => (
                  <div key={row.rep} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <p className="text-sm text-foreground">{row.rep}</p>
                    </div>
                    <span className="text-sm font-medium text-amber-400">{row.orders} orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {expandedCard === "Commission Paid MTD" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 Reps by Commission Earned</h3>
              <div className="space-y-3">
                {[
                  { rep: "Carlos Medina", commission: "$2,523" },
                  { rep: "Derek Washington", commission: "$1,820" },
                  { rep: "Jessica Palmer", commission: "$1,640" },
                  { rep: "Natalie Tran", commission: "$1,368" },
                  { rep: "Brian Kowalski", commission: "$1,300" },
                ].map((row, i) => (
                  <div key={row.rep} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <p className="text-sm text-foreground">{row.rep}</p>
                    </div>
                    <span className="text-sm font-medium text-purple-400">{row.commission}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {/* Invite Rep Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <UserPlus className="h-4 w-4 text-indigo-400" />
              </div>
              Invite Sales Rep
            </DialogTitle>
            <DialogDescription>
              Send an invitation to a new sales representative.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  First Name <span className="text-red-400">*</span>
                </label>
                <Input placeholder="First name" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} className={`${inputClass} ${errors.firstName ? errorClass : ""}`} />
                {errors.firstName && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <Input placeholder="Last name" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} className={`${inputClass} ${errors.lastName ? errorClass : ""}`} />
                {errors.lastName && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Email <span className="text-red-400">*</span>
                </label>
                <Input type="email" placeholder="rep@company.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={`${inputClass} ${errors.email ? errorClass : ""}`} />
                {errors.email && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <Input type="tel" placeholder="(555) 555-0000" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
              </div>
            </div>

            <Separator className="bg-border" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Assigned Territory</label>
                <Select value={form.territory} onValueChange={(v) => updateField("territory", v ?? "")}>
                  <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue placeholder="Select territory" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    {territories.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Commission Rate (%)</label>
                <Input type="number" min={0} max={100} step={0.1} value={form.commissionRate} onChange={(e) => updateField("commissionRate", parseFloat(e.target.value) || 0)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
              <Input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea
                placeholder="Additional notes..."
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                rows={2}
                className={`w-full rounded-lg px-2.5 py-1.5 text-sm resize-none ${inputClass}`}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => { setDialogOpen(false); setForm(defaultForm()); setErrors({}); }}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleSubmit}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
