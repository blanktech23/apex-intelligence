"use client";

import { useState } from "react";
import {
  File,
  FolderOpen,
  Save,
  Download,
  Square,
  DoorOpen,
  Columns3,
  Box,
  Ruler,
  PenLine,
  Tag,
  BookOpen,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Camera,
  Mountain,
  Layers,
  Lightbulb,
  Package,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type RibbonTab = "FILE" | "ROOM" | "ITEMS" | "ANNOTATE" | "PRESENT" | "VIEW";

interface RibbonToolbarProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  // VIEW tab props
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  snapGrid: boolean;
  onSnapToggle: () => void;
  showDimensions: boolean;
  onDimsToggle: () => void;
  units: "in" | "cm";
  onUnitsToggle: () => void;
  showGrid: boolean;
  onGridToggle: () => void;
  // View mode
  viewMode: "2d" | "elevation" | "3d";
  onViewModeChange: (mode: "2d" | "elevation" | "3d") => void;
}

/* ------------------------------------------------------------------ */
/*  Tab tool configs                                                   */
/* ------------------------------------------------------------------ */

interface ToolButton {
  icon: LucideIcon;
  label: string;
  action?: string; // if undefined, just toast
}

const TAB_TOOLS: Record<RibbonTab, ToolButton[]> = {
  FILE: [
    { icon: File, label: "New" },
    { icon: FolderOpen, label: "Open" },
    { icon: Save, label: "Save" },
    { icon: Download, label: "Export" },
  ],
  ROOM: [
    { icon: Square, label: "Wall Tool" },
    { icon: Columns3, label: "Window" },
    { icon: DoorOpen, label: "Door" },
    { icon: Box, label: "Obstacle" },
  ],
  ITEMS: [
    { icon: Package, label: "Browse Catalog", action: "catalog" },
    { icon: Layers, label: "Place Cabinet" },
    { icon: Sparkles, label: "Countertop Wizard" },
    { icon: Lightbulb, label: "Lighting" },
  ],
  ANNOTATE: [
    { icon: Ruler, label: "Dimensions" },
    { icon: PenLine, label: "Notes" },
    { icon: Tag, label: "Tags" },
    { icon: BookOpen, label: "Legend" },
  ],
  PRESENT: [
    { icon: Grid3X3, label: "2D", action: "view-2d" },
    { icon: Mountain, label: "Elevation", action: "view-elevation" },
    { icon: Box, label: "3D", action: "view-3d" },
    { icon: Eye, label: "Hidden Line" },
    { icon: Camera, label: "Render" },
  ],
  VIEW: [], // VIEW tab is custom-rendered
};

const TABS: RibbonTab[] = ["FILE", "ROOM", "ITEMS", "ANNOTATE", "PRESENT", "VIEW"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RibbonToolbar({
  activeTab,
  onTabChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onFitView,
  snapGrid,
  onSnapToggle,
  showDimensions,
  onDimsToggle,
  units,
  onUnitsToggle,
  showGrid,
  onGridToggle,
  viewMode,
  onViewModeChange,
}: RibbonToolbarProps) {
  const handleToolClick = (tool: ToolButton) => {
    if (tool.action === "catalog") {
      toast.success("Opening catalog browser...");
    } else if (tool.action === "view-2d") {
      onViewModeChange("2d");
    } else if (tool.action === "view-elevation") {
      onViewModeChange("elevation");
    } else if (tool.action === "view-3d") {
      onViewModeChange("3d");
    } else {
      toast.info(`${tool.label} — coming soon`);
    }
  };

  return (
    <div className="border-b border-border bg-background">
      {/* Tab row */}
      <div className="flex items-center gap-0 border-b border-border/50 px-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tool row */}
      <div className="flex items-center gap-1 px-2 py-1.5 min-h-[40px]">
        {activeTab === "VIEW" ? (
          /* VIEW tab has custom controls */
          <>
            {/* Zoom controls */}
            <Button variant="ghost" size="icon-sm" title="Zoom in" onClick={onZoomIn}>
              <ZoomIn className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" title="Zoom out" onClick={onZoomOut}>
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-center font-mono">
              {zoomLevel}%
            </span>
            <Button variant="ghost" size="icon-sm" title="Fit to view" onClick={onFitView}>
              <Maximize2 className="size-4" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Snap */}
            <button
              onClick={onSnapToggle}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                snapGrid
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="size-3.5" />
              Snap
            </button>

            {/* Grid */}
            <button
              onClick={onGridToggle}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                showGrid
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="size-3.5" />
              Grid
            </button>

            {/* Dims */}
            <button
              onClick={onDimsToggle}
              className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                showDimensions
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Ruler className="size-3.5" />
              Dims
            </button>

            {/* Units */}
            <button
              onClick={onUnitsToggle}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
            >
              <Ruler className="size-3.5" />
              {units === "in" ? "inches" : "cm"}
            </button>
          </>
        ) : (
          /* Standard tool buttons */
          TAB_TOOLS[activeTab].map((tool) => (
            <button
              key={tool.label}
              onClick={() => handleToolClick(tool)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
              title={tool.label}
            >
              <tool.icon className="size-4" />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
