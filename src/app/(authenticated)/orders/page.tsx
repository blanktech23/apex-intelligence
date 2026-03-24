"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Plus,
  Filter,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Trash2,
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
  Open: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Processing: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "In Production": "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  Shipped: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
  Delivered: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const stats = [
  { label: "Open", value: "12", icon: Clock, change: "+3 today", color: "text-blue-600 dark:text-blue-400" },
  { label: "Processing", value: "8", icon: Package, change: "Avg 2.1 days", color: "text-amber-600 dark:text-amber-400" },
  { label: "Shipped", value: "45", icon: Truck, change: "12 this week", color: "text-purple-600 dark:text-purple-400" },
  { label: "Delivered", value: "156", icon: CheckCircle2, change: "+28 this month", color: "text-emerald-600 dark:text-emerald-400" },
];

const defaultOrders = [
  { id: "ORD-4821", contractor: "Rivera General Contracting", items: "42\" Shaker Cabinets (12), Crown Molding", total: 18450, status: "Open", date: "2026-03-20" },
  { id: "ORD-4820", contractor: "Summit Builders LLC", items: "Quartz Countertop - Calacatta (3 slabs)", total: 8720, status: "Processing", date: "2026-03-19" },
  { id: "ORD-4819", contractor: "Harbor View Construction", items: "36\" Base Cabinets (8), Soft-Close Hinges", total: 12340, status: "Shipped", date: "2026-03-18" },
  { id: "ORD-4817", contractor: "Brooks Design-Build", items: "Bathroom Vanity 60\" Double Sink", total: 3280, status: "Delivered", date: "2026-03-17" },
  { id: "ORD-4815", contractor: "Whitfield Custom Homes", items: "Custom Island - Walnut w/ Waterfall Edge", total: 14500, status: "In Production", date: "2026-03-16" },
  { id: "ORD-4813", contractor: "Lone Star Renovations", items: "Wall Cabinets 30\" (6), Lazy Susan Corner", total: 9870, status: "Open", date: "2026-03-16" },
  { id: "ORD-4810", contractor: "Parkway Home Design", items: "Under-Cabinet LED Lighting Kit (4)", total: 1240, status: "Shipped", date: "2026-03-15" },
  { id: "ORD-4808", contractor: "Castillo Landscape Design", items: "Outdoor Kitchen Cabinet Set - Stainless", total: 22100, status: "Processing", date: "2026-03-14" },
  { id: "ORD-4805", contractor: "Rivera General Contracting", items: "Granite Countertop - Absolute Black (2)", total: 6450, status: "Delivered", date: "2026-03-13" },
  { id: "ORD-4802", contractor: "Summit Builders LLC", items: "Pantry Cabinet 84\" Tall (2), Pull-Out Shelves", total: 5680, status: "Shipped", date: "2026-03-12" },
];

const contractorOptions = [
  "Rivera General Contracting",
  "Summit Builders LLC",
  "Harbor View Construction",
  "Brooks Design-Build",
  "Whitfield Custom Homes",
  "Lone Star Renovations",
  "Parkway Home Design",
  "Castillo Landscape Design",
];

interface LineItem {
  product: string;
  sku: string;
  qty: number;
  unitPrice: number;
}

const emptyLineItem = (): LineItem => ({ product: "", sku: "", qty: 1, unitPrice: 0 });

interface OrderForm {
  contractor: string;
  poNumber: string;
  lineItems: LineItem[];
  shipping: string;
  notes: string;
}

const defaultForm = (): OrderForm => ({
  contractor: "",
  poNumber: "",
  lineItems: [emptyLineItem()],
  shipping: "standard",
  notes: "",
});

export default function OrdersPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState(defaultOrders);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(defaultForm());
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !["dealer", "rep"].includes(persona)) {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || !["dealer", "rep"].includes(persona)) return null;

  const filtered = orders.filter((o) => {
    const matchesSearch = o.contractor.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || o.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  const updateLineItem = (idx: number, field: keyof LineItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.lineItems];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, lineItems: items };
    });
  };

  const addLineItem = () => {
    setForm((prev) => ({ ...prev, lineItems: [...prev.lineItems, emptyLineItem()] }));
  };

  const removeLineItem = (idx: number) => {
    if (form.lineItems.length <= 1) return;
    setForm((prev) => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.contractor) newErrors.contractor = true;
    if (form.lineItems.every((li) => !li.product.trim())) newErrors.lineItems = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const total = form.lineItems.reduce((sum, li) => sum + li.qty * li.unitPrice, 0);
    const itemsSummary = form.lineItems
      .filter((li) => li.product.trim())
      .map((li) => `${li.product} (${li.qty})`)
      .join(", ");

    const nextNum = 4822 + orders.length - defaultOrders.length;
    const newOrder = {
      id: `ORD-${nextNum}`,
      contractor: form.contractor,
      items: itemsSummary,
      total,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setDialogOpen(false);
    setForm(defaultForm());
    setErrors({});
    toast.success(`Order ${newOrder.id} created`);
  };

  const inputClass = "glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60";
  const errorClass = "border-red-500/50 ring-1 ring-red-500/30";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage your order queue</p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Order
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
          {expandedCard === "Open" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Open Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Contractor</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Total</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Days Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { order: "ORD-4821", contractor: "Rivera General Contracting", total: "$18,450", days: "3" },
                      { order: "ORD-4813", contractor: "Lone Star Renovations", total: "$9,870", days: "7" },
                      { order: "ORD-4825", contractor: "Whitfield Custom Homes", total: "$6,200", days: "1" },
                      { order: "ORD-4826", contractor: "Parkway Home Design", total: "$3,450", days: "1" },
                      { order: "ORD-4824", contractor: "Harbor View Construction", total: "$11,300", days: "2" },
                    ].map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-muted-foreground">{row.contractor}</td>
                        <td className="py-2 text-right text-foreground font-medium">{row.total}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {expandedCard === "Processing" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Orders in Processing</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Contractor</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Est. Ship Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { order: "ORD-4820", contractor: "Summit Builders LLC", ship: "Mar 25" },
                      { order: "ORD-4819", contractor: "Harbor View Construction", ship: "Mar 24" },
                      { order: "ORD-4815", contractor: "Whitfield Custom Homes", ship: "Mar 26" },
                      { order: "ORD-4808", contractor: "Castillo Landscape Design", ship: "Mar 23" },
                    ].map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-muted-foreground">{row.contractor}</td>
                        <td className="py-2 text-right text-amber-600 dark:text-amber-400">{row.ship}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {expandedCard === "Shipped" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Recently Shipped</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Order #</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Tracking Status</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">ETA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { order: "ORD-4818", status: "In Transit", eta: "Mar 23" },
                      { order: "ORD-4816", status: "In Transit", eta: "Mar 22" },
                      { order: "ORD-4814", status: "Out for Delivery", eta: "Mar 21" },
                      { order: "ORD-4811", status: "In Transit", eta: "Mar 24" },
                      { order: "ORD-4810", status: "Out for Delivery", eta: "Mar 21" },
                    ].map((row) => (
                      <tr key={row.order} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.order}</td>
                        <td className="py-2 text-purple-600 dark:text-purple-400">{row.status}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {expandedCard === "Delivered" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">March Deliveries</h3>
              <div className="space-y-3">
                {[
                  { week: "Week 1 (Mar 1-7)", count: 34, onTime: "94%" },
                  { week: "Week 2 (Mar 8-14)", count: 41, onTime: "97%" },
                  { week: "Week 3 (Mar 15-21)", count: 48, onTime: "92%" },
                  { week: "Week 4 (Mar 22+)", count: 33, onTime: "96%" },
                ].map((row) => (
                  <div key={row.week} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <p className="text-sm text-foreground">{row.week}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground">{row.count} delivered</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">{row.onTime} on-time</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">Total</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-foreground">156 delivered</span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">95% on-time</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50" />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="glass w-[160px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="in production">In Production</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-border" />

      <Card className="glass border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Order #</TableHead>
              <TableHead className="text-muted-foreground">Contractor</TableHead>
              <TableHead className="text-muted-foreground hidden lg:table-cell">Items</TableHead>
              <TableHead className="text-muted-foreground text-right">Total</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((order) => (
              <TableRow key={order.id} className="border-border transition-colors hover:bg-foreground/[0.03] cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)}>
                <TableCell className="font-medium text-foreground"><Link href={`/orders/${order.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 hover:underline" onClick={(e) => e.stopPropagation()}>{order.id}</Link></TableCell>
                <TableCell className="text-muted-foreground">{order.contractor}</TableCell>
                <TableCell className="text-muted-foreground text-sm hidden lg:table-cell max-w-[280px] truncate">{order.items}</TableCell>
                <TableCell className="text-right font-medium text-foreground">${order.total.toLocaleString()}</TableCell>
                <TableCell><Badge variant="outline" className={statusColors[order.status]}>{order.status}</Badge></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* New Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              New Order
            </DialogTitle>
            <DialogDescription>
              Create a new order by filling in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Contractor & PO */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Contractor <span className="text-red-600 dark:text-red-400">*</span>
                </label>
                <Select value={form.contractor} onValueChange={(v) => { setForm((p) => ({ ...p, contractor: v ?? "" })); setErrors((p) => ({ ...p, contractor: false })); }}>
                  <SelectTrigger className={`w-full ${inputClass} ${errors.contractor ? errorClass : ""}`}>
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    {contractorOptions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contractor && <p className="text-xs text-red-600 dark:text-red-400 mt-1">Required</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">PO Number</label>
                <Input placeholder="Optional PO #" value={form.poNumber} onChange={(e) => setForm((p) => ({ ...p, poNumber: e.target.value }))} className={inputClass} />
              </div>
            </div>

            <Separator className="bg-border" />

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Line Items</h3>
                </div>
                <Button type="button" variant="outline" size="sm" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10 gap-1 text-xs" onClick={addLineItem}>
                  <Plus className="h-3 w-3" /> Add Item
                </Button>
              </div>
              {errors.lineItems && <p className="text-xs text-red-600 dark:text-red-400 mb-2">At least one product is required</p>}
              <div className="space-y-2">
                {form.lineItems.map((li, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_100px_60px_80px_32px] gap-2 items-end">
                    <div>
                      {idx === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Product</label>}
                      <Input placeholder="Product name" value={li.product} onChange={(e) => { updateLineItem(idx, "product", e.target.value); setErrors((p) => ({ ...p, lineItems: false })); }} className={inputClass} />
                    </div>
                    <div>
                      {idx === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">SKU</label>}
                      <Input placeholder="SKU" value={li.sku} onChange={(e) => updateLineItem(idx, "sku", e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      {idx === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Qty</label>}
                      <Input type="number" min={1} value={li.qty} onChange={(e) => updateLineItem(idx, "qty", parseInt(e.target.value) || 1)} className={inputClass} />
                    </div>
                    <div>
                      {idx === 0 && <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Unit $</label>}
                      <Input type="number" min={0} step={0.01} value={li.unitPrice || ""} onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-red-600 dark:text-red-400 mt-auto" onClick={() => removeLineItem(idx)} disabled={form.lineItems.length <= 1}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              {form.lineItems.some((li) => li.unitPrice > 0) && (
                <div className="flex justify-end mt-2 text-sm font-medium text-foreground">
                  Total: ${form.lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0).toLocaleString()}
                </div>
              )}
            </div>

            <Separator className="bg-border" />

            {/* Shipping & Notes */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Shipping Method</label>
                <Select value={form.shipping} onValueChange={(v) => setForm((p) => ({ ...p, shipping: v ?? "standard" }))}>
                  <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="expedited">Expedited</SelectItem>
                    <SelectItem value="will-call">Will Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
                <textarea
                  placeholder="Order notes..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className={`w-full rounded-lg px-2.5 py-1.5 text-sm resize-none ${inputClass}`}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => { setDialogOpen(false); setForm(defaultForm()); setErrors({}); }}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleSubmit}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
