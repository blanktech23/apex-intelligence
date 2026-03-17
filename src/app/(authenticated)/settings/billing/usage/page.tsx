"use client";

import { useState, useMemo } from "react";
import {
  Download,
  BarChart3,
  Users,
  Bot,
  ChevronDown,
  Check,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Agent breakdown data                                               */
/* ------------------------------------------------------------------ */

const agentBreakdown = [
  { agent: "Support Agent", executions: 2847, tokens: "3.6M", cost: "$12.60" },
  { agent: "Project Orchestrator", executions: 1891, tokens: "1.2M", cost: "$4.20" },
  { agent: "Discovery Concierge", executions: 1247, tokens: "2.4M", cost: "$8.40" },
  { agent: "Estimate Engine", executions: 892, tokens: "4.1M", cost: "$14.35" },
  { agent: "Operations Controller", executions: 634, tokens: "1.8M", cost: "$6.30" },
  { agent: "Executive Navigator", executions: 312, tokens: "3.2M", cost: "$11.20" },
  { agent: "Design Spec Assistant", executions: 156, tokens: "0.8M", cost: "$2.80" },
];

const totalExecutions = agentBreakdown.reduce((sum, a) => sum + a.executions, 0);
const totalCost = "$59.85";

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

function generateDailyData() {
  const data = [];
  const now = new Date(2026, 2, 16); // Mar 16, 2026
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 400000 + Math.random() * 300000;
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
  Owner: "bg-purple-500/15 text-purple-400",
  Admin: "bg-blue-500/15 text-blue-400",
  Manager: "bg-emerald-500/15 text-emerald-400",
  Designer: "bg-cyan-500/15 text-cyan-400",
  Bookkeeper: "bg-amber-500/15 text-amber-400",
  Viewer: "bg-gray-500/15 text-gray-400",
};

/* ------------------------------------------------------------------ */
/*  Custom tooltip                                                     */
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function UsagePage() {
  const [dateRange, setDateRange] = useState("current");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState<false | "loading" | "done">(false);

  const dailyData = useMemo(() => generateDailyData(), []);

  const handleExport = () => {
    setExporting("loading");
    setTimeout(() => {
      setExporting("done");
      setTimeout(() => setExporting(false), 2000);
    }, 1200);
  };

  const selectedRange = dateRanges.find((r) => r.value === dateRange);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Usage breakdown
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed view of agent executions, token usage, and costs
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
      {/*  Daily usage chart                                            */}
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
      {/*  Agent-level breakdown                                        */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Agent breakdown
          </h2>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">
                  Agent
                </TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">
                  Executions
                </TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">
                  Tokens Used
                </TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">
                  Est. Cost
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentBreakdown.map((row) => (
                <TableRow
                  key={row.agent}
                  className="border-border hover:bg-muted/20"
                >
                  <TableCell className="text-sm font-medium text-foreground">
                    {row.agent}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {row.executions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {row.tokens}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-foreground">
                    {row.cost}
                  </TableCell>
                </TableRow>
              ))}

              {/* Total row */}
              <TableRow className="border-border bg-muted/20 hover:bg-muted/30">
                <TableCell className="text-sm font-semibold text-foreground">
                  Total
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-foreground">
                  {totalExecutions.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-foreground">
                  17.1M
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-foreground">
                  {totalCost}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
                <TableHead className="text-xs text-muted-foreground">
                  User
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">
                  Executions
                </TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">
                  % of Total
                </TableHead>
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
