"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Edit,
  FileText,
  Download,
  Image,
  Shield,
  FileCheck,
  FilePlus,
  MessageSquare,
  Upload,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Legend,
} from "recharts";
import { toast } from "sonner";

// --- Mock Data ---

const project = {
  id: "proj-001",
  name: "Riverside Office Renovation",
  client: "Rivera General Contracting",
  status: "In Progress",
  description:
    "Complete interior renovation of a 4,200 sq ft office space including demolition, structural modifications, new electrical and plumbing rough-in, drywall, flooring, custom cabinetry, and finish work. The project includes ADA compliance upgrades and energy-efficient HVAC installation.",
  budget: 125000,
  spent: 95400,
  startDate: "2026-03-01",
  dueDate: "2026-06-15",
  progress: 67,
  team: [
    { initials: "MR", name: "Marco Rivera", role: "Project Manager", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300" },
    { initials: "KL", name: "Karen Lee", role: "Site Supervisor", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300" },
    { initials: "DP", name: "David Park", role: "Lead Electrician", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300" },
    { initials: "JT", name: "James Torres", role: "Plumber", color: "bg-red-500/30 text-red-700 dark:text-red-300" },
  ],
};

const burnDownData = [
  { week: "Wk 1", planned: 8000, actual: 7200 },
  { week: "Wk 2", planned: 16000, actual: 15800 },
  { week: "Wk 3", planned: 25000, actual: 26400 },
  { week: "Wk 4", planned: 34000, actual: 35100 },
  { week: "Wk 5", planned: 43000, actual: 44800 },
  { week: "Wk 6", planned: 52000, actual: 55200 },
  { week: "Wk 7", planned: 61000, actual: 63900 },
  { week: "Wk 8", planned: 70000, actual: 72500 },
  { week: "Wk 9", planned: 79000, actual: 82100 },
  { week: "Wk 10", planned: 88000, actual: 89700 },
  { week: "Wk 11", planned: 97000, actual: 95400 },
  { week: "Wk 12", planned: 106000, actual: null },
];

const milestones = [
  { name: "Demolition Complete", date: "Mar 8", status: "completed" },
  { name: "Rough-In Inspection Passed", date: "Mar 22", status: "completed" },
  { name: "Electrical Rough-In Complete", date: "Apr 5", status: "completed" },
  { name: "Drywall & Framing", date: "Apr 20", status: "in-progress" },
  { name: "Flooring Installation", date: "May 10", status: "upcoming" },
  { name: "Final Walkthrough & Handoff", date: "Jun 12", status: "upcoming" },
];

const aiActions = [
  { text: "Flagged potential 3-day delay on drywall delivery", time: "2 hours ago" },
  { text: "Auto-scheduled plumbing inspection for Apr 18", time: "Yesterday" },
  { text: "Sent budget alert: electrical costs 8% over estimate", time: "2 days ago" },
];

const tasks = [
  {
    phase: "Pre-Construction",
    items: [
      { name: "Site survey & measurements", assignee: "MR", due: "Mar 2", priority: "High", status: "Completed", checked: true },
      { name: "Obtain building permits", assignee: "MR", due: "Mar 5", priority: "High", status: "Completed", checked: true },
      { name: "Demolition of existing interior", assignee: "KL", due: "Mar 8", priority: "Medium", status: "Completed", checked: true },
    ],
  },
  {
    phase: "Rough-In",
    items: [
      { name: "Electrical rough-in wiring", assignee: "DP", due: "Apr 5", priority: "High", status: "Completed", checked: true },
      { name: "Plumbing rough-in", assignee: "JT", due: "Apr 10", priority: "High", status: "In Progress", checked: false },
      { name: "HVAC ductwork installation", assignee: "KL", due: "Apr 15", priority: "Medium", status: "In Progress", checked: false },
      { name: "Rough-in inspection", assignee: "MR", due: "Apr 18", priority: "High", status: "Upcoming", checked: false },
    ],
  },
  {
    phase: "Finishing",
    items: [
      { name: "Drywall hanging & finishing", assignee: "KL", due: "May 1", priority: "Medium", status: "Upcoming", checked: false },
      { name: "Flooring installation", assignee: "KL", due: "May 15", priority: "Medium", status: "Upcoming", checked: false },
      { name: "Custom cabinetry install", assignee: "MR", due: "May 28", priority: "Low", status: "Upcoming", checked: false },
    ],
  },
];

const documents = [
  { name: "Floor Plan Blueprints v3", icon: Image, date: "Mar 1, 2026", size: "4.2 MB", type: "PDF" },
  { name: "Building Permit #2026-0847", icon: Shield, date: "Mar 5, 2026", size: "1.1 MB", type: "PDF" },
  { name: "General Contractor Agreement", icon: FileCheck, date: "Feb 20, 2026", size: "820 KB", type: "PDF" },
  { name: "Insurance Certificate", icon: Shield, date: "Feb 18, 2026", size: "340 KB", type: "PDF" },
  { name: "Change Order #001", icon: FilePlus, date: "Apr 2, 2026", size: "180 KB", type: "PDF" },
];

const activity = [
  { avatar: "KL", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300", text: "Completed task: Electrical rough-in wiring", time: "2 hours ago", type: "task" },
  { avatar: "AI", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300", text: "Flagged potential 3-day delay on drywall delivery — auto-notified supplier", time: "3 hours ago", type: "ai" },
  { avatar: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300", text: "Uploaded revised floor plan blueprints v3", time: "5 hours ago", type: "upload" },
  { avatar: "DP", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300", text: "Updated task status: Plumbing rough-in to In Progress", time: "Yesterday, 4:30 PM", type: "status" },
  { avatar: "AI", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300", text: "Auto-scheduled plumbing inspection for Apr 18 based on timeline analysis", time: "Yesterday, 2:15 PM", type: "ai" },
  { avatar: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300", text: "Added note: Client approved accent wall color (Sherwin-Williams SW 6244)", time: "Yesterday, 11:00 AM", type: "note" },
  { avatar: "AI", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300", text: "Sent budget alert: electrical costs trending 8% over estimate", time: "2 days ago", type: "ai" },
  { avatar: "JT", color: "bg-red-500/30 text-red-700 dark:text-red-300", text: "Completed task: Rough-in inspection passed", time: "3 days ago", type: "task" },
  { avatar: "KL", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300", text: "Uploaded insurance certificate renewal", time: "4 days ago", type: "upload" },
  { avatar: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300", text: "Approved Change Order #001 — additional outlet placements ($2,400)", time: "5 days ago", type: "status" },
  { avatar: "AI", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300", text: "Generated weekly progress report and sent to client", time: "1 week ago", type: "ai" },
  { avatar: "DP", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300", text: "Completed task: Demolition of existing interior", time: "1 week ago", type: "task" },
];

const budgetItems = [
  { category: "Materials", budgeted: 42000, actual: 38200, icon: "🧱" },
  { category: "Labor", budgeted: 48000, actual: 35600, icon: "👷" },
  { category: "Permits & Fees", budgeted: 5500, actual: 5500, icon: "📋" },
  { category: "Equipment Rental", budgeted: 12000, actual: 8900, icon: "🏗️" },
  { category: "Subcontractors", budgeted: 17500, actual: 7200, icon: "🔧" },
];

const changeOrders = [
  {
    id: "CO-001",
    description: "Additional electrical outlets in conference rooms (12 outlets, dedicated circuits)",
    amount: 2400,
    status: "Approved",
    date: "Apr 2, 2026",
  },
  {
    id: "CO-002",
    description: "Upgrade lobby flooring from LVP to natural hardwood per client request",
    amount: 4800,
    status: "Pending",
    date: "Apr 10, 2026",
  },
];

// --- Helpers ---

const priorityColors: Record<string, string> = {
  High: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  Medium: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Low: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
};

const taskStatusColors: Record<string, string> = {
  Completed: "text-emerald-600 dark:text-emerald-400",
  "In Progress": "text-amber-600 dark:text-amber-400",
  Upcoming: "text-muted-foreground",
};

function formatCurrency(n: number) {
  return "$" + n.toLocaleString();
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg border border-border px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// --- Component ---

export default function ProjectDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const budgetPercent = Math.round((project.spent / project.budget) * 100);
  const budgetTotal = budgetItems.reduce((s, b) => s + b.budgeted, 0);
  const actualTotal = budgetItems.reduce((s, b) => s + b.actual, 0);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gradient">{project.name}</h1>
              <Badge
                variant="outline"
                className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              >
                {project.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{project.client}</p>
          </div>
          <Button onClick={() => toast.info("Opening project editor...")} className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2">
            <Edit className="h-4 w-4" />
            Edit Project
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Budget</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(project.budget)}</p>
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                {formatCurrency(project.spent)} spent ({budgetPercent}%)
              </p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Timeline</p>
              <p className="mt-1 text-lg font-bold text-foreground">Mar 1 - Jun 15</p>
              <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Started Mar 1, 2026</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{project.progress}%</p>
              <Progress value={project.progress} className="mt-2 h-1.5 w-24 bg-muted/30" />
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="glass border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Team</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{project.team.length}</p>
              <p className="mt-1 text-xs text-purple-600 dark:text-purple-400">members assigned</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass overflow-x-auto border border-border bg-muted/30">
          <TabsTrigger
            value="overview"
            className="data-active:bg-indigo-600/30 data-active:text-indigo-700 dark:text-indigo-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="data-active:bg-indigo-600/30 data-active:text-indigo-700 dark:text-indigo-300"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="data-active:bg-indigo-600/30 data-active:text-indigo-700 dark:text-indigo-300"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="data-active:bg-indigo-600/30 data-active:text-indigo-700 dark:text-indigo-300"
          >
            Activity
          </TabsTrigger>
          <TabsTrigger
            value="financials"
            className="data-active:bg-indigo-600/30 data-active:text-indigo-700 dark:text-indigo-300"
          >
            Financials
          </TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW TAB ===== */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Description */}
          <Card className="glass border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Project Description</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          </Card>

          {/* Budget Burn-Down Chart */}
          <Card className="glass border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Budget Burn-Down</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burnDownData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v / 1000}k`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planned"
                    name="Planned"
                    stroke="#6366f1"
                    fill="url(#gPlanned)"
                    strokeWidth={2}
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="Actual"
                    stroke="#f59e0b"
                    fill="url(#gActual)"
                    strokeWidth={2}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Key Milestones */}
            <Card className="glass border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Key Milestones</h2>
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.name} className="flex items-center gap-3">
                    {m.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : m.status === "in-progress" ? (
                      <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-muted-foreground/20" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          m.status === "completed"
                            ? "text-muted-foreground line-through"
                            : m.status === "in-progress"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {m.name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{m.date}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Agent Card */}
            <Card className="glass border-border p-6 border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-xl bg-amber-500/10 p-2.5">
                  <Bot className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Project Agent</h2>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Project Management Agent is monitoring this project
                  </p>
                </div>
              </div>
              <Separator className="bg-muted/30 mb-4" />
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Recent AI Actions
              </p>
              <div className="space-y-3">
                {aiActions.map((action, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{action.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TASKS TAB ===== */}
        <TabsContent value="tasks" className="mt-6 space-y-6">
          {tasks.map((group) => (
            <Card key={group.phase} className="glass border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">{group.phase}</h2>
              <div className="space-y-3">
                {group.items.map((task) => (
                  <div
                    key={task.name}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg bg-muted/20 border border-border px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    {/* Checkbox + Name row */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          task.checked
                            ? "border-emerald-500/40 bg-emerald-500/20"
                            : "border-white/20 bg-muted/30"
                        }`}
                      >
                        {task.checked && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>

                      <span
                        className={`flex-1 text-sm font-medium ${
                          task.checked ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 pl-8 sm:pl-0">
                      <Avatar className="h-6 w-6 border border-background">
                        <AvatarFallback
                          className={`text-[9px] ${
                            project.team.find((t) => t.initials === task.assignee)?.color ||
                            "bg-muted/50 text-muted-foreground/50"
                          }`}
                        >
                          {task.assignee}
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-xs text-muted-foreground w-16 text-right">{task.due}</span>

                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>

                      <span className={`text-xs font-medium w-20 text-right ${taskStatusColors[task.status]}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* ===== DOCUMENTS TAB ===== */}
        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => {
              const Icon = doc.icon;
              return (
                <Card
                  key={doc.name}
                  className="glass border-border p-5 hover:bg-muted/30 hover:border-indigo-500/20 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-indigo-500/10 p-3 shrink-0">
                      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-indigo-700 dark:text-indigo-300 transition-colors truncate">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{doc.date}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">{doc.size}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.success(`Downloading ${doc.name}...`)}
                          className="h-7 px-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-700 dark:text-indigo-300"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== ACTIVITY TAB ===== */}
        <TabsContent value="activity" className="mt-6">
          <Card className="glass border-border p-6">
            <div className="space-y-0">
              {activity.map((item, i) => (
                <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line */}
                  {i < activity.length - 1 && (
                    <div className="absolute left-[17px] top-10 h-[calc(100%-24px)] w-px bg-muted/50" />
                  )}

                  {/* Avatar */}
                  <Avatar className="h-9 w-9 shrink-0 border-2 border-background z-10">
                    <AvatarFallback className={`${item.color} text-[10px]`}>
                      {item.avatar}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ===== FINANCIALS TAB ===== */}
        <TabsContent value="financials" className="mt-6 space-y-6">
          {/* Budget Breakdown */}
          <Card className="glass border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Budget Breakdown</h2>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground text-right">Budgeted</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actual</TableHead>
                    <TableHead className="text-muted-foreground text-right">Variance</TableHead>
                    <TableHead className="text-muted-foreground w-[180px]">% Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetItems.map((item) => {
                    const variance = item.budgeted - item.actual;
                    const pctUsed = Math.round((item.actual / item.budgeted) * 100);
                    return (
                      <TableRow key={item.category} className="border-border hover:bg-muted/20">
                        <TableCell className="text-foreground font-medium">
                          {item.category}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(item.budgeted)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(item.actual)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            variance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {variance >= 0 ? "+" : ""}
                          {formatCurrency(variance)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={Math.min(pctUsed, 100)}
                              className="h-1.5 flex-1 bg-muted/30"
                            />
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {pctUsed}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Totals Row */}
                  <TableRow className="border-border hover:bg-transparent font-bold">
                    <TableCell className="text-foreground font-bold">Total</TableCell>
                    <TableCell className="text-right text-foreground font-bold">
                      {formatCurrency(budgetTotal)}
                    </TableCell>
                    <TableCell className="text-right text-foreground font-bold">
                      {formatCurrency(actualTotal)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        budgetTotal - actualTotal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      +{formatCurrency(budgetTotal - actualTotal)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={Math.round((actualTotal / budgetTotal) * 100)}
                          className="h-1.5 flex-1 bg-muted/30"
                        />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {Math.round((actualTotal / budgetTotal) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {budgetItems.map((item) => {
                const variance = item.budgeted - item.actual;
                const pctUsed = Math.round((item.actual / item.budgeted) * 100);
                return (
                  <div key={item.category} className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">{item.category}</p>
                      <span className="text-xs text-muted-foreground">{pctUsed}%</span>
                    </div>
                    <Progress value={Math.min(pctUsed, 100)} className="h-1.5 bg-muted/30" />
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground">Budget: </span>
                        <span className="text-foreground">{formatCurrency(item.budgeted)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Actual: </span>
                        <span className="text-foreground">{formatCurrency(item.actual)}</span>
                      </div>
                    </div>
                    <p className={`text-sm font-medium ${variance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {variance >= 0 ? "+" : ""}{formatCurrency(variance)} variance
                    </p>
                  </div>
                );
              })}
              {/* Total card */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <p className="text-sm font-bold text-foreground">Total</p>
                <Progress value={Math.round((actualTotal / budgetTotal) * 100)} className="h-1.5 bg-muted/30" />
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Budget: </span>
                    <span className="font-bold text-foreground">{formatCurrency(budgetTotal)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actual: </span>
                    <span className="font-bold text-foreground">{formatCurrency(actualTotal)}</span>
                  </div>
                </div>
                <p className={`text-sm font-bold ${budgetTotal - actualTotal >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  +{formatCurrency(budgetTotal - actualTotal)} variance
                </p>
              </div>
            </div>
          </Card>

          {/* Change Orders */}
          <Card className="glass border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Orders</h2>
            <div className="space-y-4">
              {changeOrders.map((co) => (
                <div
                  key={co.id}
                  className="rounded-lg border border-border bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{co.id}</span>
                      <Badge
                        variant="outline"
                        className={
                          co.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        }
                      >
                        {co.status}
                      </Badge>
                    </div>
                    <span className="text-lg font-bold text-foreground">
                      +{formatCurrency(co.amount)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{co.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">{co.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
