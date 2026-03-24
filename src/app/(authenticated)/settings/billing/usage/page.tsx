"use client";

import { useState, useMemo } from "react";
import {
  Download,
  BarChart3,
  Users,
  Bot,
  ChevronDown,
  Check,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Agent ROI data — based on industry labor cost research             */
/*  Source: BLS 2025 wage data, NAHB cost surveys, Remodelers Advantage */
/*  Context: 18-employee construction/remodeling co, $3-4M revenue     */
/* ------------------------------------------------------------------ */

interface AgentROI {
  agent: string;
  description: string;
  humanRole: string;
  hourlyRate: number;
  minutesPerTask: number;
  tasksThisMonth: number;
  agentCost: number;
  tokens: string;
  executions: number;
}

const agentROIData: AgentROI[] = [
  {
    agent: "Discovery Concierge",
    description: "Qualifies and routes inbound leads",
    humanRole: "Sales Coordinator",
    hourlyRate: 24,
    minutesPerTask: 20,
    tasksThisMonth: 120,
    agentCost: 8.40,
    tokens: "2.4M",
    executions: 1247,
  },
  {
    agent: "Estimate Engine",
    description: "Generates cost estimates from project specs",
    humanRole: "Construction Estimator",
    hourlyRate: 36,
    minutesPerTask: 360,
    tasksThisMonth: 18,
    agentCost: 14.35,
    tokens: "4.1M",
    executions: 892,
  },
  {
    agent: "Operations Controller",
    description: "Monitors timelines and resource allocation",
    humanRole: "Project Coordinator",
    hourlyRate: 28,
    minutesPerTask: 25,
    tasksThisMonth: 220,
    agentCost: 6.30,
    tokens: "1.8M",
    executions: 634,
  },
  {
    agent: "Executive Navigator",
    description: "Surfaces KPIs and strategic insights",
    humanRole: "Business Analyst",
    hourlyRate: 43,
    minutesPerTask: 45,
    tasksThisMonth: 27,
    agentCost: 11.20,
    tokens: "3.2M",
    executions: 312,
  },
  {
    agent: "Project Orchestrator",
    description: "Manages crew scheduling and availability",
    humanRole: "Scheduler / Dispatcher",
    hourlyRate: 26,
    minutesPerTask: 15,
    tasksThisMonth: 114,
    agentCost: 4.20,
    tokens: "1.2M",
    executions: 1891,
  },
  {
    agent: "Design Spec Assistant",
    description: "Extracts specs from design documents",
    humanRole: "Specs Writer",
    hourlyRate: 31,
    minutesPerTask: 180,
    tasksThisMonth: 5,
    agentCost: 2.80,
    tokens: "0.8M",
    executions: 156,
  },
  {
    agent: "Support Agent",
    description: "Handles customer inquiries and ticket triage",
    humanRole: "Customer Service Rep",
    hourlyRate: 21,
    minutesPerTask: 12,
    tasksThisMonth: 85,
    agentCost: 12.60,
    tokens: "3.6M",
    executions: 2847,
  },
];

// Computed metrics
function computeMetrics(data: AgentROI[]) {
  return data.map((a) => {
    const humanHours = Math.round((a.minutesPerTask * a.tasksThisMonth) / 60 * 100) / 100;
    const humanCost = Math.round(humanHours * a.hourlyRate * 100) / 100;
    const savings = Math.round((humanCost - a.agentCost) * 100) / 100;
    const savingsPct = humanCost > 0 ? Math.round((savings / humanCost) * 100) : 0;
    return { ...a, humanHours, humanCost, savings, savingsPct };
  });
}

/* ------------------------------------------------------------------ */
/*  Per-user breakdown                                                 */
/* ------------------------------------------------------------------ */

const userBreakdown = [
  { name: "Joseph Wells", role: "Owner", executions: 2134, pct: "27%" },
  { name: "Sarah Chen", role: "Admin", executions: 1847, pct: "23%" },
  { name: "Mike Torres", role: "Manager", executions: 1623, pct: "20%" },
  { name: "Lisa Park", role: "Designer", executions: 892, pct: "11%" },
  { name: "David Kim", role: "Bookkeeper", executions: 734, pct: "9%" },
  { name: "Alex Nguyen", role: "Viewer", executions: 749, pct: "10%" },
];

/* ------------------------------------------------------------------ */
/*  Generate daily usage chart data (30 days)                          */
/* ------------------------------------------------------------------ */

function generateDailyData(days: number) {
  const data = [];
  const now = new Date(2026, 2, 20); // Mar 20, 2026
  // Use seeded random for consistency across renders
  let seed = days * 7 + 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 400000 + seededRandom() * 300000;
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.4 : 1;
    data.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      tokens: Math.round(base * weekend),
    });
  }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Date range options                                                 */
/* ------------------------------------------------------------------ */

const dateRanges = [
  { label: "Current period", value: "current" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 60 days", value: "60" },
  { label: "Last 90 days", value: "90" },
];

/* ------------------------------------------------------------------ */
/*  Role badge colors                                                  */
/* ------------------------------------------------------------------ */

const roleBadgeColor: Record<string, string> = {
  Owner: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  Admin: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Manager: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Designer: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  Bookkeeper: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Viewer: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

/* ------------------------------------------------------------------ */
/*  Tooltips                                                           */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-[var(--background)] px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {(payload[0].value / 1000).toFixed(0)}K tokens
      </p>
    </div>
  );
}

function SavingsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-[var(--background)] px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="size-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UsagePage() {
  const [dateRange, setDateRange] = useState("current");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState<false | "loading" | "done">(false);

  const rangeDays = dateRange === "90" ? 90 : dateRange === "60" ? 60 : 30;
  const dailyData = useMemo(() => generateDailyData(rangeDays), [rangeDays]);
  const metrics = useMemo(() => computeMetrics(agentROIData), []);

  const totalHumanHours = metrics.reduce((s, m) => s + m.humanHours, 0);
  const totalHumanCost = metrics.reduce((s, m) => s + m.humanCost, 0);
  const totalAgentCost = metrics.reduce((s, m) => s + m.agentCost, 0);
  const totalSavings = Math.round((totalHumanCost - totalAgentCost) * 100) / 100;
  const totalSavingsPct = totalHumanCost > 0 ? Math.round((totalSavings / totalHumanCost) * 100) : 0;
  const totalExecutions = metrics.reduce((s, m) => s + m.executions, 0);

  // Bar chart data for savings comparison
  const savingsChartData = metrics.map((m) => ({
    name: m.agent.replace(" Concierge", "").replace("Operations ", "Ops ").replace("Executive ", "Exec ").replace("Project ", "Proj ").replace("Design Spec ", "Design "),
    "Human Cost": Math.round(m.humanCost),
    "Agent Cost": Math.round(m.agentCost),
  }));

  const handleExport = () => {
    setExporting("loading");
    setTimeout(() => {
      setExporting("done");
      setTimeout(() => setExporting(false), 2000);
    }, 1200);
  };

  const selectedRange = dateRanges.find((r) => r.value === dateRange);

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Agent ROI & Usage
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Time saved, money saved, and detailed usage breakdown per agent
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 text-sm text-foreground transition-colors hover:bg-muted/50"
            >
              {selectedRange?.label}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 z-40 mt-1 w-48 rounded-lg border border-border bg-[var(--background)] p-1 shadow-xl">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setDateRange(range.value);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/40"
                    >
                      {range.label}
                      {dateRange === range.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export button */}
          <Button
            onClick={handleExport}
            disabled={exporting === "loading"}
            variant="outline"
            className="h-9 gap-2 border-border text-sm"
          >
            <Download className="h-4 w-4" />
            {exporting === "loading"
              ? "Exporting..."
              : exporting === "done"
              ? "Downloaded!"
              : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  ROI Summary Cards                                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-green-500/10 p-2">
              <Clock className="size-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {Math.round(totalHumanHours)}h
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Hours Saved / Month</p>
          <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
            ~{Math.round(totalHumanHours / 8)} work days reclaimed
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-emerald-500/10 p-2">
              <DollarSign className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            ${totalSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Money Saved / Month</p>
          <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ${Math.round(totalSavings * 12).toLocaleString()}/yr projected savings
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-cyan-500/10 p-2">
              <ArrowDown className="size-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {totalSavingsPct}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Cost Reduction</p>
          <p className="mt-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
            ${totalAgentCost.toFixed(2)} agent vs ${totalHumanCost.toLocaleString()} human
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-indigo-500/10 p-2">
              <Zap className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {totalExecutions.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Agent Executions</p>
          <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Across 7 agents this month
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Savings comparison chart                                     */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Human Cost vs Agent Cost (Monthly)
          </h2>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={savingsChartData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}`}
                width={55}
              />
              <Tooltip content={<SavingsTooltip />} />
              <Bar dataKey="Human Cost" fill="rgb(239, 68, 68)" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="Agent Cost" fill="rgb(34, 197, 94)" radius={[4, 4, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full bg-red-500/80" />
            Human labor cost
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2.5 rounded-full bg-green-500/90" />
            Agent AI cost
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Agent-level ROI breakdown                                    */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Agent ROI Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground">Agent</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Replaces</TableHead>
                  <TableHead className="text-right text-xs text-muted-foreground">Tasks / Mo</TableHead>
                  <TableHead className="text-right text-xs text-muted-foreground">Hours Saved</TableHead>
                  <TableHead className="text-right text-xs text-muted-foreground">Human Cost</TableHead>
                  <TableHead className="text-right text-xs text-muted-foreground">Agent Cost</TableHead>
                  <TableHead className="text-right text-xs text-muted-foreground">Savings</TableHead>
                  <TableHead className="text-right text-xs text-muted-foreground">Reduction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((row) => (
                  <TableRow
                    key={row.agent}
                    className="border-border hover:bg-muted/20"
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-foreground">{row.agent}</p>
                        <p className="text-[11px] text-muted-foreground">{row.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-xs text-foreground">{row.humanRole}</p>
                        <p className="text-[11px] text-muted-foreground">${row.hourlyRate}/hr</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {row.tasksThisMonth}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-foreground">
                      {row.humanHours.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right text-sm text-red-500 dark:text-red-400">
                      ${row.humanCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm text-green-600 dark:text-green-400">
                      ${row.agentCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      ${row.savings.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className="border-0 bg-green-500/15 text-green-600 dark:text-green-400">
                        {row.savingsPct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Total row */}
                <TableRow className="border-border bg-muted/20 hover:bg-muted/30">
                  <TableCell className="text-sm font-semibold text-foreground">
                    Total
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    ~2 FTEs equivalent
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {metrics.reduce((s, m) => s + m.tasksThisMonth, 0)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {totalHumanHours.toFixed(1)}h
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-red-500 dark:text-red-400">
                    ${totalHumanCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-green-600 dark:text-green-400">
                    ${totalAgentCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-foreground">
                    ${totalSavings.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="border-0 bg-green-500/15 text-green-600 dark:text-green-400 font-bold">
                      {totalSavingsPct}%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground/70">
          Human cost estimates based on BLS 2025 wage data, NAHB cost structure surveys, and construction industry benchmarks.
          Does not include overhead (benefits, office, software) which would add 25-35% to human labor costs.
        </p>
      </div>

      {/* ============================================================ */}
      {/*  Daily token usage chart                                      */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Daily token usage
          </h2>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                width={50}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="rgb(99, 102, 241)"
                strokeWidth={2}
                fill="url(#tokenGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Per-user breakdown                                           */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Usage by team member
          </h2>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">User</TableHead>
                <TableHead className="text-xs text-muted-foreground">Role</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">Executions</TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBreakdown.map((user) => (
                <TableRow
                  key={user.name}
                  className="border-border hover:bg-muted/20"
                >
                  <TableCell className="text-sm font-medium text-foreground">
                    {user.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`border-0 ${
                        roleBadgeColor[user.role] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {user.executions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-foreground">
                    {user.pct}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
