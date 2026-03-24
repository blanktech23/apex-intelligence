"use client";

import {
  Target,
  Calendar,
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const goalCompletionData = [
  { quarter: "Q2 2025", completion: 72 },
  { quarter: "Q3 2025", completion: 78 },
  { quarter: "Q4 2025", completion: 81 },
  { quarter: "Q1 2026", completion: 85 },
];

const meetingEffectivenessData = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  rating: 6.8 + Math.sin(i * 0.5) * 0.8 + (i / 12) * 1.2,
}));

const kpiTrendData = Array.from({ length: 13 }, (_, i) => ({
  week: `W${i + 1}`,
  onTrack: 62 + Math.round(Math.sin(i * 0.4) * 5 + (i / 13) * 12),
}));

const issueResolutionData = [
  { category: "Process", avgDays: 4.2 },
  { category: "People", avgDays: 6.8 },
  { category: "Technical", avgDays: 3.1 },
  { category: "Customer", avgDays: 5.5 },
  { category: "Financial", avgDays: 7.2 },
  { category: "Safety", avgDays: 1.8 },
];

const teamHealthData = [
  { team: "Leadership", integrity: 8.5, accountability: 8.2, gsd: 7.8, growth: 8.0, teamwork: 9.1 },
  { team: "Operations", integrity: 8.0, accountability: 7.5, gsd: 8.8, growth: 7.2, teamwork: 8.4 },
  { team: "Sales", integrity: 7.8, accountability: 8.4, gsd: 8.2, growth: 8.6, teamwork: 7.9 },
  { team: "Finance", integrity: 9.0, accountability: 8.8, gsd: 7.0, growth: 7.5, teamwork: 8.2 },
];

const actionItemData = [
  { name: "Completed", value: 42, color: COLORS.green },
  { name: "In Progress", value: 18, color: COLORS.amber },
  { name: "Overdue", value: 7, color: COLORS.red },
];

const summaryCards = [
  {
    label: "Total Goals",
    value: "32",
    subtitle: "24 completed / 8 active",
    icon: Target,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    label: "Meetings Held",
    value: "48",
    subtitle: "This quarter",
    icon: Calendar,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  {
    label: "Issues Resolved",
    value: "67",
    subtitle: "Avg 4.8 days resolution",
    icon: CheckCircle2,
    iconColor: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-500/10",
  },
  {
    label: "Avg Meeting Rating",
    value: "8.2",
    subtitle: "Out of 10",
    icon: Star,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
  },
];

/* ------------------------------------------------------------------ */
/*  Chart Tooltip                                                      */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          BOS Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance trends and organizational health metrics
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass rounded-xl p-5 transition-all duration-300 glass-hover"
            >
              <div className="flex items-center justify-between">
                <div className={`inline-flex rounded-lg p-2.5 ${card.iconBg}`}>
                  <Icon className={`size-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/70">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Goal Completion Rate */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Goal Completion Rate
            </h2>
            <span className="text-xs text-muted-foreground">By quarter</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalCompletionData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="completion" fill={COLORS.indigo} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meeting Effectiveness */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Meeting Effectiveness
            </h2>
            <span className="text-xs text-muted-foreground">Avg rating (1-10)</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={meetingEffectivenessData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[5, 10]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke={COLORS.cyan}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Trend Overview */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              KPI Trend Overview
            </h2>
            <span className="text-xs text-muted-foreground">% on-track over 13 weeks</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiTrendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gKpiTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="onTrack"
                  stroke={COLORS.green}
                  fill="url(#gKpiTrend)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Issue Resolution Velocity */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Issue Resolution Velocity
            </h2>
            <span className="text-xs text-muted-foreground">Avg days by category</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issueResolutionData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}d`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="avgDays" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Health Score */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Team Health Score
            </h2>
            <span className="text-xs text-muted-foreground">Core values alignment</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamHealthData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="team"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground capitalize">{value}</span>
                  )}
                />
                <Bar dataKey="integrity" fill={COLORS.indigo} radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="accountability" fill={COLORS.cyan} radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="gsd" fill={COLORS.green} radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="growth" fill={COLORS.amber} radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="teamwork" fill={COLORS.red} radius={[2, 2, 0, 0]} stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Item Completion */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Action Item Completion
            </h2>
            <span className="text-xs text-muted-foreground">Current quarter</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionItemData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {actionItemData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const data = payload[0].payload as (typeof actionItemData)[number];
                    return (
                      <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: data.color }}
                          />
                          <span className="text-muted-foreground">{data.name}:</span>
                          <span className="font-medium text-foreground">{data.value}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
