"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Palette,
  Send,
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
import { BomPreview } from "@/components/kb/bom-preview";

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

type ViewMode = "2d" | "3d";

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
/*  SVG Floor Plan (2D Mock)                                           */
/* ------------------------------------------------------------------ */

function FloorPlan2D() {
  // Scale: 1 foot = 40px, origin offset for padding
  const scale = 40;
  const ox = 40;
  const oy = 40;

  return (
    <svg
      viewBox="0 0 680 700"
      className="h-full w-full"
      style={{ maxHeight: "100%" }}
    >
      {/* Grid dots */}
      <defs>
        <pattern id="grid-dots" width={scale} height={scale} patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="1" fill="rgba(255,255,255,0.06)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-dots)" />

      {/* Room outline - L-shape: 12x14 with a notch */}
      <path
        d={`M ${ox} ${oy} L ${ox + 12 * scale} ${oy} L ${ox + 12 * scale} ${oy + 14 * scale} L ${ox} ${oy + 14 * scale} Z`}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />

      {/* Base cabinets - south wall (bottom) */}
      <rect x={ox} y={oy + 14 * scale - 24} width={36 * 3} height={24} rx="2"
        fill="rgba(59,130,246,0.15)" stroke="rgba(96,165,250,0.6)" strokeWidth="1" />
      <text x={ox + 54} y={oy + 14 * scale - 8} fill="rgba(96,165,250,0.8)" fontSize="9" textAnchor="middle" fontFamily="monospace">B36</text>
      <text x={ox + 54 + 36} y={oy + 14 * scale - 8} fill="rgba(96,165,250,0.8)" fontSize="9" textAnchor="middle" fontFamily="monospace">B36</text>

      {/* Base cabinets - west wall (left) */}
      <rect x={ox} y={oy + 2 * scale} width={24} height={36 * 3} rx="2"
        fill="rgba(59,130,246,0.15)" stroke="rgba(96,165,250,0.6)" strokeWidth="1" />
      <text x={ox + 12} y={oy + 2 * scale + 20} fill="rgba(96,165,250,0.8)" fontSize="8" textAnchor="middle" fontFamily="monospace">B24</text>
      <text x={ox + 12} y={oy + 2 * scale + 56} fill="rgba(96,165,250,0.8)" fontSize="8" textAnchor="middle" fontFamily="monospace">B36</text>
      <text x={ox + 12} y={oy + 2 * scale + 92} fill="rgba(96,165,250,0.8)" fontSize="8" textAnchor="middle" fontFamily="monospace">B36</text>

      {/* Wall cabinets - west wall */}
      <rect x={ox + 2} y={oy + 2 * scale} width={12} height={36 * 2.5} rx="1"
        fill="rgba(99,102,241,0.15)" stroke="rgba(129,140,248,0.5)" strokeWidth="1" strokeDasharray="4 2" />
      <text x={ox + 8} y={oy + 2 * scale + 44} fill="rgba(129,140,248,0.6)" fontSize="7" textAnchor="middle" fontFamily="monospace" transform={`rotate(-90, ${ox + 8}, ${oy + 2 * scale + 44})`}>W3612</text>

      {/* Wall cabinets - south wall */}
      <rect x={ox} y={oy + 14 * scale - 14} width={36 * 2.5} height={12} rx="1"
        fill="rgba(99,102,241,0.15)" stroke="rgba(129,140,248,0.5)" strokeWidth="1" strokeDasharray="4 2" />
      <text x={ox + 45} y={oy + 14 * scale - 5} fill="rgba(129,140,248,0.6)" fontSize="7" textAnchor="middle" fontFamily="monospace">W3612</text>

      {/* Sink - on north wall (top) under window */}
      <rect x={ox + 4 * scale} y={oy} width={36} height={24} rx="2"
        fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" />
      {/* Sink basin shape */}
      <rect x={ox + 4 * scale + 4} y={oy + 4} width={12} height={16} rx="3"
        fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1" />
      <rect x={ox + 4 * scale + 20} y={oy + 4} width={12} height={16} rx="3"
        fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1" />
      <text x={ox + 4 * scale + 18} y={oy + 36} fill="rgba(34,211,238,0.8)" fontSize="8" textAnchor="middle" fontFamily="monospace">Sink</text>
      {/* Window indicator */}
      <line x1={ox + 3.5 * scale} y1={oy - 4} x2={ox + 5.5 * scale} y2={oy - 4}
        stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
      <text x={ox + 4.5 * scale} y={oy - 10} fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle">window</text>

      {/* Range - east wall */}
      <rect x={ox + 12 * scale - 24} y={oy + 3 * scale} width={24} height={30} rx="2"
        fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" />
      {/* Burner circles */}
      <circle cx={ox + 12 * scale - 16} cy={oy + 3 * scale + 8} r="4" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
      <circle cx={ox + 12 * scale - 8} cy={oy + 3 * scale + 8} r="4" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
      <circle cx={ox + 12 * scale - 16} cy={oy + 3 * scale + 20} r="4" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
      <circle cx={ox + 12 * scale - 8} cy={oy + 3 * scale + 20} r="4" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
      <text x={ox + 12 * scale - 12} y={oy + 3 * scale + 42} fill="rgba(245,158,11,0.8)" fontSize="8" textAnchor="middle" fontFamily="monospace">Range</text>

      {/* Refrigerator - east wall, top */}
      <rect x={ox + 12 * scale - 28} y={oy + 8} width={28} height={36} rx="2"
        fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
      <text x={ox + 12 * scale - 14} y={oy + 30} fill="rgba(245,158,11,0.8)" fontSize="7" textAnchor="middle" fontFamily="monospace">Fridge</text>

      {/* Dishwasher - next to sink */}
      <rect x={ox + 4 * scale + 40} y={oy} width={24} height={24} rx="2"
        fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
      <text x={ox + 4 * scale + 52} y={oy + 36} fill="rgba(245,158,11,0.7)" fontSize="7" textAnchor="middle" fontFamily="monospace">DW</text>

      {/* Double oven - east wall below range */}
      <rect x={ox + 12 * scale - 24} y={oy + 5.5 * scale} width={24} height={40} rx="2"
        fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5" />
      <line x1={ox + 12 * scale - 22} y1={oy + 5.5 * scale + 20} x2={ox + 12 * scale - 2} y2={oy + 5.5 * scale + 20}
        stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
      <text x={ox + 12 * scale - 12} y={oy + 5.5 * scale + 52} fill="rgba(245,158,11,0.7)" fontSize="7" textAnchor="middle" fontFamily="monospace">Dbl Oven</text>

      {/* Island */}
      <rect x={ox + 3.5 * scale} y={oy + 7 * scale} width={60 * 2.4} height={36 * 2.4} rx="3"
        fill="rgba(59,130,246,0.1)" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5" />
      <text x={ox + 3.5 * scale + 72} y={oy + 7 * scale + 46} fill="rgba(96,165,250,0.8)" fontSize="10" textAnchor="middle" fontFamily="monospace">Island 36x60</text>
      {/* Seating indicators (3 circles at bottom of island) */}
      <circle cx={ox + 3.5 * scale + 36} cy={oy + 7 * scale + 36 * 2.4 + 16} r="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx={ox + 3.5 * scale + 72} cy={oy + 7 * scale + 36 * 2.4 + 16} r="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx={ox + 3.5 * scale + 108} cy={oy + 7 * scale + 36 * 2.4 + 16} r="8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 2" />
      <text x={ox + 3.5 * scale + 72} y={oy + 7 * scale + 36 * 2.4 + 34} fill="rgba(255,255,255,0.2)" fontSize="7" textAnchor="middle">seating (3)</text>

      {/* Work triangle - dashed lines connecting sink, range, fridge */}
      <line
        x1={ox + 4 * scale + 18} y1={oy + 12}
        x2={ox + 12 * scale - 12} y2={oy + 3 * scale + 15}
        stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" strokeDasharray="8 4"
      />
      <line
        x1={ox + 12 * scale - 12} y1={oy + 3 * scale + 15}
        x2={ox + 12 * scale - 14} y2={oy + 26}
        stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" strokeDasharray="8 4"
      />
      <line
        x1={ox + 12 * scale - 14} y1={oy + 26}
        x2={ox + 4 * scale + 18} y2={oy + 12}
        stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" strokeDasharray="8 4"
      />
      {/* Work triangle label */}
      <text x={ox + 7.5 * scale} y={oy + 1.8 * scale} fill="rgba(245,158,11,0.5)" fontSize="8" textAnchor="middle" fontStyle="italic">work triangle 22.4'</text>

      {/* Dimension lines - horizontal (top) */}
      <line x1={ox} y1={oy - 20} x2={ox + 12 * scale} y2={oy - 20}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={ox} y1={oy - 24} x2={ox} y2={oy - 16}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={ox + 12 * scale} y1={oy - 24} x2={ox + 12 * scale} y2={oy - 16}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <text x={ox + 6 * scale} y={oy - 26} fill="rgba(148,163,184,0.6)" fontSize="10" textAnchor="middle" fontFamily="monospace">12&apos;-0&quot;</text>

      {/* Dimension lines - vertical (right) */}
      <line x1={ox + 12 * scale + 20} y1={oy} x2={ox + 12 * scale + 20} y2={oy + 14 * scale}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={ox + 12 * scale + 16} y1={oy} x2={ox + 12 * scale + 24} y2={oy}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={ox + 12 * scale + 16} y1={oy + 14 * scale} x2={ox + 12 * scale + 24} y2={oy + 14 * scale}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <text x={ox + 12 * scale + 34} y={oy + 7 * scale} fill="rgba(148,163,184,0.6)" fontSize="10" textAnchor="middle" fontFamily="monospace" transform={`rotate(90, ${ox + 12 * scale + 34}, ${oy + 7 * scale})`}>14&apos;-0&quot;</text>

      {/* Legend */}
      <g transform={`translate(${ox}, ${oy + 14 * scale + 30})`}>
        <rect x="0" y="0" width="10" height="10" rx="1" fill="rgba(59,130,246,0.15)" stroke="rgba(96,165,250,0.6)" strokeWidth="1" />
        <text x="14" y="9" fill="rgba(148,163,184,0.6)" fontSize="8">Base Cabinets</text>

        <rect x="90" y="0" width="10" height="10" rx="1" fill="rgba(99,102,241,0.15)" stroke="rgba(129,140,248,0.5)" strokeWidth="1" strokeDasharray="2 1" />
        <text x="104" y="9" fill="rgba(148,163,184,0.6)" fontSize="8">Wall Cabinets</text>

        <rect x="186" y="0" width="10" height="10" rx="1" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
        <text x="200" y="9" fill="rgba(148,163,184,0.6)" fontSize="8">Appliances</text>

        <rect x="268" y="0" width="10" height="10" rx="1" fill="rgba(34,211,238,0.15)" stroke="rgba(34,211,238,0.6)" strokeWidth="1" />
        <text x="282" y="9" fill="rgba(148,163,184,0.6)" fontSize="8">Fixtures</text>

        <line x1="350" y1="5" x2="380" y2="5" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="384" y="9" fill="rgba(148,163,184,0.6)" fontSize="8">Work Triangle</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  3D Placeholder                                                     */
/* ------------------------------------------------------------------ */

function View3DPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="glass rounded-2xl p-12 text-center max-w-md">
        <div className="inline-flex rounded-xl bg-indigo-500/10 p-4 mb-4">
          <Box className="size-10 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">3D View</h3>
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function KitchenBathDesignerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("2d");
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

  return (
    <div className="flex h-full overflow-hidden relative pb-16 lg:pb-0">
      {/* ============================================================ */}
      {/* LEFT PANEL — Agent Chat                                       */}
      {/* ============================================================ */}
      <div className={`${mobileChatOpen ? "fixed inset-0 z-50 flex" : "hidden"} lg:relative lg:flex lg:z-auto w-full lg:w-96 lg:shrink-0 flex-col border-r border-border bg-[var(--background)]`}>
        {/* Agent header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/20">
            <Palette className="size-4 text-indigo-400" />
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
                          <Loader2 className="size-3 animate-spin text-indigo-400" />
                        ) : (
                          <Check className="size-3 text-green-400" />
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
                              <Check className="size-3 text-green-400" />
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
      </div>

      {/* ============================================================ */}
      {/* CENTER PANEL — Design Viewport                                */}
      {/* ============================================================ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top toolbar */}
        <div className="flex items-center gap-2 border-b border-border pl-16 pr-3 py-2 lg:px-3 overflow-x-auto">
          {/* View toggle */}
          <div className="glass flex items-center gap-0.5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("2d")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === "2d"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                viewMode === "3d"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              3D
            </button>
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
                ? "bg-indigo-500/15 text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Snap to grid"
          >
            <Grid3X3 className="size-3.5" />
            Snap
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
        </div>

        {/* Canvas area */}
        <div
          className="flex-1 overflow-auto"
          style={{
            background: "#0d1117",
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {viewMode === "2d" ? <FloorPlan2D /> : <View3DPlaceholder />}
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 border-t border-border bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
          <span className="hidden sm:inline font-mono">12&apos;-0&quot; x 14&apos;-0&quot; | 168 sq ft</span>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
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
      <div className={`${mobilePropsOpen ? "fixed inset-0 z-50" : "hidden"} lg:relative lg:block lg:z-auto w-full lg:w-72 lg:shrink-0 overflow-y-auto border-l border-border bg-[var(--background)]`}>
        {showSelected ? (
          /* Selected item properties */
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
                  onClick={() => setShowSelected(false)}
                  aria-label="Deselect element"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Category badge */}
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
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
                        ? "font-semibold text-green-400"
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
                variant="destructive"
                className="w-full gap-2 text-xs"
                onClick={() => {
                  toast.success("Item removed from design");
                  setShowSelected(false);
                }}
              >
                <Trash2 className="size-3.5" />
                Remove
              </Button>
            </div>
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

            {/* NKBA Compliance */}
            <div className="glass rounded-lg p-3 space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Dimensional Compliance
              </label>
              {[
                { rule: "Work Triangle", pass: true },
                { rule: "Clearances", pass: true },
                { rule: "Landing Zones", pass: true },
                { rule: "Ventilation", pass: true },
                { rule: "Door Clearance", pass: true },
                { rule: "Counter Heights", pass: true },
              ].map((item) => (
                <div key={item.rule} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.rule}</span>
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      item.pass ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    <Check className="size-3" />
                    Pass
                  </span>
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
          </div>
        )}
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
      <BomPreview open={bomOpen} onOpenChange={setBomOpen} />

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
