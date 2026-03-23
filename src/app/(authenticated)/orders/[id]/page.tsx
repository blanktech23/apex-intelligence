"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  User,
  Building2,
  FileText,
  Plus,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

const ordersData: Record<string, {
  id: string;
  status: string;
  date: string;
  customer: { name: string; company: string; email: string; phone: string };
  contractor: { name: string; company: string; email: string; phone: string };
  items: { sku: string; name: string; finish: string; qty: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  timeline: { step: string; date: string; completed: boolean }[];
  notes: { author: string; content: string; date: string }[];
}> = {
  "ORD-4821": {
    id: "ORD-4821",
    status: "Open",
    date: "2026-03-20",
    customer: { name: "Marcus Rivera", company: "Rivera General Contracting", email: "marcus@riveragc.com", phone: "(512) 555-0142" },
    contractor: { name: "Marcus Rivera", company: "Rivera General Contracting", email: "marcus@riveragc.com", phone: "(512) 555-0142" },
    items: [
      { sku: "CAB-SHK-42W", name: "42\" Shaker Wall Cabinet", finish: "White", qty: 8, unitPrice: 680 },
      { sku: "CAB-SHK-42B", name: "42\" Shaker Base Cabinet", finish: "White", qty: 4, unitPrice: 780 },
      { sku: "TRM-CRN-8FT", name: "Crown Molding 8ft", finish: "White Oak", qty: 6, unitPrice: 85 },
    ],
    subtotal: 9070,
    tax: 748.28,
    shipping: 0,
    total: 9818.28,
    timeline: [
      { step: "Order Placed", date: "Mar 20, 2026", completed: true },
      { step: "Processing", date: "--", completed: false },
      { step: "Shipped", date: "--", completed: false },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [
      { author: "Sales Agent", content: "Customer requested white shaker cabinets for kitchen remodel project. Priority order for downtown Austin build.", date: "2026-03-20T10:30:00" },
      { author: "You", content: "Confirmed inventory availability. All items in stock. Estimated ship date: Mar 23.", date: "2026-03-20T11:15:00" },
    ],
  },
  "ORD-4820": {
    id: "ORD-4820",
    status: "Processing",
    date: "2026-03-19",
    customer: { name: "Sarah Chen", company: "Summit Builders LLC", email: "sarah@summitbuilders.com", phone: "(512) 555-0298" },
    contractor: { name: "Sarah Chen", company: "Summit Builders LLC", email: "sarah@summitbuilders.com", phone: "(512) 555-0298" },
    items: [
      { sku: "CTR-QTZ-CAL", name: "Quartz Countertop - Calacatta", finish: "Polished", qty: 3, unitPrice: 2450 },
      { sku: "CTR-EDGE-WF", name: "Waterfall Edge Profile", finish: "Polished", qty: 2, unitPrice: 485 },
    ],
    subtotal: 8320,
    tax: 686.40,
    shipping: 400,
    total: 9406.40,
    timeline: [
      { step: "Order Placed", date: "Mar 19, 2026", completed: true },
      { step: "Processing", date: "Mar 20, 2026", completed: true },
      { step: "Shipped", date: "--", completed: false },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [
      { author: "You", content: "3 slabs selected from lot #QC-2026-0312. Customer approved veining pattern via photo.", date: "2026-03-19T14:00:00" },
    ],
  },
  "ORD-4819": {
    id: "ORD-4819",
    status: "Shipped",
    date: "2026-03-18",
    customer: { name: "Robert Nguyen", company: "Harbor View Construction", email: "robert@harborview.com", phone: "(512) 555-0387" },
    contractor: { name: "Robert Nguyen", company: "Harbor View Construction", email: "robert@harborview.com", phone: "(512) 555-0387" },
    items: [
      { sku: "CAB-BASE-36", name: "36\" Base Cabinet", finish: "Espresso", qty: 8, unitPrice: 1280 },
      { sku: "HRD-HNG-SC", name: "Soft-Close Hinges (pair)", finish: "Brushed Nickel", qty: 24, unitPrice: 42 },
    ],
    subtotal: 11248,
    tax: 928.46,
    shipping: 350,
    total: 12526.46,
    timeline: [
      { step: "Order Placed", date: "Mar 18, 2026", completed: true },
      { step: "Processing", date: "Mar 18, 2026", completed: true },
      { step: "Shipped", date: "Mar 20, 2026", completed: true },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [
      { author: "Shipping Agent", content: "Tracking #: 1Z999AA10123456784. ETA: Mar 22 via freight.", date: "2026-03-20T08:45:00" },
    ],
  },
  "ORD-4817": {
    id: "ORD-4817",
    status: "Delivered",
    date: "2026-03-17",
    customer: { name: "Michael Brooks", company: "Brooks Design-Build", email: "michael@brookscm.com", phone: "(512) 555-0456" },
    contractor: { name: "Michael Brooks", company: "Brooks Design-Build", email: "michael@brookscm.com", phone: "(512) 555-0456" },
    items: [
      { sku: "VAN-DBL-60", name: "Bathroom Vanity 60\" Double Sink", finish: "Gray Oak", qty: 1, unitPrice: 2480 },
      { sku: "SNK-UND-OVL", name: "Undermount Oval Sink", finish: "White Ceramic", qty: 2, unitPrice: 285 },
      { sku: "FCT-WF-BN", name: "Waterfall Faucet", finish: "Brushed Nickel", qty: 2, unitPrice: 115 },
    ],
    subtotal: 3280,
    tax: 270.60,
    shipping: 0,
    total: 3550.60,
    timeline: [
      { step: "Order Placed", date: "Mar 17, 2026", completed: true },
      { step: "Processing", date: "Mar 17, 2026", completed: true },
      { step: "Shipped", date: "Mar 18, 2026", completed: true },
      { step: "Delivered", date: "Mar 19, 2026", completed: true },
    ],
    notes: [
      { author: "You", content: "Customer confirmed delivery received in good condition. No damage reported.", date: "2026-03-19T16:00:00" },
    ],
  },
  "ORD-4815": {
    id: "ORD-4815",
    status: "In Production",
    date: "2026-03-16",
    customer: { name: "Karen Whitfield", company: "Whitfield Custom Homes", email: "karen@whitfieldch.com", phone: "(512) 555-0521" },
    contractor: { name: "Karen Whitfield", company: "Whitfield Custom Homes", email: "karen@whitfieldch.com", phone: "(512) 555-0521" },
    items: [
      { sku: "ISL-CST-WLN", name: "Custom Island - Walnut", finish: "Natural Walnut", qty: 1, unitPrice: 12800 },
      { sku: "ISL-WF-EDGE", name: "Waterfall Edge Add-on", finish: "Natural Walnut", qty: 1, unitPrice: 1700 },
    ],
    subtotal: 14500,
    tax: 1196.75,
    shipping: 0,
    total: 15696.75,
    timeline: [
      { step: "Order Placed", date: "Mar 16, 2026", completed: true },
      { step: "Processing", date: "Mar 17, 2026", completed: true },
      { step: "In Production", date: "Mar 18, 2026", completed: true },
      { step: "Shipped", date: "--", completed: false },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [
      { author: "You", content: "Custom island build in progress. Walnut slab selected and approved. Est. 10 business days for fabrication.", date: "2026-03-17T09:00:00" },
    ],
  },
  "ORD-4813": {
    id: "ORD-4813",
    status: "Open",
    date: "2026-03-16",
    customer: { name: "Olivia Martinez", company: "Lone Star Renovations", email: "olivia@lonestarf.com", phone: "(512) 555-0678" },
    contractor: { name: "Olivia Martinez", company: "Lone Star Renovations", email: "olivia@lonestarf.com", phone: "(512) 555-0678" },
    items: [
      { sku: "CAB-WALL-30", name: "Wall Cabinet 30\"", finish: "Dove Gray", qty: 6, unitPrice: 1120 },
      { sku: "CAB-LS-CRN", name: "Lazy Susan Corner Unit", finish: "Dove Gray", qty: 1, unitPrice: 3150 },
    ],
    subtotal: 9870,
    tax: 814.28,
    shipping: 0,
    total: 10684.28,
    timeline: [
      { step: "Order Placed", date: "Mar 16, 2026", completed: true },
      { step: "Processing", date: "--", completed: false },
      { step: "Shipped", date: "--", completed: false },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [],
  },
  "ORD-4810": {
    id: "ORD-4810",
    status: "Shipped",
    date: "2026-03-15",
    customer: { name: "David Park", company: "Parkway Home Design", email: "david@parkwayelectric.com", phone: "(737) 555-0429" },
    contractor: { name: "David Park", company: "Parkway Home Design", email: "david@parkwayelectric.com", phone: "(737) 555-0429" },
    items: [
      { sku: "LED-UC-KIT", name: "Under-Cabinet LED Lighting Kit", finish: "Warm White 3000K", qty: 4, unitPrice: 310 },
    ],
    subtotal: 1240,
    tax: 102.30,
    shipping: 0,
    total: 1342.30,
    timeline: [
      { step: "Order Placed", date: "Mar 15, 2026", completed: true },
      { step: "Processing", date: "Mar 15, 2026", completed: true },
      { step: "Shipped", date: "Mar 16, 2026", completed: true },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [],
  },
  "ORD-4808": {
    id: "ORD-4808",
    status: "Processing",
    date: "2026-03-14",
    customer: { name: "Javier Castillo", company: "Castillo Landscape Design", email: "javier@castillodesign.com", phone: "(512) 555-0789" },
    contractor: { name: "Javier Castillo", company: "Castillo Landscape Design", email: "javier@castillodesign.com", phone: "(512) 555-0789" },
    items: [
      { sku: "OUT-CAB-SS", name: "Outdoor Kitchen Cabinet Set", finish: "Stainless Steel", qty: 1, unitPrice: 18400 },
      { sku: "OUT-CTR-GRN", name: "Granite Countertop - Outdoor", finish: "Absolute Black", qty: 1, unitPrice: 3700 },
    ],
    subtotal: 22100,
    tax: 1823.25,
    shipping: 0,
    total: 23923.25,
    timeline: [
      { step: "Order Placed", date: "Mar 14, 2026", completed: true },
      { step: "Processing", date: "Mar 15, 2026", completed: true },
      { step: "Shipped", date: "--", completed: false },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [
      { author: "You", content: "Outdoor kitchen set requires special weatherproofing treatment. Added 3 days to processing.", date: "2026-03-15T10:00:00" },
    ],
  },
  "ORD-4805": {
    id: "ORD-4805",
    status: "Delivered",
    date: "2026-03-13",
    customer: { name: "Marcus Rivera", company: "Rivera General Contracting", email: "marcus@riveragc.com", phone: "(512) 555-0142" },
    contractor: { name: "Marcus Rivera", company: "Rivera General Contracting", email: "marcus@riveragc.com", phone: "(512) 555-0142" },
    items: [
      { sku: "CTR-GRN-AB", name: "Granite Countertop - Absolute Black", finish: "Honed", qty: 2, unitPrice: 3225 },
    ],
    subtotal: 6450,
    tax: 532.13,
    shipping: 0,
    total: 6982.13,
    timeline: [
      { step: "Order Placed", date: "Mar 13, 2026", completed: true },
      { step: "Processing", date: "Mar 13, 2026", completed: true },
      { step: "Shipped", date: "Mar 14, 2026", completed: true },
      { step: "Delivered", date: "Mar 16, 2026", completed: true },
    ],
    notes: [],
  },
  "ORD-4802": {
    id: "ORD-4802",
    status: "Shipped",
    date: "2026-03-12",
    customer: { name: "Sarah Chen", company: "Summit Builders LLC", email: "sarah@summitbuilders.com", phone: "(512) 555-0298" },
    contractor: { name: "Sarah Chen", company: "Summit Builders LLC", email: "sarah@summitbuilders.com", phone: "(512) 555-0298" },
    items: [
      { sku: "CAB-PNT-84", name: "Pantry Cabinet 84\" Tall", finish: "Natural Maple", qty: 2, unitPrice: 2340 },
      { sku: "ACC-PO-SHF", name: "Pull-Out Shelf Insert", finish: "Chrome", qty: 4, unitPrice: 250 },
    ],
    subtotal: 5680,
    tax: 468.60,
    shipping: 0,
    total: 6148.60,
    timeline: [
      { step: "Order Placed", date: "Mar 12, 2026", completed: true },
      { step: "Processing", date: "Mar 12, 2026", completed: true },
      { step: "Shipped", date: "Mar 14, 2026", completed: true },
      { step: "Delivered", date: "--", completed: false },
    ],
    notes: [],
  },
};

const statusColors: Record<string, string> = {
  Open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "In Production": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const timelineIcons: Record<string, typeof Clock> = {
  "Order Placed": Clock,
  Processing: Package,
  "In Production": Package,
  Shipped: Truck,
  Delivered: CheckCircle2,
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const order = ordersData[orderId];
  const [noteText, setNoteText] = useState("");

  if (!order) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <Card className="glass border-border p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Order Not Found</h2>
          <p className="text-muted-foreground">The order &quot;{orderId}&quot; could not be found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-xl bg-indigo-500/10 p-3">
            <Package className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{order.id}</h1>
              <Badge variant="outline" className={statusColors[order.status]}>
                {order.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Placed on{" "}
              {new Date(order.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="glass border-border text-foreground hover:bg-foreground/[0.05] gap-2"
              onClick={() => toast.success("Invoice downloaded")}
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
              onClick={() => toast.success("Tracking info opened")}
            >
              <Truck className="h-4 w-4" />
              Track Shipment
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer / Contractor Info */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Customer & Contractor
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium text-foreground">{order.customer.name}</p>
                  <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Building2 className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium text-foreground">{order.contractor.company}</p>
                  <p className="text-xs text-muted-foreground">{order.contractor.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Items Table */}
          <Card className="glass border-border overflow-hidden">
            <div className="p-5 pb-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Order Items
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">SKU</TableHead>
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground">Finish</TableHead>
                  <TableHead className="text-muted-foreground text-center">Qty</TableHead>
                  <TableHead className="text-muted-foreground text-right">Unit Price</TableHead>
                  <TableHead className="text-muted-foreground text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.sku} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.sku}</TableCell>
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.finish}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.qty}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">${(item.qty * item.unitPrice).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Order Summary */}
            <div className="border-t border-border p-5">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">${order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{order.shipping > 0 ? `$${order.shipping.toLocaleString()}` : "Free"}</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes / Comments */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Notes & Comments
              </h3>
            </div>
            <div className="mb-4">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note about this order..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[80px] rounded-lg border border-border p-3 bg-foreground/[0.02]"
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
            </div>
            {order.notes.length > 0 ? (
              <div className="space-y-3">
                {order.notes
                  .slice()
                  .reverse()
                  .map((note, i) => (
                    <div key={i} className="rounded-lg border border-border p-3 bg-foreground/[0.02]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">{note.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date(note.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
            )}
          </Card>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Status Timeline
              </h3>
            </div>
            <div className="relative space-y-0">
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
              {order.timeline.map((step, i) => {
                const Icon = timelineIcons[step.step] || Clock;
                return (
                  <div key={i} className="relative flex gap-4 py-3">
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                        step.completed
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-border bg-foreground/5"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 ${
                          step.completed ? "text-emerald-400" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p
                        className={`text-sm font-medium ${
                          step.completed ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.step}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.date}</p>
                    </div>
                    {step.completed && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-1.5 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Order Summary Card */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="text-foreground">{order.items.reduce((acc, item) => acc + item.qty, 0)} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Line Items</span>
                <span className="text-foreground">{order.items.length}</span>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span className="text-foreground">
                  {new Date(order.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={`${statusColors[order.status]} text-xs`}>
                  {order.status}
                </Badge>
              </div>
              <Separator className="bg-border" />
              <div className="flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">${order.total.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-border p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full glass border-border text-foreground hover:bg-foreground/[0.05] justify-start gap-2"
                onClick={() => toast.success("Invoice downloaded")}
              >
                <Download className="h-4 w-4 text-indigo-400" />
                Download Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full glass border-border text-foreground hover:bg-foreground/[0.05] justify-start gap-2"
                onClick={() => toast.success("Tracking info opened")}
              >
                <MapPin className="h-4 w-4 text-indigo-400" />
                Track Shipment
              </Button>
              <Button
                variant="outline"
                className="w-full glass border-border text-foreground hover:bg-foreground/[0.05] justify-start gap-2"
                onClick={() => toast.info("Reorder flow coming soon")}
              >
                <Package className="h-4 w-4 text-indigo-400" />
                Reorder
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
