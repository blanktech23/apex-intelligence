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
  ChevronDown,
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

/* Detail data for expanded cards */
const regionBreakdown = [
  { region: "Central TX", count: 4 },
  { region: "Hill Country", count: 2 },
  { region: "Lake Travis", count: 2 },
  { region: "North Austin", count: 3 },
  { region: "South TX", count: 1 },
];

const pendingApps = [
  { company: "Cedar Park Interiors", contact: "Nathan Wells", applied: "Mar 18, 2026", region: "North Austin", notes: "Referred by existing dealer. Interior design focus." },
  { company: "San Marcos Design Center", contact: "Laura Kim", applied: "Mar 20, 2026", region: "South TX", notes: "New territory expansion. Under credit review." },
];

const topDealers = [
  { name: "Austin Kitchen & Bath", region: "Central TX", amount: "$68,400", pct: "20.0%" },
  { name: "Central TX Cabinets", region: "Central TX", amount: "$52,100", pct: "15.2%" },
  { name: "Round Rock Builders Supply", region: "North Austin", amount: "$45,600", pct: "13.3%" },
  { name: "Hill Country Renovations", region: "Hill Country", amount: "$38,700", pct: "11.3%" },
  { name: "Lakeway Home Design", region: "Lake Travis", amount: "$29,300", pct: "8.6%" },
];

const defaultInviteForm = { companyName: "", contactPerson: "", email: "", phone: "", region: "" };

export default function DealersPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(defaultInviteForm);
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({});

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

  function handleInviteSubmit() {
    const errors: Record<string, string> = {};
    if (!inviteForm.companyName.trim()) errors.companyName = "Required";
    if (!inviteForm.contactPerson.trim()) errors.contactPerson = "Required";
    if (!inviteForm.email.trim()) errors.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) errors.email = "Invalid email";
    if (!inviteForm.region) errors.region = "Required";
    if (Object.keys(errors).length > 0) {
      setInviteErrors(errors);
      return;
    }
    toast.success(`Invitation sent to ${inviteForm.companyName}`, { description: `Contact: ${inviteForm.contactPerson} (${inviteForm.email})` });
    setInviteOpen(false);
    setInviteForm(defaultInviteForm);
    setInviteErrors({});
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dealer Network</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage authorized dealers and applications</p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2" onClick={() => setInviteOpen(true)}>
          <Plus className="h-4 w-4" />
          Invite Dealer
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
          {expandedCard === "Active Dealers" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Dealers by Region</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {regionBreakdown.map((r) => (
                  <div key={r.region} className="flex items-center justify-between rounded-lg border border-border bg-foreground/[0.02] px-4 py-3">
                    <span className="text-sm text-foreground">{r.region}</span>
                    <span className="text-sm font-semibold text-foreground">{r.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">12 active dealers across 5 regions</div>
            </div>
          )}

          {expandedCard === "Pending Applications" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Pending Applications</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Company</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Contact</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Applied</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Region</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden md:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApps.map((row) => (
                      <tr key={row.company} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.company}</td>
                        <td className="py-2 text-muted-foreground">{row.contact}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.applied}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.region}</td>
                        <td className="py-2 text-muted-foreground text-xs hidden md:table-cell">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {expandedCard === "Total Revenue MTD" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Top 5 Dealers by Revenue</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">#</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Dealer</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Region</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Revenue</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDealers.map((row, i) => (
                      <tr key={row.name} className="border-b border-border/50">
                        <td className="py-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 text-foreground font-medium">{row.name}</td>
                        <td className="py-2 text-muted-foreground hidden sm:table-cell">{row.region}</td>
                        <td className="py-2 text-right text-emerald-400 font-medium">{row.amount}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.pct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Top 5 dealers account for 68.4% of total MTD revenue</div>
            </div>
          )}
        </div>
      )}

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
              <TableRow
                key={d.name}
                className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                onClick={() => toast(d.name, { description: `Region: ${d.region} | Orders: ${d.ordersMTD} | Revenue: ${d.revenueMTD > 0 ? `$${d.revenueMTD.toLocaleString()}` : "--"} | Rep: ${d.rep}` })}
              >
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

      {/* Invite Dealer Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-lg glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Store className="h-4 w-4 text-indigo-400" />
              </div>
              Invite Dealer
            </DialogTitle>
            <DialogDescription>
              Send an invitation to a new dealer to join your network.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Company Name *</label>
              <Input
                value={inviteForm.companyName}
                onChange={(e) => { setInviteForm({ ...inviteForm, companyName: e.target.value }); setInviteErrors({ ...inviteErrors, companyName: "" }); }}
                placeholder="Acme Cabinetry"
                className="mt-1 glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground"
              />
              {inviteErrors.companyName && <p className="mt-1 text-xs text-red-400">{inviteErrors.companyName}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Contact Person *</label>
              <Input
                value={inviteForm.contactPerson}
                onChange={(e) => { setInviteForm({ ...inviteForm, contactPerson: e.target.value }); setInviteErrors({ ...inviteErrors, contactPerson: "" }); }}
                placeholder="John Smith"
                className="mt-1 glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground"
              />
              {inviteErrors.contactPerson && <p className="mt-1 text-xs text-red-400">{inviteErrors.contactPerson}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => { setInviteForm({ ...inviteForm, email: e.target.value }); setInviteErrors({ ...inviteErrors, email: "" }); }}
                  placeholder="john@acme.com"
                  className="mt-1 glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground"
                />
                {inviteErrors.email && <p className="mt-1 text-xs text-red-400">{inviteErrors.email}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <Input
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  placeholder="(512) 555-0100"
                  className="mt-1 glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Region *</label>
              <Select value={inviteForm.region} onValueChange={(v) => { if (v) { setInviteForm({ ...inviteForm, region: v }); setInviteErrors({ ...inviteErrors, region: "" }); } }}>
                <SelectTrigger className="mt-1 glass border-border bg-foreground/5 text-foreground">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border bg-popover">
                  <SelectItem value="central-tx">Central TX</SelectItem>
                  <SelectItem value="north-austin">North Austin</SelectItem>
                  <SelectItem value="hill-country">Hill Country</SelectItem>
                  <SelectItem value="lake-travis">Lake Travis</SelectItem>
                  <SelectItem value="south-tx">South TX</SelectItem>
                </SelectContent>
              </Select>
              {inviteErrors.region && <p className="mt-1 text-xs text-red-400">{inviteErrors.region}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => { setInviteOpen(false); setInviteForm(defaultInviteForm); setInviteErrors({}); }}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleInviteSubmit}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
