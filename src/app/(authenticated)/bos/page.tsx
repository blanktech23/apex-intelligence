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
  Megaphone,
  Star,
  ClipboardCheck,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

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
  stat?: string;
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
  id: string;
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
  { name: "KPI Dashboard", description: "Track key performance indicators across your organization", icon: Target, href: "/bos/kpis", status: "active", iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10", stat: "24 KPIs tracked" },
  { name: "Meetings", description: "Manage Level 10 meetings, agendas, and action items", icon: CalendarDays, href: "/bos/meetings", status: "active", iconColor: "text-cyan-400", iconBg: "bg-cyan-500/10", stat: "3 upcoming" },
  { name: "Goals & Milestones", description: "Set quarterly rocks and annual goals with tracking", icon: Flag, href: "/bos/goals", status: "active", iconColor: "text-green-400", iconBg: "bg-green-500/10", stat: "12 active rocks" },
  { name: "Issues", description: "Identify, discuss, and solve organizational issues", icon: CircleAlert, href: "/bos/issues", status: "active", iconColor: "text-amber-400", iconBg: "bg-amber-500/10", stat: "7 open" },
  { name: "Action Items", description: "Track to-dos with owners and due dates", icon: ListChecks, href: "/bos/actions", status: "active", iconColor: "text-purple-400", iconBg: "bg-purple-500/10", stat: "12 open, 3 overdue" },
  { name: "Org Chart", description: "Visual organization structure with seats and roles", icon: Network, href: "/bos/org-chart", status: "active", iconColor: "text-blue-400", iconBg: "bg-blue-500/10", stat: "18 seats filled" },
  { name: "People", description: "Team directory, roles, responsibilities, and reviews", icon: UserCircle, href: "/bos/people", status: "active", iconColor: "text-pink-400", iconBg: "bg-pink-500/10", stat: "18 team members" },
  { name: "Vision Plan", description: "10-year vision, 3-year picture, 1-year plan", icon: Eye, href: "/bos/vision", status: "active", iconColor: "text-violet-400", iconBg: "bg-violet-500/10", stat: "Last updated 3d ago" },
  { name: "Announcements", description: "Company news, wins, and team updates", icon: Megaphone, href: "/bos/announcements", status: "active", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10", stat: "6 this week" },
  { name: "Reviews", description: "Quarterly and annual 1-on-1 performance reviews", icon: Star, href: "/bos/reviews", status: "active", iconColor: "text-yellow-400", iconBg: "bg-yellow-500/10", stat: "2 pending" },
  { name: "Processes", description: "Document and optimize core business processes", icon: Workflow, href: "/bos/processes", status: "active", iconColor: "text-rose-400", iconBg: "bg-rose-500/10", stat: "8 documented" },
  { name: "Assessments", description: "Organizational health and team assessments", icon: ClipboardCheck, href: "/bos/assessments", status: "beta", iconColor: "text-orange-400", iconBg: "bg-orange-500/10", stat: "3 available" },
  { name: "Fit Check", description: "Evaluate team member alignment with core values and GWC", icon: UserCheck, href: "/bos/fit-check", status: "beta", iconColor: "text-lime-400", iconBg: "bg-lime-500/10", stat: "18 profiles" },
  { name: "Knowledge Portal", description: "Company processes, SOPs, and knowledge base", icon: BookOpen, href: "/bos/knowledge", status: "active", iconColor: "text-teal-400", iconBg: "bg-teal-500/10", stat: "34 articles" },
  { name: "Analytics", description: "Advanced analytics and trend reporting", icon: TrendingUp, href: "/bos/analytics", status: "active", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10", stat: "5 dashboards" },
  { name: "Scorecards", description: "Weekly team and individual scorecards", icon: BarChart3, href: "/bos/kpis", status: "active", iconColor: "text-orange-400", iconBg: "bg-orange-500/10", stat: "4 active" },
  { name: "My Dashboard", description: "Personal workspace with your tasks, goals, and meetings", icon: Briefcase, href: "/bos/my-dashboard", status: "active", iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10", stat: "5 items today" },
  { name: "System Settings", description: "Configure Business OS preferences and defaults", icon: Settings, href: "/bos/onboarding", status: "active", iconColor: "text-gray-500 dark:text-gray-400", iconBg: "bg-gray-500/10" },
  { name: "Integrations Hub", description: "Connect external tools and sync data", icon: Layers, href: "/bos/onboarding", status: "active", iconColor: "text-sky-400", iconBg: "bg-sky-500/10", stat: "2 connected" },
  { name: "Strategic Compass", description: "AI-powered strategic direction insights", icon: Compass, href: "/bos/vision", status: "beta", iconColor: "text-fuchsia-400", iconBg: "bg-fuchsia-500/10" },
];

const initialChecklist: ChecklistItem[] = [
  { id: "ck-1", label: "Complete company profile", completed: true, href: "/bos/onboarding" },
  { id: "ck-2", label: "Define core values", completed: true, href: "/bos/onboarding" },
  { id: "ck-3", label: "Set up leadership team", completed: true, href: "/bos/onboarding" },
  { id: "ck-4", label: "Create your org chart", completed: false, href: "/bos/org-chart" },
  { id: "ck-5", label: "Set quarterly goals", completed: false, href: "/bos/goals" },
  { id: "ck-6", label: "Schedule your first meeting", completed: false, href: "/bos/meetings" },
  { id: "ck-7", label: "Define your KPI scorecard", completed: false, href: "/bos/kpis" },
  { id: "ck-8", label: "Write your vision plan", completed: false, href: "/bos/vision" },
];

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

const statusConfig: Record<ModuleStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20",
  },
  "coming-soon": {
    label: "Coming Soon",
    className: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
  },
  beta: {
    label: "Beta",
    className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  "setup-required": {
    label: "Setup Required",
    className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BosHubPage() {
  const { role } = useRole();
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

  const completedCount = checklist.filter((i) => i.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          if (newCompleted) {
            toast.success(`Completed: ${item.label}`);
          }
          return { ...item, completed: newCompleted };
        }
        return item;
      })
    );
  };

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
        <button
          onClick={() => setShowSetupWizard(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
        >
          <Rocket className="h-3.5 w-3.5" />
          Setup Wizard
        </button>
      </div>

      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSetupWizard(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-background/95 border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg bg-indigo-500/10 p-2.5">
                  <Rocket className="size-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Setup Wizard</h2>
                  <p className="text-xs text-muted-foreground">Configure your Business OS</p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupWizard(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { step: "1", label: "Company Profile", desc: "Name, industry, team size", done: true },
                { step: "2", label: "Core Values", desc: "Define 3-5 core values", done: true },
                { step: "3", label: "Leadership Team", desc: "Add leadership seats", done: true },
                { step: "4", label: "Org Chart", desc: "Build your accountability chart", done: false },
                { step: "5", label: "Goals & Rocks", desc: "Set quarterly priorities", done: false },
                { step: "6", label: "Scorecard", desc: "Define key measurables", done: false },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    s.done
                      ? "bg-muted/30"
                      : "bg-muted/50 hover:bg-muted/70"
                  }`}
                >
                  {s.done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-bold text-muted-foreground">
                      {s.step}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${s.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {s.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70">{s.desc}</p>
                  </div>
                  {!s.done && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">3 of 6 steps complete</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSetupWizard(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    toast.success("Navigating to next setup step...");
                    setShowSetupWizard(false);
                  }}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-indigo-500 transition-colors"
                >
                  Continue Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      ? "text-green-600 dark:text-green-400"
                      : stat.changePositive === false
                        ? "text-amber-600 dark:text-amber-400"
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
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]"
              >
                <button
                  onClick={() => toggleChecklistItem(item.id)}
                  className="shrink-0"
                >
                  {item.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 hover:text-indigo-400 transition-colors" />
                  )}
                </button>
                <Link href={item.href} className="flex-1 flex items-center gap-2">
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
              </div>
            ))}
          </div>

          {completedCount === totalCount && (
            <div className="mt-4 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">All setup steps complete! You are ready to go.</p>
            </div>
          )}
        </div>
      )}

      {/* Module Grid */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-foreground">Modules</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const status = statusConfig[module.status];

            const card = (
              <div
                className="glass rounded-xl p-5 transition-all duration-300 glass-hover cursor-pointer"
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
                {module.stat && (
                  <p className="mt-1.5 text-[11px] text-muted-foreground/70">{module.stat}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );

            return (
              <Link key={module.name} href={module.href} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
