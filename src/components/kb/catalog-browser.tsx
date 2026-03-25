"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Package } from "lucide-react";
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
    text: "text-emerald-400",
    label: "In Stock",
  },
  "2-3 weeks": {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    label: "2-3 Weeks",
  },
  "4-6 weeks": {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    label: "4-6 Weeks",
  },
  "special-order": {
    bg: "bg-red-500/15",
    text: "text-red-400",
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
    <div className="group flex items-start gap-3 rounded-lg border border-border/50 bg-muted/10 p-3 hover:border-muted-foreground/20 hover:bg-muted/20 transition-all">
      {/* Thumbnail placeholder */}
      <div className="h-12 w-12 shrink-0 rounded-md bg-gradient-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center">
        <Package className="size-5 text-indigo-400/40" />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">
          {item.name}
        </p>
        <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
          {item.sku}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>
            {item.width}&quot;W x {item.depth}&quot;D x {item.height}&quot;H
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400">
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
        <Plus className="size-4 text-indigo-400" />
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cabinets..."
            className="w-full rounded-lg border border-border bg-muted/30 pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="px-4 pb-2 flex flex-wrap gap-1">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setCategoryFilter(f.key)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
              categoryFilter === f.key
                ? "bg-indigo-600 text-white"
                : "bg-muted/30 text-muted-foreground hover:text-foreground"
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
          className="w-full rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
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
            <div className="sticky top-0 z-10 bg-[var(--background)] pb-2 pt-1">
              <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
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
            <Search className="size-8 text-muted-foreground/20 mb-3" />
            <p className="text-xs text-muted-foreground">
              No items match your search
            </p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Try adjusting filters or search terms
            </p>
          </div>
        )}
      </div>

      {/* Item count */}
      <div className="border-t border-border px-4 py-2">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Showing {filteredItems.length} of {catalogItems.length} items
        </p>
      </div>
    </div>
  );
}
