"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  floorPlan,
  type Cabinet,
  type Appliance,
  type Fixture,
  type WallSegment,
  type Opening,
  type FloorPlan,
} from "@/data/kb/floor-plan-data";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export type VisibilityFilter = "all" | "cabinets" | "wallCabs" | "countertops" | "appliances" | "nkba" | "legend";

interface EnhancedFloorPlanProps {
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  showConstraints: boolean;
  showFinishZones: boolean;
  showDimensions: boolean;
  showSnapGuides: boolean;
  zoomLevel: number;
  onZoomChange?: (zoom: number) => void;
  constraintViolations?: { itemId: string; severity: "P1" | "P2" | "P3" }[];
  visibilityFilter?: VisibilityFilter;
  onDoubleClickItem?: (id: string) => void;
  /** Controlled multi-selection set */
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  /** Expose item positions for placement panel */
  onItemPositionChange?: (id: string, x: number, y: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCALE = 3.2;
const PAD = 60;
const ROOM_W = floorPlan.roomWidth;
const ROOM_D = floorPlan.roomDepth;
const SVG_W = ROOM_W * SCALE + PAD * 2 + 60;
const SVG_H = ROOM_D * SCALE + PAD * 2 + 60;

const DRAG_THRESHOLD_PX = 3;
const SNAP_THRESHOLD_PX = 8;
const GRID_SNAP_INCHES = 1;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4.0;

const COLOR = {
  base: { fill: "rgba(59,130,246,0.18)", stroke: "rgba(37,99,235,0.8)" },
  wall: { fill: "rgba(99,102,241,0.15)", stroke: "rgba(79,70,229,0.7)" },
  corner: { fill: "rgba(59,130,246,0.18)", stroke: "rgba(37,99,235,0.8)" },
  tall: { fill: "rgba(139,92,246,0.18)", stroke: "rgba(124,58,237,0.7)" },
  island: { fill: "rgba(34,197,94,0.15)", stroke: "rgba(22,163,74,0.7)" },
  appliance: { fill: "rgba(245,158,11,0.18)", stroke: "rgba(217,119,6,0.8)" },
  fixture: { fill: "rgba(6,182,212,0.18)", stroke: "rgba(8,145,178,0.8)" },
} as const;

const SEVERITY_COLOR = { P1: "rgba(220,38,38,0.8)", P2: "rgba(217,119,6,0.7)", P3: "rgba(202,138,4,0.6)" };

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DragState {
  isDragging: boolean;
  itemId: string;
  startScreenX: number;
  startScreenY: number;
  startItemX: number;
  startItemY: number;
}

interface ResizeState {
  itemId: string;
  handle: "tl" | "tr" | "bl" | "br";
  startScreenX: number;
  startScreenY: number;
  startWidth: number;
  startDepth: number;
  startX: number;
  startY: number;
}

interface UndoEntry {
  items: Map<string, { x: number; y: number; width?: number; depth?: number }>;
}

interface SnapGuide {
  axis: "x" | "y";
  position: number; // in SVG coords
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function tx(inches: number) { return PAD + inches * SCALE; }
function ty(inches: number) { return PAD + inches * SCALE; }

function itemRect(item: { x: number; y: number; width: number; depth: number; rotation: number }) {
  const { x, y, width, depth, rotation } = item;
  const r = rotation % 360;
  if (r === 0) return { rx: tx(x), ry: ty(y), rw: width * SCALE, rh: depth * SCALE };
  if (r === 90) return { rx: tx(x - depth), ry: ty(y), rw: depth * SCALE, rh: width * SCALE };
  if (r === 180) return { rx: tx(x - width), ry: ty(y - depth), rw: width * SCALE, rh: depth * SCALE };
  return { rx: tx(x), ry: ty(y - width), rw: depth * SCALE, rh: width * SCALE };
}

function formatInches(v: number): string {
  const ft = Math.floor(v / 12);
  const inches = v % 12;
  if (ft === 0) return `${inches}"`;
  if (inches === 0) return `${ft}'-0"`;
  return `${ft}'-${inches}"`;
}

function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function GridPattern() {
  const minorStep = 12 * SCALE; // ~38px per foot
  const majorStep = minorStep * 4;
  return (
    <>
      <defs>
        <pattern id="grid-minor-enhanced" width={minorStep} height={minorStep} patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2={minorStep} y2="0" stroke="rgba(76,175,80,0.12)" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="0" y2={minorStep} stroke="rgba(76,175,80,0.12)" strokeWidth="0.5" />
        </pattern>
        <pattern id="grid-major-enhanced" width={majorStep} height={majorStep} patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2={majorStep} y2="0" stroke="rgba(76,175,80,0.25)" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2={majorStep} stroke="rgba(76,175,80,0.25)" strokeWidth="1" />
          <circle cx="0" cy="0" r="1.5" fill="rgba(76,175,80,0.3)" />
        </pattern>
      </defs>
      <rect width={SVG_W} height={SVG_H} fill="url(#grid-minor-enhanced)" />
      <rect width={SVG_W} height={SVG_H} fill="url(#grid-major-enhanced)" />
    </>
  );
}

function Walls({ walls }: { walls: WallSegment[] }) {
  const wallThicknessPx = 5 * SCALE; // 5 inches wall thickness
  const halfThick = wallThicknessPx / 2;

  return (
    <g>
      {walls.map((w) => {
        const x1 = tx(w.start.x);
        const y1 = ty(w.start.y);
        const x2 = tx(w.end.x);
        const y2 = ty(w.end.y);

        // Calculate normal vector for wall thickness
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = (-dy / len) * halfThick;
        const ny = (dx / len) * halfThick;

        return (
          <g key={w.id}>
            {/* Wall fill between double lines */}
            <polygon
              points={`${x1 + nx},${y1 + ny} ${x2 + nx},${y2 + ny} ${x2 - nx},${y2 - ny} ${x1 - nx},${y1 - ny}`}
              fill="rgba(226,232,240,0.6)"
              stroke="none"
            />
            {/* Outer wall line */}
            <line
              x1={x1 + nx} y1={y1 + ny}
              x2={x2 + nx} y2={y2 + ny}
              stroke="rgba(51,65,85,0.7)"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
            {/* Inner wall line */}
            <line
              x1={x1 - nx} y1={y1 - ny}
              x2={x2 - nx} y2={y2 - ny}
              stroke="rgba(51,65,85,0.7)"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </g>
        );
      })}
    </g>
  );
}

function Openings({ openings }: { openings: Opening[] }) {
  return (
    <g>
      {openings.map((o) => {
        if (o.type === "window") {
          const isNorth = o.wall === "north";
          const isEast = o.wall === "east";
          if (isNorth) {
            const wx = tx(o.x);
            const wy = ty(0);
            return (
              <g key={o.id}>
                <line x1={wx} y1={wy - 3} x2={wx + o.width * SCALE} y2={wy - 3} stroke="rgba(100,116,139,0.5)" strokeWidth="2" />
                <line x1={wx} y1={wy + 3} x2={wx + o.width * SCALE} y2={wy + 3} stroke="rgba(100,116,139,0.5)" strokeWidth="2" />
                <text x={wx + (o.width * SCALE) / 2} y={wy - 9} fill="rgba(71,85,105,0.7)" fontSize="8" textAnchor="middle" fontFamily="monospace">window</text>
              </g>
            );
          }
          if (isEast) {
            const wx = tx(ROOM_W);
            const wy = ty(o.y);
            return (
              <g key={o.id}>
                <line x1={wx - 3} y1={wy} x2={wx - 3} y2={wy + o.width * SCALE} stroke="rgba(100,116,139,0.5)" strokeWidth="2" />
                <line x1={wx + 3} y1={wy} x2={wx + 3} y2={wy + o.width * SCALE} stroke="rgba(100,116,139,0.5)" strokeWidth="2" />
                <text x={wx + 12} y={wy + (o.width * SCALE) / 2} fill="rgba(71,85,105,0.7)" fontSize="8" textAnchor="middle" fontFamily="monospace" transform={`rotate(90, ${wx + 12}, ${wy + (o.width * SCALE) / 2})`}>window</text>
              </g>
            );
          }
          return null;
        }
        if (o.type === "door") {
          const dx = tx(o.x);
          const dy = ty(o.y);
          const dw = o.width * SCALE;
          const isRight = o.swingDirection === "right";
          return (
            <g key={o.id}>
              <line x1={dx} y1={dy} x2={dx + dw} y2={dy} stroke="rgba(255,255,255,0.95)" strokeWidth={6} />
              <line
                x1={isRight ? dx + dw : dx} y1={dy}
                x2={isRight ? dx + dw : dx} y2={dy - dw}
                stroke="rgba(71,85,105,0.6)" strokeWidth="1.5"
              />
              <path
                d={isRight
                  ? `M ${dx + dw} ${dy - dw} A ${dw} ${dw} 0 0 1 ${dx} ${dy}`
                  : `M ${dx} ${dy - dw} A ${dw} ${dw} 0 0 0 ${dx + dw} ${dy}`}
                fill="none" stroke="rgba(100,116,139,0.5)" strokeWidth="1" strokeDasharray="4 3"
              />
              <text x={dx + dw / 2} y={dy + 14} fill="rgba(71,85,105,0.7)" fontSize="8" textAnchor="middle" fontFamily="monospace">door</text>
            </g>
          );
        }
        return null;
      })}
    </g>
  );
}

function CabinetRect({
  cab,
  selected,
  violated,
  dimmed,
  onPointerDown,
  onDoubleClick,
}: {
  cab: Cabinet;
  selected: boolean;
  violated?: "P1" | "P2" | "P3";
  dimmed: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
}) {
  const { rx, ry, rw, rh } = itemRect(cab);
  const isWall = cab.type === "wall";
  const colors = COLOR[cab.type] || COLOR.base;
  const opacity = dimmed ? 0.2 : 1;

  return (
    <g
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{ cursor: "pointer", opacity }}
      data-item-id={cab.id}
    >
      {violated && (
        <rect
          x={rx - 4} y={ry - 4} width={rw + 8} height={rh + 8} rx={4}
          fill="none" stroke={SEVERITY_COLOR[violated]} strokeWidth="2" strokeDasharray="6 3"
        />
      )}
      <rect
        x={rx} y={ry} width={rw} height={rh} rx={2}
        fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2.5 : 1}
        strokeDasharray={isWall ? "5 2" : undefined}
      />
      {cab.type === "corner" && cab.subType === "diagonal" && (
        <line x1={rx} y1={ry} x2={rx + rw} y2={ry + rh} stroke={colors.stroke} strokeWidth="0.8" opacity={0.5} />
      )}
      {cab.type === "corner" && cab.subType === "lazy-susan" && (
        <circle cx={rx + rw / 2} cy={ry + rh / 2} r={Math.min(rw, rh) * 0.3} fill="none" stroke={colors.stroke} strokeWidth="0.8" opacity={0.5} strokeDasharray="3 2" />
      )}
      {cab.type === "corner" && cab.subType === "blind" && (
        <line x1={rx + rw * 0.15} y1={ry + rh * 0.5} x2={rx + rw * 0.85} y2={ry + rh * 0.5} stroke={colors.stroke} strokeWidth="0.8" opacity={0.4} />
      )}
      <text x={rx + rw / 2} y={ry + rh / 2 + 3} fill={colors.stroke} fontSize="7" textAnchor="middle" fontFamily="monospace" opacity={0.9}>
        {cab.sku}
      </text>
      {selected && (
        <>
          <rect
            x={rx - 2} y={ry - 2} width={rw + 4} height={rh + 4} rx={3}
            fill="none" stroke="rgba(79,70,229,0.8)" strokeWidth="1.5"
          />
          {/* Corner handles */}
          {([
            [rx - 4, ry - 4, "tl"],
            [rx + rw - 2, ry - 4, "tr"],
            [rx - 4, ry + rh - 2, "bl"],
            [rx + rw - 2, ry + rh - 2, "br"],
          ] as [number, number, string][]).map(([hx, hy, handle]) => (
            <rect
              key={handle}
              x={hx} y={hy} width={6} height={6} rx={1}
              fill="white" stroke="rgba(99,102,241,0.8)" strokeWidth="1"
              style={{ cursor: handle === "tl" || handle === "br" ? "nwse-resize" : "nesw-resize" }}
              data-handle={handle}
              data-item-id={cab.id}
            />
          ))}
        </>
      )}
    </g>
  );
}

function ApplianceRect({
  app,
  selected,
  dimmed,
  onPointerDown,
  onDoubleClick,
}: {
  app: Appliance;
  selected: boolean;
  dimmed: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
}) {
  const { rx, ry, rw, rh } = itemRect({ ...app, rotation: app.name.includes("Refrigerator") ? 0 : (app.x === 168 ? 90 : 0) });
  const colors = COLOR.appliance;
  const isEastWall = app.x === 168 && !app.name.includes("Refrigerator");
  const finalRx = isEastWall ? tx(app.x - app.depth) : (app.name.includes("Refrigerator") ? tx(app.x) : rx);
  const finalRy = isEastWall ? ty(app.y) : (app.name.includes("Refrigerator") ? ty(app.y) : ry);
  const finalRw = isEastWall ? app.depth * SCALE : (app.name.includes("Refrigerator") ? app.width * SCALE : rw);
  const finalRh = isEastWall ? app.width * SCALE : (app.name.includes("Refrigerator") ? app.depth * SCALE : rh);
  const opacity = dimmed ? 0.2 : 1;

  return (
    <g
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{ cursor: "pointer", opacity }}
      data-item-id={app.id}
    >
      <rect
        x={finalRx} y={finalRy} width={finalRw} height={finalRh} rx={2}
        fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2.5 : 1.2}
      />
      {app.name.includes("Range") && (
        <>
          <circle cx={finalRx + finalRw * 0.3} cy={finalRy + finalRh * 0.3} r={3} fill="none" stroke="rgba(217,119,6,0.5)" strokeWidth="0.8" />
          <circle cx={finalRx + finalRw * 0.7} cy={finalRy + finalRh * 0.3} r={3} fill="none" stroke="rgba(217,119,6,0.5)" strokeWidth="0.8" />
          <circle cx={finalRx + finalRw * 0.3} cy={finalRy + finalRh * 0.7} r={3} fill="none" stroke="rgba(217,119,6,0.5)" strokeWidth="0.8" />
          <circle cx={finalRx + finalRw * 0.7} cy={finalRy + finalRh * 0.7} r={3} fill="none" stroke="rgba(217,119,6,0.5)" strokeWidth="0.8" />
        </>
      )}
      <text x={finalRx + finalRw / 2} y={finalRy + finalRh / 2 + 3} fill={colors.stroke} fontSize="7" textAnchor="middle" fontFamily="monospace" opacity={0.9}>
        {app.name.replace(/^\d+"\s*/, "").slice(0, 8)}
      </text>
      {selected && (
        <>
          <rect
            x={finalRx - 2} y={finalRy - 2} width={finalRw + 4} height={finalRh + 4} rx={3}
            fill="none" stroke="rgba(79,70,229,0.8)" strokeWidth="1.5"
          />
          {([
            [finalRx - 4, finalRy - 4, "tl"],
            [finalRx + finalRw - 2, finalRy - 4, "tr"],
            [finalRx - 4, finalRy + finalRh - 2, "bl"],
            [finalRx + finalRw - 2, finalRy + finalRh - 2, "br"],
          ] as [number, number, string][]).map(([hx, hy, handle]) => (
            <rect
              key={handle}
              x={hx} y={hy} width={6} height={6} rx={1}
              fill="white" stroke="rgba(99,102,241,0.8)" strokeWidth="1"
              style={{ cursor: "nwse-resize" }}
              data-handle={handle}
              data-item-id={app.id}
            />
          ))}
        </>
      )}
    </g>
  );
}

function FixtureRect({
  fix,
  selected,
  dimmed,
  onPointerDown,
  onDoubleClick,
}: {
  fix: Fixture;
  selected: boolean;
  dimmed: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick: () => void;
}) {
  const fx = tx(fix.x);
  const fy = ty(fix.y);
  const fw = fix.width * SCALE;
  const fh = fix.depth * SCALE;
  const colors = COLOR.fixture;
  const opacity = dimmed ? 0.2 : 1;

  return (
    <g
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{ cursor: "pointer", opacity }}
      data-item-id={fix.id}
    >
      <rect x={fx} y={fy} width={fw} height={fh} rx={3} fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2.5 : 1.2} />
      {fix.name.includes("Sink") && (
        <>
          <rect x={fx + 3} y={fy + 3} width={fw * 0.4} height={fh - 6} rx={4} fill="none" stroke="rgba(8,145,178,0.5)" strokeWidth="0.8" />
          <rect x={fx + fw * 0.5} y={fy + 3} width={fw * 0.4} height={fh - 6} rx={4} fill="none" stroke="rgba(8,145,178,0.5)" strokeWidth="0.8" />
        </>
      )}
      {fix.name.includes("Faucet") && (
        <circle cx={fx + fw / 2} cy={fy + fh / 2} r={2} fill="rgba(8,145,178,0.6)" />
      )}
      <text x={fx + fw / 2} y={fy + fh + 10} fill={colors.stroke} fontSize="7" textAnchor="middle" fontFamily="monospace" opacity={0.8}>
        {fix.name.replace(/^\d+"\s*/, "").slice(0, 10)}
      </text>
      {selected && (
        <>
          <rect x={fx - 2} y={fy - 2} width={fw + 4} height={fh + 4} rx={4} fill="none" stroke="rgba(79,70,229,0.8)" strokeWidth="1.5" />
          {([
            [fx - 4, fy - 4, "tl"],
            [fx + fw - 2, fy - 4, "tr"],
            [fx - 4, fy + fh - 2, "bl"],
            [fx + fw - 2, fy + fh - 2, "br"],
          ] as [number, number, string][]).map(([hx, hy, handle]) => (
            <rect
              key={handle}
              x={hx} y={hy} width={6} height={6} rx={1}
              fill="white" stroke="rgba(99,102,241,0.8)" strokeWidth="1"
              style={{ cursor: "nwse-resize" }}
              data-handle={handle}
              data-item-id={fix.id}
            />
          ))}
        </>
      )}
    </g>
  );
}

function WorkTriangle() {
  const sink = floorPlan.fixtures[0];
  const range = floorPlan.appliances[0];
  const fridge = floorPlan.appliances[2];

  const sinkCx = tx(sink.x + sink.width / 2);
  const sinkCy = ty(sink.y + sink.depth / 2);
  const rangeCx = tx(range.x - range.depth / 2);
  const rangeCy = ty(range.y + range.width / 2);
  const fridgeCx = tx(fridge.x + fridge.width / 2);
  const fridgeCy = ty(fridge.y + fridge.depth / 2);

  const dist = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

  const sinkToRange = dist(sink.x + sink.width / 2, sink.y + sink.depth / 2, range.x - range.depth / 2, range.y + range.width / 2);
  const rangeToFridge = dist(range.x - range.depth / 2, range.y + range.width / 2, fridge.x + fridge.width / 2, fridge.y + fridge.depth / 2);
  const fridgeToSink = dist(fridge.x + fridge.width / 2, fridge.y + fridge.depth / 2, sink.x + sink.width / 2, sink.y + sink.depth / 2);
  const total = sinkToRange + rangeToFridge + fridgeToSink;

  return (
    <g>
      <line x1={sinkCx} y1={sinkCy} x2={rangeCx} y2={rangeCy} stroke="rgba(217,119,6,0.5)" strokeWidth="1.5" strokeDasharray="8 4" />
      <line x1={rangeCx} y1={rangeCy} x2={fridgeCx} y2={fridgeCy} stroke="rgba(217,119,6,0.5)" strokeWidth="1.5" strokeDasharray="8 4" />
      <line x1={fridgeCx} y1={fridgeCy} x2={sinkCx} y2={sinkCy} stroke="rgba(217,119,6,0.5)" strokeWidth="1.5" strokeDasharray="8 4" />
      <text x={(sinkCx + rangeCx) / 2 - 5} y={(sinkCy + rangeCy) / 2 - 6} fill="rgba(180,83,9,0.8)" fontSize="7" textAnchor="middle" fontFamily="monospace">
        {(sinkToRange / 12).toFixed(1)}&apos;
      </text>
      <text x={(rangeCx + fridgeCx) / 2 + 12} y={(rangeCy + fridgeCy) / 2} fill="rgba(180,83,9,0.8)" fontSize="7" textAnchor="middle" fontFamily="monospace">
        {(rangeToFridge / 12).toFixed(1)}&apos;
      </text>
      <text x={(fridgeCx + sinkCx) / 2} y={(fridgeCy + sinkCy) / 2 - 6} fill="rgba(180,83,9,0.8)" fontSize="7" textAnchor="middle" fontFamily="monospace">
        {(fridgeToSink / 12).toFixed(1)}&apos;
      </text>
      <text x={(sinkCx + rangeCx + fridgeCx) / 3} y={(sinkCy + rangeCy + fridgeCy) / 3 + 4} fill="rgba(180,83,9,0.75)" fontSize="8" textAnchor="middle" fontStyle="italic" fontFamily="monospace">
        triangle {(total / 12).toFixed(1)}&apos;
      </text>
    </g>
  );
}

function DimensionLines() {
  const w = ROOM_W * SCALE;
  const h = ROOM_D * SCALE;
  const dimOffset = 24;
  const tickLen = 5;

  // 45-degree tick mark helper
  const tick45 = (cx: number, cy: number, vertical: boolean) => {
    const d = tickLen;
    if (vertical) {
      // Tick perpendicular to vertical dim line
      return <line x1={cx - d} y1={cy - d} x2={cx + d} y2={cy + d} stroke="rgba(51,65,85,0.7)" strokeWidth="1" />;
    }
    // Tick perpendicular to horizontal dim line
    return <line x1={cx - d} y1={cy + d} x2={cx + d} y2={cy - d} stroke="rgba(51,65,85,0.7)" strokeWidth="1" />;
  };

  return (
    <g>
      {/* Horizontal (top) — total room width */}
      <line x1={PAD} y1={PAD - dimOffset} x2={PAD + w} y2={PAD - dimOffset} stroke="rgba(71,85,105,0.5)" strokeWidth="0.8" />
      {tick45(PAD, PAD - dimOffset, false)}
      {tick45(PAD + w, PAD - dimOffset, false)}
      <text x={PAD + w / 2} y={PAD - dimOffset - 7} fill="rgba(30,41,59,0.9)" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="500">
        {formatInches(ROOM_W)}
      </text>

      {/* Vertical (right) — total room depth */}
      <line x1={PAD + w + dimOffset} y1={PAD} x2={PAD + w + dimOffset} y2={PAD + h} stroke="rgba(71,85,105,0.5)" strokeWidth="0.8" />
      {tick45(PAD + w + dimOffset, PAD, true)}
      {tick45(PAD + w + dimOffset, PAD + h, true)}
      <text
        x={PAD + w + dimOffset + 14} y={PAD + h / 2}
        fill="rgba(30,41,59,0.9)" fontSize="11" textAnchor="middle" fontFamily="monospace" fontWeight="500"
        transform={`rotate(90, ${PAD + w + dimOffset + 14}, ${PAD + h / 2})`}
      >
        {formatInches(ROOM_D)}
      </text>
    </g>
  );
}

function CabinetDimLabels({ cabinets }: { cabinets: Cabinet[] }) {
  const tickLen = 3;

  return (
    <g>
      {cabinets.filter(c => c.type !== "wall").map((cab) => {
        const { rx, ry, rw, rh } = itemRect(cab);
        const isVertical = cab.rotation === 90 || cab.rotation === 270;

        if (isVertical) {
          const dimX = rx - 10;
          const startY = ry;
          const endY = ry + rh;
          return (
            <g key={`dim-${cab.id}`}>
              {/* Dimension line */}
              <line x1={dimX} y1={startY} x2={dimX} y2={endY} stroke="rgba(71,85,105,0.4)" strokeWidth="0.6" />
              {/* Tick marks (45-degree) */}
              <line x1={dimX - tickLen} y1={startY - tickLen} x2={dimX + tickLen} y2={startY + tickLen} stroke="rgba(51,65,85,0.7)" strokeWidth="0.8" />
              <line x1={dimX - tickLen} y1={endY - tickLen} x2={dimX + tickLen} y2={endY + tickLen} stroke="rgba(51,65,85,0.7)" strokeWidth="0.8" />
              {/* Label */}
              <text
                x={dimX - 4} y={startY + (endY - startY) / 2}
                fill="rgba(51,65,85,0.85)" fontSize="7" textAnchor="middle" fontFamily="monospace"
                transform={`rotate(-90, ${dimX - 4}, ${startY + (endY - startY) / 2})`}
              >
                {cab.width}&quot;
              </text>
            </g>
          );
        }

        const dimY = ry - 8;
        const startX = rx;
        const endX = rx + rw;
        return (
          <g key={`dim-${cab.id}`}>
            {/* Dimension line */}
            <line x1={startX} y1={dimY} x2={endX} y2={dimY} stroke="rgba(71,85,105,0.4)" strokeWidth="0.6" />
            {/* Tick marks (45-degree) */}
            <line x1={startX - tickLen} y1={dimY + tickLen} x2={startX + tickLen} y2={dimY - tickLen} stroke="rgba(51,65,85,0.7)" strokeWidth="0.8" />
            <line x1={endX - tickLen} y1={dimY + tickLen} x2={endX + tickLen} y2={dimY - tickLen} stroke="rgba(51,65,85,0.7)" strokeWidth="0.8" />
            {/* Label */}
            <text
              x={startX + rw / 2} y={dimY - 3}
              fill="rgba(51,65,85,0.85)" fontSize="7" textAnchor="middle" fontFamily="monospace"
            >
              {cab.width}&quot;
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Enhanced dimension chains along walls with tick marks, individual widths, and total bracket */
function WallDimensionChains({ cabinets }: { cabinets: Cabinet[] }) {
  const northCabs = cabinets
    .filter(c => c.wall === "north" && c.type !== "wall")
    .sort((a, b) => a.x - b.x);

  const eastCabs = cabinets
    .filter(c => c.wall === "east" && c.type !== "wall")
    .sort((a, b) => a.y - b.y);

  const chainOffset = 42;
  const totalOffset = 56; // total dimension bracket further out
  const tickLen = 3;

  // 45-degree tick for horizontal chain
  const hTick = (x: number, y: number) => (
    <line x1={x - tickLen} y1={y + tickLen} x2={x + tickLen} y2={y - tickLen} stroke="rgba(51,65,85,0.65)" strokeWidth="0.8" />
  );
  // 45-degree tick for vertical chain
  const vTick = (x: number, y: number) => (
    <line x1={x - tickLen} y1={y - tickLen} x2={x + tickLen} y2={y + tickLen} stroke="rgba(51,65,85,0.65)" strokeWidth="0.8" />
  );

  return (
    <g>
      {/* North wall running dimension chain */}
      {northCabs.length > 0 && (() => {
        const firstX = northCabs[0].x;
        const lastEnd = northCabs[northCabs.length - 1].x + northCabs[northCabs.length - 1].width;
        const svgY = PAD - chainOffset;
        const totalY = PAD - totalOffset;
        return (
          <g>
            {/* Individual cabinet widths with ticks */}
            {northCabs.map((cab, i) => {
              const startX = tx(cab.x);
              const endX = tx(cab.x + cab.width);
              const midX = (startX + endX) / 2;
              return (
                <g key={`nchain-${cab.id}`}>
                  {/* Dim line segment */}
                  <line x1={startX} y1={svgY} x2={endX} y2={svgY} stroke="rgba(71,85,105,0.35)" strokeWidth="0.6" />
                  {/* Start tick */}
                  {hTick(startX, svgY)}
                  {/* End tick (only on last, others share with next start) */}
                  {i === northCabs.length - 1 && hTick(endX, svgY)}
                  {/* Individual width label */}
                  <text x={midX} y={svgY - 4} fill="rgba(51,65,85,0.8)" fontSize="6.5" textAnchor="middle" fontFamily="monospace">
                    {cab.width}&quot;
                  </text>
                  {/* Cumulative distance below line */}
                  <text x={endX} y={svgY + 10} fill="rgba(67,56,202,0.6)" fontSize="5.5" textAnchor="middle" fontFamily="monospace">
                    {cab.x + cab.width}&quot;
                  </text>
                </g>
              );
            })}
            {/* Total wall run dimension bracket */}
            <line x1={tx(firstX)} y1={totalY} x2={tx(lastEnd)} y2={totalY} stroke="rgba(51,65,85,0.5)" strokeWidth="0.8" />
            {hTick(tx(firstX), totalY)}
            {hTick(tx(lastEnd), totalY)}
            <text x={(tx(firstX) + tx(lastEnd)) / 2} y={totalY - 4} fill="rgba(30,41,59,0.85)" fontSize="8" textAnchor="middle" fontFamily="monospace" fontWeight="600">
              {lastEnd - firstX}&quot; total
            </text>
          </g>
        );
      })()}

      {/* East wall running dimension chain */}
      {eastCabs.length > 0 && (() => {
        const firstY = eastCabs[0].y;
        const lastEnd = eastCabs[eastCabs.length - 1].y + eastCabs[eastCabs.length - 1].width;
        const svgX = tx(ROOM_W) + chainOffset;
        const totalX = tx(ROOM_W) + totalOffset;
        return (
          <g>
            {eastCabs.map((cab, i) => {
              const startY = ty(cab.y);
              const endY = ty(cab.y + cab.width);
              const midY = (startY + endY) / 2;
              return (
                <g key={`echain-${cab.id}`}>
                  <line x1={svgX} y1={startY} x2={svgX} y2={endY} stroke="rgba(71,85,105,0.35)" strokeWidth="0.6" />
                  {vTick(svgX, startY)}
                  {i === eastCabs.length - 1 && vTick(svgX, endY)}
                  <text x={svgX + 8} y={midY + 2} fill="rgba(51,65,85,0.8)" fontSize="6.5" textAnchor="start" fontFamily="monospace">
                    {cab.width}&quot;
                  </text>
                </g>
              );
            })}
            {/* Total bracket for east wall */}
            <line x1={totalX} y1={ty(firstY)} x2={totalX} y2={ty(lastEnd)} stroke="rgba(51,65,85,0.5)" strokeWidth="0.8" />
            {vTick(totalX, ty(firstY))}
            {vTick(totalX, ty(lastEnd))}
            <text
              x={totalX + 8} y={(ty(firstY) + ty(lastEnd)) / 2}
              fill="rgba(30,41,59,0.85)" fontSize="8" textAnchor="start" fontFamily="monospace" fontWeight="600"
              transform={`rotate(90, ${totalX + 8}, ${(ty(firstY) + ty(lastEnd)) / 2})`}
            >
              {lastEnd - firstY}&quot; total
            </text>
          </g>
        );
      })()}
    </g>
  );
}

function FinishZones() {
  const perimW = ROOM_W * SCALE;
  const perimH = ROOM_D * SCALE;
  const islandCabs = floorPlan.cabinets.filter(c => c.wall === "island");
  const minX = Math.min(...islandCabs.map(c => c.x));
  const maxX = Math.max(...islandCabs.map(c => c.x + c.width));
  const minY = Math.min(...islandCabs.map(c => c.y));
  const maxY = Math.max(...islandCabs.map(c => c.y + c.depth));

  return (
    <g>
      <rect x={PAD} y={PAD} width={perimW} height={perimH} rx={2} fill="rgba(99,102,241,0.04)" stroke="none" />
      <rect
        x={tx(minX) - 8} y={ty(minY) - 8}
        width={(maxX - minX) * SCALE + 16} height={(maxY - minY) * SCALE + 16}
        rx={4} fill="rgba(34,197,94,0.06)" stroke="rgba(74,222,128,0.15)" strokeWidth="1" strokeDasharray="6 3"
      />
      <text x={tx(minX) - 8} y={ty(minY) - 14} fill="rgba(22,101,52,0.7)" fontSize="7" fontFamily="monospace">Island Zone</text>
      <text x={PAD + 4} y={PAD + 12} fill="rgba(67,56,202,0.6)" fontSize="7" fontFamily="monospace">Perimeter Zone</text>
    </g>
  );
}

function SnapGuidesOverlay({ guides }: { guides: SnapGuide[] }) {
  if (guides.length === 0) return null;
  return (
    <g>
      {guides.map((g, i) => (
        g.axis === "x" ? (
          <line key={i} x1={g.position} y1={0} x2={g.position} y2={SVG_H} stroke="rgba(6,182,212,0.7)" strokeWidth="1" strokeDasharray="3 3" />
        ) : (
          <line key={i} x1={0} y1={g.position} x2={SVG_W} y2={g.position} stroke="rgba(6,182,212,0.7)" strokeWidth="1" strokeDasharray="3 3" />
        )
      ))}
    </g>
  );
}

function StaticSnapGuides({ selectedId }: { selectedId: string }) {
  const allItems = [
    ...floorPlan.cabinets.map(c => ({ ...c, kind: "cab" as const })),
    ...floorPlan.appliances.map(a => ({ ...a, rotation: a.x === 168 ? 90 : 0, kind: "app" as const })),
    ...floorPlan.fixtures.map(f => ({ ...f, rotation: 0, kind: "fix" as const })),
  ];
  const item = allItems.find(i => i.id === selectedId);
  if (!item) return null;

  const { rx, ry, rw, rh } = itemRect(item as { x: number; y: number; width: number; depth: number; rotation: number });
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;

  return (
    <g>
      <line x1={cx} y1={PAD - 10} x2={cx} y2={PAD + ROOM_D * SCALE + 10} stroke="rgba(14,116,144,0.5)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1={PAD - 10} y1={cy} x2={PAD + ROOM_W * SCALE + 10} y2={cy} stroke="rgba(14,116,144,0.5)" strokeWidth="0.8" strokeDasharray="4 4" />
    </g>
  );
}

function DragTooltip({ x, y, itemX, itemY }: { x: number; y: number; itemX: number; itemY: number }) {
  return (
    <g>
      <rect x={x + 12} y={y - 24} width={90} height={20} rx={4} fill="rgba(15,23,42,0.85)" />
      <text x={x + 16} y={y - 10} fill="white" fontSize="9" fontFamily="monospace">
        x: {Math.round(itemX)}&quot; y: {Math.round(itemY)}&quot;
      </text>
    </g>
  );
}

function Legend() {
  const y0 = PAD + ROOM_D * SCALE + 30;
  const items = [
    { label: "Base", ...COLOR.base, dash: false },
    { label: "Wall", ...COLOR.wall, dash: true },
    { label: "Tall", ...COLOR.tall, dash: false },
    { label: "Island", ...COLOR.island, dash: false },
    { label: "Appliance", ...COLOR.appliance, dash: false },
    { label: "Fixture", ...COLOR.fixture, dash: false },
  ];

  return (
    <g>
      {items.map((item, i) => {
        const lx = PAD + i * 88;
        return (
          <g key={item.label}>
            <rect x={lx} y={y0} width={10} height={10} rx={1} fill={item.fill} stroke={item.stroke} strokeWidth="1" strokeDasharray={item.dash ? "2 1" : undefined} />
            <text x={lx + 14} y={y0 + 8} fill="rgba(51,65,85,0.75)" fontSize="9">{item.label}</text>
          </g>
        );
      })}
      <line x1={PAD + items.length * 88} y1={y0 + 5} x2={PAD + items.length * 88 + 24} y2={y0 + 5} stroke="rgba(217,119,6,0.5)" strokeWidth="1.5" strokeDasharray="6 3" />
      <text x={PAD + items.length * 88 + 28} y={y0 + 8} fill="rgba(51,65,85,0.75)" fontSize="9">Work Triangle</text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function EnhancedFloorPlan({
  selectedItemId,
  onSelectItem,
  showConstraints,
  showFinishZones,
  showDimensions,
  showSnapGuides,
  zoomLevel,
  onZoomChange,
  constraintViolations = [],
  visibilityFilter = "all",
  onDoubleClickItem,
  selectedIds: externalSelectedIds,
  onSelectedIdsChange,
  onItemPositionChange,
}: EnhancedFloorPlanProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Camera state: pan offset + zoom
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: zoomLevel / 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const panStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 });

  // Drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPos, setDragPos] = useState<{ svgX: number; svgY: number; itemX: number; itemY: number } | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // Snap guides during drag
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([]);

  // Item positions (local overrides for dragged items)
  const [itemOverrides, setItemOverrides] = useState<Map<string, { x: number; y: number; width?: number; depth?: number }>>(new Map());

  // Undo/redo
  const [undoHistory, setUndoHistory] = useState<UndoEntry[]>([]);
  const [redoHistory, setRedoHistory] = useState<UndoEntry[]>([]);

  // Internal selection set
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const selectedIdsSet = externalSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectedIdsChange ?? setInternalSelectedIds;

  // Sync zoom from prop
  useEffect(() => {
    setCamera(c => ({ ...c, zoom: zoomLevel / 100 }));
  }, [zoomLevel]);

  const violationMap = useMemo(() => {
    const m = new Map<string, "P1" | "P2" | "P3">();
    constraintViolations.forEach((v) => m.set(v.itemId, v.severity));
    return m;
  }, [constraintViolations]);

  // Get effective position for an item
  const getItemPos = useCallback((id: string, original: { x: number; y: number; width: number; depth: number }) => {
    const override = itemOverrides.get(id);
    if (override) return { ...original, ...override };
    return original;
  }, [itemOverrides]);

  // Convert screen coords to SVG coords
  const screenToSvg = useCallback((screenX: number, screenY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const x = (screenX - rect.left - camera.x) / camera.zoom;
    const y = (screenY - rect.top - camera.y) / camera.zoom;
    return { x, y };
  }, [camera]);

  // SVG coords to inches
  const svgToInches = useCallback((svgX: number, svgY: number) => {
    return { x: (svgX - PAD) / SCALE, y: (svgY - PAD) / SCALE };
  }, []);

  // Compute wall snap
  const computeWallSnap = useCallback((inchX: number, inchY: number, zoom: number): { x: number; y: number; guides: SnapGuide[] } => {
    const threshold = SNAP_THRESHOLD_PX / zoom / SCALE;
    const guides: SnapGuide[] = [];
    let snappedX = inchX;
    let snappedY = inchY;

    // Snap to room walls
    if (Math.abs(inchY) < threshold) { snappedY = 0; guides.push({ axis: "y", position: ty(0) }); }
    if (Math.abs(inchY - ROOM_D) < threshold) { snappedY = ROOM_D; guides.push({ axis: "y", position: ty(ROOM_D) }); }
    if (Math.abs(inchX) < threshold) { snappedX = 0; guides.push({ axis: "x", position: tx(0) }); }
    if (Math.abs(inchX - ROOM_W) < threshold) { snappedX = ROOM_W; guides.push({ axis: "x", position: tx(ROOM_W) }); }

    return { x: snappedX, y: snappedY, guides };
  }, []);

  // ---- Pointer Handlers ----

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      // Zoom centered on cursor
      const delta = Math.max(-10, Math.min(10, e.deltaY));
      const zoomFactor = 1 - delta / 50;
      const newZoom = clamp(camera.zoom * zoomFactor, MIN_ZOOM, MAX_ZOOM);

      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom toward cursor position
        const scale = newZoom / camera.zoom;
        const newX = mouseX - (mouseX - camera.x) * scale;
        const newY = mouseY - (mouseY - camera.y) * scale;

        setCamera({ x: newX, y: newY, zoom: newZoom });
        onZoomChange?.(Math.round(newZoom * 100));
      }
    } else {
      // Pan
      let { deltaX, deltaY } = e;
      if (e.deltaMode === 1) { deltaX *= 40; deltaY *= 40; }
      setCamera(c => ({ ...c, x: c.x - deltaX, y: c.y - deltaY }));
    }
  }, [camera, onZoomChange]);

  // Space key for pan mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " && !e.repeat) {
        e.preventDefault();
        setSpaceHeld(true);
      }
      if (e.key === "Escape") {
        onSelectItem(null);
        setSelectedIds(new Set());
        setDragState(null);
        dragRef.current = null;
        setDragPos(null);
        setActiveSnapGuides([]);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedItemId) {
          const name = findItemName(selectedItemId);
          toast.success(`Deleted ${name}`);
          onSelectItem(null);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        // Undo
        if (undoHistory.length > 0) {
          const prev = undoHistory[undoHistory.length - 1];
          setRedoHistory(r => [...r, { items: new Map(itemOverrides) }]);
          setItemOverrides(prev.items);
          setUndoHistory(h => h.slice(0, -1));
          toast.success("Undo");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        // Redo
        if (redoHistory.length > 0) {
          const next = redoHistory[redoHistory.length - 1];
          setUndoHistory(h => [...h, { items: new Map(itemOverrides) }]);
          setItemOverrides(next.items);
          setRedoHistory(r => r.slice(0, -1));
          toast.success("Redo");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        const allIds = new Set([
          ...floorPlan.cabinets.map(c => c.id),
          ...floorPlan.appliances.map(a => a.id),
          ...floorPlan.fixtures.map(f => f.id),
        ]);
        setSelectedIds(allIds);
        toast.success(`Selected all (${allIds.size} items)`);
      }
      // Arrow key nudge
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedItemId) {
        e.preventDefault();
        const nudge = e.shiftKey ? 0.25 : 1; // 1/4" or 1"
        const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
        const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;

        setUndoHistory(h => [...h, { items: new Map(itemOverrides) }]);
        setRedoHistory([]);
        setItemOverrides(prev => {
          const next = new Map(prev);
          const current = next.get(selectedItemId) || findItemOriginal(selectedItemId);
          if (current) {
            next.set(selectedItemId, { x: current.x + dx, y: current.y + dy });
          }
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") setSpaceHeld(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedItemId, onSelectItem, setSelectedIds, undoHistory, redoHistory, itemOverrides]);

  // Find item name/original for helpers
  const findItemName = (id: string) => {
    const cab = floorPlan.cabinets.find(c => c.id === id);
    if (cab) return cab.name;
    const app = floorPlan.appliances.find(a => a.id === id);
    if (app) return app.name;
    const fix = floorPlan.fixtures.find(f => f.id === id);
    if (fix) return fix.name;
    return "item";
  };

  const findItemOriginal = (id: string): { x: number; y: number } | null => {
    const cab = floorPlan.cabinets.find(c => c.id === id);
    if (cab) return { x: cab.x, y: cab.y };
    const app = floorPlan.appliances.find(a => a.id === id);
    if (app) return { x: app.x, y: app.y };
    const fix = floorPlan.fixtures.find(f => f.id === id);
    if (fix) return { x: fix.x, y: fix.y };
    return null;
  };

  // Pointer down on canvas background = start pan or deselect
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    // Check if clicking on an item (has data-item-id)
    const target = e.target as SVGElement;
    const itemEl = target.closest("[data-item-id]") as SVGElement | null;

    if (spaceHeld || e.button === 1) {
      // Start pan
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, camX: camera.x, camY: camera.y };
      (e.target as Element).setPointerCapture?.(e.pointerId);
      return;
    }

    if (!itemEl) {
      // Clicked background
      onSelectItem(null);
      setSelectedIds(new Set());
      return;
    }
  }, [spaceHeld, camera, onSelectItem, setSelectedIds]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCamera(c => ({ ...c, x: panStart.current.camX + dx, y: panStart.current.camY + dy }));
      return;
    }

    const ds = dragRef.current;
    if (!ds) return;

    const dx = e.clientX - ds.startScreenX;
    const dy = e.clientY - ds.startScreenY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!ds.isDragging && distance > DRAG_THRESHOLD_PX) {
      ds.isDragging = true;
      dragRef.current = { ...ds, isDragging: true };
      setDragState({ ...ds, isDragging: true });
      // Save undo state
      setUndoHistory(h => [...h, { items: new Map(itemOverrides) }]);
      setRedoHistory([]);
    }

    if (ds.isDragging) {
      // Convert screen delta to inch delta
      const inchDx = dx / camera.zoom / SCALE;
      const inchDy = dy / camera.zoom / SCALE;

      let newX = ds.startItemX + inchDx;
      let newY = ds.startItemY + inchDy;

      // Grid snap
      newX = snapToGrid(newX, GRID_SNAP_INCHES);
      newY = snapToGrid(newY, GRID_SNAP_INCHES);

      // Wall snap
      const wallSnap = computeWallSnap(newX, newY, camera.zoom);
      if (wallSnap.guides.length > 0) {
        newX = wallSnap.x;
        newY = wallSnap.y;
        setActiveSnapGuides(wallSnap.guides);
      } else {
        setActiveSnapGuides([]);
      }

      // Update override
      setItemOverrides(prev => {
        const next = new Map(prev);
        next.set(ds.itemId, { x: newX, y: newY });
        return next;
      });

      // Update drag tooltip pos
      const svgPos = screenToSvg(e.clientX, e.clientY);
      setDragPos({ svgX: svgPos.x, svgY: svgPos.y, itemX: newX, itemY: newY });

      onItemPositionChange?.(ds.itemId, newX, newY);
    }
  }, [isPanning, camera, itemOverrides, screenToSvg, computeWallSnap, onItemPositionChange]);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      return;
    }

    if (dragRef.current?.isDragging) {
      setActiveSnapGuides([]);
    }

    dragRef.current = null;
    setDragState(null);
    setDragPos(null);
  }, [isPanning]);

  // Pointer down on item
  const handleItemPointerDown = useCallback((e: React.PointerEvent, itemId: string) => {
    e.stopPropagation();

    // Check if clicking a resize handle
    const target = e.target as SVGElement;
    if (target.dataset.handle) {
      // Resize handled separately — for now just select
      return;
    }

    // Selection
    if (e.shiftKey) {
      const next = new Set(selectedIdsSet);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      setSelectedIds(next);
    } else {
      onSelectItem(itemId);
      setSelectedIds(new Set([itemId]));
    }

    // Start potential drag
    const original = findItemOriginal(itemId);
    const override = itemOverrides.get(itemId);
    const pos = override || original;
    if (!pos) return;

    const ds: DragState = {
      isDragging: false,
      itemId,
      startScreenX: e.clientX,
      startScreenY: e.clientY,
      startItemX: pos.x,
      startItemY: pos.y,
    };
    dragRef.current = ds;
    setDragState(ds);

    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [selectedIdsSet, setSelectedIds, onSelectItem, itemOverrides]);

  // Visibility filter logic
  const isItemDimmed = useCallback((id: string, type: string, cabType?: string) => {
    if (visibilityFilter === "all") return false;
    if (visibilityFilter === "legend") return true;
    if (visibilityFilter === "nkba") return false; // show everything for NKBA
    if (visibilityFilter === "cabinets") return type !== "cabinet";
    if (visibilityFilter === "wallCabs") return cabType !== "wall";
    if (visibilityFilter === "appliances") return type !== "appliance";
    if (visibilityFilter === "countertops") return type !== "cabinet"; // dim non-cabinet
    return false;
  }, [visibilityFilter]);

  // Compute effective cabinet data with overrides
  const effectiveCabinets = useMemo(() => {
    return floorPlan.cabinets.map(cab => {
      const override = itemOverrides.get(cab.id);
      if (override) return { ...cab, x: override.x, y: override.y, width: override.width ?? cab.width, depth: override.depth ?? cab.depth };
      return cab;
    });
  }, [itemOverrides]);

  const effectiveAppliances = useMemo(() => {
    return floorPlan.appliances.map(app => {
      const override = itemOverrides.get(app.id);
      if (override) return { ...app, x: override.x, y: override.y };
      return app;
    });
  }, [itemOverrides]);

  const effectiveFixtures = useMemo(() => {
    return floorPlan.fixtures.map(fix => {
      const override = itemOverrides.get(fix.id);
      if (override) return { ...fix, x: override.x, y: override.y };
      return fix;
    });
  }, [itemOverrides]);

  // Compute viewBox from camera
  const viewBox = useMemo(() => {
    const vbW = SVG_W;
    const vbH = SVG_H;
    return `0 0 ${vbW} ${vbH}`;
  }, []);

  const cursorStyle = isPanning || spaceHeld ? "grabbing" : "default";

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ touchAction: "none", cursor: cursorStyle }}
      onWheel={handleWheel as unknown as React.WheelEventHandler<HTMLDivElement>}
    >
      {/* Zoom indicator */}
      <div className="absolute top-3 right-3 z-10 rounded-md bg-background/80 px-2 py-1 text-xs font-mono text-muted-foreground border border-border shadow-sm backdrop-blur-sm">
        {Math.round(camera.zoom * 100)}%
      </div>

      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="h-full w-full"
        style={{
          transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
          transformOrigin: "0 0",
        }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        <GridPattern />

        {showFinishZones && <FinishZones />}

        <Walls walls={floorPlan.walls} />
        <Openings openings={floorPlan.openings} />

        {/* Cabinets */}
        {effectiveCabinets.map((cab) => (
          <CabinetRect
            key={cab.id}
            cab={cab}
            selected={selectedItemId === cab.id || selectedIdsSet.has(cab.id)}
            violated={showConstraints ? violationMap.get(cab.id) : undefined}
            dimmed={isItemDimmed(cab.id, "cabinet", cab.type)}
            onPointerDown={(e) => handleItemPointerDown(e, cab.id)}
            onDoubleClick={() => onDoubleClickItem?.(cab.id)}
          />
        ))}

        {/* Appliances */}
        {effectiveAppliances.map((app) => (
          <ApplianceRect
            key={app.id}
            app={app}
            selected={selectedItemId === app.id || selectedIdsSet.has(app.id)}
            dimmed={isItemDimmed(app.id, "appliance")}
            onPointerDown={(e) => handleItemPointerDown(e, app.id)}
            onDoubleClick={() => onDoubleClickItem?.(app.id)}
          />
        ))}

        {/* Fixtures */}
        {effectiveFixtures.map((fix) => (
          <FixtureRect
            key={fix.id}
            fix={fix}
            selected={selectedItemId === fix.id || selectedIdsSet.has(fix.id)}
            dimmed={isItemDimmed(fix.id, "fixture")}
            onPointerDown={(e) => handleItemPointerDown(e, fix.id)}
            onDoubleClick={() => onDoubleClickItem?.(fix.id)}
          />
        ))}

        {/* Work Triangle */}
        {visibilityFilter !== "legend" && <WorkTriangle />}

        {/* Dimension lines */}
        {showDimensions && (
          <>
            <DimensionLines />
            <CabinetDimLabels cabinets={effectiveCabinets} />
            <WallDimensionChains cabinets={effectiveCabinets} />
          </>
        )}

        {/* Snap guides */}
        {showSnapGuides && selectedItemId && !dragState?.isDragging && <StaticSnapGuides selectedId={selectedItemId} />}

        {/* Active drag snap guides */}
        <SnapGuidesOverlay guides={activeSnapGuides} />

        {/* Drag tooltip */}
        {dragState?.isDragging && dragPos && (
          <DragTooltip x={dragPos.svgX} y={dragPos.svgY} itemX={dragPos.itemX} itemY={dragPos.itemY} />
        )}

        {/* NKBA constraint overlay */}
        {visibilityFilter === "nkba" && constraintViolations.length > 0 && (
          <g>
            {constraintViolations.map((v) => {
              const allItems = [...effectiveCabinets, ...effectiveAppliances, ...effectiveFixtures] as { id: string; x: number; y: number; width: number; depth: number; rotation?: number }[];
              const item = allItems.find(i => i.id === v.itemId);
              if (!item) return null;
              const { rx, ry, rw, rh } = itemRect({ ...item, rotation: (item as { rotation?: number }).rotation ?? 0 });
              return (
                <rect
                  key={`nkba-${v.itemId}`}
                  x={rx - 6} y={ry - 6} width={rw + 12} height={rh + 12} rx={6}
                  fill={v.severity === "P1" ? "rgba(220,38,38,0.15)" : "rgba(217,119,6,0.1)"}
                  stroke={SEVERITY_COLOR[v.severity]} strokeWidth="2.5" strokeDasharray="8 4"
                />
              );
            })}
          </g>
        )}

        {/* Legend */}
        {(visibilityFilter === "all" || visibilityFilter === "legend") && <Legend />}
      </svg>
    </div>
  );
}
