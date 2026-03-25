"use client";

import { useMemo } from "react";
import {
  floorPlan,
  type Cabinet,
  type Appliance,
  type Fixture,
  type WallSegment,
  type Opening,
} from "@/data/kb/floor-plan-data";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EnhancedFloorPlanProps {
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  showConstraints: boolean;
  showFinishZones: boolean;
  showDimensions: boolean;
  showSnapGuides: boolean;
  zoomLevel: number;
  constraintViolations?: { itemId: string; severity: "P1" | "P2" | "P3" }[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCALE = 3.2; // inches -> SVG px
const PAD = 60;
const ROOM_W = floorPlan.roomWidth; // 168"
const ROOM_D = floorPlan.roomDepth; // 144"
const SVG_W = ROOM_W * SCALE + PAD * 2 + 60;
const SVG_H = ROOM_D * SCALE + PAD * 2 + 60;

const COLOR = {
  base: { fill: "rgba(59,130,246,0.12)", stroke: "rgba(96,165,250,0.5)" },
  wall: { fill: "rgba(99,102,241,0.12)", stroke: "rgba(129,140,248,0.5)" },
  corner: { fill: "rgba(59,130,246,0.12)", stroke: "rgba(96,165,250,0.5)" },
  tall: { fill: "rgba(139,92,246,0.12)", stroke: "rgba(167,139,250,0.5)" },
  island: { fill: "rgba(34,197,94,0.10)", stroke: "rgba(74,222,128,0.5)" },
  appliance: { fill: "rgba(245,158,11,0.12)", stroke: "rgba(245,158,11,0.5)" },
  fixture: { fill: "rgba(34,211,238,0.12)", stroke: "rgba(34,211,238,0.5)" },
} as const;

const SEVERITY_COLOR = { P1: "rgba(239,68,68,0.7)", P2: "rgba(245,158,11,0.6)", P3: "rgba(234,179,8,0.5)" };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function tx(inches: number) { return PAD + inches * SCALE; }
function ty(inches: number) { return PAD + inches * SCALE; }

/** Compute rect x/y/w/h from item data + rotation for wall-mounted items */
function itemRect(item: { x: number; y: number; width: number; depth: number; rotation: number }) {
  const { x, y, width, depth, rotation } = item;
  const r = rotation % 360;
  if (r === 0) return { rx: tx(x), ry: ty(y), rw: width * SCALE, rh: depth * SCALE };
  if (r === 90) return { rx: tx(x - depth), ry: ty(y), rw: depth * SCALE, rh: width * SCALE };
  if (r === 180) return { rx: tx(x - width), ry: ty(y - depth), rw: width * SCALE, rh: depth * SCALE };
  // 270
  return { rx: tx(x), ry: ty(y - width), rw: depth * SCALE, rh: width * SCALE };
}

function formatInches(v: number): string {
  const ft = Math.floor(v / 12);
  const inches = v % 12;
  if (ft === 0) return `${inches}"`;
  if (inches === 0) return `${ft}'-0"`;
  return `${ft}'-${inches}"`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function GridPattern() {
  return (
    <>
      <defs>
        <pattern id="grid-dots-enhanced" width={12 * SCALE} height={12 * SCALE} patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.8" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-dots-enhanced)" />
    </>
  );
}

function Walls({ walls }: { walls: WallSegment[] }) {
  return (
    <g>
      {walls.map((w) => (
        <line
          key={w.id}
          x1={tx(w.start.x)} y1={ty(w.start.y)}
          x2={tx(w.end.x)} y2={ty(w.end.y)}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={w.thickness * SCALE * 0.4}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function Openings({ openings }: { openings: Opening[] }) {
  return (
    <g>
      {openings.map((o) => {
        if (o.type === "window") {
          // Double-line window indicator on the wall
          const isNorth = o.wall === "north";
          const isEast = o.wall === "east";
          if (isNorth) {
            const wx = tx(o.x);
            const wy = ty(0);
            return (
              <g key={o.id}>
                <line x1={wx} y1={wy - 3} x2={wx + o.width * SCALE} y2={wy - 3} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                <line x1={wx} y1={wy + 3} x2={wx + o.width * SCALE} y2={wy + 3} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                <text x={wx + (o.width * SCALE) / 2} y={wy - 9} fill="rgba(255,255,255,0.25)" fontSize="8" textAnchor="middle" fontFamily="monospace">window</text>
              </g>
            );
          }
          if (isEast) {
            const wx = tx(ROOM_W);
            const wy = ty(o.y);
            return (
              <g key={o.id}>
                <line x1={wx - 3} y1={wy} x2={wx - 3} y2={wy + o.width * SCALE} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                <line x1={wx + 3} y1={wy} x2={wx + 3} y2={wy + o.width * SCALE} stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                <text x={wx + 12} y={wy + (o.width * SCALE) / 2} fill="rgba(255,255,255,0.25)" fontSize="8" textAnchor="middle" fontFamily="monospace" transform={`rotate(90, ${wx + 12}, ${wy + (o.width * SCALE) / 2})`}>window</text>
              </g>
            );
          }
          return null;
        }
        // Door with swing arc
        if (o.type === "door") {
          const dx = tx(o.x);
          const dy = ty(o.y);
          const dw = o.width * SCALE;
          const isRight = o.swingDirection === "right";
          return (
            <g key={o.id}>
              {/* Door gap in wall */}
              <line x1={dx} y1={dy} x2={dx + dw} y2={dy} stroke="#0d1117" strokeWidth={6} />
              {/* Door leaf */}
              <line
                x1={isRight ? dx + dw : dx}
                y1={dy}
                x2={isRight ? dx + dw : dx}
                y2={dy - dw}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
              />
              {/* Swing arc */}
              <path
                d={isRight
                  ? `M ${dx + dw} ${dy - dw} A ${dw} ${dw} 0 0 1 ${dx} ${dy}`
                  : `M ${dx} ${dy - dw} A ${dw} ${dw} 0 0 0 ${dx + dw} ${dy}`}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <text x={dx + dw / 2} y={dy + 14} fill="rgba(255,255,255,0.25)" fontSize="8" textAnchor="middle" fontFamily="monospace">door</text>
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
  onClick,
}: {
  cab: Cabinet;
  selected: boolean;
  violated?: "P1" | "P2" | "P3";
  onClick: () => void;
}) {
  const { rx, ry, rw, rh } = itemRect(cab);
  const isWall = cab.type === "wall";
  const colors = COLOR[cab.type] || COLOR.base;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {/* Violation outline */}
      {violated && (
        <rect
          x={rx - 4} y={ry - 4} width={rw + 8} height={rh + 8} rx={4}
          fill="none" stroke={SEVERITY_COLOR[violated]} strokeWidth="2" strokeDasharray="6 3"
        />
      )}
      {/* Cabinet body */}
      <rect
        x={rx} y={ry} width={rw} height={rh} rx={2}
        fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2 : 1}
        strokeDasharray={isWall ? "5 2" : undefined}
      />
      {/* Corner indicator for blind/diagonal/lazy-susan */}
      {cab.type === "corner" && cab.subType === "diagonal" && (
        <line
          x1={rx} y1={ry} x2={rx + rw} y2={ry + rh}
          stroke={colors.stroke} strokeWidth="0.8" opacity={0.5}
        />
      )}
      {cab.type === "corner" && cab.subType === "lazy-susan" && (
        <circle
          cx={rx + rw / 2} cy={ry + rh / 2} r={Math.min(rw, rh) * 0.3}
          fill="none" stroke={colors.stroke} strokeWidth="0.8" opacity={0.5} strokeDasharray="3 2"
        />
      )}
      {cab.type === "corner" && cab.subType === "blind" && (
        <line
          x1={rx + rw * 0.15} y1={ry + rh * 0.5}
          x2={rx + rw * 0.85} y2={ry + rh * 0.5}
          stroke={colors.stroke} strokeWidth="0.8" opacity={0.4}
        />
      )}
      {/* SKU label */}
      <text
        x={rx + rw / 2} y={ry + rh / 2 + 3}
        fill={colors.stroke} fontSize="7" textAnchor="middle" fontFamily="monospace" opacity={0.9}
      >
        {cab.sku}
      </text>
      {/* Selection highlight */}
      {selected && (
        <>
          <rect
            x={rx - 2} y={ry - 2} width={rw + 4} height={rh + 4} rx={3}
            fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"
          />
          {/* Corner handles */}
          {[[rx - 3, ry - 3], [rx + rw - 1, ry - 3], [rx - 3, ry + rh - 1], [rx + rw - 1, ry + rh - 1]].map(([hx, hy], i) => (
            <rect key={i} x={hx} y={hy} width={5} height={5} rx={1} fill="white" stroke="rgba(99,102,241,0.8)" strokeWidth="1" />
          ))}
        </>
      )}
    </g>
  );
}

function ApplianceRect({
  app,
  selected,
  onClick,
}: {
  app: Appliance;
  selected: boolean;
  onClick: () => void;
}) {
  const { rx, ry, rw, rh } = itemRect({ ...app, rotation: app.name.includes("Refrigerator") ? 0 : (app.x === 168 ? 90 : 0) });
  const colors = COLOR.appliance;

  // Special handling: range on east wall is rotated
  const isEastWall = app.x === 168;
  const finalRx = isEastWall ? tx(app.x - app.depth) : rx;
  const finalRy = isEastWall ? ty(app.y) : ry;
  const finalRw = isEastWall ? app.depth * SCALE : rw;
  const finalRh = isEastWall ? app.width * SCALE : rh;

  // Refrigerator is on north wall near east corner
  const isFridge = app.name.includes("Refrigerator");
  const fRx = isFridge ? tx(app.x) : finalRx;
  const fRy = isFridge ? ty(app.y) : finalRy;
  const fRw = isFridge ? app.width * SCALE : finalRw;
  const fRh = isFridge ? app.depth * SCALE : finalRh;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect
        x={fRx} y={fRy} width={fRw} height={fRh} rx={2}
        fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2 : 1.2}
      />
      {/* Range burner circles */}
      {app.name.includes("Range") && (
        <>
          <circle cx={fRx + fRw * 0.3} cy={fRy + fRh * 0.3} r={3} fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
          <circle cx={fRx + fRw * 0.7} cy={fRy + fRh * 0.3} r={3} fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
          <circle cx={fRx + fRw * 0.3} cy={fRy + fRh * 0.7} r={3} fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
          <circle cx={fRx + fRw * 0.7} cy={fRy + fRh * 0.7} r={3} fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
        </>
      )}
      <text
        x={fRx + fRw / 2} y={fRy + fRh / 2 + 3}
        fill={colors.stroke} fontSize="7" textAnchor="middle" fontFamily="monospace" opacity={0.9}
      >
        {app.name.replace(/^\d+"\s*/, "").slice(0, 8)}
      </text>
      {selected && (
        <rect
          x={fRx - 2} y={fRy - 2} width={fRw + 4} height={fRh + 4} rx={3}
          fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"
        />
      )}
    </g>
  );
}

function FixtureRect({
  fix,
  selected,
  onClick,
}: {
  fix: Fixture;
  selected: boolean;
  onClick: () => void;
}) {
  const fx = tx(fix.x);
  const fy = ty(fix.y);
  const fw = fix.width * SCALE;
  const fh = fix.depth * SCALE;
  const colors = COLOR.fixture;

  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <rect
        x={fx} y={fy} width={fw} height={fh} rx={3}
        fill={colors.fill} stroke={colors.stroke} strokeWidth={selected ? 2 : 1.2}
      />
      {/* Sink basin shapes */}
      {fix.name.includes("Sink") && (
        <>
          <rect x={fx + 3} y={fy + 3} width={fw * 0.4} height={fh - 6} rx={4} fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="0.8" />
          <rect x={fx + fw * 0.5} y={fy + 3} width={fw * 0.4} height={fh - 6} rx={4} fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="0.8" />
        </>
      )}
      {/* Faucet dot */}
      {fix.name.includes("Faucet") && (
        <circle cx={fx + fw / 2} cy={fy + fh / 2} r={2} fill="rgba(34,211,238,0.5)" />
      )}
      <text
        x={fx + fw / 2} y={fy + fh + 10}
        fill={colors.stroke} fontSize="7" textAnchor="middle" fontFamily="monospace" opacity={0.8}
      >
        {fix.name.replace(/^\d+"\s*/, "").slice(0, 10)}
      </text>
      {selected && (
        <rect
          x={fx - 2} y={fy - 2} width={fw + 4} height={fh + 4} rx={4}
          fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"
        />
      )}
    </g>
  );
}

function WorkTriangle() {
  // Sink center, Range center, Fridge center
  const sink = floorPlan.fixtures[0];
  const range = floorPlan.appliances[0];
  const fridge = floorPlan.appliances[2];

  const sinkCx = tx(sink.x + sink.width / 2);
  const sinkCy = ty(sink.y + sink.depth / 2);
  const rangeCx = tx(range.x - range.depth / 2);
  const rangeCy = ty(range.y + range.width / 2);
  const fridgeCx = tx(fridge.x + fridge.width / 2);
  const fridgeCy = ty(fridge.y + fridge.depth / 2);

  // Calculate leg distances in inches for labels
  const dist = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const sinkToRange = dist(sink.x + sink.width / 2, sink.y + sink.depth / 2, range.x - range.depth / 2, range.y + range.width / 2);
  const rangeToFridge = dist(range.x - range.depth / 2, range.y + range.width / 2, fridge.x + fridge.width / 2, fridge.y + fridge.depth / 2);
  const fridgeToSink = dist(fridge.x + fridge.width / 2, fridge.y + fridge.depth / 2, sink.x + sink.width / 2, sink.y + sink.depth / 2);
  const total = sinkToRange + rangeToFridge + fridgeToSink;

  return (
    <g>
      {/* Triangle lines */}
      <line x1={sinkCx} y1={sinkCy} x2={rangeCx} y2={rangeCy}
        stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeDasharray="8 4" />
      <line x1={rangeCx} y1={rangeCy} x2={fridgeCx} y2={fridgeCy}
        stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeDasharray="8 4" />
      <line x1={fridgeCx} y1={fridgeCy} x2={sinkCx} y2={sinkCy}
        stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeDasharray="8 4" />

      {/* Leg measurements */}
      <text
        x={(sinkCx + rangeCx) / 2 - 5} y={(sinkCy + rangeCy) / 2 - 6}
        fill="rgba(245,158,11,0.6)" fontSize="7" textAnchor="middle" fontFamily="monospace"
      >
        {(sinkToRange / 12).toFixed(1)}&apos;
      </text>
      <text
        x={(rangeCx + fridgeCx) / 2 + 12} y={(rangeCy + fridgeCy) / 2}
        fill="rgba(245,158,11,0.6)" fontSize="7" textAnchor="middle" fontFamily="monospace"
      >
        {(rangeToFridge / 12).toFixed(1)}&apos;
      </text>
      <text
        x={(fridgeCx + sinkCx) / 2} y={(fridgeCy + sinkCy) / 2 - 6}
        fill="rgba(245,158,11,0.6)" fontSize="7" textAnchor="middle" fontFamily="monospace"
      >
        {(fridgeToSink / 12).toFixed(1)}&apos;
      </text>

      {/* Total label */}
      <text
        x={(sinkCx + rangeCx + fridgeCx) / 3} y={(sinkCy + rangeCy + fridgeCy) / 3 + 4}
        fill="rgba(245,158,11,0.5)" fontSize="8" textAnchor="middle" fontStyle="italic" fontFamily="monospace"
      >
        triangle {(total / 12).toFixed(1)}&apos;
      </text>
    </g>
  );
}

function DimensionLines() {
  const w = ROOM_W * SCALE;
  const h = ROOM_D * SCALE;
  const dimOffset = 24;

  return (
    <g>
      {/* Horizontal (top) */}
      <line x1={PAD} y1={PAD - dimOffset} x2={PAD + w} y2={PAD - dimOffset}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={PAD} y1={PAD - dimOffset - 4} x2={PAD} y2={PAD - dimOffset + 4}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={PAD + w} y1={PAD - dimOffset - 4} x2={PAD + w} y2={PAD - dimOffset + 4}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <text x={PAD + w / 2} y={PAD - dimOffset - 6}
        fill="rgba(148,163,184,0.6)" fontSize="10" textAnchor="middle" fontFamily="monospace">
        {formatInches(ROOM_W)}
      </text>

      {/* Vertical (right) */}
      <line x1={PAD + w + dimOffset} y1={PAD} x2={PAD + w + dimOffset} y2={PAD + h}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={PAD + w + dimOffset - 4} y1={PAD} x2={PAD + w + dimOffset + 4} y2={PAD}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <line x1={PAD + w + dimOffset - 4} y1={PAD + h} x2={PAD + w + dimOffset + 4} y2={PAD + h}
        stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
      <text
        x={PAD + w + dimOffset + 14} y={PAD + h / 2}
        fill="rgba(148,163,184,0.6)" fontSize="10" textAnchor="middle" fontFamily="monospace"
        transform={`rotate(90, ${PAD + w + dimOffset + 14}, ${PAD + h / 2})`}
      >
        {formatInches(ROOM_D)}
      </text>
    </g>
  );
}

function CabinetDimLabels({ cabinets }: { cabinets: Cabinet[] }) {
  return (
    <g>
      {cabinets.filter(c => c.type !== "wall").map((cab) => {
        const { rx, ry, rw } = itemRect(cab);
        const isVertical = cab.rotation === 90 || cab.rotation === 270;
        if (isVertical) {
          return (
            <text key={`dim-${cab.id}`}
              x={rx - 6} y={ry + rw / 2}
              fill="rgba(148,163,184,0.5)" fontSize="6" textAnchor="middle" fontFamily="monospace"
              transform={`rotate(-90, ${rx - 6}, ${ry + rw / 2})`}
            >
              {cab.width}&quot;
            </text>
          );
        }
        return (
          <text key={`dim-${cab.id}`}
            x={rx + rw / 2} y={ry - 5}
            fill="rgba(148,163,184,0.5)" fontSize="6" textAnchor="middle" fontFamily="monospace"
          >
            {cab.width}&quot;
          </text>
        );
      })}
    </g>
  );
}

function FinishZones() {
  const perimW = ROOM_W * SCALE;
  const perimH = ROOM_D * SCALE;
  // Island zone
  const islandCabs = floorPlan.cabinets.filter(c => c.wall === "island");
  const minX = Math.min(...islandCabs.map(c => c.x));
  const maxX = Math.max(...islandCabs.map(c => c.x + c.width));
  const minY = Math.min(...islandCabs.map(c => c.y));
  const maxY = Math.max(...islandCabs.map(c => c.y + c.depth));

  return (
    <g>
      {/* Perimeter zone */}
      <rect x={PAD} y={PAD} width={perimW} height={perimH} rx={2}
        fill="rgba(99,102,241,0.04)" stroke="none" />
      {/* Island zone */}
      <rect
        x={tx(minX) - 8} y={ty(minY) - 8}
        width={(maxX - minX) * SCALE + 16} height={(maxY - minY) * SCALE + 16}
        rx={4}
        fill="rgba(34,197,94,0.06)" stroke="rgba(74,222,128,0.15)" strokeWidth="1" strokeDasharray="6 3"
      />
      <text x={tx(minX) - 8} y={ty(minY) - 14}
        fill="rgba(74,222,128,0.4)" fontSize="7" fontFamily="monospace">Island Zone</text>
      <text x={PAD + 4} y={PAD + 12}
        fill="rgba(129,140,248,0.3)" fontSize="7" fontFamily="monospace">Perimeter Zone</text>
    </g>
  );
}

function SnapGuides({ selectedId }: { selectedId: string }) {
  // Find selected item to draw guides through its center
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
      <line x1={cx} y1={PAD - 10} x2={cx} y2={PAD + ROOM_D * SCALE + 10}
        stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" strokeDasharray="4 4" />
      <line x1={PAD - 10} y1={cy} x2={PAD + ROOM_W * SCALE + 10} y2={cy}
        stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" strokeDasharray="4 4" />
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
            <rect x={lx} y={y0} width={10} height={10} rx={1}
              fill={item.fill} stroke={item.stroke} strokeWidth="1"
              strokeDasharray={item.dash ? "2 1" : undefined} />
            <text x={lx + 14} y={y0 + 8} fill="rgba(148,163,184,0.6)" fontSize="8">{item.label}</text>
          </g>
        );
      })}
      <line x1={PAD + items.length * 88} y1={y0 + 5} x2={PAD + items.length * 88 + 24} y2={y0 + 5}
        stroke="rgba(245,158,11,0.4)" strokeWidth="1.5" strokeDasharray="6 3" />
      <text x={PAD + items.length * 88 + 28} y={y0 + 8} fill="rgba(148,163,184,0.6)" fontSize="8">Work Triangle</text>
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
  constraintViolations = [],
}: EnhancedFloorPlanProps) {
  const violationMap = useMemo(() => {
    const m = new Map<string, "P1" | "P2" | "P3">();
    constraintViolations.forEach((v) => m.set(v.itemId, v.severity));
    return m;
  }, [constraintViolations]);

  const scale = zoomLevel / 100;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="h-full w-full"
      style={{ maxHeight: "100%", transform: `scale(${scale})`, transformOrigin: "center center" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectItem(null);
      }}
    >
      <GridPattern />

      {showFinishZones && <FinishZones />}

      <Walls walls={floorPlan.walls} />
      <Openings openings={floorPlan.openings} />

      {/* Cabinets */}
      {floorPlan.cabinets.map((cab) => (
        <CabinetRect
          key={cab.id}
          cab={cab}
          selected={selectedItemId === cab.id}
          violated={showConstraints ? violationMap.get(cab.id) : undefined}
          onClick={() => onSelectItem(cab.id)}
        />
      ))}

      {/* Appliances */}
      {floorPlan.appliances.map((app) => (
        <ApplianceRect
          key={app.id}
          app={app}
          selected={selectedItemId === app.id}
          onClick={() => onSelectItem(app.id)}
        />
      ))}

      {/* Fixtures */}
      {floorPlan.fixtures.map((fix) => (
        <FixtureRect
          key={fix.id}
          fix={fix}
          selected={selectedItemId === fix.id}
          onClick={() => onSelectItem(fix.id)}
        />
      ))}

      {/* Work Triangle */}
      <WorkTriangle />

      {/* Dimension lines */}
      {showDimensions && (
        <>
          <DimensionLines />
          <CabinetDimLabels cabinets={floorPlan.cabinets} />
        </>
      )}

      {/* Snap guides */}
      {showSnapGuides && selectedItemId && <SnapGuides selectedId={selectedItemId} />}

      <Legend />
    </svg>
  );
}
