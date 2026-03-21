"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CircleAlert,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
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
  Flame,
  Merge,
  Target,
  ListChecks,
  Timer,
  ArrowUpDown,
  Share2,
  Mountain,
  ChevronRight,
  Zap,
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
type IDSStep = "identify" | "discuss" | "solve";
type SortMode = "votes" | "priority" | "date";

interface HistoryEntry {
  date: string;
  text: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: IssuePriority;
  priorityRank: number; // 1-5
  status: IssueStatus;
  idsStep: IDSStep;
  raisedBy: { name: string; initials: string; color: string };
  team: string;
  category: IssueCategory;
  votes: number;
  userVoted: number; // -1, 0, 1
  createdDate: string;
  relatedTo: string | null;
  discussionNotes: string;
  resolution: string | null;
  history: HistoryEntry[];
  cascadedTeams: string[];
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

const idsSteps: { step: IDSStep; label: string; description: string }[] = [
  { step: "identify", label: "Identify", description: "Issue identified and raised" },
  { step: "discuss", label: "Discuss", description: "Team discussing solutions" },
  { step: "solve", label: "Solve", description: "Resolution determined" },
];

type TabValue = "open" | "in_discussion" | "resolved" | "all";
type ListMode = "all_issues" | "short_term" | "long_term";

const tabs: { label: string; value: TabValue }[] = [
  { label: "Open", value: "open" },
  { label: "In Discussion", value: "in_discussion" },
  { label: "Resolved", value: "resolved" },
  { label: "All", value: "all" },
];

const allTeams = ["Operations", "Sales", "Finance", "Design", "Engineering", "Marketing"];

// --- Mock Data ---

const initialIssues: Issue[] = [
  {
    id: "iss-001",
    title: "Subcontractor scheduling conflicts increasing",
    description:
      "We've seen a 40% increase in scheduling conflicts with electrical and plumbing subs over the past 6 weeks. Multiple projects have been delayed 2-3 days due to overlapping bookings. Root cause appears to be lack of centralized scheduling visibility across project managers.",
    priority: "high",
    priorityRank: 1,
    status: "in_discussion",
    idsStep: "discuss",
    raisedBy: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    category: "short_term",
    votes: 7,
    userVoted: 0,
    createdDate: "2026-03-08",
    relatedTo: "Reduce project delivery time by 20%",
    discussionNotes:
      "Team discussed implementing a shared calendar system. Sarah proposed integrating sub schedules into the AI scheduling assistant. David suggested requiring 48-hour confirmation windows.",
    resolution: null,
    history: [
      { date: "2026-03-12", text: "Moved to In Discussion during L10 meeting" },
      { date: "2026-03-08", text: "Issue raised by Sarah Chen" },
    ],
    cascadedTeams: [],
  },
  {
    id: "iss-002",
    title: "Material cost overruns on kitchen remodels",
    description:
      "Last 4 kitchen remodel projects have exceeded material budgets by 12-18%. Main drivers are fixture upgrades during construction and inaccurate initial material estimates for custom cabinetry.",
    priority: "high",
    priorityRank: 2,
    status: "open",
    idsStep: "identify",
    raisedBy: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Finance",
    category: "long_term",
    votes: 5,
    userVoted: 0,
    createdDate: "2026-03-10",
    relatedTo: "Reduce material waste by 15%",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-10", text: "Issue raised by David Park" },
    ],
    cascadedTeams: [],
  },
  {
    id: "iss-003",
    title: "Client communication gaps during design phase",
    description:
      "Clients report feeling out of the loop during the 2-3 week design phase. No structured check-ins between initial consultation and design presentation. Leads to revision cycles that add 1-2 weeks to timelines.",
    priority: "medium",
    priorityRank: 3,
    status: "open",
    idsStep: "identify",
    raisedBy: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    team: "Sales",
    category: "short_term",
    votes: 4,
    userVoted: 0,
    createdDate: "2026-03-09",
    relatedTo: "Achieve 95% customer satisfaction score",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-09", text: "Issue raised by Lisa Torres" },
    ],
    cascadedTeams: ["Design"],
  },
  {
    id: "iss-004",
    title: "Permit approval delays in downtown district",
    description:
      "Average permit approval time in the downtown district has increased from 5 days to 12 days. City building department is understaffed. Affecting 3 active projects and 2 upcoming starts.",
    priority: "high",
    priorityRank: 1,
    status: "in_discussion",
    idsStep: "discuss",
    raisedBy: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    team: "Operations",
    category: "long_term",
    votes: 6,
    userVoted: 0,
    createdDate: "2026-03-05",
    relatedTo: null,
    discussionNotes:
      "Marcus has identified an expediter service that claims 3-day turnaround for $500/permit. Team is evaluating cost/benefit. Kevin suggested building a relationship with the new building inspector.",
    resolution: null,
    history: [
      { date: "2026-03-10", text: "Moved to In Discussion - expediter option identified" },
      { date: "2026-03-05", text: "Issue raised by Marcus Rivera" },
    ],
    cascadedTeams: ["Finance"],
  },
  {
    id: "iss-005",
    title: "Safety incident near-miss at Lakewood site",
    description:
      "Unsecured ladder fell from second-story scaffolding during lunch break. No injuries but highlighted gaps in end-of-shift safety protocols. OSHA guidelines require securing all equipment at height.",
    priority: "high",
    priorityRank: 1,
    status: "resolved",
    idsStep: "solve",
    raisedBy: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    team: "Operations",
    category: "short_term",
    votes: 8,
    userVoted: 1,
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
    cascadedTeams: [],
  },
  {
    id: "iss-006",
    title: "Inconsistent estimate formatting across team",
    description:
      "Different project managers use different estimate templates and line-item structures. Makes it hard for clients to compare options and causes confusion in the approval process.",
    priority: "medium",
    priorityRank: 3,
    status: "open",
    idsStep: "identify",
    raisedBy: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Sales",
    category: "departmental",
    votes: 3,
    userVoted: 0,
    createdDate: "2026-03-11",
    relatedTo: null,
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-11", text: "Issue raised by Amy Foster" },
    ],
    cascadedTeams: [],
  },
  {
    id: "iss-007",
    title: "Crew overtime exceeding budget on complex projects",
    description:
      "Projects with custom millwork or specialty finishes consistently require 15-20% more labor hours than estimated. Overtime costs are eating into margins on these higher-value jobs.",
    priority: "medium",
    priorityRank: 3,
    status: "in_discussion",
    idsStep: "discuss",
    raisedBy: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    team: "Finance",
    category: "long_term",
    votes: 4,
    userVoted: 0,
    createdDate: "2026-03-07",
    relatedTo: null,
    discussionNotes:
      "David presented data showing pattern across last 8 projects. Sarah suggested adding a complexity multiplier to labor estimates. Team debating 15% vs 20% buffer for specialty work.",
    resolution: null,
    history: [
      { date: "2026-03-10", text: "Data analysis presented during L10" },
      { date: "2026-03-07", text: "Issue raised by David Park" },
    ],
    cascadedTeams: ["Operations"],
  },
  {
    id: "iss-008",
    title: "New CRM not syncing with accounting software",
    description:
      "Invoice data from the CRM is not properly syncing to QuickBooks. Manual double-entry is required for each invoice, adding 2-3 hours of admin work per week.",
    priority: "low",
    priorityRank: 5,
    status: "resolved",
    idsStep: "solve",
    raisedBy: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    team: "Finance",
    category: "departmental",
    votes: 2,
    userVoted: 0,
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
    cascadedTeams: [],
  },
  {
    id: "iss-009",
    title: "Design revision turnaround too slow",
    description:
      "Average turnaround for design revisions is 5 business days. Clients expect 2-3 days. Bottleneck is the rendering step - each revision requires full re-render.",
    priority: "medium",
    priorityRank: 4,
    status: "open",
    idsStep: "identify",
    raisedBy: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    team: "Design",
    category: "short_term",
    votes: 3,
    userVoted: 0,
    createdDate: "2026-03-12",
    relatedTo: "Achieve 95% customer satisfaction score",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-12", text: "Issue raised by Amy Foster" },
    ],
    cascadedTeams: [],
  },
  {
    id: "iss-010",
    title: "Supplier lead times extending beyond quoted",
    description:
      "Top 3 lumber suppliers are now delivering 7-10 days beyond quoted lead times. Causing cascading delays on framing schedules. Need to build larger buffers or find alternatives.",
    priority: "medium",
    priorityRank: 3,
    status: "open",
    idsStep: "identify",
    raisedBy: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    team: "Operations",
    category: "long_term",
    votes: 5,
    userVoted: 0,
    createdDate: "2026-03-11",
    relatedTo: "Reduce project delivery time by 20%",
    discussionNotes: "",
    resolution: null,
    history: [
      { date: "2026-03-11", text: "Issue raised by Sarah Chen" },
    ],
    cascadedTeams: [],
  },
];

// --- Component ---

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [listMode, setListMode] = useState<ListMode>("all_issues");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [teamFilter, setTeamFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortMode, setSortMode] = useState<SortMode>("votes");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showConvertRockModal, setShowConvertRockModal] = useState(false);
  const [showConvertTodoModal, setShowConvertTodoModal] = useState(false);
  const [showCascadeModal, setShowCascadeModal] = useState(false);
  const [showSolveModal, setShowSolveModal] = useState(false);

  // IDS Timer
  const [discussionTimer, setDiscussionTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Create form
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCategory, setCreateCategory] = useState<IssueCategory>("short_term");
  const [createPriority, setCreatePriority] = useState<IssuePriority>("medium");
  const [createTeam, setCreateTeam] = useState("Operations");
  const [createRelated, setCreateRelated] = useState("");

  // Merge
  const [mergeSearch, setMergeSearch] = useState("");
  const [mergeTarget, setMergeTarget] = useState<Issue | null>(null);

  // Solve
  const [solveResolution, setSolveResolution] = useState("");

  // Cascade
  const [cascadeSelections, setCascadeSelections] = useState<Set<string>>(new Set());

  // Convert Rock
  const [rockTitle, setRockTitle] = useState("");
  const [rockDescription, setRockDescription] = useState("");

  // Convert Todo
  const [todoDescription, setTodoDescription] = useState("");
  const [todoDueDate, setTodoDueDate] = useState("");

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [openDropdown]);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setDiscussionTimer((t) => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Keep selected issue in sync with issues state
  const syncSelectedIssue = useCallback((updatedIssues: Issue[]) => {
    if (selectedIssue) {
      const updated = updatedIssues.find((i) => i.id === selectedIssue.id);
      if (updated) setSelectedIssue(updated);
    }
  }, [selectedIssue]);

  // --- Handlers ---

  const handleVote = (issueId: string, direction: 1 | -1) => {
    setIssues((prev) => {
      const updated = prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        let newVoted = issue.userVoted;
        let newVotes = issue.votes;
        if (direction === 1) {
          if (issue.userVoted === 1) { newVoted = 0; newVotes -= 1; }
          else if (issue.userVoted === -1) { newVoted = 1; newVotes += 2; }
          else { newVoted = 1; newVotes += 1; }
        } else {
          if (issue.userVoted === -1) { newVoted = 0; newVotes += 1; }
          else if (issue.userVoted === 1) { newVoted = -1; newVotes -= 2; }
          else { newVoted = -1; newVotes -= 1; }
        }
        return { ...issue, votes: newVotes, userVoted: newVoted };
      });
      syncSelectedIssue(updated);
      return updated;
    });
  };

  const handleSetPriorityRank = (issueId: string, rank: number) => {
    setIssues((prev) => {
      const updated = prev.map((issue) =>
        issue.id === issueId ? { ...issue, priorityRank: rank } : issue
      );
      syncSelectedIssue(updated);
      return updated;
    });
    toast.success(`Priority rank set to ${rank}`);
  };

  const handleMoveToDiscussion = (issueId: string) => {
    setIssues((prev) => {
      const now = new Date().toISOString().split("T")[0];
      const updated = prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: "in_discussion" as IssueStatus,
              idsStep: "discuss" as IDSStep,
              history: [{ date: now, text: "Moved to Discussion (IDS)" }, ...issue.history],
            }
          : issue
      );
      syncSelectedIssue(updated);
      return updated;
    });
    setDiscussionTimer(0);
    setTimerRunning(true);
    toast.success("Issue moved to Discussion phase");
  };

  const handleOpenSolve = () => {
    setSolveResolution("");
    setShowSolveModal(true);
  };

  const handleSolve = (issueId: string) => {
    if (!solveResolution.trim()) {
      toast.error("Please enter a resolution");
      return;
    }
    setIssues((prev) => {
      const now = new Date().toISOString().split("T")[0];
      const updated = prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: "resolved" as IssueStatus,
              idsStep: "solve" as IDSStep,
              resolution: solveResolution,
              history: [{ date: now, text: `Resolved: ${solveResolution.slice(0, 60)}...` }, ...issue.history],
            }
          : issue
      );
      syncSelectedIssue(updated);
      return updated;
    });
    setTimerRunning(false);
    setShowSolveModal(false);
    toast.success("Issue resolved successfully");
  };

  const handleMoveBetweenLists = (issueId: string) => {
    setIssues((prev) => {
      const updated = prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        const newCat: IssueCategory = issue.category === "short_term" ? "long_term" : "short_term";
        const now = new Date().toISOString().split("T")[0];
        return {
          ...issue,
          category: newCat,
          history: [
            { date: now, text: `Moved to ${newCat === "short_term" ? "Short-Term" : "Long-Term"} list` },
            ...issue.history,
          ],
        };
      });
      syncSelectedIssue(updated);
      return updated;
    });
    toast.success("Issue moved between lists");
  };

  const handleCreateIssue = () => {
    if (!createTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    const newIssue: Issue = {
      id: `iss-${String(issues.length + 1).padStart(3, "0")}`,
      title: createTitle,
      description: createDesc,
      priority: createPriority,
      priorityRank: createPriority === "high" ? 1 : createPriority === "medium" ? 3 : 5,
      status: "open",
      idsStep: "identify",
      raisedBy: { name: "You", initials: "YO", color: "bg-indigo-500/30 text-indigo-300" },
      team: createTeam,
      category: createCategory,
      votes: 0,
      userVoted: 0,
      createdDate: new Date().toISOString().split("T")[0],
      relatedTo: createRelated || null,
      discussionNotes: "",
      resolution: null,
      history: [{ date: new Date().toISOString().split("T")[0], text: "Issue created" }],
      cascadedTeams: [],
    };
    setIssues((prev) => [newIssue, ...prev]);
    setShowCreateModal(false);
    setCreateTitle("");
    setCreateDesc("");
    setCreateCategory("short_term");
    setCreatePriority("medium");
    setCreateTeam("Operations");
    setCreateRelated("");
    toast.success("Issue created successfully");
  };

  const handleMerge = () => {
    if (!mergeTarget || !selectedIssue) return;
    setIssues((prev) => {
      const now = new Date().toISOString().split("T")[0];
      const updated = prev
        .map((issue) => {
          if (issue.id === mergeTarget.id) {
            return {
              ...issue,
              description: issue.description + "\n\n[Merged from: " + selectedIssue.title + "] " + selectedIssue.description,
              votes: issue.votes + selectedIssue.votes,
              history: [
                { date: now, text: `Merged with "${selectedIssue.title}"` },
                ...issue.history,
              ],
            };
          }
          return issue;
        })
        .filter((issue) => issue.id !== selectedIssue.id);
      return updated;
    });
    setSelectedIssue(null);
    setShowMergeModal(false);
    setMergeTarget(null);
    setMergeSearch("");
    toast.success("Issues merged successfully");
  };

  const handleConvertToRock = () => {
    if (!rockTitle.trim() || !selectedIssue) return;
    setIssues((prev) => {
      const now = new Date().toISOString().split("T")[0];
      return prev.map((issue) =>
        issue.id === selectedIssue.id
          ? {
              ...issue,
              status: "resolved" as IssueStatus,
              idsStep: "solve" as IDSStep,
              resolution: `Converted to Rock: "${rockTitle}"`,
              history: [{ date: now, text: `Converted to Rock: "${rockTitle}"` }, ...issue.history],
            }
          : issue
      );
    });
    setShowConvertRockModal(false);
    setRockTitle("");
    setRockDescription("");
    toast.success(`Rock "${rockTitle}" created from issue`);
  };

  const handleConvertToTodo = () => {
    if (!todoDescription.trim() || !selectedIssue) return;
    setIssues((prev) => {
      const now = new Date().toISOString().split("T")[0];
      return prev.map((issue) =>
        issue.id === selectedIssue.id
          ? {
              ...issue,
              status: "resolved" as IssueStatus,
              idsStep: "solve" as IDSStep,
              resolution: `Converted to To-Do: "${todoDescription}"`,
              history: [{ date: now, text: `Converted to To-Do: "${todoDescription}"` }, ...issue.history],
            }
          : issue
      );
    });
    setShowConvertTodoModal(false);
    setTodoDescription("");
    setTodoDueDate("");
    toast.success(`To-Do created from issue`);
  };

  const handleCascade = () => {
    if (!selectedIssue || cascadeSelections.size === 0) return;
    const teams = Array.from(cascadeSelections);
    setIssues((prev) => {
      const now = new Date().toISOString().split("T")[0];
      const updated = prev.map((issue) =>
        issue.id === selectedIssue.id
          ? {
              ...issue,
              cascadedTeams: [...new Set([...issue.cascadedTeams, ...teams])],
              history: [
                { date: now, text: `Cascaded to teams: ${teams.join(", ")}` },
                ...issue.history,
              ],
            }
          : issue
      );
      syncSelectedIssue(updated);
      return updated;
    });
    setShowCascadeModal(false);
    setCascadeSelections(new Set());
    toast.success(`Issue shared with ${teams.length} team(s)`);
  };

  // --- Filtering & Sorting ---

  const filtered = issues
    .filter((issue) => {
      if (activeTab !== "all" && issue.status !== activeTab) return false;
      if (listMode === "short_term" && issue.category !== "short_term") return false;
      if (listMode === "long_term" && issue.category !== "long_term") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !issue.title.toLowerCase().includes(q) &&
          !issue.description.toLowerCase().includes(q) &&
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
    })
    .sort((a, b) => {
      if (sortMode === "votes") return b.votes - a.votes;
      if (sortMode === "priority") return a.priorityRank - b.priorityRank;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });

  const tabCounts = {
    open: issues.filter((i) => i.status === "open").length,
    in_discussion: issues.filter((i) => i.status === "in_discussion").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    all: issues.length,
  };

  // Stat cards
  const hotIssues = issues.filter((i) => i.votes >= 3 && i.status !== "resolved").length;

  // Keep selectedIssue in sync
  const currentSelected = selectedIssue ? issues.find((i) => i.id === selectedIssue.id) || null : null;

  return (
    <div className="space-y-6">
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
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
          Add Issue
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Open", value: tabCounts.open, color: "text-amber-400", icon: CircleAlert },
          { label: "In Discussion", value: tabCounts.in_discussion, color: "text-indigo-400", icon: MessageSquare },
          { label: "Resolved", value: tabCounts.resolved, color: "text-emerald-400", icon: CheckCircle2 },
          { label: "Hot Issues", value: hotIssues, color: "text-red-400", icon: Flame },
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

      {/* Short-term / Long-term toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass rounded-xl p-1 inline-flex gap-1">
          {([
            { label: "All Issues", value: "all_issues" as ListMode },
            { label: "Short-Term", value: "short_term" as ListMode },
            { label: "Long-Term", value: "long_term" as ListMode },
          ]).map((mode) => (
            <button
              key={mode.value}
              onClick={() => setListMode(mode.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                listMode === mode.value
                  ? mode.value === "long_term"
                    ? "bg-purple-600 text-primary-foreground shadow-lg shadow-purple-500/25"
                    : "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
            className="glass glass-hover flex h-8 items-center gap-2 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowUpDown className="h-3 w-3" />
            Sort: {sortMode === "votes" ? "Votes" : sortMode === "priority" ? "Priority" : "Date"}
          </button>
          {openDropdown === "sort" && (
            <div className="glass-strong absolute right-0 top-full z-50 mt-1.5 min-w-[130px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {([
                { label: "By Votes", value: "votes" as SortMode },
                { label: "By Priority", value: "priority" as SortMode },
                { label: "By Date", value: "date" as SortMode },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); setSortMode(opt.value); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs transition-colors hover:bg-muted/40 ${
                    sortMode === opt.value ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-1.5 overflow-x-auto">
        <div className="inline-flex gap-1 whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(null);
              setActiveTab(tab.value);
            }}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.value
                ? "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
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
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        {/* Priority */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
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
            <div className="glass-strong absolute left-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {["All", "High", "Medium", "Low"].map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => { e.stopPropagation(); setPriorityFilter(opt); setOpenDropdown(null); }}
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
        <div className="relative" onClick={(e) => e.stopPropagation()}>
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
            <div className="glass-strong absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {["All", ...allTeams].map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => { e.stopPropagation(); setTeamFilter(opt); setOpenDropdown(null); }}
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
        <div className="relative" onClick={(e) => e.stopPropagation()}>
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
            <div className="glass-strong absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {["All", "Short-term", "Long-term", "Departmental"].map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => { e.stopPropagation(); setCategoryFilter(opt); setOpenDropdown(null); }}
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
        <div className={`space-y-2 ${currentSelected ? "flex-1 min-w-0" : "w-full"}`}>
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
              const isSelected = currentSelected?.id === issue.id;
              const isHot = issue.votes >= 3 && issue.status !== "resolved";

              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedIssue(isSelected ? null : issue)}
                  className={`w-full text-left rounded-xl bg-card border backdrop-blur-xl p-4 hover:bg-muted/50 transition-all ${
                    isSelected
                      ? "border-indigo-500/40 bg-muted/50"
                      : issue.category === "long_term"
                      ? "border-purple-500/20"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority dot - clickable to cycle */}
                    <div
                      className="mt-1.5 shrink-0 cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation();
                        const priorities: IssuePriority[] = ["low", "medium", "high"];
                        const currentIdx = priorities.indexOf(issue.priority);
                        const nextPriority = priorities[(currentIdx + 1) % priorities.length];
                        setIssues((prev) => {
                          const updated = prev.map((i) =>
                            i.id === issue.id
                              ? { ...i, priority: nextPriority, priorityRank: nextPriority === "high" ? 1 : nextPriority === "medium" ? 3 : 5 }
                              : i
                          );
                          syncSelectedIssue(updated);
                          return updated;
                        });
                        toast.success(`Priority changed to ${nextPriority}`);
                      }}
                    >
                      <span className={`block h-2.5 w-2.5 rounded-full ${pConfig.dot} group-hover:ring-2 group-hover:ring-border transition-all`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-medium text-foreground text-sm leading-snug truncate">{issue.title}</h3>
                          {isHot && (
                            <Flame className="h-3.5 w-3.5 text-red-400 shrink-0 animate-pulse" />
                          )}
                          {issue.category === "long_term" && (
                            <div className="h-1 w-1 rounded-full bg-purple-400 shrink-0" />
                          )}
                        </div>
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
                        {/* Cascaded badge */}
                        {issue.cascadedTeams.length > 0 && (
                          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] px-1.5 py-0 h-4">
                            <Share2 className="h-2.5 w-2.5 mr-0.5" />
                            {issue.cascadedTeams.length} team{issue.cascadedTeams.length > 1 ? "s" : ""}
                          </Badge>
                        )}
                        {/* Votes - interactive */}
                        <span
                          className="text-[11px] flex items-center gap-0.5 cursor-pointer group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(issue.id, 1);
                          }}
                        >
                          <ThumbsUp className={`h-3 w-3 transition-colors ${issue.userVoted === 1 ? "text-indigo-400" : "text-muted-foreground group-hover:text-indigo-400"}`} />
                          <span className={`${issue.userVoted === 1 ? "text-indigo-400 font-medium" : "text-muted-foreground"}`}>
                            {issue.votes}
                          </span>
                        </span>
                        {/* Priority rank */}
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                          <Zap className="h-2.5 w-2.5" />
                          P{issue.priorityRank}
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
        {currentSelected && (
          <div className="hidden lg:block w-[480px] shrink-0">
            <div className="rounded-xl bg-card border border-border backdrop-blur-xl sticky top-6">
              {/* Panel header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
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
                  <h4 className="font-semibold text-foreground">{currentSelected.title}</h4>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={priorityConfig[currentSelected.priority].badge}>
                      {priorityConfig[currentSelected.priority].label}
                    </Badge>
                    <Badge variant="outline" className={statusConfig[currentSelected.status].badge}>
                      {statusConfig[currentSelected.status].label}
                    </Badge>
                    <Badge variant="outline" className={categoryConfig[currentSelected.category].badge}>
                      {categoryConfig[currentSelected.category].label}
                    </Badge>
                    {currentSelected.cascadedTeams.length > 0 && (
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px]">
                        <Share2 className="h-3 w-3 mr-1" />
                        {currentSelected.cascadedTeams.join(", ")}
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* IDS Step Progress */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    IDS Process
                  </h5>
                  <div className="flex items-center gap-1">
                    {idsSteps.map((step, idx) => {
                      const stepOrder: Record<IDSStep, number> = { identify: 0, discuss: 1, solve: 2 };
                      const currentOrder = stepOrder[currentSelected.idsStep];
                      const thisOrder = stepOrder[step.step];
                      const isActive = thisOrder === currentOrder;
                      const isComplete = thisOrder < currentOrder;

                      return (
                        <div key={step.step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isComplete
                                  ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                                  : isActive
                                  ? "bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/20"
                                  : "bg-muted/20 text-muted-foreground/40"
                              }`}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <span className={`text-[10px] mt-1 font-medium ${
                              isActive ? "text-indigo-400" : isComplete ? "text-emerald-400" : "text-muted-foreground/40"
                            }`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < idsSteps.length - 1 && (
                            <div className={`h-0.5 w-full mx-1 mt-[-16px] ${
                              isComplete ? "bg-emerald-500/40" : "bg-muted/20"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Discussion Timer */}
                  {currentSelected.idsStep === "discuss" && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-2">
                      <Timer className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm font-mono text-indigo-400 tabular-nums">{formatTime(discussionTimer)}</span>
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => setTimerRunning(!timerRunning)}
                          className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                        >
                          {timerRunning ? "Pause" : "Start"}
                        </button>
                        <button
                          onClick={() => { setDiscussionTimer(0); setTimerRunning(false); }}
                          className="text-[10px] px-2 py-0.5 rounded bg-muted/20 text-muted-foreground hover:bg-muted/40 transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* IDS Action Buttons */}
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {currentSelected.idsStep === "identify" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-1.5"
                        onClick={() => handleMoveToDiscussion(currentSelected.id)}
                      >
                        <ChevronRight className="h-3 w-3" />
                        Move to Discussion
                      </Button>
                    )}
                    {currentSelected.idsStep === "discuss" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-primary-foreground gap-1.5"
                        onClick={handleOpenSolve}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Solve
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Priority Rank */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Priority Rank (1-5)
                  </h5>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <button
                        key={rank}
                        onClick={() => handleSetPriorityRank(currentSelected.id, rank)}
                        className={`h-7 w-7 rounded text-xs font-bold transition-all ${
                          currentSelected.priorityRank === rank
                            ? "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                            : rank <= currentSelected.priorityRank
                            ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                            : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        {rank}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voting */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Votes
                  </h5>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(currentSelected.id, 1)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                        currentSelected.userVoted === 1
                          ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30"
                          : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Upvote
                    </button>
                    <span className="text-lg font-bold text-foreground tabular-nums">{currentSelected.votes}</span>
                    <button
                      onClick={() => handleVote(currentSelected.id, -1)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                        currentSelected.userVoted === -1
                          ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                          : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      Downvote
                    </button>
                    {currentSelected.votes >= 3 && currentSelected.status !== "resolved" && (
                      <Flame className="h-4 w-4 text-red-400 animate-pulse" />
                    )}
                  </div>
                </div>

                <Separator className="bg-border" />

                {/* Description */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Description
                  </h5>
                  <p className="text-sm text-muted-foreground leading-relaxed">{currentSelected.description}</p>
                </div>

                {/* Discussion notes */}
                {currentSelected.discussionNotes && (
                  <>
                    <Separator className="bg-border" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Discussion Notes
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{currentSelected.discussionNotes}</p>
                    </div>
                  </>
                )}

                {/* Resolution */}
                {currentSelected.resolution ? (
                  <>
                    <Separator className="bg-border" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        Resolution
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{currentSelected.resolution}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-1.5"
                        onClick={() => toast.success("Action item created from resolution")}
                      >
                        <ArrowRight className="h-3 w-3" />
                        Create Action Item
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Separator className="bg-border" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Resolution
                      </h5>
                      <div className="rounded-lg bg-muted/30 border border-border p-3">
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
                {currentSelected.relatedTo && (
                  <>
                    <Separator className="bg-border" />
                    <div>
                      <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Related To
                      </h5>
                      <div className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
                        <Link2 className="h-3.5 w-3.5" />
                        {currentSelected.relatedTo}
                      </div>
                    </div>
                  </>
                )}

                <Separator className="bg-border" />

                {/* Action buttons */}
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Actions
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setMergeSearch("");
                        setMergeTarget(null);
                        setShowMergeModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Merge className="h-3.5 w-3.5" />
                      Merge
                    </button>
                    <button
                      onClick={() => {
                        setRockTitle(currentSelected.title);
                        setRockDescription(currentSelected.description);
                        setShowConvertRockModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Mountain className="h-3.5 w-3.5" />
                      Convert to Rock
                    </button>
                    <button
                      onClick={() => {
                        setTodoDescription(currentSelected.title);
                        setTodoDueDate("");
                        setShowConvertTodoModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <ListChecks className="h-3.5 w-3.5" />
                      Convert to To-Do
                    </button>
                    <button
                      onClick={() => {
                        setCascadeSelections(new Set(currentSelected.cascadedTeams));
                        setShowCascadeModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Cascade
                    </button>
                    <button
                      onClick={() => handleMoveBetweenLists(currentSelected.id)}
                      className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      Move to {currentSelected.category === "short_term" ? "Long-Term" : "Short-Term"} List
                    </button>
                  </div>
                </div>

                {/* History */}
                <Separator className="bg-border" />
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    History
                  </h5>
                  <div className="space-y-2.5">
                    {currentSelected.history.map((entry, i) => (
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

      {/* ==================== MODALS ==================== */}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative glass rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground">New Issue</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                <Input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="What's the issue?"
                  className="h-9 bg-muted/30 border-border text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full rounded-lg bg-muted/30 border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value as IssuePriority)}
                    className="w-full h-9 rounded-lg bg-muted/30 border border-border px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Team</label>
                  <select
                    value={createTeam}
                    onChange={(e) => setCreateTeam(e.target.value)}
                    className="w-full h-9 rounded-lg bg-muted/30 border border-border px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {allTeams.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
                <div className="flex gap-2">
                  {([
                    { label: "Short-term", value: "short_term" as IssueCategory },
                    { label: "Long-term", value: "long_term" as IssueCategory },
                    { label: "Departmental", value: "departmental" as IssueCategory },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setCreateCategory(opt.value)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        createCategory === opt.value
                          ? "bg-indigo-600 text-primary-foreground"
                          : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Link to Rock / Goal (optional)</label>
                <Input
                  value={createRelated}
                  onChange={(e) => setCreateRelated(e.target.value)}
                  placeholder="e.g. Reduce project delivery time by 20%"
                  className="h-9 bg-muted/30 border-border text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                onClick={handleCreateIssue}
              >
                Create Issue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && currentSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMergeModal(false)} />
          <div className="relative glass rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Merge className="h-5 w-5 text-indigo-400" />
                Merge Issue
              </h3>
              <button
                onClick={() => setShowMergeModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3">
                <p className="text-xs text-amber-400 font-medium">Merging:</p>
                <p className="text-sm text-foreground mt-1">{currentSelected.title}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Merge into:</label>
                <Input
                  value={mergeSearch}
                  onChange={(e) => setMergeSearch(e.target.value)}
                  placeholder="Search for an issue to merge into..."
                  className="h-9 bg-muted/30 border-border text-sm"
                />
              </div>

              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {issues
                  .filter((i) => i.id !== currentSelected.id)
                  .filter((i) => !mergeSearch || i.title.toLowerCase().includes(mergeSearch.toLowerCase()))
                  .map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => setMergeTarget(issue)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        mergeTarget?.id === issue.id
                          ? "bg-indigo-500/10 border border-indigo-500/30 text-foreground"
                          : "bg-muted/10 text-muted-foreground hover:bg-muted/20 border border-transparent"
                      }`}
                    >
                      <span className="font-medium">{issue.title}</span>
                      <span className="text-[10px] text-muted-foreground/60 ml-2">({issue.votes} votes)</span>
                    </button>
                  ))}
              </div>

              {mergeTarget && (
                <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3">
                  <p className="text-xs text-indigo-400 font-medium mb-1">Preview merged issue:</p>
                  <p className="text-sm text-foreground font-medium">{mergeTarget.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Combined votes: {mergeTarget.votes + currentSelected.votes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowMergeModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                onClick={handleMerge}
                disabled={!mergeTarget}
              >
                Confirm Merge
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Solve Modal */}
      {showSolveModal && currentSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSolveModal(false)} />
          <div className="relative glass rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Solve Issue
              </h3>
              <button
                onClick={() => setShowSolveModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <p className="text-xs text-emerald-400 font-medium">Resolving:</p>
                <p className="text-sm text-foreground mt-1">{currentSelected.title}</p>
                {discussionTimer > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Discussion time: {formatTime(discussionTimer)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Resolution *</label>
                <textarea
                  value={solveResolution}
                  onChange={(e) => setSolveResolution(e.target.value)}
                  placeholder="How was this issue resolved? What actions were taken?"
                  rows={4}
                  className="w-full rounded-lg bg-muted/30 border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSolveModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground"
                onClick={() => handleSolve(currentSelected.id)}
              >
                Mark as Solved
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Rock Modal */}
      {showConvertRockModal && currentSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConvertRockModal(false)} />
          <div className="relative glass rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Mountain className="h-5 w-5 text-indigo-400" />
                Convert to Rock
              </h3>
              <button
                onClick={() => setShowConvertRockModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rock Title *</label>
                <Input
                  value={rockTitle}
                  onChange={(e) => setRockTitle(e.target.value)}
                  className="h-9 bg-muted/30 border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
                <textarea
                  value={rockDescription}
                  onChange={(e) => setRockDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg bg-muted/30 border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/10 p-3">
                <p className="text-xs text-indigo-400">
                  Original issue will be marked as resolved with a link to this Rock.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConvertRockModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                onClick={handleConvertToRock}
              >
                Create Rock
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to To-Do Modal */}
      {showConvertTodoModal && currentSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConvertTodoModal(false)} />
          <div className="relative glass rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-emerald-400" />
                Convert to To-Do
              </h3>
              <button
                onClick={() => setShowConvertTodoModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To-Do Description *</label>
                <Input
                  value={todoDescription}
                  onChange={(e) => setTodoDescription(e.target.value)}
                  className="h-9 bg-muted/30 border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
                <Input
                  type="date"
                  value={todoDueDate}
                  onChange={(e) => setTodoDueDate(e.target.value)}
                  className="h-9 bg-muted/30 border-border text-sm"
                />
              </div>
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
                <p className="text-xs text-emerald-400">
                  Original issue will be marked as resolved with a link to this To-Do.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConvertTodoModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-primary-foreground"
                onClick={handleConvertToTodo}
              >
                Create To-Do
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cascade Modal */}
      {showCascadeModal && currentSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCascadeModal(false)} />
          <div className="relative glass rounded-2xl border border-border p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Share2 className="h-5 w-5 text-cyan-400" />
                Cascade to Teams
              </h3>
              <button
                onClick={() => setShowCascadeModal(false)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Share this issue with other teams so they can see it in their issues list.
              </p>
              <div className="space-y-2">
                {allTeams
                  .filter((t) => t !== currentSelected.team)
                  .map((team) => {
                    const isSelected = cascadeSelections.has(team);
                    const alreadyCascaded = currentSelected.cascadedTeams.includes(team);
                    return (
                      <button
                        key={team}
                        onClick={() => {
                          setCascadeSelections((prev) => {
                            const next = new Set(prev);
                            if (next.has(team)) next.delete(team);
                            else next.add(team);
                            return next;
                          });
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-cyan-500/10 border border-cyan-500/30 text-foreground"
                            : "bg-muted/10 text-muted-foreground hover:bg-muted/20 border border-transparent"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {team}
                        </span>
                        {alreadyCascaded && (
                          <span className="text-[10px] text-cyan-400">Already shared</span>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCascadeModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-primary-foreground"
                onClick={handleCascade}
                disabled={cascadeSelections.size === 0}
              >
                Share with {cascadeSelections.size} Team{cascadeSelections.size !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
