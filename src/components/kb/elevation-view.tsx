"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  elevationWalls,
  elevationDimensions,
  getCrownProfile,
  type ElevationWall,
} from "@/data/kb/elevation-data";
import { floorPlan, type Cabinet } from "@/data/kb/floor-plan-data";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ElevationViewProps {
  selectedWall: string; // 'north' | 'east' | 'south' | 'west' | 'island'
  onWallChange: (wall: string) => void;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const WALL_TABS = [
  { key: "north", label: "North" },
  { key: "east", label: "East" },
  { key: "south", label: "South" },
  { key: "west", label: "West" },
  { key: "island", label: "Island" },
] as const;

// SVG scaling: 1 inch = 6px
const SCALE = 6;
const MARGIN_LEFT = 80;
const MARGIN_TOP = 40;
const MARGIN_RIGHT = 40;
const MARGIN_BOTTOM = 60;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getWallCabinets(wall: ElevationWall): Cabinet[] {
  return wall.cabinetIds
    .map((id) => floorPlan.cabinets.find((c) => c.id === id))
    .filter(Boolean) as Cabinet[];
}

function getBaseCabinets(cabs: Cabinet[]): Cabinet[] {
  return cabs.filter(
    (c) => c.type === "base" || c.type === "corner" || c.type === "island"
  );
}

function getWallCabs(cabs: Cabinet[]): Cabinet[] {
  return cabs.filter((c) => c.type === "wall");
}

function getTallCabs(cabs: Cabinet[]): Cabinet[] {
  return cabs.filter((c) => c.type === "tall");
}

function getAppliancesForWall(wallKey: string) {
  // Map wall key to appliance positions
  if (wallKey === "north") {
    return floorPlan.appliances.filter((a) => a.y === 0 && a.x < 168);
  }
  if (wallKey === "east") {
    return floorPlan.appliances.filter((a) => a.x === 168);
  }
  return [];
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function DoorFront({
  x,
  y,
  w,
  h,
  isDouble,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  isDouble: boolean;
}) {
  const inset = 3;
  const panelInset = 8;

  if (isDouble) {
    const halfW = (w - 3) / 2;
    return (
      <g>
        {/* Left door */}
        <rect
          x={x + inset}
          y={y + inset}
          width={halfW - inset}
          height={h - inset * 2}
          fill="none"
          stroke="rgba(148,163,184,0.4)"
          strokeWidth={0.5}
        />
        {/* Left panel (shaker profile) */}
        <rect
          x={x + panelInset}
          y={y + panelInset}
          width={halfW - panelInset - inset + 2}
          height={h - panelInset * 2}
          fill="none"
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={0.5}
        />
        {/* Left handle */}
        <line
          x1={x + halfW - 2}
          y1={y + h / 2 - 8}
          x2={x + halfW - 2}
          y2={y + h / 2 + 8}
          stroke="rgba(148,163,184,0.5)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {/* Right door */}
        <rect
          x={x + halfW + 3}
          y={y + inset}
          width={halfW - inset}
          height={h - inset * 2}
          fill="none"
          stroke="rgba(148,163,184,0.4)"
          strokeWidth={0.5}
        />
        {/* Right panel */}
        <rect
          x={x + halfW + panelInset - 3}
          y={y + panelInset}
          width={halfW - panelInset - inset + 2}
          height={h - panelInset * 2}
          fill="none"
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={0.5}
        />
        {/* Right handle */}
        <line
          x1={x + halfW + 5}
          y1={y + h / 2 - 8}
          x2={x + halfW + 5}
          y2={y + h / 2 + 8}
          stroke="rgba(148,163,184,0.5)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g>
      <rect
        x={x + inset}
        y={y + inset}
        width={w - inset * 2}
        height={h - inset * 2}
        fill="none"
        stroke="rgba(148,163,184,0.4)"
        strokeWidth={0.5}
      />
      {/* Panel */}
      <rect
        x={x + panelInset}
        y={y + panelInset}
        width={w - panelInset * 2}
        height={h - panelInset * 2}
        fill="none"
        stroke="rgba(148,163,184,0.25)"
        strokeWidth={0.5}
      />
      {/* Handle */}
      <line
        x1={x + w - 10}
        y1={y + h / 2 - 8}
        x2={x + w - 10}
        y2={y + h / 2 + 8}
        stroke="rgba(148,163,184,0.5)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function DrawerFronts({
  x,
  y,
  w,
  h,
  count,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
}) {
  const gap = 3;
  const inset = 3;
  const drawerH = (h - gap * (count + 1)) / count;

  return (
    <g>
      {Array.from({ length: count }).map((_, i) => {
        const dy = y + gap + i * (drawerH + gap);
        return (
          <g key={i}>
            <rect
              x={x + inset}
              y={dy}
              width={w - inset * 2}
              height={drawerH}
              fill="none"
              stroke="rgba(148,163,184,0.4)"
              strokeWidth={0.5}
            />
            {/* Drawer pull */}
            <line
              x1={x + w / 2 - 10}
              y1={dy + drawerH / 2}
              x2={x + w / 2 + 10}
              y2={dy + drawerH / 2}
              stroke="rgba(148,163,184,0.5)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Dimension Lines                                                     */
/* ------------------------------------------------------------------ */

function HorizontalDimension({
  x1,
  x2,
  y,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
}) {
  const mid = (x1 + x2) / 2;
  return (
    <g>
      <line
        x1={x1}
        y1={y}
        x2={x2}
        y2={y}
        stroke="rgba(99,102,241,0.5)"
        strokeWidth={0.5}
      />
      <line
        x1={x1}
        y1={y - 4}
        x2={x1}
        y2={y + 4}
        stroke="rgba(99,102,241,0.5)"
        strokeWidth={0.5}
      />
      <line
        x1={x2}
        y1={y - 4}
        x2={x2}
        y2={y + 4}
        stroke="rgba(99,102,241,0.5)"
        strokeWidth={0.5}
      />
      <text
        x={mid}
        y={y - 5}
        textAnchor="middle"
        fill="rgba(99,102,241,0.7)"
        fontSize={9}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

function VerticalDimension({
  x,
  y1,
  y2,
  label,
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
}) {
  const mid = (y1 + y2) / 2;
  return (
    <g>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke="rgba(99,102,241,0.5)"
        strokeWidth={0.5}
      />
      <line
        x1={x - 4}
        y1={y1}
        x2={x + 4}
        y2={y1}
        stroke="rgba(99,102,241,0.5)"
        strokeWidth={0.5}
      />
      <line
        x1={x - 4}
        y1={y2}
        x2={x + 4}
        y2={y2}
        stroke="rgba(99,102,241,0.5)"
        strokeWidth={0.5}
      />
      <text
        x={x - 8}
        y={mid + 3}
        textAnchor="end"
        fill="rgba(99,102,241,0.7)"
        fontSize={9}
        fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

export function ElevationView({
  selectedWall,
  onWallChange,
  selectedItemId,
  onSelectItem,
  className,
}: ElevationViewProps) {
  const wallData = useMemo(
    () =>
      elevationWalls.find(
        (w) => w.wallId === `elev-${selectedWall}`
      ) ?? elevationWalls[0],
    [selectedWall]
  );

  const allCabs = useMemo(() => getWallCabinets(wallData), [wallData]);
  const baseCabs = useMemo(() => getBaseCabinets(allCabs), [allCabs]);
  const wallCabs = useMemo(() => getWallCabs(allCabs), [allCabs]);
  const tallCabs = useMemo(() => getTallCabs(allCabs), [allCabs]);
  const appliances = useMemo(
    () => getAppliancesForWall(selectedWall),
    [selectedWall]
  );

  const dims = elevationDimensions;
  const crown = getCrownProfile(wallData.crownProfile);

  // Calculate total width used by base cabinets + appliances for layout
  const wallLength = wallData.length;
  const svgW = wallLength * SCALE + MARGIN_LEFT + MARGIN_RIGHT;
  const svgH = wallData.ceilingHeight * SCALE + MARGIN_TOP + MARGIN_BOTTOM;

  // Y coordinate helpers (SVG Y is inverted: 0 = top)
  const floorY = MARGIN_TOP + wallData.ceilingHeight * SCALE;
  const toeKickY = floorY - dims.toeKickHeight * SCALE;
  const counterY = floorY - dims.counterHeight * SCALE;
  const wallCabBottomY = floorY - dims.wallCabinetBottom * SCALE;
  const wallCabTopY = floorY - dims.wallCabinetTop30 * SCALE;
  const ceilingY = MARGIN_TOP;

  // Layout base cabinets sequentially
  const baseCabLayout = useMemo(() => {
    let currentX = MARGIN_LEFT;
    return baseCabs.map((cab) => {
      const x = currentX;
      const w = cab.width * SCALE;
      currentX += w;
      return { cab, x, w };
    });
  }, [baseCabs]);

  // Layout appliances in gaps (range at specific position)
  const applianceLayout = useMemo(() => {
    if (selectedWall === "east") {
      // East wall: cabinets, then range gap, then more cabinets
      // Range is between cab-09 (ends at 42+18=60") and cab-10 (starts at 90")
      const rangeApps = appliances.filter((a) => a.name.includes("Range"));
      const hoodApps = appliances.filter((a) => a.name.includes("Microwave"));
      const fridgeApps = appliances.filter((a) => a.name.includes("Refrigerator"));
      const items: {
        app: (typeof appliances)[0];
        x: number;
        w: number;
        type: string;
      }[] = [];

      // Range positioned after first two base cabs
      const rangeStart =
        baseCabLayout.length >= 2
          ? baseCabLayout[1].x + baseCabLayout[1].w
          : MARGIN_LEFT + 60 * SCALE;

      rangeApps.forEach((app) => {
        items.push({
          app,
          x: rangeStart,
          w: app.width * SCALE,
          type: "range",
        });
      });

      hoodApps.forEach((app) => {
        items.push({
          app,
          x: rangeStart,
          w: app.width * SCALE,
          type: "hood",
        });
      });

      return items;
    }

    if (selectedWall === "north") {
      // North wall: refrigerator at the end
      const fridgeApps = appliances.filter((a) => a.name.includes("Refrigerator"));
      const items: {
        app: (typeof appliances)[0];
        x: number;
        w: number;
        type: string;
      }[] = [];

      const lastBase = baseCabLayout[baseCabLayout.length - 1];
      const fridgeX = lastBase ? lastBase.x + lastBase.w : MARGIN_LEFT + 126 * SCALE;

      fridgeApps.forEach((app) => {
        items.push({
          app,
          x: fridgeX,
          w: app.width * SCALE,
          type: "fridge",
        });
      });

      return items;
    }

    return [];
  }, [appliances, baseCabLayout, selectedWall]);

  // Layout wall cabinets
  const wallCabLayout = useMemo(() => {
    let currentX = MARGIN_LEFT;
    return wallCabs.map((cab) => {
      const x = currentX;
      const w = cab.width * SCALE;
      currentX += w;
      return { cab, x, w };
    });
  }, [wallCabs]);

  // Layout tall cabinets (at the start or specific position)
  const tallCabLayout = useMemo(() => {
    return tallCabs.map((cab) => {
      // Tall cabs render at left edge typically
      return {
        cab,
        x: MARGIN_LEFT,
        w: cab.width * SCALE,
        h: cab.height * SCALE,
      };
    });
  }, [tallCabs]);

  const isEmpty = allCabs.length === 0 && appliances.length === 0;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-start pt-4",
        className
      )}
    >
      {/* Wall selector tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.04)] p-1">
        {WALL_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onWallChange(tab.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium transition-all",
              selectedWall === tab.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[rgba(148,163,184,0.7)] hover:text-[rgba(148,163,184,1)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center space-y-2">
            <p className="text-sm text-[rgba(148,163,184,0.5)]">
              No cabinets assigned to {wallData.name}
            </p>
            <p className="text-xs text-[rgba(148,163,184,0.3)]">
              Select another wall to view elevation
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto flex items-center justify-center px-4">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="max-w-full max-h-full"
            style={{ minWidth: 600, minHeight: 400 }}
          >
            {/* Background */}
            <rect
              x={0}
              y={0}
              width={svgW}
              height={svgH}
              fill="transparent"
            />

            {/* Ceiling line */}
            <line
              x1={MARGIN_LEFT - 10}
              y1={ceilingY}
              x2={MARGIN_LEFT + wallLength * SCALE + 10}
              y2={ceilingY}
              stroke="rgba(148,163,184,0.2)"
              strokeWidth={1}
              strokeDasharray="8,4"
            />
            <text
              x={MARGIN_LEFT - 14}
              y={ceilingY + 4}
              textAnchor="end"
              fill="rgba(148,163,184,0.3)"
              fontSize={8}
              fontFamily="monospace"
            >
              Ceiling
            </text>

            {/* Floor line */}
            <line
              x1={MARGIN_LEFT - 10}
              y1={floorY}
              x2={MARGIN_LEFT + wallLength * SCALE + 10}
              y2={floorY}
              stroke="rgba(148,163,184,0.4)"
              strokeWidth={1.5}
            />

            {/* Toe kick area */}
            <rect
              x={MARGIN_LEFT}
              y={toeKickY}
              width={
                baseCabLayout.length > 0
                  ? baseCabLayout[baseCabLayout.length - 1].x +
                    baseCabLayout[baseCabLayout.length - 1].w -
                    MARGIN_LEFT
                  : wallLength * SCALE
              }
              height={dims.toeKickHeight * SCALE}
              fill="rgba(30,30,40,0.8)"
              stroke="rgba(148,163,184,0.2)"
              strokeWidth={0.5}
            />

            {/* Countertop line */}
            {baseCabLayout.length > 0 && (
              <rect
                x={MARGIN_LEFT - 4}
                y={counterY}
                width={
                  baseCabLayout[baseCabLayout.length - 1].x +
                  baseCabLayout[baseCabLayout.length - 1].w -
                  MARGIN_LEFT +
                  8
                }
                height={dims.counterHeight * SCALE - dims.baseHeight * SCALE}
                fill="rgba(148,163,184,0.08)"
                stroke="rgba(148,163,184,0.35)"
                strokeWidth={1}
              />
            )}

            {/* Backsplash area (hatched) */}
            {baseCabLayout.length > 0 && (
              <>
                <defs>
                  <pattern
                    id="hatch"
                    patternUnits="userSpaceOnUse"
                    width={6}
                    height={6}
                  >
                    <path
                      d="M0,6 l6,-6 M-1.5,1.5 l3,-3 M4.5,7.5 l3,-3"
                      stroke="rgba(148,163,184,0.08)"
                      strokeWidth={0.5}
                    />
                  </pattern>
                </defs>
                <rect
                  x={MARGIN_LEFT}
                  y={wallCabBottomY}
                  width={
                    baseCabLayout[baseCabLayout.length - 1].x +
                    baseCabLayout[baseCabLayout.length - 1].w -
                    MARGIN_LEFT
                  }
                  height={(dims.wallCabinetBottom - dims.counterHeight) * SCALE}
                  fill="url(#hatch)"
                  stroke="rgba(148,163,184,0.15)"
                  strokeWidth={0.5}
                  strokeDasharray="4,4"
                />
              </>
            )}

            {/* ---- Base Cabinets ---- */}
            {baseCabLayout.map(({ cab, x, w }) => {
              const baseBoxY = toeKickY - (dims.baseHeight - dims.toeKickHeight) * SCALE;
              const baseBoxH = (dims.baseHeight - dims.toeKickHeight) * SCALE;
              const isSelected = selectedItemId === cab.id;
              const isDrawer =
                cab.subType === "drawer";
              const isDouble = cab.width >= 24 && cab.subType !== "drawer";

              return (
                <g
                  key={cab.id}
                  onClick={() => onSelectItem(isSelected ? null : cab.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Cabinet body */}
                  <rect
                    x={x}
                    y={baseBoxY}
                    width={w}
                    height={baseBoxH}
                    fill={
                      isSelected
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(148,163,184,0.04)"
                    }
                    stroke={
                      isSelected
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(148,163,184,0.3)"
                    }
                    strokeWidth={isSelected ? 1.5 : 0.75}
                    rx={1}
                  />

                  {/* Door/Drawer details */}
                  {isDrawer ? (
                    <DrawerFronts
                      x={x}
                      y={baseBoxY}
                      w={w}
                      h={baseBoxH}
                      count={cab.subType === "drawer" ? 4 : 3}
                    />
                  ) : (
                    <DoorFront
                      x={x}
                      y={baseBoxY}
                      w={w}
                      h={baseBoxH}
                      isDouble={isDouble}
                    />
                  )}

                  {/* Cabinet name below */}
                  <text
                    x={x + w / 2}
                    y={floorY + 14}
                    textAnchor="middle"
                    fill="rgba(148,163,184,0.5)"
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {cab.sku}
                  </text>
                </g>
              );
            })}

            {/* ---- Wall Cabinets ---- */}
            {wallCabLayout.map(({ cab, x, w }) => {
              const wcH = cab.height * SCALE;
              const wcY = wallCabBottomY - wcH + (dims.wallCabinetBottom - dims.counterHeight) * SCALE;
              // Position: wall cab bottom is at 54", top depends on height
              const actualWcY = floorY - dims.wallCabinetBottom * SCALE - cab.height * SCALE;
              const isSelected = selectedItemId === cab.id;
              const isDouble = cab.width >= 24;

              return (
                <g
                  key={cab.id}
                  onClick={() => onSelectItem(isSelected ? null : cab.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Cabinet body (dashed for wall cabs) */}
                  <rect
                    x={x}
                    y={actualWcY}
                    width={w}
                    height={wcH}
                    fill={
                      isSelected
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(148,163,184,0.03)"
                    }
                    stroke={
                      isSelected
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(148,163,184,0.3)"
                    }
                    strokeWidth={isSelected ? 1.5 : 0.75}
                    strokeDasharray={isSelected ? "none" : "6,3"}
                    rx={1}
                  />

                  {/* Door details */}
                  <DoorFront
                    x={x}
                    y={actualWcY}
                    w={w}
                    h={wcH}
                    isDouble={isDouble}
                  />

                  {/* Crown molding line at top */}
                  {crown && (
                    <line
                      x1={x - 2}
                      y1={actualWcY}
                      x2={x + w + 2}
                      y2={actualWcY}
                      stroke="rgba(148,163,184,0.4)"
                      strokeWidth={2}
                    />
                  )}

                  {/* Height dim on right side */}
                  <VerticalDimension
                    x={x + w + 8}
                    y1={actualWcY}
                    y2={actualWcY + wcH}
                    label={`${cab.height}"`}
                  />
                </g>
              );
            })}

            {/* ---- Tall Cabinets ---- */}
            {tallCabLayout.map(({ cab, x, w, h }) => {
              const tallY = floorY - cab.height * SCALE;
              const isSelected = selectedItemId === cab.id;

              return (
                <g
                  key={cab.id}
                  onClick={() => onSelectItem(isSelected ? null : cab.id)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={x}
                    y={tallY}
                    width={w}
                    height={h}
                    fill={
                      isSelected
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(148,163,184,0.04)"
                    }
                    stroke={
                      isSelected
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(148,163,184,0.3)"
                    }
                    strokeWidth={isSelected ? 1.5 : 0.75}
                    rx={1}
                  />

                  {/* Tall cab: top door + bottom door */}
                  <DoorFront x={x} y={tallY} w={w} h={h / 2} isDouble={false} />
                  <DoorFront
                    x={x}
                    y={tallY + h / 2}
                    w={w}
                    h={h / 2}
                    isDouble={false}
                  />

                  <text
                    x={x + w / 2}
                    y={floorY + 14}
                    textAnchor="middle"
                    fill="rgba(148,163,184,0.5)"
                    fontSize={8}
                    fontFamily="monospace"
                  >
                    {cab.sku}
                  </text>

                  <VerticalDimension
                    x={x + w + 8}
                    y1={tallY}
                    y2={floorY}
                    label={`${cab.height}"`}
                  />
                </g>
              );
            })}

            {/* ---- Appliances in Elevation ---- */}
            {applianceLayout.map(({ app, x, w, type }) => {
              if (type === "range") {
                const rangeY = toeKickY - (dims.baseHeight - dims.toeKickHeight) * SCALE;
                const rangeH = (dims.baseHeight - dims.toeKickHeight) * SCALE;
                return (
                  <g key={app.id}>
                    <rect
                      x={x}
                      y={rangeY}
                      width={w}
                      height={rangeH}
                      fill="rgba(148,163,184,0.06)"
                      stroke="rgba(251,191,36,0.4)"
                      strokeWidth={0.75}
                      rx={1}
                    />
                    {/* Oven door */}
                    <rect
                      x={x + 8}
                      y={rangeY + 10}
                      width={w - 16}
                      height={rangeH - 20}
                      fill="none"
                      stroke="rgba(251,191,36,0.3)"
                      strokeWidth={0.5}
                      rx={2}
                    />
                    {/* Oven window */}
                    <rect
                      x={x + 14}
                      y={rangeY + 16}
                      width={w - 28}
                      height={rangeH * 0.35}
                      fill="rgba(251,191,36,0.05)"
                      stroke="rgba(251,191,36,0.2)"
                      strokeWidth={0.5}
                      rx={1}
                    />
                    {/* Burner circles on top */}
                    {[0.25, 0.5, 0.75].map((frac, i) => (
                      <circle
                        key={i}
                        cx={x + w * frac}
                        cy={rangeY - 3}
                        r={4}
                        fill="none"
                        stroke="rgba(251,191,36,0.3)"
                        strokeWidth={0.5}
                      />
                    ))}
                    <text
                      x={x + w / 2}
                      y={floorY + 14}
                      textAnchor="middle"
                      fill="rgba(251,191,36,0.5)"
                      fontSize={8}
                      fontFamily="monospace"
                    >
                      Range
                    </text>
                  </g>
                );
              }

              if (type === "hood") {
                // Hood/microwave above range
                const hoodY = floorY - dims.wallCabinetBottom * SCALE - 18 * SCALE;
                const hoodH = 18 * SCALE;
                return (
                  <g key={app.id}>
                    <rect
                      x={x}
                      y={hoodY}
                      width={w}
                      height={hoodH}
                      fill="rgba(148,163,184,0.06)"
                      stroke="rgba(251,191,36,0.3)"
                      strokeWidth={0.75}
                      strokeDasharray="4,3"
                      rx={1}
                    />
                    <text
                      x={x + w / 2}
                      y={hoodY + hoodH / 2 + 3}
                      textAnchor="middle"
                      fill="rgba(251,191,36,0.4)"
                      fontSize={8}
                      fontFamily="monospace"
                    >
                      Hood/MW
                    </text>
                  </g>
                );
              }

              if (type === "fridge") {
                const fridgeH = 70 * SCALE;
                const fridgeY = floorY - fridgeH;
                return (
                  <g key={app.id}>
                    <rect
                      x={x}
                      y={fridgeY}
                      width={w}
                      height={fridgeH}
                      fill="rgba(148,163,184,0.06)"
                      stroke="rgba(251,191,36,0.4)"
                      strokeWidth={0.75}
                      rx={1}
                    />
                    {/* Fridge doors */}
                    <line
                      x1={x + w / 2}
                      y1={fridgeY + 6}
                      x2={x + w / 2}
                      y2={fridgeY + fridgeH * 0.6}
                      stroke="rgba(251,191,36,0.2)"
                      strokeWidth={0.5}
                    />
                    {/* Freezer line */}
                    <line
                      x1={x + 4}
                      y1={fridgeY + fridgeH * 0.65}
                      x2={x + w - 4}
                      y2={fridgeY + fridgeH * 0.65}
                      stroke="rgba(251,191,36,0.2)"
                      strokeWidth={0.5}
                    />
                    {/* Handle */}
                    <line
                      x1={x + w / 2 + 4}
                      y1={fridgeY + fridgeH * 0.25}
                      x2={x + w / 2 + 4}
                      y2={fridgeY + fridgeH * 0.45}
                      stroke="rgba(251,191,36,0.4)"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                    <text
                      x={x + w / 2}
                      y={floorY + 14}
                      textAnchor="middle"
                      fill="rgba(251,191,36,0.5)"
                      fontSize={8}
                      fontFamily="monospace"
                    >
                      Fridge
                    </text>
                  </g>
                );
              }

              return null;
            })}

            {/* ---- Vertical Dimension Lines (left side) ---- */}
            <VerticalDimension
              x={MARGIN_LEFT - 20}
              y1={toeKickY}
              y2={floorY}
              label={`${dims.toeKickHeight}"`}
            />
            <VerticalDimension
              x={MARGIN_LEFT - 20}
              y1={counterY}
              y2={toeKickY}
              label={`${dims.baseHeight - dims.toeKickHeight}"`}
            />
            {wallCabs.length > 0 && (
              <>
                <VerticalDimension
                  x={MARGIN_LEFT - 40}
                  y1={counterY}
                  y2={floorY}
                  label={`${dims.counterHeight}"`}
                />
                <VerticalDimension
                  x={MARGIN_LEFT - 20}
                  y1={floorY - dims.wallCabinetBottom * SCALE}
                  y2={counterY}
                  label={`${dims.wallCabinetBottom - dims.counterHeight}"`}
                />
                <VerticalDimension
                  x={MARGIN_LEFT - 20}
                  y1={floorY - dims.wallCabinetTop30 * SCALE}
                  y2={floorY - dims.wallCabinetBottom * SCALE}
                  label='30"'
                />
              </>
            )}

            {/* ---- Horizontal Running Dimensions ---- */}
            {baseCabLayout.map(({ cab, x, w }) => (
              <HorizontalDimension
                key={`hdim-${cab.id}`}
                x1={x}
                x2={x + w}
                y={MARGIN_TOP - 8}
                label={`${cab.width}"`}
              />
            ))}

            {/* Wall name label */}
            <text
              x={svgW / 2}
              y={svgH - 10}
              textAnchor="middle"
              fill="rgba(148,163,184,0.3)"
              fontSize={11}
              fontFamily="monospace"
              fontWeight="bold"
            >
              {wallData.name} — {(wallData.length / 12).toFixed(0)}&apos;-0&quot;
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
