"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Grid3X3,
  Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories: Record<string, string> = {
  Cabinets: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Countertops: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Appliances: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const products = [
  { name: "Shaker Base Cabinet 36\"", sku: "CAB-SHK-36B", category: "Cabinets", price: "$420 - $580", manufacturer: "Apex Cabinetry Co.", color: "bg-indigo-500/10" },
  { name: "Shaker Wall Cabinet 30\"", sku: "CAB-SHK-30W", category: "Cabinets", price: "$310 - $450", manufacturer: "Apex Cabinetry Co.", color: "bg-indigo-500/10" },
  { name: "Lazy Susan Corner Unit", sku: "CAB-LSU-36", category: "Cabinets", price: "$680 - $890", manufacturer: "Apex Cabinetry Co.", color: "bg-indigo-500/10" },
  { name: "Tall Pantry Cabinet 84\"", sku: "CAB-PNT-84T", category: "Cabinets", price: "$1,200 - $1,650", manufacturer: "Heritage Woodworks", color: "bg-indigo-500/10" },
  { name: "Quartz - Calacatta Laza", sku: "CTR-QTZ-CL", category: "Countertops", price: "$72 - $95/sqft", manufacturer: "StoneVista Surfaces", color: "bg-emerald-500/10" },
  { name: "Granite - Absolute Black", sku: "CTR-GRN-AB", category: "Countertops", price: "$55 - $80/sqft", manufacturer: "StoneVista Surfaces", color: "bg-emerald-500/10" },
  { name: "Butcher Block - Walnut", sku: "CTR-BBK-WN", category: "Countertops", price: "$45 - $65/sqft", manufacturer: "Heritage Woodworks", color: "bg-emerald-500/10" },
  { name: "Marble - Carrara White", sku: "CTR-MBL-CW", category: "Countertops", price: "$85 - $120/sqft", manufacturer: "StoneVista Surfaces", color: "bg-emerald-500/10" },
  { name: "36\" Gas Range - Pro Series", sku: "APL-RNG-36P", category: "Appliances", price: "$3,200 - $4,100", manufacturer: "ThermalPro", color: "bg-amber-500/10" },
  { name: "French Door Refrigerator", sku: "APL-REF-FD", category: "Appliances", price: "$2,800 - $3,600", manufacturer: "ThermalPro", color: "bg-amber-500/10" },
  { name: "Built-In Dishwasher", sku: "APL-DW-BI", category: "Appliances", price: "$1,100 - $1,500", manufacturer: "CleanEdge", color: "bg-amber-500/10" },
  { name: "Wall-Mount Range Hood", sku: "APL-RHD-WM", category: "Appliances", price: "$890 - $1,400", manufacturer: "CleanEdge", color: "bg-amber-500/10" },
];

export default function CatalogPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !["dealer", "rep", "manufacturer"].includes(persona)) {
      router.replace("/dashboard");
    }
  }, [mounted, persona, router]);

  if (!mounted || !["dealer", "rep", "manufacturer"].includes(persona)) return null;

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "all" || p.category.toLowerCase() === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Product Catalog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and search available products</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Grid3X3 className="h-4 w-4" />
          <span>{products.length} products</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="glass border-border bg-foreground/5 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50" />
        </div>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className="glass w-[180px] border-border bg-foreground/5 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="cabinets">Cabinets</SelectItem>
            <SelectItem value="countertops">Countertops</SelectItem>
            <SelectItem value="appliances">Appliances</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <Card key={product.sku} className="glass border-border p-5 hover:bg-foreground/[0.03] hover:border-indigo-500/20 transition-all duration-300 cursor-pointer group">
            <div className={`${product.color} rounded-lg h-32 flex items-center justify-center mb-4`}>
              <Package className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground text-sm group-hover:text-indigo-300 transition-colors leading-tight">{product.name}</h3>
                <Badge variant="outline" className={`${categories[product.category]} text-[10px] shrink-0`}>{product.category}</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
              <p className="text-sm font-medium text-foreground">{product.price}</p>
              <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
