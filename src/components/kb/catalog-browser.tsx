"use client";

import { useState, useMemo } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Replace, Cloud, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  catalogItems,
  manufacturers,
  type CatalogItem,
  type CabinetCategory,
  type Availability,
} from "@/data/kb/catalog-data";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface CatalogBrowserProps {
  onAddItem: (item: CatalogItem) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const CATEGORY_FILTERS: { key: CabinetCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "base", label: "Base" },
  { key: "wall", label: "Wall" },
  { key: "tall", label: "Tall" },
  { key: "corner", label: "Corner" },
  { key: "specialty", label: "Specialty" },
];

const AVAILABILITY_STYLES: Record<Availability, { bg: string; text: string; label: string }> = {
  "in-stock": {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "In Stock",
  },
  "2-3 weeks": {
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    label: "2-3 Weeks",
  },
  "4-6 weeks": {
    bg: "bg-orange-500/15",
    text: "text-orange-600 dark:text-orange-400",
    label: "4-6 Weeks",
  },
  "special-order": {
    bg: "bg-red-500/15",
    text: "text-red-600 dark:text-red-400",
    label: "Special Order",
  },
};

const CATEGORY_LABELS: Record<CabinetCategory, string> = {
  base: "Base Cabinets",
  wall: "Wall Cabinets",
  tall: "Tall Cabinets",
  corner: "Corner Cabinets",
  specialty: "Specialty",
  vanity: "Vanity Cabinets",
};

type BrowserTab = "local" | "cloud";

/* ------------------------------------------------------------------ */
/*  Cabinet Thumbnail SVG                                               */
/* ------------------------------------------------------------------ */

function CabinetThumbnail({ category }: { category: CabinetCategory }) {
  const size = 48;
  const pad = 4;

  if (category === "base") {
    // Two-door base cabinet
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md">
        <defs>
          <linearGradient id="thumb-base" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} rx={2} fill="url(#thumb-base)" stroke="#93c5fd" strokeWidth="1" />
        {/* Two doors */}
        <rect x={pad + 2} y={pad + 2} width={(size - pad * 2) / 2 - 3} height={size - pad * 2 - 4} rx={1} fill="none" stroke="#60a5fa" strokeWidth="0.8" />
        <rect x={size / 2 + 1} y={pad + 2} width={(size - pad * 2) / 2 - 3} height={size - pad * 2 - 4} rx={1} fill="none" stroke="#60a5fa" strokeWidth="0.8" />
        {/* Handles */}
        <line x1={size / 2 - 3} y1={size / 2 - 4} x2={size / 2 - 3} y2={size / 2 + 4} stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
        <line x1={size / 2 + 3} y1={size / 2 - 4} x2={size / 2 + 3} y2={size / 2 + 4} stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === "wall") {
    // Single panel wall cabinet
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md">
        <defs>
          <linearGradient id="thumb-wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
        </defs>
        <rect x={pad} y={pad + 6} width={size - pad * 2} height={size - pad * 2 - 12} rx={2} fill="url(#thumb-wall)" stroke="#a5b4fc" strokeWidth="1" />
        <rect x={pad + 3} y={pad + 9} width={size - pad * 2 - 6} height={size - pad * 2 - 18} rx={1} fill="none" stroke="#818cf8" strokeWidth="0.8" />
        <circle cx={size / 2} cy={size / 2} r={1.5} fill="#6366f1" />
      </svg>
    );
  }

  if (category === "tall") {
    // Tall narrow panel
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md">
        <defs>
          <linearGradient id="thumb-tall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>
        <rect x={pad + 8} y={pad} width={size - pad * 2 - 16} height={size - pad * 2} rx={2} fill="url(#thumb-tall)" stroke="#c4b5fd" strokeWidth="1" />
        <rect x={pad + 11} y={pad + 3} width={size - pad * 2 - 22} height={size - pad * 2 - 6} rx={1} fill="none" stroke="#a78bfa" strokeWidth="0.8" />
        <line x1={size / 2} y1={pad + 6} x2={size / 2} y2={pad + 12} stroke="#8b5cf6" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === "corner") {
    // L-shape
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md">
        <defs>
          <linearGradient id="thumb-corner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <path
          d={`M ${pad} ${pad} L ${size - pad} ${pad} L ${size - pad} ${size / 2} L ${size / 2} ${size / 2} L ${size / 2} ${size - pad} L ${pad} ${size - pad} Z`}
          fill="url(#thumb-corner)" stroke="#93c5fd" strokeWidth="1"
        />
        <circle cx={size / 2 - 6} cy={size / 2 - 6} r={1.5} fill="#3b82f6" />
      </svg>
    );
  }

  // Default (specialty, vanity)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md">
      <defs>
        <linearGradient id="thumb-default" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} rx={2} fill="url(#thumb-default)" stroke="#cbd5e1" strokeWidth="1" />
      <rect x={pad + 3} y={pad + 3} width={size - pad * 2 - 6} height={size - pad * 2 - 6} rx={1} fill="none" stroke="#94a3b8" strokeWidth="0.8" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Card                                                        */
/* ------------------------------------------------------------------ */

function ProductCard({
  item,
  onAdd,
}: {
  item: CatalogItem;
  onAdd: () => void;
}) {
  const avail = AVAILABILITY_STYLES[item.availability];

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/50 bg-white dark:bg-muted/10 p-3 hover:border-blue-300 dark:hover:border-muted-foreground/20 hover:bg-blue-50/50 dark:hover:bg-muted/20 transition-all">
      {/* Thumbnail */}
      <div className="shrink-0">
        <CabinetThumbnail category={item.cabinetType} />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 dark:text-foreground truncate">
          {item.name}
        </p>
        <p className="text-[10px] font-mono text-slate-500 dark:text-muted-foreground/60 mt-0.5">
          {item.sku}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600 dark:text-muted-foreground">
          <span>
            {item.width}&quot;W x {item.depth}&quot;D x {item.height}&quot;H
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ${item.listPrice}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${avail.bg} ${avail.text}`}
          >
            {avail.label}
          </span>
        </div>
      </div>

      {/* Add button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
        title="Add to Design"
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
      >
        <Plus className="size-4 text-blue-500" />
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function CatalogBrowser({ onAddItem, className }: CatalogBrowserProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    CabinetCategory | "all"
  >("all");
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("all");
  const [browserTab, setBrowserTab] = useState<BrowserTab>("local");
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = catalogItems;

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter((i) => i.cabinetType === categoryFilter);
    }

    // Manufacturer filter
    if (manufacturerFilter !== "all") {
      items = items.filter((i) => i.manufacturer === manufacturerFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.manufacturer.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      );
    }

    return items;
  }, [search, categoryFilter, manufacturerFilter]);

  // Group by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, CatalogItem[]> = {};
    for (const item of filteredItems) {
      const key = item.cabinetType;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [filteredItems]);

  const groupKeys = Object.keys(groupedItems) as CabinetCategory[];

  // Breadcrumb logic
  const handleCategoryClick = (cat: CabinetCategory | "all") => {
    setCategoryFilter(cat);
    if (cat === "all") {
      setBreadcrumb([]);
    } else {
      setBreadcrumb([CATEGORY_LABELS[cat] || cat]);
    }
  };

  const handleBreadcrumbBack = () => {
    setCategoryFilter("all");
    setBreadcrumb([]);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Local / Cloud tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setBrowserTab("local")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-all ${
            browserTab === "local"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
              : "text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground"
          }`}
        >
          <HardDrive className="size-3" />
          Local
        </button>
        <button
          onClick={() => setBrowserTab("cloud")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-all ${
            browserTab === "cloud"
              ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
              : "text-slate-500 dark:text-muted-foreground hover:text-slate-700 dark:hover:text-foreground"
          }`}
        >
          <Cloud className="size-3" />
          Cloud
        </button>
      </div>

      {browserTab === "cloud" ? (
        /* Cloud browser placeholder */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Cloud className="size-10 text-slate-300 dark:text-muted-foreground/20 mb-3" />
          <p className="text-xs font-medium text-slate-600 dark:text-muted-foreground">
            Cloud Browser
          </p>
          <p className="text-[10px] text-slate-400 dark:text-muted-foreground/50 mt-1">
            Connect to manufacturer cloud catalogs for 1000+ products with live thumbnails
          </p>
          <Button variant="outline" size="sm" className="mt-4 text-[11px]">
            Connect Catalog
          </Button>
        </div>
      ) : (
        <>
          {/* Breadcrumb navigation */}
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-1 text-[11px]">
              {breadcrumb.length > 0 ? (
                <>
                  <button
                    onClick={handleBreadcrumbBack}
                    className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    <ChevronLeft className="size-3" />
                    Categories
                  </button>
                  <ChevronRight className="size-3 text-slate-400 dark:text-muted-foreground/40" />
                  <span className="text-slate-700 dark:text-foreground font-medium">
                    {breadcrumb[breadcrumb.length - 1]}
                  </span>
                </>
              ) : (
                <span className="text-slate-600 dark:text-muted-foreground font-medium flex items-center gap-1">
                  <ChevronLeft className="size-3 text-slate-400 dark:text-muted-foreground/40" />
                  Categories
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pt-2 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 dark:text-muted-foreground/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cabinets..."
                className="w-full rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-muted/30 pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-foreground placeholder:text-slate-400 dark:placeholder:text-muted-foreground/50 focus:border-blue-400 dark:focus:border-primary focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-primary"
              />
            </div>
          </div>

          {/* Category filter chips */}
          <div className="px-4 pb-2 flex flex-wrap gap-1">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => handleCategoryClick(f.key)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                  categoryFilter === f.key
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-muted/30 text-slate-600 dark:text-muted-foreground hover:text-slate-800 dark:hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Manufacturer filter */}
          <div className="px-4 pb-3">
            <select
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-border bg-white dark:bg-muted/30 px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-foreground focus:border-blue-400 dark:focus:border-primary focus:outline-none focus:ring-1 focus:ring-blue-400 dark:focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="all">All Manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Product list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {groupKeys.map((cat) => (
              <div key={cat}>
                {/* Sticky group header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-[var(--background)] pb-2 pt-1">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-muted-foreground/60 font-semibold">
                    {CATEGORY_LABELS[cat] ?? cat} ({groupedItems[cat].length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {groupedItems[cat].map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      onAdd={() => onAddItem(item)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="size-8 text-slate-300 dark:text-muted-foreground/20 mb-3" />
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
                  No items match your search
                </p>
                <p className="text-[10px] text-slate-400 dark:text-muted-foreground/50 mt-1">
                  Try adjusting filters or search terms
                </p>
              </div>
            )}
          </div>

          {/* Bottom bar: count + action buttons */}
          <div className="border-t border-border px-4 py-2.5 space-y-2">
            <p className="text-[10px] text-slate-500 dark:text-muted-foreground/50 text-center">
              Showing {filteredItems.length} of {catalogItems.length} items
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10"
              >
                <Replace className="size-3" />
                Replace
              </Button>
              <Button
                size="sm"
                className="flex-1 gap-1.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="size-3" />
                Add
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
