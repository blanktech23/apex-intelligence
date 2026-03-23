"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Clock,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "On Leave": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const repsData: Record<
  string,
  {
    id: string;
    name: string;
    initials: string;
    territory: string;
    status: string;
    email: string;
    phone: string;
    address: string;
    accountsManaged: number;
    ordersMTD: number;
    commissionMTD: number;
    ytdRevenue: number;
  }
> = {
  "rep-1": {
    id: "rep-1",
    name: "Carlos Medina",
    initials: "CM",
    territory: "Southeast FL",
    status: "Active",
    email: "carlos.medina@fieldteam.io",
    phone: "(305) 555-0147",
    address: "2740 Coral Way, Suite 310, Miami, FL 33145",
    accountsManaged: 18,
    ordersMTD: 34,
    commissionMTD: 2523,
    ytdRevenue: 284500,
  },
  "rep-2": {
    id: "rep-2",
    name: "Jessica Palmer",
    initials: "JP",
    territory: "DFW Metro",
    status: "Active",
    email: "jessica.palmer@fieldteam.io",
    phone: "(972) 555-0283",
    address: "5500 Greenville Ave, Dallas, TX 75206",
    accountsManaged: 22,
    ordersMTD: 28,
    commissionMTD: 1640,
    ytdRevenue: 312800,
  },
  "rep-3": {
    id: "rep-3",
    name: "Derek Washington",
    initials: "DW",
    territory: "Atlanta Metro",
    status: "Active",
    email: "derek.washington@fieldteam.io",
    phone: "(404) 555-0391",
    address: "1100 Peachtree St NE, Atlanta, GA 30309",
    accountsManaged: 15,
    ordersMTD: 31,
    commissionMTD: 1820,
    ytdRevenue: 256200,
  },
  "rep-4": {
    id: "rep-4",
    name: "Natalie Tran",
    initials: "NT",
    territory: "SoCal Inland",
    status: "Active",
    email: "natalie.tran@fieldteam.io",
    phone: "(951) 555-0472",
    address: "3900 Market St, Suite 200, Riverside, CA 92501",
    accountsManaged: 20,
    ordersMTD: 26,
    commissionMTD: 1368,
    ytdRevenue: 198700,
  },
  "rep-5": {
    id: "rep-5",
    name: "Brian Kowalski",
    initials: "BK",
    territory: "Chicagoland",
    status: "Active",
    email: "brian.kowalski@fieldteam.io",
    phone: "(312) 555-0518",
    address: "233 S Wacker Dr, Chicago, IL 60606",
    accountsManaged: 16,
    ordersMTD: 22,
    commissionMTD: 1300,
    ytdRevenue: 187400,
  },
  "rep-6": {
    id: "rep-6",
    name: "Amanda Reeves",
    initials: "AR",
    territory: "Nashville / TN",
    status: "Active",
    email: "amanda.reeves@fieldteam.io",
    phone: "(615) 555-0634",
    address: "1 Nashville Pl, Nashville, TN 37219",
    accountsManaged: 12,
    ordersMTD: 19,
    commissionMTD: 840,
    ytdRevenue: 145600,
  },
  "rep-7": {
    id: "rep-7",
    name: "Kevin O'Brien",
    initials: "KO",
    territory: "Northeast OH",
    status: "Active",
    email: "kevin.obrien@fieldteam.io",
    phone: "(216) 555-0729",
    address: "200 Public Square, Cleveland, OH 44114",
    accountsManaged: 14,
    ordersMTD: 17,
    commissionMTD: 750,
    ytdRevenue: 134900,
  },
  "rep-8": {
    id: "rep-8",
    name: "Maria Santos",
    initials: "MS",
    territory: "Phoenix Metro",
    status: "Active",
    email: "maria.santos@fieldteam.io",
    phone: "(602) 555-0846",
    address: "2 N Central Ave, Phoenix, AZ 85004",
    accountsManaged: 11,
    ordersMTD: 15,
    commissionMTD: 660,
    ytdRevenue: 112300,
  },
  "rep-9": {
    id: "rep-9",
    name: "Tyler Jameson",
    initials: "TJ",
    territory: "Charlotte / NC",
    status: "On Leave",
    email: "tyler.jameson@fieldteam.io",
    phone: "(704) 555-0952",
    address: "401 S Tryon St, Charlotte, NC 28202",
    accountsManaged: 9,
    ordersMTD: 0,
    commissionMTD: 0,
    ytdRevenue: 67800,
  },
  "rep-10": {
    id: "rep-10",
    name: "Lisa Huang",
    initials: "LH",
    territory: "Bay Area",
    status: "Inactive",
    email: "lisa.huang@fieldteam.io",
    phone: "(415) 555-0163",
    address: "44 Montgomery St, San Francisco, CA 94104",
    accountsManaged: 0,
    ordersMTD: 0,
    commissionMTD: 0,
    ytdRevenue: 0,
  },
};

const accountsData = [
  { name: "Parkway Electrical Services", type: "Contractor", lastOrder: "2026-03-18", revenue: 48200 },
  { name: "Summit Home Builders", type: "Builder", lastOrder: "2026-03-15", revenue: 62400 },
  { name: "Gulf Coast Plumbing Supply", type: "Dealer", lastOrder: "2026-03-12", revenue: 31800 },
  { name: "Atlantic Kitchen & Bath", type: "Dealer", lastOrder: "2026-03-10", revenue: 54100 },
  { name: "Bayfront General Contractors", type: "Contractor", lastOrder: "2026-03-07", revenue: 27900 },
  { name: "Tropical Tile & Stone", type: "Dealer", lastOrder: "2026-03-03", revenue: 19600 },
  { name: "Palm City Renovations", type: "Contractor", lastOrder: "2026-02-28", revenue: 15300 },
  { name: "Evergreen Custom Homes", type: "Builder", lastOrder: "2026-02-22", revenue: 25200 },
];

const performanceData = [
  { month: "Jan 2026", orders: 29, revenue: 87400, commission: 2185, vsTarget: 108 },
  { month: "Feb 2026", orders: 32, revenue: 96200, commission: 2405, vsTarget: 115 },
  { month: "Mar 2026", orders: 34, revenue: 100900, commission: 2523, vsTarget: 121 },
];

const activityData = [
  { action: "Placed order #ORD-4821 for Atlantic Kitchen & Bath", type: "order", date: "2026-03-22T14:30:00" },
  { action: "Visited Summit Home Builders job site (Downtown Lofts project)", type: "visit", date: "2026-03-21T10:15:00" },
  { action: "Scheduled Q2 planning meeting with Gulf Coast Plumbing Supply", type: "meeting", date: "2026-03-20T16:45:00" },
  { action: "Placed order #ORD-4798 for Parkway Electrical Services", type: "order", date: "2026-03-19T11:20:00" },
  { action: "Onboarded new account: Tropical Tile & Stone", type: "account", date: "2026-03-18T09:00:00" },
  { action: "Submitted expense report for Southeast FL territory travel", type: "admin", date: "2026-03-17T15:30:00" },
  { action: "Visited Bayfront General Contractors (kitchen remodel walkthrough)", type: "visit", date: "2026-03-15T13:00:00" },
  { action: "Placed order #ORD-4756 for Summit Home Builders", type: "order", date: "2026-03-14T10:45:00" },
  { action: "Attended product training webinar: New Cabinet Line Launch", type: "training", date: "2026-03-13T14:00:00" },
  { action: "Placed order #ORD-4731 for Evergreen Custom Homes", type: "order", date: "2026-03-12T09:30:00" },
];

const activityIcons: Record<string, typeof ShoppingCart> = {
  order: ShoppingCart,
  visit: Building2,
  meeting: Calendar,
  account: Users,
  admin: Briefcase,
  training: MessageSquare,
};

const activityColors: Record<string, string> = {
  order: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  visit: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  meeting: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  account: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  admin: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  training: "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

const typeColors: Record<string, string> = {
  Contractor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Builder: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Dealer: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
};

export default function RepDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("accounts");
  const [repId, setRepId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    params.then((p) => setRepId(p.id));
  }, [params]);

  useEffect(() => {
    if (mounted && persona !== "dealer") {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || persona !== "dealer" || !repId) return null;

  const rep = repsData[repId];

  if (!rep) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Rep not found</h2>
          <Link
            href="/reps"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Back to Sales Reps
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Accounts Managed", value: rep.accountsManaged.toString(), icon: Users, color: "text-indigo-400" },
    { label: "Orders MTD", value: rep.ordersMTD.toString(), icon: Briefcase, color: "text-emerald-400" },
    { label: "Commission MTD", value: `$${rep.commissionMTD.toLocaleString()}`, icon: DollarSign, color: "text-amber-400" },
    { label: "YTD Revenue", value: `$${rep.ytdRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Back Link */}
      <div>
        <Link
          href="/reps"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sales Reps
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-indigo-500/30">
            <AvatarFallback className="bg-indigo-500/20 text-lg text-indigo-300">
              {rep.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{rep.name}</h1>
              <Badge variant="outline" className={statusColors[rep.status]}>
                {rep.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{rep.territory}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Contact Info */}
      <Card className="glass border-border p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2">
              <Mail className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{rep.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2">
              <Phone className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm text-foreground">{rep.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2">
              <MapPin className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm text-foreground">{rep.address}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="glass border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="rounded-xl bg-foreground/5 p-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass border border-border bg-foreground/5">
          <TabsTrigger
            value="accounts"
            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
          >
            Accounts
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="mt-4">
          <Card className="glass border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Account Name</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Last Order</TableHead>
                  <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountsData.map((account) => (
                  <TableRow
                    key={account.name}
                    className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                  >
                    <TableCell className="font-medium text-foreground">
                      {account.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColors[account.type]}>
                        {account.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(account.lastOrder).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${account.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-4">
          <Card className="glass border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Month</TableHead>
                  <TableHead className="text-muted-foreground text-center">Orders</TableHead>
                  <TableHead className="text-muted-foreground text-right">Revenue</TableHead>
                  <TableHead className="text-muted-foreground text-right">Commission</TableHead>
                  <TableHead className="text-muted-foreground text-right">vs Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.map((row) => (
                  <TableRow
                    key={row.month}
                    className="border-border transition-colors hover:bg-foreground/[0.03]"
                  >
                    <TableCell className="font-medium text-foreground">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {row.orders}
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      ${row.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      ${row.commission.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          row.vsTarget >= 100
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {row.vsTarget}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <div className="relative space-y-0">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
            {activityData.map((item, i) => {
              const Icon = activityIcons[item.type] || Clock;
              const colorClass = activityColors[item.type] || activityColors.admin;
              return (
                <div key={i} className="relative flex gap-4 py-3">
                  <div
                    className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {item.action}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(item.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
