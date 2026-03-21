"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Clock,
  Loader2,
  Pause,
  Eye,
  Zap,
  Send,
  Gauge,
  Target,
  FileText,
  ExternalLink,
  CircleDot,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TaskStatus = "running" | "queued" | "awaiting-approval";

interface ActiveTask {
  id: string;
  name: string;
  status: TaskStatus;
  progress?: number;
  startedAt: string;
  estimatedCompletion?: string;
}

interface CompletedTask {
  id: string;
  name: string;
  completedAt: string;
}

interface LogLine {
  id: string;
  timestamp: string;
  text: string;
  color: "green" | "amber" | "cyan" | "white" | "muted";
}

interface ConnectedTool {
  name: string;
  status: "connected" | "limited";
}

interface RecentOutput {
  id: string;
  title: string;
  timeAgo: string;
}

interface Metric {
  label: string;
  value: string;
  icon: typeof CheckCircle2;
  color: string;
  bg: string;
}

interface AgentWorkspaceData {
  activeTasks: ActiveTask[];
  completedTasks: CompletedTask[];
  liveOutput: LogLine[];
  connectedTools: ConnectedTool[];
  recentOutputs: RecentOutput[];
  metrics: Metric[];
}

// ---------------------------------------------------------------------------
// Agent name map (same as detail page)
// ---------------------------------------------------------------------------

const agentNameMap: Record<string, string> = {
  "customer-support": "Customer Support Agent",
  "sales-outreach": "Sales Outreach Agent",
  scheduling: "Scheduling Agent",
  estimation: "Estimation Agent",
  bookkeeping: "Bookkeeping Agent",
  "project-management": "Project Management Agent",
  "field-operations": "Field Operations Agent",
  // Plan v3 IDs
  "support-agent": "Support Agent",
  "discovery-concierge": "Discovery Concierge",
  "project-orchestrator": "Project Orchestrator",
  "estimate-engine": "Estimate Engine",
  "operations-controller": "Operations Controller",
  "executive-navigator": "Executive Navigator",
  "design-spec-assistant": "Design Spec Assistant",
};

// ---------------------------------------------------------------------------
// Plan v3 ID → legacy data ID alias map
// ---------------------------------------------------------------------------

const idAliasMap: Record<string, string> = {
  "support-agent": "customer-support",
  "discovery-concierge": "sales-outreach",
  "project-orchestrator": "scheduling",
  "estimate-engine": "estimation",
  "operations-controller": "bookkeeping",
  "executive-navigator": "project-management",
  "design-spec-assistant": "design-spec-assistant",
};

// ---------------------------------------------------------------------------
// Per-Agent Workspace Data
// ---------------------------------------------------------------------------

const agentWorkspaceData: Record<string, AgentWorkspaceData> = {
  "customer-support": {
    activeTasks: [
      {
        id: "cs-t1",
        name: "Responding to invoice inquiry",
        status: "running",
        progress: 72,
        startedAt: "2 min ago",
        estimatedCompletion: "~30s remaining",
      },
      {
        id: "cs-t2",
        name: "Drafting follow-up email",
        status: "running",
        progress: 45,
        startedAt: "5 min ago",
        estimatedCompletion: "~3 min remaining",
      },
      {
        id: "cs-t3",
        name: "Updating CRM record",
        status: "queued",
        startedAt: "Queued 1 min ago",
      },
      {
        id: "cs-t4",
        name: "Generating satisfaction survey",
        status: "queued",
        startedAt: "Queued 2 min ago",
      },
      {
        id: "cs-t5",
        name: "Escalation review: Metro Builders",
        status: "awaiting-approval",
        startedAt: "8 min ago",
      },
    ],
    completedTasks: [
      { id: "cs-ct1", name: "Resolved warranty claim #T-5021", completedAt: "10 min ago" },
      { id: "cs-ct2", name: "Auto-replied to FAQ: service hours", completedAt: "22 min ago" },
      { id: "cs-ct3", name: "Triaged 4 incoming tickets", completedAt: "35 min ago" },
      { id: "cs-ct4", name: "Sent follow-up to Pacific Corp", completedAt: "48 min ago" },
      { id: "cs-ct5", name: "Updated knowledge base entries", completedAt: "1 hr ago" },
      { id: "cs-ct6", name: "Processed satisfaction survey batch", completedAt: "1.5 hr ago" },
      { id: "cs-ct7", name: "Closed 3 stale tickets", completedAt: "2 hr ago" },
      { id: "cs-ct8", name: "Generated NPS report", completedAt: "3 hr ago" },
    ],
    liveOutput: [
      { id: "cs-lo1", timestamp: "14:36:02", text: "Searching CRM for customer: Sarah Chen...", color: "cyan" },
      { id: "cs-lo2", timestamp: "14:36:03", text: "Found 3 matching records", color: "green" },
      { id: "cs-lo3", timestamp: "14:36:05", text: "Pulling invoice #4521 from QuickBooks...", color: "cyan" },
      { id: "cs-lo4", timestamp: "14:36:07", text: "Invoice total: $14,800.00", color: "green" },
      { id: "cs-lo5", timestamp: "14:36:08", text: "Comparing with estimate #EST-2201...", color: "cyan" },
      { id: "cs-lo6", timestamp: "14:36:10", text: "Variance detected: +$2,400 (Change Order CO-002)", color: "amber" },
      { id: "cs-lo7", timestamp: "14:36:12", text: "Drafting response email...", color: "white" },
      { id: "cs-lo8", timestamp: "14:36:14", text: "  Subject: Re: Invoice #4521 - Variance Explanation", color: "muted" },
      { id: "cs-lo9", timestamp: "14:36:15", text: "  Hi Sarah,", color: "white" },
      { id: "cs-lo10", timestamp: "14:36:15", text: "  Thank you for reaching out about invoice #4521.", color: "white" },
      { id: "cs-lo11", timestamp: "14:36:16", text: "  The $2,400 difference is due to approved Change", color: "white" },
      { id: "cs-lo12", timestamp: "14:36:16", text: "  Order CO-002 (bathroom tile upgrade, approved 2/28).", color: "white" },
      { id: "cs-lo13", timestamp: "14:36:17", text: "  I've attached the signed change order for reference.", color: "white" },
      { id: "cs-lo14", timestamp: "14:36:18", text: "Attaching document: CO-002-signed.pdf", color: "cyan" },
      { id: "cs-lo15", timestamp: "14:36:19", text: "Email draft ready for review", color: "green" },
      { id: "cs-lo16", timestamp: "14:36:20", text: "Awaiting agent approval before sending...", color: "amber" },
    ],
    connectedTools: [
      { name: "CRM", status: "connected" },
      { name: "Gmail", status: "connected" },
      { name: "QuickBooks", status: "connected" },
      { name: "Knowledge Base", status: "connected" },
    ],
    recentOutputs: [
      { id: "cs-ro1", title: "Email draft - Invoice dispute response", timeAgo: "2 min ago" },
      { id: "cs-ro2", title: "Ticket summary - Metro Builders escalation", timeAgo: "15 min ago" },
      { id: "cs-ro3", title: "FAQ auto-response - Service hours", timeAgo: "22 min ago" },
      { id: "cs-ro4", title: "NPS report - March 2026", timeAgo: "3 hr ago" },
      { id: "cs-ro5", title: "Customer summary - Rivera GC", timeAgo: "5 hr ago" },
    ],
    metrics: [
      { label: "Tickets Resolved", value: "34", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Emails Sent", value: "12", icon: Send, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Avg Response", value: "1.8s", icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "CSAT", value: "96%", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },

  "sales-outreach": {
    activeTasks: [
      {
        id: "so-t1",
        name: "Qualifying 3 new website leads",
        status: "running",
        progress: 60,
        startedAt: "3 min ago",
        estimatedCompletion: "~2 min remaining",
      },
      {
        id: "so-t2",
        name: "Sending follow-up sequence #2",
        status: "running",
        progress: 35,
        startedAt: "6 min ago",
        estimatedCompletion: "~4 min remaining",
      },
      {
        id: "so-t3",
        name: "Updating pipeline report",
        status: "queued",
        startedAt: "Queued 1 min ago",
      },
      {
        id: "so-t4",
        name: "Researching prospect - Meridian Properties",
        status: "queued",
        startedAt: "Queued 3 min ago",
      },
      {
        id: "so-t5",
        name: "Draft proposal for Henderson Group",
        status: "awaiting-approval",
        startedAt: "12 min ago",
      },
    ],
    completedTasks: [
      { id: "so-ct1", name: "Qualified lead: Bay Area Renovations", completedAt: "8 min ago" },
      { id: "so-ct2", name: "Sent intro email to 5 new contacts", completedAt: "25 min ago" },
      { id: "so-ct3", name: "Booked meeting: Pacific Design Group", completedAt: "40 min ago" },
      { id: "so-ct4", name: "Updated CRM notes for 12 prospects", completedAt: "1 hr ago" },
      { id: "so-ct5", name: "LinkedIn connection requests sent (8)", completedAt: "1.5 hr ago" },
      { id: "so-ct6", name: "Created pipeline snapshot", completedAt: "2 hr ago" },
      { id: "so-ct7", name: "Scored 15 inbound leads", completedAt: "3 hr ago" },
    ],
    liveOutput: [
      { id: "so-lo1", timestamp: "14:32:01", text: "Fetching new website form submissions...", color: "cyan" },
      { id: "so-lo2", timestamp: "14:32:02", text: "Found 3 new leads since last check", color: "green" },
      { id: "so-lo3", timestamp: "14:32:04", text: "Lead 1: Meridian Properties - Commercial renovation", color: "white" },
      { id: "so-lo4", timestamp: "14:32:05", text: "  Enriching company data via LinkedIn...", color: "cyan" },
      { id: "so-lo5", timestamp: "14:32:08", text: "  Revenue: $12M | Employees: 45 | Industry: Real Estate", color: "green" },
      { id: "so-lo6", timestamp: "14:32:09", text: "  Lead score: 82/100 - HIGH PRIORITY", color: "amber" },
      { id: "so-lo7", timestamp: "14:32:11", text: "Lead 2: HomeStyle Interiors - Kitchen remodel", color: "white" },
      { id: "so-lo8", timestamp: "14:32:12", text: "  Budget range: $50K-$80K", color: "white" },
      { id: "so-lo9", timestamp: "14:32:13", text: "  Lead score: 65/100 - MEDIUM PRIORITY", color: "white" },
      { id: "so-lo10", timestamp: "14:32:15", text: "Lead 3: Rivera Construction - Subcontractor inquiry", color: "white" },
      { id: "so-lo11", timestamp: "14:32:16", text: "  Lead score: 41/100 - LOW PRIORITY (subcontractor, not client)", color: "muted" },
      { id: "so-lo12", timestamp: "14:32:18", text: "Preparing personalized outreach for Meridian Properties...", color: "cyan" },
      { id: "so-lo13", timestamp: "14:32:20", text: "Drafting email: 'Commercial Renovation Expertise'", color: "white" },
      { id: "so-lo14", timestamp: "14:32:22", text: "Adding to follow-up sequence #2 queue...", color: "cyan" },
      { id: "so-lo15", timestamp: "14:32:23", text: "CRM records updated for all 3 leads", color: "green" },
    ],
    connectedTools: [
      { name: "CRM", status: "connected" },
      { name: "Gmail", status: "connected" },
      { name: "LinkedIn", status: "connected" },
      { name: "Calendar", status: "connected" },
    ],
    recentOutputs: [
      { id: "so-ro1", title: "Lead qualification report - 3 new leads", timeAgo: "3 min ago" },
      { id: "so-ro2", title: "Email sequence - Follow-up #2 batch", timeAgo: "20 min ago" },
      { id: "so-ro3", title: "Pipeline report - Weekly snapshot", timeAgo: "2 hr ago" },
      { id: "so-ro4", title: "Proposal draft - Henderson Group", timeAgo: "3 hr ago" },
      { id: "so-ro5", title: "LinkedIn outreach summary", timeAgo: "4 hr ago" },
    ],
    metrics: [
      { label: "Leads Qualified", value: "8", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Emails Sent", value: "24", icon: Send, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Meetings Booked", value: "3", icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "Pipeline Added", value: "$420K", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },

  scheduling: {
    activeTasks: [
      {
        id: "sc-t1",
        name: "Resolving crew conflict - Wednesday",
        status: "running",
        progress: 55,
        startedAt: "4 min ago",
        estimatedCompletion: "~2 min remaining",
      },
      {
        id: "sc-t2",
        name: "Generating weekly schedule",
        status: "running",
        progress: 80,
        startedAt: "8 min ago",
        estimatedCompletion: "~1 min remaining",
      },
      {
        id: "sc-t3",
        name: "Processing PTO request",
        status: "queued",
        startedAt: "Queued 2 min ago",
      },
      {
        id: "sc-t4",
        name: "Optimizing route for Thursday crews",
        status: "queued",
        startedAt: "Queued 4 min ago",
      },
      {
        id: "sc-t5",
        name: "Crew reassignment approval - Friday",
        status: "awaiting-approval",
        startedAt: "10 min ago",
      },
    ],
    completedTasks: [
      { id: "sc-ct1", name: "Notified Crew B of schedule change", completedAt: "5 min ago" },
      { id: "sc-ct2", name: "Optimized Monday routes (3 crews)", completedAt: "18 min ago" },
      { id: "sc-ct3", name: "Processed PTO: Mike R. (Mar 20-21)", completedAt: "30 min ago" },
      { id: "sc-ct4", name: "Resolved double-booking at 142 Pine St", completedAt: "45 min ago" },
      { id: "sc-ct5", name: "Sent weekly schedule to all crews", completedAt: "1 hr ago" },
      { id: "sc-ct6", name: "Updated weather-based scheduling", completedAt: "2 hr ago" },
    ],
    liveOutput: [
      { id: "sc-lo1", timestamp: "14:28:01", text: "Analyzing crew availability for Wednesday...", color: "cyan" },
      { id: "sc-lo2", timestamp: "14:28:03", text: "Conflict detected: Crew A and Crew C both assigned to 742 Oak St", color: "amber" },
      { id: "sc-lo3", timestamp: "14:28:05", text: "Checking alternative assignments...", color: "cyan" },
      { id: "sc-lo4", timestamp: "14:28:07", text: "Crew C has flexibility - can move to 318 Elm St", color: "green" },
      { id: "sc-lo5", timestamp: "14:28:08", text: "Querying Google Maps for drive time impact...", color: "cyan" },
      { id: "sc-lo6", timestamp: "14:28:10", text: "Route change adds 12 min travel (acceptable)", color: "green" },
      { id: "sc-lo7", timestamp: "14:28:12", text: "Checking Weather API for Wednesday forecast...", color: "cyan" },
      { id: "sc-lo8", timestamp: "14:28:13", text: "Wednesday: Clear, 68F - no weather delays expected", color: "green" },
      { id: "sc-lo9", timestamp: "14:28:15", text: "Generating updated schedule...", color: "white" },
      { id: "sc-lo10", timestamp: "14:28:17", text: "  Crew A -> 742 Oak St (framing, 8AM-4PM)", color: "white" },
      { id: "sc-lo11", timestamp: "14:28:17", text: "  Crew C -> 318 Elm St (electrical, 9AM-3PM)", color: "white" },
      { id: "sc-lo12", timestamp: "14:28:18", text: "  Crew B -> 55 Harbor Rd (painting, 7AM-2PM)", color: "white" },
      { id: "sc-lo13", timestamp: "14:28:20", text: "Schedule conflict resolved successfully", color: "green" },
      { id: "sc-lo14", timestamp: "14:28:21", text: "Preparing crew notifications...", color: "cyan" },
    ],
    connectedTools: [
      { name: "Calendar", status: "connected" },
      { name: "Google Maps", status: "connected" },
      { name: "Weather API", status: "connected" },
      { name: "CRM", status: "connected" },
    ],
    recentOutputs: [
      { id: "sc-ro1", title: "Weekly schedule - Mar 17-21", timeAgo: "8 min ago" },
      { id: "sc-ro2", title: "Route optimization - Monday crews", timeAgo: "18 min ago" },
      { id: "sc-ro3", title: "PTO impact analysis - Mike R.", timeAgo: "30 min ago" },
      { id: "sc-ro4", title: "Crew conflict resolution - 142 Pine St", timeAgo: "45 min ago" },
      { id: "sc-ro5", title: "Weather-adjusted schedule - This week", timeAgo: "2 hr ago" },
    ],
    metrics: [
      { label: "Schedules Updated", value: "5", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Conflicts Resolved", value: "2", icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Crews Notified", value: "8", icon: Send, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "Routes Optimized", value: "3", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },

  estimation: {
    activeTasks: [
      {
        id: "es-t1",
        name: "Generating estimate - 742 Oak St renovation",
        status: "running",
        progress: 68,
        startedAt: "5 min ago",
        estimatedCompletion: "~2 min remaining",
      },
      {
        id: "es-t2",
        name: "Comparing material prices",
        status: "running",
        progress: 40,
        startedAt: "7 min ago",
        estimatedCompletion: "~4 min remaining",
      },
      {
        id: "es-t3",
        name: "Reviewing subcontractor bids",
        status: "queued",
        startedAt: "Queued 2 min ago",
      },
      {
        id: "es-t4",
        name: "Updating cost database",
        status: "queued",
        startedAt: "Queued 5 min ago",
      },
      {
        id: "es-t5",
        name: "Bid approval - Pacific Concrete",
        status: "awaiting-approval",
        startedAt: "15 min ago",
      },
    ],
    completedTasks: [
      { id: "es-ct1", name: "Estimate finalized - 318 Elm St addition", completedAt: "12 min ago" },
      { id: "es-ct2", name: "Material comparison: quartz vs marble countertops", completedAt: "28 min ago" },
      { id: "es-ct3", name: "Subcontractor bid review - 3 electrical bids", completedAt: "45 min ago" },
      { id: "es-ct4", name: "Cost database updated with Q1 2026 prices", completedAt: "1 hr ago" },
      { id: "es-ct5", name: "Exported PDF: Estimate #EST-2247", completedAt: "1.5 hr ago" },
      { id: "es-ct6", name: "Labor rate analysis - Bay Area zip codes", completedAt: "2 hr ago" },
    ],
    liveOutput: [
      { id: "es-lo1", timestamp: "14:30:01", text: "Loading project specs for 742 Oak St...", color: "cyan" },
      { id: "es-lo2", timestamp: "14:30:03", text: "Project type: Full renovation | 2,400 sq ft", color: "white" },
      { id: "es-lo3", timestamp: "14:30:05", text: "Querying material database...", color: "cyan" },
      { id: "es-lo4", timestamp: "14:30:07", text: "Fetching labor rates for zip 94103...", color: "cyan" },
      { id: "es-lo5", timestamp: "14:30:09", text: "Calculating square footage costs...", color: "white" },
      { id: "es-lo6", timestamp: "14:30:11", text: "  Demolition: $8,400 ($3.50/sq ft)", color: "white" },
      { id: "es-lo7", timestamp: "14:30:12", text: "  Framing: $14,200 ($5.92/sq ft)", color: "white" },
      { id: "es-lo8", timestamp: "14:30:13", text: "  Electrical: $22,600 (subcontractor bid)", color: "white" },
      { id: "es-lo9", timestamp: "14:30:14", text: "  Plumbing: $18,900 (subcontractor bid)", color: "white" },
      { id: "es-lo10", timestamp: "14:30:15", text: "  Finishing: $31,400 ($13.08/sq ft)", color: "white" },
      { id: "es-lo11", timestamp: "14:30:17", text: "Applying 15% overhead and profit margin...", color: "cyan" },
      { id: "es-lo12", timestamp: "14:30:19", text: "Total estimate: $142,825.00", color: "green" },
      { id: "es-lo13", timestamp: "14:30:20", text: "Cross-referencing with historical projects...", color: "cyan" },
      { id: "es-lo14", timestamp: "14:30:22", text: "Within 8% of comparable projects (acceptable range)", color: "green" },
      { id: "es-lo15", timestamp: "14:30:23", text: "Generating PDF estimate document...", color: "cyan" },
    ],
    connectedTools: [
      { name: "Material DB", status: "connected" },
      { name: "Cost Database", status: "connected" },
      { name: "QuickBooks", status: "connected" },
      { name: "JobTread", status: "connected" },
    ],
    recentOutputs: [
      { id: "es-ro1", title: "Estimate - 742 Oak St Renovation", timeAgo: "5 min ago" },
      { id: "es-ro2", title: "Material comparison - Quartz vs Marble", timeAgo: "28 min ago" },
      { id: "es-ro3", title: "Bid response - Pacific Concrete", timeAgo: "1 hr ago" },
      { id: "es-ro4", title: "Estimate #EST-2247 - 318 Elm St", timeAgo: "1.5 hr ago" },
      { id: "es-ro5", title: "Labor rate report - Bay Area Q1 2026", timeAgo: "2 hr ago" },
    ],
    metrics: [
      { label: "Estimates Created", value: "3", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Line Items Priced", value: "147", icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Comparisons Run", value: "6", icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "PDFs Exported", value: "2", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },

  bookkeeping: {
    activeTasks: [
      {
        id: "bk-t1",
        name: "Reconciling March transactions",
        status: "running",
        progress: 62,
        startedAt: "6 min ago",
        estimatedCompletion: "~3 min remaining",
      },
      {
        id: "bk-t2",
        name: "Generating invoices for completed milestones",
        status: "running",
        progress: 30,
        startedAt: "4 min ago",
        estimatedCompletion: "~5 min remaining",
      },
      {
        id: "bk-t3",
        name: "Processing payroll data",
        status: "queued",
        startedAt: "Queued 1 min ago",
      },
      {
        id: "bk-t4",
        name: "QuickBooks sync",
        status: "queued",
        startedAt: "Queued 3 min ago",
      },
      {
        id: "bk-t5",
        name: "Discrepancy review - Vendor payment #VP-891",
        status: "awaiting-approval",
        startedAt: "14 min ago",
      },
    ],
    completedTasks: [
      { id: "bk-ct1", name: "Synced 247 transactions from bank feed", completedAt: "6 min ago" },
      { id: "bk-ct2", name: "Generated invoice #INV-4088 ($18,400)", completedAt: "20 min ago" },
      { id: "bk-ct3", name: "Categorized 82 expenses", completedAt: "35 min ago" },
      { id: "bk-ct4", name: "Processed payroll for 12 employees", completedAt: "1 hr ago" },
      { id: "bk-ct5", name: "Reconciled vendor account: Ace Hardware", completedAt: "1.5 hr ago" },
      { id: "bk-ct6", name: "Generated accounts receivable aging report", completedAt: "2 hr ago" },
      { id: "bk-ct7", name: "Updated tax withholding records", completedAt: "3 hr ago" },
    ],
    liveOutput: [
      { id: "bk-lo1", timestamp: "14:34:01", text: "Connecting to QuickBooks API...", color: "cyan" },
      { id: "bk-lo2", timestamp: "14:34:02", text: "Authentication successful", color: "green" },
      { id: "bk-lo3", timestamp: "14:34:04", text: "Fetching transactions for March 2026...", color: "cyan" },
      { id: "bk-lo4", timestamp: "14:34:06", text: "Found 247 transactions to reconcile", color: "green" },
      { id: "bk-lo5", timestamp: "14:34:08", text: "Cross-referencing with internal records...", color: "cyan" },
      { id: "bk-lo6", timestamp: "14:34:10", text: "  Matched: 231 transactions (auto-reconciled)", color: "green" },
      { id: "bk-lo7", timestamp: "14:34:11", text: "  Pending review: 14 transactions", color: "amber" },
      { id: "bk-lo8", timestamp: "14:34:12", text: "  Discrepancies found: 2 transactions", color: "amber" },
      { id: "bk-lo9", timestamp: "14:34:14", text: "Discrepancy 1: Vendor payment #VP-891 - $340 mismatch", color: "amber" },
      { id: "bk-lo10", timestamp: "14:34:15", text: "  Expected: $4,200 | Actual: $4,540", color: "white" },
      { id: "bk-lo11", timestamp: "14:34:16", text: "  Possible cause: Late fee or surcharge", color: "muted" },
      { id: "bk-lo12", timestamp: "14:34:18", text: "Discrepancy 2: Deposit #DEP-112 - timing difference", color: "amber" },
      { id: "bk-lo13", timestamp: "14:34:19", text: "  Client payment received 3/14, posted 3/15", color: "white" },
      { id: "bk-lo14", timestamp: "14:34:20", text: "Generating reconciliation summary...", color: "cyan" },
      { id: "bk-lo15", timestamp: "14:34:22", text: "Total reconciled: $284,320.00", color: "green" },
    ],
    connectedTools: [
      { name: "QuickBooks", status: "connected" },
      { name: "Payroll System", status: "connected" },
      { name: "Bank Feed", status: "connected" },
      { name: "Tax Software", status: "limited" },
    ],
    recentOutputs: [
      { id: "bk-ro1", title: "Reconciliation summary - March 2026", timeAgo: "6 min ago" },
      { id: "bk-ro2", title: "Invoice #INV-4088 - 742 Oak St milestone", timeAgo: "20 min ago" },
      { id: "bk-ro3", title: "Expense categorization report", timeAgo: "35 min ago" },
      { id: "bk-ro4", title: "Payroll summary - Pay period 3/1-3/15", timeAgo: "1 hr ago" },
      { id: "bk-ro5", title: "Accounts receivable aging report", timeAgo: "2 hr ago" },
    ],
    metrics: [
      { label: "Transactions", value: "247", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Invoices Generated", value: "8", icon: FileText, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Reconciled", value: "$284K", icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "Discrepancies", value: "2", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },

  "project-management": {
    activeTasks: [
      {
        id: "pm-t1",
        name: "Monitoring 5 active project timelines",
        status: "running",
        progress: 85,
        startedAt: "1 min ago",
        estimatedCompletion: "~1 min remaining",
      },
      {
        id: "pm-t2",
        name: "Generating weekly status report",
        status: "running",
        progress: 50,
        startedAt: "6 min ago",
        estimatedCompletion: "~3 min remaining",
      },
      {
        id: "pm-t3",
        name: "Analyzing resource utilization",
        status: "queued",
        startedAt: "Queued 2 min ago",
      },
      {
        id: "pm-t4",
        name: "Tracking material deliveries",
        status: "queued",
        startedAt: "Queued 4 min ago",
      },
      {
        id: "pm-t5",
        name: "Risk escalation - 55 Harbor Rd delay",
        status: "awaiting-approval",
        startedAt: "11 min ago",
      },
    ],
    completedTasks: [
      { id: "pm-ct1", name: "Updated Gantt chart for 742 Oak St", completedAt: "8 min ago" },
      { id: "pm-ct2", name: "Sent delay alert: 55 Harbor Rd (2 days behind)", completedAt: "20 min ago" },
      { id: "pm-ct3", name: "Resource reallocation analysis complete", completedAt: "40 min ago" },
      { id: "pm-ct4", name: "Material delivery confirmed: 318 Elm St", completedAt: "1 hr ago" },
      { id: "pm-ct5", name: "Budget variance report generated", completedAt: "1.5 hr ago" },
      { id: "pm-ct6", name: "Milestone completion: 142 Pine St framing", completedAt: "2 hr ago" },
    ],
    liveOutput: [
      { id: "pm-lo1", timestamp: "14:33:01", text: "Scanning 5 active project timelines...", color: "cyan" },
      { id: "pm-lo2", timestamp: "14:33:03", text: "  742 Oak St: On track (68% complete)", color: "green" },
      { id: "pm-lo3", timestamp: "14:33:04", text: "  318 Elm St: On track (42% complete)", color: "green" },
      { id: "pm-lo4", timestamp: "14:33:05", text: "  55 Harbor Rd: BEHIND SCHEDULE (2 days)", color: "amber" },
      { id: "pm-lo5", timestamp: "14:33:06", text: "    Root cause: Material delivery delayed (lumber)", color: "amber" },
      { id: "pm-lo6", timestamp: "14:33:07", text: "    Impact: Framing phase pushed to 3/19", color: "amber" },
      { id: "pm-lo7", timestamp: "14:33:08", text: "  142 Pine St: On track (91% complete)", color: "green" },
      { id: "pm-lo8", timestamp: "14:33:09", text: "  220 Market St: On track (15% complete)", color: "green" },
      { id: "pm-lo9", timestamp: "14:33:11", text: "Generating weekly status report...", color: "cyan" },
      { id: "pm-lo10", timestamp: "14:33:13", text: "Calculating resource utilization rates...", color: "cyan" },
      { id: "pm-lo11", timestamp: "14:33:15", text: "  Crew A: 92% utilized", color: "green" },
      { id: "pm-lo12", timestamp: "14:33:15", text: "  Crew B: 85% utilized", color: "green" },
      { id: "pm-lo13", timestamp: "14:33:16", text: "  Crew C: 67% utilized (available capacity)", color: "amber" },
      { id: "pm-lo14", timestamp: "14:33:18", text: "Flagging risk: 55 Harbor Rd needs mitigation plan", color: "amber" },
    ],
    connectedTools: [
      { name: "JobTread", status: "connected" },
      { name: "Calendar", status: "connected" },
      { name: "Weather API", status: "connected" },
      { name: "CRM", status: "connected" },
    ],
    recentOutputs: [
      { id: "pm-ro1", title: "Weekly status report - All projects", timeAgo: "6 min ago" },
      { id: "pm-ro2", title: "Delay alert - 55 Harbor Rd", timeAgo: "20 min ago" },
      { id: "pm-ro3", title: "Resource utilization analysis", timeAgo: "40 min ago" },
      { id: "pm-ro4", title: "Budget variance report - March", timeAgo: "1.5 hr ago" },
      { id: "pm-ro5", title: "Milestone report - 142 Pine St framing", timeAgo: "2 hr ago" },
    ],
    metrics: [
      { label: "Projects Monitored", value: "5", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Alerts Sent", value: "3", icon: Send, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Reports Generated", value: "2", icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "Risks Flagged", value: "1", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },

  "field-operations": {
    activeTasks: [
      {
        id: "fo-t1",
        name: "Processing foundation inspection report",
        status: "running",
        progress: 75,
        startedAt: "3 min ago",
        estimatedCompletion: "~1 min remaining",
      },
      {
        id: "fo-t2",
        name: "Checking weather forecasts",
        status: "running",
        progress: 90,
        startedAt: "1 min ago",
        estimatedCompletion: "~20s remaining",
      },
      {
        id: "fo-t3",
        name: "Tracking material deliveries",
        status: "queued",
        startedAt: "Queued 1 min ago",
      },
      {
        id: "fo-t4",
        name: "Updating safety checklists",
        status: "queued",
        startedAt: "Queued 3 min ago",
      },
      {
        id: "fo-t5",
        name: "Inspection sign-off - 142 Pine St electrical",
        status: "awaiting-approval",
        startedAt: "9 min ago",
      },
    ],
    completedTasks: [
      { id: "fo-ct1", name: "Logged inspection: 742 Oak St foundation", completedAt: "3 min ago" },
      { id: "fo-ct2", name: "Safety checklist verified: 318 Elm St", completedAt: "15 min ago" },
      { id: "fo-ct3", name: "Material delivery confirmed: concrete (55 Harbor Rd)", completedAt: "30 min ago" },
      { id: "fo-ct4", name: "Weather alert sent: Rain expected Thursday", completedAt: "45 min ago" },
      { id: "fo-ct5", name: "Photo documentation: 142 Pine St progress", completedAt: "1 hr ago" },
      { id: "fo-ct6", name: "Equipment inspection log updated", completedAt: "2 hr ago" },
    ],
    liveOutput: [
      { id: "fo-lo1", timestamp: "14:35:01", text: "Processing inspection report: 742 Oak St foundation...", color: "cyan" },
      { id: "fo-lo2", timestamp: "14:35:03", text: "Inspector: Mike Rodriguez | Date: 3/16/2026", color: "white" },
      { id: "fo-lo3", timestamp: "14:35:04", text: "Result: PASSED - No deficiencies noted", color: "green" },
      { id: "fo-lo4", timestamp: "14:35:06", text: "Uploading 8 inspection photos...", color: "cyan" },
      { id: "fo-lo5", timestamp: "14:35:08", text: "Photos uploaded successfully", color: "green" },
      { id: "fo-lo6", timestamp: "14:35:10", text: "Checking weather forecasts for all active sites...", color: "cyan" },
      { id: "fo-lo7", timestamp: "14:35:12", text: "  Mon 3/17: Clear, 72F - All sites OK", color: "green" },
      { id: "fo-lo8", timestamp: "14:35:13", text: "  Tue 3/18: Partly cloudy, 68F - All sites OK", color: "green" },
      { id: "fo-lo9", timestamp: "14:35:14", text: "  Wed 3/19: Clear, 70F - All sites OK", color: "green" },
      { id: "fo-lo10", timestamp: "14:35:15", text: "  Thu 3/20: RAIN 80% chance, 1.2in expected", color: "amber" },
      { id: "fo-lo11", timestamp: "14:35:16", text: "    Affected: 55 Harbor Rd (concrete pour scheduled)", color: "amber" },
      { id: "fo-lo12", timestamp: "14:35:17", text: "    Recommendation: Reschedule concrete pour to Friday", color: "amber" },
      { id: "fo-lo13", timestamp: "14:35:19", text: "  Fri 3/21: Clear, 65F - All sites OK", color: "green" },
      { id: "fo-lo14", timestamp: "14:35:20", text: "Updating safety checklists with weather data...", color: "cyan" },
      { id: "fo-lo15", timestamp: "14:35:22", text: "Weather alert queued for scheduling agent", color: "green" },
    ],
    connectedTools: [
      { name: "Weather API", status: "connected" },
      { name: "Safety DB", status: "connected" },
      { name: "Material Tracker", status: "connected" },
      { name: "Camera/Photos", status: "connected" },
    ],
    recentOutputs: [
      { id: "fo-ro1", title: "Inspection report - 742 Oak St foundation", timeAgo: "3 min ago" },
      { id: "fo-ro2", title: "Weather forecast - 5-day outlook", timeAgo: "10 min ago" },
      { id: "fo-ro3", title: "Safety checklist - 318 Elm St", timeAgo: "15 min ago" },
      { id: "fo-ro4", title: "Material delivery log - Week of 3/16", timeAgo: "30 min ago" },
      { id: "fo-ro5", title: "Photo documentation - 142 Pine St", timeAgo: "1 hr ago" },
    ],
    metrics: [
      { label: "Inspections Logged", value: "4", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { label: "Safety Checks", value: "6", icon: Zap, color: "text-indigo-400", bg: "bg-indigo-500/10" },
      { label: "Material Orders", value: "2", icon: Send, color: "text-cyan-400", bg: "bg-cyan-500/10" },
      { label: "Weather Alerts", value: "1", icon: Target, color: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },
};

// Default fallback (customer-support)
const defaultData = agentWorkspaceData["customer-support"];

// ---------------------------------------------------------------------------
// Task status styles
// ---------------------------------------------------------------------------

const taskStatusConfig: Record<
  TaskStatus,
  { label: string; bg: string; text: string; icon: typeof Loader2 }
> = {
  running: {
    label: "Running",
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    icon: Loader2,
  },
  queued: {
    label: "Queued",
    bg: "bg-muted/50",
    text: "text-muted-foreground",
    icon: Clock,
  },
  "awaiting-approval": {
    label: "Awaiting Approval",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    icon: Pause,
  },
};

const logColorMap: Record<string, string> = {
  green: "text-green-400",
  amber: "text-amber-400",
  cyan: "text-cyan-400",
  white: "text-foreground/90",
  muted: "text-muted-foreground/70",
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const agentName = agentNameMap[id] || "Agent";

  const dataId = idAliasMap[id] || id;
  const data = agentWorkspaceData[dataId] || defaultData;
  const {
    activeTasks,
    completedTasks,
    liveOutput,
    connectedTools,
    recentOutputs,
    metrics,
  } = data;

  const runningCount = activeTasks.filter((t) => t.status === "running").length;

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-[1600px] space-y-6 p-6">
        {/* Back Link */}
        <Link
          href={`/dashboard/agents/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Agent Detail
        </Link>

        {/* Header */}
        <div className="glass glow-primary rounded-xl p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    {agentName}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                    <span className="size-1.5 rounded-full bg-green-400" />
                    Active
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-green-400" />
                    </span>
                    Processing {runningCount} tasks
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={`/dashboard/agents/${id}/chat`}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 ring-1 ring-indigo-500/20 transition-colors hover:bg-indigo-500/25"
            >
              <MessageSquare className="size-4" />
              Open Chat
            </Link>
          </div>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ---- Left Column: Current Tasks ---- */}
          <div className="space-y-6">
            {/* Active Tasks */}
            <div className="glass rounded-xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Active Tasks
                </h2>
                <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-400">
                  {activeTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {activeTasks.map((task) => {
                  const cfg = taskStatusConfig[task.status];
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={task.id}
                      className="rounded-lg border border-border/50 bg-muted/20 p-3.5 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-foreground/90">
                          {task.name}
                        </p>
                        <button className="shrink-0 rounded-md bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                          <Eye className="inline size-3 mr-0.5" />
                          View
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}
                        >
                          <StatusIcon
                            className={`size-3 ${
                              task.status === "running" ? "animate-spin" : ""
                            }`}
                          />
                          {cfg.label}
                        </span>
                      </div>
                      {task.progress !== undefined && (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{task.progress}%</span>
                            <span>{task.estimatedCompletion}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <Clock className="size-2.5" />
                        {task.startedAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completed Today */}
            <div className="glass rounded-xl p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Completed Today
                </h2>
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold text-green-400">
                  {completedTasks.length}
                </span>
              </div>
              <div className="space-y-1">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-muted/20"
                  >
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-green-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-snug text-foreground/80">
                        {task.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                        {task.completedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- Center Column: Live Output ---- */}
          <div className="glass rounded-xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Live Output
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-green-400" />
                </span>
                Streaming
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-4 overflow-x-auto">
              <div className="space-y-1 font-mono text-xs leading-relaxed">
                {liveOutput.map((line) => (
                  <div key={line.id} className="flex gap-3">
                    <span className="shrink-0 select-none text-muted-foreground/40">
                      {line.timestamp}
                    </span>
                    <span className={logColorMap[line.color]}>
                      {line.text}
                    </span>
                  </div>
                ))}
                {/* Blinking cursor */}
                <div className="flex gap-3">
                  <span className="shrink-0 select-none text-muted-foreground/40">
                    {liveOutput.length > 0
                      ? (() => {
                          const last = liveOutput[liveOutput.length - 1].timestamp;
                          const parts = last.split(":");
                          const seconds = parseInt(parts[2], 10) + 1;
                          return `${parts[0]}:${parts[1]}:${seconds.toString().padStart(2, "0")}`;
                        })()
                      : "00:00:00"}
                  </span>
                  <span className="inline-block h-4 w-2 animate-pulse bg-green-400/70" />
                </div>
              </div>
            </div>
          </div>

          {/* ---- Right Column: Stats & Tools ---- */}
          <div className="space-y-6">
            {/* Today's Metrics */}
            <div className="glass rounded-xl p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Today&apos;s Metrics
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric) => {
                  const MetricIcon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="rounded-lg border border-border/50 bg-muted/20 p-3"
                    >
                      <div
                        className={`mb-2 inline-flex rounded-md p-1.5 ${metric.bg}`}
                      >
                        <MetricIcon className={`size-3.5 ${metric.color}`} />
                      </div>
                      <p className="text-lg font-bold tracking-tight text-foreground">
                        {metric.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connected Tools */}
            <div className="glass rounded-xl p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Connected Tools
              </h2>
              <div className="space-y-2">
                {connectedTools.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center justify-between rounded-lg bg-muted/20 px-3.5 py-2.5"
                  >
                    <span className="text-sm text-foreground/80">
                      {tool.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CircleDot
                        className={`size-3 ${
                          tool.status === "connected"
                            ? "text-green-400"
                            : "text-amber-400"
                        }`}
                      />
                      <span
                        className={`text-[10px] font-medium ${
                          tool.status === "connected"
                            ? "text-green-400"
                            : "text-amber-400"
                        }`}
                      >
                        {tool.status === "connected"
                          ? "Connected"
                          : "Limited Access"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Outputs */}
            <div className="glass rounded-xl p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Recent Outputs
              </h2>
              <div className="space-y-1.5">
                {recentOutputs.map((output) => (
                  <div
                    key={output.id}
                    className="group flex items-start justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <FileText className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-snug text-foreground/80 line-clamp-1">
                          {output.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                          {output.timeAgo}
                        </p>
                      </div>
                    </div>
                    <button className="shrink-0 rounded-md bg-muted/40 px-2 py-1 text-[10px] font-medium text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/60 hover:text-foreground">
                      <ExternalLink className="inline size-3 mr-0.5" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
