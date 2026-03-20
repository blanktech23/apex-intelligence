"use client";

import { useState } from "react";
import {
  CircleAlert,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  X,
  Users,
  Link2,
  ArrowRight,
  Tag,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Types ---

type IssueStatus = "open" | "in_discussion" | "resolved";
type IssuePriority = "high" | "medium" | "low";
type IssueCategory = "short_term" | "long_term" | "departmental";

interface HistoryEntry {
  date: string;
  text: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  raisedBy: { name: string; initials: string; color: string };
  team: string;
  category: IssueCategory;
  votes: number;
  createdDate: string;
  relatedTo: string | null;
  discussionNotes: string;
  resolution: string | null;
  history: HistoryEntry[];
}

// --- Config ---

const priorityConfig: Record<
  IssuePriority,
  { label: string; dot: string; badge: string }
> = {
  high: {
    label: "High",
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  medium: {
    label: "Medium",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  low: {
    label: "Low",
    dot: "bg-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

const statusConfig: Record<
  IssueStatus,
  { label: string; badge: string; icon: typeof CircleAlert }
> = {
  open: {
    label: "Open",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: CircleAlert,
  },
  in_discussion: {
    label: "In Discussion",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    icon: MessageSquare,
  },
  resolved: {
    label: "Resolved",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

const categoryConfig: Record<IssueCategory, { label: string; badge: string }> = {
  short_term: { label: "Short-term", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  long_term: { label: "Long-term", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  departmental: { label: "Departmental", badge: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
};

type TabValue = "open" | "in_discussion" | "resolved" | "all";

const tabs: { label: string; value: TabValue }[] = [
  { label: "Open", value: "open" },
  { label: "In Discussion", value: "in_discussion" },
  { label: "Resolved", value: "resolved" },
  { label: "All", value: "all" },
];

// --- Mock Data ---

const mockIssues: Issue[] = [
  {
    id: "iss-001",
    title: "Subcontractor scheduling conflicts increasing",
    description:
      "We've seen a 40% increase in scheduling conflicts with electrical and plumbing subs over the past 6 weeks. Multiple projects have been delayed 2-3 days due to overlapping bookings. Root cause appears to be lack of centralized scheduling visibility across project managers.",
    priority: "high",
    status: "in_discussion",
    raisedBy: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    category: "short_term",
    votes: 7,
    createdDate: "2026-03-08",
    relatedTo: "Reduce project delivery time by 20%",
    discussionNotes:
      "Team discussed implementing a shared calendar system. Sarah proposed integrating sub schedules into the AI scheduling assistant. David suggested requiring 48-hour confirmation windows.",
    resolution: null,
    history: [
      { date: "2026-03-12", text: "Moved to In Discussion during L10 meeting" },
      { date: "2026-03-08", text: "Issue raised by Sarah Chen" },
    ],
  },
  {
    id: "iss-002",
    title: "Material cost overruns on kitchen remodels",
    description:
      "Last 4 kitchen remodel projects have exceeded material budgets by 12-18%. Main drivers are fixture upgrades during construction and inaccurate initial material estimates for custom cabinetry.",
    priority: "high",
    status: "open",
    raisedBy: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Finance",
    category: "long_term",
    votes: 5,
    createdDate: "2026-03-10",
    relatedTo: "Reduce material waste by 15%",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-10", text: "Issue raised by David Park" },
    ],
  },
  {
    id: "iss-003",
    title: "Client communication gaps during design phase",
    description:
      "Clients report feeling out of the loop during the 2-3 week design phase. No structured check-ins between initial consultation and design presentation. Leads to revision cycles that add 1-2 weeks to timelines.",
    priority: "medium",
    status: "open",
    raisedBy: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    team: "Sales",
    category: "short_term",
    votes: 4,
    createdDate: "2026-03-09",
    relatedTo: "Achieve 95% customer satisfaction score",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-09", text: "Issue raised by Lisa Torres" },
    ],
  },
  {
    id: "iss-004",
    title: "Permit approval delays in downtown district",
    description:
      "Average permit approval time in the downtown district has increased from 5 days to 12 days. City building department is understaffed. Affecting 3 active projects and 2 upcoming starts.",
    priority: "high",
    status: "in_discussion",
    raisedBy: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Operations",
    category: "long_term",
    votes: 6,
    createdDate: "2026-03-05",
    relatedTo: null,
    discussionNotes:
      "Marcus has identified an expediter service that claims 3-day turnaround for $500/permit. Team is evaluating cost/benefit. Kevin suggested building a relationship with the new building inspector.",
    resolution: null,
    history: [
      { date: "2026-03-10", text: "Moved to In Discussion - expediter option identified" },
      { date: "2026-03-05", text: "Issue raised by Marcus Rivera" },
    ],
  },
  {
    id: "iss-005",
    title: "Safety incident near-miss at Lakewood site",
    description:
      "Unsecured ladder fell from second-story scaffolding during lunch break. No injuries but highlighted gaps in end-of-shift safety protocols. OSHA guidelines require securing all equipment at height.",
    priority: "high",
    status: "resolved",
    raisedBy: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    team: "Operations",
    category: "short_term",
    votes: 8,
    createdDate: "2026-03-03",
    relatedTo: null,
    discussionNotes:
      "Immediate response: all-hands safety briefing conducted. New end-of-shift checklist implemented. Kevin completed safety audit of all active sites.",
    resolution:
      "Implemented mandatory end-of-shift safety checklist for all job sites. Added safety equipment securing as final step. All crew leads trained on new protocol.",
    history: [
      { date: "2026-03-07", text: "Resolved - new safety protocol in place" },
      { date: "2026-03-04", text: "Emergency all-hands safety briefing conducted" },
      { date: "2026-03-03", text: "Issue raised by Kevin Wu - URGENT" },
    ],
  },
  {
    id: "iss-006",
    title: "Inconsistent estimate formatting across team",
    description:
      "Different project managers use different estimate templates and line-item structures. Makes it hard for clients to compare options and causes confusion in the approval process.",
    priority: "medium",
    status: "open",
    raisedBy: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Sales",
    category: "departmental",
    votes: 3,
    createdDate: "2026-03-11",
    relatedTo: null,
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-11", text: "Issue raised by Amy Foster" },
    ],
  },
  {
    id: "iss-007",
    title: "Crew overtime exceeding budget on complex projects",
    description:
      "Projects with custom millwork or specialty finishes consistently require 15-20% more labor hours than estimated. Overtime costs are eating into margins on these higher-value jobs.",
    priority: "medium",
    status: "in_discussion",
    raisedBy: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Finance",
    category: "long_term",
    votes: 4,
    createdDate: "2026-03-07",
    relatedTo: null,
    discussionNotes:
      "David presented data showing pattern across last 8 projects. Sarah suggested adding a complexity multiplier to labor estimates. Team debating 15% vs 20% buffer for specialty work.",
    resolution: null,
    history: [
      { date: "2026-03-10", text: "Data analysis presented during L10" },
      { date: "2026-03-07", text: "Issue raised by David Park" },
    ],
  },
  {
    id: "iss-008",
    title: "New CRM not syncing with accounting software",
    description:
      "Invoice data from the CRM is not properly syncing to QuickBooks. Manual double-entry is required for each invoice, adding 2-3 hours of admin work per week.",
    priority: "low",
    status: "resolved",
    raisedBy: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    team: "Finance",
    category: "departmental",
    votes: 2,
    createdDate: "2026-02-28",
    relatedTo: null,
    discussionNotes:
      "IT identified a webhook configuration issue. Fix required updating the API integration settings.",
    resolution:
      "Webhook configuration updated. Sync now runs every 15 minutes. Backfilled 3 weeks of missing data. Monitoring for 2 weeks to confirm stability.",
    history: [
      { date: "2026-03-08", text: "Resolved - webhook fix deployed" },
      { date: "2026-03-04", text: "Root cause identified - webhook config" },
      { date: "2026-02-28", text: "Issue raised by Lisa Torres" },
    ],
  },
  {
    id: "iss-009",
    title: "Design revision turnaround too slow",
    description:
      "Average turnaround for design revisions is 5 business days. Clients expect 2-3 days. Bottleneck is the rendering step - each revision requires full re-render.",
    priority: "medium",
    status: "open",
    raisedBy: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Design",
    category: "short_term",
    votes: 3,
    createdDate: "2026-03-12",
    relatedTo: "Achieve 95% customer satisfaction score",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-12", text: "Issue raised by Amy Foster" },
    ],
  },
  {
    id: "iss-010",
    title: "Supplier lead times extending beyond quoted",
    description:
      "Top 3 lumber suppliers are now delivering 7-10 days beyond quoted lead times. Causing cascading delays on framing schedules. Need to build larger buffers or find alternatives.",
    priority: "medium",
    status: "open",
    raisedBy: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    category: "long_term",
    votes: 5,
    createdDate: "2026-03-11",
    relatedTo: "Reduce project delivery time by 20%",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-11", text: "Issue raised by Sarah Chen" },
    ],
  },
];

// --- Component ---

export default function IssuesPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const filtered = mockIssues.filter((issue) => {
    if (activeTab !== "all" && issue.status !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !issue.title.toLowerCase().includes(q) &&
        !issue.raisedBy.name.toLowerCase().includes(q)
      )
        return false;
    }
    if (priorityFilter !== "All" && issue.priority !== priorityFilter.toLowerCase()) return false;
    if (teamFilter !== "All" && issue.team !== teamFilter) return false;
    if (categoryFilter !== "All") {
      const catMap: Record<string, IssueCategory> = {
        "Short-term": "short_term",
        "Long-term": "long_term",
        Departmental: "departmental",
      };
      if (issue.category !== catMap[categoryFilter]) return false;
    }
    return true;
  });

  const tabCounts = {
    open: mockIssues.filter((i) => i.status === "open").length,
    in_discussion: mockIssues.filter((i) => i.status === "in_discussion").length,
    resolved: mockIssues.filter((i) => i.status === "resolved").length,
    all: mockIssues.length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Issues Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Identify, Discuss, Solve - Track and resolve team issues
          </p>
        </div>
        <Button
          className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2"
          onClick={() => toast.success("Issue created successfully")}
        >
          <Plus className="h-4 w-4" />
          Add Issue
        </Button>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-1.5 inline-flex gap-1">
        {tabs.map((tab) => (
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
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        {/* Priority */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "priority" ? null : "priority")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              priorityFilter !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{priorityFilter === "All" ? "Priority" : priorityFilter}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "priority" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "priority" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {["All", "High", "Medium", "Low"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setPriorityFilter(opt); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    priorityFilter === opt ? "text-primary font-medium" : "text-muted-foreground"
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
              {["All", "Operations", "Sales", "Finance", "Design"].map((opt) => (
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

        {/* Category */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              categoryFilter !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>{categoryFilter === "All" ? "Category" : categoryFilter}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "category" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {["All", "Short-term", "Long-term", "Departmental"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setCategoryFilter(opt); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    categoryFilter === opt ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue list + detail panel */}
      <div className="flex gap-5">
        {/* Issue list */}
        <div className={`space-y-2 ${selectedIssue ? "flex-1 min-w-0" : "w-full"}`}>
          {filtered.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <CircleAlert className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No issues match the current filters.</p>
            </div>
          ) : (
            filtered.map((issue) => {
              const pConfig = priorityConfig[issue.priority];
              const sConfig = statusConfig[issue.status];
              const cConfig = categoryConfig[issue.category];
              const SIcon = sConfig.icon;
              const isSelected = selectedIssue?.id === issue.id;

              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(isSelected ? null : issue)}
                  className={`w-full text-left rounded-xl bg-[rgba(255,255,255,0.05)] border backdrop-blur-xl p-4 hover:bg-[rgba(255,255,255,0.07)] transition-all ${
                    isSelected
                      ? "border-indigo-500/40 bg-[rgba(255,255,255,0.07)]"
                      : "border-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority dot */}
                    <div className="mt-1.5 shrink-0">
                      <span className={`block h-2.5 w-2.5 rounded-full ${pConfig.dot}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-medium text-foreground text-sm leading-snug">{issue.title}</h3>
                        <Badge variant="outline" className={`${sConfig.badge} shrink-0 text-[10px]`}>
                          <SIcon className="h-3 w-3 mr-1" />
                          {sConfig.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {/* Raised by */}
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className={`${issue.raisedBy.color} text-[7px]`}>
                              {issue.raisedBy.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-muted-foreground">{issue.raisedBy.name}</span>
                        </div>
                        {/* Team */}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                          {issue.team}
                        </Badge>
                        {/* Category */}
                        <Badge variant="outline" className={`${cConfig.badge} text-[10px] px-1.5 py-0 h-4`}>
                          {cConfig.label}
                        </Badge>
                        {/* Votes */}
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {issue.votes}
                        </span>
                        {/* Date */}
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(issue.createdDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selectedIssue && (
          <div className="hidden lg:block w-[420px] shrink-0">
            <div className="rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl sticky top-6">
              {/* Panel header */}
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="font-semibold text-foreground text-sm">Issue Detail</h3>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Title + status */}
                <div>
                  <h4 className="font-semibold text-foreground">{selectedIssue.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={priorityConfig[selectedIssue.priority].badge}>
                      {priorityConfig[selectedIssue.priority].label}
                    </Badge>
                    <Badge variant="outline" className={statusConfig[selectedIssue.status].badge}>
                      {statusConfig[selectedIssue.status].label}
                    </Badge>
                    <Badge variant="outline" className={categoryConfig[selectedIssue.category].badge}>
                      {categoryConfig[selectedIssue.category].label}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-[rgba(255,255,255,0.06)]" />

                {/* Description */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Description
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedIssue.description}</p>
                </div>

                {/* Discussion notes */}
                {selectedIssue.discussionNotes && (
                  <>
                    <Separator className="bg-[rgba(255,255,255,0.06)]" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Discussion Notes
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedIssue.discussionNotes}</p>
                    </div>
                  </>
                )}

                {/* Resolution */}
                {selectedIssue.resolution ? (
                  <>
                    <Separator className="bg-[rgba(255,255,255,0.06)]" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Resolution
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedIssue.resolution}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Separator className="bg-[rgba(255,255,255,0.06)]" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Resolution
                      </h5>
                      <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-3">
                        <p className="text-xs text-muted-foreground/60 italic">
                          How was this resolved? (To be filled when resolved)
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1.5"
                        onClick={() => toast.success("Action item created from issue")}
                      >
                        <ArrowRight className="h-3 w-3" />
                        Create Action Item from Resolution
                      </Button>
                    </div>
                  </>
                )}

                {/* Related */}
                {selectedIssue.relatedTo && (
                  <>
                    <Separator className="bg-[rgba(255,255,255,0.06)]" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Related To
                      </h5>
                      <div className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                        <Link2 className="h-3.5 w-3.5" />
                        {selectedIssue.relatedTo}
                      </div>
                    </div>
                  </>
                )}

                {/* History */}
                <Separator className="bg-[rgba(255,255,255,0.06)]" />
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    History
                  </h5>
                  <div className="space-y-2.5">
                    {selectedIssue.history.map((entry, i) => (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
