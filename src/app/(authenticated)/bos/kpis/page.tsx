"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRole, type Role } from "@/lib/role-context";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Search,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  Download,
  FileText,
  Calculator,
  LayoutGrid,
  List,
  MessageSquare,
  Clock,
  User,
  History,
  Link2,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Theme colors                                                       */
/* ------------------------------------------------------------------ */

const COLORS = {
  indigo: "#6366f1",
  cyan: "#22d3ee",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type TimePeriod = "weekly" | "trailing_4_week" | "monthly" | "trailing_13_week" | "quarterly" | "annual";
type GoalDirection = "above" | "below" | "between";
type KPIStatus = "on_track" | "at_risk" | "off_track" | "no_data";
type ViewMode = "grid" | "list";

interface Measurable {
  id: string;
  name: string;
  owner: { name: string; avatar: string; initials: string };
  currentValue: number;
  goalValue: number;
  goalDirection: GoalDirection;
  unit: "$" | "%" | "#" | "days";
  weeklyValues: number[];
  trend: number;
  team: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  notes?: string[];
  relatedRocks?: string[];
  goalHistory?: { date: string; value: number }[];
  isFormula?: boolean;
  formula?: string;
}

interface ScorecardDef {
  id: string;
  name: string;
  team: string;
  kpiIds: string[];
}

interface FormulaToken {
  type: "kpi" | "operator" | "number";
  value: string;
  kpiId?: string;
}

/* ------------------------------------------------------------------ */
/*  Status calculation with color coding                               */
/* ------------------------------------------------------------------ */

function calculateStatus(kpi: Measurable): KPIStatus {
  const { currentValue, goalValue, goalDirection } = kpi;
  if (goalValue === 0) return "no_data";

  let percentOff: number;

  if (goalDirection === "above") {
    if (currentValue >= goalValue) return "on_track";
    percentOff = ((goalValue - currentValue) / goalValue) * 100;
  } else if (goalDirection === "below") {
    if (currentValue <= goalValue) return "on_track";
    percentOff = ((currentValue - goalValue) / goalValue) * 100;
  } else {
    return currentValue === goalValue ? "on_track" : "off_track";
  }

  if (percentOff <= 5) return "on_track";
  if (percentOff <= 15) return "at_risk";
  return "off_track";
}

function statusLabel(s: KPIStatus): string {
  switch (s) {
    case "on_track": return "On Track";
    case "at_risk": return "At Risk";
    case "off_track": return "Off Track";
    case "no_data": return "No Data";
  }
}

function statusClasses(s: KPIStatus): string {
  switch (s) {
    case "on_track": return "bg-green-500/15 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]";
    case "at_risk": return "bg-amber-500/15 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    case "off_track": return "bg-red-500/15 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]";
    case "no_data": return "bg-gray-500/15 text-muted-foreground";
  }
}

function statusColor(s: KPIStatus): string {
  switch (s) {
    case "on_track": return COLORS.green;
    case "at_risk": return COLORS.amber;
    case "off_track": return COLORS.red;
    case "no_data": return "#64748b";
  }
}

function statusDotClasses(s: KPIStatus): string {
  switch (s) {
    case "on_track": return "bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]";
    case "at_risk": return "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
    case "off_track": return "bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    case "no_data": return "bg-gray-400";
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const baseMeasurables: Measurable[] = [
  {
    id: "1",
    name: "Revenue",
    owner: { name: "Joseph Wells", avatar: "", initials: "JW" },
    currentValue: 284000,
    goalValue: 250000,
    goalDirection: "above",
    unit: "$",
    weeklyValues: [210, 218, 225, 230, 228, 240, 248, 255, 260, 268, 272, 278, 284],
    trend: 4.2,
    team: "Leadership",
    lastUpdatedBy: "Joseph Wells",
    lastUpdatedAt: "Mar 18, 2026 at 3:42 PM",
    notes: ["Strong Q1 performance driven by new contracts.", "Exceeded forecast by 13.6%."],
    relatedRocks: ["Q1 Revenue Target: $250K", "New Client Acquisition"],
    goalHistory: [
      { date: "Q4 2025", value: 220000 },
      { date: "Q1 2026", value: 250000 },
    ],
  },
  {
    id: "2",
    name: "Gross Margin %",
    owner: { name: "David Kim", avatar: "", initials: "DK" },
    currentValue: 38.2,
    goalValue: 35,
    goalDirection: "above",
    unit: "%",
    weeklyValues: [33, 34, 33.5, 35, 36, 35.8, 36.5, 37, 36.8, 37.5, 38, 37.8, 38.2],
    trend: 1.1,
    team: "Finance",
    lastUpdatedBy: "David Kim",
    lastUpdatedAt: "Mar 17, 2026 at 10:15 AM",
    notes: ["Margins improving due to vendor renegotiation."],
    relatedRocks: ["Margin Improvement Initiative"],
    goalHistory: [
      { date: "Q4 2025", value: 33 },
      { date: "Q1 2026", value: 35 },
    ],
  },
  {
    id: "3",
    name: "Backlog Value",
    owner: { name: "Mike Torres", avatar: "", initials: "MT" },
    currentValue: 1420000,
    goalValue: 1500000,
    goalDirection: "above",
    unit: "$",
    weeklyValues: [1100, 1150, 1180, 1200, 1250, 1280, 1300, 1320, 1350, 1380, 1400, 1410, 1420],
    trend: 0.7,
    team: "Operations",
    lastUpdatedBy: "Mike Torres",
    lastUpdatedAt: "Mar 18, 2026 at 9:30 AM",
    notes: ["Backlog growing but below target. Pipeline needs attention."],
    relatedRocks: ["Pipeline Growth Q1"],
    goalHistory: [
      { date: "Q4 2025", value: 1200000 },
      { date: "Q1 2026", value: 1500000 },
    ],
  },
  {
    id: "4",
    name: "AR Aging >60 Days",
    owner: { name: "David Kim", avatar: "", initials: "DK" },
    currentValue: 42000,
    goalValue: 50000,
    goalDirection: "below",
    unit: "$",
    weeklyValues: [85, 80, 78, 72, 68, 65, 60, 58, 55, 52, 48, 45, 42],
    trend: -6.7,
    team: "Finance",
    lastUpdatedBy: "David Kim",
    lastUpdatedAt: "Mar 17, 2026 at 10:20 AM",
    notes: ["Collections effort paying off. Down from $85K."],
    relatedRocks: [],
    goalHistory: [
      { date: "Q4 2025", value: 60000 },
      { date: "Q1 2026", value: 50000 },
    ],
  },
  {
    id: "5",
    name: "Active Projects",
    owner: { name: "Mike Torres", avatar: "", initials: "MT" },
    currentValue: 24,
    goalValue: 20,
    goalDirection: "above",
    unit: "#",
    weeklyValues: [18, 19, 18, 20, 21, 20, 22, 21, 23, 22, 23, 24, 24],
    trend: 0,
    team: "Operations",
    lastUpdatedBy: "Mike Torres",
    lastUpdatedAt: "Mar 18, 2026 at 9:35 AM",
    notes: [],
    relatedRocks: ["Operational Capacity Planning"],
    goalHistory: [
      { date: "Q4 2025", value: 18 },
      { date: "Q1 2026", value: 20 },
    ],
  },
  {
    id: "6",
    name: "Safety Incidents",
    owner: { name: "Sarah Chen", avatar: "", initials: "SC" },
    currentValue: 0,
    goalValue: 2,
    goalDirection: "below",
    unit: "#",
    weeklyValues: [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    trend: 0,
    team: "Operations",
    lastUpdatedBy: "Sarah Chen",
    lastUpdatedAt: "Mar 16, 2026 at 4:00 PM",
    notes: ["Zero incidents this week."],
    relatedRocks: [],
    goalHistory: [
      { date: "Q4 2025", value: 3 },
      { date: "Q1 2026", value: 2 },
    ],
  },
  {
    id: "7",
    name: "Client Satisfaction",
    owner: { name: "Lisa Park", avatar: "", initials: "LP" },
    currentValue: 4.6,
    goalValue: 4.5,
    goalDirection: "above",
    unit: "#",
    weeklyValues: [4.1, 4.2, 4.0, 4.3, 4.2, 4.4, 4.3, 4.5, 4.4, 4.5, 4.6, 4.5, 4.6],
    trend: 2.2,
    team: "Sales",
    lastUpdatedBy: "Lisa Park",
    lastUpdatedAt: "Mar 18, 2026 at 11:00 AM",
    notes: ["NPS surveys showing improvement."],
    relatedRocks: ["Customer Success Program"],
    goalHistory: [
      { date: "Q4 2025", value: 4.2 },
      { date: "Q1 2026", value: 4.5 },
    ],
  },
  {
    id: "8",
    name: "Lead Conversion Rate",
    owner: { name: "Joseph Wells", avatar: "", initials: "JW" },
    currentValue: 18.5,
    goalValue: 22,
    goalDirection: "above",
    unit: "%",
    weeklyValues: [15, 16, 14, 15.5, 16, 17, 16.5, 17, 17.5, 18, 17.8, 18.2, 18.5],
    trend: 1.6,
    team: "Sales",
    lastUpdatedBy: "Joseph Wells",
    lastUpdatedAt: "Mar 18, 2026 at 3:45 PM",
    notes: ["Conversion improving but still below target.", "Need to review qualification criteria."],
    relatedRocks: ["Sales Process Optimization"],
    goalHistory: [
      { date: "Q4 2025", value: 20 },
      { date: "Q1 2026", value: 22 },
    ],
  },
  {
    id: "9",
    name: "Avg Project Duration",
    owner: { name: "Mike Torres", avatar: "", initials: "MT" },
    currentValue: 34,
    goalValue: 30,
    goalDirection: "below",
    unit: "days",
    weeklyValues: [42, 40, 39, 38, 37, 36, 36, 35, 35, 34, 35, 34, 34],
    trend: -2.9,
    team: "Operations",
    lastUpdatedBy: "Mike Torres",
    lastUpdatedAt: "Mar 18, 2026 at 9:40 AM",
    notes: ["Getting closer to 30-day target."],
    relatedRocks: ["Project Efficiency"],
    goalHistory: [
      { date: "Q4 2025", value: 35 },
      { date: "Q1 2026", value: 30 },
    ],
  },
  {
    id: "10",
    name: "Employee Retention",
    owner: { name: "Sarah Chen", avatar: "", initials: "SC" },
    currentValue: 94,
    goalValue: 90,
    goalDirection: "above",
    unit: "%",
    weeklyValues: [91, 91, 92, 92, 92, 93, 93, 93, 93, 94, 94, 94, 94],
    trend: 0,
    team: "Leadership",
    lastUpdatedBy: "Sarah Chen",
    lastUpdatedAt: "Mar 15, 2026 at 2:00 PM",
    notes: ["Retention holding steady above goal."],
    relatedRocks: ["Culture & Engagement"],
    goalHistory: [
      { date: "Q4 2025", value: 88 },
      { date: "Q1 2026", value: 90 },
    ],
  },
];

const defaultScorecards: ScorecardDef[] = [
  { id: "sc-1", name: "Leadership Scorecard", team: "Leadership", kpiIds: ["1", "10"] },
  { id: "sc-2", name: "Sales Scorecard", team: "Sales", kpiIds: ["7", "8"] },
  { id: "sc-3", name: "Operations Scorecard", team: "Operations", kpiIds: ["3", "5", "6", "9"] },
  { id: "sc-4", name: "Finance Scorecard", team: "Finance", kpiIds: ["2", "4"] },
];

const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];
const teams = ["All Teams", "Leadership", "Operations", "Sales", "Finance"];

const timePeriods: { key: TimePeriod; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "trailing_4_week", label: "Trailing 4-Week" },
  { key: "monthly", label: "Monthly" },
  { key: "trailing_13_week", label: "Trailing 13-Week" },
  { key: "quarterly", label: "Quarterly" },
  { key: "annual", label: "Annual" },
];

/* ------------------------------------------------------------------ */
/*  Helper: generate period-adjusted data                              */
/* ------------------------------------------------------------------ */

function getDataForPeriod(weeklyValues: number[], period: TimePeriod): number[] {
  switch (period) {
    case "weekly":
      return weeklyValues;
    case "trailing_4_week":
      // Aggregate into 4-week trailing averages
      return weeklyValues.filter((_, i) => i % 4 === 3 || i === weeklyValues.length - 1);
    case "monthly": {
      // ~4 weeks per month, pick every 4th
      const monthly: number[] = [];
      for (let i = 3; i < weeklyValues.length; i += 4) monthly.push(weeklyValues[i]);
      if (monthly.length === 0) monthly.push(weeklyValues[weeklyValues.length - 1]);
      return monthly;
    }
    case "trailing_13_week":
      return weeklyValues; // full 13 weeks
    case "quarterly":
      // Summarize into quarterly (just last value per ~13-week block)
      return [weeklyValues[0], weeklyValues[Math.floor(weeklyValues.length / 2)], weeklyValues[weeklyValues.length - 1]];
    case "annual":
      return [weeklyValues[0], weeklyValues[weeklyValues.length - 1]];
    default:
      return weeklyValues;
  }
}

function periodColumnLabel(period: TimePeriod): string {
  switch (period) {
    case "weekly": return "Wk";
    case "trailing_4_week": return "4-Wk";
    case "monthly": return "Mo";
    case "trailing_13_week": return "Wk";
    case "quarterly": return "Qtr";
    case "annual": return "Yr";
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatValue(value: number, unit: string): string {
  if (unit === "$") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  }
  if (unit === "%") return `${value}%`;
  if (unit === "days") return `${value}d`;
  return value.toLocaleString();
}

function quarterMultiplier(q: string): number {
  const idx = quarters.indexOf(q);
  if (idx <= 0) return 1;
  return 1 + idx * 0.08; // simulates slight growth each quarter
}

/* ------------------------------------------------------------------ */
/*  Helper: derive current value & trend from period data              */
/* ------------------------------------------------------------------ */

function derivePeriodMetrics(
  weeklyValues: number[],
  period: TimePeriod
): { periodValue: number; periodTrend: number } {
  const data = getDataForPeriod(weeklyValues, period);
  if (data.length === 0) return { periodValue: 0, periodTrend: 0 };

  const periodValue = data[data.length - 1];

  // Trend: compare last value to previous value in the period set
  let periodTrend = 0;
  if (data.length >= 2) {
    const prev = data[data.length - 2];
    if (prev !== 0) {
      periodTrend = Math.round(((periodValue - prev) / prev) * 1000) / 10;
    }
  }
  return { periodValue, periodTrend };
}

/* ------------------------------------------------------------------ */
/*  Helper: role-specific data seed (deterministic variation)          */
/* ------------------------------------------------------------------ */

const roleSeedMap: Record<Role, number[]> = {
  owner:      [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00],
  admin:      [0.97, 1.03, 0.95, 1.08, 0.92, 1.05, 1.02, 0.88, 1.04, 0.98],
  manager:    [1.05, 0.96, 1.08, 0.90, 1.12, 0.94, 0.98, 1.06, 0.93, 1.01],
  designer:   [0.92, 1.05, 0.88, 1.12, 0.85, 1.10, 1.04, 0.95, 1.08, 0.96],
  bookkeeper: [1.03, 0.98, 1.02, 0.95, 1.08, 0.97, 0.94, 1.10, 0.96, 1.03],
  viewer:     [0.98, 1.01, 0.97, 1.04, 0.96, 1.02, 1.00, 0.97, 1.01, 0.99],
};

function applyRoleVariation(kpis: Measurable[], role: Role): Measurable[] {
  if (role === "owner") return kpis;
  const seeds = roleSeedMap[role];
  return kpis.map((kpi, idx) => {
    const seed = seeds[idx % seeds.length];
    return {
      ...kpi,
      currentValue: Math.round(kpi.currentValue * seed * 100) / 100,
      weeklyValues: kpi.weeklyValues.map((v) => Math.round(v * seed * 100) / 100),
      trend: Math.round(kpi.trend * seed * 10) / 10,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Sparkline component                                                */
/* ------------------------------------------------------------------ */

function Sparkline({ data, status }: { data: number[]; status: KPIStatus }) {
  const chartData = data.map((v, i) => ({ w: i, v }));
  const color = statusColor(status);
  return (
    <ResponsiveContainer width={120} height={40}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Dropdown component (reusable)                                      */
/* ------------------------------------------------------------------ */

function Dropdown({
  label,
  options,
  value,
  onChange,
  open,
  setOpen,
  closeOthers,
  width = "w-40",
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  closeOthers: () => void;
  width?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          closeOthers();
          setOpen(!open);
        }}
        className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/60"
      >
        {value}
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className={`glass-strong absolute right-0 top-full z-20 mt-1 ${width} rounded-lg p-1 shadow-xl`}>
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
                value === o
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast component                                                    */
/* ------------------------------------------------------------------ */

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div className="glass-strong rounded-lg px-4 py-3 shadow-xl flex items-center gap-2">
        <CheckCircle2 className="size-4 text-green-400" />
        <span className="text-sm text-foreground">{message}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI Detail Drill-Down Modal                                        */
/* ------------------------------------------------------------------ */

function KPIDetailModal({
  kpi,
  status,
  onClose,
}: {
  kpi: Measurable;
  status: KPIStatus;
  onClose: () => void;
}) {
  const chartData = kpi.weeklyValues.map((v, i) => ({ week: `W${i + 1}`, value: v }));
  const color = statusColor(status);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong relative mx-4 w-full max-w-3xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
            {kpi.owner.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{kpi.name}</h2>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(status)}`}>
                {statusLabel(status)}
              </span>
              {kpi.isFormula && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                  <Calculator className="size-3" /> Formula
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Owner: {kpi.owner.name} | Goal: {formatValue(kpi.goalValue, kpi.unit)} ({kpi.goalDirection === "above" ? "higher is better" : kpi.goalDirection === "below" ? "lower is better" : "target"})
            </p>
          </div>
        </div>

        {/* Large Trend Chart */}
        <div className="mb-6 rounded-xl bg-muted/50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">13-Week Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" stroke="currentColor" />
              <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--foreground)",
                }}
              />
              <ReferenceLine y={kpi.goalValue >= 1000 ? kpi.goalValue / 1000 : kpi.goalValue} stroke={COLORS.amber} strokeDasharray="4 4" label={{ value: "Goal", fill: COLORS.amber, fontSize: 10 }} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#colorGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Details grid */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          {/* Current & Goal */}
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current vs Goal</h4>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatValue(kpi.currentValue, kpi.unit)}</p>
            <p className="text-sm text-muted-foreground">Goal: {formatValue(kpi.goalValue, kpi.unit)}</p>
            <div className="mt-2 flex items-center gap-1">
              {kpi.goalDirection === "above" ? (
                <ArrowUp className="size-3.5 text-green-400" />
              ) : (
                <ArrowDown className="size-3.5 text-green-400" />
              )}
              <span className="text-xs text-muted-foreground">
                {kpi.goalDirection === "above" ? "Higher is better" : "Lower is better"}
              </span>
            </div>
          </div>

          {/* Owner & Last Updated */}
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="size-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner Details</h4>
            </div>
            <p className="text-sm font-medium text-foreground">{kpi.owner.name}</p>
            {kpi.lastUpdatedBy && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>Updated by {kpi.lastUpdatedBy}</span>
              </div>
            )}
            {kpi.lastUpdatedAt && (
              <p className="mt-0.5 text-xs text-muted-foreground/70 pl-[18px]">{kpi.lastUpdatedAt}</p>
            )}
          </div>
        </div>

        {/* Goal History */}
        {kpi.goalHistory && kpi.goalHistory.length > 0 && (
          <div className="mb-4 rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="size-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goal History</h4>
            </div>
            <div className="space-y-1.5">
              {kpi.goalHistory.map((gh, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{gh.date}</span>
                  <span className="font-medium text-foreground">{formatValue(gh.value, kpi.unit)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Rocks */}
        {kpi.relatedRocks && kpi.relatedRocks.length > 0 && (
          <div className="mb-4 rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="size-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Rocks / Goals</h4>
            </div>
            <div className="space-y-1.5">
              {kpi.relatedRocks.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  {r}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {kpi.notes && kpi.notes.length > 0 && (
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="size-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes &amp; Comments</h4>
            </div>
            <div className="space-y-2">
              {kpi.notes.map((n, i) => (
                <div key={i} className="rounded-lg bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Formula Builder Modal                                              */
/* ------------------------------------------------------------------ */

function FormulaBuilderModal({
  kpis,
  onClose,
  onSave,
}: {
  kpis: Measurable[];
  onClose: () => void;
  onSave: (m: Measurable) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"$" | "%" | "#" | "days">("%");
  const [goalValue, setGoalValue] = useState("");
  const [goalDirection, setGoalDirection] = useState<GoalDirection>("above");
  const [tokens, setTokens] = useState<FormulaToken[]>([]);
  const [kpiDropdownOpen, setKpiDropdownOpen] = useState(false);

  const operators = ["+", "-", "*", "/", "(", ")"];

  function addKpi(kpi: Measurable) {
    setTokens([...tokens, { type: "kpi", value: kpi.name, kpiId: kpi.id }]);
    setKpiDropdownOpen(false);
  }

  function addOperator(op: string) {
    setTokens([...tokens, { type: "operator", value: op }]);
  }

  function addNumber(num: string) {
    if (num && !isNaN(Number(num))) {
      setTokens([...tokens, { type: "number", value: num }]);
    }
  }

  function removeLastToken() {
    setTokens(tokens.slice(0, -1));
  }

  function evaluateFormula(): number | null {
    try {
      let expression = "";
      for (const token of tokens) {
        if (token.type === "kpi") {
          const found = kpis.find((k) => k.id === token.kpiId);
          if (!found) return null;
          expression += found.currentValue;
        } else {
          expression += token.value;
        }
      }
      if (!expression) return null;
      // Safe eval for simple math
      const result = Function(`"use strict"; return (${expression})`)();
      return typeof result === "number" && isFinite(result) ? Math.round(result * 100) / 100 : null;
    } catch {
      return null;
    }
  }

  const preview = evaluateFormula();
  const formulaStr = tokens.map((t) => t.value).join(" ");

  function handleSave() {
    if (!name || tokens.length === 0 || preview === null) return;
    const newMeasurable: Measurable = {
      id: `formula-${Date.now()}`,
      name,
      owner: { name: "Joseph Wells", avatar: "", initials: "JW" },
      currentValue: preview,
      goalValue: goalValue ? Number(goalValue) : preview,
      goalDirection,
      unit,
      weeklyValues: Array(13).fill(preview).map((v, i) => Math.round((v as number) * (0.9 + i * 0.015) * 100) / 100),
      trend: 0,
      team: "Leadership",
      isFormula: true,
      formula: formulaStr,
      lastUpdatedBy: "Joseph Wells",
      lastUpdatedAt: "Just now",
      notes: [`Calculated: ${formulaStr}`],
      relatedRocks: [],
      goalHistory: [],
    };
    onSave(newMeasurable);
  }

  const [numInput, setNumInput] = useState("");

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="glass-strong relative mx-4 w-full max-w-lg rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50">
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Calculator className="size-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-foreground">Add Calculated Metric</h2>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Metric Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Gross Margin %"
            className="w-full rounded-lg glass px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Unit + Goal */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as typeof unit)}
              className="w-full rounded-lg glass px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="$">$</option>
              <option value="%">%</option>
              <option value="#">#</option>
              <option value="days">days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Goal Value</label>
            <input
              type="number"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg glass px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Direction</label>
            <select
              value={goalDirection}
              onChange={(e) => setGoalDirection(e.target.value as GoalDirection)}
              className="w-full rounded-lg glass px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="above">Higher is better</option>
              <option value="below">Lower is better</option>
            </select>
          </div>
        </div>

        {/* Formula Display */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Formula</label>
          <div className="min-h-[48px] rounded-lg glass px-3 py-2 flex flex-wrap items-center gap-1.5">
            {tokens.length === 0 && (
              <span className="text-xs text-muted-foreground/50">Build formula using controls below...</span>
            )}
            {tokens.map((t, i) => (
              <span
                key={i}
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                  t.type === "kpi"
                    ? "bg-indigo-500/20 text-indigo-300"
                    : t.type === "operator"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-cyan-500/20 text-cyan-300"
                }`}
              >
                {t.value}
              </span>
            ))}
            {tokens.length > 0 && (
              <button
                onClick={removeLastToken}
                className="ml-1 rounded p-0.5 text-muted-foreground hover:text-red-400 transition-colors"
                title="Remove last"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 space-y-3">
          {/* KPI selector */}
          <div className="relative">
            <button
              onClick={() => setKpiDropdownOpen(!kpiDropdownOpen)}
              className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/60 w-full justify-between"
            >
              <span>Select KPI...</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            {kpiDropdownOpen && (
              <div className="glass-strong absolute left-0 top-full z-30 mt-1 w-full max-h-40 overflow-y-auto rounded-lg p-1 shadow-xl">
                {kpis
                  .filter((k) => !k.isFormula)
                  .map((k) => (
                    <button
                      key={k.id}
                      onClick={() => addKpi(k)}
                      className="block w-full rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      {k.name} ({formatValue(k.currentValue, k.unit)})
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Operators */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Operators:</span>
            {operators.map((op) => (
              <button
                key={op}
                onClick={() => addOperator(op)}
                className="glass rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-amber-300 transition-all hover:bg-muted/60"
              >
                {op}
              </button>
            ))}
          </div>

          {/* Number input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Number:</span>
            <input
              type="number"
              value={numInput}
              onChange={(e) => setNumInput(e.target.value)}
              placeholder="100"
              className="w-24 rounded-lg glass px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => {
                addNumber(numInput);
                setNumInput("");
              }}
              className="glass rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-muted/60"
            >
              Add
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6 rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-xs text-muted-foreground">Preview Result: </span>
          <span className="text-sm font-bold text-foreground">
            {preview !== null ? formatValue(preview, unit) : "---"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || tokens.length === 0 || preview === null}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Metric
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Create Scorecard Modal                                             */
/* ------------------------------------------------------------------ */

function CreateScorecardModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (sc: ScorecardDef) => void;
}) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("Leadership");

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSave() {
    if (!name) return;
    onSave({
      id: `sc-${Date.now()}`,
      name,
      team,
      kpiIds: [],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-strong relative mx-4 w-full max-w-sm rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50">
          <X className="size-5" />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-6">Create Scorecard</h2>

        <div className="mb-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Scorecard Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Marketing Scorecard"
            className="w-full rounded-lg glass px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Team</label>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full rounded-lg glass px-3 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {teams.filter((t) => t !== "All Teams").map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Scorecard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function KPIsPage() {
  const { role } = useRole();
  const [quarter, setQuarter] = useState("Q1 2026");
  const [team, setTeam] = useState("All Teams");
  const [search, setSearch] = useState("");
  const [quarterOpen, setQuarterOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [scorecardDropdownOpen, setScorecardDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // KPI data (mutable for inline editing + formula additions)
  const [allKpis, setAllKpis] = useState<Measurable[]>(baseMeasurables);

  // Scorecards
  const [scorecards, setScorecards] = useState<ScorecardDef[]>(defaultScorecards);
  const [activeScorecard, setActiveScorecard] = useState<string>("all");

  // Modals
  const [detailKpi, setDetailKpi] = useState<Measurable | null>(null);
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);
  const [showCreateScorecard, setShowCreateScorecard] = useState(false);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });

  function showToast(message: string) {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  }

  // Apply role-based variation
  const roleAdjusted = useMemo(() => applyRoleVariation(allKpis, role), [allKpis, role]);

  // Apply quarter multiplier to simulate data per quarter
  const quarterAdjusted = useMemo(() => roleAdjusted.map((kpi) => {
    const mult = quarterMultiplier(quarter);
    if (quarter === "Q1 2026") return kpi; // base data
    return {
      ...kpi,
      currentValue: Math.round(kpi.currentValue * mult * 100) / 100,
      weeklyValues: kpi.weeklyValues.map((v) => Math.round(v * mult * 100) / 100),
    };
  }), [roleAdjusted, quarter]);

  // Apply period-specific currentValue and trend derivation
  const adjustedKpis = useMemo(() => quarterAdjusted.map((kpi) => {
    if (timePeriod === "weekly") {
      // Weekly uses the raw current value (last entry)
      return kpi;
    }
    const { periodValue, periodTrend } = derivePeriodMetrics(kpi.weeklyValues, timePeriod);
    // Scale periodValue to match the unit's magnitude
    const scale = kpi.currentValue !== 0 && kpi.weeklyValues[kpi.weeklyValues.length - 1] !== 0
      ? kpi.currentValue / kpi.weeklyValues[kpi.weeklyValues.length - 1]
      : 1;
    return {
      ...kpi,
      currentValue: Math.round(periodValue * scale * 100) / 100,
      trend: periodTrend,
    };
  }), [quarterAdjusted, timePeriod]);

  // Filter by team (respecting scorecard selection)
  const filteredByScorecard = activeScorecard === "all"
    ? adjustedKpis
    : adjustedKpis.filter((kpi) => {
        const sc = scorecards.find((s) => s.id === activeScorecard);
        if (!sc) return true;
        return sc.kpiIds.includes(kpi.id) || kpi.team === sc.team;
      });

  // Filter by team dropdown
  const filteredByTeam = team === "All Teams"
    ? filteredByScorecard
    : filteredByScorecard.filter((kpi) => kpi.team === team);

  // Filter by search
  const filtered = filteredByTeam.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // Status counts from filtered set
  const statusCounts = filtered.reduce(
    (acc, kpi) => {
      const s = calculateStatus(kpi);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<KPIStatus, number>
  );

  const onTrack = statusCounts.on_track || 0;
  const atRisk = statusCounts.at_risk || 0;
  const offTrack = statusCounts.off_track || 0;
  const noData = statusCounts.no_data || 0;

  // Close all dropdowns helper
  function closeAllDropdowns() {
    setQuarterOpen(false);
    setTeamOpen(false);
    setScorecardDropdownOpen(false);
    setExportDropdownOpen(false);
  }

  // Inline edit handlers
  function startEdit(kpiId: string, currentVal: number) {
    setEditingId(kpiId);
    setEditValue(String(currentVal));
  }

  function saveEdit(kpiId: string) {
    const newVal = parseFloat(editValue);
    if (isNaN(newVal)) {
      setEditingId(null);
      return;
    }
    setAllKpis((prev) =>
      prev.map((kpi) =>
        kpi.id === kpiId
          ? {
              ...kpi,
              currentValue: newVal,
              weeklyValues: [...kpi.weeklyValues.slice(1), newVal],
              lastUpdatedBy: "Joseph Wells",
              lastUpdatedAt: "Just now",
            }
          : kpi
      )
    );
    setEditingId(null);
    setFlashId(kpiId);
    setTimeout(() => setFlashId(null), 800);
    showToast(`Updated ${allKpis.find((k) => k.id === kpiId)?.name || "KPI"}`);
  }

  // Export handlers
  function handleExportCSV() {
    const header = "Name,Owner,Current Value,Goal,Status,Trend\n";
    const rows = filtered
      .map((kpi) => {
        const s = calculateStatus(kpi);
        return `"${kpi.name}","${kpi.owner.name}","${formatValue(kpi.currentValue, kpi.unit)}","${formatValue(kpi.goalValue, kpi.unit)}","${statusLabel(s)}","${kpi.trend}%"`;
      })
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpi-scorecard-${quarter.replace(/\s/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false);
    showToast("CSV exported successfully");
  }

  function handleExportPDF() {
    // In a real app, this would generate a PDF. For mockup, trigger download of text representation.
    const content = filtered
      .map((kpi) => {
        const s = calculateStatus(kpi);
        return `${kpi.name} | ${kpi.owner.name} | ${formatValue(kpi.currentValue, kpi.unit)} | Goal: ${formatValue(kpi.goalValue, kpi.unit)} | ${statusLabel(s)}`;
      })
      .join("\n");
    const blob = new Blob([`KPI Scorecard - ${quarter}\n${"=".repeat(50)}\n\n${content}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpi-scorecard-${quarter.replace(/\s/g, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDropdownOpen(false);
    showToast("PDF exported successfully");
  }

  // Formula builder save
  function handleFormulaSave(m: Measurable) {
    setAllKpis((prev) => [...prev, m]);
    setShowFormulaBuilder(false);
    showToast(`Created calculated metric: ${m.name}`);
  }

  // Create scorecard
  function handleCreateScorecard(sc: ScorecardDef) {
    setScorecards((prev) => [...prev, sc]);
    setShowCreateScorecard(false);
    setActiveScorecard(sc.id);
    showToast(`Created scorecard: ${sc.name}`);
  }

  // Export dropdown ref for click-outside
  const exportRef = useRef<HTMLDivElement>(null);
  const scorecardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportDropdownOpen(false);
      if (scorecardRef.current && !scorecardRef.current.contains(e.target as Node)) setScorecardDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            KPI Scorecard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {timePeriods.find((t) => t.key === timePeriod)?.label} measurables across the organization
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Scorecard selector */}
          <div className="relative" ref={scorecardRef}>
            <button
              onClick={() => {
                setQuarterOpen(false);
                setTeamOpen(false);
                setExportDropdownOpen(false);
                setScorecardDropdownOpen(!scorecardDropdownOpen);
              }}
              className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/60"
            >
              <FileText className="size-3.5 text-indigo-400" />
              {activeScorecard === "all"
                ? "All Scorecards"
                : scorecards.find((s) => s.id === activeScorecard)?.name || "Scorecard"}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            {scorecardDropdownOpen && (
              <div className="glass-strong absolute right-0 top-full z-20 mt-1 w-56 rounded-lg p-1 shadow-xl">
                <button
                  onClick={() => {
                    setActiveScorecard("all");
                    setScorecardDropdownOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
                    activeScorecard === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  All Scorecards
                </button>
                <div className="my-1 h-px bg-border" />
                {scorecards.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => {
                      setActiveScorecard(sc.id);
                      setScorecardDropdownOpen(false);
                    }}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
                      activeScorecard === sc.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{sc.name}</span>
                    <span className="ml-1 text-muted-foreground/60">({sc.team})</span>
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button
                  onClick={() => {
                    setScorecardDropdownOpen(false);
                    setShowCreateScorecard(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-indigo-400 transition-all hover:bg-muted/50"
                >
                  <Plus className="size-3" />
                  Create Scorecard
                </button>
              </div>
            )}
          </div>

          {/* Quarter selector */}
          <Dropdown
            options={quarters}
            value={quarter}
            onChange={setQuarter}
            open={quarterOpen}
            setOpen={setQuarterOpen}
            closeOthers={() => {
              setTeamOpen(false);
              setScorecardDropdownOpen(false);
              setExportDropdownOpen(false);
            }}
            width="w-36"
          />

          {/* Team filter */}
          <Dropdown
            options={teams}
            value={team}
            onChange={setTeam}
            open={teamOpen}
            setOpen={setTeamOpen}
            closeOthers={() => {
              setQuarterOpen(false);
              setScorecardDropdownOpen(false);
              setExportDropdownOpen(false);
            }}
            width="w-40"
          />

          {/* Search */}
          <div className="glass flex items-center gap-2 rounded-lg px-3 py-2">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search KPIs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-32 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Time Period Selector + View + Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Time period toggle */}
        <div className="glass flex items-center rounded-lg p-1">
          {timePeriods.map((tp) => (
            <button
              key={tp.key}
              onClick={() => setTimePeriod(tp.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                timePeriod === tp.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tp.label}
            </button>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="glass flex items-center rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List view"
            >
              <List className="size-3.5" />
            </button>
          </div>

          {/* Add Calculated Metric */}
          <button
            onClick={() => setShowFormulaBuilder(true)}
            className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-indigo-400 transition-all hover:bg-muted/60"
          >
            <Calculator className="size-3.5" />
            Add Calculated Metric
          </button>

          {/* Export */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => {
                const wasOpen = exportDropdownOpen;
                closeAllDropdowns();
                setExportDropdownOpen(!wasOpen);
              }}
              className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-muted/60"
            >
              <Download className="size-3.5" />
              Export
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            {exportDropdownOpen && (
              <div className="glass-strong absolute right-0 top-full z-20 mt-1 w-36 rounded-lg p-1 shadow-xl">
                <button
                  onClick={handleExportCSV}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <FileText className="size-3" />
                  CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <FileText className="size-3" />
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary stats bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{filtered.length}</span>
            <span className="text-xs text-muted-foreground">Total Measurables</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${statusDotClasses("on_track")}`} />
            <span className="text-sm font-medium text-green-400">{onTrack}</span>
            <span className="text-xs text-muted-foreground">On Track</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${statusDotClasses("at_risk")}`} />
            <span className="text-sm font-medium text-amber-400">{atRisk}</span>
            <span className="text-xs text-muted-foreground">At Risk</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${statusDotClasses("off_track")}`} />
            <span className="text-sm font-medium text-red-400">{offTrack}</span>
            <span className="text-xs text-muted-foreground">Off Track</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${statusDotClasses("no_data")}`} />
            <span className="text-sm font-medium text-muted-foreground">{noData}</span>
            <span className="text-xs text-muted-foreground">No Data</span>
          </div>
          <div className="ml-auto text-xs text-muted-foreground/60">
            {timePeriods.find((t) => t.key === timePeriod)?.label} view
          </div>
        </div>
      </div>

      {/* KPI Cards - Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((kpi) => {
            const status = calculateStatus(kpi);
            const periodData = getDataForPeriod(kpi.weeklyValues, timePeriod);
            return (
              <div
                key={kpi.id}
                className={`glass rounded-xl p-5 transition-all duration-300 glass-hover cursor-pointer ${
                  flashId === kpi.id ? "ring-2 ring-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : ""
                }`}
                onClick={() => {
                  if (editingId !== kpi.id) setDetailKpi(kpi);
                }}
              >
                {/* Header: name + status badge */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-foreground">{kpi.name}</h3>
                    {kpi.isFormula && <span title="Calculated metric"><Calculator className="size-3 text-indigo-400" /></span>}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(status)}`}
                  >
                    {statusLabel(status)}
                  </span>
                </div>

                {/* Owner */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-semibold text-indigo-300">
                    {kpi.owner.initials}
                  </div>
                  <span className="text-xs text-muted-foreground">{kpi.owner.name}</span>
                </div>

                {/* Current value (inline editable) */}
                <div className="mb-1 flex items-end justify-between">
                  {editingId === kpi.id ? (
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(kpi.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(kpi.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="w-28 rounded-md bg-foreground/10 px-2 py-1 text-xl font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p
                      className="text-2xl font-bold tracking-tight text-foreground cursor-text hover:bg-muted/40 rounded px-1 -mx-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(kpi.id, kpi.currentValue);
                      }}
                      title={
                        kpi.lastUpdatedBy
                          ? `Last updated by ${kpi.lastUpdatedBy}${kpi.lastUpdatedAt ? ` at ${kpi.lastUpdatedAt}` : ""}`
                          : "Click to edit"
                      }
                    >
                      {formatValue(kpi.currentValue, kpi.unit)}
                    </p>
                  )}
                  <div className="flex items-center gap-1">
                    {kpi.trend > 0 ? (
                      <TrendingUp className="size-3.5 text-green-400" />
                    ) : kpi.trend < 0 ? (
                      <TrendingDown className="size-3.5 text-red-400" />
                    ) : (
                      <span className="size-3.5 text-center text-xs text-muted-foreground">--</span>
                    )}
                    <span
                      className={`text-xs font-medium ${
                        kpi.trend > 0 ? "text-green-400" : kpi.trend < 0 ? "text-red-400" : "text-muted-foreground"
                      }`}
                    >
                      {kpi.trend !== 0 ? `${kpi.trend > 0 ? "+" : ""}${kpi.trend}%` : "0%"}
                    </span>
                  </div>
                </div>

                {/* Goal line with direction indicator */}
                <div className="mb-3 flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    Goal: {formatValue(kpi.goalValue, kpi.unit)}
                  </p>
                  {kpi.goalDirection === "above" ? (
                    <span title="Higher is better"><ArrowUp className="size-3 text-green-400/70" /></span>
                  ) : kpi.goalDirection === "below" ? (
                    <span title="Lower is better"><ArrowDown className="size-3 text-green-400/70" /></span>
                  ) : null}
                </div>

                {/* Sparkline */}
                <div className="flex justify-center">
                  <Sparkline data={periodData} status={status} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KPI Table - List View */}
      {viewMode === "list" && (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Measurable</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Goal</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dir</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
                {/* Period columns */}
                {(() => {
                  const sampleData = getDataForPeriod(filtered[0]?.weeklyValues || [], timePeriod);
                  return sampleData.slice(-6).map((_, i) => (
                    <th key={i} className="px-2 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {periodColumnLabel(timePeriod)}{sampleData.length - 6 + i + 1}
                    </th>
                  ));
                })()}
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kpi) => {
                const status = calculateStatus(kpi);
                const periodData = getDataForPeriod(kpi.weeklyValues, timePeriod);
                const displayCols = periodData.slice(-6);
                return (
                  <tr
                    key={kpi.id}
                    className={`border-b border-border/50 transition-all hover:bg-muted/30 cursor-pointer ${
                      flashId === kpi.id ? "bg-green-500/10" : ""
                    }`}
                    onClick={() => setDetailKpi(kpi)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground">{kpi.name}</span>
                        {kpi.isFormula && <Calculator className="size-3 text-indigo-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-5 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-semibold text-indigo-300">
                          {kpi.owner.initials}
                        </div>
                        <span className="text-xs text-muted-foreground">{kpi.owner.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatValue(kpi.goalValue, kpi.unit)}</td>
                    <td className="px-4 py-3 text-center">
                      {kpi.goalDirection === "above" ? (
                        <ArrowUp className="inline size-3.5 text-green-400/70" />
                      ) : (
                        <ArrowDown className="inline size-3.5 text-green-400/70" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {editingId === kpi.id ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(kpi.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(kpi.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="w-20 rounded bg-foreground/10 px-2 py-0.5 text-right text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        <span
                          className="text-sm font-bold text-foreground cursor-text hover:bg-muted/40 rounded px-1 transition-colors"
                          onClick={() => startEdit(kpi.id, kpi.currentValue)}
                          title={
                            kpi.lastUpdatedBy
                              ? `Last updated by ${kpi.lastUpdatedBy}${kpi.lastUpdatedAt ? ` at ${kpi.lastUpdatedAt}` : ""}`
                              : "Click to edit"
                          }
                        >
                          {formatValue(kpi.currentValue, kpi.unit)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        {kpi.trend > 0 ? (
                          <TrendingUp className="size-3 text-green-400" />
                        ) : kpi.trend < 0 ? (
                          <TrendingDown className="size-3 text-red-400" />
                        ) : null}
                        <span
                          className={`text-xs ${
                            kpi.trend > 0 ? "text-green-400" : kpi.trend < 0 ? "text-red-400" : "text-muted-foreground"
                          }`}
                        >
                          {kpi.trend !== 0 ? `${kpi.trend > 0 ? "+" : ""}${kpi.trend}%` : "--"}
                        </span>
                      </div>
                    </td>
                    {/* Period values */}
                    {displayCols.map((val, i) => {
                      const isGoalMet =
                        kpi.goalDirection === "above"
                          ? val >= (kpi.goalValue >= 1000 ? kpi.goalValue / 1000 : kpi.goalValue)
                          : val <= (kpi.goalValue >= 1000 ? kpi.goalValue / 1000 : kpi.goalValue);
                      return (
                        <td key={i} className="px-2 py-3 text-center">
                          <span
                            className={`text-xs font-medium ${isGoalMet ? "text-green-400" : "text-red-400"}`}
                          >
                            {kpi.unit === "$"
                              ? val >= 1000
                                ? `$${(val / 1).toFixed(0)}`
                                : `$${val}`
                              : kpi.unit === "%"
                              ? `${val}%`
                              : val}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Sparkline data={periodData} status={status} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="glass rounded-xl px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">No KPIs match your search.</p>
        </div>
      )}

      {/* Modals */}
      {detailKpi && (
        <KPIDetailModal
          kpi={detailKpi}
          status={calculateStatus(detailKpi)}
          onClose={() => setDetailKpi(null)}
        />
      )}
      {showFormulaBuilder && (
        <FormulaBuilderModal
          kpis={allKpis}
          onClose={() => setShowFormulaBuilder(false)}
          onSave={handleFormulaSave}
        />
      )}
      {showCreateScorecard && (
        <CreateScorecardModal
          onClose={() => setShowCreateScorecard(false)}
          onSave={handleCreateScorecard}
        />
      )}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
