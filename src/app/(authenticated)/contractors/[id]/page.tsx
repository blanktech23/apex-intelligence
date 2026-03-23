"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  User,
  Plus,
  MessageSquare,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const contractorsData: Record<string, {
  id: string;
  company: string;
  contact: string;
  initials: string;
  status: string;
  email: string;
  phone: string;
  address: string;
  since: string;
  totalOrders: number;
  revenueYTD: number;
  avgOrderValue: number;
  orders: { id: string; items: string; total: number; status: string; date: string }[];
  products: { name: string; category: string; orderedQty: number; lastOrdered: string }[];
  notes: { author: string; content: string; date: string }[];
}> = {
  "contractor-1": {
    id: "contractor-1",
    company: "Rivera General Contracting",
    contact: "Marcus Rivera",
    initials: "MR",
    status: "Active",
    email: "marcus@riveragc.com",
    phone: "(512) 555-0142",
    address: "2847 South Congress Ave, Austin, TX 78704",
    since: "2024-08-12",
    totalOrders: 87,
    revenueYTD: 142800,
    avgOrderValue: 8420,
    orders: [
      { id: "ORD-4821", items: "42\" Shaker Cabinets (12), Crown Molding", total: 18450, status: "Open", date: "2026-03-20" },
      { id: "ORD-4805", items: "Granite Countertop - Absolute Black (2)", total: 6450, status: "Delivered", date: "2026-03-13" },
      { id: "ORD-4798", items: "Pantry Pull-Out Organizers (6)", total: 3200, status: "Delivered", date: "2026-03-08" },
      { id: "ORD-4785", items: "Custom Range Hood - Copper", total: 4800, status: "Delivered", date: "2026-03-02" },
      { id: "ORD-4771", items: "Soft-Close Drawer Slides (48 pairs)", total: 2880, status: "Delivered", date: "2026-02-25" },
    ],
    products: [
      { name: "42\" Shaker Wall Cabinet", category: "Cabinets", orderedQty: 48, lastOrdered: "2026-03-20" },
      { name: "Granite Countertop - Absolute Black", category: "Countertops", orderedQty: 12, lastOrdered: "2026-03-13" },
      { name: "Soft-Close Hinges (pair)", category: "Hardware", orderedQty: 120, lastOrdered: "2026-03-08" },
      { name: "Crown Molding 8ft", category: "Trim", orderedQty: 36, lastOrdered: "2026-03-20" },
      { name: "Pull-Out Shelf Insert", category: "Accessories", orderedQty: 24, lastOrdered: "2026-03-02" },
    ],
    notes: [
      { author: "Sales Agent", content: "High-volume account. Marcus prefers bulk orders with net-30 terms. Always confirm lead times before quoting.", date: "2026-02-15T09:00:00" },
      { author: "You", content: "Discussed potential exclusive partnership for Q3 custom cabinet line. Marcus interested in preview access.", date: "2026-03-10T14:30:00" },
      { author: "You", content: "Confirmed new project pipeline: 3 kitchen remodels, 1 outdoor kitchen. Est. $45K in orders over next 60 days.", date: "2026-03-18T11:00:00" },
    ],
  },
  "contractor-2": {
    id: "contractor-2",
    company: "Summit Builders LLC",
    contact: "Sarah Chen",
    initials: "SC",
    status: "Active",
    email: "sarah@summitbuilders.com",
    phone: "(512) 555-0298",
    address: "1205 East 6th Street, Suite 400, Austin, TX 78702",
    since: "2025-01-20",
    totalOrders: 42,
    revenueYTD: 98500,
    avgOrderValue: 7250,
    orders: [
      { id: "ORD-4820", items: "Quartz Countertop - Calacatta (3 slabs)", total: 8720, status: "Processing", date: "2026-03-19" },
      { id: "ORD-4802", items: "Pantry Cabinet 84\" Tall (2), Pull-Out Shelves", total: 5680, status: "Shipped", date: "2026-03-12" },
      { id: "ORD-4790", items: "Under-Cabinet LED Kit (8)", total: 2480, status: "Delivered", date: "2026-03-05" },
    ],
    products: [
      { name: "Quartz Countertop - Calacatta", category: "Countertops", orderedQty: 8, lastOrdered: "2026-03-19" },
      { name: "Pantry Cabinet 84\" Tall", category: "Cabinets", orderedQty: 6, lastOrdered: "2026-03-12" },
      { name: "Under-Cabinet LED Kit", category: "Lighting", orderedQty: 16, lastOrdered: "2026-03-05" },
    ],
    notes: [
      { author: "You", content: "Sarah focuses on luxury builds. Prefers premium finishes and is willing to pay for quality. Great referral source.", date: "2026-02-20T10:00:00" },
    ],
  },
  "contractor-3": {
    id: "contractor-3",
    company: "Harbor View Construction",
    contact: "Robert Nguyen",
    initials: "RN",
    status: "Active",
    email: "robert@harborview.com",
    phone: "(512) 555-0387",
    address: "780 Barton Springs Rd, Austin, TX 78704",
    since: "2024-11-05",
    totalOrders: 35,
    revenueYTD: 72400,
    avgOrderValue: 6120,
    orders: [
      { id: "ORD-4819", items: "36\" Base Cabinets (8), Soft-Close Hinges", total: 12340, status: "Shipped", date: "2026-03-18" },
      { id: "ORD-4795", items: "Bathroom Vanity 48\" Single", total: 1850, status: "Delivered", date: "2026-03-07" },
    ],
    products: [
      { name: "36\" Base Cabinet", category: "Cabinets", orderedQty: 24, lastOrdered: "2026-03-18" },
      { name: "Soft-Close Hinges (pair)", category: "Hardware", orderedQty: 72, lastOrdered: "2026-03-18" },
    ],
    notes: [
      { author: "You", content: "Robert manages mid-range residential builds. Reliable repeat customer. Responsive to upsell opportunities.", date: "2026-01-15T11:00:00" },
    ],
  },
  "contractor-4": {
    id: "contractor-4",
    company: "Brooks Concrete & Masonry",
    contact: "Michael Brooks",
    initials: "MB",
    status: "Active",
    email: "michael@brookscm.com",
    phone: "(512) 555-0456",
    address: "4200 Manor Rd, Austin, TX 78723",
    since: "2024-06-01",
    totalOrders: 62,
    revenueYTD: 168200,
    avgOrderValue: 9800,
    orders: [
      { id: "ORD-4817", items: "Bathroom Vanity 60\" Double Sink", total: 3280, status: "Delivered", date: "2026-03-17" },
      { id: "ORD-4800", items: "Custom Island - Maple", total: 11200, status: "Delivered", date: "2026-03-10" },
    ],
    products: [
      { name: "Bathroom Vanity 60\" Double Sink", category: "Vanities", orderedQty: 8, lastOrdered: "2026-03-17" },
      { name: "Custom Island", category: "Islands", orderedQty: 4, lastOrdered: "2026-03-10" },
    ],
    notes: [
      { author: "You", content: "Highest revenue contractor. Michael runs large commercial and residential jobs. Key relationship to maintain.", date: "2026-03-01T09:30:00" },
    ],
  },
  "contractor-5": {
    id: "contractor-5",
    company: "Whitfield Custom Homes",
    contact: "Karen Whitfield",
    initials: "KW",
    status: "Pending",
    email: "karen@whitfieldch.com",
    phone: "(512) 555-0521",
    address: "9100 Research Blvd, Austin, TX 78758",
    since: "2025-11-10",
    totalOrders: 8,
    revenueYTD: 38700,
    avgOrderValue: 12500,
    orders: [
      { id: "ORD-4815", items: "Custom Island - Walnut w/ Waterfall Edge", total: 14500, status: "Processing", date: "2026-03-16" },
    ],
    products: [
      { name: "Custom Island - Walnut", category: "Islands", orderedQty: 2, lastOrdered: "2026-03-16" },
    ],
    notes: [
      { author: "You", content: "Karen specializes in high-end custom homes. Small volume but very high per-order value. Pending credit approval for net-45 terms.", date: "2026-03-05T14:00:00" },
    ],
  },
  "contractor-6": {
    id: "contractor-6",
    company: "Lone Star Foundations",
    contact: "Olivia Martinez",
    initials: "OM",
    status: "Active",
    email: "olivia@lonestarf.com",
    phone: "(512) 555-0678",
    address: "5500 N Lamar Blvd, Austin, TX 78751",
    since: "2025-03-22",
    totalOrders: 28,
    revenueYTD: 64300,
    avgOrderValue: 5480,
    orders: [
      { id: "ORD-4813", items: "Wall Cabinets 30\" (6), Lazy Susan Corner", total: 9870, status: "Open", date: "2026-03-16" },
    ],
    products: [
      { name: "Wall Cabinet 30\"", category: "Cabinets", orderedQty: 18, lastOrdered: "2026-03-16" },
      { name: "Lazy Susan Corner Unit", category: "Cabinets", orderedQty: 3, lastOrdered: "2026-03-16" },
    ],
    notes: [],
  },
  "contractor-7": {
    id: "contractor-7",
    company: "Parkway Electrical Services",
    contact: "David Park",
    initials: "DP",
    status: "Active",
    email: "david@parkwayelectric.com",
    phone: "(737) 555-0429",
    address: "4821 Lamar Blvd, Suite 200, Austin, TX 78751",
    since: "2024-06-15",
    totalOrders: 19,
    revenueYTD: 24600,
    avgOrderValue: 3200,
    orders: [
      { id: "ORD-4810", items: "Under-Cabinet LED Lighting Kit (4)", total: 1240, status: "Shipped", date: "2026-03-15" },
    ],
    products: [
      { name: "Under-Cabinet LED Lighting Kit", category: "Lighting", orderedQty: 12, lastOrdered: "2026-03-15" },
    ],
    notes: [
      { author: "You", content: "David mainly orders lighting and electrical-adjacent products. Good cross-sell opportunity for smart home integration kits.", date: "2026-02-20T09:00:00" },
    ],
  },
  "contractor-8": {
    id: "contractor-8",
    company: "BlueLine Plumbing Co.",
    contact: "Angela Foster",
    initials: "AF",
    status: "Inactive",
    email: "angela@bluelineplumbing.com",
    phone: "(512) 555-0834",
    address: "3300 Guadalupe St, Austin, TX 78705",
    since: "2025-05-10",
    totalOrders: 5,
    revenueYTD: 0,
    avgOrderValue: 2100,
    orders: [],
    products: [],
    notes: [
      { author: "You", content: "Account went inactive Feb 2026. Angela mentioned budget constraints. Follow up in Q2 to re-engage.", date: "2026-02-22T16:00:00" },
    ],
  },
};

const statusColors: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Inactive: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const orderStatusColors: Record<string, string> = {
  Open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export default function ContractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractorId = params.id as string;
  const contractor = contractorsData[contractorId];
  const [activeTab, setActiveTab] = useState("orders");
  const [noteText, setNoteText] = useState("");

  if (!contractor) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Link
          href="/contractors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contractors
        </Link>
        <Card className="glass border-border p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Contractor Not Found</h2>
          <p className="text-muted-foreground">The contractor could not be found.</p>
        </Card>
      </div>
    );
  }

  const accountAge = (() => {
    const start = new Date(contractor.since);
    const now = new Date("2026-03-22");
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const rem = months % 12;
      return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
    }
    return `${months}mo`;
  })();

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href="/contractors"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contractors
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-indigo-500/30">
            <AvatarFallback className="bg-indigo-500/20 text-lg text-indigo-300">
              {contractor.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{contractor.company}</h1>
              <Badge variant="outline" className={statusColors[contractor.status]}>
                {contractor.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{contractor.contact}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{contractor.totalOrders}</p>
            </div>
            <div className="rounded-xl bg-foreground/5 p-3">
              <ShoppingCart className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
        </Card>
        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue YTD</p>
              <p className="mt-1 text-2xl font-bold text-foreground">${contractor.revenueYTD.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-foreground/5 p-3">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
        </Card>
        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Avg Order Value</p>
              <p className="mt-1 text-2xl font-bold text-foreground">${contractor.avgOrderValue.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-foreground/5 p-3">
              <TrendingUp className="h-5 w-5 text-amber-400" />
            </div>
          </div>
        </Card>
        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Account Age</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{accountAge}</p>
            </div>
            <div className="rounded-xl bg-foreground/5 p-3">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass border border-border bg-foreground/5">
              <TabsTrigger
                value="orders"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              {contractor.orders.length > 0 ? (
                <Card className="glass border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Order #</TableHead>
                        <TableHead className="text-muted-foreground">Items</TableHead>
                        <TableHead className="text-muted-foreground text-right">Total</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contractor.orders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <TableCell className="font-medium text-indigo-400 hover:text-indigo-300">{order.id}</TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[240px] truncate">{order.items}</TableCell>
                          <TableCell className="text-right font-medium text-foreground">${order.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={orderStatusColors[order.status]}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="glass border-border p-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No orders found for this contractor.</p>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-4">
              {contractor.products.length > 0 ? (
                <Card className="glass border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Product</TableHead>
                        <TableHead className="text-muted-foreground">Category</TableHead>
                        <TableHead className="text-muted-foreground text-center">Total Qty Ordered</TableHead>
                        <TableHead className="text-muted-foreground">Last Ordered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contractor.products.map((product, i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-foreground/5 text-muted-foreground border-border">
                              {product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">{product.orderedQty}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(product.lastOrdered).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="glass border-border p-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No products ordered yet.</p>
                </Card>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card className="glass border-border p-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this contractor..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (noteText.trim()) {
                        setNoteText("");
                        toast.success("Note added successfully");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              </Card>
              {contractor.notes.length > 0 ? (
                contractor.notes
                  .slice()
                  .reverse()
                  .map((note, i) => (
                    <Card key={i} className="glass border-border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {note.author === "Sales Agent" ? (
                            <MessageSquare className="h-4 w-4 text-amber-400" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-medium text-muted-foreground">{note.author}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </Card>
                  ))
              ) : (
                <Card className="glass border-border p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No notes yet. Add the first one above.</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact Person</p>
                  <p className="text-sm text-foreground">{contractor.contact}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Mail className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{contractor.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Phone className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{contractor.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <MapPin className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">{contractor.address}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Account Details */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Account Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Client Since</span>
                <span className="text-foreground">
                  {new Date(contractor.since).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={`${statusColors[contractor.status]} text-xs`}>
                  {contractor.status}
                </Badge>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lifetime Orders</span>
                <span className="text-foreground">{contractor.totalOrders}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Order Value</span>
                <span className="text-foreground">${contractor.avgOrderValue.toLocaleString()}</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Revenue YTD</span>
                <span className="text-emerald-400">${contractor.revenueYTD.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
