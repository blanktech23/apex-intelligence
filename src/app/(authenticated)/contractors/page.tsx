"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HardHat,
  Search,
  Plus,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Building2,
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
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const stats = [
  { label: "Total Contractors", value: "86", icon: HardHat, change: "+4 this month", color: "text-indigo-400" },
  { label: "Active Accounts", value: "72", icon: Users, change: "84% of total", color: "text-emerald-400" },
  { label: "Orders MTD", value: "134", icon: ShoppingCart, change: "+18% vs last month", color: "text-amber-400" },
  { label: "Revenue MTD", value: "$127.4K", icon: DollarSign, change: "+8% MoM", color: "text-purple-400" },
];

const defaultContractors = [
  { id: "contractor-1", company: "Rivera General Contracting", contact: "Marcus Rivera", ordersMTD: 12, revenueMTD: 42800, status: "Active", lastOrder: "2026-03-20" },
  { id: "contractor-2", company: "Summit Builders LLC", contact: "Sarah Chen", ordersMTD: 8, revenueMTD: 31200, status: "Active", lastOrder: "2026-03-19" },
  { id: "contractor-3", company: "Harbor View Construction", contact: "Robert Nguyen", ordersMTD: 6, revenueMTD: 24500, status: "Active", lastOrder: "2026-03-18" },
  { id: "contractor-4", company: "Brooks Design-Build", contact: "Michael Brooks", ordersMTD: 15, revenueMTD: 58300, status: "Active", lastOrder: "2026-03-17" },
  { id: "contractor-5", company: "Whitfield Custom Homes", contact: "Karen Whitfield", ordersMTD: 3, revenueMTD: 18700, status: "Pending", lastOrder: "2026-03-16" },
  { id: "contractor-6", company: "Lone Star Renovations", contact: "Olivia Martinez", ordersMTD: 9, revenueMTD: 36100, status: "Active", lastOrder: "2026-03-16" },
  { id: "contractor-7", company: "Parkway Home Design", contact: "David Park", ordersMTD: 4, revenueMTD: 8200, status: "Active", lastOrder: "2026-03-15" },
  { id: "contractor-8", company: "BlueLine Kitchen Studio", contact: "Angela Foster", ordersMTD: 0, revenueMTD: 0, status: "Inactive", lastOrder: "2026-02-20" },
];

interface ContractorForm {
  company: string;
  contact: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  status: string;
  notes: string;
}

const defaultForm = (): ContractorForm => ({
  company: "",
  contact: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  type: "general",
  status: "active",
  notes: "",
});

export default function ContractorsPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [contractors, setContractors] = useState(defaultContractors);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ContractorForm>(defaultForm());
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && persona !== "dealer") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "dealer") return null;

  const filtered = contractors.filter((c) => {
    const matchesSearch = c.company.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || c.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.company.trim()) newErrors.company = true;
    if (!form.contact.trim()) newErrors.contact = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const statusMap: Record<string, string> = { active: "Active", pending: "Pending" };
    const newContractor = {
      id: `contractor-${contractors.length + 1}`,
      company: form.company,
      contact: form.contact,
      ordersMTD: 0,
      revenueMTD: 0,
      status: statusMap[form.status] || "Pending",
      lastOrder: new Date().toISOString().split("T")[0],
    };

    setContractors((prev) => [newContractor, ...prev]);
    setDialogOpen(false);
    setForm(defaultForm());
    setErrors({});
    toast.success(`${form.company} added to contractor accounts`);
  };

  const updateField = (field: keyof ContractorForm, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: false }));
  };

  const inputClass = "glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60";
  const errorClass = "border-red-500/50 ring-1 ring-red-500/30";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Contractor Accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your contractor relationships and order history</p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Contractor
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
          <Input placeholder="Search contractors..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50" />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="glass w-[160px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Contact</TableHead>
              <TableHead className="text-muted-foreground text-center">Orders MTD</TableHead>
              <TableHead className="text-muted-foreground text-right">Revenue MTD</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer" onClick={() => router.push(`/contractors/${c.id}`)}>
                <TableCell className="font-medium text-foreground"><Link href={`/contractors/${c.id}`} className="text-indigo-400 hover:text-indigo-300 hover:underline" onClick={(e) => e.stopPropagation()}>{c.company}</Link></TableCell>
                <TableCell className="text-muted-foreground">{c.contact}</TableCell>
                <TableCell className="text-center text-muted-foreground">{c.ordersMTD}</TableCell>
                <TableCell className="text-right font-medium text-foreground">{c.revenueMTD > 0 ? `$${c.revenueMTD.toLocaleString()}` : "--"}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(c.lastOrder).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Contractor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Building2 className="h-4 w-4 text-indigo-400" />
              </div>
              Add Contractor
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new contractor account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Company & Contact */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <Input placeholder="Company name" value={form.company} onChange={(e) => updateField("company", e.target.value)} className={`${inputClass} ${errors.company ? errorClass : ""}`} />
                {errors.company && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Contact Person <span className="text-red-400">*</span>
                </label>
                <Input placeholder="Full name" value={form.contact} onChange={(e) => updateField("contact", e.target.value)} className={`${inputClass} ${errors.contact ? errorClass : ""}`} />
                {errors.contact && <p className="text-xs text-red-400 mt-1">Required</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input type="email" placeholder="email@company.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <Input type="tel" placeholder="(555) 555-0000" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className={inputClass} />
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Address */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Address</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input placeholder="Street address" value={form.street} onChange={(e) => updateField("street", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <Input placeholder="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="State" value={form.state} onChange={(e) => updateField("state", e.target.value)} className={inputClass} />
                  <Input placeholder="Zip" value={form.zip} onChange={(e) => updateField("zip", e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Type & Status */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contractor Type</label>
                <Select value={form.type} onValueChange={(v) => updateField("type", v ?? "general")}>
                  <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    <SelectItem value="general">General Contractor</SelectItem>
                    <SelectItem value="design-build">Design-Build</SelectItem>
                    <SelectItem value="custom-home">Custom Home Builder</SelectItem>
                    <SelectItem value="remodeler">Remodeler</SelectItem>
                    <SelectItem value="kb-specialist">Kitchen & Bath Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => updateField("status", v ?? "active")}>
                  <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
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
              Add Contractor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
