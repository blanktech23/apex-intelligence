"use client";

import { useState } from "react";
import {
  Target,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  CalendarDays,
  TrendingUp,
  MessageSquare,
  Link2,
  Users,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Types ---

type GoalStatus = "on_track" | "off_track" | "at_risk" | "complete";
type Quarter = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026";

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface ActivityEntry {
  date: string;
  text: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  owner: { name: string; initials: string; color: string };
  team: string;
  status: GoalStatus;
  progress: number;
  dueDate: string;
  quarter: Quarter;
  milestones: Milestone[];
  relatedKpis: string[];
  activity: ActivityEntry[];
}

// --- Config ---

const statusConfig: Record<
  GoalStatus,
  { label: string; dot: string; badge: string; icon: typeof CheckCircle2 }
> = {
  on_track: {
    label: "On Track",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: TrendingUp,
  },
  off_track: {
    label: "Off Track",
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: AlertTriangle,
  },
  at_risk: {
    label: "At Risk",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: AlertTriangle,
  },
  complete: {
    label: "Complete",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

const teamOptions = ["All", "Sales", "Operations", "Design", "Finance", "Leadership"];
const ownerOptions = ["All", "Marcus Rivera", "Sarah Chen", "David Park", "Lisa Torres", "Kevin Wu", "Amy Foster"];
const statusOptions: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "On Track", value: "on_track" },
  { label: "Off Track", value: "off_track" },
  { label: "At Risk", value: "at_risk" },
  { label: "Complete", value: "complete" },
];

// --- Mock Data ---

const mockGoals: Goal[] = [
  {
    id: "goal-001",
    title: "Increase revenue to $2.5M",
    description:
      "Drive quarterly revenue growth through new project acquisition, upselling existing clients, and improving close rates on estimates.",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Sales",
    status: "on_track",
    progress: 72,
    dueDate: "2026-03-31",
    quarter: "Q1 2026",
    milestones: [
      { id: "m1", title: "Close 5 new projects over $50K", dueDate: "2026-01-31", completed: true },
      { id: "m2", title: "Increase close rate to 35%", dueDate: "2026-02-15", completed: true },
      { id: "m3", title: "Launch referral incentive program", dueDate: "2026-02-28", completed: true },
      { id: "m4", title: "Upsell 3 existing clients on add-ons", dueDate: "2026-03-15", completed: false },
      { id: "m5", title: "Hit $2.5M cumulative revenue", dueDate: "2026-03-31", completed: false },
    ],
    relatedKpis: ["Revenue", "Close Rate", "Average Project Value"],
    activity: [
      { date: "2026-03-10", text: "Progress updated to 72% - referral program launched" },
      { date: "2026-02-15", text: "Status changed from At Risk to On Track" },
      { date: "2026-01-15", text: "Goal created by Marcus Rivera" },
    ],
  },
  {
    id: "goal-002",
    title: "Reduce project delivery time by 20%",
    description:
      "Streamline operations workflows and reduce average project delivery time from 45 days to 36 days through better scheduling and AI-assisted coordination.",
    owner: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    status: "at_risk",
    progress: 40,
    dueDate: "2026-03-31",
    quarter: "Q1 2026",
    milestones: [
      { id: "m1", title: "Audit current project timelines", dueDate: "2026-01-15", completed: true },
      { id: "m2", title: "Implement AI scheduling assistant", dueDate: "2026-02-01", completed: true },
      { id: "m3", title: "Reduce material ordering lead time to 3 days", dueDate: "2026-02-28", completed: false },
      { id: "m4", title: "Cross-train 2 crew members per team", dueDate: "2026-03-15", completed: false },
      { id: "m5", title: "Achieve 36-day average delivery", dueDate: "2026-03-31", completed: false },
    ],
    relatedKpis: ["Average Delivery Time", "On-Time Completion Rate"],
    activity: [
      { date: "2026-03-08", text: "Status changed to At Risk - material delays impacting timeline" },
      { date: "2026-02-01", text: "AI scheduling assistant deployed" },
      { date: "2026-01-10", text: "Goal created by Sarah Chen" },
    ],
  },
  {
    id: "goal-003",
    title: "Achieve 95% customer satisfaction score",
    description:
      "Improve customer communication and project transparency to achieve a 95% or higher satisfaction rating on post-project surveys.",
    owner: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    team: "Sales",
    status: "on_track",
    progress: 85,
    dueDate: "2026-03-31",
    quarter: "Q1 2026",
    milestones: [
      { id: "m1", title: "Implement weekly client update emails", dueDate: "2026-01-15", completed: true },
      { id: "m2", title: "Launch client portal for project tracking", dueDate: "2026-02-01", completed: true },
      { id: "m3", title: "Train team on communication protocols", dueDate: "2026-02-15", completed: true },
      { id: "m4", title: "Achieve 90% survey response rate", dueDate: "2026-03-15", completed: true },
      { id: "m5", title: "Reach 95% satisfaction score", dueDate: "2026-03-31", completed: false },
    ],
    relatedKpis: ["Customer Satisfaction", "NPS Score"],
    activity: [
      { date: "2026-03-12", text: "Current satisfaction score at 93.5% - trending upward" },
      { date: "2026-02-01", text: "Client portal launched successfully" },
    ],
  },
  {
    id: "goal-004",
    title: "Reduce material waste by 15%",
    description:
      "Implement better material estimation, ordering processes, and on-site waste management to reduce material costs and environmental impact.",
    owner: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Operations",
    status: "off_track",
    progress: 20,
    dueDate: "2026-03-31",
    quarter: "Q1 2026",
    milestones: [
      { id: "m1", title: "Baseline current waste metrics", dueDate: "2026-01-31", completed: true },
      { id: "m2", title: "Implement AI material estimation", dueDate: "2026-02-28", completed: false },
      { id: "m3", title: "Set up material recycling program", dueDate: "2026-03-15", completed: false },
      { id: "m4", title: "Achieve 15% reduction", dueDate: "2026-03-31", completed: false },
    ],
    relatedKpis: ["Material Cost %", "Waste Reduction"],
    activity: [
      { date: "2026-03-05", text: "Status changed to Off Track - AI estimation tool delayed" },
      { date: "2026-01-31", text: "Baseline metrics completed: 12% waste rate" },
    ],
  },
  {
    id: "goal-005",
    title: "Hire and onboard 3 new team members",
    description:
      "Expand the team with a project coordinator, senior carpenter, and design assistant to support growing project volume.",
    owner: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    team: "Leadership",
    status: "complete",
    progress: 100,
    dueDate: "2026-03-31",
    quarter: "Q1 2026",
    milestones: [
      { id: "m1", title: "Post job listings on 3 platforms", dueDate: "2026-01-15", completed: true },
      { id: "m2", title: "Complete interview rounds", dueDate: "2026-02-15", completed: true },
      { id: "m3", title: "Extend offers and finalize hiring", dueDate: "2026-02-28", completed: true },
      { id: "m4", title: "Complete 2-week onboarding program", dueDate: "2026-03-15", completed: true },
    ],
    relatedKpis: ["Team Size", "Capacity Utilization"],
    activity: [
      { date: "2026-03-15", text: "All 3 hires completed onboarding - goal marked complete" },
      { date: "2026-02-28", text: "All offers accepted" },
      { date: "2026-01-10", text: "Goal created by Kevin Wu" },
    ],
  },
  {
    id: "goal-006",
    title: "Launch kitchen & bath design tool MVP",
    description:
      "Build and deploy the first version of the AI-powered kitchen and bathroom design visualization tool for client presentations.",
    owner: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Design",
    status: "on_track",
    progress: 60,
    dueDate: "2026-06-30",
    quarter: "Q2 2026",
    milestones: [
      { id: "m1", title: "Complete UI wireframes and prototype", dueDate: "2026-04-15", completed: false },
      { id: "m2", title: "Integrate 3D rendering engine", dueDate: "2026-05-01", completed: false },
      { id: "m3", title: "Beta test with 3 clients", dueDate: "2026-05-31", completed: false },
      { id: "m4", title: "Launch MVP", dueDate: "2026-06-30", completed: false },
    ],
    relatedKpis: ["Design Tool Adoption", "Client Engagement"],
    activity: [
      { date: "2026-03-12", text: "Prototype designs 60% complete" },
      { date: "2026-03-01", text: "Goal created by Amy Foster" },
    ],
  },
  {
    id: "goal-007",
    title: "Establish partnership with 2 major suppliers",
    description:
      "Negotiate volume discount agreements with at least 2 major material suppliers to reduce costs by 8-12% across lumber and fixtures.",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Finance",
    status: "on_track",
    progress: 50,
    dueDate: "2026-06-30",
    quarter: "Q2 2026",
    milestones: [
      { id: "m1", title: "Identify top 5 supplier candidates", dueDate: "2026-04-15", completed: false },
      { id: "m2", title: "Submit RFPs and negotiate terms", dueDate: "2026-05-15", completed: false },
      { id: "m3", title: "Sign agreements with 2 suppliers", dueDate: "2026-06-15", completed: false },
      { id: "m4", title: "Validate first discounted orders", dueDate: "2026-06-30", completed: false },
    ],
    relatedKpis: ["Material Cost %", "Gross Margin"],
    activity: [
      { date: "2026-03-10", text: "Initial supplier research underway" },
    ],
  },
];

const quarters: Quarter[] = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

// --- Component ---

export default function GoalsPage() {
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q1 2026");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filtered = mockGoals.filter((g) => {
    if (g.quarter !== activeQuarter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !g.title.toLowerCase().includes(q) &&
        !g.owner.name.toLowerCase().includes(q)
      )
        return false;
    }
    if (teamFilter !== "All" && g.team !== teamFilter) return false;
    if (ownerFilter !== "All" && g.owner.name !== ownerFilter) return false;
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    return true;
  });

  const quarterStats = {
    total: mockGoals.filter((g) => g.quarter === activeQuarter).length,
    onTrack: mockGoals.filter((g) => g.quarter === activeQuarter && g.status === "on_track").length,
    atRisk: mockGoals.filter((g) => g.quarter === activeQuarter && g.status === "at_risk").length,
    offTrack: mockGoals.filter((g) => g.quarter === activeQuarter && g.status === "off_track").length,
    complete: mockGoals.filter((g) => g.quarter === activeQuarter && g.status === "complete").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Goals & Milestones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track quarterly goals and milestone progress
          </p>
        </div>
        <Button
          className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2"
          onClick={() => toast.success("Goal created successfully")}
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Quarter Tabs */}
      <div className="glass rounded-xl p-1.5 inline-flex gap-1">
        {quarters.map((q) => (
          <button
            key={q}
            onClick={() => setActiveQuarter(q)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeQuarter === q
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: quarterStats.total, color: "text-foreground" },
          { label: "On Track", value: quarterStats.onTrack, color: "text-emerald-400" },
          { label: "At Risk", value: quarterStats.atRisk, color: "text-amber-400" },
          { label: "Off Track", value: quarterStats.offTrack, color: "text-red-400" },
          { label: "Complete", value: quarterStats.complete, color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold tabular-nums" style={{ color: "inherit" }}>
              <span className={s.color}>{s.value}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        {/* Team filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "team" ? null : "team")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              teamFilter !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{teamFilter === "All" ? "Team" : teamFilter}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "team" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "team" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {teamOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setTeamFilter(opt); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    teamFilter === opt ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Owner filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "owner" ? null : "owner")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              ownerFilter !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{ownerFilter === "All" ? "Owner" : ownerFilter}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "owner" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "owner" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[200px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {ownerOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setOwnerFilter(opt); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    ownerFilter === opt ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "status" ? null : "status")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              statusFilter !== "all"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>{statusFilter === "all" ? "Status" : statusOptions.find((s) => s.value === statusFilter)?.label}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "status" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setStatusFilter(opt.value); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    statusFilter === opt.value ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Goals list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No goals match the current filters.</p>
          </div>
        ) : (
          filtered.map((goal) => {
            const config = statusConfig[goal.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedGoal === goal.id;
            const completedMilestones = goal.milestones.filter((m) => m.completed).length;

            return (
              <div
                key={goal.id}
                className="rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden transition-all"
              >
                {/* Card header */}
                <button
                  onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  className="w-full text-left p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Expand chevron */}
                    <div className="mt-1 shrink-0">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{goal.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Owner */}
                            <div className="flex items-center gap-1.5">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className={`${goal.owner.color} text-[8px]`}>
                                  {goal.owner.initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{goal.owner.name}</span>
                            </div>
                            {/* Team */}
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                              {goal.team}
                            </Badge>
                            {/* Milestones */}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              {completedMilestones}/{goal.milestones.length} milestones
                            </span>
                            {/* Due date */}
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(goal.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <Badge variant="outline" className={`${config.badge} shrink-0`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Progress</span>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {goal.progress}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-[rgba(255,255,255,0.06)] px-5 pb-5">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 pt-5">
                      {/* Milestones column */}
                      <div className="lg:col-span-2 space-y-4">
                        {/* Description */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Description
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{goal.description}</p>
                        </div>

                        <Separator className="bg-[rgba(255,255,255,0.06)]" />

                        {/* Milestones */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Milestones
                          </h4>
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-center gap-3 rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2.5"
                              >
                                <div
                                  className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center ${
                                    milestone.completed
                                      ? "bg-emerald-500/20 border-emerald-500/40"
                                      : "border-[rgba(255,255,255,0.15)]"
                                  }`}
                                >
                                  {milestone.completed && (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  )}
                                </div>
                                <span
                                  className={`text-sm flex-1 ${
                                    milestone.completed ? "text-muted-foreground line-through" : "text-foreground"
                                  }`}
                                >
                                  {milestone.title}
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Sidebar column */}
                      <div className="space-y-4">
                        {/* Related KPIs */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Related KPIs
                          </h4>
                          <div className="space-y-1.5">
                            {goal.relatedKpis.map((kpi) => (
                              <div
                                key={kpi}
                                className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors"
                              >
                                <Link2 className="h-3 w-3" />
                                {kpi}
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-[rgba(255,255,255,0.06)]" />

                        {/* Activity log */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Activity
                          </h4>
                          <div className="space-y-2.5">
                            {goal.activity.map((entry, i) => (
                              <div key={i} className="flex gap-2">
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                                <div>
                                  <p className="text-xs text-muted-foreground">{entry.text}</p>
                                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                    {new Date(entry.date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-[rgba(255,255,255,0.06)]" />

                        {/* Comments placeholder */}
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Comments
                          </h4>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Add a comment...
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
