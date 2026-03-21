"use client";

import { useState } from "react";
import Link from "next/link";
import { useRole } from "@/lib/role-context";
import {
  Mail,
  FileText,
  CalendarClock,
  Receipt,
  UserCheck,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Pencil,
  Bot,
  Headphones,
  Calculator,
  Calendar,
  BookOpen,
  Briefcase,
  Send,
  Eye,
  PauseCircle,
  Users,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Priority = "HIGH" | "MEDIUM" | "LOW";
type ApprovalStatus = "pending" | "approved" | "rejected";
type FilterTab = "all" | "pending" | "approved" | "rejected";

interface ApprovalAction {
  id: string;
  type: string;
  typeIcon: React.ComponentType<{ className?: string }>;
  agent: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  priority: Priority;
  title: string;
  preview: string;
  details?: string[];
  timestamp: string;
  status: ApprovalStatus;
  buttons: {
    approve: string;
    edit: string;
    reject: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const priorityConfig: Record<
  Priority,
  { bg: string; text: string; ring: string; label: string }
> = {
  HIGH: {
    bg: "bg-red-400/10",
    text: "text-red-400",
    ring: "ring-red-400/20",
    label: "High",
  },
  MEDIUM: {
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    ring: "ring-amber-400/20",
    label: "Medium",
  },
  LOW: {
    bg: "bg-blue-400/10",
    text: "text-blue-400",
    ring: "ring-blue-400/20",
    label: "Low",
  },
};

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const mockApprovals: ApprovalAction[] = [
  {
    id: "apr-001",
    type: "Email Send",
    typeIcon: Mail,
    agent: { name: "Customer Support Agent", icon: Headphones },
    priority: "HIGH",
    title:
      "Send apology email to Sarah Chen regarding invoice #4521 overcharge",
    preview:
      '"Dear Sarah, I sincerely apologize for the billing error on invoice #4521. We have identified an overcharge of $340 and will be issuing a credit to your account within 2 business days..."',
    timestamp: "3 min ago",
    status: "pending",
    buttons: { approve: "Approve", edit: "Edit", reject: "Reject" },
  },
  {
    id: "apr-002",
    type: "Estimate Generation",
    typeIcon: FileText,
    agent: { name: "Estimation Agent", icon: Calculator },
    priority: "MEDIUM",
    title:
      "Submit estimate #EST-2847 to Rivera General Contracting — $47,200 for bathroom renovation",
    preview: "",
    details: [
      "Demolition & Haul-away — $4,800",
      "Plumbing rough-in — $8,200",
      "Tile & Flooring — $12,400",
      "Fixtures & Vanity — $9,600",
      "Electrical & Lighting — $5,400",
      "Finishing & Paint — $6,800",
    ],
    timestamp: "8 min ago",
    status: "pending",
    buttons: {
      approve: "Approve & Send",
      edit: "Review Details",
      reject: "Reject",
    },
  },
  {
    id: "apr-003",
    type: "Schedule Change",
    typeIcon: CalendarClock,
    agent: { name: "Scheduling Agent", icon: Calendar },
    priority: "HIGH",
    title:
      "Reschedule Mike Torres crew from Lakewood to Summit Heights on Thursday due to material delay",
    preview: "",
    details: [
      "Before: Lakewood Residence — Thu 8:00 AM - 4:00 PM",
      "After: Summit Heights Commercial — Thu 8:00 AM - 4:00 PM",
      "Reason: Lumber delivery delayed to Friday at Lakewood",
    ],
    timestamp: "14 min ago",
    status: "pending",
    buttons: {
      approve: "Approve",
      edit: "Suggest Alternative",
      reject: "Reject",
    },
  },
  {
    id: "apr-004",
    type: "Invoice Creation",
    typeIcon: Receipt,
    agent: { name: "Bookkeeping Agent", icon: BookOpen },
    priority: "MEDIUM",
    title:
      "Generate invoice #INV-1893 for Castillo Residence — $8,400 progress payment",
    preview: "",
    details: [
      "Framing completion (40%) — $3,360",
      "Electrical rough-in — $2,520",
      "HVAC ductwork — $2,520",
    ],
    timestamp: "22 min ago",
    status: "pending",
    buttons: {
      approve: "Approve & Send",
      edit: "Edit Amount",
      reject: "Reject",
    },
  },
  {
    id: "apr-005",
    type: "Customer Follow-up",
    typeIcon: UserCheck,
    agent: { name: "Sales Agent", icon: Briefcase },
    priority: "LOW",
    title: "Send follow-up email to 3 leads who haven't responded in 7 days",
    preview: "",
    details: [
      "Marcus Webb — Last contact: Mar 9 (kitchen remodel inquiry)",
      "Diana Flores — Last contact: Mar 8 (new construction quote)",
      "Robert Kim — Last contact: Mar 7 (deck addition estimate)",
    ],
    timestamp: "35 min ago",
    status: "pending",
    buttons: {
      approve: "Approve All",
      edit: "Review Each",
      reject: "Skip",
    },
  },
  {
    id: "apr-006",
    type: "Report Distribution",
    typeIcon: BarChart3,
    agent: { name: "Project Management Agent", icon: Briefcase },
    priority: "LOW",
    title: "Distribute weekly project status report to 4 stakeholders",
    preview: "",
    details: [
      "Recipients: J. Martinez, S. Chen, R. Patel, T. Brooks",
      "Report covers: 6 active projects, 2 completions, 1 delay",
      "Includes budget vs. actual variance analysis",
    ],
    timestamp: "48 min ago",
    status: "pending",
    buttons: {
      approve: "Approve & Send",
      edit: "Review Report",
      reject: "Hold",
    },
  },
  {
    id: "apr-007",
    type: "Email Send",
    typeIcon: Mail,
    agent: { name: "Customer Support Agent", icon: Headphones },
    priority: "MEDIUM",
    title:
      "Send project completion survey to Thompson family for deck renovation",
    preview:
      '"Hi Mark and Lisa, congratulations on your newly completed deck! We\'d love to hear about your experience. Please take a moment to fill out this brief satisfaction survey..."',
    timestamp: "1h ago",
    status: "pending",
    buttons: { approve: "Approve", edit: "Edit", reject: "Reject" },
  },
  {
    id: "apr-008",
    type: "Schedule Change",
    typeIcon: CalendarClock,
    agent: { name: "Scheduling Agent", icon: Calendar },
    priority: "LOW",
    title:
      "Add overtime slot for Rodriguez crew on Saturday to meet project deadline",
    preview: "",
    details: [
      "Project: Oakwood Commercial Build — Phase 2",
      "Proposed: Saturday 7:00 AM - 3:00 PM (8h overtime)",
      "Deadline impact: Keeps project on track for March 28 handoff",
    ],
    timestamp: "1h ago",
    status: "pending",
    buttons: {
      approve: "Approve",
      edit: "Suggest Alternative",
      reject: "Reject",
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: build editable content from an approval item               */
/* ------------------------------------------------------------------ */

function getEditableContent(action: ApprovalAction): string {
  if (action.preview) return action.preview;
  if (action.details && action.details.length > 0) return action.details.join("\n");
  return action.title;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ApprovalsPage() {
  const { role, config } = useRole();

  const [statuses, setStatuses] = useState<Record<string, ApprovalStatus>>(
    Object.fromEntries(mockApprovals.map((a) => [a.id, a.status]))
  );
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [flashApproved, setFlashApproved] = useState<string | null>(null);

  /* Fix 2: Store rejection reasons per item */
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  /* Fix 1: Edit dialog state */
  const [editTarget, setEditTarget] = useState<ApprovalAction | null>(null);
  const [editedContent, setEditedContent] = useState("");

  /* Fix 1 & 5: Track which items have been edited, and status timestamps */
  const [editedItems, setEditedItems] = useState<Set<string>>(new Set());
  const [statusTimestamps, setStatusTimestamps] = useState<Record<string, string>>({});

  // RBAC: Designer, Bookkeeper, Viewer cannot access approvals
  if (!config.canApprove) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have permission to view approvals. Contact your admin for access.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const counts = {
    all: mockApprovals.length,
    pending: Object.values(statuses).filter((s) => s === "pending").length,
    approved: Object.values(statuses).filter((s) => s === "approved").length,
    rejected: Object.values(statuses).filter((s) => s === "rejected").length,
  };

  const filtered = mockApprovals.filter((a) => {
    if (activeTab === "all") return true;
    return statuses[a.id] === activeTab;
  });

  const handleApprove = (id: string) => {
    setFlashApproved(id);
    setTimeout(() => {
      setStatuses((prev) => ({ ...prev, [id]: "approved" }));
      setStatusTimestamps((prev) => ({ ...prev, [id]: "just now" }));
      setFlashApproved(null);
      toast.success("Action approved successfully");
    }, 600);
  };

  const handleReject = (id: string) => {
    setRejectTarget(id);
    setRejectReason("");
  };

  /* Fix 2: Store rejection reason and include in toast */
  const confirmReject = () => {
    if (rejectTarget) {
      const reason = rejectReason.trim();
      setStatuses((prev) => ({ ...prev, [rejectTarget]: "rejected" }));
      setStatusTimestamps((prev) => ({ ...prev, [rejectTarget]: "just now" }));
      if (reason) {
        setRejectionReasons((prev) => ({ ...prev, [rejectTarget]: reason }));
      }
      setRejectTarget(null);
      setRejectReason("");
      const truncated = reason.length > 60 ? reason.slice(0, 60) + "..." : reason;
      toast.success(reason ? `Action rejected: ${truncated}` : "Action rejected");
    }
  };

  /* Fix 1: Open the edit dialog */
  const handleEdit = (action: ApprovalAction) => {
    setEditTarget(action);
    setEditedContent(getEditableContent(action));
  };

  /* Fix 1: Save edits */
  const handleSaveEdit = () => {
    if (editTarget) {
      setEditedItems((prev) => new Set(prev).add(editTarget.id));
      setEditTarget(null);
      setEditedContent("");
      toast.success("Changes saved \u2014 ready for approval");
    }
  };

  /* Action button icons */
  const approveIcon = <CheckCircle2 className="h-3.5 w-3.5" />;
  const editIcon = <Pencil className="h-3.5 w-3.5" />;
  const rejectIcon = <XCircle className="h-3.5 w-3.5" />;

  /* Map certain edit labels to more fitting icons */
  const editButtonIcon = (label: string) => {
    if (label === "Review Details" || label === "Review Report" || label === "Review Each")
      return <Eye className="h-3.5 w-3.5" />;
    if (label === "Suggest Alternative") return <CalendarClock className="h-3.5 w-3.5" />;
    if (label === "Hold") return <PauseCircle className="h-3.5 w-3.5" />;
    return editIcon;
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Action Approvals
          </h1>
          <span className="flex h-6 items-center rounded-full bg-amber-400/15 px-2.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/20">
            {counts.pending} pending
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="glass flex items-center gap-1 rounded-lg p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${
                activeTab === tab.value
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {counts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Pending */}
        <div className="glass glow-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {counts.pending}
              </p>
              <p className="text-xs text-muted-foreground">
                Pending Approvals
              </p>
            </div>
          </div>
        </div>

        {/* Fix 3: Approved today — reactive count */}
        <div className="glass glow-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{counts.approved}</p>
              <p className="text-xs text-muted-foreground">Approved Today</p>
            </div>
          </div>
        </div>

        {/* Fix 3: Avg response time — realistic static value */}
        <div className="glass glow-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">&lt; 5 min</p>
              <p className="text-xs text-muted-foreground">
                Avg Response Time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Approval cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <CheckCircle2 className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">
              No actions to show
            </p>
          </div>
        ) : (
          filtered.map((action) => {
            const status = statuses[action.id];
            const priority = priorityConfig[action.priority];
            const TypeIcon = action.typeIcon;
            const AgentIcon = action.agent.icon;
            const isApproved = status === "approved";
            const isRejected = status === "rejected";
            const isPending = status === "pending";
            const isFlashing = flashApproved === action.id;
            const isEdited = editedItems.has(action.id);
            const rejectionReason = rejectionReasons[action.id];
            const statusTime = statusTimestamps[action.id];

            return (
              <div
                key={action.id}
                className={`glass rounded-xl border transition-all duration-500 ${
                  isFlashing
                    ? "border-green-500/60 bg-green-500/5 scale-[0.99]"
                    : isApproved
                    ? "border-green-500/30 opacity-75"
                    : isRejected
                    ? "border-red-500/30 opacity-60"
                    : "border-border"
                } ${!isPending && !isFlashing ? "animate-in fade-in slide-in-from-bottom-2 duration-500" : ""}`}
              >
                <div className="p-5">
                  {/* Top bar: type icon + agent + priority + timestamp + status */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {/* Action type */}
                    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
                      <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {action.type}
                      </span>
                    </div>

                    {/* Agent badge */}
                    <div className="flex items-center gap-1.5 rounded-md bg-primary/[0.06] px-2 py-1">
                      <AgentIcon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {action.agent.name}
                      </span>
                    </div>

                    {/* Priority */}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${priority.bg} ${priority.text} ${priority.ring}`}
                    >
                      {priority.label}
                    </span>

                    {/* Fix 1: Edited badge */}
                    {isEdited && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 ring-1 ring-amber-400/20">
                        <Pencil className="h-2.5 w-2.5" />
                        Edited
                      </span>
                    )}

                    {/* Fix 5: Status badge with timestamp (when not pending) */}
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-2 py-0.5 text-[11px] font-semibold text-green-400 ring-1 ring-green-400/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved {statusTime && <span className="font-normal opacity-70">{statusTime}</span>}
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-400/10 px-2 py-0.5 text-[11px] font-semibold text-red-400 ring-1 ring-red-400/20">
                        <XCircle className="h-3 w-3" />
                        Rejected {statusTime && <span className="font-normal opacity-70">{statusTime}</span>}
                      </span>
                    )}

                    {/* Timestamp pushed to right */}
                    <span className="ml-auto text-xs text-muted-foreground/60">
                      {action.timestamp}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-sm font-medium leading-snug ${
                      isRejected
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {action.title}
                  </h3>

                  {/* Fix 2: Show rejection reason below title */}
                  {isRejected && rejectionReason && (
                    <p className="mt-1.5 text-xs text-muted-foreground/70 italic">
                      Reason: {rejectionReason}
                    </p>
                  )}

                  {/* Preview text */}
                  {action.preview && (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground italic line-clamp-2 rounded-lg bg-muted/30 px-3 py-2">
                      {action.preview}
                    </p>
                  )}

                  {/* Detail items */}
                  {action.details && action.details.length > 0 && (
                    <div className="mt-2 space-y-1 rounded-lg bg-muted/30 px-3 py-2">
                      {action.details.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approved flash message */}
                  {isFlashing && (
                    <div className="mt-3 flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Approved!</span>
                    </div>
                  )}

                  {/* Fix 5: Action buttons — fully hidden when not pending, replaced by status */}
                  {isPending && !isFlashing && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(action.id)}
                        className="h-8 gap-1.5 rounded-lg bg-green-600 px-3 text-xs font-medium text-white hover:bg-green-500"
                      >
                        {approveIcon}
                        {action.buttons.approve}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(action)}
                        className="h-8 gap-1.5 rounded-lg border-amber-500/30 px-3 text-xs font-medium text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                      >
                        {editButtonIcon(action.buttons.edit)}
                        {action.buttons.edit}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(action.id)}
                        className="h-8 gap-1.5 rounded-lg border-red-500/30 px-3 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        {rejectIcon}
                        {action.buttons.reject}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject reason dialog */}
      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              Provide a brief reason for rejecting this action. The agent will
              use this feedback to improve future proposals.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Amount needs adjustment, wrong recipient, timing not appropriate..."
            rows={3}
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <DialogFooter>
            {/* Fix 4: Use correct DialogClose pattern — wrap button as child */}
            <DialogClose
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              size="sm"
              onClick={confirmReject}
              className="h-8 gap-1.5 rounded-lg bg-red-600 px-4 text-xs font-medium text-white hover:bg-red-500"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fix 1: Edit dialog */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
            setEditedContent("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {editTarget && (() => {
            const EditTypeIcon = editTarget.typeIcon;
            const EditAgentIcon = editTarget.agent.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-sm leading-snug">
                    {editTarget.title}
                  </DialogTitle>
                  <DialogDescription>
                    <span className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/[0.06] px-2 py-0.5">
                        <EditAgentIcon className="h-3 w-3 text-primary" />
                        <span className="text-xs font-medium text-primary">{editTarget.agent.name}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5">
                        <EditTypeIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{editTarget.type}</span>
                      </span>
                    </span>
                  </DialogDescription>
                </DialogHeader>

                {/* Edit area — adapts to content type */}
                <div className="space-y-3">
                  {editTarget.type === "Email Send" ? (
                    /* Email: subject/recipient/body fields */
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Recipient</label>
                        <input
                          type="text"
                          defaultValue={
                            editTarget.id === "apr-001" ? "Sarah Chen" :
                            editTarget.id === "apr-007" ? "Mark & Lisa Thompson" :
                            "Recipient"
                          }
                          className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                        <input
                          type="text"
                          defaultValue={editTarget.title}
                          className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Body</label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          rows={5}
                          className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  ) : editTarget.type === "Estimate Generation" || editTarget.type === "Invoice Creation" ? (
                    /* Estimates/Invoices: editable line items */
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Line Items</label>
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        {editedContent.split("\n").map((line, idx) => {
                          const parts = line.split(" \u2014 ");
                          const name = parts[0] || "";
                          const amount = parts[1] || "";
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <input
                                type="text"
                                defaultValue={name}
                                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                              />
                              <input
                                type="text"
                                defaultValue={amount}
                                className="w-28 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground text-right focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : editTarget.type === "Schedule Change" ? (
                    /* Schedule: editable text block */
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Schedule Details</label>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  ) : (
                    /* Default: generic textarea */
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Content</label>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                      />
                    }
                  >
                    Cancel
                  </DialogClose>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
