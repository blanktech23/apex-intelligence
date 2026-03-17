"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  AlertTriangle,
  Activity,
  DollarSign,
  Mail,
  Calculator,
  BarChart3,
  Wrench,
  Calendar,
  Palette,
  Headset,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  CreditCard,
  FolderOpen,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRole, type Role } from "@/lib/role-context";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const ownerStatsCards = [
  {
    label: "Active Agents",
    value: "5 of 7",
    subtitle: "2 paused",
    subtitleColor: "text-muted-foreground",
    trend: "neutral" as const,
    icon: Brain,
    glowClass: "glow-success",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    href: "/dashboard/agents",
  },
  {
    label: "Pending Escalations",
    value: "3",
    subtitle: "1 critical",
    subtitleColor: "text-red-400",
    trend: "up" as const,
    icon: AlertTriangle,
    glowClass: "glow-warning",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    href: "/escalations",
  },
  {
    label: "Today's Conversations",
    value: "247",
    subtitle: "+12% vs yesterday",
    subtitleColor: "text-green-400",
    trend: "up" as const,
    icon: Activity,
    glowClass: "",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    href: "/reports",
  },
  {
    label: "Monthly AI Spend",
    value: "$2,847",
    subtitle: "68% of budget",
    subtitleColor: "text-amber-400",
    trend: "up" as const,
    icon: DollarSign,
    glowClass: "",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    href: "/settings/billing",
  },
];

const managerStatsCards = [
  {
    label: "Active Agents",
    value: "5 of 7",
    subtitle: "2 paused",
    subtitleColor: "text-muted-foreground",
    trend: "neutral" as const,
    icon: Brain,
    glowClass: "glow-success",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    href: "/dashboard/agents",
  },
  {
    label: "Pending Escalations",
    value: "2",
    subtitle: "1 high priority",
    subtitleColor: "text-amber-400",
    trend: "up" as const,
    icon: AlertTriangle,
    glowClass: "glow-warning",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    href: "/escalations",
  },
  {
    label: "Today's Conversations",
    value: "247",
    subtitle: "+12% vs yesterday",
    subtitleColor: "text-green-400",
    trend: "up" as const,
    icon: Activity,
    glowClass: "",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    href: "/reports",
  },
  {
    label: "Active Projects",
    value: "12",
    subtitle: "3 on track, 1 delayed",
    subtitleColor: "text-amber-400",
    trend: "neutral" as const,
    icon: FolderOpen,
    glowClass: "",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    href: "/projects",
  },
];

const designerStatsCards = [
  {
    label: "Active Projects",
    value: "4",
    subtitle: "2 in review phase",
    subtitleColor: "text-cyan-400",
    trend: "neutral" as const,
    icon: FolderOpen,
    glowClass: "",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    href: "/projects",
  },
  {
    label: "Pending Reviews",
    value: "3",
    subtitle: "1 due today",
    subtitleColor: "text-amber-400",
    trend: "up" as const,
    icon: ClipboardCheck,
    glowClass: "glow-warning",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    href: "/projects",
  },
];

const bookkeeperStatsCards = [
  {
    label: "Active Invoices",
    value: "23",
    subtitle: "5 sent this week",
    subtitleColor: "text-green-400",
    trend: "up" as const,
    icon: FileText,
    glowClass: "",
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    href: "/reports",
  },
  {
    label: "Pending Payments",
    value: "$14,200",
    subtitle: "8 invoices outstanding",
    subtitleColor: "text-amber-400",
    trend: "neutral" as const,
    icon: CreditCard,
    glowClass: "glow-warning",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    href: "/reports",
  },
  {
    label: "Monthly Revenue",
    value: "$284K",
    subtitle: "+8% vs last month",
    subtitleColor: "text-green-400",
    trend: "up" as const,
    icon: DollarSign,
    glowClass: "",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    href: "/reports",
  },
  {
    label: "Overdue",
    value: "$3,400",
    subtitle: "2 invoices past due",
    subtitleColor: "text-red-400",
    trend: "up" as const,
    icon: AlertTriangle,
    glowClass: "glow-warning",
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    href: "/reports",
  },
];

const chartData = [
  { day: "Mon", support: 68, sales: 42, scheduling: 32, other: 18, resolutionRate: 91 },
  { day: "Tue", support: 74, sales: 38, scheduling: 28, other: 22, resolutionRate: 93 },
  { day: "Wed", support: 82, sales: 45, scheduling: 35, other: 20, resolutionRate: 89 },
  { day: "Thu", support: 70, sales: 48, scheduling: 30, other: 24, resolutionRate: 94 },
  { day: "Fri", support: 64, sales: 36, scheduling: 26, other: 16, resolutionRate: 96 },
  { day: "Sat", support: 28, sales: 12, scheduling: 8, other: 6, resolutionRate: 92 },
  { day: "Sun", support: 32, sales: 18, scheduling: 14, other: 10, resolutionRate: 90 },
];

const allEscalations = [
  {
    agent: "Discovery Concierge",
    icon: Mail,
    summary: "Unable to classify inbound lead - missing company domain",
    time: "12m ago",
    priority: "High" as const,
  },
  {
    agent: "Estimate Engine",
    icon: Calculator,
    summary: "Material cost variance exceeds 15% threshold on bid #4821",
    time: "43m ago",
    priority: "Medium" as const,
  },
  {
    agent: "Operations Controller",
    icon: Wrench,
    summary: "Schedule conflict detected between crews on Project Westfield",
    time: "1h ago",
    priority: "High" as const,
  },
  {
    agent: "Support Agent",
    icon: Headset,
    summary: "Customer sentiment score dropped below threshold",
    time: "2h ago",
    priority: "Low" as const,
  },
];

// Manager sees scoped escalations (2 items)
const managerEscalations = allEscalations.slice(1, 3);

// Bookkeeper sees financial escalations
const bookkeeperEscalations = [
  allEscalations[1], // Material cost variance
  {
    agent: "Estimate Engine",
    icon: Calculator,
    summary: "Invoice #3892 payment overdue by 14 days - $2,100",
    time: "3h ago",
    priority: "Medium" as const,
  },
];

type AgentStatus = "Active" | "Paused" | "Error";

interface Agent {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  status: AgentStatus;
  lastRun: string;
  todayCount: number;
}

const agents: Agent[] = [
  { id: "discovery-concierge", name: "Discovery Concierge", icon: Mail, description: "Qualifies and routes inbound leads automatically", status: "Active", lastRun: "5m ago", todayCount: 12 },
  { id: "estimate-engine", name: "Estimate Engine", icon: Calculator, description: "Generates cost estimates from project specs", status: "Active", lastRun: "15m ago", todayCount: 8 },
  { id: "executive-navigator", name: "Executive Navigator", icon: BarChart3, description: "Surfaces KPIs and strategic insights for leadership", status: "Active", lastRun: "1h ago", todayCount: 3 },
  { id: "operations-controller", name: "Operations Controller", icon: Wrench, description: "Monitors project timelines and resource allocation", status: "Active", lastRun: "30m ago", todayCount: 6 },
  { id: "project-orchestrator", name: "Project Orchestrator", icon: Calendar, description: "Manages crew scheduling and availability", status: "Active", lastRun: "2h ago", todayCount: 4 },
  { id: "design-spec-assistant", name: "Design Spec Assistant", icon: Palette, description: "Extracts specs and submittals from design documents", status: "Paused", lastRun: "1d ago", todayCount: 0 },
  { id: "support-agent", name: "Support Agent", icon: Headset, description: "Handles customer inquiries and ticket triage", status: "Active", lastRun: "10m ago", todayCount: 14 },
];

// ---------------------------------------------------------------------------
// Role-based data helpers
// ---------------------------------------------------------------------------

function getStatsForRole(role: Role) {
  switch (role) {
    case "manager":
      return managerStatsCards;
    case "designer":
      return designerStatsCards;
    case "bookkeeper":
      return bookkeeperStatsCards;
    case "owner":
    case "admin":
    case "viewer":
    default:
      return ownerStatsCards;
  }
}

function getEscalationsForRole(role: Role) {
  switch (role) {
    case "manager":
      return managerEscalations;
    case "bookkeeper":
      return bookkeeperEscalations;
    case "designer":
    case "viewer":
      return [];
    case "owner":
    case "admin":
    default:
      return allEscalations;
  }
}

function getAgentsForRole(role: Role) {
  switch (role) {
    case "designer":
      return agents.filter((a) => a.id === "design-spec-assistant" || a.id === "support-agent");
    case "bookkeeper":
      return agents.filter((a) => a.id === "estimate-engine" || a.id === "support-agent");
    case "manager":
      return agents.filter((a) =>
        ["operations-controller", "project-orchestrator", "estimate-engine", "support-agent"].includes(a.id)
      );
    case "owner":
    case "admin":
    case "viewer":
    default:
      return agents;
  }
}

function getBriefingForRole(role: Role): string | null {
  switch (role) {
    case "owner":
    case "admin":
      return `Good morning, Joseph. Here's your daily overview:

**Revenue:** $12,400 in new estimates sent yesterday across 3 projects. Westfield Kitchen ($4,800) is closest to approval.

**Operations:** All 6 active agents running normally. Project Orchestrator flagged a crew conflict on the Riverside project — Mike Torres resolved it at 7:15 AM.

**Attention Needed:** 3 escalations pending your review, including a material cost variance on the Henderson renovation that exceeds your 15% threshold.

**Pipeline:** Discovery Concierge qualified 4 new leads overnight. 2 match your ideal customer profile (residential remodel, $50K+ budget).`;
    case "manager":
      return `Good morning, Mike. Here's your daily overview:

**Operations:** All 4 assigned agents running normally. Project Orchestrator flagged a crew conflict on the Riverside project — resolved at 7:15 AM.

**Attention Needed:** 2 escalations pending your review, including a schedule conflict on Project Westfield.

**Projects:** 12 active projects. 3 on track, 1 delayed (Henderson renovation — material delivery pushed to Thursday).`;
    case "designer":
      return "2 spec reviews awaiting your input. Westfield Kitchen submittals due Friday.";
    case "bookkeeper":
      return "3 invoices ready for review. QuickBooks sync completed at 6 AM — 0 discrepancies.";
    case "viewer":
      return null;
    default:
      return null;
  }
}

function canSeeEscalations(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

function canSeeEscalationBanner(role: Role): boolean {
  return role === "owner" || role === "admin" || role === "manager";
}

function getEscalationCount(role: Role): number {
  return getEscalationsForRole(role).length;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type StatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  subtitleColor?: string;
  trend?: string;
  icon: LucideIcon;
  glowClass?: string;
  iconColor: string;
  iconBg: string;
  href: string;
};

function StatCard({
  label,
  value,
  subtitle,
  subtitleColor,
  icon: Icon,
  glowClass,
  iconColor,
  iconBg,
  href,
}: StatCardProps) {
  return (
    <Link href={href} className="block">
      <div className={`glass rounded-xl p-5 transition-all duration-300 glass-hover cursor-pointer ${glowClass}`}>
        <div className="flex items-start justify-between">
          <div className={`inline-flex rounded-lg p-2.5 ${iconBg}`}>
            <Icon className={`size-5 ${iconColor}`} />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        {subtitle && (
          <p className={`mt-1.5 text-xs font-medium ${subtitleColor}`}>{subtitle}</p>
        )}
      </div>
    </Link>
  );
}

const priorityStyles = {
  High: "bg-red-500/15 text-red-400 border border-red-500/20",
  Medium: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  Low: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
} as const;

function EscalationItem({
  agent,
  icon: Icon,
  summary,
  time,
  priority,
  hideActions = false,
}: {
  agent: string;
  icon: LucideIcon;
  summary: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  hideActions?: boolean;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/30 cursor-pointer">
      <div className="mt-0.5 rounded-md bg-muted/50 p-1.5">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{agent}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[priority]}`}
          >
            {priority}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{summary}</p>
        <p className="mt-1 text-xs text-muted-foreground/60">{time}</p>
      </div>
    </div>
  );

  if (hideActions) {
    return <div>{content}</div>;
  }

  return (
    <Link href="/escalations" className="block">
      {content}
    </Link>
  );
}

const statusConfig: Record<AgentStatus, { dot: string; badge: string; border: string }> = {
  Active: {
    dot: "bg-green-400",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    border: "border-l-green-500/60",
  },
  Paused: {
    dot: "bg-gray-400",
    badge: "bg-gray-500/15 text-gray-400 border-gray-500/20",
    border: "border-l-gray-500/40",
  },
  Error: {
    dot: "bg-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    border: "border-l-red-500/60",
  },
};

function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  const cfg = statusConfig[agent.status];

  return (
    <Link href={`/dashboard/agents/${agent.id}`} className="block">
      <div
        className={`glass rounded-xl border-l-2 p-4 transition-all duration-300 glass-hover cursor-pointer hover:border-indigo-500/30 ${cfg.border}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-muted/50 p-2">
              <Icon className="size-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{agent.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {agent.description}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
          >
            <span className={`size-1.5 rounded-full ${cfg.dot}`} />
            {agent.status}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Last run: {agent.lastRun}</span>
          <span className="text-border">|</span>
          <span>{agent.todayCount} runs today</span>
        </div>
      </div>
    </Link>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="glass-strong rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="mb-1.5 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Daily Briefing Card
// ---------------------------------------------------------------------------

function DailyBriefingCard({ role }: { role: Role }) {
  const [expanded, setExpanded] = useState(true);
  const briefingText = getBriefingForRole(role);

  if (!briefingText) return null;

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/20"
      >
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg bg-indigo-500/10 p-2.5">
            <BarChart3 className="size-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Daily Briefing</h2>
            <p className="text-xs text-muted-foreground">
              Generated by Executive Navigator &middot; 8:00 AM today
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <div className="prose-sm text-sm leading-relaxed text-muted-foreground">
            {briefingText.split("\n\n").map((paragraph, i) => {
              // Parse **bold** markers
              const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
              return (
                <p key={i} className={i > 0 ? "mt-3" : ""}>
                  {parts.map((part, j) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <span key={j} className="font-semibold text-foreground">
                          {part.slice(2, -2)}
                        </span>
                      );
                    }
                    return <span key={j}>{part}</span>;
                  })}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Escalation Alert Banner
// ---------------------------------------------------------------------------

function EscalationAlertBanner({ role }: { role: Role }) {
  const [dismissed, setDismissed] = useState(false);
  const count = getEscalationCount(role);

  if (dismissed || count === 0 || !canSeeEscalationBanner(role)) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-400">
          {count} escalation{count !== 1 ? "s" : ""} need{count === 1 ? "s" : ""} your attention
        </span>
        <Link
          href="/escalations"
          className="text-sm font-medium text-amber-300 underline underline-offset-2 transition-colors hover:text-amber-200"
        >
          View escalations
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="rounded-md p-1 text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-300"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { role } = useRole();
  const statsCards = getStatsForRole(role);
  const escalations = getEscalationsForRole(role);
  const visibleAgents = getAgentsForRole(role);
  const isViewer = role === "viewer";
  const showEscalationPanel = escalations.length > 0;

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time overview of your AI agent workforce
          </p>
        </div>

        {/* Escalation Alert Banner */}
        <EscalationAlertBanner role={role} />

        {/* Row 1 - Stats */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${statsCards.length <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"}`}>
          {statsCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Daily Briefing Card */}
        <DailyBriefingCard role={role} />

        {/* Row 2 - Chart + Escalations */}
        <div className={`grid grid-cols-1 gap-6 ${showEscalationPanel ? "lg:grid-cols-5" : ""}`}>
          {/* Activity Chart */}
          <div className={`glass rounded-xl p-5 ${showEscalationPanel ? "lg:col-span-3" : ""}`}>
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Agent Activity
              <span className="ml-2 text-xs font-normal text-muted-foreground">Last 7 days</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDiscovery" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gEstimating" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExecutive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gOperations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSupport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="discovery" stroke="var(--chart-1)" fill="url(#gDiscovery)" strokeWidth={2} />
                  <Area type="monotone" dataKey="estimating" stroke="var(--chart-2)" fill="url(#gEstimating)" strokeWidth={2} />
                  <Area type="monotone" dataKey="executive" stroke="var(--chart-3)" fill="url(#gExecutive)" strokeWidth={2} />
                  <Area type="monotone" dataKey="operations" stroke="var(--chart-4)" fill="url(#gOperations)" strokeWidth={2} />
                  <Area type="monotone" dataKey="support" stroke="var(--chart-5)" fill="url(#gSupport)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Escalation Summary */}
          {showEscalationPanel && (
            <div className="glass flex flex-col rounded-xl p-5 lg:col-span-2">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Escalations
                <span className="ml-2 inline-flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-400">
                  {escalations.length}
                </span>
              </h2>
              <div className="-mx-2 flex-1 space-y-1 overflow-y-auto">
                {escalations.map((esc, i) => (
                  <EscalationItem key={i} {...esc} hideActions={isViewer} />
                ))}
              </div>
              {!isViewer && (
                <Link href="/escalations" className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                  View all escalations <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Row 3 - Agent Status Grid */}
        <div>
          <h2 className="mb-4 text-base font-semibold text-foreground">Agent Status</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
