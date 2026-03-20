"use client";

import { useState } from "react";
import {
  ListChecks,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  CalendarDays,
  Users,
  AlertTriangle,
  ChevronDown,
  RotateCcw,
  MessageSquare,
  CircleAlert,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// --- Types ---

type ActionSource = "meeting" | "issue" | "manual";
type ActionTab = "due_this_week" | "overdue" | "all_open" | "completed";

interface ActionItem {
  id: string;
  description: string;
  owner: { name: string; initials: string; color: string };
  team: string;
  dueDate: string;
  createdDate: string;
  completed: boolean;
  source: ActionSource;
  carriedForward: boolean;
}

// --- Config ---

const sourceConfig: Record<ActionSource, { label: string; badge: string }> = {
  meeting: { label: "From Meeting", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  issue: { label: "From Issue", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  manual: { label: "Manual", badge: "bg-[rgba(255,255,255,0.06)] text-muted-foreground border-[rgba(255,255,255,0.1)]" },
};

const tabItems: { label: string; value: ActionTab }[] = [
  { label: "Due This Week", value: "due_this_week" },
  { label: "Overdue", value: "overdue" },
  { label: "All Open", value: "all_open" },
  { label: "Completed", value: "completed" },
];

// --- Helpers ---

function getDueStatus(dateStr: string, completed: boolean): "overdue" | "due_this_week" | "upcoming" | "completed" {
  if (completed) return "completed";
  const due = new Date(dateStr);
  const now = new Date("2026-03-14");
  const endOfWeek = new Date("2026-03-20");
  if (due < now) return "overdue";
  if (due <= endOfWeek) return "due_this_week";
  return "upcoming";
}

function getDueDateColor(dateStr: string, completed: boolean): string {
  if (completed) return "text-muted-foreground";
  const status = getDueStatus(dateStr, completed);
  if (status === "overdue") return "text-red-400";
  if (status === "due_this_week") return "text-amber-400";
  return "text-muted-foreground";
}

// --- Mock Data ---

const mockActions: ActionItem[] = [
  {
    id: "act-001",
    description: "Follow up with Henderson client on revised kitchen estimate",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Sales",
    dueDate: "2026-03-14",
    createdDate: "2026-03-10",
    completed: false,
    source: "meeting",
    carriedForward: false,
  },
  {
    id: "act-002",
    description: "Schedule safety training for new hires - Kevin and Jake",
    owner: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    team: "Operations",
    dueDate: "2026-03-12",
    createdDate: "2026-03-05",
    completed: false,
    source: "issue",
    carriedForward: true,
  },
  {
    id: "act-003",
    description: "Review and update material cost spreadsheet with Q1 actuals",
    owner: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Finance",
    dueDate: "2026-03-15",
    createdDate: "2026-03-10",
    completed: false,
    source: "meeting",
    carriedForward: false,
  },
  {
    id: "act-004",
    description: "Send weekly progress photos to Riverside Office client",
    owner: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    dueDate: "2026-03-14",
    createdDate: "2026-03-12",
    completed: false,
    source: "manual",
    carriedForward: false,
  },
  {
    id: "act-005",
    description: "Get quotes from 3 expediter services for downtown permits",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Operations",
    dueDate: "2026-03-17",
    createdDate: "2026-03-10",
    completed: false,
    source: "issue",
    carriedForward: false,
  },
  {
    id: "act-006",
    description: "Finalize standardized estimate template v2",
    owner: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Design",
    dueDate: "2026-03-19",
    createdDate: "2026-03-11",
    completed: false,
    source: "issue",
    carriedForward: false,
  },
  {
    id: "act-007",
    description: "Call lumber supplier about extended lead times - get written commitment",
    owner: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    dueDate: "2026-03-11",
    createdDate: "2026-03-07",
    completed: false,
    source: "meeting",
    carriedForward: true,
  },
  {
    id: "act-008",
    description: "Set up mid-design check-in template for client communications",
    owner: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    team: "Sales",
    dueDate: "2026-03-18",
    createdDate: "2026-03-12",
    completed: false,
    source: "issue",
    carriedForward: false,
  },
  {
    id: "act-009",
    description: "Order replacement fixtures for Harbor View project - priority shipping",
    owner: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Operations",
    dueDate: "2026-03-13",
    createdDate: "2026-03-10",
    completed: false,
    source: "manual",
    carriedForward: false,
  },
  {
    id: "act-010",
    description: "Prepare Q1 profitability report for leadership review",
    owner: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Finance",
    dueDate: "2026-03-21",
    createdDate: "2026-03-12",
    completed: false,
    source: "meeting",
    carriedForward: false,
  },
  {
    id: "act-011",
    description: "Update crew scheduling board with new hires' availability",
    owner: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    team: "Operations",
    dueDate: "2026-03-10",
    createdDate: "2026-03-03",
    completed: true,
    source: "meeting",
    carriedForward: false,
  },
  {
    id: "act-012",
    description: "Send revised scope of work to Summit Builders for approval",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Sales",
    dueDate: "2026-03-08",
    createdDate: "2026-03-05",
    completed: true,
    source: "manual",
    carriedForward: false,
  },
  {
    id: "act-013",
    description: "Deploy end-of-shift safety checklist to all job sites",
    owner: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    team: "Operations",
    dueDate: "2026-03-07",
    createdDate: "2026-03-03",
    completed: true,
    source: "issue",
    carriedForward: false,
  },
  {
    id: "act-014",
    description: "Review design tool wireframes with Lisa before client preview",
    owner: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Design",
    dueDate: "2026-03-20",
    createdDate: "2026-03-14",
    completed: false,
    source: "manual",
    carriedForward: false,
  },
  {
    id: "act-015",
    description: "Negotiate bulk pricing with tile supplier for Q2 projects",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Finance",
    dueDate: "2026-03-25",
    createdDate: "2026-03-12",
    completed: false,
    source: "meeting",
    carriedForward: false,
  },
];

// --- Component ---

export default function ActionsPage() {
  const [activeTab, setActiveTab] = useState<ActionTab>("all_open");
  const [searchQuery, setSearchQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(mockActions.filter((a) => a.completed).map((a) => a.id))
  );

  const toggleComplete = (id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        toast.success("Action item completed");
      }
      return next;
    });
  };

  const isCompleted = (id: string) => completedItems.has(id);

  const filtered = mockActions.filter((item) => {
    const completed = isCompleted(item.id);
    const dueStatus = getDueStatus(item.dueDate, completed);

    // Tab filter
    switch (activeTab) {
      case "due_this_week":
        if (dueStatus !== "due_this_week") return false;
        break;
      case "overdue":
        if (dueStatus !== "overdue") return false;
        break;
      case "all_open":
        if (completed) return false;
        break;
      case "completed":
        if (!completed) return false;
        break;
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !item.description.toLowerCase().includes(q) &&
        !item.owner.name.toLowerCase().includes(q)
      )
        return false;
    }

    // Filters
    if (ownerFilter !== "All" && item.owner.name !== ownerFilter) return false;
    if (teamFilter !== "All" && item.team !== teamFilter) return false;
    if (sourceFilter !== "All") {
      const sMap: Record<string, ActionSource> = {
        Meeting: "meeting",
        Issue: "issue",
        Manual: "manual",
      };
      if (item.source !== sMap[sourceFilter]) return false;
    }

    return true;
  });

  const tabCounts = {
    due_this_week: mockActions.filter((a) => getDueStatus(a.dueDate, isCompleted(a.id)) === "due_this_week").length,
    overdue: mockActions.filter((a) => getDueStatus(a.dueDate, isCompleted(a.id)) === "overdue").length,
    all_open: mockActions.filter((a) => !isCompleted(a.id)).length,
    completed: mockActions.filter((a) => isCompleted(a.id)).length,
  };

  const ownerOptions = ["All", ...Array.from(new Set(mockActions.map((a) => a.owner.name)))];
  const teamOptions = ["All", ...Array.from(new Set(mockActions.map((a) => a.team)))];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Action Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track tasks, to-dos, and follow-ups across your team
          </p>
        </div>
        <Button
          className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2"
          onClick={() => toast.success("Action item created successfully")}
        >
          <Plus className="h-4 w-4" />
          Add Action Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Due This Week", value: tabCounts.due_this_week, color: "text-amber-400", icon: Clock },
          { label: "Overdue", value: tabCounts.overdue, color: "text-red-400", icon: AlertTriangle },
          { label: "Open", value: tabCounts.all_open, color: "text-foreground", icon: ListChecks },
          { label: "Completed", value: tabCounts.completed, color: "text-emerald-400", icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 tabular-nums ${s.color}`}>{s.value}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-2.5">
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-1.5 inline-flex gap-1">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.value
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)]"
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-[rgba(255,255,255,0.08)] text-muted-foreground"
              }`}
            >
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search action items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        {/* Owner */}
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

        {/* Team */}
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
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
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

        {/* Source */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "source" ? null : "source")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              sourceFilter !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>{sourceFilter === "All" ? "Source" : sourceFilter}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "source" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "source" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {["All", "Meeting", "Issue", "Manual"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSourceFilter(opt); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    sourceFilter === opt ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action items list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No action items match the current filters.</p>
          </div>
        ) : (
          filtered.map((item) => {
            const completed = isCompleted(item.id);
            const sConfig = sourceConfig[item.source];
            const dueDateColor = getDueDateColor(item.dueDate, completed);
            const dueStatus = getDueStatus(item.dueDate, completed);

            return (
              <div
                key={item.id}
                className={`rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl p-4 hover:bg-[rgba(255,255,255,0.07)] transition-all ${
                  completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(item.id)}
                    className={`mt-0.5 h-5 w-5 rounded border shrink-0 flex items-center justify-center transition-all ${
                      completed
                        ? "bg-emerald-500/20 border-emerald-500/40"
                        : "border-[rgba(255,255,255,0.2)] hover:border-indigo-500/50"
                    }`}
                  >
                    {completed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Owner */}
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className={`${item.owner.color} text-[7px]`}>
                            {item.owner.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] text-muted-foreground">{item.owner.name}</span>
                      </div>
                      {/* Due date */}
                      <span className={`text-[11px] flex items-center gap-1 ${dueDateColor}`}>
                        <CalendarDays className="h-3 w-3" />
                        {dueStatus === "overdue" && !completed && "Overdue: "}
                        {new Date(item.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {/* Source badge */}
                      <Badge variant="outline" className={`${sConfig.badge} text-[10px] px-1.5 py-0 h-4`}>
                        {sConfig.label}
                      </Badge>
                      {/* Team badge */}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                        {item.team}
                      </Badge>
                      {/* Carried forward */}
                      {item.carriedForward && !completed && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Carried Forward
                        </span>
                      )}
                      {/* Created date */}
                      <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created {new Date(item.createdDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
