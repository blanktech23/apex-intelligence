"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Palette,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Grid3X3,
  Ruler,
  Eye,
  Camera,
  Box,
  Loader2,
  Check,
  Download,
  FileText,
  Image,
  FolderOpen,
  ArrowUp,
  Package,
  X,
  Trash2,
  RefreshCw,
  MessageSquare,
  SlidersHorizontal,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  FileOutput,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EnhancedBomPreview } from "@/components/kb/enhanced-bom-preview";
import { OrderExportPreview } from "@/components/kb/order-export-preview";
import { CollaborationIndicator } from "@/components/kb/collaboration-indicator";
import { AutosaveIndicator } from "@/components/kb/autosave-indicator";
import { CanvasToolbar } from "@/components/kb/canvas-toolbar";
import { EnhancedFloorPlan } from "@/components/kb/enhanced-floor-plan";
import { ConstraintPanel } from "@/components/kb/constraint-panel";
import { ModificationPanel } from "@/components/kb/modification-panel";
import { PricingPanel } from "@/components/kb/pricing-panel";
import { FinishZonePanel } from "@/components/kb/finish-zone-panel";
import { ElevationView } from "@/components/kb/elevation-view";
import { DoorStyleConfigurator } from "@/components/kb/door-style-configurator";
import { CatalogBrowser } from "@/components/kb/catalog-browser";

/* ------------------------------------------------------------------ */
/*  Swap Product Alternatives                                          */
/* ------------------------------------------------------------------ */

const swapAlternatives = [
  { id: "s1", name: 'Shaker White 36" Base Cabinet', price: "$420" },
  { id: "s2", name: 'Euro Slab 36" Base', price: "$380" },
  { id: "s3", name: 'Heritage Oak 36" Base', price: "$510" },
  { id: "s4", name: 'Modern Gray 36" Base', price: "$445" },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  toolCalls?: { label: string; status: "running" | "done" }[];
  structuredOutput?: {
    title: string;
    items: { label: string; value: string; pass?: boolean }[];
  };
}

type ViewMode = "2d" | "elevation" | "3d";
type LeftPanelTab = "chat" | "catalog" | "export";

interface SelectedItem {
  name: string;
  manufacturer: string;
  sku: string;
  dimensions: string;
  finish: string;
  price: string;
  category: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const mockMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "agent",
    content:
      "I'm your AI design assistant. Describe your kitchen or bathroom layout, and I'll generate a design using industry-standard dimensional constraints.",
    timestamp: "2:00 PM",
  },
  {
    id: "m2",
    role: "user",
    content:
      "12x14 L-shaped kitchen, island with seating for 3, gas range, double oven, farmhouse sink",
    timestamp: "2:01 PM",
  },
  {
    id: "m3",
    role: "agent",
    content: "Design generated. Here's a summary of the layout and constraint validation:",
    timestamp: "2:03 PM",
    toolCalls: [
      { label: "Generating layout...", status: "done" },
      { label: "Validating dimensional constraints...", status: "done" },
      { label: "Rendering preview...", status: "done" },
      { label: "Evaluating design...", status: "done" },
    ],
    structuredOutput: {
      title: "Layout Summary — L-Shaped Kitchen v3",
      items: [
        { label: "Room Dimensions", value: "12'-0\" x 14'-0\" (168 sq ft)" },
        { label: "Work Triangle", value: "22.4 ft total", pass: true },
        { label: "Island Clearance", value: "44\" all sides", pass: true },
        { label: "Landing Zones", value: "15\"+ at all appliances", pass: true },
        { label: "Ventilation", value: "30\" hood over range", pass: true },
        { label: "Compliance Rules", value: "31/31 pass", pass: true },
        { label: "Cabinets", value: "8 base + 6 wall + 1 tall + island" },
        { label: "Material Cost (est.)", value: "$24,350" },
        { label: "AI Iterations", value: "3 (auto-optimized island placement)" },
      ],
    },
  },
];

const mockSelectedItem: SelectedItem = {
  name: "Base Cabinet - B36",
  manufacturer: "KraftMaid",
  sku: "B36-QUAJ-QUMD",
  dimensions: "36\"W x 24\"D x 34.5\"H",
  finish: "Quartersawn Oak - Aged Brandy",
  price: "$842.00",
  category: "Base Cabinet",
};

/* ------------------------------------------------------------------ */
/*  3D Placeholder                                                     */
/* ------------------------------------------------------------------ */

function View3DPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="glass rounded-2xl p-12 text-center max-w-md">
        <div className="inline-flex rounded-xl bg-indigo-500/10 p-4 mb-4">
          <Box className="size-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">3D View - Three.js</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Three.js rendering engine loads here. Interactive 3D walkthrough with
          PBR materials, real-time lighting, and camera controls.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {["Orbit", "Pan", "Zoom", "First-Person"].map((mode) => (
            <span
              key={mode}
              className="rounded-md bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {mode}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Elevation Placeholder                                              */
/* ------------------------------------------------------------------ */

function ElevationPlaceholder() {
  const walls = ["North", "East", "South", "West", "Island"];
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="glass rounded-2xl p-12 text-center max-w-md">
        <div className="inline-flex rounded-xl bg-indigo-500/10 p-4 mb-4">
          <Eye className="size-10 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Select a wall to view elevation</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Choose a wall to see a front-facing elevation view with cabinet dimensions,
          countertop heights, and upper cabinet clearances.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {walls.map((wall) => (
            <button
              key={wall}
              onClick={() => toast.success(`${wall} wall elevation — coming in Wave 2`)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-foreground transition-all"
            >
              {wall}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function KitchenBathDesignerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>("chat");
  const [snapGrid, setSnapGrid] = useState(true);
  const [units, setUnits] = useState<"in" | "cm">("in");
  const [renderLevel, setRenderLevel] = useState<1 | 2>(1);
  const [showSelected, setShowSelected] = useState(true);
  const [bomOpen, setBomOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [undoStack, setUndoStack] = useState(3);
  const [redoStack, setRedoStack] = useState(0);
  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [swapSelected, setSwapSelected] = useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = useState(mockSelectedItem.name);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showConstraints, setShowConstraints] = useState(true);
  const [showFinishZones, setShowFinishZones] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [panelModsOpen, setPanelModsOpen] = useState(true);
  const [panelFinishOpen, setPanelFinishOpen] = useState(true);
  const [panelConstraintOpen, setPanelConstraintOpen] = useState(true);
  const [panelPricingOpen, setPanelPricingOpen] = useState(true);
  const [selectedWall, setSelectedWall] = useState("north");
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden relative pb-16 lg:pb-0">
      {/* ============================================================ */}
      {/* LEFT PANEL — Chat / Catalog / Export                          */}
      {/* ============================================================ */}
      <div className={`${mobileChatOpen ? "fixed inset-0 z-50 flex" : "hidden"} lg:relative lg:flex lg:z-auto w-full lg:w-96 lg:shrink-0 flex-col border-r border-border bg-[var(--background)]`}>
        {/* Agent header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/20">
            <Palette className="size-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">
              Design Spec Assistant
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-green-400" />
              <span className="text-[11px] text-muted-foreground">Active</span>
            </div>
          </div>
          <Link href="/design/kitchen-bath/projects">
            <Button variant="ghost" size="icon-sm" title="Projects">
              <FolderOpen className="size-4" />
            </Button>
          </Link>
          <button
            onClick={() => setMobileChatOpen(false)}
            aria-label="Close chat panel"
            className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center border-b border-border">
          {([
            { key: "chat" as const, label: "Chat", icon: MessageSquare },
            { key: "catalog" as const, label: "Catalog", icon: BookOpen },
            { key: "export" as const, label: "Export", icon: FileOutput },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setLeftPanelTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-all border-b-2 ${
                leftPanelTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {leftPanelTab === "chat" && (
          <>
            {/* Chat messages */}
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary/15 text-foreground"
                        : "glass text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Tool calls */}
                    {msg.toolCalls && (
                      <div className="mt-2.5 space-y-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
                        {msg.toolCalls.map((tc) => (
                          <div key={tc.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                            {tc.status === "running" ? (
                              <Loader2 className="size-3 animate-spin text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <Check className="size-3 text-green-600 dark:text-green-400" />
                            )}
                            <span>{tc.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Structured output */}
                    {msg.structuredOutput && (
                      <div className="mt-2.5 rounded-lg border border-border bg-muted/20 p-3">
                        <h4 className="mb-2 text-xs font-semibold text-foreground">
                          {msg.structuredOutput.title}
                        </h4>
                        <div className="space-y-1">
                          {msg.structuredOutput.items.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="flex items-center gap-1 font-medium text-foreground">
                                {item.value}
                                {item.pass !== undefined && (
                                  <Check className="size-3 text-green-600 dark:text-green-400" />
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <span className="mt-1.5 block text-[10px] text-muted-foreground/60">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input area */}
            <div className="border-t border-border p-3 space-y-2">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe layout changes..."
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border bg-muted/30 px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  className="absolute bottom-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                  aria-label="Send message"
                  onClick={() => {
                    if (inputValue.trim()) {
                      toast.success("Message sent to Design Spec Assistant");
                      setInputValue("");
                    }
                  }}
                >
                  <ArrowUp className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  className="flex-1 gap-2 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                  onClick={() => setBomOpen(true)}
                >
                  <Package className="size-3.5" />
                  Generate Estimate
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" className="gap-1.5 text-xs">
                        <Download className="size-3.5" />
                        Export
                        <ChevronDown className="size-3" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" sideOffset={4}>
                    <DropdownMenuItem onClick={() => toast.success("Exported as PDF")}>
                      <FileText className="size-3.5" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Exported as DXF")}>
                      <Ruler className="size-3.5" />
                      DXF (AutoCAD)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Exported as PNG")}>
                      <Image className="size-3.5" />
                      PNG
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        )}

        {leftPanelTab === "catalog" && (
          <CatalogBrowser
            onAddItem={(item) => {
              toast.success(`Added ${item.name} to design`);
            }}
            className="flex-1"
          />
        )}

        {leftPanelTab === "export" && (
          <div className="flex-1 flex flex-col gap-3 p-4">
            <div className="text-center space-y-2 mb-2">
              <div className="inline-flex rounded-xl bg-indigo-500/10 p-3">
                <FileOutput className="size-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Export & Orders</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate export packages, proposals, and manufacturer orders.
              </p>
            </div>
            <Button
              className="w-full gap-2 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setExportOpen(true)}
            >
              <FileOutput className="size-3.5" />
              Order Export Preview
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-xs"
              onClick={() => setBomOpen(true)}
            >
              <Package className="size-3.5" />
              Bill of Materials
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-xs"
              onClick={() => toast.success("PDF proposal generated")}
            >
              <FileText className="size-3.5" />
              Generate PDF Proposal
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-xs"
              onClick={() => toast.success("DXF shop drawings exported")}
            >
              <Ruler className="size-3.5" />
              Export DXF Shop Drawings
            </Button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* CENTER PANEL — Design Viewport                                */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="flex items-center gap-2 border-b border-border pl-16 pr-3 py-2 lg:px-3 overflow-x-auto">
          {/* View toggle — 3-way */}
          <div className="glass flex items-center gap-0.5 rounded-lg p-0.5">
            {(["2d", "elevation", "3d"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "2d" ? "2D" : mode === "elevation" ? "Elev" : "3D"}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Zoom controls */}
          <Button variant="ghost" size="icon-sm" title="Zoom in" onClick={() => { setZoomLevel(prev => Math.min(prev + 25, 400)); toast.success(`Zoom: ${Math.min(zoomLevel + 25, 400)}%`); }}>
            <ZoomIn className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Zoom out" onClick={() => { setZoomLevel(prev => Math.max(prev - 25, 25)); toast.success(`Zoom: ${Math.max(zoomLevel - 25, 25)}%`); }}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-center">{zoomLevel}%</span>
          <Button variant="ghost" size="icon-sm" title="Fit to view" onClick={() => { setZoomLevel(100); toast.success("Fit to view — 100%"); }}>
            <Maximize2 className="size-4" />
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Undo / Redo */}
          <Button variant="ghost" size="icon-sm" title="Undo" disabled={undoStack === 0} onClick={() => { if (undoStack > 0) { setUndoStack(prev => prev - 1); setRedoStack(prev => prev + 1); toast.success("Undo"); } }}>
            <Undo2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Redo" disabled={redoStack === 0} onClick={() => { if (redoStack > 0) { setRedoStack(prev => prev - 1); setUndoStack(prev => prev + 1); toast.success("Redo"); } }}>
            <Redo2 className="size-4" />
          </Button>

          <div className="h-4 w-px bg-border" />

          {/* Snap-to-grid */}
          <button
            onClick={() => setSnapGrid(!snapGrid)}
            className={`hidden sm:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
              snapGrid
                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Snap to grid"
          >
            <Grid3X3 className="size-3.5" />
            Snap
          </button>

          {/* Dims toggle */}
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`hidden sm:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
              showDimensions
                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle dimensions"
          >
            <Ruler className="size-3.5" />
            Dims
          </button>

          {/* Units */}
          <button
            onClick={() => setUnits(units === "in" ? "cm" : "in")}
            className="hidden sm:flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
            title="Toggle units"
          >
            <Ruler className="size-3.5" />
            {units === "in" ? "inches" : "cm"}
          </button>

          <div className="flex-1" />

          {/* Render quality */}
          <div className="hidden sm:flex glass items-center gap-0.5 rounded-lg p-0.5">
            <button
              onClick={() => setRenderLevel(1)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                renderLevel === 1
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="mr-1 inline size-3" />
              Level 1
            </button>
            <button
              onClick={() => setRenderLevel(2)}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                renderLevel === 2
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Camera className="mr-1 inline size-3" />
              Level 2
            </button>
          </div>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Collaboration indicator */}
          <CollaborationIndicator className="hidden sm:flex" />
        </div>

        {/* Canvas area */}
        <div
          className="relative flex-1 overflow-auto"
          style={{
            background: "#0d1117",
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Floating contextual toolbar */}
          <CanvasToolbar
            selectedItemId={selectedItemId}
            onAction={(action) => {
              if (action === "modify") {
                setShowConfigurator(true);
              }
            }}
          />
          {viewMode === "2d" ? (
            <EnhancedFloorPlan
              selectedItemId={selectedItemId}
              onSelectItem={(id) => {
                setSelectedItemId(id);
                if (id) setShowSelected(true);
              }}
              showConstraints={showConstraints}
              showFinishZones={showFinishZones}
              showDimensions={showDimensions}
              showSnapGuides={snapGrid && selectedItemId !== null}
              zoomLevel={zoomLevel}
              constraintViolations={[
                { itemId: "cab-14", severity: "P2" },
                { itemId: "cab-08", severity: "P3" },
                { itemId: "app-01", severity: "P1" },
              ]}
            />
          ) : viewMode === "elevation" ? (
            <ElevationView
              selectedWall={selectedWall}
              onWallChange={setSelectedWall}
              selectedItemId={selectedItemId}
              onSelectItem={(id) => {
                setSelectedItemId(id);
                if (id) setShowSelected(true);
              }}
            />
          ) : (
            <View3DPlaceholder />
          )}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 border-t border-border bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          <AutosaveIndicator />
          <div className="h-3 w-px bg-border hidden sm:block" />
          <span className="hidden sm:inline font-mono">12&apos;-0&quot; x 14&apos;-0&quot; | 168 sq ft</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
            <Check className="size-3" />
            Clearance Verified
          </span>
          <span>15 items | $24,350 material cost</span>
          <div className="flex-1" />
          <span className="hidden sm:inline font-medium text-foreground/60">Design v3 (3 AI iterations)</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT PANEL — Properties                                      */}
      {/* ============================================================ */}
      <div className={`${mobilePropsOpen ? "fixed inset-0 z-50" : "hidden"} lg:relative lg:block lg:z-auto w-full lg:w-80 lg:shrink-0 overflow-y-auto border-l border-border bg-[var(--background)]`}>
        {showSelected ? (
          /* Selected item properties + modifications */
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Properties</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMobilePropsOpen(false)}
                  aria-label="Close properties panel"
                  className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
                <button
                  onClick={() => { setShowSelected(false); setSelectedItemId(null); }}
                  aria-label="Deselect element"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Category badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
              {mockSelectedItem.category}
            </span>

            {/* Name */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Name
              </label>
              <p className="text-sm font-medium text-foreground">{selectedItemName}</p>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {[
                { label: "Manufacturer", value: mockSelectedItem.manufacturer },
                { label: "SKU", value: mockSelectedItem.sku, mono: true },
                { label: "Dimensions", value: mockSelectedItem.dimensions },
                { label: "Finish", value: mockSelectedItem.finish },
                { label: "Price", value: mockSelectedItem.price, highlight: true },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                    {field.label}
                  </label>
                  <p
                    className={`text-sm ${
                      field.highlight
                        ? "font-semibold text-green-600 dark:text-green-400"
                        : field.mono
                          ? "font-mono text-xs text-muted-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {field.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-px bg-border" />

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={() => { setSwapSelected(null); setShowSwapDialog(true); }}
              >
                <RefreshCw className="size-3.5" />
                Swap Product
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 text-xs"
                onClick={() => setShowConfigurator(true)}
              >
                <Palette className="size-3.5" />
                Configure Style
              </Button>
              <Button
                variant="destructive"
                className="w-full gap-2 text-xs"
                onClick={() => {
                  toast.success("Item removed from design");
                  setShowSelected(false);
                  setSelectedItemId(null);
                }}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>

            {/* Modifications Panel (collapsible) */}
            <div className="h-px bg-border" />
            <button
              onClick={() => setPanelModsOpen(!panelModsOpen)}
              className="flex w-full items-center justify-between py-1"
            >
              <span className="text-xs font-semibold text-foreground">Modifications</span>
              {panelModsOpen ? (
                <ChevronDown className="size-3.5 text-muted-foreground rotate-180 transition-transform" />
              ) : (
                <ChevronDown className="size-3.5 text-muted-foreground transition-transform" />
              )}
            </button>
            {panelModsOpen && (
              <ModificationPanel selectedItemId={selectedItemId} />
            )}
          </div>
        ) : (
          /* Design summary (nothing selected) */
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Design Summary</h3>
              <button
                onClick={() => setMobilePropsOpen(false)}
                className="lg:hidden rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {/* Room dimensions */}
            <div className="glass rounded-lg p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Room Dimensions
              </label>
              <p className="text-sm font-medium text-foreground mt-0.5">
                12&apos;-0&quot; x 14&apos;-0&quot; (168 sq ft)
              </p>
            </div>

            {/* Item counts */}
            <div className="glass rounded-lg p-3 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Items by Category
              </label>
              {[
                { cat: "Base Cabinets", count: 5, color: "bg-blue-400" },
                { cat: "Wall Cabinets", count: 4, color: "bg-indigo-400" },
                { cat: "Tall Cabinets", count: 1, color: "bg-violet-400" },
                { cat: "Appliances", count: 4, color: "bg-amber-400" },
                { cat: "Fixtures", count: 2, color: "bg-cyan-400" },
                { cat: "Lighting", count: 1, color: "bg-yellow-400" },
              ].map((item) => (
                <div key={item.cat} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${item.color}`} />
                    <span className="text-muted-foreground">{item.cat}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.count}</span>
                </div>
              ))}
            </div>

            {/* Material cost */}
            <div className="glass rounded-lg p-3">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Material Cost Estimate
              </label>
              <p className="text-lg font-bold text-foreground mt-0.5">$24,350</p>
            </div>

            {/* Display toggles */}
            <div className="glass rounded-lg p-3 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Display Options
              </label>
              {([
                { label: "Constraint Overlays", value: showConstraints, toggle: () => setShowConstraints(!showConstraints) },
                { label: "Finish Zones", value: showFinishZones, toggle: () => setShowFinishZones(!showFinishZones) },
                { label: "Dimensions", value: showDimensions, toggle: () => setShowDimensions(!showDimensions) },
              ]).map((opt) => (
                <div key={opt.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{opt.label}</span>
                  <button
                    onClick={opt.toggle}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                      opt.value
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {opt.value ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>

            {/* Select prompt */}
            <p className="text-center text-xs text-muted-foreground/50 italic">
              Click an item in the viewport to see its properties
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 text-xs"
              onClick={() => setShowSelected(true)}
            >
              <Eye className="size-3.5" />
              Select B36 Cabinet (demo)
            </Button>

            <div className="h-px bg-border" />
          </div>
        )}

        {/* ============================================================ */}
        {/* Always-visible panels (below conditional section)             */}
        {/* ============================================================ */}
        <div className="px-4 pb-4 space-y-4">
          {/* Finish Zones (collapsible) */}
          <div>
            <button
              onClick={() => setPanelFinishOpen(!panelFinishOpen)}
              className="flex w-full items-center justify-between py-1"
            >
              <span className="text-xs font-semibold text-foreground">Finish Zones</span>
              {panelFinishOpen ? (
                <ChevronDown className="size-3.5 text-muted-foreground rotate-180 transition-transform" />
              ) : (
                <ChevronDown className="size-3.5 text-muted-foreground transition-transform" />
              )}
            </button>
            {panelFinishOpen && <FinishZonePanel className="mt-2" />}
          </div>

          <div className="h-px bg-border" />

          {/* Constraint Validation (collapsible) */}
          <div>
            <button
              onClick={() => setPanelConstraintOpen(!panelConstraintOpen)}
              className="flex w-full items-center justify-between py-1"
            >
              <span className="text-xs font-semibold text-foreground">Constraint Validation</span>
              {panelConstraintOpen ? (
                <ChevronDown className="size-3.5 text-muted-foreground rotate-180 transition-transform" />
              ) : (
                <ChevronDown className="size-3.5 text-muted-foreground transition-transform" />
              )}
            </button>
            {panelConstraintOpen && (
              <ConstraintPanel
                onSelectItem={(id) => {
                  setSelectedItemId(id);
                  setShowSelected(true);
                }}
                className="mt-2"
              />
            )}
          </div>

          <div className="h-px bg-border" />

          {/* Pricing (collapsible) */}
          <div>
            <button
              onClick={() => setPanelPricingOpen(!panelPricingOpen)}
              className="flex w-full items-center justify-between py-1"
            >
              <span className="text-xs font-semibold text-foreground">Pricing</span>
              {panelPricingOpen ? (
                <ChevronDown className="size-3.5 text-muted-foreground rotate-180 transition-transform" />
              ) : (
                <ChevronDown className="size-3.5 text-muted-foreground transition-transform" />
              )}
            </button>
            {panelPricingOpen && <PricingPanel className="mt-2" />}
          </div>
        </div>
      </div>

      {/* Mobile floating action buttons */}
      <button
        onClick={() => setMobileChatOpen(true)}
        className="fixed bottom-4 left-4 z-40 lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        title="Open chat"
      >
        <MessageSquare className="size-5" />
      </button>
      <button
        onClick={() => setMobilePropsOpen(true)}
        className="fixed bottom-4 right-4 z-40 lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
        title="Open properties"
      >
        <SlidersHorizontal className="size-5" />
      </button>

      {/* BOM Modal */}
      <EnhancedBomPreview open={bomOpen} onOpenChange={setBomOpen} />

      {/* Order Export Modal */}
      <OrderExportPreview open={exportOpen} onOpenChange={setExportOpen} />

      {/* Door Style Configurator */}
      <DoorStyleConfigurator
        open={showConfigurator}
        onOpenChange={setShowConfigurator}
        onApply={(config) => {
          toast.success(
            `Applied: ${config.doorStyle.name} / ${config.overlay.name} / ${config.species.name} / ${config.finish.name}`
          );
          setShowConfigurator(false);
        }}
      />

      {/* Swap Product Dialog */}
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Swap Product</DialogTitle>
            <DialogDescription>
              Replace the current product with an alternative.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Current product</p>
              <p className="text-sm font-medium text-foreground">{selectedItemName}</p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">Alternatives</p>
            <div className="grid grid-cols-2 gap-2">
              {swapAlternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => setSwapSelected(alt.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    swapSelected === alt.id
                      ? "border-primary bg-primary/10 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="mb-2 h-12 w-full rounded bg-muted/50" />
                  <p className="text-xs font-medium text-foreground leading-tight">{alt.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{alt.price}</p>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowSwapDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!swapSelected}
              onClick={() => {
                const alt = swapAlternatives.find((a) => a.id === swapSelected);
                if (alt) {
                  setSelectedItemName(alt.name);
                  toast.success(`Product swapped to ${alt.name}`);
                  setShowSwapDialog(false);
                }
              }}
            >
              Swap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
