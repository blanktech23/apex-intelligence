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
  X,
  Link2,
  Repeat,
  Share2,
  MoreHorizontal,
  ArrowRight,
  Flag,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// --- Types ---

type ActionSource = "meeting" | "issue" | "manual";
type ActionTab = "due_this_week" | "overdue" | "all_open" | "completed";
type RecurrenceFrequency = "daily" | "weekly" | "monthly";

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
  carryCount: number;
  isRecurring: boolean;
  recurrence?: RecurrenceFrequency;
  linkedTo?: { type: "rock" | "issue"; name: string };
}

// --- Config ---

const sourceConfig: Record<ActionSource, { label: string; badge: string }> = {
  meeting: { label: "From Meeting", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  issue: { label: "From Issue", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  manual: { label: "Manual", badge: "bg-muted/50 text-muted-foreground border-border" },
};

const tabItems: { label: string; value: ActionTab }[] = [
  { label: "Due This Week", value: "due_this_week" },
  { label: "Overdue", value: "overdue" },
  { label: "All Open", value: "all_open" },
  { label: "Completed", value: "completed" },
];

const ownerOptions = [
  { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
  { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
  { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
  { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
  { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
  { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
];

const teamOptionsList = ["Sales", "Operations", "Finance", "Design"];

const mockRocks = [
  { type: "rock" as const, name: "Increase Q1 Close Rate to 40%" },
  { type: "rock" as const, name: "Launch Client Portal v2" },
  { type: "rock" as const, name: "Hire 3 Senior Installers" },
];
const mockIssues = [
  { type: "issue" as const, name: "Permit delays on downtown projects" },
  { type: "issue" as const, name: "Lumber supplier lead time uncertainty" },
  { type: "issue" as const, name: "Client communication gaps mid-project" },
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

const initialActions: ActionItem[] = [
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 2,
    isRecurring: false,
    linkedTo: { type: "issue", name: "Safety training backlog" },
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: true,
    recurrence: "weekly",
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
    carryCount: 0,
    isRecurring: false,
    linkedTo: { type: "issue", name: "Permit delays on downtown projects" },
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
    carryCount: 0,
    isRecurring: false,
    linkedTo: { type: "rock", name: "Increase Q1 Close Rate to 40%" },
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
    carryCount: 1,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
    linkedTo: { type: "rock", name: "Launch Client Portal v2" },
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
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
    carryCount: 0,
    isRecurring: false,
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
  const [actions, setActions] = useState<ActionItem[]>(initialActions);
  const [completedItems, setCompletedItems] = useState<Set<string>>(
    new Set(initialActions.filter((a) => a.completed).map((a) => a.id))
  );
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCascadeModal, setShowCascadeModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Cascade checkboxes
  const [cascadeTeams, setCascadeTeams] = useState<Set<string>>(new Set());

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newOwner, setNewOwner] = useState(ownerOptions[0].name);
  const [newTeam, setNewTeam] = useState("Sales");
  const [newDueDate, setNewDueDate] = useState("2026-03-21");
  const [newRecurring, setNewRecurring] = useState(false);
  const [newRecurrence, setNewRecurrence] = useState<RecurrenceFrequency>("weekly");

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

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const carryForward = (id: string) => {
    setActions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newDue = new Date(item.dueDate);
          newDue.setDate(newDue.getDate() + 7);
          toast.success(`Carried forward to ${newDue.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
          return {
            ...item,
            dueDate: newDue.toISOString().split("T")[0],
            carriedForward: true,
            carryCount: item.carryCount + 1,
          };
        }
        return item;
      })
    );
  };

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    const owner = ownerOptions.find((o) => o.name === newOwner) || ownerOptions[0];
    const newAction: ActionItem = {
      id: `act-${Date.now()}`,
      description: newTitle,
      owner: { name: owner.name, initials: owner.initials, color: owner.color },
      team: newTeam,
      dueDate: newDueDate,
      createdDate: "2026-03-14",
      completed: false,
      source: "manual",
      carriedForward: false,
      carryCount: 0,
      isRecurring: newRecurring,
      recurrence: newRecurring ? newRecurrence : undefined,
    };
    setActions((prev) => [newAction, ...prev]);
    toast.success("Action item created successfully");
    setShowCreateModal(false);
    setNewTitle("");
    setNewDescription("");
    setNewRecurring(false);
  };

  const handleBatchComplete = () => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      selectedItems.forEach((id) => next.add(id));
      return next;
    });
    toast.success(`${selectedItems.size} items marked as completed`);
    setSelectedItems(new Set());
  };

  const handleBatchReassign = (newOwnerName: string) => {
    const owner = ownerOptions.find((o) => o.name === newOwnerName);
    if (!owner) return;
    setActions((prev) =>
      prev.map((item) => {
        if (selectedItems.has(item.id)) {
          return { ...item, owner: { name: owner.name, initials: owner.initials, color: owner.color } };
        }
        return item;
      })
    );
    toast.success(`${selectedItems.size} items reassigned to ${newOwnerName}`);
    setSelectedItems(new Set());
    setShowReassignModal(false);
  };

  const handleBatchDateChange = (newDate: string) => {
    setActions((prev) =>
      prev.map((item) => {
        if (selectedItems.has(item.id)) {
          return { ...item, dueDate: newDate };
        }
        return item;
      })
    );
    toast.success(`Due date updated for ${selectedItems.size} items`);
    setSelectedItems(new Set());
    setShowDateModal(false);
  };

  const handleLinkItem = (linkedItem: { type: "rock" | "issue"; name: string }) => {
    if (!activeItemId) return;
    setActions((prev) =>
      prev.map((item) => {
        if (item.id === activeItemId) {
          return { ...item, linkedTo: linkedItem };
        }
        return item;
      })
    );
    toast.success(`Linked to ${linkedItem.type}: ${linkedItem.name}`);
    setShowLinkModal(false);
    setActiveItemId(null);
  };

  const filtered = actions.filter((item) => {
    const completed = isCompleted(item.id);
    const dueStatus = getDueStatus(item.dueDate, completed);

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

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !item.description.toLowerCase().includes(q) &&
        !item.owner.name.toLowerCase().includes(q)
      )
        return false;
    }

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
    due_this_week: actions.filter((a) => getDueStatus(a.dueDate, isCompleted(a.id)) === "due_this_week").length,
    overdue: actions.filter((a) => getDueStatus(a.dueDate, isCompleted(a.id)) === "overdue").length,
    all_open: actions.filter((a) => !isCompleted(a.id)).length,
    completed: actions.filter((a) => isCompleted(a.id)).length,
  };

  const ownerFilterOptions = ["All", ...Array.from(new Set(actions.map((a) => a.owner.name)))];
  const teamFilterOptions = ["All", ...Array.from(new Set(actions.map((a) => a.team)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Action Items</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track tasks, to-dos, and follow-ups across your team
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-sm border-border bg-muted/30 hover:bg-muted/50"
            onClick={() => setShowCascadeModal(true)}
          >
            <Share2 className="h-4 w-4" />
            Cascade
          </Button>
          <Button
            className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            New To-Do
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedItems.size > 0 && (
        <div className="glass rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {selectedItems.size} selected
          </span>
          <div className="h-4 w-px bg-foreground/10" />
          <button
            onClick={handleBatchComplete}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Complete All
          </button>
          <button
            onClick={() => setShowReassignModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-600/30 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Reassign
          </button>
          <button
            onClick={() => setShowDateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-600/30 transition-colors"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Change Due Date
          </button>
          <button
            onClick={() => setSelectedItems(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

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
      <div className="glass rounded-xl p-1.5">
        <div className="flex flex-wrap gap-1">
        {tabItems.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2 ${
              activeTab === tab.value
                ? "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            {tab.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? "bg-foreground/20 text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {tabCounts[tab.value]}
            </span>
          </button>
        ))}
        </div>
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
              {ownerFilterOptions.map((opt) => (
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
              {teamFilterOptions.map((opt) => (
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
            const isSelected = selectedItems.has(item.id);

            return (
              <div
                key={item.id}
                className={`rounded-xl bg-card border transition-all ${
                  isSelected
                    ? "border-indigo-500/40 bg-indigo-500/[0.06]"
                    : "border-border hover:bg-muted/50"
                } backdrop-blur-xl p-4 ${completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-3">
                  {/* Select checkbox */}
                  {!completed && (
                    <button
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Select: ${item.description}`}
                      onClick={() => toggleSelect(item.id)}
                      className={`mt-0.5 h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-indigo-500/30 border-indigo-500/50"
                          : "border-foreground/15 hover:border-indigo-500/30"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3 w-3 text-indigo-400" />}
                    </button>
                  )}

                  {/* Completion checkbox */}
                  <button
                    role="checkbox"
                    aria-checked={completed}
                    aria-label={`Mark ${completed ? "incomplete" : "complete"}: ${item.description}`}
                    onClick={() => toggleComplete(item.id)}
                    className={`mt-0.5 h-5 w-5 rounded border shrink-0 flex items-center justify-center transition-all ${
                      completed
                        ? "bg-emerald-500/20 border-emerald-500/40"
                        : "border-foreground/20 hover:border-indigo-500/50"
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
                      <span className={`text-[11px] flex items-center gap-1 ${dueDateColor}`} suppressHydrationWarning>
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
                      {/* Recurring badge */}
                      {item.isRecurring && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                          <Repeat className="h-2.5 w-2.5 mr-0.5" />
                          {item.recurrence}
                        </Badge>
                      )}
                      {/* Linked item badge */}
                      {item.linkedTo && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                          <Link2 className="h-2.5 w-2.5 mr-0.5" />
                          {item.linkedTo.type === "rock" ? "Rock" : "Issue"}
                        </Badge>
                      )}
                      {/* Carried forward */}
                      {item.carriedForward && !completed && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          <RotateCcw className="h-3 w-3" />
                          Carried Forward
                          {item.carryCount > 1 && (
                            <span className="bg-amber-500/20 text-amber-400 rounded-full px-1 text-[9px] font-bold">
                              x{item.carryCount}
                            </span>
                          )}
                        </span>
                      )}
                      {/* Created date */}
                      <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1" suppressHydrationWarning>
                        <Clock className="h-3 w-3" />
                        Created {new Date(item.createdDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {!completed && (
                    <div className="flex items-center gap-1 shrink-0">
                      {dueStatus === "overdue" && (
                        <button
                          onClick={() => carryForward(item.id)}
                          className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Carry Forward"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => { setActiveItemId(item.id); setShowLinkModal(true); }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        title="Link to Rock/Issue"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create To-Do Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">New To-Do</h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="bg-muted/30 border-border"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full rounded-lg bg-muted/30 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Owner</label>
                  <select
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full rounded-lg bg-muted/30 border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    {ownerOptions.map((o) => (
                      <option key={o.name} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Team</label>
                  <select
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full rounded-lg bg-muted/30 border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    {teamOptionsList.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="bg-muted/30 border-border"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewRecurring(!newRecurring)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                    newRecurring
                      ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  Recurring
                </button>
                {newRecurring && (
                  <select
                    value={newRecurrence}
                    onChange={(e) => setNewRecurrence(e.target.value as RecurrenceFrequency)}
                    className="rounded-lg bg-muted/30 border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-indigo-500 transition-colors">
                Create To-Do
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cascade Modal */}
      {showCascadeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowCascadeModal(false); setCascadeTeams(new Set()); }} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Cascade To-Dos</h2>
              <button onClick={() => { setShowCascadeModal(false); setCascadeTeams(new Set()); }} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Select teams to cascade action items to:</p>
            <div className="space-y-2">
              {["Operations", "Sales", "Finance", "HR", "Leadership"].map((team) => {
                const isChecked = cascadeTeams.has(team);
                return (
                  <label
                    key={team}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-foreground bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setCascadeTeams((prev) => {
                          const next = new Set(prev);
                          if (next.has(team)) { next.delete(team); } else { next.add(team); }
                          return next;
                        });
                      }}
                      className="h-4 w-4 rounded border-foreground/20 bg-transparent accent-indigo-500"
                    />
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {team}
                  </label>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setShowCascadeModal(false); setCascadeTeams(new Set()); }}
                className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (cascadeTeams.size === 0) {
                    toast.error("Select at least one team");
                    return;
                  }
                  const teamNames = Array.from(cascadeTeams).join(", ");
                  toast.success(`Cascaded to ${cascadeTeams.size} team${cascadeTeams.size > 1 ? "s" : ""}: ${teamNames}`);
                  setShowCascadeModal(false);
                  setCascadeTeams(new Set());
                }}
                disabled={cascadeTeams.size === 0}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors ${
                  cascadeTeams.size > 0
                    ? "bg-indigo-600 hover:bg-indigo-500"
                    : "bg-indigo-600/40 cursor-not-allowed"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" />
                  Cascade{cascadeTeams.size > 0 ? ` to ${cascadeTeams.size} Team${cascadeTeams.size > 1 ? "s" : ""}` : ""}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowLinkModal(false); setActiveItemId(null); }} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Link to Rock or Issue</h2>
              <button onClick={() => { setShowLinkModal(false); setActiveItemId(null); }} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Rocks</p>
            <div className="space-y-1.5 mb-4">
              {mockRocks.map((r) => (
                <button
                  key={r.name}
                  onClick={() => handleLinkItem(r)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <Flag className="h-3.5 w-3.5 text-green-400" />
                  {r.name}
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Issues</p>
            <div className="space-y-1.5">
              {mockIssues.map((i) => (
                <button
                  key={i.name}
                  onClick={() => handleLinkItem(i)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <CircleAlert className="h-3.5 w-3.5 text-amber-400" />
                  {i.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReassignModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Reassign {selectedItems.size} Items</h2>
              <button onClick={() => setShowReassignModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {ownerOptions.map((o) => (
                <button
                  key={o.name}
                  onClick={() => handleBatchReassign(o.name)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className={`${o.color} text-[8px]`}>{o.initials}</AvatarFallback>
                  </Avatar>
                  {o.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Change Due Date Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDateModal(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Change Due Date</h2>
              <button onClick={() => setShowDateModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Set new due date for {selectedItems.size} items:</p>
            <div className="space-y-3">
              {[
                { label: "End of this week", date: "2026-03-20" },
                { label: "End of next week", date: "2026-03-27" },
                { label: "End of month", date: "2026-03-31" },
              ].map((opt) => (
                <button
                  key={opt.date}
                  onClick={() => handleBatchDateChange(opt.date)}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm text-foreground bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <span>{opt.label}</span>
                  <span className="text-xs text-muted-foreground" suppressHydrationWarning>{new Date(opt.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
