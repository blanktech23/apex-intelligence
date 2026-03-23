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
  X,
  Calendar,
  Building2,
  Phone,
  Mail,
  ClipboardCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Prospect: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "At Risk": "bg-red-500/20 text-red-400 border-red-500/30",
};

const stats = [
  { label: "Total Accounts", value: "32", icon: Users, change: "+2 this quarter", color: "text-indigo-400" },
  { label: "Active", value: "24", icon: TrendingUp, change: "75% of total", color: "text-emerald-400" },
  { label: "Prospects", value: "8", icon: UserPlus, change: "3 warm leads", color: "text-blue-400" },
  { label: "Revenue MTD", value: "$67K", icon: DollarSign, change: "+9.4% MoM", color: "text-amber-400" },
];

type Account = {
  id: string;
  company: string;
  lastVisit: string;
  status: string;
  pipeline: number;
  rep: string;
  phone: string;
  email: string;
  address: string;
  revenueBreakdown: { cabinets: number; countertops: number; hardware: number };
  recentOrders: { name: string; date: string; value: number }[];
  visitHistory: { date: string; note: string }[];
};

const defaultAccounts: Account[] = [
  {
    id: "terr-001",
    company: "Austin Kitchen & Bath",
    lastVisit: "2026-03-18",
    status: "Active",
    pipeline: 34200,
    rep: "Marcus Chen",
    phone: "(512) 555-0142",
    email: "orders@austinkb.com",
    address: "2801 S Lamar Blvd, Austin, TX 78704",
    revenueBreakdown: { cabinets: 18400, countertops: 9800, hardware: 6000 },
    recentOrders: [
      { name: "Shaker Cabinet Set (12 units)", date: "2026-03-15", value: 6240 },
      { name: "Quartz Countertop - 45sqft", date: "2026-03-08", value: 3825 },
      { name: "Built-In Dishwasher x2", date: "2026-02-22", value: 2600 },
    ],
    visitHistory: [
      { date: "2026-03-18", note: "Quarterly review, discussed Q2 projections" },
      { date: "2026-02-12", note: "Product demo - new cabinet line" },
      { date: "2026-01-15", note: "Contract renewal meeting" },
    ],
  },
  {
    id: "terr-002",
    company: "Central TX Cabinets",
    lastVisit: "2026-03-15",
    status: "Active",
    pipeline: 28700,
    rep: "Marcus Chen",
    phone: "(512) 555-0287",
    email: "info@centraltxcab.com",
    address: "901 E 6th St, Austin, TX 78702",
    revenueBreakdown: { cabinets: 22100, countertops: 4200, hardware: 2400 },
    recentOrders: [
      { name: "Tall Pantry Cabinet x4", date: "2026-03-10", value: 5200 },
      { name: "Lazy Susan Corner Units x2", date: "2026-02-28", value: 1560 },
    ],
    visitHistory: [
      { date: "2026-03-15", note: "Checked on delivery timeline" },
      { date: "2026-02-20", note: "Introduced Heritage Woodworks line" },
    ],
  },
  {
    id: "terr-003",
    company: "Hill Country Renovations",
    lastVisit: "2026-03-14",
    status: "Active",
    pipeline: 19800,
    rep: "Marcus Chen",
    phone: "(512) 555-0391",
    email: "projects@hillcountryren.com",
    address: "4500 Bee Cave Rd, West Lake Hills, TX 78746",
    revenueBreakdown: { cabinets: 8200, countertops: 7600, hardware: 4000 },
    recentOrders: [
      { name: "Marble Countertop - 30sqft", date: "2026-03-05", value: 3150 },
      { name: "Wall-Mount Range Hood", date: "2026-02-18", value: 1100 },
    ],
    visitHistory: [
      { date: "2026-03-14", note: "Site visit for lakefront project" },
      { date: "2026-02-08", note: "Initial consultation" },
    ],
  },
  {
    id: "terr-004",
    company: "Lakeway Home Design",
    lastVisit: "2026-03-12",
    status: "Prospect",
    pipeline: 45000,
    rep: "Marcus Chen",
    phone: "(512) 555-0463",
    email: "hello@lakewayhd.com",
    address: "1200 Lakeway Dr, Lakeway, TX 78734",
    revenueBreakdown: { cabinets: 0, countertops: 0, hardware: 0 },
    recentOrders: [],
    visitHistory: [
      { date: "2026-03-12", note: "Discovery meeting - high-end residential focus" },
      { date: "2026-03-01", note: "Cold outreach follow-up" },
    ],
  },
  {
    id: "terr-005",
    company: "Round Rock Builders Supply",
    lastVisit: "2026-03-10",
    status: "Active",
    pipeline: 22400,
    rep: "Marcus Chen",
    phone: "(512) 555-0518",
    email: "supply@roundrockbs.com",
    address: "3200 IH-35 N, Round Rock, TX 78681",
    revenueBreakdown: { cabinets: 12000, countertops: 6400, hardware: 4000 },
    recentOrders: [
      { name: "Shaker Wall Cabinets x8", date: "2026-03-02", value: 3200 },
      { name: "Granite Countertop - 60sqft", date: "2026-02-15", value: 4200 },
    ],
    visitHistory: [
      { date: "2026-03-10", note: "Inventory check and reorder discussion" },
      { date: "2026-02-05", note: "New product showcase" },
    ],
  },
  {
    id: "terr-006",
    company: "Georgetown Cabinetry",
    lastVisit: "2026-03-08",
    status: "At Risk",
    pipeline: 12300,
    rep: "Marcus Chen",
    phone: "(512) 555-0672",
    email: "orders@georgetowncab.com",
    address: "500 S Main St, Georgetown, TX 78626",
    revenueBreakdown: { cabinets: 9800, countertops: 1500, hardware: 1000 },
    recentOrders: [
      { name: "Shaker Base Cabinet x2", date: "2026-01-20", value: 960 },
    ],
    visitHistory: [
      { date: "2026-03-08", note: "Retention meeting - competitor pricing concerns" },
      { date: "2026-01-25", note: "Issue resolution visit" },
    ],
  },
  {
    id: "terr-007",
    company: "Cedar Park Interiors",
    lastVisit: "2026-03-06",
    status: "Prospect",
    pipeline: 38500,
    rep: "Marcus Chen",
    phone: "(512) 555-0734",
    email: "design@cedarparkint.com",
    address: "800 N Bell Blvd, Cedar Park, TX 78613",
    revenueBreakdown: { cabinets: 0, countertops: 0, hardware: 0 },
    recentOrders: [],
    visitHistory: [
      { date: "2026-03-06", note: "Product line presentation" },
      { date: "2026-02-22", note: "Intro meeting via referral" },
    ],
  },
  {
    id: "terr-008",
    company: "San Marcos Design Center",
    lastVisit: "2026-03-04",
    status: "Active",
    pipeline: 16900,
    rep: "Marcus Chen",
    phone: "(512) 555-0856",
    email: "info@smdesigncenter.com",
    address: "200 N LBJ Dr, San Marcos, TX 78666",
    revenueBreakdown: { cabinets: 7200, countertops: 5700, hardware: 4000 },
    recentOrders: [
      { name: "Butcher Block Walnut - 25sqft", date: "2026-02-28", value: 1375 },
      { name: "French Door Refrigerator", date: "2026-02-10", value: 3200 },
    ],
    visitHistory: [
      { date: "2026-03-04", note: "Monthly check-in" },
      { date: "2026-02-04", note: "Delivery follow-up" },
    ],
  },
  {
    id: "terr-009",
    company: "Dripping Springs K&B",
    lastVisit: "2026-03-02",
    status: "Prospect",
    pipeline: 52000,
    rep: "Marcus Chen",
    phone: "(512) 555-0923",
    email: "info@dskb.com",
    address: "100 Mercer St, Dripping Springs, TX 78620",
    revenueBreakdown: { cabinets: 0, countertops: 0, hardware: 0 },
    recentOrders: [],
    visitHistory: [
      { date: "2026-03-02", note: "On-site demo with owner" },
      { date: "2026-02-15", note: "Initial outreach at trade show" },
    ],
  },
  {
    id: "terr-010",
    company: "Pflugerville Home Pro",
    lastVisit: "2026-02-28",
    status: "Active",
    pipeline: 8400,
    rep: "Marcus Chen",
    phone: "(512) 555-1047",
    email: "orders@pflugervillehp.com",
    address: "1500 W Pecan St, Pflugerville, TX 78660",
    revenueBreakdown: { cabinets: 4200, countertops: 2400, hardware: 1800 },
    recentOrders: [
      { name: "Shaker Base Cabinet x1", date: "2026-02-20", value: 480 },
    ],
    visitHistory: [
      { date: "2026-02-28", note: "Quarterly touch base" },
      { date: "2025-12-15", note: "Year-end review" },
    ],
  },
];

interface AddAccountForm {
  company: string;
  contact: string;
  phone: string;
  email: string;
  status: string;
  pipeline: number;
}

const defaultAddForm = (): AddAccountForm => ({
  company: "",
  contact: "",
  phone: "",
  email: "",
  status: "prospect",
  pipeline: 0,
});

export default function TerritoryPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Log Visit inline form state
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [visitNotes, setVisitNotes] = useState("");

  // Add Account dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddAccountForm>(defaultAddForm());
  const [addErrors, setAddErrors] = useState<Record<string, boolean>>({});

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
    const matchesStatFilter =
      !statusFilter ||
      (statusFilter === "Active" && a.status === "Active") ||
      (statusFilter === "Prospect" && a.status === "Prospect") ||
      statusFilter === "Total Accounts" ||
      statusFilter === "Revenue MTD";
    return matchesSearch && matchesRegion && matchesStatFilter;
  });

  const totalRevenue = (account: Account) => {
    const { cabinets, countertops, hardware } = account.revenueBreakdown;
    return cabinets + countertops + hardware;
  };

  const handleLogVisit = () => {
    if (!selectedAccount || !visitNotes.trim()) return;

    setAccounts((prev) =>
      prev.map((a) =>
        a.id === selectedAccount.id
          ? {
              ...a,
              lastVisit: visitDate,
              visitHistory: [{ date: visitDate, note: visitNotes }, ...a.visitHistory],
            }
          : a
      )
    );

    // Update selected account in view too
    setSelectedAccount((prev) =>
      prev
        ? {
            ...prev,
            lastVisit: visitDate,
            visitHistory: [{ date: visitDate, note: visitNotes }, ...prev.visitHistory],
          }
        : null
    );

    setShowVisitForm(false);
    setVisitNotes("");
    setVisitDate(new Date().toISOString().split("T")[0]);
    toast.success(`Visit logged for ${selectedAccount.company}`);
  };

  const handleAddAccount = () => {
    const newErrors: Record<string, boolean> = {};
    if (!addForm.company.trim()) newErrors.company = true;

    if (Object.keys(newErrors).length > 0) {
      setAddErrors(newErrors);
      return;
    }

    const statusMap: Record<string, string> = { active: "Active", prospect: "Prospect" };
    const newAccount: Account = {
      id: `terr-${String(accounts.length + 1).padStart(3, "0")}`,
      company: addForm.company,
      lastVisit: new Date().toISOString().split("T")[0],
      status: statusMap[addForm.status] || "Prospect",
      pipeline: addForm.pipeline,
      rep: "Marcus Chen",
      phone: addForm.phone,
      email: addForm.email,
      address: "",
      revenueBreakdown: { cabinets: 0, countertops: 0, hardware: 0 },
      recentOrders: [],
      visitHistory: [],
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setAddDialogOpen(false);
    setAddForm(defaultAddForm());
    setAddErrors({});
    toast.success(`${addForm.company} added to territory`);
  };

  const inputClass = "glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60";
  const errorClass = "border-red-500/50 ring-1 ring-red-500/30";

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
          <Card
            key={stat.label}
            className={`glass border-border p-5 cursor-pointer transition-all duration-200 hover:bg-foreground/[0.05] hover:border-indigo-500/30 ${statusFilter === stat.label ? "ring-2 ring-indigo-500/50 border-indigo-500/40" : ""}`}
            onClick={() => setStatusFilter(statusFilter === stat.label ? null : stat.label)}
          >
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
              <TableRow
                key={a.id}
                className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                onClick={() => { setSelectedAccount(a); setShowVisitForm(false); }}
              >
                <TableCell className="font-medium text-foreground">{a.company}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(a.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[a.status]}>{a.status}</Badge></TableCell>
                <TableCell className="text-right font-medium text-foreground">${a.pipeline.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Account Detail Slide-Out Panel */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedAccount(null)}
          />
          <div className="relative z-10 w-full max-w-md h-full overflow-y-auto border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setSelectedAccount(null)}
              className="absolute top-4 right-4 z-20 rounded-lg bg-foreground/5 p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-gradient-to-br from-indigo-600/30 to-violet-600/10 p-6 pb-8">
              <Badge variant="outline" className={`${statusColors[selectedAccount.status]} text-[10px] mb-3`}>
                {selectedAccount.status}
              </Badge>
              <h2 className="text-xl font-bold text-foreground">{selectedAccount.company}</h2>
              <p className="text-sm text-muted-foreground mt-1">Rep: {selectedAccount.rep}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2">
                      <Phone className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-sm text-foreground">{selectedAccount.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-sm text-foreground">{selectedAccount.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2">
                      <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <span className="text-sm text-foreground">{selectedAccount.address}</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Revenue Breakdown */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Revenue Breakdown</h3>
                <div className="space-y-3">
                  {totalRevenue(selectedAccount) > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cabinets</span>
                        <span className="text-sm font-medium text-foreground">${selectedAccount.revenueBreakdown.cabinets.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${(selectedAccount.revenueBreakdown.cabinets / totalRevenue(selectedAccount)) * 100}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Countertops</span>
                        <span className="text-sm font-medium text-foreground">${selectedAccount.revenueBreakdown.countertops.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${(selectedAccount.revenueBreakdown.countertops / totalRevenue(selectedAccount)) * 100}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Hardware</span>
                        <span className="text-sm font-medium text-foreground">${selectedAccount.revenueBreakdown.hardware.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-500/60" style={{ width: `${(selectedAccount.revenueBreakdown.hardware / totalRevenue(selectedAccount)) * 100}%` }} />
                      </div>
                      <Separator className="bg-border" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Total</span>
                        <span className="text-sm font-bold text-foreground">${totalRevenue(selectedAccount).toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No revenue yet - prospect account</p>
                  )}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Visit History */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Visit History</h3>
                <div className="space-y-3">
                  {selectedAccount.visitHistory.map((visit, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="rounded-lg bg-foreground/5 p-2 h-fit mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(visit.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-sm text-foreground mt-0.5">{visit.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />

              {/* Recent Orders */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Orders</h3>
                {selectedAccount.recentOrders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAccount.recentOrders.map((order, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-foreground/[0.03] border border-border p-3">
                        <div>
                          <p className="text-sm text-foreground">{order.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-foreground">${order.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No orders yet</p>
                )}
              </div>

              <Separator className="bg-border" />

              {/* Actions */}
              <div className="space-y-3 pb-6">
                {/* Log Visit - inline form toggle */}
                {showVisitForm ? (
                  <div className="rounded-lg border border-border bg-foreground/[0.02] p-4 space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Log Visit</h4>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Visit Date</label>
                      <Input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        Notes <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        placeholder="What happened during the visit?"
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                        rows={3}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-sm resize-none ${inputClass}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                        onClick={handleLogVisit}
                        disabled={!visitNotes.trim()}
                      >
                        Save Visit
                      </Button>
                      <Button
                        variant="outline"
                        className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10 text-xs"
                        onClick={() => { setShowVisitForm(false); setVisitNotes(""); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                    onClick={() => setShowVisitForm(true)}
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Log Visit
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full border-border bg-foreground/5 text-foreground hover:bg-foreground/10 gap-2"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <UserPlus className="h-4 w-4 text-indigo-400" />
              </div>
              Add Account
            </DialogTitle>
            <DialogDescription>
              Add a new account to your territory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Company Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="Company name"
                value={addForm.company}
                onChange={(e) => { setAddForm((p) => ({ ...p, company: e.target.value })); setAddErrors((p) => ({ ...p, company: false })); }}
                className={`${inputClass} ${addErrors.company ? errorClass : ""}`}
              />
              {addErrors.company && <p className="text-xs text-red-400 mt-1">Required</p>}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Contact Person</label>
                <Input placeholder="Contact name" value={addForm.contact} onChange={(e) => setAddForm((p) => ({ ...p, contact: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone</label>
                <Input type="tel" placeholder="(555) 555-0000" value={addForm.phone} onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <Input type="email" placeholder="email@company.com" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <Select value={addForm.status} onValueChange={(v) => setAddForm((p) => ({ ...p, status: v ?? "prospect" }))}>
                  <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estimated Pipeline ($)</label>
                <Input type="number" min={0} value={addForm.pipeline || ""} onChange={(e) => setAddForm((p) => ({ ...p, pipeline: parseFloat(e.target.value) || 0 }))} className={inputClass} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => { setAddDialogOpen(false); setAddForm(defaultAddForm()); setAddErrors({}); }}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleAddAccount}>
              Add Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
