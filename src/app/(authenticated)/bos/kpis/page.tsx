"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
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
/*  Data model                                                         */
/* ------------------------------------------------------------------ */

interface Measurable {
  id: string;
  name: string;
  owner: { name: string; avatar: string; initials: string };
  currentValue: number;
  goalValue: number;
  goalDirection: "above" | "below" | "between";
  unit: "$" | "%" | "#" | "days";
  weeklyValues: number[];
  status: "on_track" | "off_track" | "no_data";
  trend: number;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const measurables: Measurable[] = [
  {
    id: "1",
    name: "Revenue",
    owner: { name: "Joseph Wells", avatar: "", initials: "JW" },
    currentValue: 284000,
    goalValue: 250000,
    goalDirection: "above",
    unit: "$",
    weeklyValues: [210, 218, 225, 230, 228, 240, 248, 255, 260, 268, 272, 278, 284],
    status: "on_track",
    trend: 4.2,
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
    status: "on_track",
    trend: 1.1,
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
    status: "off_track",
    trend: 0.7,
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
    status: "on_track",
    trend: -6.7,
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
    status: "on_track",
    trend: 0,
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
    status: "on_track",
    trend: 0,
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
    status: "on_track",
    trend: 2.2,
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
    status: "off_track",
    trend: 1.6,
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
    status: "off_track",
    trend: -2.9,
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
    status: "on_track",
    trend: 0,
  },
];

const quarters = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];
const teams = ["All Teams", "Leadership", "Operations", "Sales", "Finance"];

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

/* ------------------------------------------------------------------ */
/*  Sparkline component                                                */
/* ------------------------------------------------------------------ */

function Sparkline({ data, status }: { data: number[]; status: string }) {
  const chartData = data.map((v, i) => ({ w: i, v }));
  const color = status === "on_track" ? COLORS.green : status === "off_track" ? COLORS.red : "#64748b";
  return (
    <ResponsiveContainer width={120} height={40}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function KPIsPage() {
  const [quarter, setQuarter] = useState("Q1 2026");
  const [team, setTeam] = useState("All Teams");
  const [search, setSearch] = useState("");
  const [quarterOpen, setQuarterOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  const filtered = measurables.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const onTrack = measurables.filter((m) => m.status === "on_track").length;
  const offTrack = measurables.filter((m) => m.status === "off_track").length;
  const noData = measurables.filter((m) => m.status === "no_data").length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            KPI Scorecard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly measurables across the organization
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Quarter selector */}
          <div className="relative">
            <button
              onClick={() => { setQuarterOpen(!quarterOpen); setTeamOpen(false); }}
              className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-[rgba(255,255,255,0.08)]"
            >
              {quarter}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            {quarterOpen && (
              <div className="glass-strong absolute right-0 top-full z-20 mt-1 w-36 rounded-lg p-1 shadow-xl">
                {quarters.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuarter(q); setQuarterOpen(false); }}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
                      quarter === q
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Team filter */}
          <div className="relative">
            <button
              onClick={() => { setTeamOpen(!teamOpen); setQuarterOpen(false); }}
              className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-[rgba(255,255,255,0.08)]"
            >
              {team}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
            {teamOpen && (
              <div className="glass-strong absolute right-0 top-full z-20 mt-1 w-40 rounded-lg p-1 shadow-xl">
                {teams.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTeam(t); setTeamOpen(false); }}
                    className={`block w-full rounded-md px-3 py-1.5 text-left text-xs transition-all ${
                      team === t
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.06)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

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

      {/* Summary stats bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{measurables.length}</span>
            <span className="text-xs text-muted-foreground">Total Measurables</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-400">{onTrack}</span>
            <span className="text-xs text-muted-foreground">On Track</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-sm font-medium text-red-400">{offTrack}</span>
            <span className="text-xs text-muted-foreground">Off Track</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-400">{noData}</span>
            <span className="text-xs text-muted-foreground">No Data</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((kpi) => (
          <div
            key={kpi.id}
            className="glass rounded-xl p-5 transition-all duration-300 glass-hover"
          >
            {/* Header: name + status badge */}
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-sm font-semibold text-foreground">{kpi.name}</h3>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  kpi.status === "on_track"
                    ? "bg-green-500/15 text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                    : kpi.status === "off_track"
                      ? "bg-red-500/15 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                      : "bg-gray-500/15 text-gray-400"
                }`}
              >
                {kpi.status === "on_track" ? "On Track" : kpi.status === "off_track" ? "Off Track" : "No Data"}
              </span>
            </div>

            {/* Owner */}
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-semibold text-indigo-300">
                {kpi.owner.initials}
              </div>
              <span className="text-xs text-muted-foreground">{kpi.owner.name}</span>
            </div>

            {/* Current value */}
            <div className="mb-1 flex items-end justify-between">
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatValue(kpi.currentValue, kpi.unit)}
              </p>
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

            {/* Goal line */}
            <p className="mb-3 text-xs text-muted-foreground">
              Goal: {formatValue(kpi.goalValue, kpi.unit)}{" "}
              <span className="text-muted-foreground/60">
                ({kpi.goalDirection === "above" ? "above" : kpi.goalDirection === "below" ? "below" : "between"})
              </span>
            </p>

            {/* Sparkline */}
            <div className="flex justify-center">
              <Sparkline data={kpi.weeklyValues} status={kpi.status} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-xl px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">No KPIs match your search.</p>
        </div>
      )}
    </div>
  );
}
