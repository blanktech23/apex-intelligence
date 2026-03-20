"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Target,
  CalendarDays,
  Flag,
  CircleAlert,
  ListChecks,
  Network,
  UserCircle,
  Eye,
  BookOpen,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  Briefcase,
  Shield,
  BarChart3,
  Workflow,
  Database,
  Settings,
  Layers,
  Compass,
  Lightbulb,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRole } from "@/lib/role-context";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ModuleStatus = "active" | "coming-soon" | "beta" | "setup-required";

interface ModuleCard {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  status: ModuleStatus;
  iconColor: string;
  iconBg: string;
}

interface QuickStat {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  change?: string;
  changePositive?: boolean;
}

interface ChecklistItem {
  label: string;
  completed: boolean;
  href: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const quickStats: QuickStat[] = [
  {
    label: "Team Members",
    value: "18",
    icon: Users,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    change: "+2 this month",
    changePositive: true,
  },
  {
    label: "Active Goals",
    value: "12",
    icon: Flag,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    change: "8 on track",
    changePositive: true,
  },
  {
    label: "Upcoming Meetings",
    value: "3",
    icon: CalendarDays,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    change: "Next: Tomorrow 9 AM",
  },
  {
    label: "Open Issues",
    value: "7",
    icon: CircleAlert,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    change: "2 overdue",
    changePositive: false,
  },
];

const modules: ModuleCard[] = [
  { name: "KPI Dashboard", description: "Track key performance indicators across your organization", icon: Target, href: "/bos/kpis", status: "active", iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10" },
  { name: "Meetings", description: "Manage Level 10 meetings, agendas, and action items", icon: CalendarDays, href: "/bos/meetings", status: "active", iconColor: "text-cyan-400", iconBg: "bg-cyan-500/10" },
  { name: "Goals & Milestones", description: "Set quarterly rocks and annual goals with tracking", icon: Flag, href: "/bos/goals", status: "active", iconColor: "text-green-400", iconBg: "bg-green-500/10" },
  { name: "Issues", description: "Identify, discuss, and solve organizational issues", icon: CircleAlert, href: "/bos/issues", status: "active", iconColor: "text-amber-400", iconBg: "bg-amber-500/10" },
  { name: "Action Items", description: "Track to-dos with owners and due dates", icon: ListChecks, href: "/bos/actions", status: "active", iconColor: "text-purple-400", iconBg: "bg-purple-500/10" },
  { name: "Org Chart", description: "Visual organization structure with seats and roles", icon: Network, href: "/bos/org-chart", status: "active", iconColor: "text-blue-400", iconBg: "bg-blue-500/10" },
  { name: "People", description: "Team directory, roles, responsibilities, and reviews", icon: UserCircle, href: "/bos/people", status: "active", iconColor: "text-pink-400", iconBg: "bg-pink-500/10" },
  { name: "Vision Plan", description: "10-year vision, 3-year picture, 1-year plan", icon: Eye, href: "/bos/vision", status: "active", iconColor: "text-violet-400", iconBg: "bg-violet-500/10" },
  { name: "Knowledge Portal", description: "Company processes, SOPs, and knowledge base", icon: BookOpen, href: "/bos/knowledge", status: "beta", iconColor: "text-teal-400", iconBg: "bg-teal-500/10" },
  { name: "Analytics", description: "Advanced analytics and trend reporting", icon: TrendingUp, href: "/bos/analytics", status: "active", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10" },
  { name: "Scorecards", description: "Weekly team and individual scorecards", icon: BarChart3, href: "/bos/kpis", status: "coming-soon", iconColor: "text-orange-400", iconBg: "bg-orange-500/10" },
  { name: "Processes", description: "Document and optimize core business processes", icon: Workflow, href: "/bos/knowledge", status: "coming-soon", iconColor: "text-rose-400", iconBg: "bg-rose-500/10" },
  { name: "Data Vault", description: "Centralized data repository with access controls", icon: Database, href: "/bos/knowledge", status: "coming-soon", iconColor: "text-slate-400", iconBg: "bg-slate-500/10" },
  { name: "System Settings", description: "Configure Business OS preferences and defaults", icon: Settings, href: "/bos", status: "active", iconColor: "text-gray-400", iconBg: "bg-gray-500/10" },
  { name: "Integrations Hub", description: "Connect external tools and sync data", icon: Layers, href: "/bos", status: "active", iconColor: "text-sky-400", iconBg: "bg-sky-500/10" },
  { name: "Strategic Compass", description: "AI-powered strategic direction insights", icon: Compass, href: "/bos/vision", status: "beta", iconColor: "text-fuchsia-400", iconBg: "bg-fuchsia-500/10" },
  { name: "Innovation Tracker", description: "Track new ideas from inception to implementation", icon: Lightbulb, href: "/bos/goals", status: "coming-soon", iconColor: "text-yellow-400", iconBg: "bg-yellow-500/10" },
  { name: "Launch Pad", description: "Quick-start templates for new initiatives", icon: Rocket, href: "/bos", status: "coming-soon", iconColor: "text-red-400", iconBg: "bg-red-500/10" },
];

const gettingStartedChecklist: ChecklistItem[] = [
  { label: "Complete company profile", completed: true, href: "/bos/onboarding" },
  { label: "Define core values", completed: true, href: "/bos/onboarding" },
  { label: "Set up leadership team", completed: true, href: "/bos/onboarding" },
  { label: "Create your org chart", completed: false, href: "/bos/org-chart" },
  { label: "Set quarterly goals", completed: false, href: "/bos/goals" },
  { label: "Schedule your first meeting", completed: false, href: "/bos/meetings" },
  { label: "Define your KPI scorecard", completed: false, href: "/bos/kpis" },
  { label: "Write your vision plan", completed: false, href: "/bos/vision" },
];

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

const statusConfig: Record<ModuleStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-500/15 text-green-400 border-green-500/20",
  },
  "coming-soon": {
    label: "Coming Soon",
    className: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  },
  beta: {
    label: "Beta",
    className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  },
  "setup-required": {
    label: "Setup Required",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BosHubPage() {
  const { role } = useRole();
  const [showGettingStarted, setShowGettingStarted] = useState(true);

  const completedCount = gettingStartedChecklist.filter((i) => i.completed).length;
  const totalCount = gettingStartedChecklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Business Operating System
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your command center for running the business on a proven framework
          </p>
        </div>
        <Link
          href="/bos/onboarding"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
        >
          <Rocket className="h-3.5 w-3.5" />
          Setup Wizard
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-xl p-5 transition-all duration-300 glass-hover"
            >
              <div className="flex items-start justify-between">
                <div className={`inline-flex rounded-lg p-2.5 ${stat.iconBg}`}>
                  <Icon className={`size-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              {stat.change && (
                <p
                  className={`mt-1.5 text-xs font-medium ${
                    stat.changePositive === true
                      ? "text-green-400"
                      : stat.changePositive === false
                        ? "text-amber-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Getting Started */}
      {showGettingStarted && (
        <div className="glass rounded-xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg bg-indigo-500/10 p-2.5">
                <Rocket className="size-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Getting Started</h2>
                <p className="text-xs text-muted-foreground">
                  Complete these steps to get the most out of Business OS
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGettingStarted(false)}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dismiss
            </button>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <Progress value={progressPercent} className="h-2 flex-1" />
            <span className="text-xs font-semibold text-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {gettingStartedChecklist.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]"
              >
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
                <span
                  className={`text-sm ${
                    item.completed
                      ? "text-muted-foreground line-through"
                      : "font-medium text-foreground"
                  }`}
                >
                  {item.label}
                </span>
                {!item.completed && (
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/40" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const status = statusConfig[module.status];
            const isClickable = module.status !== "coming-soon";

            const card = (
              <div
                className={`glass rounded-xl p-5 transition-all duration-300 ${
                  isClickable ? "glass-hover cursor-pointer" : "opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`inline-flex rounded-lg p-2.5 ${module.iconBg}`}>
                    <Icon className={`size-5 ${module.iconColor}`} />
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  {module.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {module.description}
                </p>
                {isClickable && (
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400">
                    Open <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            );

            if (isClickable) {
              return (
                <Link key={module.name} href={module.href} className="block">
                  {card}
                </Link>
              );
            }

            return <div key={module.name}>{card}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
