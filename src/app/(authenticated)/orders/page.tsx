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
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Processing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const stats = [
  { label: "Open", value: "12", icon: Clock, change: "+3 today", color: "text-blue-400" },
  { label: "Processing", value: "8", icon: Package, change: "Avg 2.1 days", color: "text-amber-400" },
  { label: "Shipped", value: "45", icon: Truck, change: "12 this week", color: "text-purple-400" },
  { label: "Delivered", value: "156", icon: CheckCircle2, change: "+28 this month", color: "text-emerald-400" },
];

const orders = [
  { id: "ORD-4821", contractor: "Rivera General Contracting", items: "42\" Shaker Cabinets (12), Crown Molding", total: 18450, status: "Open", date: "2026-03-20" },
  { id: "ORD-4820", contractor: "Summit Builders LLC", items: "Quartz Countertop - Calacatta (3 slabs)", total: 8720, status: "Processing", date: "2026-03-19" },
  { id: "ORD-4819", contractor: "Harbor View Construction", items: "36\" Base Cabinets (8), Soft-Close Hinges", total: 12340, status: "Shipped", date: "2026-03-18" },
  { id: "ORD-4817", contractor: "Brooks Concrete & Masonry", items: "Bathroom Vanity 60\" Double Sink", total: 3280, status: "Delivered", date: "2026-03-17" },
  { id: "ORD-4815", contractor: "Whitfield Custom Homes", items: "Custom Island - Walnut w/ Waterfall Edge", total: 14500, status: "Processing", date: "2026-03-16" },
  { id: "ORD-4813", contractor: "Lone Star Foundations", items: "Wall Cabinets 30\" (6), Lazy Susan Corner", total: 9870, status: "Open", date: "2026-03-16" },
  { id: "ORD-4810", contractor: "Parkway Electrical Services", items: "Under-Cabinet LED Lighting Kit (4)", total: 1240, status: "Shipped", date: "2026-03-15" },
  { id: "ORD-4808", contractor: "Castillo Landscape Design", items: "Outdoor Kitchen Cabinet Set - Stainless", total: 22100, status: "Processing", date: "2026-03-14" },
  { id: "ORD-4805", contractor: "Rivera General Contracting", items: "Granite Countertop - Absolute Black (2)", total: 6450, status: "Delivered", date: "2026-03-13" },
  { id: "ORD-4802", contractor: "Summit Builders LLC", items: "Pantry Cabinet 84\" Tall (2), Pull-Out Shelves", total: 5680, status: "Shipped", date: "2026-03-12" },
];

export default function OrdersPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage your order queue</p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-white gap-2" onClick={() => toast.success("Order created successfully")}>
          <Plus className="h-4 w-4" />
          New Order
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
                <TableCell className="font-medium text-foreground"><Link href={`/orders/${order.id}`} className="text-indigo-400 hover:text-indigo-300 hover:underline" onClick={(e) => e.stopPropagation()}>{order.id}</Link></TableCell>
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
    </div>
  );
}
