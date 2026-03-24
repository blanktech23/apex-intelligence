"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  Copy,
  Share2,
  Archive,
  Download,
  LayoutList,
  LayoutGrid,
  Sparkles,
  X,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  Building2,
  User,
  Layers,
  ListTodo,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Types ---

type GoalStatus = "on_track" | "off_track" | "at_risk" | "complete";
type Quarter = "Q1 2026" | "Q2 2026" | "Q3 2026" | "Q4 2026";
type RockType = "company" | "department" | "individual";
type ViewMode = "list" | "board";
type RockTypeFilter = "all" | "company" | "department" | "individual";

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

interface Comment {
  id: string;
  author: string;
  initials: string;
  color: string;
  text: string;
  date: string;
}

interface LinkedItem {
  id: string;
  type: "issue" | "todo" | "kpi";
  title: string;
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
  rockType: RockType;
  sharedWith: string[];
  archived: boolean;
  comments: Comment[];
  linkedItems: LinkedItem[];
}

// --- Config ---

const statusConfig: Record<
  GoalStatus,
  { label: string; dot: string; badge: string; icon: typeof CheckCircle2 }
> = {
  on_track: {
    label: "On Track",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: TrendingUp,
  },
  off_track: {
    label: "Off Track",
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    icon: AlertTriangle,
  },
  at_risk: {
    label: "At Risk",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: AlertTriangle,
  },
  complete: {
    label: "Complete",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

const rockTypeConfig: Record<RockType, { label: string; border: string; badge: string; icon: typeof Building2 }> = {
  company: {
    label: "Company",
    border: "border-l-indigo-500/60",
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Building2,
  },
  department: {
    label: "Department",
    border: "border-l-purple-500/60",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Layers,
  },
  individual: {
    label: "Individual",
    border: "border-l-teal-500/60",
    badge: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    icon: User,
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

const allStatuses: GoalStatus[] = ["on_track", "off_track", "at_risk", "complete"];

// --- Mock Data ---

const initialGoals: Goal[] = [
  {
    id: "goal-001",
    title: "Increase revenue to $2.5M",
    description:
      "Drive quarterly revenue growth through new project acquisition, upselling existing clients, and improving close rates on estimates.",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300" },
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
    rockType: "company",
    sharedWith: ["Finance"],
    archived: false,
    comments: [
      { id: "c1", author: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300", text: "Referral program is showing early traction", date: "2026-03-10" },
    ],
    linkedItems: [
      { id: "li1", type: "kpi", title: "Revenue" },
      { id: "li2", type: "todo", title: "Follow up with 3 referral leads" },
    ],
  },
  {
    id: "goal-002",
    title: "Reduce project delivery time by 20%",
    description:
      "Streamline operations workflows and reduce average project delivery time from 45 days to 36 days through better scheduling and AI-assisted coordination.",
    owner: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-700 dark:text-purple-300" },
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
    rockType: "department",
    sharedWith: [],
    archived: false,
    comments: [],
    linkedItems: [
      { id: "li3", type: "issue", title: "Material supplier delays" },
    ],
  },
  {
    id: "goal-003",
    title: "Achieve 95% customer satisfaction score",
    description:
      "Improve customer communication and project transparency to achieve a 95% or higher satisfaction rating on post-project surveys.",
    owner: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300" },
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
    rockType: "company",
    sharedWith: ["Operations"],
    archived: false,
    comments: [],
    linkedItems: [],
  },
  {
    id: "goal-004",
    title: "Reduce material waste by 15%",
    description:
      "Implement better material estimation, ordering processes, and on-site waste management to reduce material costs and environmental impact.",
    owner: { name: "David Park", initials: "DP", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300" },
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
    rockType: "individual",
    sharedWith: [],
    archived: false,
    comments: [],
    linkedItems: [
      { id: "li4", type: "issue", title: "AI estimation tool vendor delay" },
    ],
  },
  {
    id: "goal-005",
    title: "Hire and onboard 3 new team members",
    description:
      "Expand the team with a project coordinator, senior carpenter, and design assistant to support growing project volume.",
    owner: { name: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-700 dark:text-teal-300" },
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
    rockType: "company",
    sharedWith: [],
    archived: false,
    comments: [
      { id: "c2", author: "Kevin Wu", initials: "KW", color: "bg-teal-500/30 text-teal-700 dark:text-teal-300", text: "All three hires are settling in well", date: "2026-03-16" },
    ],
    linkedItems: [],
  },
  {
    id: "goal-006",
    title: "Launch kitchen & bath design tool MVP",
    description:
      "Build and deploy the first version of the AI-powered kitchen and bathroom design visualization tool for client presentations.",
    owner: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-700 dark:text-pink-300" },
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
    rockType: "department",
    sharedWith: ["Sales"],
    archived: false,
    comments: [],
    linkedItems: [],
  },
  {
    id: "goal-007",
    title: "Establish partnership with 2 major suppliers",
    description:
      "Negotiate volume discount agreements with at least 2 major material suppliers to reduce costs by 8-12% across lumber and fixtures.",
    owner: { name: "Marcus Rivera", initials: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300" },
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
    rockType: "individual",
    sharedWith: ["Operations"],
    archived: false,
    comments: [],
    linkedItems: [
      { id: "li5", type: "kpi", title: "Material Cost %" },
    ],
  },
];

const quarters: Quarter[] = ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"];

// --- Helpers ---

function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function MilestoneBurndownChart({ milestones }: { milestones: Milestone[] }) {
  const total = milestones.length;
  if (total === 0) return null;
  const completed = milestones.filter((m) => m.completed).length;
  const points: { x: number; y: number }[] = [];
  // Simple burndown: from total remaining to current remaining
  const sorted = [...milestones].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  let remaining = total;
  points.push({ x: 0, y: total });
  sorted.forEach((m, i) => {
    if (m.completed) remaining--;
    points.push({ x: ((i + 1) / total) * 100, y: remaining });
  });
  // Ideal line
  const idealPoints = [
    { x: 0, y: total },
    { x: 100, y: 0 },
  ];
  const h = 48;
  const w = 120;
  const toSvg = (p: { x: number; y: number }) => ({
    sx: (p.x / 100) * w,
    sy: h - (p.y / total) * h,
  });

  const actualPath = points
    .map((p, i) => {
      const { sx, sy } = toSvg(p);
      return `${i === 0 ? "M" : "L"}${sx},${sy}`;
    })
    .join(" ");

  const idealPath = idealPoints
    .map((p, i) => {
      const { sx, sy } = toSvg(p);
      return `${i === 0 ? "M" : "L"}${sx},${sy}`;
    })
    .join(" ");

  return (
    <div className="mt-2">
      <p className="text-[10px] text-muted-foreground mb-1">Burndown ({completed}/{total} done)</p>
      <svg width={w} height={h} className="overflow-visible">
        {/* Ideal line */}
        <path d={idealPath} fill="none" className="stroke-border" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
        {/* Actual line */}
        <path d={actualPath} fill="none" stroke="#818cf8" strokeWidth="1.5" />
        {/* Dots */}
        {points.map((p, i) => {
          const { sx, sy } = toSvg(p);
          return <circle key={i} cx={sx} cy={sy} r="2" fill="#818cf8" />;
        })}
      </svg>
    </div>
  );
}

// --- Component ---

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q1 2026");
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rockTypeFilter, setRockTypeFilter] = useState<RockTypeFilter>("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showArchived, setShowArchived] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => { setNow(new Date()); }, []);

  // Modal states
  const [showNewRockModal, setShowNewRockModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [showLinkModal, setShowLinkModal] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // New Rock form
  const [newRock, setNewRock] = useState({
    title: "",
    description: "",
    owner: "Marcus Rivera",
    team: "Sales",
    rockType: "company" as RockType,
    quarter: activeQuarter,
    dueDate: "",
    milestones: [{ title: "", dueDate: "" }],
  });

  // AI assist state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<{
    title: string;
    description: string;
    milestones: { title: string; dueDate: string }[];
  } | null>(null);

  // Comment input
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Share modal state
  const [shareSelections, setShareSelections] = useState<string[]>([]);

  // Link modal state
  const [linkType, setLinkType] = useState<"issue" | "todo" | "kpi">("issue");
  const [linkTitle, setLinkTitle] = useState("");

  // --- Filtering ---
  const filtered = useMemo(() => {
    return goals.filter((g) => {
      if (g.quarter !== activeQuarter) return false;
      if (!showArchived && g.archived) return false;
      if (showArchived && !g.archived) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !g.title.toLowerCase().includes(q) &&
          !g.owner.name.toLowerCase().includes(q) &&
          !g.description.toLowerCase().includes(q)
        )
          return false;
      }
      if (teamFilter !== "All" && g.team !== teamFilter) return false;
      if (ownerFilter !== "All" && g.owner.name !== ownerFilter) return false;
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      if (rockTypeFilter !== "all" && g.rockType !== rockTypeFilter) return false;
      return true;
    });
  }, [goals, activeQuarter, showArchived, searchQuery, teamFilter, ownerFilter, statusFilter, rockTypeFilter]);

  const quarterGoals = useMemo(
    () => goals.filter((g) => g.quarter === activeQuarter && !g.archived),
    [goals, activeQuarter]
  );

  const quarterStats = useMemo(
    () => ({
      total: quarterGoals.length,
      onTrack: quarterGoals.filter((g) => g.status === "on_track").length,
      atRisk: quarterGoals.filter((g) => g.status === "at_risk").length,
      offTrack: quarterGoals.filter((g) => g.status === "off_track").length,
      complete: quarterGoals.filter((g) => g.status === "complete").length,
    }),
    [quarterGoals]
  );

  // --- Actions ---

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const toggleMilestone = useCallback((goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = newMilestones.filter((m) => m.completed).length;
        const newProgress = Math.round((completedCount / newMilestones.length) * 100);
        const newStatus: GoalStatus = newProgress === 100 ? "complete" : g.status === "complete" ? "on_track" : g.status;
        return { ...g, milestones: newMilestones, progress: newProgress, status: newStatus };
      })
    );
  }, []);

  const cycleStatus = useCallback((goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const idx = allStatuses.indexOf(g.status);
        const next = allStatuses[(idx + 1) % allStatuses.length];
        toast.info(`Status changed to ${statusConfig[next].label}`);
        return {
          ...g,
          status: next,
          progress: next === "complete" ? 100 : g.progress,
          activity: [
            { date: new Date().toISOString().slice(0, 10), text: `Status changed to ${statusConfig[next].label}` },
            ...g.activity,
          ],
        };
      })
    );
  }, []);

  const duplicateGoal = useCallback((goal: Goal) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      title: `${goal.title} (Copy)`,
      status: "on_track",
      progress: 0,
      milestones: goal.milestones.map((m) => ({ ...m, id: generateId(), completed: false })),
      activity: [{ date: new Date().toISOString().slice(0, 10), text: `Duplicated from "${goal.title}"` }],
      archived: false,
      comments: [],
      sharedWith: [],
    };
    setGoals((prev) => [...prev, newGoal]);
    toast.success(`Rock duplicated: "${newGoal.title}"`);
  }, []);

  const archiveGoal = useCallback((goalId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              archived: true,
              activity: [
                { date: new Date().toISOString().slice(0, 10), text: "Rock archived" },
                ...g.activity,
              ],
            }
          : g
      )
    );
    toast.success("Rock archived");
  }, []);

  const unarchiveGoal = useCallback((goalId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              archived: false,
              activity: [
                { date: new Date().toISOString().slice(0, 10), text: "Rock restored from archive" },
                ...g.activity,
              ],
            }
          : g
      )
    );
    toast.success("Rock restored from archive");
  }, []);

  const addComment = useCallback((goalId: string) => {
    const text = commentInputs[goalId]?.trim();
    if (!text) return;
    const newComment: Comment = {
      id: generateId(),
      author: "You",
      initials: "YU",
      color: "bg-blue-500/30 text-blue-700 dark:text-blue-300",
      text,
      date: new Date().toISOString().slice(0, 10),
    };
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, comments: [...g.comments, newComment] } : g
      )
    );
    setCommentInputs((prev) => ({ ...prev, [goalId]: "" }));
    toast.success("Comment added");
  }, [commentInputs]);

  const createTodoFromMilestone = useCallback((goalTitle: string, milestoneTitle: string) => {
    toast.success(`To-Do created: "${milestoneTitle}" (from ${goalTitle})`);
  }, []);

  const createIssueFromMilestone = useCallback((goalTitle: string, milestoneTitle: string) => {
    toast.success(`Issue created: "${milestoneTitle}" (from ${goalTitle})`);
  }, []);

  const handleShareGoal = useCallback((goalId: string) => {
    if (shareSelections.length === 0) {
      toast.error("Select at least one team to share with");
      return;
    }
    updateGoal(goalId, { sharedWith: shareSelections });
    toast.success(`Rock shared with ${shareSelections.join(", ")}`);
    setShowShareModal(null);
    setShareSelections([]);
  }, [shareSelections, updateGoal]);

  const handleLinkItem = useCallback((goalId: string) => {
    if (!linkTitle.trim()) {
      toast.error("Enter a title for the linked item");
      return;
    }
    const newItem: LinkedItem = {
      id: generateId(),
      type: linkType,
      title: linkTitle.trim(),
    };
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, linkedItems: [...g.linkedItems, newItem] } : g
      )
    );
    toast.success(`Linked ${linkType}: "${linkTitle.trim()}"`);
    setShowLinkModal(null);
    setLinkTitle("");
  }, [linkType, linkTitle]);

  const removeLinkItem = useCallback((goalId: string, itemId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, linkedItems: g.linkedItems.filter((li) => li.id !== itemId) }
          : g
      )
    );
    toast.info("Link removed");
  }, []);

  const handleCreateRock = useCallback(() => {
    if (!newRock.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const ownerMap: Record<string, { initials: string; color: string }> = {
      "Marcus Rivera": { initials: "MR", color: "bg-indigo-500/30 text-indigo-700 dark:text-indigo-300" },
      "Sarah Chen": { initials: "SC", color: "bg-purple-500/30 text-purple-700 dark:text-purple-300" },
      "David Park": { initials: "DP", color: "bg-amber-500/30 text-amber-700 dark:text-amber-300" },
      "Lisa Torres": { initials: "LT", color: "bg-emerald-500/30 text-emerald-700 dark:text-emerald-300" },
      "Kevin Wu": { initials: "KW", color: "bg-teal-500/30 text-teal-700 dark:text-teal-300" },
      "Amy Foster": { initials: "AF", color: "bg-pink-500/30 text-pink-700 dark:text-pink-300" },
    };
    const ow = ownerMap[newRock.owner] || { initials: "??", color: "bg-gray-500/30 text-muted-foreground" };

    const milestones: Milestone[] = newRock.milestones
      .filter((m) => m.title.trim())
      .map((m) => ({
        id: generateId(),
        title: m.title,
        dueDate: m.dueDate || newRock.dueDate || "2026-03-31",
        completed: false,
      }));

    const goal: Goal = {
      id: generateId(),
      title: newRock.title.trim(),
      description: newRock.description.trim(),
      owner: { name: newRock.owner, ...ow },
      team: newRock.team,
      status: "on_track",
      progress: 0,
      dueDate: newRock.dueDate || "2026-03-31",
      quarter: newRock.quarter as Quarter,
      milestones,
      relatedKpis: [],
      activity: [{ date: new Date().toISOString().slice(0, 10), text: `Rock created by ${newRock.owner}` }],
      rockType: newRock.rockType,
      sharedWith: [],
      archived: false,
      comments: [],
      linkedItems: [],
    };

    setGoals((prev) => [...prev, goal]);
    toast.success(`Rock created: "${goal.title}"`);
    setShowNewRockModal(false);
    setNewRock({
      title: "",
      description: "",
      owner: "Marcus Rivera",
      team: "Sales",
      rockType: "company",
      quarter: activeQuarter,
      dueDate: "",
      milestones: [{ title: "", dueDate: "" }],
    });
  }, [newRock, activeQuarter]);

  const handleAiGenerate = useCallback(() => {
    setAiGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setAiResult({
        title: "Increase gross margin to 42% through operational efficiency",
        description:
          "Achieve a 42% gross margin by optimizing labor scheduling, reducing material waste, and renegotiating supplier contracts. Measurable through monthly P&L tracking with a target completion by end of quarter.",
        milestones: [
          { title: "Audit current labor utilization rates across all crews", dueDate: "2026-04-15" },
          { title: "Implement automated scheduling to reduce overtime by 20%", dueDate: "2026-05-01" },
          { title: "Renegotiate top 3 supplier contracts for volume discounts", dueDate: "2026-05-15" },
          { title: "Achieve 40% gross margin milestone", dueDate: "2026-06-01" },
          { title: "Reach and sustain 42% gross margin target", dueDate: "2026-06-30" },
        ],
      });
      setAiGenerating(false);
    }, 1500);
  }, []);

  const handleAiAccept = useCallback(() => {
    if (!aiResult) return;
    setNewRock((prev) => ({
      ...prev,
      title: aiResult.title,
      description: aiResult.description,
      milestones: aiResult.milestones.map((m) => ({ title: m.title, dueDate: m.dueDate })),
    }));
    setAiResult(null);
    setShowAiModal(false);
    setShowNewRockModal(true);
    toast.success("AI suggestion applied to new Rock form");
  }, [aiResult]);

  const handleExport = useCallback((format: "csv" | "pdf") => {
    setShowExportDropdown(false);
    toast.success(`Exported ${filtered.length} rocks as ${format.toUpperCase()}`);
  }, [filtered.length]);

  const moveToStatus = useCallback((goalId: string, newStatus: GoalStatus) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          status: newStatus,
          progress: newStatus === "complete" ? 100 : g.progress,
          activity: [
            { date: new Date().toISOString().slice(0, 10), text: `Status changed to ${statusConfig[newStatus].label}` },
            ...g.activity,
          ],
        };
      })
    );
    toast.info(`Moved to ${statusConfig[newStatus].label}`);
  }, []);

  // --- Board view grouping ---
  const boardColumns: { status: GoalStatus; label: string; color: string }[] = [
    { status: "on_track", label: "On Track", color: "border-t-emerald-500/60" },
    { status: "at_risk", label: "At Risk", color: "border-t-amber-500/60" },
    { status: "off_track", label: "Off Track", color: "border-t-red-500/60" },
    { status: "complete", label: "Complete", color: "border-t-emerald-400/60" },
  ];

  const boardGroups = useMemo(() => {
    const groups: Record<GoalStatus, Goal[]> = {
      on_track: [],
      at_risk: [],
      off_track: [],
      complete: [],
    };
    filtered.forEach((g) => {
      groups[g.status].push(g);
    });
    return groups;
  }, [filtered]);

  // --- Rendering helpers ---

  const renderRockTypeBadge = (type: RockType) => {
    const cfg = rockTypeConfig[type];
    const Icon = cfg.icon;
    return (
      <Badge variant="outline" className={`${cfg.badge} text-[10px] px-1.5 py-0 h-4`}>
        <Icon className="h-2.5 w-2.5 mr-0.5" />
        {cfg.label}
      </Badge>
    );
  };

  const renderGoalCard = (goal: Goal, compact?: boolean) => {
    const config = statusConfig[goal.status];
    const StatusIcon = config.icon;
    const isExpanded = expandedGoal === goal.id && !compact;
    const completedMilestones = goal.milestones.filter((m) => m.completed).length;
    const typeConfig = rockTypeConfig[goal.rockType];

    return (
      <div
        key={goal.id}
        className={`rounded-xl bg-card border border-border backdrop-blur-xl overflow-hidden transition-all border-l-2 ${typeConfig.border}`}
      >
        {/* Card header */}
        <div className="w-full text-left p-5">
          <div className="flex items-start gap-4">
            {/* Expand chevron */}
            {!compact && (
              <button
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                className="mt-1 shrink-0 hover:bg-card rounded p-0.5 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <button
                    onClick={() => !compact && setExpandedGoal(isExpanded ? null : goal.id)}
                    className="text-left"
                  >
                    <h3 className="font-semibold text-foreground hover:text-indigo-600 dark:text-indigo-400 transition-colors truncate">
                      {goal.title}
                    </h3>
                  </button>
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
                    {/* Rock Type */}
                    {renderRockTypeBadge(goal.rockType)}
                    {/* Shared badge */}
                    {goal.sharedWith.length > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <Share2 className="h-2.5 w-2.5 mr-0.5" />
                        Shared: {goal.sharedWith.join(", ")}
                      </Badge>
                    )}
                    {/* Milestones */}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      {completedMilestones}/{goal.milestones.length} milestones
                    </span>
                    {/* Due date */}
                    <span className="text-xs text-muted-foreground flex items-center gap-1" suppressHydrationWarning>
                      <CalendarDays className="h-3 w-3" />
                      {new Date(goal.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status badge - clickable */}
                  <button onClick={() => cycleStatus(goal.id)} title="Click to change status">
                    <Badge variant="outline" className={`${config.badge} cursor-pointer hover:opacity-80 transition-opacity`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                  </button>
                  {/* Actions dropdown */}
                  {!compact && (
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === `actions-${goal.id}` ? null : `actions-${goal.id}`)}
                        className="p-1 rounded hover:bg-card transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {openDropdown === `actions-${goal.id}` && (
                        <div className="glass absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
                          <button
                            onClick={() => { duplicateGoal(goal); setOpenDropdown(null); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" /> Duplicate Rock
                          </button>
                          <button
                            onClick={() => { setShowShareModal(goal.id); setShareSelections(goal.sharedWith); setOpenDropdown(null); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                          >
                            <Share2 className="h-3.5 w-3.5" /> Share Rock
                          </button>
                          <button
                            onClick={() => { setShowLinkModal(goal.id); setOpenDropdown(null); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Link Item
                          </button>
                          {goal.status === "complete" && !goal.archived && (
                            <button
                              onClick={() => { archiveGoal(goal.id); setOpenDropdown(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                            >
                              <Archive className="h-3.5 w-3.5" /> Archive
                            </button>
                          )}
                          {goal.archived && (
                            <button
                              onClick={() => { unarchiveGoal(goal.id); setOpenDropdown(null); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                            >
                              <Archive className="h-3.5 w-3.5" /> Restore
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-foreground/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Board view: move to status dropdown */}
        {compact && (
          <div className="px-5 pb-3">
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === `move-${goal.id}` ? null : `move-${goal.id}`)}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowRight className="h-3 w-3" /> Move to...
              </button>
              {openDropdown === `move-${goal.id}` && (
                <div className="glass absolute left-0 bottom-full z-50 mb-1 min-w-[140px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
                  {allStatuses
                    .filter((s) => s !== goal.status)
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => { moveToStatus(goal.id, s); setOpenDropdown(null); }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                      >
                        <div className={`h-2 w-2 rounded-full ${statusConfig[s].dot}`} />
                        {statusConfig[s].label}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expanded detail */}
        {isExpanded && (
          <div className="border-t border-border px-5 pb-5">
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

                <Separator className="bg-border" />

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Milestones
                    </h4>
                    <MilestoneBurndownChart milestones={goal.milestones} />
                  </div>
                  <div className="space-y-2">
                    {goal.milestones.map((milestone) => {
                      const isOverdue = !milestone.completed && now != null && new Date(milestone.dueDate) < now;
                      return (
                        <div
                          key={milestone.id}
                          className={`flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5 group ${
                            isOverdue ? "ring-1 ring-red-500/30" : ""
                          }`}
                        >
                          <button
                            onClick={() => toggleMilestone(goal.id, milestone.id)}
                            className={`h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                              milestone.completed
                                ? "bg-emerald-500/20 border-emerald-500/40"
                                : "border-foreground/15 hover:border-emerald-500/40"
                            }`}
                          >
                            {milestone.completed && (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </button>
                          <span
                            className={`text-sm flex-1 ${
                              milestone.completed ? "text-muted-foreground line-through" : "text-foreground"
                            }`}
                          >
                            {milestone.title}
                          </span>
                          <span className={`text-xs shrink-0 ${isOverdue ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}`} suppressHydrationWarning>
                            {isOverdue && <AlertCircle className="h-3 w-3 inline mr-1" />}
                            {new Date(milestone.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {/* Milestone actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => createTodoFromMilestone(goal.title, milestone.title)}
                              className="p-1 rounded hover:bg-muted/60 transition-colors"
                              title="Create To-Do"
                            >
                              <ListTodo className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button
                              onClick={() => createIssueFromMilestone(goal.title, milestone.title)}
                              className="p-1 rounded hover:bg-muted/60 transition-colors"
                              title="Create Issue"
                            >
                              <AlertCircle className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Linked Items */}
                {goal.linkedItems.length > 0 && (
                  <>
                    <Separator className="bg-border" />
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Linked Items
                      </h4>
                      <div className="space-y-1.5">
                        {goal.linkedItems.map((item) => {
                          const typeIcon = item.type === "issue" ? AlertCircle : item.type === "todo" ? ListTodo : TrendingUp;
                          const TypeIcon = typeIcon;
                          const typeColor = item.type === "issue" ? "text-red-600 dark:text-red-400" : item.type === "todo" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400";
                          return (
                            <div key={item.id} className="flex items-center gap-2 group">
                              <TypeIcon className={`h-3 w-3 ${typeColor}`} />
                              <button
                                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 transition-colors"
                                onClick={() => {
                                  const routeMap: Record<string, string> = { goal: '/bos/goals', rock: '/bos/goals', milestone: '/bos/goals', kpi: '/bos/kpis', issue: '/bos/issues', todo: '/bos/goals' };
                                  router.push(routeMap[item.type] ?? '/bos');
                                  toast.success(`Viewing ${item.type}: "${item.title}"`);
                                }}
                              >
                                {item.title}
                              </button>
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 border-border text-muted-foreground">
                                {item.type}
                              </Badge>
                              <button
                                onClick={() => removeLinkItem(goal.id, item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted/60"
                                title="Remove link"
                              >
                                <X className="h-3 w-3 text-muted-foreground" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
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
                        className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 cursor-pointer transition-colors"
                        onClick={() => {
                          router.push('/bos/kpis');
                          toast.success(`Viewing KPI: ${kpi}`);
                        }}
                      >
                        <Link2 className="h-3 w-3" />
                        {kpi}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border" />

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
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5" suppressHydrationWarning>
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

                <Separator className="bg-border" />

                {/* Comments */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Comments ({goal.comments.length})
                  </h4>
                  <div className="space-y-3">
                    {goal.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarFallback className={`${comment.color} text-[7px]`}>
                            {comment.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-foreground">{comment.author}</span>
                            <span className="text-[10px] text-muted-foreground/60" suppressHydrationWarning>
                              {new Date(comment.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add a comment..."
                        value={commentInputs[goal.id] || ""}
                        onChange={(e) => setCommentInputs((prev) => ({ ...prev, [goal.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addComment(goal.id)}
                        className="h-8 rounded-lg border-border bg-muted/30 text-xs placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => addComment(goal.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" onClick={() => { if (openDropdown) setOpenDropdown(null); if (showExportDropdown) setShowExportDropdown(false); }}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Goals & Milestones</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track quarterly Rocks and milestone progress
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Assist */}
          <Button
            variant="outline"
            className="gap-2 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 hover:text-purple-700 dark:text-purple-300"
            onClick={(e) => { e.stopPropagation(); setShowAiModal(true); }}
          >
            <Sparkles className="h-4 w-4" />
            AI Assist
            <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[9px] px-1 py-0 h-3.5 ml-1">
              Beta
            </Badge>
          </Button>
          {/* Export dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {showExportDropdown && (
              <div className="glass absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" /> Export CSV
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" /> Export PDF
                </button>
              </div>
            )}
          </div>
          {/* New Rock button */}
          <Button
            className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2"
            onClick={(e) => { e.stopPropagation(); setShowNewRockModal(true); }}
          >
            <Plus className="h-4 w-4" />
            New Rock
          </Button>
        </div>
      </div>

      {/* Quarter Tabs + View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="glass rounded-xl p-1.5">
          <div className="flex flex-wrap gap-1">
          {quarters.map((q) => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all ${
                activeQuarter === q
                  ? "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}
            >
              {q}
            </button>
          ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="glass rounded-lg p-1 inline-flex gap-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "list" ? "bg-indigo-600 text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "board" ? "bg-indigo-600 text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Board view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          {/* Archive toggle */}
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              showArchived
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {showArchived ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showArchived ? "Archived" : "Active"}</span>
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: quarterStats.total, color: "text-foreground" },
          { label: "On Track", value: quarterStats.onTrack, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "At Risk", value: quarterStats.atRisk, color: "text-amber-600 dark:text-amber-400" },
          { label: "Off Track", value: quarterStats.offTrack, color: "text-red-600 dark:text-red-400" },
          { label: "Complete", value: quarterStats.complete, color: "text-emerald-600 dark:text-emerald-400" },
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
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        {/* Rock Type filter */}
        <div className="glass rounded-lg p-1 inline-flex gap-0.5">
          {(
            [
              { value: "all", label: "All" },
              { value: "company", label: "Company" },
              { value: "department", label: "Dept" },
              { value: "individual", label: "Individual" },
            ] as { value: RockTypeFilter; label: string }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRockTypeFilter(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                rockTypeFilter === opt.value
                  ? "bg-indigo-600 text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
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

      {/* Goals - List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {showArchived ? "No archived rocks for this quarter." : "No rocks match the current filters."}
              </p>
            </div>
          ) : (
            filtered.map((goal) => renderGoalCard(goal))
          )}
        </div>
      )}

      {/* Goals - Board View */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {boardColumns.map((col) => (
            <div key={col.status} className={`glass rounded-xl border-t-2 ${col.color}`}>
              <div className="p-4 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border text-muted-foreground">
                  {boardGroups[col.status].length}
                </Badge>
              </div>
              <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                {boardGroups[col.status].length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground/60">No rocks</p>
                  </div>
                ) : (
                  boardGroups[col.status].map((goal) => renderGoalCard(goal, true))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========== MODALS ========== */}

      {/* New Rock Modal */}
      {showNewRockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewRockModal(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-popover border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Create New Rock</h2>
              <button onClick={() => setShowNewRockModal(false)} className="p-1 rounded hover:bg-muted/60 transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                <Input
                  placeholder="Enter Rock title..."
                  value={newRock.title}
                  onChange={(e) => setNewRock((prev) => ({ ...prev, title: e.target.value }))}
                  className="h-10 rounded-lg border-border bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea
                  placeholder="Describe this Rock..."
                  value={newRock.description}
                  onChange={(e) => setNewRock((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30 focus:outline-none resize-none"
                />
              </div>

              {/* Row: Owner, Team, Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Owner</label>
                  <select
                    value={newRock.owner}
                    onChange={(e) => setNewRock((prev) => ({ ...prev, owner: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {ownerOptions.filter((o) => o !== "All").map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Team</label>
                  <select
                    value={newRock.team}
                    onChange={(e) => setNewRock((prev) => ({ ...prev, team: e.target.value }))}
                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {teamOptions.filter((t) => t !== "All").map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <select
                    value={newRock.rockType}
                    onChange={(e) => setNewRock((prev) => ({ ...prev, rockType: e.target.value as RockType }))}
                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="company">Company</option>
                    <option value="department">Department</option>
                    <option value="individual">Individual</option>
                  </select>
                </div>
              </div>

              {/* Row: Quarter, Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Quarter</label>
                  <select
                    value={newRock.quarter}
                    onChange={(e) => setNewRock((prev) => ({ ...prev, quarter: e.target.value as Quarter }))}
                    className="w-full h-9 rounded-lg border border-border bg-muted/30 px-2 text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    {quarters.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={newRock.dueDate}
                    onChange={(e) => setNewRock((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="h-9 rounded-lg border-border bg-muted/30 text-sm focus-visible:border-primary focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              {/* Milestones builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground">Milestones</label>
                  <button
                    onClick={() => setNewRock((prev) => ({ ...prev, milestones: [...prev.milestones, { title: "", dueDate: "" }] }))}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="h-3 w-3" /> Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {newRock.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        placeholder={`Milestone ${i + 1}...`}
                        value={m.title}
                        onChange={(e) => {
                          const ms = [...newRock.milestones];
                          ms[i] = { ...ms[i], title: e.target.value };
                          setNewRock((prev) => ({ ...prev, milestones: ms }));
                        }}
                        className="h-8 flex-1 rounded-lg border-border bg-muted/30 text-xs placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
                      />
                      <Input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) => {
                          const ms = [...newRock.milestones];
                          ms[i] = { ...ms[i], dueDate: e.target.value };
                          setNewRock((prev) => ({ ...prev, milestones: ms }));
                        }}
                        className="h-8 w-36 rounded-lg border-border bg-muted/30 text-xs focus-visible:border-primary focus-visible:ring-primary/30"
                      />
                      {newRock.milestones.length > 1 && (
                        <button
                          onClick={() => {
                            const ms = newRock.milestones.filter((_, idx) => idx !== i);
                            setNewRock((prev) => ({ ...prev, milestones: ms }));
                          }}
                          className="p-1 rounded hover:bg-muted/60 transition-colors"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowNewRockModal(false)}>Cancel</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                onClick={handleCreateRock}
              >
                Create Rock
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setShowShareModal(null); setShareSelections([]); }}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-50 w-full max-w-md rounded-xl bg-popover border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Share Rock</h2>
              <button onClick={() => { setShowShareModal(null); setShareSelections([]); }} className="p-1 rounded hover:bg-muted/60 transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Select teams to share this Rock with:</p>
            <div className="space-y-2">
              {teamOptions.filter((t) => t !== "All").map((team) => (
                <label key={team} className="flex items-center gap-3 p-2 rounded-lg hover:bg-card cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={shareSelections.includes(team)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShareSelections((prev) => [...prev, team]);
                      } else {
                        setShareSelections((prev) => prev.filter((t) => t !== team));
                      }
                    }}
                    className="h-4 w-4 rounded border-border accent-indigo-600"
                  />
                  <span className="text-sm text-foreground">{team}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => { setShowShareModal(null); setShareSelections([]); }}>Cancel</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                onClick={() => handleShareGoal(showShareModal)}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Link Item Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setShowLinkModal(null); setLinkTitle(""); }}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-50 w-full max-w-md rounded-xl bg-popover border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Link Item</h2>
              <button onClick={() => { setShowLinkModal(null); setLinkTitle(""); }} className="p-1 rounded hover:bg-muted/60 transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Item Type</label>
                <div className="flex gap-2">
                  {(["issue", "todo", "kpi"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setLinkType(type)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        linkType === type
                          ? "bg-indigo-600 text-primary-foreground"
                          : "glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type === "issue" ? "Issue" : type === "todo" ? "To-Do" : "KPI"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
                <Input
                  placeholder={`Enter ${linkType} title...`}
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLinkItem(showLinkModal)}
                  className="h-9 rounded-lg border-border bg-muted/30 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => { setShowLinkModal(null); setLinkTitle(""); }}>Cancel</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                onClick={() => handleLinkItem(showLinkModal)}
              >
                Link Item
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assist Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setShowAiModal(false); setAiResult(null); }}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-50 w-full max-w-lg rounded-xl bg-popover border border-border p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-foreground">AI Rock Assistant</h2>
                <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[9px] px-1 py-0 h-3.5">
                  Beta
                </Badge>
              </div>
              <button onClick={() => { setShowAiModal(false); setAiResult(null); }} className="p-1 rounded hover:bg-muted/60 transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {!aiResult ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Let AI suggest a SMART-formatted Rock with title, description, and milestones based on your company goals and current quarter.
                </p>
                <div className="glass rounded-lg p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">AI will generate:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> SMART-formatted Rock title</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Detailed description with measurable outcomes</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> 3-5 milestones with due dates</li>
                  </ul>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-500 text-primary-foreground gap-2"
                  onClick={handleAiGenerate}
                  disabled={aiGenerating}
                >
                  {aiGenerating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Rock Suggestion
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Suggested Title</label>
                  <div className="glass rounded-lg px-3 py-2.5">
                    <p className="text-sm text-foreground font-medium">{aiResult.title}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Suggested Description</label>
                  <div className="glass rounded-lg px-3 py-2.5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{aiResult.description}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Suggested Milestones</label>
                  <div className="space-y-1.5">
                    {aiResult.milestones.map((m, i) => (
                      <div key={i} className="glass rounded-lg px-3 py-2 flex items-center justify-between">
                        <span className="text-xs text-foreground">{m.title}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0 ml-2" suppressHydrationWarning>
                          {new Date(m.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                  >
                    {aiGenerating ? "Regenerating..." : "Regenerate"}
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-primary-foreground"
                    onClick={handleAiAccept}
                  >
                    Use This Suggestion
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
