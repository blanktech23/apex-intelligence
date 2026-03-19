"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Sparkles,
  Tag,
  Timer,
  User,
  UserPlus,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Mock Data — Billing Dispute Escalation                            */
/* ------------------------------------------------------------------ */

const escalation = {
  id: "ESC-1042",
  priority: "Critical" as const,
  status: "In Progress" as const,
  customer: {
    name: "Marcus Chen",
    email: "marcus.chen@velocityhvac.com",
    phone: "+1 (512) 884-2910",
    company: "Velocity HVAC Solutions",
    avatar: "MC",
  },
  details: {
    agent: "Support Agent",
    reason:
      "Customer disputes $14,200 charge on Invoice #INV-3847. Claims agreed price was $11,800. Agent unable to verify original quote — escalated for human review with billing authority.",
    escalatedAt: "March 16, 2026 at 2:18 PM",
    assignedTo: "Joseph Wells",
    slaDeadline: "March 17, 2026 at 2:18 PM",
    slaRemaining: "21h 42m",
  },
  aiSummary:
    "Customer Marcus Chen (Velocity HVAC) is disputing a $2,400 overcharge on Invoice #INV-3847 for a commercial duct installation. The AI agent confirmed the invoice amount but could not locate the original signed quote to verify the agreed price. Customer sentiment is escalating — he has threatened to pause future projects. Historical data shows Velocity HVAC has $187k in lifetime revenue across 14 completed jobs with zero prior disputes.",
  suggestedActions: [
    {
      label: "Pull original quote from JobTread",
      description: "Retrieve Quote #QT-2918 to verify agreed pricing",
      icon: ExternalLink,
    },
    {
      label: "Issue partial credit of $2,400",
      description:
        "Credit the disputed difference to preserve the relationship",
      icon: CheckCircle2,
    },
    {
      label: "Schedule a call with Marcus",
      description: "Personal outreach to de-escalate and discuss resolution",
      icon: Phone,
    },
    {
      label: "Flag for internal audit",
      description: "Investigate how the invoice amount diverged from the quote",
      icon: Shield,
    },
  ],
  relatedTickets: [
    {
      id: "esc-001",
      title: "Invoice correction — Anderson Residence",
      status: "Resolved",
      date: "Feb 28, 2026",
    },
    {
      id: "esc-002",
      title: "Pricing discrepancy on multi-phase project",
      status: "Resolved",
      date: "Mar 5, 2026",
    },
    {
      id: "esc-003",
      title: "Late payment dispute — Greenfield Commercial",
      status: "Resolved",
      date: "Mar 12, 2026",
    },
  ],
  messages: [
    {
      sender: "customer",
      name: "Marcus Chen",
      text: "I just reviewed Invoice #INV-3847 and the total is $14,200. We agreed on $11,800 for the duct installation. This is a significant difference and I need this corrected ASAP.",
      time: "2:02 PM",
    },
    {
      sender: "agent",
      name: "Support Agent",
      text: "Thank you for reaching out, Marcus. I can see Invoice #INV-3847 in our system showing $14,200 for the commercial duct installation at your Riverside facility. Let me look into the original quote for you.",
      time: "2:03 PM",
    },
    {
      sender: "agent",
      name: "Support Agent",
      text: "I've checked our records and I can confirm the invoice was generated from the project completion data. However, I'm unable to locate the original signed quote (QT-2918) to verify the agreed-upon amount. I want to make sure we get this right for you.",
      time: "2:06 PM",
    },
    {
      sender: "customer",
      name: "Marcus Chen",
      text: "This is frustrating. We've done 14 projects together and never had an issue like this. I have the quote in my email showing $11,800. If this isn't resolved quickly, I'm going to have to pause our upcoming projects.",
      time: "2:10 PM",
    },
    {
      sender: "agent",
      name: "Support Agent",
      text: "I completely understand your frustration, Marcus, and I value your long-standing relationship with us. Because this involves a billing adjustment that exceeds my authorization level, I'm escalating this to our team lead who can review the quote and authorize any necessary corrections. You should hear back within the next few hours.",
      time: "2:12 PM",
    },
    {
      sender: "system",
      name: "System",
      text: "Escalation created — assigned to Joseph Wells for review. Priority: Critical. SLA: 24 hours.",
      time: "2:18 PM",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Audit Trail Data                                                   */
/* ------------------------------------------------------------------ */

const auditTrail = [
  {
    description: "ESC-1042 created by Discovery Concierge",
    time: "2 hours ago",
    type: "create" as const,
  },
  {
    description: "Viewed by Joseph Wells",
    time: "1 hour ago",
    type: "view" as const,
  },
  {
    description: "Assigned to Sarah Chen by Joseph Wells",
    time: "45 min ago",
    type: "assign" as const,
  },
  {
    description: "Comment added by Sarah Chen: 'Checking with vendor on pricing'",
    time: "30 min ago",
    type: "comment" as const,
  },
  {
    description: "Approved by Sarah Chen",
    time: "15 min ago",
    type: "approve" as const,
  },
];

/* ------------------------------------------------------------------ */
/*  Team Members                                                       */
/* ------------------------------------------------------------------ */

const teamMembers = [
  { name: "Joseph Wells", role: "Owner" },
  { name: "Sarah Chen", role: "Admin" },
  { name: "Mike Torres", role: "Manager" },
];

/* ------------------------------------------------------------------ */
/*  Badge Configs                                                     */
/* ------------------------------------------------------------------ */

const priorityStyles = {
  Critical: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    ring: "ring-red-500/25",
    glow: "shadow-[0_0_12px_rgba(239,68,68,0.2)]",
    dot: "bg-red-400",
  },
  High: {
    bg: "bg-orange-400/15",
    text: "text-orange-400",
    ring: "ring-orange-400/25",
    glow: "",
    dot: "bg-orange-400",
  },
  Medium: {
    bg: "bg-amber-400/15",
    text: "text-amber-400",
    ring: "ring-amber-400/25",
    glow: "",
    dot: "bg-amber-400",
  },
  Low: {
    bg: "bg-blue-400/15",
    text: "text-blue-400",
    ring: "ring-blue-400/25",
    glow: "",
    dot: "bg-blue-400",
  },
};

const statusStyles = {
  Open: {
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    ring: "ring-amber-400/20",
  },
  "In Progress": {
    bg: "bg-blue-400/10",
    text: "text-blue-400",
    ring: "ring-blue-400/20",
  },
  Resolved: {
    bg: "bg-green-400/10",
    text: "text-green-400",
    ring: "ring-green-400/20",
  },
  "Modified & Approved": {
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
    ring: "ring-emerald-400/20",
  },
  Approved: {
    bg: "bg-green-400/10",
    text: "text-green-400",
    ring: "ring-green-400/20",
  },
  Rejected: {
    bg: "bg-red-400/10",
    text: "text-red-400",
    ring: "ring-red-400/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                    */
/* ------------------------------------------------------------------ */

export default function EscalationDetailPage() {
  const { config } = useRole();
  const [replyText, setReplyText] = useState("");
  const [showModifyEditor, setShowModifyEditor] = useState(false);
  const [modifyDraft, setModifyDraft] = useState(
    "Dear Marcus,\n\nAfter reviewing the original quote QT-2918 and the invoice INV-3847, I can confirm there was a discrepancy. We will issue a credit of $2,400 to align with the agreed-upon price of $11,800.\n\nThe credit will be processed within 2-3 business days. We sincerely apologize for the inconvenience and value your continued partnership.\n\nBest regards,\nApex Intelligence Team"
  );
  const [modifyApproved, setModifyApproved] = useState(false);
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);
  const [assignedTo, setAssignedTo] = useState(escalation.details.assignedTo);
  const [reassignToast, setReassignToast] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>(escalation.status);
  const [sourceContextOpen, setSourceContextOpen] = useState(false);

  const p = priorityStyles[escalation.priority];
  const s =
    statusStyles[currentStatus as keyof typeof statusStyles] ||
    statusStyles["In Progress"];

  const handleModifyApprove = () => {
    setModifyApproved(true);
    setShowModifyEditor(false);
    setCurrentStatus("Modified & Approved");
    setTimeout(() => setModifyApproved(false), 3000);
  };

  const handleReassign = (member: { name: string; role: string }) => {
    setAssignedTo(member.name);
    setShowReassignDropdown(false);
    setReassignToast(member.name);
    setTimeout(() => setReassignToast(null), 3000);
  };

  return (
    <div className="min-h-full bg-mesh p-6 space-y-6">
      {/* ---- Toasts ---- */}
      {modifyApproved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl px-5 py-3 text-sm font-medium text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-in slide-in-from-top-2 fade-in duration-300">
          <CheckCircle2 className="h-4 w-4" />
          Modified &amp; Approved successfully
        </div>
      )}
      {reassignToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/10 backdrop-blur-xl px-5 py-3 text-sm font-medium text-primary shadow-[0_0_30px_rgba(99,102,241,0.15)] animate-in slide-in-from-top-2 fade-in duration-300">
          <UserPlus className="h-4 w-4" />
          Reassigned to {reassignToast}
        </div>
      )}

      {/* ---- Back Link + Header ---- */}
      <div className="space-y-4">
        <Link
          href="/escalations"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to queue
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">
            #{escalation.id}
          </h1>

          {/* Priority badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${p.bg} ${p.text} ${p.ring} ${p.glow}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${p.dot} animate-pulse`} />
            {escalation.priority}
          </span>

          {/* Status badge */}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}
          >
            {currentStatus}
          </span>

          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5 text-amber-400" />
            SLA: {escalation.details.slaRemaining} remaining
          </span>
        </div>
      </div>

      {/* ---- Two-Column Layout ---- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ============================================================ */}
        {/*  LEFT COLUMN (2/3)                                          */}
        {/* ============================================================ */}
        <div className="lg:col-span-2 space-y-6">
          {/* — Customer Info Card — */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-primary/20">
                {escalation.customer.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-foreground">
                  {escalation.customer.name}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {escalation.customer.company}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span className="truncate text-sm text-muted-foreground">
                  {escalation.customer.email}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {escalation.customer.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  14 projects &middot; $187k lifetime
                </span>
              </div>
            </div>
          </div>

          {/* — Action Buttons Bar (approvers only) — */}
          {config.canApprove && (
          <div className="glass rounded-xl p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Approve */}
              <Button
                onClick={() => {
                  setCurrentStatus("Approved");
                  toast?.("Escalation approved successfully");
                }}
                className="h-9 gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white transition-all hover:bg-emerald-500/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>

              {/* Modify & Approve */}
              <Button
                onClick={() => {
                  setShowModifyEditor(!showModifyEditor);
                  setShowReassignDropdown(false);
                }}
                className="h-9 gap-2 rounded-lg bg-emerald-500/15 px-4 text-sm font-semibold text-emerald-400 border border-emerald-500/25 transition-all hover:bg-emerald-500/25 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Modify &amp; Approve
              </Button>

              {/* Reject */}
              <Button
                onClick={() => {
                  setCurrentStatus("Rejected");
                  toast?.("Escalation rejected");
                }}
                className="h-9 gap-2 rounded-lg bg-red-500/15 px-4 text-sm font-semibold text-red-400 border border-red-500/25 transition-all hover:bg-red-500/25 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Reject
              </Button>

              {/* Reassign */}
              <div className="relative">
                <Button
                  onClick={() => {
                    setShowReassignDropdown(!showReassignDropdown);
                    setShowModifyEditor(false);
                  }}
                  className="h-9 gap-2 rounded-lg bg-primary/15 px-4 text-sm font-semibold text-primary border border-primary/25 transition-all hover:bg-primary/25 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Reassign
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {showReassignDropdown && (
                  <div className="absolute left-0 top-full mt-2 z-40 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-[11px] font-medium text-muted-foreground/70">
                        Select team member
                      </p>
                    </div>
                    {teamMembers.map((member) => (
                      <button
                        key={member.name}
                        onClick={() => handleReassign(member)}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40 ${
                          member.name === assignedTo
                            ? "bg-primary/[0.06]"
                            : ""
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60">
                            {member.role}
                          </p>
                        </div>
                        {member.name === assignedTo && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inline Modify Editor */}
            {showModifyEditor && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-xs font-semibold text-foreground">
                    Edit agent draft before approving
                  </p>
                </div>
                <textarea
                  value={modifyDraft}
                  onChange={(e) => setModifyDraft(e.target.value)}
                  rows={8}
                  className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-emerald-400/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowModifyEditor(false)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleModifyApprove}
                    className="h-9 gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-white transition-all hover:bg-emerald-500/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Submit Modified Approval
                  </Button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* — Conversation Thread — */}
          <div className="glass-strong rounded-xl p-6">
            <div className="mb-5 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Conversation Thread
              </h3>
              <span className="ml-auto text-[11px] text-muted-foreground/50">
                {escalation.messages.length} messages
              </span>
            </div>

            <div className="space-y-4">
              {escalation.messages.map((msg, i) => {
                if (msg.sender === "system") {
                  return (
                    <div key={i} className="flex justify-center">
                      <div className="flex items-center gap-2 rounded-full bg-muted/40 px-4 py-1.5 text-[11px] text-muted-foreground/70">
                        <AlertTriangle className="h-3 w-3 text-amber-400/70" />
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                const isAgent = msg.sender === "agent";

                return (
                  <div
                    key={i}
                    className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isAgent
                          ? "bg-primary/15 text-primary"
                          : "bg-amber-400/15 text-amber-400"
                      }`}
                    >
                      {isAgent ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] space-y-1 ${
                        isAgent ? "" : "text-right"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            isAgent ? "text-primary" : "text-amber-400"
                          }`}
                        >
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">
                          {msg.time}
                        </span>
                      </div>
                      <div
                        className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                          isAgent
                            ? "rounded-tl-sm bg-muted text-foreground/90 border border-border"
                            : "rounded-tr-sm bg-primary/10 text-foreground/90 border border-primary/15"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <div className="mt-6 border-t border-border pt-5">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-400/15 text-xs font-bold text-green-400">
                  JW
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground/40">
                      Reply visible to customer
                    </p>
                    <Button onClick={() => { if (replyText.trim()) { setReplyText(""); toast.success("Reply sent successfully"); } }} className="h-9 gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]">
                      <Send className="h-3.5 w-3.5" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* — Audit Trail Timeline — */}
          <div className="glass rounded-xl p-6">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Audit Trail
              </h3>
              <span className="ml-auto text-[11px] text-muted-foreground/50">
                {auditTrail.length} events
              </span>
            </div>

            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-4">
                {auditTrail.map((entry, i) => {
                  const isLast = i === auditTrail.length - 1;
                  const dotColor =
                    entry.type === "approve"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      : entry.type === "create"
                      ? "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                      : entry.type === "assign"
                      ? "bg-amber-400"
                      : entry.type === "comment"
                      ? "bg-cyan-400"
                      : "bg-muted-foreground/50";

                  return (
                    <div key={i} className="relative flex items-start gap-4 pl-6">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-card ${dotColor}`}
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground/90">
                          {entry.description}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/50">
                          {entry.time}
                        </p>
                      </div>

                      {isLast && entry.type === "approve" && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 ring-1 ring-emerald-400/20">
                          Completed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* — Source Context Panel — */}
          <div className="glass rounded-xl overflow-hidden">
            <button
              onClick={() => setSourceContextOpen(!sourceContextOpen)}
              className="flex w-full items-center gap-2 p-5 text-left transition-colors hover:bg-muted/20"
            >
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Source Context
              </h3>
              <span className="ml-auto">
                {sourceContextOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            </button>

            {sourceContextOpen && (
              <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="shrink-0 text-xs font-medium text-muted-foreground/70">
                    Trigger
                  </p>
                  <p className="text-sm text-foreground text-right">
                    Inbound email from marcus@rivera-construction.com
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="shrink-0 text-xs font-medium text-muted-foreground/70">
                    Original Subject
                  </p>
                  <p className="text-sm text-foreground text-right">
                    RE: Estimate #4821 - Material pricing question
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="shrink-0 text-xs font-medium text-muted-foreground/70">
                    Received
                  </p>
                  <p className="text-sm text-foreground text-right">
                    March 16, 2026 at 2:15 PM
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="shrink-0 text-xs font-medium text-muted-foreground/70">
                    Processing Time
                  </p>
                  <p className="text-sm text-foreground text-right">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      4.2 seconds
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  RIGHT COLUMN (1/3)                                         */}
        {/* ============================================================ */}
        <div className="space-y-6">
          {/* — Escalation Details Card — */}
          <div className="glass rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Escalation Details
            </h3>
            <div className="mt-4 space-y-3.5">
              <DetailRow
                label="Agent"
                value={
                  <span className="flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5 text-primary" />
                    {escalation.details.agent}
                  </span>
                }
              />
              <DetailRow label="Reason" value={escalation.details.reason} multiline />
              <DetailRow
                label="Escalated At"
                value={
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {escalation.details.escalatedAt}
                  </span>
                }
              />
              <DetailRow
                label="Assigned To"
                value={
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {assignedTo}
                  </span>
                }
              />
              <DetailRow
                label="SLA Deadline"
                value={
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Timer className="h-3 w-3" />
                    {escalation.details.slaDeadline}
                  </span>
                }
              />
            </div>
          </div>

          {/* — AI Summary Card — */}
          <div className="glass rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              AI Summary
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {escalation.aiSummary}
            </p>
            <button onClick={() => { navigator.clipboard.writeText(escalation.aiSummary); toast.success("Summary copied to clipboard"); }} className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-primary transition-colors hover:text-primary/80">
              <Copy className="h-3 w-3" />
              Copy summary
            </button>
          </div>

          {/* — Suggested Actions Card — */}
          <div className="glass rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Suggested Actions
            </h3>
            <div className="mt-4 space-y-2.5">
              {escalation.suggestedActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => toast.info(action.label)}
                    className="group flex w-full items-start gap-3 rounded-lg border border-border bg-muted/20 p-3 text-left transition-all hover:border-primary/25 hover:bg-primary/[0.06]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* — Related Tickets Card — */}
          <div className="glass rounded-xl p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              Related Escalations
            </h3>
            <div className="mt-4 space-y-2.5">
              {escalation.relatedTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/escalations/${ticket.id}`}
                  className="group flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5 transition-all hover:border-border hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      #{ticket.id}
                    </p>
                    <p className="truncate text-xs text-muted-foreground/60">
                      {ticket.title}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <span className="inline-flex items-center rounded-full bg-green-400/10 px-2 py-0.5 text-[10px] font-semibold text-green-400 ring-1 ring-green-400/20">
                      {ticket.status}
                    </span>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/40">
                      {ticket.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Row sub-component                                          */
/* ------------------------------------------------------------------ */

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <div className={multiline ? "space-y-1" : "flex items-center justify-between gap-4"}>
      <p className="shrink-0 text-xs font-medium text-muted-foreground/70">
        {label}
      </p>
      <div
        className={`text-sm ${
          multiline
            ? "leading-relaxed text-muted-foreground"
            : "text-right text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
