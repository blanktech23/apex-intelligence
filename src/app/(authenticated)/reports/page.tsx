"use client";

import { useState } from "react";
import {
  Download,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  DollarSign,
  Calendar,
  Brain,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

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

const revenueData = [
  { month: "Jan", revenue: 18200 },
  { month: "Feb", revenue: 21400 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 24600 },
  { month: "May", revenue: 22100 },
  { month: "Jun", revenue: 26800 },
  { month: "Jul", revenue: 25400 },
  { month: "Aug", revenue: 28300 },
  { month: "Sep", revenue: 27100 },
  { month: "Oct", revenue: 30500 },
  { month: "Nov", revenue: 29200 },
  { month: "Dec", revenue: 31000 },
];

const agentPerformanceData = [
  { agent: "Discovery", conversations: 2840 },
  { agent: "Estimating", conversations: 1920 },
  { agent: "Executive", conversations: 890 },
  { agent: "Operations", conversations: 2150 },
  { agent: "Schedule", conversations: 1670 },
  { agent: "Design", conversations: 1240 },
  { agent: "Support", conversations: 3120 },
];

const satisfactionData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: 4.1 + Math.sin(i * 0.3) * 0.4 + (i / 30) * 0.3,
}));

const escalationBreakdown = [
  { name: "Resolved", value: 65, color: COLORS.green },
  { name: "In Progress", value: 20, color: COLORS.amber },
  { name: "Open", value: 15, color: COLORS.red },
];

type DateRange = "7d" | "30d" | "90d" | "custom";

const dateRangeLabels: Record<DateRange, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days",
  custom: "Custom",
};

const statsCards = [
  {
    label: "Total Revenue",
    value: "$284K",
    change: "+12%",
    changePositive: true,
    icon: DollarSign,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
  },
  {
    label: "AI Conversations",
    value: "12,847",
    change: "+8.3%",
    changePositive: true,
    icon: MessageSquare,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    label: "Resolution Rate",
    value: "94.2%",
    change: "+2.1%",
    changePositive: true,
    icon: CheckCircle2,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  {
    label: "Cost Savings",
    value: "$47K",
    change: "+18%",
    changePositive: true,
    icon: TrendingUp,
    iconColor: "text-amber-400",
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
            {typeof entry.value === "number" && entry.name === "revenue"
              ? `$${entry.value.toLocaleString()}`
              : typeof entry.value === "number"
                ? entry.value.toLocaleString()
                : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const { config } = useRole();
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  if (!config.canViewReports) {
    return (
      <div className="glass rounded-xl px-5 py-12 text-center">
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have permission to view reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance insights across your AI agent workforce
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range selector */}
          <div className="glass flex flex-col sm:flex-row items-center gap-1 rounded-lg p-1">
            {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  dateRange === range
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {dateRangeLabels[range]}
              </button>
            ))}
          </div>
          <Button onClick={() => toast.success("Report exported successfully")} className="h-9 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
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
                <span
                  className={`text-xs font-semibold ${
                    card.changePositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts 2x2 grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Revenue Over Time
            </h2>
            <span className="text-xs text-muted-foreground">12 months</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.indigo} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLORS.indigo} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.indigo}
                  fill="url(#gRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Agent Performance
            </h2>
            <span className="text-xs text-muted-foreground">Conversations handled</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformanceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="agent"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="conversations" fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Customer Satisfaction
            </h2>
            <span className="text-xs text-muted-foreground">30-day trend</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={satisfactionData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[3.5, 5]}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.green}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Escalation Breakdown */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Escalation Breakdown
            </h2>
            <span className="text-xs text-muted-foreground">Current period</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={escalationBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {escalationBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const data = payload[0].payload as (typeof escalationBreakdown)[number];
                    return (
                      <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: data.color }}
                          />
                          <span className="text-muted-foreground">{data.name}:</span>
                          <span className="font-medium text-foreground">{data.value}%</span>
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

      {/* AI Performance Summary */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-indigo-500/10 p-2">
            <Sparkles className="size-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              AI Performance Summary
            </h2>
            <p className="text-xs text-muted-foreground">
              Generated insights from your agent data
            </p>
          </div>
        </div>
        <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-5">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 size-4 shrink-0 text-indigo-400" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Discovery Concierge</span> had
              a 23% increase in lead qualification accuracy this month. The improved prompt
              chain reduced false-positive escalations by 31%, saving approximately 14 hours
              of manual review time.
            </p>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 size-4 shrink-0 text-cyan-400" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Project Orchestrator</span>{" "}
              resolved 847 scheduling conflicts automatically, up from 612 last month. Crew
              utilization improved to 91.4%, the highest since deployment.
            </p>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-0.5 size-4 shrink-0 text-green-400" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Overall AI-driven cost savings reached{" "}
              <span className="font-medium text-foreground">$47,200</span> this period,
              primarily from reduced manual data entry (38%), automated estimate generation
              (32%), and intelligent ticket routing (30%).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
