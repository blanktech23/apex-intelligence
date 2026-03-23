"use client";

import { useEffect, useState } from "react";
import { usePersona } from "@/lib/persona-context";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Grid3X3,
  Package,
  X,
  ShoppingCart,
  FileText,
  Ruler,
  Palette,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

const categories: Record<string, string> = {
  Cabinets: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Countertops: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Appliances: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const categoryGradients: Record<string, string> = {
  Cabinets: "from-indigo-600/40 to-violet-600/20",
  Countertops: "from-emerald-600/40 to-teal-600/20",
  Appliances: "from-amber-600/40 to-orange-600/20",
};

const products = [
  {
    name: 'Shaker Base Cabinet 36"',
    sku: "CAB-SHK-36B",
    category: "Cabinets",
    price: "$420 - $580",
    manufacturer: "Ridgewood Cabinetry",
    color: "bg-indigo-500/10",
    dimensions: '36"W x 24"D x 34.5"H',
    material: "Solid Maple",
    finishOptions: ["Natural", "White", "Gray", "Espresso"],
    weight: "85 lbs",
    leadTime: "4-6 weeks",
  },
  {
    name: 'Shaker Wall Cabinet 30"',
    sku: "CAB-SHK-30W",
    category: "Cabinets",
    price: "$310 - $450",
    manufacturer: "Ridgewood Cabinetry",
    color: "bg-indigo-500/10",
    dimensions: '30"W x 12"D x 30"H',
    material: "Solid Maple",
    finishOptions: ["Natural", "White", "Gray", "Espresso"],
    weight: "42 lbs",
    leadTime: "4-6 weeks",
  },
  {
    name: "Lazy Susan Corner Unit",
    sku: "CAB-LSU-36",
    category: "Cabinets",
    price: "$680 - $890",
    manufacturer: "Ridgewood Cabinetry",
    color: "bg-indigo-500/10",
    dimensions: '36"W x 36"D x 34.5"H',
    material: "Solid Maple + Melamine Interior",
    finishOptions: ["Natural", "White", "Gray"],
    weight: "110 lbs",
    leadTime: "4-5 weeks",
  },
  {
    name: 'Tall Pantry Cabinet 84"',
    sku: "CAB-PNT-84T",
    category: "Cabinets",
    price: "$1,200 - $1,650",
    manufacturer: "Heritage Woodworks",
    color: "bg-indigo-500/10",
    dimensions: '24"W x 24"D x 84"H',
    material: "Solid Cherry",
    finishOptions: ["Natural Cherry", "Mocha", "Ebony"],
    weight: "165 lbs",
    leadTime: "5-6 weeks",
  },
  {
    name: "Quartz - Calacatta Laza",
    sku: "CTR-QTZ-CL",
    category: "Countertops",
    price: "$72 - $95/sqft",
    manufacturer: "StoneVista Surfaces",
    color: "bg-emerald-500/10",
    dimensions: "Custom cut to spec",
    material: "Engineered Quartz",
    finishOptions: ["Polished", "Honed", "Leathered"],
    weight: "20 lbs/sqft",
    leadTime: "2-3 weeks",
  },
  {
    name: "Granite - Absolute Black",
    sku: "CTR-GRN-AB",
    category: "Countertops",
    price: "$55 - $80/sqft",
    manufacturer: "StoneVista Surfaces",
    color: "bg-emerald-500/10",
    dimensions: "Custom cut to spec",
    material: "Natural Granite",
    finishOptions: ["Polished", "Honed", "Flamed"],
    weight: "18 lbs/sqft",
    leadTime: "2-3 weeks",
  },
  {
    name: "Butcher Block - Walnut",
    sku: "CTR-BBK-WN",
    category: "Countertops",
    price: "$45 - $65/sqft",
    manufacturer: "Heritage Woodworks",
    color: "bg-emerald-500/10",
    dimensions: '1.5" thick, custom length',
    material: "Solid American Walnut",
    finishOptions: ["Oil Finish", "Polyurethane", "Waterlox"],
    weight: "8 lbs/sqft",
    leadTime: "3-4 weeks",
  },
  {
    name: "Marble - Carrara White",
    sku: "CTR-MBL-CW",
    category: "Countertops",
    price: "$85 - $120/sqft",
    manufacturer: "StoneVista Surfaces",
    color: "bg-emerald-500/10",
    dimensions: "Custom cut to spec",
    material: "Natural Italian Marble",
    finishOptions: ["Polished", "Honed"],
    weight: "19 lbs/sqft",
    leadTime: "4-6 weeks",
  },
  {
    name: '36" Gas Range - Pro Series',
    sku: "APL-RNG-36P",
    category: "Appliances",
    price: "$3,200 - $4,100",
    manufacturer: "ThermalPro",
    color: "bg-amber-500/10",
    dimensions: '36"W x 27"D x 36"H',
    material: "Stainless Steel",
    finishOptions: ["Stainless", "Black Stainless", "Matte White"],
    weight: "210 lbs",
    leadTime: "1-2 weeks",
  },
  {
    name: "French Door Refrigerator",
    sku: "APL-REF-FD",
    category: "Appliances",
    price: "$2,800 - $3,600",
    manufacturer: "ThermalPro",
    color: "bg-amber-500/10",
    dimensions: '36"W x 29"D x 70"H',
    material: "Stainless Steel",
    finishOptions: ["Stainless", "Black Stainless", "Panel Ready"],
    weight: "295 lbs",
    leadTime: "1-2 weeks",
  },
  {
    name: "Built-In Dishwasher",
    sku: "APL-DW-BI",
    category: "Appliances",
    price: "$1,100 - $1,500",
    manufacturer: "CleanEdge",
    color: "bg-amber-500/10",
    dimensions: '24"W x 24"D x 34"H',
    material: "Stainless Steel Interior",
    finishOptions: ["Stainless", "Panel Ready", "Black"],
    weight: "75 lbs",
    leadTime: "1-2 weeks",
  },
  {
    name: "Wall-Mount Range Hood",
    sku: "APL-RHD-WM",
    category: "Appliances",
    price: "$890 - $1,400",
    manufacturer: "CleanEdge",
    color: "bg-amber-500/10",
    dimensions: '30"W x 20"D x 10"H',
    material: "Stainless Steel / Tempered Glass",
    finishOptions: ["Stainless", "Black", "White"],
    weight: "45 lbs",
    leadTime: "1-2 weeks",
  },
];

type Product = typeof products[0];

interface AddToOrderForm {
  qty: number;
  finish: string;
  notes: string;
}

interface QuoteForm {
  company: string;
  contactEmail: string;
  qty: number;
  requirements: string;
}

export default function CatalogPage() {
  const { persona } = usePersona();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add to Order dialog
  const [addToOrderOpen, setAddToOrderOpen] = useState(false);
  const [addToOrderProduct, setAddToOrderProduct] = useState<Product | null>(null);
  const [addToOrderForm, setAddToOrderForm] = useState<AddToOrderForm>({ qty: 1, finish: "", notes: "" });

  // Request Quote dialog
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>({ company: "", contactEmail: "", qty: 1, requirements: "" });
  const [quoteErrors, setQuoteErrors] = useState<Record<string, boolean>>({});

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

  const openAddToOrder = (product: Product) => {
    setAddToOrderProduct(product);
    setAddToOrderForm({ qty: 1, finish: product.finishOptions[0] || "", notes: "" });
    setAddToOrderOpen(true);
  };

  const handleAddToOrder = () => {
    if (!addToOrderProduct) return;
    toast.success(`Added ${addToOrderForm.qty}x ${addToOrderProduct.name} to order`);
    setAddToOrderOpen(false);
    setAddToOrderProduct(null);
  };

  const openQuote = (product: Product) => {
    setQuoteProduct(product);
    setQuoteForm({ company: "", contactEmail: "", qty: 1, requirements: "" });
    setQuoteErrors({});
    setQuoteOpen(true);
  };

  const handleQuote = () => {
    if (!quoteProduct) return;
    const newErrors: Record<string, boolean> = {};
    if (!quoteForm.company.trim()) newErrors.company = true;
    if (!quoteForm.contactEmail.trim()) newErrors.contactEmail = true;

    if (Object.keys(newErrors).length > 0) {
      setQuoteErrors(newErrors);
      return;
    }

    toast.success(`Quote request sent for ${quoteProduct.name}`);
    setQuoteOpen(false);
    setQuoteProduct(null);
  };

  const inputClass = "glass border-border bg-foreground/5 text-foreground placeholder:text-muted-foreground/60";
  const errorClass = "border-red-500/50 ring-1 ring-red-500/30";

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
          <Card
            key={product.sku}
            className="glass border-border p-5 hover:bg-foreground/[0.03] hover:border-indigo-500/20 transition-all duration-300 cursor-pointer group"
            onClick={() => setSelectedProduct(product)}
          >
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

      {/* Product Detail Slide-Out Panel */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          />
          <div className="relative z-10 w-full max-w-md h-full overflow-y-auto border-l border-border bg-background/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 rounded-lg bg-foreground/5 p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className={`h-56 bg-gradient-to-br ${categoryGradients[selectedProduct.category]} flex items-center justify-center`}>
              <Package className="h-16 w-16 text-white/30" />
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Badge variant="outline" className={`${categories[selectedProduct.category]} text-[10px] mb-3`}>
                  {selectedProduct.category}
                </Badge>
                <h2 className="text-xl font-bold text-foreground">{selectedProduct.name}</h2>
                <p className="text-sm text-muted-foreground font-mono mt-1">{selectedProduct.sku}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedProduct.manufacturer}</p>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pricing</h3>
                <p className="text-2xl font-bold text-foreground">{selectedProduct.price}</p>
                <p className="text-xs text-muted-foreground mt-1">Lead time: {selectedProduct.leadTime}</p>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Specifications</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2 mt-0.5">
                      <Ruler className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dimensions</p>
                      <p className="text-sm text-foreground">{selectedProduct.dimensions}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2 mt-0.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Material</p>
                      <p className="text-sm text-foreground">{selectedProduct.material}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2 mt-0.5">
                      <Package className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="text-sm text-foreground">{selectedProduct.weight}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  <Palette className="h-3.5 w-3.5 inline mr-1.5 text-indigo-400" />
                  Finish Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.finishOptions.map((finish) => (
                    <Badge
                      key={finish}
                      variant="outline"
                      className="bg-foreground/5 text-muted-foreground border-border text-xs"
                    >
                      {finish}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-3 pb-6">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                  onClick={() => openAddToOrder(selectedProduct)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border bg-foreground/5 text-foreground hover:bg-foreground/10 gap-2"
                  onClick={() => openQuote(selectedProduct)}
                >
                  <FileText className="h-4 w-4" />
                  Request Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Order Dialog */}
      <Dialog open={addToOrderOpen} onOpenChange={setAddToOrderOpen}>
        <DialogContent className="sm:max-w-sm glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <ShoppingCart className="h-4 w-4 text-indigo-400" />
              </div>
              Add to Order
            </DialogTitle>
            <DialogDescription>
              {addToOrderProduct?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
              <Input
                type="number"
                min={1}
                value={addToOrderForm.qty}
                onChange={(e) => setAddToOrderForm((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                className={inputClass}
              />
            </div>
            {addToOrderProduct && addToOrderProduct.finishOptions.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Finish</label>
                <Select value={addToOrderForm.finish} onValueChange={(v) => setAddToOrderForm((p) => ({ ...p, finish: v ?? "" }))}>
                  <SelectTrigger className={`w-full ${inputClass}`}>
                    <SelectValue placeholder="Select finish" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-border bg-popover">
                    {addToOrderProduct.finishOptions.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <textarea
                placeholder="Special instructions..."
                value={addToOrderForm.notes}
                onChange={(e) => setAddToOrderForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                className={`w-full rounded-lg px-2.5 py-1.5 text-sm resize-none ${inputClass}`}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => setAddToOrderOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleAddToOrder}>
              Add to Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Quote Dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="sm:max-w-sm glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <FileText className="h-4 w-4 text-indigo-400" />
              </div>
              Request Quote
            </DialogTitle>
            <DialogDescription>
              {quoteProduct?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Company Name <span className="text-red-400">*</span>
              </label>
              <Input
                placeholder="Your company"
                value={quoteForm.company}
                onChange={(e) => { setQuoteForm((p) => ({ ...p, company: e.target.value })); setQuoteErrors((p) => ({ ...p, company: false })); }}
                className={`${inputClass} ${quoteErrors.company ? errorClass : ""}`}
              />
              {quoteErrors.company && <p className="text-xs text-red-400 mt-1">Required</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Contact Email <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                placeholder="email@company.com"
                value={quoteForm.contactEmail}
                onChange={(e) => { setQuoteForm((p) => ({ ...p, contactEmail: e.target.value })); setQuoteErrors((p) => ({ ...p, contactEmail: false })); }}
                className={`${inputClass} ${quoteErrors.contactEmail ? errorClass : ""}`}
              />
              {quoteErrors.contactEmail && <p className="text-xs text-red-400 mt-1">Required</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
              <Input
                type="number"
                min={1}
                value={quoteForm.qty}
                onChange={(e) => setQuoteForm((p) => ({ ...p, qty: parseInt(e.target.value) || 1 }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Special Requirements</label>
              <textarea
                placeholder="Custom dimensions, bulk pricing, etc."
                value={quoteForm.requirements}
                onChange={(e) => setQuoteForm((p) => ({ ...p, requirements: e.target.value }))}
                rows={3}
                className={`w-full rounded-lg px-2.5 py-1.5 text-sm resize-none ${inputClass}`}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => setQuoteOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleQuote}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
