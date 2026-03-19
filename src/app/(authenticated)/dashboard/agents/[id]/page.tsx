"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Headset,
  Mail,
  Calendar,
  Calculator,
  Wrench,
  Palette,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Clock,
  Star,
  Activity,
  Info,
  AlertTriangle,
  XCircle,
  Zap,
  Shield,
  ArrowUpRight,
  Settings2,
  TrendingUp,
  DollarSign,
  Target,
  FileText,
  FolderKanban,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentStatus = "Active" | "Paused";
type LogLevel = "info" | "warn" | "error";
type ConversationStatus = "Resolved" | "In Progress" | "Escalated";
type Sentiment = "Positive" | "Neutral" | "Negative";

interface AgentStat {
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string;
  glowColor: string;
}

interface PerformancePoint {
  date: string;
  conversations: number;
  resolutionRate: number;
}

interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: "success" | "info" | "warning";
}

interface Conversation {
  id: string;
  customer: string;
  subject: string;
  status: ConversationStatus;
  duration: string;
  sentiment: Sentiment;
  date: string;
}

interface AgentConfig {
  model: string;
  temperature: number;
  systemPrompt: string;
  tools: Array<{ name: string; enabled: boolean }>;
  escalationRules: Array<{ condition: string; action: string }>;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

interface AgentDetail {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  status: AgentStatus;
  stats: AgentStat[];
  performance: PerformancePoint[];
  activity: ActivityItem[];
  conversations: Conversation[];
  config: AgentConfig;
  logs: LogEntry[];
}

// ---------------------------------------------------------------------------
// Agent icon & name maps (for all 7 agents)
// ---------------------------------------------------------------------------

const agentIconMap: Record<string, LucideIcon> = {
  "discovery-concierge": Mail,
  "estimate-engine": Calculator,
  "operations-controller": Wrench,
  "executive-navigator": BarChart3,
  "project-orchestrator": Calendar,
  "design-spec-assistant": Palette,
  "support-agent": Headset,
  // Legacy IDs for backward compatibility
  "customer-support": Headset,
  "sales-outreach": Mail,
  "scheduling": Calendar,
  "estimation": Calculator,
  "bookkeeping": Wrench,
  "project-management": FolderKanban,
  "field-operations": ClipboardCheck,
};

const agentNameMap: Record<string, string> = {
  "discovery-concierge": "Discovery Concierge",
  "estimate-engine": "Estimate Engine",
  "operations-controller": "Operations Controller",
  "executive-navigator": "Executive Navigator",
  "project-orchestrator": "Project Orchestrator",
  "design-spec-assistant": "Design Spec Assistant",
  "support-agent": "Support Agent",
  "customer-support": "Support Agent",
  "sales-outreach": "Discovery Concierge",
  "scheduling": "Project Orchestrator",
  "estimation": "Estimate Engine",
  "bookkeeping": "Operations Controller",
  "project-management": "Executive Navigator",
  "field-operations": "Design Spec Assistant",
};

const agentDescriptionMap: Record<string, string> = {
  "discovery-concierge":
    "Qualifies and routes inbound leads automatically. Scores leads based on engagement signals, classifies inquiries by intent, and initiates personalized outreach cadences for high-value prospects.",
  "estimate-engine":
    "Generates detailed project cost estimates from specs and verified pricing data. Produces material breakdowns, compares vendor pricing across 500+ materials, and flags potential budget overruns early.",
  "operations-controller":
    "Manages billing memos, AP/AR tracking, lien waivers, and QuickBooks integration. Provides real-time financial visibility with budget variance alerts and invoice processing.",
  "executive-navigator":
    "Surfaces KPIs, financial insights, and strategic briefings for leadership. Generates daily morning summaries, revenue forecasts, and cross-agent performance analysis.",
  "project-orchestrator":
    "Manages crew scheduling, equipment allocation, and appointment coordination. Resolves conflicts automatically, optimizes resource utilization, and sends real-time notifications for schedule changes.",
  "design-spec-assistant":
    "Extracts specs and submittals from design documents. Parses architectural drawings, identifies material specifications, and generates structured submittal packages for contractor review.",
  "support-agent":
    "AI-first customer support with knowledge base grounding. Targets 20-25% autonomous resolution at launch, scaling to 35-45% after 6 months. Uses confidence-gated responses and smart escalation.",
  "customer-support":
    "Handles customer inquiries, ticket triage, warranty claims, and automated response drafting. Monitors sentiment across all customer interactions and escalates critical issues.",
  "sales-outreach":
    "Qualifies and routes inbound leads automatically. Scores leads based on engagement signals and generates personalized proposals for high-value prospects.",
  "scheduling":
    "Coordinates crew schedules, equipment allocation, and appointment management. Resolves conflicts automatically and optimizes resource utilization.",
  "estimation":
    "Generates detailed project estimates using material databases, labor rates, and historical project data. Produces cost breakdowns and compares vendor pricing.",
  "bookkeeping":
    "Processes transactions, reconciles accounts, and manages invoicing workflows. Integrates with QuickBooks for real-time financial tracking.",
  "project-management":
    "Tracks project milestones, monitors deliverables, and generates status reports. Identifies schedule risks and manages dependencies across projects.",
  "field-operations":
    "Manages field inspections, safety compliance, and quality assurance workflows. Generates inspection reports and tracks deficiency resolution.",
};

const agentStatusMap: Record<string, AgentStatus> = {
  "discovery-concierge": "Active",
  "estimate-engine": "Active",
  "operations-controller": "Active",
  "executive-navigator": "Active",
  "project-orchestrator": "Active",
  "design-spec-assistant": "Paused",
  "support-agent": "Active",
  "customer-support": "Active",
  "sales-outreach": "Active",
  "scheduling": "Active",
  "estimation": "Active",
  "bookkeeping": "Active",
  "project-management": "Active",
  "field-operations": "Active",
};

// ---------------------------------------------------------------------------
// Per-Agent Stats
// ---------------------------------------------------------------------------

const agentStatsMap: Record<string, AgentStat[]> = {
  "customer-support": [
    { label: "Total Conversations", value: "2,847", delta: "+12.4%", deltaType: "up", icon: MessageSquare, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "Resolution Rate", value: "22.4%", delta: "+4.1%", deltaType: "up", icon: CheckCircle2, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Response Time", value: "1.8s", delta: "-0.4s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Customer Satisfaction", value: "4.7/5", delta: "+0.2", deltaType: "up", icon: Star, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
  "sales-outreach": [
    { label: "Leads Processed", value: "1,234", delta: "+18.7%", deltaType: "up", icon: Target, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "Conversion Rate", value: "23%", delta: "+4.2%", deltaType: "up", icon: TrendingUp, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Response Time", value: "3.2s", delta: "-0.8s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Pipeline Value", value: "$1.2M", delta: "+$180K", deltaType: "up", icon: DollarSign, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
  "scheduling": [
    { label: "Schedules Managed", value: "892", delta: "+8.3%", deltaType: "up", icon: Calendar, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "On-Time Rate", value: "98.1%", delta: "+1.4%", deltaType: "up", icon: CheckCircle2, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Response Time", value: "0.8s", delta: "-0.2s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Avg Conflicts/Week", value: "4", delta: "-2", deltaType: "up", icon: AlertTriangle, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
  "estimation": [
    { label: "Estimates Created", value: "456", delta: "+22.1%", deltaType: "up", icon: FileText, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "Accuracy Rate", value: "87%", delta: "+5.3%", deltaType: "up", icon: Target, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Generation Time", value: "12s", delta: "-3s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Total Estimated", value: "$4.8M", delta: "+$620K", deltaType: "up", icon: DollarSign, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
  "bookkeeping": [
    { label: "Transactions Processed", value: "3,421", delta: "+9.8%", deltaType: "up", icon: BarChart3, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "Accuracy Rate", value: "99.7%", delta: "+0.1%", deltaType: "up", icon: CheckCircle2, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Processing Time", value: "2.1s", delta: "-0.3s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Monthly Volume", value: "$284K", delta: "+$32K", deltaType: "up", icon: DollarSign, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
  "project-management": [
    { label: "Projects Tracked", value: "47", delta: "+6", deltaType: "up", icon: FolderKanban, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "On-Schedule Rate", value: "92%", delta: "+4.1%", deltaType: "up", icon: CheckCircle2, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Report Time", value: "5.4s", delta: "-1.2s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Risks Flagged", value: "3", delta: "-1", deltaType: "up", icon: AlertTriangle, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
  "field-operations": [
    { label: "Inspections Completed", value: "234", delta: "+15.2%", deltaType: "up", icon: ClipboardCheck, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "Pass Rate", value: "96%", delta: "+2.8%", deltaType: "up", icon: CheckCircle2, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Report Time", value: "45s", delta: "-8s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Safety Alerts", value: "12", delta: "+3", deltaType: "down", icon: Shield, color: "text-red-400", glowColor: "shadow-[0_0_12px_rgba(239,68,68,0.2)]" },
  ],
  "design-spec": [
    { label: "Specs Processed", value: "234", delta: "+18.3%", deltaType: "up", icon: FileText, color: "text-indigo-400", glowColor: "shadow-[0_0_12px_rgba(99,102,241,0.2)]" },
    { label: "Submittals Generated", value: "89", delta: "+12.1%", deltaType: "up", icon: CheckCircle2, color: "text-green-400", glowColor: "shadow-[0_0_12px_rgba(34,197,94,0.2)]" },
    { label: "Avg Extraction Time", value: "8.2s", delta: "-2.1s", deltaType: "up", icon: Clock, color: "text-cyan-400", glowColor: "shadow-[0_0_12px_rgba(34,211,238,0.2)]" },
    { label: "Materials Identified", value: "1,847", delta: "+246", deltaType: "up", icon: Target, color: "text-amber-400", glowColor: "shadow-[0_0_12px_rgba(245,158,11,0.2)]" },
  ],
};

// ---------------------------------------------------------------------------
// Per-Agent Performance Chart Data
// ---------------------------------------------------------------------------

const agentPerformanceMap: Record<string, PerformancePoint[]> = {
  "customer-support": [
    { date: "Feb 15", conversations: 42, resolutionRate: 89 },
    { date: "Feb 17", conversations: 38, resolutionRate: 91 },
    { date: "Feb 19", conversations: 55, resolutionRate: 87 },
    { date: "Feb 21", conversations: 48, resolutionRate: 92 },
    { date: "Feb 23", conversations: 62, resolutionRate: 90 },
    { date: "Feb 25", conversations: 45, resolutionRate: 93 },
    { date: "Feb 27", conversations: 58, resolutionRate: 88 },
    { date: "Mar 01", conversations: 71, resolutionRate: 91 },
    { date: "Mar 03", conversations: 64, resolutionRate: 94 },
    { date: "Mar 05", conversations: 53, resolutionRate: 92 },
    { date: "Mar 07", conversations: 68, resolutionRate: 95 },
    { date: "Mar 09", conversations: 74, resolutionRate: 93 },
    { date: "Mar 11", conversations: 59, resolutionRate: 96 },
    { date: "Mar 13", conversations: 82, resolutionRate: 94 },
    { date: "Mar 15", conversations: 77, resolutionRate: 95 },
  ],
  "sales-outreach": [
    { date: "Feb 15", conversations: 18, resolutionRate: 15 },
    { date: "Feb 17", conversations: 22, resolutionRate: 18 },
    { date: "Feb 19", conversations: 15, resolutionRate: 20 },
    { date: "Feb 21", conversations: 28, resolutionRate: 22 },
    { date: "Feb 23", conversations: 24, resolutionRate: 19 },
    { date: "Feb 25", conversations: 31, resolutionRate: 25 },
    { date: "Feb 27", conversations: 19, resolutionRate: 21 },
    { date: "Mar 01", conversations: 35, resolutionRate: 24 },
    { date: "Mar 03", conversations: 27, resolutionRate: 23 },
    { date: "Mar 05", conversations: 32, resolutionRate: 26 },
    { date: "Mar 07", conversations: 29, resolutionRate: 22 },
    { date: "Mar 09", conversations: 38, resolutionRate: 25 },
    { date: "Mar 11", conversations: 33, resolutionRate: 23 },
    { date: "Mar 13", conversations: 41, resolutionRate: 27 },
    { date: "Mar 15", conversations: 36, resolutionRate: 24 },
  ],
  "scheduling": [
    { date: "Feb 15", conversations: 12, resolutionRate: 96 },
    { date: "Feb 17", conversations: 15, resolutionRate: 97 },
    { date: "Feb 19", conversations: 18, resolutionRate: 95 },
    { date: "Feb 21", conversations: 14, resolutionRate: 98 },
    { date: "Feb 23", conversations: 20, resolutionRate: 97 },
    { date: "Feb 25", conversations: 16, resolutionRate: 99 },
    { date: "Feb 27", conversations: 22, resolutionRate: 96 },
    { date: "Mar 01", conversations: 19, resolutionRate: 98 },
    { date: "Mar 03", conversations: 17, resolutionRate: 97 },
    { date: "Mar 05", conversations: 21, resolutionRate: 99 },
    { date: "Mar 07", conversations: 24, resolutionRate: 98 },
    { date: "Mar 09", conversations: 18, resolutionRate: 97 },
    { date: "Mar 11", conversations: 23, resolutionRate: 99 },
    { date: "Mar 13", conversations: 20, resolutionRate: 98 },
    { date: "Mar 15", conversations: 25, resolutionRate: 98 },
  ],
  "estimation": [
    { date: "Feb 15", conversations: 4, resolutionRate: 82 },
    { date: "Feb 17", conversations: 6, resolutionRate: 84 },
    { date: "Feb 19", conversations: 3, resolutionRate: 80 },
    { date: "Feb 21", conversations: 7, resolutionRate: 86 },
    { date: "Feb 23", conversations: 5, resolutionRate: 83 },
    { date: "Feb 25", conversations: 8, resolutionRate: 88 },
    { date: "Feb 27", conversations: 4, resolutionRate: 85 },
    { date: "Mar 01", conversations: 9, resolutionRate: 87 },
    { date: "Mar 03", conversations: 6, resolutionRate: 86 },
    { date: "Mar 05", conversations: 7, resolutionRate: 89 },
    { date: "Mar 07", conversations: 5, resolutionRate: 87 },
    { date: "Mar 09", conversations: 10, resolutionRate: 88 },
    { date: "Mar 11", conversations: 8, resolutionRate: 90 },
    { date: "Mar 13", conversations: 11, resolutionRate: 87 },
    { date: "Mar 15", conversations: 9, resolutionRate: 89 },
  ],
  "bookkeeping": [
    { date: "Feb 15", conversations: 52, resolutionRate: 99 },
    { date: "Feb 17", conversations: 48, resolutionRate: 100 },
    { date: "Feb 19", conversations: 61, resolutionRate: 99 },
    { date: "Feb 21", conversations: 55, resolutionRate: 100 },
    { date: "Feb 23", conversations: 67, resolutionRate: 99 },
    { date: "Feb 25", conversations: 58, resolutionRate: 100 },
    { date: "Feb 27", conversations: 72, resolutionRate: 99 },
    { date: "Mar 01", conversations: 63, resolutionRate: 100 },
    { date: "Mar 03", conversations: 59, resolutionRate: 99 },
    { date: "Mar 05", conversations: 74, resolutionRate: 100 },
    { date: "Mar 07", conversations: 68, resolutionRate: 100 },
    { date: "Mar 09", conversations: 81, resolutionRate: 99 },
    { date: "Mar 11", conversations: 70, resolutionRate: 100 },
    { date: "Mar 13", conversations: 85, resolutionRate: 100 },
    { date: "Mar 15", conversations: 78, resolutionRate: 99 },
  ],
  "project-management": [
    { date: "Feb 15", conversations: 8, resolutionRate: 88 },
    { date: "Feb 17", conversations: 6, resolutionRate: 90 },
    { date: "Feb 19", conversations: 10, resolutionRate: 87 },
    { date: "Feb 21", conversations: 7, resolutionRate: 91 },
    { date: "Feb 23", conversations: 9, resolutionRate: 89 },
    { date: "Feb 25", conversations: 11, resolutionRate: 92 },
    { date: "Feb 27", conversations: 8, resolutionRate: 90 },
    { date: "Mar 01", conversations: 12, resolutionRate: 93 },
    { date: "Mar 03", conversations: 9, resolutionRate: 91 },
    { date: "Mar 05", conversations: 10, resolutionRate: 92 },
    { date: "Mar 07", conversations: 13, resolutionRate: 94 },
    { date: "Mar 09", conversations: 11, resolutionRate: 92 },
    { date: "Mar 11", conversations: 14, resolutionRate: 93 },
    { date: "Mar 13", conversations: 12, resolutionRate: 95 },
    { date: "Mar 15", conversations: 15, resolutionRate: 93 },
  ],
  "field-operations": [
    { date: "Feb 15", conversations: 3, resolutionRate: 94 },
    { date: "Feb 17", conversations: 5, resolutionRate: 92 },
    { date: "Feb 19", conversations: 4, resolutionRate: 95 },
    { date: "Feb 21", conversations: 6, resolutionRate: 93 },
    { date: "Feb 23", conversations: 4, resolutionRate: 96 },
    { date: "Feb 25", conversations: 7, resolutionRate: 94 },
    { date: "Feb 27", conversations: 5, resolutionRate: 97 },
    { date: "Mar 01", conversations: 8, resolutionRate: 95 },
    { date: "Mar 03", conversations: 6, resolutionRate: 96 },
    { date: "Mar 05", conversations: 5, resolutionRate: 94 },
    { date: "Mar 07", conversations: 7, resolutionRate: 97 },
    { date: "Mar 09", conversations: 9, resolutionRate: 95 },
    { date: "Mar 11", conversations: 6, resolutionRate: 96 },
    { date: "Mar 13", conversations: 8, resolutionRate: 97 },
    { date: "Mar 15", conversations: 10, resolutionRate: 96 },
  ],
  "design-spec": [
    { date: "Feb 15", conversations: 8, resolutionRate: 91 },
    { date: "Feb 17", conversations: 12, resolutionRate: 93 },
    { date: "Feb 19", conversations: 10, resolutionRate: 92 },
    { date: "Feb 21", conversations: 15, resolutionRate: 94 },
    { date: "Feb 23", conversations: 11, resolutionRate: 93 },
    { date: "Feb 25", conversations: 14, resolutionRate: 95 },
    { date: "Feb 27", conversations: 13, resolutionRate: 94 },
    { date: "Mar 01", conversations: 18, resolutionRate: 96 },
    { date: "Mar 03", conversations: 16, resolutionRate: 95 },
    { date: "Mar 05", conversations: 14, resolutionRate: 94 },
    { date: "Mar 07", conversations: 19, resolutionRate: 96 },
    { date: "Mar 09", conversations: 17, resolutionRate: 95 },
    { date: "Mar 11", conversations: 20, resolutionRate: 97 },
    { date: "Mar 13", conversations: 22, resolutionRate: 96 },
    { date: "Mar 15", conversations: 18, resolutionRate: 95 },
  ],
};

// ---------------------------------------------------------------------------
// Per-Agent Activity Data
// ---------------------------------------------------------------------------

const agentActivityMap: Record<string, ActivityItem[]> = {
  "customer-support": [
    { id: "a1", message: "Resolved warranty claim #T-5021 for Pacific Corp", timestamp: "2 min ago", type: "success" },
    { id: "a2", message: "Escalated billing dispute from Metro Builders to finance team", timestamp: "8 min ago", type: "warning" },
    { id: "a3", message: "Auto-resolved FAQ inquiry about service hours", timestamp: "12 min ago", type: "success" },
    { id: "a4", message: "Sentiment alert: negative trend detected for client Westfield Holdings", timestamp: "18 min ago", type: "warning" },
    { id: "a5", message: "Drafted response for RFI #2847 regarding change order process", timestamp: "25 min ago", type: "info" },
    { id: "a6", message: "Triaged 4 new tickets: 1 urgent, 3 standard priority", timestamp: "32 min ago", type: "info" },
    { id: "a7", message: "Resolved scheduling conflict inquiry for Project Alpine crew", timestamp: "41 min ago", type: "success" },
    { id: "a8", message: "Updated knowledge base with new warranty policy FAQ entries", timestamp: "55 min ago", type: "info" },
    { id: "a9", message: "Auto-closed 3 stale tickets with customer confirmation", timestamp: "1h ago", type: "success" },
    { id: "a10", message: "Processed customer satisfaction survey batch - NPS: 74 (+2)", timestamp: "1h ago", type: "info" },
  ],
  "sales-outreach": [
    { id: "a1", message: "Qualified lead: Greenfield Construction - $340K potential project", timestamp: "3 min ago", type: "success" },
    { id: "a2", message: "Sent follow-up sequence email #3 to 12 warm leads", timestamp: "10 min ago", type: "info" },
    { id: "a3", message: "Lead scoring updated: Riverside Development moved to Hot tier", timestamp: "15 min ago", type: "success" },
    { id: "a4", message: "Proposal generated for Summit Builders - commercial renovation $520K", timestamp: "22 min ago", type: "info" },
    { id: "a5", message: "Stale lead alert: 8 leads inactive >14 days, re-engagement triggered", timestamp: "30 min ago", type: "warning" },
    { id: "a6", message: "New inbound lead captured from website form - Oakland Medical Center", timestamp: "38 min ago", type: "success" },
    { id: "a7", message: "Pipeline report generated: $1.2M active, $380K closing this month", timestamp: "45 min ago", type: "info" },
    { id: "a8", message: "CRM sync completed: 23 records updated from email interactions", timestamp: "52 min ago", type: "info" },
    { id: "a9", message: "Competitor analysis flag: Westside bid $15K below our estimate on Project Cedar", timestamp: "1h ago", type: "warning" },
    { id: "a10", message: "Converted lead: Harbor Point accepted proposal - $180K roofing project", timestamp: "1h ago", type: "success" },
  ],
  "scheduling": [
    { id: "a1", message: "Resolved crew conflict: reassigned Team B from Oak St to Pine Ave site", timestamp: "1 min ago", type: "success" },
    { id: "a2", message: "Equipment overlap detected: excavator double-booked for Mar 18", timestamp: "5 min ago", type: "warning" },
    { id: "a3", message: "Auto-scheduled 3 inspections for Project Maple completion phase", timestamp: "12 min ago", type: "success" },
    { id: "a4", message: "Weather alert: rain forecast Mar 19-20, outdoor tasks rescheduled", timestamp: "18 min ago", type: "warning" },
    { id: "a5", message: "Crew notification sent: Team A start time changed to 7:00 AM tomorrow", timestamp: "25 min ago", type: "info" },
    { id: "a6", message: "Optimized next week schedule: reduced travel time by 22%", timestamp: "35 min ago", type: "success" },
    { id: "a7", message: "Client appointment confirmed: Sarah Mitchell site visit Mar 18 2PM", timestamp: "42 min ago", type: "info" },
    { id: "a8", message: "Subcontractor availability updated: ABC Plumbing unavailable Mar 20-22", timestamp: "50 min ago", type: "info" },
    { id: "a9", message: "Resource utilization report: 87% efficiency this week (+3%)", timestamp: "1h ago", type: "success" },
    { id: "a10", message: "Permit inspection slot secured: Building Dept Mar 19 10AM", timestamp: "1h ago", type: "info" },
  ],
  "estimation": [
    { id: "a1", message: "Estimate completed: Riverside Kitchen Remodel - $47,200 (12 line items)", timestamp: "5 min ago", type: "success" },
    { id: "a2", message: "Material price alert: lumber costs up 8% - 3 active estimates affected", timestamp: "15 min ago", type: "warning" },
    { id: "a3", message: "Vendor quote received: ABC Supply - drywall at $0.42/sqft (best price)", timestamp: "22 min ago", type: "info" },
    { id: "a4", message: "Estimate revision requested: Summit Office Build - scope change (+2 floors)", timestamp: "35 min ago", type: "info" },
    { id: "a5", message: "Cost comparison complete: 4 vendor bids analyzed for Project Oak roofing", timestamp: "48 min ago", type: "success" },
    { id: "a6", message: "Budget overrun warning: Harbor Point actuals 12% over estimate", timestamp: "1h ago", type: "warning" },
    { id: "a7", message: "Historical data match: similar project found - Pine Valley 2025 ($52K actual)", timestamp: "1h ago", type: "info" },
    { id: "a8", message: "Estimate approved by client: Metro Builders bathroom renovation $28,900", timestamp: "2h ago", type: "success" },
    { id: "a9", message: "Subcontractor rate update: electrical labor rate increased to $85/hr", timestamp: "2h ago", type: "info" },
    { id: "a10", message: "Batch estimate generated: 3 unit types for Greenfield Townhomes", timestamp: "3h ago", type: "success" },
  ],
  "bookkeeping": [
    { id: "a1", message: "Invoice #INV-2847 processed: Pacific Corp - $12,400 (net 30)", timestamp: "1 min ago", type: "success" },
    { id: "a2", message: "QuickBooks sync completed: 48 transactions reconciled, 0 discrepancies", timestamp: "8 min ago", type: "success" },
    { id: "a3", message: "Payment received: Metro Builders - $8,750 applied to INV-2831", timestamp: "14 min ago", type: "success" },
    { id: "a4", message: "Duplicate transaction detected: $1,200 charge on account #4892 flagged", timestamp: "20 min ago", type: "warning" },
    { id: "a5", message: "Payroll batch processed: 24 employees, total gross $67,400", timestamp: "30 min ago", type: "info" },
    { id: "a6", message: "Overdue invoice alert: 3 invoices >30 days past due ($18,200 total)", timestamp: "40 min ago", type: "warning" },
    { id: "a7", message: "Monthly P&L report generated for February 2026", timestamp: "50 min ago", type: "info" },
    { id: "a8", message: "Expense categorization: 15 transactions auto-classified (materials, labor, overhead)", timestamp: "1h ago", type: "info" },
    { id: "a9", message: "Tax liability estimate updated: Q1 estimated payment $14,200", timestamp: "1h ago", type: "info" },
    { id: "a10", message: "Vendor payment batch: 8 payments scheduled for Mar 18 ($42,100 total)", timestamp: "2h ago", type: "success" },
  ],
  "project-management": [
    { id: "a1", message: "Milestone completed: Project Alpine - foundation pour phase signed off", timestamp: "4 min ago", type: "success" },
    { id: "a2", message: "Schedule risk detected: Project Cedar framing 3 days behind target", timestamp: "12 min ago", type: "warning" },
    { id: "a3", message: "Status report generated: 47 projects, 43 on-track, 4 at-risk", timestamp: "18 min ago", type: "info" },
    { id: "a4", message: "Dependency resolved: electrical rough-in cleared for Project Oak inspection", timestamp: "28 min ago", type: "success" },
    { id: "a5", message: "Stakeholder update sent: weekly digest to 12 project owners", timestamp: "35 min ago", type: "info" },
    { id: "a6", message: "Resource conflict: 2 projects competing for crane availability week of Mar 22", timestamp: "45 min ago", type: "warning" },
    { id: "a7", message: "Budget variance alert: Project Birch at 94% budget with 82% completion", timestamp: "55 min ago", type: "warning" },
    { id: "a8", message: "Change order tracked: Project Maple - client requested deck expansion (+$8,400)", timestamp: "1h ago", type: "info" },
    { id: "a9", message: "Project closed: Harbor Point Renovation - delivered on time, under budget", timestamp: "2h ago", type: "success" },
    { id: "a10", message: "Risk matrix updated: 3 new risks identified across active portfolio", timestamp: "2h ago", type: "info" },
  ],
  "field-operations": [
    { id: "a1", message: "Inspection passed: Project Oak - electrical rough-in (score: 98/100)", timestamp: "6 min ago", type: "success" },
    { id: "a2", message: "Safety alert: Fall protection violation reported at Pine Ave site", timestamp: "12 min ago", type: "warning" },
    { id: "a3", message: "Inspection report generated: Riverside Foundation - 14 items checked, 1 deficiency", timestamp: "20 min ago", type: "info" },
    { id: "a4", message: "Deficiency resolved: Metro Builders - waterproofing repair verified on-site", timestamp: "30 min ago", type: "success" },
    { id: "a5", message: "OSHA compliance check: all 12 active sites - 11 compliant, 1 corrective action needed", timestamp: "40 min ago", type: "warning" },
    { id: "a6", message: "Quality photo documentation uploaded: 42 photos from 3 site visits", timestamp: "50 min ago", type: "info" },
    { id: "a7", message: "Equipment maintenance due: Crane #C-04 inspection overdue by 2 days", timestamp: "1h ago", type: "warning" },
    { id: "a8", message: "Final inspection scheduled: Summit Office Build - city inspector Mar 19", timestamp: "1h ago", type: "info" },
    { id: "a9", message: "Punch list generated: Harbor Point - 8 items remaining before closeout", timestamp: "2h ago", type: "success" },
    { id: "a10", message: "Weather damage assessment: 2 sites checked post-storm, no structural issues", timestamp: "3h ago", type: "success" },
  ],
  "design-spec": [
    { id: "a1", message: "Extracted 47 material specs from Johnson Kitchen architectural drawings", timestamp: "3 min ago", type: "success" },
    { id: "a2", message: "Submittal package generated: Project Oak - plumbing fixtures (18 items)", timestamp: "10 min ago", type: "success" },
    { id: "a3", message: "Material conflict detected: specified granite discontinued, suggesting alternatives", timestamp: "18 min ago", type: "warning" },
    { id: "a4", message: "Parsed AutoCAD DXF: Westfield_Office_v3.dxf - 234 entities extracted", timestamp: "25 min ago", type: "info" },
    { id: "a5", message: "Cut sheet compiled: Anderson Windows - Series 400 Woodwright (12 units)", timestamp: "32 min ago", type: "success" },
    { id: "a6", message: "Spec discrepancy: floor plan shows 36\" door but schedule lists 32\"", timestamp: "40 min ago", type: "warning" },
    { id: "a7", message: "Google Drive sync: 8 new design files imported from Shared/Designs", timestamp: "48 min ago", type: "info" },
    { id: "a8", message: "Revit model processed: Harbor Point - extracted MEP specifications", timestamp: "55 min ago", type: "success" },
    { id: "a9", message: "Submittal tracking update: 89 total, 72 approved, 12 pending, 5 revise & resubmit", timestamp: "1h ago", type: "info" },
    { id: "a10", message: "Material database updated: 46 new products from BuilderTrend catalog import", timestamp: "2h ago", type: "info" },
  ],
};

// ---------------------------------------------------------------------------
// Per-Agent Conversations
// ---------------------------------------------------------------------------

const agentConversationsMap: Record<string, Conversation[]> = {
  "customer-support": [
    { id: "c1", customer: "Sarah Mitchell", subject: "Warranty claim on exterior siding", status: "Resolved", duration: "4m 32s", sentiment: "Positive", date: "Mar 16, 2:34 PM" },
    { id: "c2", customer: "James Rodriguez", subject: "Invoice discrepancy - Project Oak", status: "Escalated", duration: "12m 15s", sentiment: "Negative", date: "Mar 16, 2:26 PM" },
    { id: "c3", customer: "Emily Chen", subject: "Schedule update request", status: "Resolved", duration: "2m 48s", sentiment: "Neutral", date: "Mar 16, 2:14 PM" },
    { id: "c4", customer: "Michael Torres", subject: "Material substitution approval", status: "In Progress", duration: "6m 20s", sentiment: "Neutral", date: "Mar 16, 1:58 PM" },
    { id: "c5", customer: "Lisa Park", subject: "Project completion timeline inquiry", status: "Resolved", duration: "3m 10s", sentiment: "Positive", date: "Mar 16, 1:42 PM" },
    { id: "c6", customer: "David Kim", subject: "Change order cost breakdown", status: "Resolved", duration: "5m 45s", sentiment: "Positive", date: "Mar 16, 1:30 PM" },
  ],
  "sales-outreach": [
    { id: "c1", customer: "Greenfield Construction", subject: "Initial qualification - commercial build", status: "Resolved", duration: "8m 12s", sentiment: "Positive", date: "Mar 16, 2:30 PM" },
    { id: "c2", customer: "Riverside Development", subject: "Proposal follow-up - townhome project", status: "In Progress", duration: "5m 48s", sentiment: "Positive", date: "Mar 16, 2:15 PM" },
    { id: "c3", customer: "Summit Builders", subject: "Competitive pricing inquiry", status: "Escalated", duration: "14m 20s", sentiment: "Negative", date: "Mar 16, 1:52 PM" },
    { id: "c4", customer: "Oakland Medical Center", subject: "Inbound lead - facility expansion", status: "In Progress", duration: "3m 40s", sentiment: "Neutral", date: "Mar 16, 1:38 PM" },
    { id: "c5", customer: "Harbor Point LLC", subject: "Contract negotiation - roofing scope", status: "Resolved", duration: "18m 05s", sentiment: "Positive", date: "Mar 16, 1:10 PM" },
    { id: "c6", customer: "Westside Properties", subject: "Re-engagement after 30-day dormancy", status: "In Progress", duration: "4m 15s", sentiment: "Neutral", date: "Mar 16, 12:45 PM" },
  ],
  "scheduling": [
    { id: "c1", customer: "Team A - Foreman", subject: "Tomorrow start time change request", status: "Resolved", duration: "1m 20s", sentiment: "Neutral", date: "Mar 16, 2:40 PM" },
    { id: "c2", customer: "ABC Plumbing", subject: "Subcontractor availability update", status: "Resolved", duration: "2m 05s", sentiment: "Neutral", date: "Mar 16, 2:22 PM" },
    { id: "c3", customer: "Sarah Mitchell", subject: "Client site visit scheduling", status: "Resolved", duration: "1m 48s", sentiment: "Positive", date: "Mar 16, 2:08 PM" },
    { id: "c4", customer: "Building Dept", subject: "Permit inspection slot request", status: "In Progress", duration: "3m 30s", sentiment: "Neutral", date: "Mar 16, 1:50 PM" },
    { id: "c5", customer: "Equipment Rental Co", subject: "Excavator double-booking resolution", status: "Escalated", duration: "8m 15s", sentiment: "Negative", date: "Mar 16, 1:30 PM" },
    { id: "c6", customer: "Team B - Foreman", subject: "Crew reassignment notification - Oak to Pine", status: "Resolved", duration: "1m 55s", sentiment: "Neutral", date: "Mar 16, 1:12 PM" },
  ],
  "estimation": [
    { id: "c1", customer: "Riverside Homeowner", subject: "Kitchen remodel estimate request", status: "Resolved", duration: "25m 40s", sentiment: "Positive", date: "Mar 16, 2:20 PM" },
    { id: "c2", customer: "Summit Builders", subject: "Office build scope change - add 2 floors", status: "In Progress", duration: "18m 30s", sentiment: "Neutral", date: "Mar 16, 1:45 PM" },
    { id: "c3", customer: "Metro Builders", subject: "Bathroom renovation final estimate", status: "Resolved", duration: "12m 15s", sentiment: "Positive", date: "Mar 16, 1:20 PM" },
    { id: "c4", customer: "Greenfield Townhomes", subject: "Batch unit estimation - 3 floor plans", status: "Resolved", duration: "42m 10s", sentiment: "Neutral", date: "Mar 16, 12:30 PM" },
    { id: "c5", customer: "Project Oak PM", subject: "Roofing vendor bid comparison", status: "Resolved", duration: "15m 22s", sentiment: "Positive", date: "Mar 16, 11:45 AM" },
    { id: "c6", customer: "Harbor Point LLC", subject: "Actuals vs estimate variance review", status: "Escalated", duration: "20m 08s", sentiment: "Negative", date: "Mar 16, 11:00 AM" },
  ],
  "bookkeeping": [
    { id: "c1", customer: "Pacific Corp", subject: "Invoice #INV-2847 processing", status: "Resolved", duration: "1m 45s", sentiment: "Positive", date: "Mar 16, 2:38 PM" },
    { id: "c2", customer: "Metro Builders", subject: "Payment application - $8,750", status: "Resolved", duration: "2m 10s", sentiment: "Positive", date: "Mar 16, 2:20 PM" },
    { id: "c3", customer: "Account #4892", subject: "Duplicate transaction investigation", status: "In Progress", duration: "5m 30s", sentiment: "Neutral", date: "Mar 16, 2:05 PM" },
    { id: "c4", customer: "Payroll Dept", subject: "Bi-weekly payroll batch - 24 employees", status: "Resolved", duration: "8m 20s", sentiment: "Neutral", date: "Mar 16, 1:40 PM" },
    { id: "c5", customer: "AR Department", subject: "Overdue invoice collection follow-up", status: "Escalated", duration: "6m 15s", sentiment: "Negative", date: "Mar 16, 1:15 PM" },
    { id: "c6", customer: "Tax Advisor", subject: "Q1 estimated tax liability review", status: "Resolved", duration: "4m 50s", sentiment: "Neutral", date: "Mar 16, 12:50 PM" },
  ],
  "project-management": [
    { id: "c1", customer: "Project Alpine PM", subject: "Foundation milestone sign-off", status: "Resolved", duration: "6m 20s", sentiment: "Positive", date: "Mar 16, 2:35 PM" },
    { id: "c2", customer: "Project Cedar PM", subject: "Framing delay - 3 day slippage analysis", status: "In Progress", duration: "12m 40s", sentiment: "Negative", date: "Mar 16, 2:10 PM" },
    { id: "c3", customer: "Stakeholder Group", subject: "Weekly digest generation and distribution", status: "Resolved", duration: "4m 15s", sentiment: "Neutral", date: "Mar 16, 1:50 PM" },
    { id: "c4", customer: "Project Birch Owner", subject: "Budget variance alert - 94% at 82% complete", status: "Escalated", duration: "15m 30s", sentiment: "Negative", date: "Mar 16, 1:25 PM" },
    { id: "c5", customer: "Project Maple Client", subject: "Change order - deck expansion approval", status: "Resolved", duration: "8m 05s", sentiment: "Positive", date: "Mar 16, 1:00 PM" },
    { id: "c6", customer: "Harbor Point Owner", subject: "Project closeout confirmation", status: "Resolved", duration: "5m 50s", sentiment: "Positive", date: "Mar 16, 12:30 PM" },
  ],
  "field-operations": [
    { id: "c1", customer: "Project Oak - Electrical", subject: "Rough-in inspection - passed 98/100", status: "Resolved", duration: "35m 20s", sentiment: "Positive", date: "Mar 16, 2:32 PM" },
    { id: "c2", customer: "Pine Ave Site Safety", subject: "Fall protection violation report", status: "Escalated", duration: "22m 15s", sentiment: "Negative", date: "Mar 16, 2:10 PM" },
    { id: "c3", customer: "Riverside Foundation", subject: "Foundation inspection - 1 deficiency noted", status: "In Progress", duration: "48m 30s", sentiment: "Neutral", date: "Mar 16, 1:40 PM" },
    { id: "c4", customer: "Metro Builders - Waterproof", subject: "Deficiency resolution verification", status: "Resolved", duration: "28m 10s", sentiment: "Positive", date: "Mar 16, 1:10 PM" },
    { id: "c5", customer: "OSHA Compliance", subject: "12-site compliance audit summary", status: "Resolved", duration: "1h 05m", sentiment: "Neutral", date: "Mar 16, 12:30 PM" },
    { id: "c6", customer: "Harbor Point Punch List", subject: "Closeout punch list - 8 items remaining", status: "In Progress", duration: "40m 45s", sentiment: "Neutral", date: "Mar 16, 11:45 AM" },
  ],
  "design-spec": [
    { id: "c1", customer: "Lisa Park", subject: "Johnson Kitchen - material spec extraction", status: "Resolved", duration: "8m 20s", sentiment: "Positive", date: "Mar 16, 2:40 PM" },
    { id: "c2", customer: "Mike Torres", subject: "Project Oak - plumbing submittal package", status: "Resolved", duration: "12m 45s", sentiment: "Positive", date: "Mar 16, 2:15 PM" },
    { id: "c3", customer: "Lisa Park", subject: "Westfield Office - DXF parsing and entity extraction", status: "In Progress", duration: "15m 30s", sentiment: "Neutral", date: "Mar 16, 1:50 PM" },
    { id: "c4", customer: "Sarah Chen", subject: "Harbor Point - MEP spec review from Revit model", status: "Resolved", duration: "22m 10s", sentiment: "Positive", date: "Mar 16, 1:20 PM" },
    { id: "c5", customer: "Mike Torres", subject: "Granite discontinuation - alternative materials", status: "Escalated", duration: "6m 15s", sentiment: "Neutral", date: "Mar 16, 12:45 PM" },
    { id: "c6", customer: "Lisa Park", subject: "Anderson Windows cut sheet compilation", status: "Resolved", duration: "10m 30s", sentiment: "Positive", date: "Mar 16, 12:10 PM" },
  ],
};

// ---------------------------------------------------------------------------
// Per-Agent Configuration
// ---------------------------------------------------------------------------

const agentConfigMap: Record<string, AgentConfig> = {
  "customer-support": {
    model: "claude-sonnet-4-20250514",
    temperature: 0,
    systemPrompt: "You are a professional customer support agent for Apex Intelligence, a construction technology company. You handle inquiries about project timelines, billing, warranty claims, scheduling, and general questions. Always maintain a helpful, empathetic tone. Escalate billing disputes over $5,000 and safety concerns immediately. Reference the knowledge base for warranty policies and standard procedures. Never make promises about timelines without checking the project management system first. Use confidence-gated responses: >=0.85 high confidence (answer directly), 0.60-0.84 medium (hedge language), <0.60 low (escalate to human).",
    tools: [
      { name: "search_knowledge_base", enabled: true },
      { name: "escalate_to_human", enabled: true },
      { name: "check_account_status", enabled: true },
      { name: "query_execution_logs", enabled: true },
      { name: "check_integration_health", enabled: true },
    ],
    escalationRules: [
      { condition: "Billing disputes exceeding $5,000", action: "Route to Finance Team lead" },
      { condition: "Safety concerns or incidents", action: "Immediate escalation to Operations Director" },
      { condition: "Legal or contractual disputes", action: "Route to Legal department" },
      { condition: "Customer satisfaction score < 3/5", action: "Flag for Account Manager review" },
      { condition: "3+ unresolved messages in thread", action: "Escalate to Senior Support" },
    ],
  },
  "sales-outreach": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.5,
    systemPrompt: "You are a sales outreach agent for Apex Intelligence. Your goal is to qualify inbound leads, manage outreach cadences, and nurture prospects through the pipeline. Score leads based on project size, timeline urgency, and engagement signals. Generate personalized proposals referencing similar completed projects. Never share competitor pricing or make discount commitments without sales manager approval. Follow up on warm leads within 24 hours.",
    tools: [
      { name: "CRM Lookup", enabled: true },
      { name: "Lead Scoring Engine", enabled: true },
      { name: "Proposal Generator", enabled: true },
      { name: "Email Sequencer", enabled: true },
      { name: "Pipeline Analytics", enabled: true },
      { name: "Competitor Intelligence", enabled: false },
      { name: "Calendar Booking", enabled: true },
    ],
    escalationRules: [
      { condition: "Lead value exceeds $500K", action: "Route to VP of Sales for personal outreach" },
      { condition: "Competitor underbid by >15%", action: "Flag for pricing review committee" },
      { condition: "Client requests in-person meeting", action: "Assign to regional sales manager" },
      { condition: "Lead inactive >30 days after proposal", action: "Trigger re-engagement sequence" },
    ],
  },
  "scheduling": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
    systemPrompt: "You are a scheduling coordinator agent for Apex Intelligence. You manage crew schedules, equipment allocation, subcontractor coordination, and client appointments. Optimize for minimal travel time and maximum resource utilization. Always check weather forecasts before confirming outdoor work. Resolve conflicts by priority: safety inspections > client deadlines > internal milestones. Send notifications for any schedule changes at least 12 hours in advance when possible.",
    tools: [
      { name: "Calendar Management", enabled: true },
      { name: "Crew Availability API", enabled: true },
      { name: "Equipment Tracker", enabled: true },
      { name: "Weather Forecast API", enabled: true },
      { name: "Route Optimizer", enabled: true },
      { name: "SMS Notifications", enabled: true },
      { name: "Subcontractor Portal", enabled: true },
    ],
    escalationRules: [
      { condition: "Double-booking detected for critical equipment", action: "Alert Operations Manager immediately" },
      { condition: "Weather cancellation affects 3+ sites", action: "Trigger mass reschedule protocol" },
      { condition: "Subcontractor no-show", action: "Escalate to Vendor Relations + find backup" },
      { condition: "Client appointment conflict", action: "Route to Account Manager for resolution" },
    ],
  },
  "estimation": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
    systemPrompt: "You are an estimation agent for Apex Intelligence. You generate detailed project cost estimates using material databases, labor rate tables, and historical project data. Break down estimates into line items with material, labor, equipment, and overhead categories. Always include a 10% contingency for projects over $100K. Flag any material costs that have changed >5% in the last 30 days. Compare estimates against similar completed projects for accuracy validation. Never round estimates - provide precise figures.",
    tools: [
      { name: "Material Cost Database", enabled: true },
      { name: "Labor Rate Tables", enabled: true },
      { name: "Historical Project DB", enabled: true },
      { name: "Vendor Quote System", enabled: true },
      { name: "Cost Comparison Engine", enabled: true },
      { name: "PDF Report Generator", enabled: true },
    ],
    escalationRules: [
      { condition: "Estimate exceeds $250K", action: "Require senior estimator review" },
      { condition: "Material costs changed >10% from baseline", action: "Alert procurement team" },
      { condition: "Actuals exceed estimate by >15%", action: "Trigger variance investigation" },
      { condition: "Client disputes estimate accuracy", action: "Route to estimation manager with backup data" },
    ],
  },
  "bookkeeping": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.1,
    systemPrompt: "You are a bookkeeping agent for Apex Intelligence. You process financial transactions, reconcile accounts, manage invoicing, and generate financial reports. Maintain 99.5%+ accuracy on all transaction processing. Categorize expenses according to the company chart of accounts. Flag duplicate transactions immediately. Never approve payments over $10,000 without dual authorization. Reconcile bank statements within 24 hours of posting. Follow GAAP standards for all financial reporting.",
    tools: [
      { name: "QuickBooks Integration", enabled: true },
      { name: "Invoice Generator", enabled: true },
      { name: "Bank Reconciliation", enabled: true },
      { name: "Payroll Processing", enabled: true },
      { name: "Expense Categorization", enabled: true },
      { name: "Tax Calculator", enabled: true },
      { name: "Financial Report Builder", enabled: true },
    ],
    escalationRules: [
      { condition: "Payment exceeds $10,000", action: "Require dual authorization from Finance Director" },
      { condition: "Duplicate transaction detected", action: "Hold transaction + alert accounting lead" },
      { condition: "Invoice overdue >45 days", action: "Escalate to collections team" },
      { condition: "Bank reconciliation discrepancy >$100", action: "Flag for manual review" },
      { condition: "Quarterly tax filing deadline <7 days", action: "Priority alert to CFO" },
    ],
  },
  "project-management": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.3,
    systemPrompt: "You are a project management agent for Apex Intelligence. You track project milestones, monitor deliverable progress, manage dependencies, and generate status reports. Calculate schedule variance and cost performance indices for each project weekly. Flag projects with SPI < 0.9 or CPI < 0.85 as at-risk. Send stakeholder updates every Monday. Track change orders and their impact on timeline and budget. Maintain a risk register with mitigation plans for each active project.",
    tools: [
      { name: "Project Tracker", enabled: true },
      { name: "Gantt Chart Engine", enabled: true },
      { name: "Risk Register", enabled: true },
      { name: "Stakeholder Notifier", enabled: true },
      { name: "Budget Tracker", enabled: true },
      { name: "Change Order System", enabled: true },
      { name: "Report Generator", enabled: true },
      { name: "Resource Allocator", enabled: true },
    ],
    escalationRules: [
      { condition: "Project SPI falls below 0.85", action: "Trigger recovery plan with PM Director" },
      { condition: "Budget variance exceeds 10%", action: "Alert project owner and finance team" },
      { condition: "Critical path task delayed >2 days", action: "Immediate escalation to Operations" },
      { condition: "Resource conflict across projects", action: "Route to resource planning committee" },
      { condition: "Client change order >$20K", action: "Require VP approval before proceeding" },
    ],
  },
  "field-operations": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
    systemPrompt: "You are a field operations agent for Apex Intelligence. You manage inspections, safety compliance, quality assurance, and field reporting. Generate detailed inspection reports with photo documentation references. Check all work against local building codes and OSHA standards. Flag any safety violations immediately - do not wait for batch processing. Track deficiency resolution with follow-up inspections. Maintain inspection checklists specific to each trade (electrical, plumbing, structural, etc.).",
    tools: [
      { name: "Inspection Checklist Engine", enabled: true },
      { name: "Photo Documentation", enabled: true },
      { name: "Building Code Reference", enabled: true },
      { name: "OSHA Compliance DB", enabled: true },
      { name: "Deficiency Tracker", enabled: true },
      { name: "Safety Alert System", enabled: true },
      { name: "Report Generator", enabled: true },
    ],
    escalationRules: [
      { condition: "Safety violation - fall protection", action: "Immediate stop-work order + alert Safety Director" },
      { condition: "Failed inspection - structural", action: "Escalate to structural engineer for review" },
      { condition: "3+ deficiencies on single inspection", action: "Flag for quality review meeting" },
      { condition: "Equipment maintenance overdue", action: "Alert fleet manager + restrict usage" },
      { condition: "Regulatory inspection scheduled <48hrs", action: "Priority prep alert to site foreman" },
    ],
  },
  "design-spec": {
    model: "claude-sonnet-4-20250514",
    temperature: 0.2,
    systemPrompt: "You are a design specification assistant for Apex Intelligence. You extract material specs, dimensions, and finishes from architectural drawings (AutoCAD DXF, Revit RVT). Parse floor plans to identify all specified materials, fixtures, and equipment. Generate structured submittal packages for contractor review. Cross-reference specs against material databases for pricing and availability. Flag discontinuations or spec conflicts (e.g., door size mismatches between plans and schedules). Integrate with Google Drive for document import.",
    tools: [
      { name: "query_jobtread_projects", enabled: true },
      { name: "Google Drive Sync", enabled: true },
      { name: "AutoCAD DXF Parser", enabled: true },
      { name: "Revit Model Reader", enabled: true },
      { name: "Material Database", enabled: true },
      { name: "Submittal Generator", enabled: true },
    ],
    escalationRules: [
      { condition: "Specified material discontinued", action: "Alert designer with 3 alternatives" },
      { condition: "Spec conflict between plans and schedule", action: "Flag for architect review" },
      { condition: "Material cost >20% above budget", action: "Escalate to Estimate Engine for re-evaluation" },
      { condition: "Missing specs for structural elements", action: "Escalate to structural engineer" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Per-Agent Logs
// ---------------------------------------------------------------------------

const agentLogsMap: Record<string, LogEntry[]> = {
  "customer-support": [
    { id: "l1", timestamp: "2026-03-16 14:34:12", level: "info", message: "Conversation started with Sarah Mitchell - Warranty claim #T-5021" },
    { id: "l2", timestamp: "2026-03-16 14:34:15", level: "info", message: "Knowledge base query: 'exterior siding warranty policy' - 3 results found" },
    { id: "l3", timestamp: "2026-03-16 14:34:28", level: "info", message: "Response generated (142 tokens) - warranty coverage confirmed" },
    { id: "l4", timestamp: "2026-03-16 14:34:32", level: "info", message: "Conversation resolved - customer satisfaction: 5/5" },
    { id: "l5", timestamp: "2026-03-16 14:26:08", level: "warn", message: "Escalation triggered: billing dispute $8,200 exceeds $5,000 threshold" },
    { id: "l6", timestamp: "2026-03-16 14:26:10", level: "info", message: "Routed to Finance Team lead (James Rodriguez - Project Oak)" },
    { id: "l7", timestamp: "2026-03-16 14:14:02", level: "info", message: "Auto-resolved FAQ inquiry: service hours - template response #FAQ-012" },
    { id: "l8", timestamp: "2026-03-16 14:10:44", level: "warn", message: "Sentiment analysis: negative trend detected for Westfield Holdings (3 consecutive negative interactions)" },
    { id: "l9", timestamp: "2026-03-16 13:58:30", level: "info", message: "Tool invocation: CRM Lookup for Michael Torres - account #A-4892" },
    { id: "l10", timestamp: "2026-03-16 13:55:18", level: "error", message: "Failed to connect to Project Timeline API - timeout after 5000ms (retry 1/3)" },
    { id: "l11", timestamp: "2026-03-16 13:55:24", level: "info", message: "Project Timeline API reconnected successfully on retry 2" },
    { id: "l12", timestamp: "2026-03-16 13:42:05", level: "info", message: "Batch triage completed: 4 tickets classified (1 urgent, 3 standard)" },
    { id: "l13", timestamp: "2026-03-16 13:30:22", level: "info", message: "Knowledge base updated: 3 new FAQ entries added for warranty policies" },
    { id: "l14", timestamp: "2026-03-16 13:15:40", level: "warn", message: "Token usage approaching daily limit: 82% consumed (32,800/40,000)" },
    { id: "l15", timestamp: "2026-03-16 13:00:00", level: "info", message: "Scheduled health check completed - all systems operational" },
    { id: "l16", timestamp: "2026-03-16 12:45:18", level: "error", message: "Email drafting tool returned malformed HTML - fallback to plain text" },
    { id: "l17", timestamp: "2026-03-16 12:30:05", level: "info", message: "Customer satisfaction report generated - NPS: 74 (+2 from last week)" },
    { id: "l18", timestamp: "2026-03-16 12:00:00", level: "info", message: "Daily model warm-up completed - average latency: 180ms" },
  ],
  "sales-outreach": [
    { id: "l1", timestamp: "2026-03-16 14:30:05", level: "info", message: "Lead qualified: Greenfield Construction - score: 87/100, tier: Hot" },
    { id: "l2", timestamp: "2026-03-16 14:28:12", level: "info", message: "Proposal generated: Summit Builders commercial renovation ($520K, 18 pages)" },
    { id: "l3", timestamp: "2026-03-16 14:22:30", level: "info", message: "Email sequence triggered: 12 warm leads entered follow-up cadence #3" },
    { id: "l4", timestamp: "2026-03-16 14:15:45", level: "warn", message: "Competitor alert: Westside bid $15K below estimate on Project Cedar" },
    { id: "l5", timestamp: "2026-03-16 14:10:20", level: "info", message: "CRM sync: 23 contact records updated from email interaction parsing" },
    { id: "l6", timestamp: "2026-03-16 14:02:08", level: "info", message: "Inbound lead captured: Oakland Medical Center - facility expansion inquiry" },
    { id: "l7", timestamp: "2026-03-16 13:55:30", level: "info", message: "Pipeline snapshot: $1.2M active, $380K closing this month, $840K next quarter" },
    { id: "l8", timestamp: "2026-03-16 13:48:15", level: "warn", message: "Stale lead alert: 8 leads inactive >14 days - auto-re-engagement triggered" },
    { id: "l9", timestamp: "2026-03-16 13:40:00", level: "info", message: "Lead converted: Harbor Point accepted proposal - $180K roofing project" },
    { id: "l10", timestamp: "2026-03-16 13:32:22", level: "error", message: "Email delivery failure: bounce detected for contact@ridgelinecorp.com" },
    { id: "l11", timestamp: "2026-03-16 13:25:10", level: "info", message: "Lead scoring model recalibrated with last 30 days conversion data" },
    { id: "l12", timestamp: "2026-03-16 13:15:00", level: "info", message: "Weekly outreach report: 47 emails sent, 31% open rate, 12% reply rate" },
    { id: "l13", timestamp: "2026-03-16 13:00:00", level: "info", message: "Scheduled health check completed - all integrations operational" },
  ],
  "scheduling": [
    { id: "l1", timestamp: "2026-03-16 14:40:02", level: "info", message: "Crew conflict resolved: Team B reassigned Oak St -> Pine Ave (priority: client deadline)" },
    { id: "l2", timestamp: "2026-03-16 14:35:18", level: "warn", message: "Equipment overlap: Excavator #E-12 double-booked Mar 18 (Project Oak + Project Cedar)" },
    { id: "l3", timestamp: "2026-03-16 14:28:05", level: "info", message: "Auto-scheduled 3 inspections for Project Maple: electrical, plumbing, final" },
    { id: "l4", timestamp: "2026-03-16 14:20:30", level: "warn", message: "Weather API: rain forecast Mar 19-20, 85% probability - 4 outdoor tasks affected" },
    { id: "l5", timestamp: "2026-03-16 14:18:42", level: "info", message: "Batch reschedule: 4 outdoor tasks moved from Mar 19-20 to Mar 21-22" },
    { id: "l6", timestamp: "2026-03-16 14:12:15", level: "info", message: "SMS notification sent: Team A start time change to 7:00 AM (12 recipients)" },
    { id: "l7", timestamp: "2026-03-16 14:05:00", level: "info", message: "Route optimization complete: next week travel time reduced 22% (saved 4.2 hrs)" },
    { id: "l8", timestamp: "2026-03-16 13:58:30", level: "info", message: "Client appointment confirmed: Sarah Mitchell site visit Mar 18 2:00 PM" },
    { id: "l9", timestamp: "2026-03-16 13:50:10", level: "info", message: "Subcontractor update: ABC Plumbing marked unavailable Mar 20-22" },
    { id: "l10", timestamp: "2026-03-16 13:42:00", level: "info", message: "Resource utilization report: 87% efficiency this week (target: 85%)" },
    { id: "l11", timestamp: "2026-03-16 13:30:15", level: "info", message: "Permit inspection slot reserved: Building Dept Mar 19 10:00 AM" },
    { id: "l12", timestamp: "2026-03-16 13:00:00", level: "info", message: "Daily schedule optimization completed - 0 unresolved conflicts" },
  ],
  "estimation": [
    { id: "l1", timestamp: "2026-03-16 14:20:45", level: "info", message: "Estimate completed: Riverside Kitchen Remodel - $47,200 (12 line items, 4 categories)" },
    { id: "l2", timestamp: "2026-03-16 14:18:30", level: "info", message: "Material DB query: kitchen cabinets, countertops, fixtures - 24 vendor prices compared" },
    { id: "l3", timestamp: "2026-03-16 14:05:12", level: "warn", message: "Material price alert: lumber costs +8% in last 30 days - 3 active estimates affected" },
    { id: "l4", timestamp: "2026-03-16 13:58:40", level: "info", message: "Vendor quote received: ABC Supply drywall $0.42/sqft - flagged as best price" },
    { id: "l5", timestamp: "2026-03-16 13:45:22", level: "info", message: "Scope change processing: Summit Office Build +2 floors - re-estimating structural + MEP" },
    { id: "l6", timestamp: "2026-03-16 13:30:10", level: "info", message: "Cost comparison: 4 vendor bids analyzed for Project Oak roofing (spread: $12K-$18K)" },
    { id: "l7", timestamp: "2026-03-16 13:22:05", level: "warn", message: "Budget overrun: Harbor Point actuals $156K vs estimate $139K (+12.2%)" },
    { id: "l8", timestamp: "2026-03-16 13:10:30", level: "info", message: "Historical match found: Pine Valley 2025 kitchen remodel ($52K actual) - 89% similarity" },
    { id: "l9", timestamp: "2026-03-16 12:55:15", level: "info", message: "Estimate approved: Metro Builders bathroom renovation $28,900 - client signed" },
    { id: "l10", timestamp: "2026-03-16 12:40:00", level: "info", message: "Labor rate update: electrical labor $85/hr (+$5 from subcontractor rate card)" },
    { id: "l11", timestamp: "2026-03-16 12:20:45", level: "error", message: "Material DB connection timeout - switched to cached pricing (last updated 2h ago)" },
    { id: "l12", timestamp: "2026-03-16 12:00:00", level: "info", message: "Daily estimation summary: 4 estimates generated, $178K total value, avg accuracy 87%" },
  ],
  "bookkeeping": [
    { id: "l1", timestamp: "2026-03-16 14:38:10", level: "info", message: "Invoice processed: #INV-2847 Pacific Corp $12,400 (net 30, due Apr 15)" },
    { id: "l2", timestamp: "2026-03-16 14:30:25", level: "info", message: "QuickBooks sync: 48 transactions reconciled, 0 discrepancies, bank balance confirmed" },
    { id: "l3", timestamp: "2026-03-16 14:22:40", level: "info", message: "Payment applied: Metro Builders $8,750 -> INV-2831 (balance: $0.00)" },
    { id: "l4", timestamp: "2026-03-16 14:15:05", level: "warn", message: "Duplicate detected: $1,200 charge on account #4892 - transaction held for review" },
    { id: "l5", timestamp: "2026-03-16 14:08:30", level: "info", message: "Payroll batch processed: 24 employees, gross $67,400, net $52,180, taxes $15,220" },
    { id: "l6", timestamp: "2026-03-16 13:55:15", level: "warn", message: "Overdue alert: 3 invoices >30 days ($18,200 total) - collection emails queued" },
    { id: "l7", timestamp: "2026-03-16 13:45:00", level: "info", message: "Monthly P&L generated: Revenue $142K, COGS $89K, Gross Margin 37.3%" },
    { id: "l8", timestamp: "2026-03-16 13:35:20", level: "info", message: "Expense auto-categorization: 15 transactions classified (8 materials, 4 labor, 3 overhead)" },
    { id: "l9", timestamp: "2026-03-16 13:25:10", level: "info", message: "Tax estimate updated: Q1 liability $14,200 (federal $10,800, state $3,400)" },
    { id: "l10", timestamp: "2026-03-16 13:15:00", level: "info", message: "Vendor payment batch scheduled: 8 payments, $42,100 total, execution Mar 18" },
    { id: "l11", timestamp: "2026-03-16 13:05:30", level: "error", message: "QuickBooks API rate limit hit - batch split into 2 requests (retrying in 60s)" },
    { id: "l12", timestamp: "2026-03-16 13:06:35", level: "info", message: "QuickBooks retry successful - all transactions synced" },
    { id: "l13", timestamp: "2026-03-16 12:45:00", level: "info", message: "Daily reconciliation: all accounts balanced, 0 outstanding discrepancies" },
    { id: "l14", timestamp: "2026-03-16 12:00:00", level: "info", message: "Scheduled health check: QuickBooks, bank feeds, payroll provider - all connected" },
  ],
  "project-management": [
    { id: "l1", timestamp: "2026-03-16 14:35:08", level: "info", message: "Milestone signed off: Project Alpine - foundation pour complete (on schedule)" },
    { id: "l2", timestamp: "2026-03-16 14:28:20", level: "warn", message: "Schedule risk: Project Cedar framing SPI 0.82 - 3 days behind critical path" },
    { id: "l3", timestamp: "2026-03-16 14:20:15", level: "info", message: "Portfolio status report: 47 projects - 43 on-track (91.5%), 4 at-risk (8.5%)" },
    { id: "l4", timestamp: "2026-03-16 14:12:30", level: "info", message: "Dependency cleared: Project Oak electrical rough-in -> inspection now unblocked" },
    { id: "l5", timestamp: "2026-03-16 14:05:00", level: "info", message: "Weekly digest distributed to 12 project owners (delivered via email + Slack)" },
    { id: "l6", timestamp: "2026-03-16 13:55:45", level: "warn", message: "Resource conflict: crane needed at Project Birch + Project Cedar week of Mar 22" },
    { id: "l7", timestamp: "2026-03-16 13:48:10", level: "warn", message: "Budget alert: Project Birch CPI 0.87 - at 94% budget with 82% completion" },
    { id: "l8", timestamp: "2026-03-16 13:40:25", level: "info", message: "Change order logged: Project Maple deck expansion +$8,400, timeline +4 days" },
    { id: "l9", timestamp: "2026-03-16 13:30:00", level: "info", message: "Project closed: Harbor Point Renovation - on-time, 3% under budget ($4,200 saved)" },
    { id: "l10", timestamp: "2026-03-16 13:20:15", level: "info", message: "Risk matrix updated: 3 new risks across portfolio (2 medium, 1 low)" },
    { id: "l11", timestamp: "2026-03-16 13:10:30", level: "error", message: "Gantt chart export failed: PDF generation timeout - retrying with reduced date range" },
    { id: "l12", timestamp: "2026-03-16 13:11:05", level: "info", message: "Gantt chart export retry successful - 47 project timelines rendered" },
    { id: "l13", timestamp: "2026-03-16 12:00:00", level: "info", message: "Daily health check: all project tracking systems operational" },
  ],
  "field-operations": [
    { id: "l1", timestamp: "2026-03-16 14:32:15", level: "info", message: "Inspection complete: Project Oak electrical rough-in - PASS (98/100)" },
    { id: "l2", timestamp: "2026-03-16 14:30:40", level: "info", message: "Report generated: 14 checklist items verified, 42 photos attached" },
    { id: "l3", timestamp: "2026-03-16 14:22:08", level: "warn", message: "SAFETY ALERT: Fall protection violation at Pine Ave - stop-work order issued" },
    { id: "l4", timestamp: "2026-03-16 14:22:12", level: "info", message: "Safety Director notified via SMS + email. Site supervisor acknowledged." },
    { id: "l5", timestamp: "2026-03-16 14:10:30", level: "info", message: "Inspection report: Riverside Foundation - 13/14 items pass, 1 deficiency (crack width)" },
    { id: "l6", timestamp: "2026-03-16 14:00:15", level: "info", message: "Deficiency verified resolved: Metro Builders waterproofing repair - re-inspection PASS" },
    { id: "l7", timestamp: "2026-03-16 13:48:20", level: "info", message: "OSHA compliance audit: 12 sites checked - 11 compliant, 1 corrective action (Pine Ave)" },
    { id: "l8", timestamp: "2026-03-16 13:40:05", level: "info", message: "Photo upload batch: 42 inspection photos from 3 site visits (12.4 MB)" },
    { id: "l9", timestamp: "2026-03-16 13:30:30", level: "warn", message: "Equipment alert: Crane #C-04 maintenance inspection overdue by 2 days" },
    { id: "l10", timestamp: "2026-03-16 13:25:00", level: "info", message: "Final inspection scheduled: Summit Office Build - city inspector confirmed Mar 19 9AM" },
    { id: "l11", timestamp: "2026-03-16 13:15:10", level: "info", message: "Punch list generated: Harbor Point - 8 items (3 paint, 2 trim, 2 hardware, 1 grading)" },
    { id: "l12", timestamp: "2026-03-16 13:00:00", level: "info", message: "Post-storm assessment: 2 sites inspected, no structural damage, minor debris cleanup needed" },
    { id: "l13", timestamp: "2026-03-16 12:30:00", level: "error", message: "Photo upload failed: network timeout at Riverside site - queued for retry on WiFi" },
    { id: "l14", timestamp: "2026-03-16 12:31:15", level: "info", message: "Photo upload retry successful - all 42 images synced" },
    { id: "l15", timestamp: "2026-03-16 12:00:00", level: "info", message: "Daily ops check: all inspection tools calibrated, checklists updated, GPS trackers online" },
  ],
  "design-spec": [
    { id: "l1", timestamp: "2026-03-16 14:40:00", level: "info", message: "Spec extraction complete: Johnson Kitchen DXF - 47 materials, 12 fixtures, 8 appliances identified" },
    { id: "l2", timestamp: "2026-03-16 14:35:20", level: "info", message: "Submittal package generated: Project Oak plumbing (18 items, 24 pages PDF)" },
    { id: "l3", timestamp: "2026-03-16 14:28:15", level: "warn", message: "Material conflict: Venetian Gold granite (SKU-4821) discontinued by supplier since Jan 2026" },
    { id: "l4", timestamp: "2026-03-16 14:25:00", level: "info", message: "Alternatives found: 3 similar granite options (Colonial Gold, New Venetian, Giallo Ornamental)" },
    { id: "l5", timestamp: "2026-03-16 14:18:30", level: "info", message: "AutoCAD DXF parsed: Westfield_Office_v3.dxf - 234 entities, 18 layers, 12 blocks" },
    { id: "l6", timestamp: "2026-03-16 14:10:45", level: "warn", message: "Spec discrepancy: Floor plan shows 36\" door at Entry-B but door schedule lists 32\"" },
    { id: "l7", timestamp: "2026-03-16 14:05:00", level: "info", message: "Google Drive sync: 8 files imported from Shared/Designs (3 DXF, 2 RVT, 3 PDF)" },
    { id: "l8", timestamp: "2026-03-16 13:55:20", level: "info", message: "Revit model processed: Harbor Point MEP - extracted 156 MEP specs across 4 systems" },
    { id: "l9", timestamp: "2026-03-16 13:45:00", level: "info", message: "Cut sheet compiled: Anderson Windows Series 400 Woodwright - 12 units, 4 sizes" },
    { id: "l10", timestamp: "2026-03-16 13:30:00", level: "info", message: "Submittal status update: 72 approved, 12 pending review, 5 revise & resubmit" },
    { id: "l11", timestamp: "2026-03-16 13:15:10", level: "info", message: "Material DB update: 46 products imported from BuilderTrend catalog (batch #BT-2026-Q1)" },
    { id: "l12", timestamp: "2026-03-16 13:00:00", level: "info", message: "Daily digest: 18 specs processed, 3 submittals generated, 2 conflicts flagged" },
  ],
};

// ---------------------------------------------------------------------------
// New ID → Legacy Data ID Mapping
// ---------------------------------------------------------------------------

const idAliasMap: Record<string, string> = {
  "support-agent": "customer-support",
  "discovery-concierge": "sales-outreach",
  "project-orchestrator": "scheduling",
  "estimate-engine": "estimation",
  "operations-controller": "bookkeeping",
  "executive-navigator": "project-management",
  "design-spec-assistant": "design-spec",
};

// ---------------------------------------------------------------------------
// Build Agent Detail
// ---------------------------------------------------------------------------

function buildAgent(id: string): AgentDetail {
  const dataId = idAliasMap[id] || id;
  const name = agentNameMap[id] || "Customer Support Agent";
  const icon = agentIconMap[id] || Headset;
  const description = agentDescriptionMap[id] || agentDescriptionMap["customer-support"];
  const status = agentStatusMap[id] || "Active";
  const stats = agentStatsMap[dataId] || agentStatsMap["customer-support"];
  const performance = agentPerformanceMap[dataId] || agentPerformanceMap["customer-support"];
  const activity = agentActivityMap[dataId] || agentActivityMap["customer-support"];
  const conversations = agentConversationsMap[dataId] || agentConversationsMap["customer-support"];
  const config = agentConfigMap[dataId] || agentConfigMap["customer-support"];
  const logs = agentLogsMap[dataId] || agentLogsMap["customer-support"];

  return {
    id,
    name,
    icon,
    description,
    status,
    stats,
    performance,
    activity,
    conversations,
    config,
    logs,
  };
}

// ---------------------------------------------------------------------------
// Status styles
// ---------------------------------------------------------------------------

const statusConfig: Record<AgentStatus, { dot: string; badge: string }> = {
  Active: { dot: "bg-green-400", badge: "bg-green-500/15 text-green-400 border-green-500/20" },
  Paused: { dot: "bg-gray-400", badge: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
};

const conversationStatusStyles: Record<ConversationStatus, string> = {
  Resolved: "bg-green-500/15 text-green-400",
  "In Progress": "bg-indigo-500/15 text-indigo-400",
  Escalated: "bg-amber-500/15 text-amber-400",
};

const sentimentStyles: Record<Sentiment, { color: string; icon: LucideIcon }> = {
  Positive: { color: "text-green-400", icon: ArrowUpRight },
  Neutral: { color: "text-gray-400", icon: Activity },
  Negative: { color: "text-red-400", icon: AlertTriangle },
};

const logLevelStyles: Record<LogLevel, { bg: string; text: string; icon: LucideIcon }> = {
  info: { bg: "bg-indigo-500/15", text: "text-indigo-400", icon: Info },
  warn: { bg: "bg-amber-500/15", text: "text-amber-400", icon: AlertTriangle },
  error: { bg: "bg-red-500/15", text: "text-red-400", icon: XCircle },
};

// ---------------------------------------------------------------------------
// Chart Tooltip
// ---------------------------------------------------------------------------

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
    <div className="glass-strong rounded-lg px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-xs font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">
            {entry.name === "resolutionRate" ? `${entry.value}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Overview
// ---------------------------------------------------------------------------

function OverviewTab({ agent }: { agent: AgentDetail }) {
  const activityTypeConfig = {
    success: { dot: "bg-green-400", bg: "bg-green-500/10" },
    info: { dot: "bg-indigo-400", bg: "bg-indigo-500/10" },
    warning: { dot: "bg-amber-400", bg: "bg-amber-500/10" },
  };

  return (
    <div className="space-y-6">
      {/* Performance Chart */}
      <div className="glass rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Performance Overview
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Conversations and resolution rate over the last 30 days
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-indigo-500" />
              <span className="text-muted-foreground">Conversations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-cyan-400" />
              <span className="text-muted-foreground">Resolution Rate</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={agent.performance}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gConversations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gResolution" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[80, 100]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="conversations"
                name="Conversations"
                stroke="#6366f1"
                fill="url(#gConversations)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="resolutionRate"
                name="Resolution Rate"
                stroke="#22d3ee"
                fill="url(#gResolution)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass rounded-xl p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Recent Activity
        </h3>
        <div className="space-y-1">
          {agent.activity.map((item) => {
            const cfg = activityTypeConfig[item.type];
            return (
              <div
                key={item.id}
                className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/30"
              >
                <div className={`mt-1.5 size-2 shrink-0 rounded-full ${cfg.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {item.message}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">
                    {item.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Conversations
// ---------------------------------------------------------------------------

function ConversationsTab({ agent }: { agent: AgentDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {agent.conversations.length} most recent conversations
        </p>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subject
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sentiment
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {agent.conversations.map((conv, idx) => {
                const sentimentCfg = sentimentStyles[conv.sentiment];
                const SentimentIcon = sentimentCfg.icon;
                return (
                  <tr
                    key={conv.id}
                    className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                      idx % 2 === 1 ? "bg-muted/15" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <span className="font-medium text-foreground">
                        {conv.customer}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      <span className="line-clamp-1 max-w-xs">{conv.subject}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${conversationStatusStyles[conv.status]}`}
                      >
                        {conv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {conv.duration}
                    </td>
                    <td className="px-5 py-3">
                      <div className={`flex items-center gap-1.5 ${sentimentCfg.color}`}>
                        <SentimentIcon className="size-3.5" />
                        <span className="text-xs font-medium">{conv.sentiment}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {conv.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Configuration
// ---------------------------------------------------------------------------

function ConfigurationTab({ agent }: { agent: AgentDetail }) {
  const config = agent.config;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Model Settings */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings2 className="size-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-foreground">Model Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Model</span>
            <span className="rounded-md bg-indigo-500/15 px-2.5 py-1 font-mono text-xs text-indigo-400">
              {config.model}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-3">
            <span className="text-sm text-muted-foreground">Temperature</span>
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{ width: `${config.temperature * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-xs text-foreground">
                {config.temperature}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Enabled */}
      <div className="glass rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="size-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-foreground">Tools Enabled</h3>
        </div>
        <div className="space-y-2">
          {config.tools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center justify-between rounded-lg bg-muted/30 px-4 py-2.5"
            >
              <span className="text-sm text-foreground/80">{tool.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  tool.enabled
                    ? "bg-green-500/15 text-green-400"
                    : "bg-muted/50 text-muted-foreground/50"
                }`}
              >
                {tool.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System Prompt */}
      <div className="glass rounded-xl p-6 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <MessageSquare className="size-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-foreground">System Prompt</h3>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
            {config.systemPrompt}
          </p>
        </div>
      </div>

      {/* Escalation Rules */}
      <div className="glass rounded-xl p-6 lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="size-4 text-red-400" />
          <h3 className="text-sm font-semibold text-foreground">Escalation Rules</h3>
        </div>
        <div className="space-y-2">
          {config.escalationRules.map((rule, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 rounded-lg bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-5 shrink-0 items-center justify-center rounded bg-amber-500/15 text-[10px] font-bold text-amber-400">
                  {idx + 1}
                </span>
                <span className="text-sm text-foreground/80">{rule.condition}</span>
              </div>
              <span className="text-xs text-indigo-400 sm:shrink-0">
                {rule.action}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Logs
// ---------------------------------------------------------------------------

function LogsTab({ agent }: { agent: AgentDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          Live log feed - Last 24 hours
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-green-400" />
          Streaming
        </div>
      </div>

      <div className="glass overflow-hidden rounded-xl">
        <div className="divide-y divide-border/50">
          {agent.logs.map((log) => {
            const levelCfg = logLevelStyles[log.level];
            const LevelIcon = levelCfg.icon;
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/20"
              >
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground/60">
                  {log.timestamp.split(" ")[1]}
                </span>
                <span
                  className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${levelCfg.bg} ${levelCfg.text}`}
                >
                  <LevelIcon className="size-2.5" />
                  {log.level}
                </span>
                <p className="min-w-0 flex-1 text-sm text-foreground/80">
                  {log.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const tabs = ["Overview", "Conversations", "Configuration", "Logs"] as const;
type TabName = (typeof tabs)[number];

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<TabName>("Overview");

  const agent = buildAgent(id);
  const Icon = agent.icon;
  const cfg = statusConfig[agent.status];

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Back Link */}
        <Link
          href="/dashboard/agents"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Agents
        </Link>

        {/* Agent Header */}
        <div className="glass glow-primary rounded-xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-indigo-500/10 p-3.5 ring-1 ring-indigo-500/20">
                <Icon className="size-8 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {agent.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.badge}`}
                  >
                    <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                    {agent.status}
                  </span>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {agent.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/agents/${id}/chat`}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 ring-1 ring-indigo-500/20 transition-colors hover:bg-indigo-500/25"
              >
                <MessageSquare className="size-4" />
                Open Chat
              </Link>
              <Link
                href={`/dashboard/agents/${id}/workspace`}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-400 ring-1 ring-cyan-500/20 transition-colors hover:bg-cyan-500/25"
              >
                <Activity className="size-4" />
                View Workspace
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {agent.stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`glass glass-hover rounded-xl p-5 transition-all duration-300 ${stat.glowColor}`}
              >
                <div className="flex items-center justify-between">
                  <StatIcon className={`size-5 ${stat.color}`} />
                  <span
                    className={`text-xs font-semibold ${
                      stat.deltaType === "up"
                        ? "text-green-400"
                        : stat.deltaType === "down"
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.delta}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && <OverviewTab agent={agent} />}
        {activeTab === "Conversations" && <ConversationsTab agent={agent} />}
        {activeTab === "Configuration" && <ConfigurationTab agent={agent} />}
        {activeTab === "Logs" && <LogsTab agent={agent} />}
      </div>
    </div>
  );
}
