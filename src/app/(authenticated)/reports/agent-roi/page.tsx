"use client";

import { useMemo } from "react";
import {
  Bot,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowDown,
  Zap,
} from "lucide-react";
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

const PLATFORM_FEE = 500; // monthly subscription cost

interface AgentROI {
  agent: string;
  description: string;
  humanRole: string;
  hourlyRate: number;
  minutesPerTask: number;
  tasksThisMonth: number;
  agentCost: number;
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
  },
  {
    agent: "Estimate Engine",
    description: "Generates cost estimates from project specs",
    humanRole: "Construction Estimator",
    hourlyRate: 36,
    minutesPerTask: 360,
    tasksThisMonth: 18,
    agentCost: 14.35,
  },
  {
    agent: "Operations Controller",
    description: "Monitors timelines and resource allocation",
    humanRole: "Project Coordinator",
    hourlyRate: 28,
    minutesPerTask: 25,
    tasksThisMonth: 160,
    agentCost: 6.30,
  },
  {
    agent: "Executive Navigator",
    description: "Surfaces KPIs and strategic insights",
    humanRole: "Business Analyst",
    hourlyRate: 43,
    minutesPerTask: 45,
    tasksThisMonth: 27,
    agentCost: 11.20,
  },
  {
    agent: "Project Orchestrator",
    description: "Manages crew scheduling and availability",
    humanRole: "Scheduler / Dispatcher",
    hourlyRate: 26,
    minutesPerTask: 15,
    tasksThisMonth: 114,
    agentCost: 4.20,
  },
  {
    agent: "Design Spec Assistant",
    description: "Extracts specs from design documents",
    humanRole: "Specs Writer",
    hourlyRate: 31,
    minutesPerTask: 180,
    tasksThisMonth: 5,
    agentCost: 2.80,
  },
  {
    agent: "Support Agent",
    description: "Handles customer inquiries and ticket triage",
    humanRole: "Customer Service Rep",
    hourlyRate: 21,
    minutesPerTask: 12,
    tasksThisMonth: 240,
    agentCost: 12.60,
  },
];

// Computed metrics
function computeMetrics(data: AgentROI[]) {
  return data.map((a) => {
    const humanHours = Math.round((a.minutesPerTask * a.tasksThisMonth) / 60 * 100) / 100;
    const humanCost = Math.round(humanHours * a.hourlyRate);
    const savings = humanCost - a.agentCost;
    const savingsPct = humanCost > 0 ? Math.floor((savings / humanCost) * 100) : 0;
    return { ...a, humanHours, humanCost, savings: Math.round(savings), savingsPct };
  });
}

/* ------------------------------------------------------------------ */
/*  Savings chart tooltip                                              */
/* ------------------------------------------------------------------ */

function SavingsTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-[var(--background)] px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
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

export default function AgentROIPage() {
  const metrics = useMemo(() => computeMetrics(agentROIData), []);

  const totalHumanHours = metrics.reduce((s, m) => s + m.humanHours, 0);
  const totalHumanCost = metrics.reduce((s, m) => s + m.humanCost, 0);
  const totalAgentCost = metrics.reduce((s, m) => s + m.agentCost, 0);
  const totalPlatformCost = totalAgentCost + PLATFORM_FEE;
  const totalSavings = Math.round(totalHumanCost - totalPlatformCost);
  const totalSavingsPct = totalHumanCost > 0 ? Math.floor((totalSavings / totalHumanCost) * 100) : 0;
  const totalTasks = metrics.reduce((s, m) => s + m.tasksThisMonth, 0);

  // Chart data: show savings amount per agent (what matters to users)
  const savingsChartData = metrics.map((m) => ({
    name: m.agent.replace(" Concierge", "").replace("Operations ", "Ops ").replace("Executive ", "Exec ").replace("Project ", "Proj ").replace("Design Spec ", "Design "),
    "Savings": m.savings,
    "Human Cost": m.humanCost,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Agent ROI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          How much time and money your AI agents save compared to manual labor
        </p>
      </div>

      {/* ============================================================ */}
      {/*  ROI Summary Cards                                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass rounded-xl p-5">
          <div className="inline-flex rounded-lg bg-green-500/10 p-2">
            <Clock className="size-4 text-green-400" />
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
          <div className="inline-flex rounded-lg bg-emerald-500/10 p-2">
            <DollarSign className="size-4 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            ${totalSavings.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Money Saved / Month</p>
          <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            ~${Math.round(totalSavings * 12 / 1000)}K/yr projected savings
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="inline-flex rounded-lg bg-cyan-500/10 p-2">
            <ArrowDown className="size-4 text-cyan-400" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {totalSavingsPct}%
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Cost Reduction</p>
          <p className="mt-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
            ${Math.round(totalPlatformCost)} total vs ${totalHumanCost.toLocaleString()} human
          </p>
        </div>

        <div className="glass rounded-xl p-5">
          <div className="inline-flex rounded-lg bg-indigo-500/10 p-2">
            <Zap className="size-4 text-indigo-400" />
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {totalTasks.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Tasks Completed</p>
          <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Across 7 agents this month
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Savings per agent chart                                      */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Monthly Savings by Agent
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
              <Bar dataKey="Savings" fill="rgb(34, 197, 94)" radius={[4, 4, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground/70">
          Savings = human labor cost minus AI inference cost per agent
        </p>
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

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
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
                    Total (AI inference)
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {totalTasks}
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
                    ${Math.round(totalHumanCost - totalAgentCost).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge className="border-0 bg-green-500/15 text-green-600 dark:text-green-400 font-bold">
                      99%
                    </Badge>
                  </TableCell>
                </TableRow>

                {/* Platform fee row */}
                <TableRow className="border-border bg-muted/10 hover:bg-muted/20">
                  <TableCell className="text-sm text-muted-foreground" colSpan={4}>
                    Platform subscription (Professional Plan)
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-foreground">
                    $500.00
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    —
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    —
                  </TableCell>
                </TableRow>

                {/* Net total row */}
                <TableRow className="border-border bg-primary/5 hover:bg-primary/10">
                  <TableCell className="text-sm font-bold text-foreground" colSpan={2}>
                    Net Savings (after platform cost)
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {totalTasks}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {totalHumanHours.toFixed(1)}h
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-red-500 dark:text-red-400">
                    ${totalHumanCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-green-600 dark:text-green-400">
                    ${Math.round(totalPlatformCost).toLocaleString()}
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

        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {metrics.map((row) => (
            <div key={row.agent} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">{row.agent}</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Replaces: <span className="text-foreground">{row.humanRole}</span></p>
                <p className="text-muted-foreground">Tasks/Mo: <span className="text-foreground">{row.tasksThisMonth}</span></p>
                <p className="text-muted-foreground">Hours Saved: <span className="text-foreground">{row.humanHours.toFixed(1)}h</span></p>
              </div>
              <div className="text-sm">
                <span className="text-red-500 dark:text-red-400">${row.humanCost.toLocaleString()}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-green-600 dark:text-green-400">${row.agentCost.toFixed(2)}</span>
                <span className="text-muted-foreground"> = </span>
                <span className="font-semibold text-green-600 dark:text-green-400">${row.savings.toLocaleString()} saved</span>
                <span className="text-green-600 dark:text-green-400"> ({row.savingsPct}% reduction)</span>
              </div>
            </div>
          ))}

          {/* Net total card */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
            <p className="text-sm font-bold text-foreground">Net Savings (after platform cost)</p>
            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">Tasks: <span className="font-semibold text-foreground">{totalTasks}</span></p>
              <p className="text-muted-foreground">Hours Saved: <span className="font-semibold text-foreground">{totalHumanHours.toFixed(1)}h</span></p>
              <p>
                <span className="text-red-500 dark:text-red-400">${totalHumanCost.toLocaleString()}</span>
                <span className="text-muted-foreground"> → </span>
                <span className="text-green-600 dark:text-green-400">${Math.round(totalPlatformCost).toLocaleString()}</span>
                <span className="text-muted-foreground"> = </span>
                <span className="font-bold text-green-600 dark:text-green-400">${totalSavings.toLocaleString()} saved ({totalSavingsPct}%)</span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground/70">
          Human cost based on BLS 2025 occupational wage data and NAHB construction industry benchmarks.
          Does not include overhead (benefits ~25-35%, office space, software licenses) which would increase human labor costs further.
        </p>
      </div>
    </div>
  );
}
