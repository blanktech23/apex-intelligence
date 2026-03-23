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
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

/* Detail data for expanded cards */
const revenueBreakdown = {
  byCategory: [
    { name: "Cabinets", amount: "$156K", pct: "54.9%" },
    { name: "Countertops", amount: "$82K", pct: "28.9%" },
    { name: "Hardware & Accessories", amount: "$46K", pct: "16.2%" },
  ],
  byChannel: [
    { name: "Dealer Network", amount: "$198K", pct: "69.7%" },
    { name: "Direct Sales", amount: "$62K", pct: "21.8%" },
    { name: "Online", amount: "$24K", pct: "8.5%" },
  ],
};

const conversationBreakdown = [
  { agent: "Discovery", count: "3,240", pct: "25.2%" },
  { agent: "Support", count: "3,120", pct: "24.3%" },
  { agent: "Operations", count: "2,150", pct: "16.7%" },
  { agent: "Estimating", count: "1,920", pct: "14.9%" },
  { agent: "Schedule", count: "1,670", pct: "13.0%" },
  { agent: "Executive", count: "747", pct: "5.8%" },
];

const resolutionBreakdown = [
  { type: "Auto-resolved", pct: "72.8%", color: "text-emerald-400" },
  { type: "Escalated to human", pct: "21.4%", color: "text-amber-400" },
  { type: "Pending resolution", pct: "5.8%", color: "text-red-400" },
];

const savingsBreakdown = [
  { category: "Labor savings", amount: "$21,200", desc: "Automated data entry & scheduling" },
  { category: "Error reduction", amount: "$12,800", desc: "Fewer order mistakes & rework" },
  { category: "Time savings", amount: "$13,000", desc: "Faster estimates & ticket routing" },
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportForm, setExportForm] = useState({ reportType: "", dateFrom: "", dateTo: "", format: "" });

  if (!config.canViewReports) {
    return (
      <div className="glass rounded-xl px-5 py-12 text-center">
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have permission to view reports.</p>
      </div>
    );
  }

  function handleExport() {
    if (!exportForm.reportType) {
      toast.error("Please select a report type");
      return;
    }
    if (!exportForm.format) {
      toast.error("Please select a format");
      return;
    }
    const typeLabels: Record<string, string> = {
      revenue: "Revenue Summary",
      agent: "Agent Performance",
      commission: "Commission Report",
      full: "Full Export",
    };
    toast.success(`Exporting ${typeLabels[exportForm.reportType] || exportForm.reportType}...`, {
      description: `Format: ${exportForm.format.toUpperCase()}${exportForm.dateFrom ? ` | From: ${exportForm.dateFrom}` : ""}${exportForm.dateTo ? ` To: ${exportForm.dateTo}` : ""}`,
    });
    setExportOpen(false);
    setExportForm({ reportType: "", dateFrom: "", dateTo: "", format: "" });
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
          <Button onClick={() => setExportOpen(true)} className="h-9 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]">
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
              className={`glass rounded-xl p-5 transition-all duration-300 glass-hover cursor-pointer ${expandedCard === card.label ? "ring-1 ring-indigo-500/30" : ""}`}
              onClick={() => setExpandedCard(expandedCard === card.label ? null : card.label)}
            >
              <div className="flex items-center justify-between">
                <div className={`inline-flex rounded-lg p-2.5 ${card.iconBg}`}>
                  <Icon className={`size-5 ${card.iconColor}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      card.changePositive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {card.change}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expandedCard === card.label ? "rotate-180" : ""}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Expanded Card Detail Panel */}
      {expandedCard && (
        <div className="glass border-border rounded-xl p-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {expandedCard === "Total Revenue" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">By Product Category</h4>
                  <div className="space-y-2">
                    {revenueBreakdown.byCategory.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg border border-border bg-foreground/[0.02] px-4 py-2.5">
                        <span className="text-sm text-foreground">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-emerald-400">{item.amount}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{item.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">By Channel</h4>
                  <div className="space-y-2">
                    {revenueBreakdown.byChannel.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg border border-border bg-foreground/[0.02] px-4 py-2.5">
                        <span className="text-sm text-foreground">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-indigo-400">{item.amount}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{item.pct}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {expandedCard === "AI Conversations" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Conversations by Agent</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Agent</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Conversations</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">% of Total</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversationBreakdown.map((row) => (
                      <tr key={row.agent} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.agent}</td>
                        <td className="py-2 text-right text-muted-foreground">{row.count}</td>
                        <td className="py-2 text-right text-indigo-400 font-medium">{row.pct}</td>
                        <td className="py-2 text-right hidden sm:table-cell">
                          <div className="flex items-center justify-end">
                            <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${parseFloat(row.pct) * 3}px` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Total: <span className="font-medium text-foreground">12,847</span> conversations this period</div>
            </div>
          )}

          {expandedCard === "Resolution Rate" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Resolution Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {resolutionBreakdown.map((item) => (
                  <div key={item.type} className="flex flex-col items-center rounded-lg border border-border bg-foreground/[0.02] px-4 py-4">
                    <span className={`text-2xl font-bold ${item.color}`}>{item.pct}</span>
                    <span className="text-xs text-muted-foreground mt-1">{item.type}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Overall resolution rate: <span className="font-medium text-cyan-400">94.2%</span> (+2.1% vs last period)</div>
            </div>
          )}

          {expandedCard === "Cost Savings" && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Savings Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground">Category</th>
                      <th className="text-right py-2 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-2 text-xs font-medium text-muted-foreground hidden sm:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsBreakdown.map((row) => (
                      <tr key={row.category} className="border-b border-border/50">
                        <td className="py-2 text-foreground font-medium">{row.category}</td>
                        <td className="py-2 text-right text-amber-400 font-medium">{row.amount}</td>
                        <td className="py-2 text-muted-foreground text-xs hidden sm:table-cell">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">Total savings: <span className="font-medium text-amber-400">$47,000</span> (+18% vs last period)</div>
            </div>
          )}
        </div>
      )}

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

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="sm:max-w-md glass-strong border-border bg-background" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="rounded-lg bg-indigo-500/10 p-2">
                <Download className="h-4 w-4 text-indigo-400" />
              </div>
              Export Report
            </DialogTitle>
            <DialogDescription>
              Configure your report export settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Report Type *</label>
              <Select value={exportForm.reportType} onValueChange={(v) => { if (v) setExportForm({ ...exportForm, reportType: v }); }}>
                <SelectTrigger className="mt-1 glass border-border bg-foreground/5 text-foreground">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border bg-popover">
                  <SelectItem value="revenue">Revenue Summary</SelectItem>
                  <SelectItem value="agent">Agent Performance</SelectItem>
                  <SelectItem value="commission">Commission Report</SelectItem>
                  <SelectItem value="full">Full Export</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date From</label>
                <Input
                  type="date"
                  value={exportForm.dateFrom}
                  onChange={(e) => setExportForm({ ...exportForm, dateFrom: e.target.value })}
                  className="mt-1 glass border-border bg-foreground/5 text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date To</label>
                <Input
                  type="date"
                  value={exportForm.dateTo}
                  onChange={(e) => setExportForm({ ...exportForm, dateTo: e.target.value })}
                  className="mt-1 glass border-border bg-foreground/5 text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Format *</label>
              <Select value={exportForm.format} onValueChange={(v) => { if (v) setExportForm({ ...exportForm, format: v }); }}>
                <SelectTrigger className="mt-1 glass border-border bg-foreground/5 text-foreground">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="glass-strong border-border bg-popover">
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="border-border bg-foreground/5 text-foreground hover:bg-foreground/10" onClick={() => { setExportOpen(false); setExportForm({ reportType: "", dateFrom: "", dateTo: "", format: "" }); }}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleExport}>
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
