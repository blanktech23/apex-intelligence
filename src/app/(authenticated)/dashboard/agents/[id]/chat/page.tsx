"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bot,
  Box,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
  Grid3X3,
  Headset,
  Image as ImageIcon,
  Mail,
  Megaphone,
  CalendarClock,
  Calculator,
  BookOpen,
  FolderKanban,
  HardHat,
  Layers,
  Loader2,
  MessageSquarePlus,
  Maximize2,
  Minimize2,
  MousePointer2,
  Move,
  Package,
  Palette,
  Paperclip,
  PenLine,
  RefreshCw,
  Ruler,
  RotateCcw,
  RotateCw,
  Sparkles,
  Square,
  Trash2,
  Undo2,
  Redo2,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { BomPreview } from "@/components/kb/bom-preview";

// ---------------------------------------------------------------------------
// Agent Maps
// ---------------------------------------------------------------------------

const agentIconMap: Record<string, LucideIcon> = {
  "customer-support": Headset,
  "sales-outreach": Megaphone,
  scheduling: CalendarClock,
  estimation: Calculator,
  bookkeeping: BookOpen,
  "project-management": FolderKanban,
  "field-operations": HardHat,
};

const agentNameMap: Record<string, string> = {
  "customer-support": "Customer Support Agent",
  "sales-outreach": "Sales Outreach Agent",
  scheduling: "Scheduling Agent",
  estimation: "Estimation Agent",
  bookkeeping: "Bookkeeping Agent",
  "project-management": "Project Management Agent",
  "field-operations": "Field Operations Agent",
};

const agentColorMap: Record<
  string,
  { icon: string; glow: string; bubble: string }
> = {
  "customer-support": {
    icon: "bg-indigo-500/15 text-indigo-400 ring-indigo-500/20",
    glow: "shadow-[0_0_16px_rgba(99,102,241,0.15)]",
    bubble: "border-indigo-500/10",
  },
  "sales-outreach": {
    icon: "bg-pink-500/15 text-pink-400 ring-pink-500/20",
    glow: "shadow-[0_0_16px_rgba(236,72,153,0.15)]",
    bubble: "border-pink-500/10",
  },
  scheduling: {
    icon: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/20",
    glow: "shadow-[0_0_16px_rgba(34,211,238,0.15)]",
    bubble: "border-cyan-500/10",
  },
  estimation: {
    icon: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.15)]",
    bubble: "border-amber-500/10",
  },
  bookkeeping: {
    icon: "bg-green-500/15 text-green-400 ring-green-500/20",
    glow: "shadow-[0_0_16px_rgba(34,197,94,0.15)]",
    bubble: "border-green-500/10",
  },
  "project-management": {
    icon: "bg-violet-500/15 text-violet-400 ring-violet-500/20",
    glow: "shadow-[0_0_16px_rgba(139,92,246,0.15)]",
    bubble: "border-violet-500/10",
  },
  "field-operations": {
    icon: "bg-orange-500/15 text-orange-400 ring-orange-500/20",
    glow: "shadow-[0_0_16px_rgba(249,115,22,0.15)]",
    bubble: "border-orange-500/10",
  },
};

// Plan v3 ID → legacy data ID alias map
const idAliasMap: Record<string, string> = {
  "support-agent": "customer-support",
  "discovery-concierge": "sales-outreach",
  "project-orchestrator": "scheduling",
  "estimate-engine": "estimation",
  "operations-controller": "bookkeeping",
  "executive-navigator": "project-management",
  "design-spec-assistant": "design-spec-assistant",
};

// Plan v3 canonical display names
const v3NameMap: Record<string, string> = {
  "discovery-concierge": "Discovery Concierge",
  "estimate-engine": "Estimate Engine",
  "operations-controller": "Operations Controller",
  "executive-navigator": "Executive Navigator",
  "project-orchestrator": "Project Orchestrator",
  "design-spec-assistant": "Design Spec Assistant",
  "support-agent": "Support Agent",
};

// Plan v3 icons
const v3IconMap: Record<string, LucideIcon> = {
  "discovery-concierge": Mail,
  "estimate-engine": Calculator,
  "operations-controller": Wrench,
  "executive-navigator": BarChart3,
  "project-orchestrator": Calendar,
  "design-spec-assistant": Palette,
  "support-agent": Headset,
};

const defaultColor = {
  icon: "bg-indigo-500/15 text-indigo-400 ring-indigo-500/20",
  glow: "shadow-[0_0_16px_rgba(99,102,241,0.15)]",
  bubble: "border-indigo-500/10",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConversationPreview {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
  active?: boolean;
}

type MessageRole = "user" | "agent";

interface StructuredCard {
  type:
    | "invoice"
    | "email"
    | "status"
    | "leads"
    | "schedule"
    | "estimate"
    | "financial"
    | "dashboard"
    | "inspection"
    | "weather"
    | "message"
    | "pnl"
    | "table"
    | "design-preview";
  data: Record<string, unknown>;
}

interface ActionButton {
  label: string;
  variant: "primary" | "secondary" | "danger";
  icon?: LucideIcon;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  card?: StructuredCard;
  actions?: ActionButton[];
  attachment?: { name: string; type: string };
  statusItems?: string[];
  statusComplete?: boolean;
  thinking?: string;
}

// ---------------------------------------------------------------------------
// Mock: Sidebar conversations (per agent)
// ---------------------------------------------------------------------------

const conversationsByAgent: Record<string, ConversationPreview[]> = {
  "customer-support": [
    {
      id: "conv-1",
      title: "Invoice dispute - Harbor View",
      preview:
        "Looking into invoice #4521 overcharge for tile work...",
      date: "Today, 2:30 PM",
      messageCount: 8,
      active: true,
    },
    {
      id: "conv-2",
      title: "Warranty claim - Pacific Corp",
      preview:
        "Verified warranty coverage for exterior siding issue...",
      date: "Today, 11:15 AM",
      messageCount: 10,
    },
    {
      id: "conv-3",
      title: "Client complaint - noise hours",
      preview:
        "Addressed noise complaint from neighbor at Riverside site...",
      date: "Today, 9:40 AM",
      messageCount: 6,
    },
    {
      id: "conv-4",
      title: "Refund request - Summit Heights",
      preview: "Processing partial refund for delayed completion...",
      date: "Yesterday, 3:20 PM",
      messageCount: 12,
    },
    {
      id: "conv-5",
      title: "Client onboarding - Bayshore",
      preview:
        "Set up Bayshore Development in CRM with 4 contacts...",
      date: "Yesterday, 1:30 PM",
      messageCount: 9,
    },
    {
      id: "conv-6",
      title: "Service follow-up - Castillo",
      preview:
        "Sent 30-day follow-up survey to Castillo residence...",
      date: "Mar 14, 4:00 PM",
      messageCount: 4,
    },
    {
      id: "conv-7",
      title: "Escalation - delayed permit",
      preview:
        "Escalated permit delay concern to project management...",
      date: "Mar 14, 10:00 AM",
      messageCount: 7,
    },
  ],
  "sales-outreach": [
    {
      id: "conv-1",
      title: "New lead qualification - batch",
      preview:
        "Qualified 3 new website leads. Meridian Properties is top priority...",
      date: "Today, 10:15 AM",
      messageCount: 6,
      active: true,
    },
    {
      id: "conv-2",
      title: "Proposal draft - Greenfield Corp",
      preview:
        "Drafted $520K proposal for commercial renovation...",
      date: "Today, 8:45 AM",
      messageCount: 8,
    },
    {
      id: "conv-3",
      title: "Follow-up sequence - cold leads",
      preview:
        "Scheduled 12 follow-up emails for dormant leads...",
      date: "Yesterday, 4:30 PM",
      messageCount: 5,
    },
    {
      id: "conv-4",
      title: "Pipeline review - Q1 close",
      preview:
        "Reviewed $1.2M pipeline. 4 deals likely to close this month...",
      date: "Yesterday, 2:00 PM",
      messageCount: 10,
    },
    {
      id: "conv-5",
      title: "Competitor analysis - Titan Build",
      preview:
        "Titan Build is underbidding on commercial jobs by 8-12%...",
      date: "Mar 14, 3:15 PM",
      messageCount: 7,
    },
    {
      id: "conv-6",
      title: "Referral outreach - happy clients",
      preview:
        "Sent referral request to 6 clients with 5-star reviews...",
      date: "Mar 14, 11:00 AM",
      messageCount: 4,
    },
    {
      id: "conv-7",
      title: "Trade show leads import",
      preview:
        "Imported 28 leads from HomeBuilder Expo. Scoring in progress...",
      date: "Mar 13, 9:30 AM",
      messageCount: 6,
    },
  ],
  scheduling: [
    {
      id: "conv-1",
      title: "Crew conflict - Summit Heights",
      preview:
        "Mike's crew can't make Wednesday. Finding coverage options...",
      date: "Today, 9:00 AM",
      messageCount: 6,
      active: true,
    },
    {
      id: "conv-2",
      title: "Weekly schedule - Mar 17-21",
      preview:
        "Generated next week schedule for 5 crews across 8 sites...",
      date: "Today, 7:30 AM",
      messageCount: 4,
    },
    {
      id: "conv-3",
      title: "Overtime approval - Riverside",
      preview:
        "David's crew needs Saturday overtime to meet deadline...",
      date: "Yesterday, 4:45 PM",
      messageCount: 5,
    },
    {
      id: "conv-4",
      title: "Subcontractor coordination",
      preview:
        "Aligned plumbing sub schedule with framing completion...",
      date: "Yesterday, 1:00 PM",
      messageCount: 8,
    },
    {
      id: "conv-5",
      title: "PTO conflict resolution",
      preview:
        "Resolved 3 overlapping PTO requests for next week...",
      date: "Mar 14, 3:30 PM",
      messageCount: 6,
    },
    {
      id: "conv-6",
      title: "Equipment scheduling - crane",
      preview:
        "Booked crane rental for Harbor View pour on Tuesday...",
      date: "Mar 14, 10:15 AM",
      messageCount: 3,
    },
    {
      id: "conv-7",
      title: "Rain delay reschedule",
      preview:
        "Rescheduled 3 exterior jobs due to Thursday rain forecast...",
      date: "Mar 13, 2:00 PM",
      messageCount: 7,
    },
  ],
  estimation: [
    {
      id: "conv-1",
      title: "Kitchen & bath reno - 742 Oak St",
      preview:
        "Generated $118.5K estimate for 2,500 sq ft renovation...",
      date: "Today, 11:00 AM",
      messageCount: 6,
      active: true,
    },
    {
      id: "conv-2",
      title: "Commercial buildout - Meridian",
      preview:
        "Detailed $340K estimate with phased pricing breakdown...",
      date: "Today, 8:30 AM",
      messageCount: 10,
    },
    {
      id: "conv-3",
      title: "Material price update - lumber",
      preview:
        "Lumber prices up 6% this month. Updated 12 active estimates...",
      date: "Yesterday, 3:00 PM",
      messageCount: 5,
    },
    {
      id: "conv-4",
      title: "Comp analysis - 800 Elm renovation",
      preview:
        "Pulled 5 comparable projects to validate pricing...",
      date: "Yesterday, 11:30 AM",
      messageCount: 7,
    },
    {
      id: "conv-5",
      title: "Change order estimate - CO-005",
      preview:
        "Priced additional bathroom at $18,200 for Harbor View...",
      date: "Mar 14, 4:00 PM",
      messageCount: 4,
    },
    {
      id: "conv-6",
      title: "Bid comparison - Lakewood",
      preview:
        "Compared our bid vs 2 competitors. We're 4% higher on labor...",
      date: "Mar 14, 9:45 AM",
      messageCount: 8,
    },
    {
      id: "conv-7",
      title: "Permit fee calculation",
      preview:
        "Calculated permit fees for 3 pending projects. Total: $8,400...",
      date: "Mar 13, 1:15 PM",
      messageCount: 3,
    },
  ],
  bookkeeping: [
    {
      id: "conv-1",
      title: "March reconciliation discrepancy",
      preview:
        "Investigating $3,400 discrepancy in QuickBooks for March...",
      date: "Today, 10:30 AM",
      messageCount: 6,
      active: true,
    },
    {
      id: "conv-2",
      title: "Invoice batch - 8 outstanding",
      preview:
        "Generated and sent 8 invoices totaling $142,600...",
      date: "Today, 8:00 AM",
      messageCount: 5,
    },
    {
      id: "conv-3",
      title: "Payroll review - biweekly",
      preview:
        "Reviewed payroll for 24 employees. Total: $87,400...",
      date: "Yesterday, 4:00 PM",
      messageCount: 7,
    },
    {
      id: "conv-4",
      title: "Tax prep - Q1 estimates",
      preview:
        "Calculated Q1 estimated tax payments. Federal: $12,800...",
      date: "Yesterday, 1:45 PM",
      messageCount: 9,
    },
    {
      id: "conv-5",
      title: "Expense report - Summit Heights",
      preview:
        "Categorized $23,400 in expenses across 6 cost codes...",
      date: "Mar 14, 3:30 PM",
      messageCount: 4,
    },
    {
      id: "conv-6",
      title: "Vendor payment schedule",
      preview:
        "Scheduled $67,200 in vendor payments for next week...",
      date: "Mar 14, 10:00 AM",
      messageCount: 6,
    },
    {
      id: "conv-7",
      title: "Cash flow forecast - April",
      preview:
        "Projected cash flow shows $28K surplus by end of April...",
      date: "Mar 13, 2:30 PM",
      messageCount: 8,
    },
  ],
  "project-management": [
    {
      id: "conv-1",
      title: "Active projects status review",
      preview:
        "Reviewing all 5 active projects. Lakewood flagged as at-risk...",
      date: "Today, 9:15 AM",
      messageCount: 6,
      active: true,
    },
    {
      id: "conv-2",
      title: "Risk mitigation - Lakewood",
      preview:
        "Concrete sub no-showed twice. Escalating to backup...",
      date: "Today, 7:45 AM",
      messageCount: 8,
    },
    {
      id: "conv-3",
      title: "Client milestone update - Riverside",
      preview:
        "Sent progress report. 67% complete, on track for July...",
      date: "Yesterday, 3:30 PM",
      messageCount: 5,
    },
    {
      id: "conv-4",
      title: "Resource allocation review",
      preview:
        "Rebalanced crew hours across 5 projects for next sprint...",
      date: "Yesterday, 11:00 AM",
      messageCount: 10,
    },
    {
      id: "conv-5",
      title: "Change order tracking",
      preview:
        "3 pending change orders worth $42K. 2 need client approval...",
      date: "Mar 14, 4:15 PM",
      messageCount: 6,
    },
    {
      id: "conv-6",
      title: "Weekly standup prep",
      preview:
        "Compiled talking points and blockers for Monday standup...",
      date: "Mar 14, 9:00 AM",
      messageCount: 4,
    },
    {
      id: "conv-7",
      title: "Timeline adjustment - Harbor View",
      preview:
        "Extended timeline 5 days due to permit delay. Updated Gantt...",
      date: "Mar 13, 3:00 PM",
      messageCount: 7,
    },
  ],
  "field-operations": [
    {
      id: "conv-1",
      title: "Johnson Kitchen Remodel",
      preview:
        "L-shaped kitchen design with island. White shaker cabinets, quartz countertops...",
      date: "Today, 2:00 PM",
      messageCount: 8,
      active: true,
    },
    {
      id: "conv-2",
      title: "Smith Master Bathroom",
      preview:
        "Double vanity layout with walk-in shower. Marble tile, brushed nickel fixtures...",
      date: "Today, 10:30 AM",
      messageCount: 6,
    },
    {
      id: "conv-3",
      title: "Peterson Full Kitchen",
      preview:
        "U-shaped kitchen with peninsula. Modern flat-panel cabinets, waterfall island...",
      date: "Today, 8:15 AM",
      messageCount: 5,
    },
    {
      id: "conv-4",
      title: "Rivera Powder Room",
      preview:
        "Small powder room redesign. Floating vanity, vessel sink, accent wall...",
      date: "Yesterday, 4:30 PM",
      messageCount: 4,
    },
    {
      id: "conv-5",
      title: "Chen Kitchen Refresh",
      preview:
        "Cabinet refacing and new countertops. Keeping existing layout...",
      date: "Yesterday, 1:00 PM",
      messageCount: 7,
    },
    {
      id: "conv-6",
      title: "Oakwood Spec Home - Kitchen",
      preview:
        "Builder-grade kitchen for new construction. Budget-conscious material selections...",
      date: "Mar 14, 3:45 PM",
      messageCount: 5,
    },
    {
      id: "conv-7",
      title: "Torres Kitchen + Bath Bundle",
      preview:
        "Full kitchen and two bathroom designs for whole-home renovation...",
      date: "Mar 13, 11:00 AM",
      messageCount: 12,
    },
  ],
};

// ---------------------------------------------------------------------------
// Mock: Chat messages (per agent)
// ---------------------------------------------------------------------------

const messagesByAgent: Record<string, ChatMessage[]> = {
  // ===================== CUSTOMER SUPPORT =====================
  "customer-support": [
    {
      id: "m1",
      role: "user",
      content:
        "A customer called about invoice #4521 \u2014 they say they were overcharged for the tile work on the Harbor View project. Can you look into this?",
      timestamp: "2:31 PM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        "I've pulled up invoice #4521 for Harbor View Kitchen Remodel. Here's what I found:",
      timestamp: "2:31 PM",
      card: {
        type: "invoice",
        data: {
          invoiceNumber: "#4521",
          project: "Harbor View Kitchen Remodel",
          client: "Sarah Chen - Harbor View Construction",
          rows: [
            { label: "Original Estimate (Tile)", value: "$12,400.00" },
            { label: "Invoiced Amount", value: "$14,800.00" },
            {
              label: "Variance",
              value: "+$2,400.00 (19.4% over)",
              highlight: true,
            },
          ],
          note: 'The overage appears to stem from Change Order CO-002 which added premium backsplash tile (Carrara marble herringbone). However, the change order is currently marked as "Pending Approval" and may not have been signed off by the customer.',
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content:
        "Can you draft a response email to the customer explaining this?",
      timestamp: "2:32 PM",
    },
    {
      id: "m4",
      role: "agent",
      content: "Here's a draft email to Sarah Chen at Harbor View Construction:",
      timestamp: "2:32 PM",
      card: {
        type: "email",
        data: {
          to: "sarah.chen@harborview.co",
          subject: "Re: Invoice #4521 - Harbor View Kitchen Remodel",
          body: "Dear Sarah,\n\nThank you for reaching out regarding invoice #4521 for the Harbor View Kitchen Remodel project.\n\nAfter reviewing the invoice, we identified that the $2,400 difference between the original estimate ($12,400) and the invoiced amount ($14,800) is attributable to Change Order CO-002, which included an upgrade to premium Carrara marble herringbone backsplash tile.\n\nWe noticed that this change order is still marked as pending approval in our system. We want to ensure full transparency \u2014 if this upgrade was not explicitly authorized, we will adjust the invoice to reflect the original estimate.\n\nPlease let us know how you'd like to proceed, and we'll make the correction immediately.\n\nBest regards,\nApex Intelligence Team",
        },
      },
      actions: [
        { label: "Approve & Send", variant: "primary", icon: Check },
        { label: "Edit Before Sending", variant: "secondary", icon: PenLine },
        { label: "Reject", variant: "danger", icon: X },
      ],
    },
    {
      id: "m5",
      role: "user",
      content:
        "Edit the tone to be more apologetic and offer a 5% discount",
      timestamp: "2:33 PM",
    },
    {
      id: "m6",
      role: "agent",
      content:
        "Updated draft with a more apologetic tone and 5% discount offer:",
      timestamp: "2:33 PM",
      card: {
        type: "email",
        data: {
          to: "sarah.chen@harborview.co",
          subject:
            "Re: Invoice #4521 - Harbor View Kitchen Remodel \u2014 Our Apologies",
          body: "Dear Sarah,\n\nI sincerely apologize for the confusion and frustration caused by the discrepancy on invoice #4521. This is not the experience we want for our valued clients, and I appreciate you bringing it to our attention.\n\nAfter a thorough review, the $2,400 overage stems from Change Order CO-002 (premium Carrara marble herringbone backsplash). Our records show this change order was never fully approved, which means it should not have been included in the final invoice. This was an error on our part.\n\nTo make this right, we will:\n\n1. Immediately adjust the invoice to remove the unapproved charges\n2. Apply an additional 5% courtesy discount on the tile work as an apology for the inconvenience\n\nYour revised invoice total for tile work will be $11,780.00 (original $12,400 less 5% discount).\n\nWe value our relationship with Harbor View Construction and are committed to making sure this is resolved to your complete satisfaction.\n\nWith sincere apologies,\nApex Intelligence Team",
        },
      },
      actions: [
        { label: "Approve & Send", variant: "primary", icon: Check },
        { label: "Edit Before Sending", variant: "secondary", icon: PenLine },
        { label: "Reject", variant: "danger", icon: X },
      ],
    },
    {
      id: "m7",
      role: "user",
      content: "Perfect, send it",
      timestamp: "2:34 PM",
    },
    {
      id: "m8",
      role: "agent",
      content:
        "Email sent to sarah.chen@harborview.co at 2:34 PM. I've also taken care of the follow-up items:",
      timestamp: "2:34 PM",
      statusItems: [
        "Updated invoice notes in QuickBooks with discount and reason code",
        "Created a follow-up task for March 19 to confirm customer satisfaction",
        "Logged this interaction in the CRM under Harbor View Construction",
        "Attached the revised invoice PDF to the email thread",
      ],
      statusComplete: true,
      attachment: { name: "Invoice_4521_Revised.pdf", type: "pdf" },
    },
  ],

  // ===================== SALES OUTREACH =====================
  "sales-outreach": [
    {
      id: "m1",
      role: "user",
      content:
        "We got 3 new leads from the website this morning. Can you qualify them?",
      timestamp: "10:15 AM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        'Based on my analysis, Lead #1 (Meridian Properties \u2014 $340K commercial buildout) is highest priority. They match our ideal customer profile and have budget approval.',
      timestamp: "10:16 AM",
      card: {
        type: "leads",
        data: {
          leads: [
            {
              rank: 1,
              company: "Meridian Properties",
              contact: "James Thornton, VP Development",
              project: "Commercial office buildout",
              value: "$340,000",
              score: 92,
              scoreColor: "green",
              notes: "Budget approved, timeline Q2, matches ICP",
            },
            {
              rank: 2,
              company: "Sunrise Senior Living",
              contact: "Diana Moss, Facilities Dir.",
              project: "Bathroom ADA retrofits (12 units)",
              value: "$185,000",
              score: 74,
              scoreColor: "amber",
              notes: "Budget pending board approval in April",
            },
            {
              rank: 3,
              company: "Parker Residence",
              contact: "Tom Parker, Homeowner",
              project: "Kitchen remodel",
              value: "$45,000",
              score: 51,
              scoreColor: "red",
              notes: "Early research phase, no timeline set",
            },
          ],
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content: "Draft a personalized outreach email for the Meridian lead",
      timestamp: "10:17 AM",
    },
    {
      id: "m4",
      role: "agent",
      content:
        "Here's a personalized email for James Thornton at Meridian Properties. I referenced the Summit Heights commercial project we completed last quarter as a comparable:",
      timestamp: "10:17 AM",
      card: {
        type: "email",
        data: {
          to: "j.thornton@meridianproperties.com",
          subject:
            "Apex Intelligence \u2014 Commercial Buildout Expertise for Meridian",
          body: "Hi James,\n\nI came across Meridian Properties' expansion plans and wanted to reach out. At Apex Intelligence, we specialize in commercial buildouts exactly like what you're planning.\n\nWe recently completed a similar $380K commercial office buildout at Summit Heights \u2014 delivered 2 weeks early and 3% under budget. The project included open-concept workspace, conference rooms, and a full server room buildout.\n\nI'd love to share some photos and discuss how we could bring the same efficiency to your project. Are you available for a quick 15-minute call this week?\n\nA few things that set us apart:\n\u2022 AI-powered project scheduling that eliminates crew conflicts\n\u2022 Real-time budget tracking with no surprise overages\n\u2022 Average client satisfaction score of 4.9/5.0\n\nLooking forward to connecting.\n\nBest,\nApex Intelligence Team",
        },
      },
      actions: [
        { label: "Approve & Send", variant: "primary", icon: Check },
        { label: "Edit Before Sending", variant: "secondary", icon: PenLine },
        { label: "Reject", variant: "danger", icon: X },
      ],
    },
    {
      id: "m5",
      role: "user",
      content:
        "Looks great, send it and schedule a follow-up for Thursday",
      timestamp: "10:18 AM",
    },
    {
      id: "m6",
      role: "agent",
      content:
        "Done! Email sent and follow-up call scheduled for Thursday 2:00 PM. I've also added them to the CRM pipeline as 'Warm Lead'.",
      timestamp: "10:18 AM",
      statusItems: [
        "Email sent to j.thornton@meridianproperties.com",
        "Follow-up call scheduled: Thursday, Mar 20 at 2:00 PM",
        "Added Meridian Properties to CRM pipeline \u2014 Stage: Warm Lead",
        "Set automated reminder for Wednesday evening to prep call notes",
      ],
      statusComplete: true,
    },
  ],

  // ===================== SCHEDULING =====================
  scheduling: [
    {
      id: "m1",
      role: "user",
      content:
        "Mike's crew can't make it to the Summit Heights job on Wednesday. We need to figure out coverage.",
      timestamp: "9:00 AM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        "I found 2 options to cover the Summit Heights gap on Wednesday:",
      timestamp: "9:01 AM",
      card: {
        type: "schedule",
        data: {
          title: "Week of March 17 \u2014 Crew Assignments",
          conflict: "Wednesday, Mar 19 \u2014 Summit Heights (Mike's Crew unavailable)",
          rows: [
            {
              day: "Mon",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Tue",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Wed",
              assignments: [
                {
                  crew: "Mike",
                  site: "Summit Heights",
                  highlight: true,
                  label: "CONFLICT",
                },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Thu",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Fri",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Harbor View" },
              ],
            },
          ],
          options: [
            {
              label: "Option A",
              description:
                "Move Carlos's crew from Lakewood (lower priority) to Summit Heights for Wednesday",
              impact: "Lakewood pauses 1 day \u2014 deadline not affected",
              recommended: true,
            },
            {
              label: "Option B",
              description:
                "Split David's crew between Riverside and Summit Heights",
              impact:
                "Both sites run at reduced capacity. Risk of slipping Riverside timeline",
              recommended: false,
            },
          ],
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content:
        "Go with Option A, but check if it affects Lakewood's deadline",
      timestamp: "9:03 AM",
    },
    {
      id: "m4",
      role: "agent",
      content:
        "Confirmed. Lakewood's deadline isn't until June 29 \u2014 moving Carlos's crew back Thursday keeps them on track. Updated schedule:",
      timestamp: "9:03 AM",
      card: {
        type: "schedule",
        data: {
          title: "Updated Week of March 17 \u2014 Crew Assignments",
          conflict: null,
          rows: [
            {
              day: "Mon",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Tue",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Wed",
              assignments: [
                { crew: "Mike", site: "\u2014", label: "OFF" },
                {
                  crew: "Carlos",
                  site: "Summit Heights",
                  highlight: true,
                  label: "MOVED",
                },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Thu",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Riverside" },
              ],
            },
            {
              day: "Fri",
              assignments: [
                { crew: "Mike", site: "Summit Heights" },
                { crew: "Carlos", site: "Lakewood" },
                { crew: "David", site: "Harbor View" },
              ],
            },
          ],
          options: [],
        },
      },
      actions: [
        { label: "Apply Changes", variant: "primary", icon: Check },
        { label: "Notify Crews", variant: "secondary", icon: Megaphone },
      ],
    },
  ],

  // ===================== ESTIMATION =====================
  estimation: [
    {
      id: "m1",
      role: "user",
      content:
        "I need a rough estimate for a 2,500 sq ft kitchen and bath renovation at 742 Oak Street",
      timestamp: "11:00 AM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        "Based on comparable projects in the area and current material pricing. Note: countertop pricing assumes quartz. Granite would reduce by ~$2,000.",
      timestamp: "11:01 AM",
      card: {
        type: "estimate",
        data: {
          title: "Estimate \u2014 742 Oak Street Kitchen & Bath Renovation",
          subtitle: "2,500 sq ft | Residential | Preliminary",
          rows: [
            { label: "Demolition", value: "$4,200" },
            { label: "Plumbing", value: "$18,500" },
            { label: "Electrical", value: "$12,300" },
            { label: "Tile Work", value: "$15,800" },
            { label: "Cabinets & Millwork", value: "$22,000" },
            { label: "Countertops (Quartz)", value: "$8,500" },
            { label: "Fixtures & Hardware", value: "$6,400" },
            { label: "Labor", value: "$28,000" },
            { label: "Permits & Fees", value: "$2,800" },
          ],
          total: "$118,500",
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content: "Client wants marble countertops instead. What's the impact?",
      timestamp: "11:03 AM",
    },
    {
      id: "m4",
      role: "agent",
      content:
        "Marble upgrade adds $4,200. Revised total: $122,700. Here's the updated estimate:",
      timestamp: "11:03 AM",
      card: {
        type: "estimate",
        data: {
          title: "Revised Estimate \u2014 742 Oak Street Kitchen & Bath",
          subtitle: "2,500 sq ft | Residential | Updated: Marble countertops",
          rows: [
            { label: "Demolition", value: "$4,200" },
            { label: "Plumbing", value: "$18,500" },
            { label: "Electrical", value: "$12,300" },
            { label: "Tile Work", value: "$15,800" },
            { label: "Cabinets & Millwork", value: "$22,000" },
            {
              label: "Countertops (Marble)",
              value: "$12,700",
              highlight: true,
              note: "+$4,200 from quartz",
            },
            { label: "Fixtures & Hardware", value: "$6,400" },
            { label: "Labor", value: "$28,000" },
            { label: "Permits & Fees", value: "$2,800" },
          ],
          total: "$122,700",
          totalHighlight: true,
        },
      },
      actions: [
        { label: "Export PDF", variant: "primary", icon: FileText },
        { label: "Send to Client", variant: "secondary", icon: PenLine },
        { label: "Save Draft", variant: "secondary", icon: Check },
      ],
    },
  ],

  // ===================== BOOKKEEPING =====================
  bookkeeping: [
    {
      id: "m1",
      role: "user",
      content:
        "QuickBooks is showing a $3,400 discrepancy for March. Can you investigate?",
      timestamp: "10:30 AM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        "Found the issue. Two invoices were recorded under the wrong project:",
      timestamp: "10:31 AM",
      card: {
        type: "financial",
        data: {
          title: "March Revenue Reconciliation",
          summary: [
            { label: "Expected Revenue", value: "$284,300" },
            { label: "QB Recorded", value: "$280,900" },
            {
              label: "Discrepancy",
              value: "-$3,400",
              highlight: true,
            },
          ],
          issues: [
            {
              invoice: "INV-1847",
              amount: "$2,100",
              wrongProject: "Riverside Remodel",
              correctProject: "Summit Heights Buildout",
            },
            {
              invoice: "INV-1852",
              amount: "$1,300",
              wrongProject: "Harbor View Kitchen",
              correctProject: "Lakewood Commercial",
            },
          ],
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content: "Fix those and run the monthly P&L",
      timestamp: "10:33 AM",
    },
    {
      id: "m4",
      role: "agent",
      content:
        "Invoices corrected in QuickBooks. Here's the March P&L:",
      timestamp: "10:34 AM",
      card: {
        type: "pnl",
        data: {
          title: "March 2026 \u2014 Profit & Loss Summary",
          rows: [
            { label: "Revenue", value: "$284,300", bold: true },
            { label: "Cost of Goods Sold", value: "$186,200", indent: true },
            {
              label: "Gross Profit",
              value: "$98,100 (34.5%)",
              bold: true,
              separator: true,
            },
            {
              label: "Operating Expenses",
              value: "$52,300",
              indent: true,
            },
            {
              label: "Net Income",
              value: "$45,800",
              bold: true,
              highlight: true,
              separator: true,
            },
          ],
        },
      },
      actions: [
        {
          label: "Download Full Report",
          variant: "primary",
          icon: FileText,
        },
        { label: "Export to Excel", variant: "secondary", icon: PenLine },
      ],
    },
  ],

  // ===================== PROJECT MANAGEMENT =====================
  "project-management": [
    {
      id: "m1",
      role: "user",
      content:
        "What's the status on all active projects? Any at risk?",
      timestamp: "9:15 AM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        "Lakewood Commercial Buildout is at risk \u2014 concrete subcontractor no-showed twice. Recommend escalating to backup sub.",
      timestamp: "9:16 AM",
      card: {
        type: "dashboard",
        data: {
          title: "Active Projects Dashboard",
          projects: [
            {
              name: "Riverside Remodel",
              progress: 67,
              status: "green",
              statusLabel: "On Track",
              detail: "Phase 3 of 5 \u2014 Electrical rough-in",
              deadline: "Jul 15",
            },
            {
              name: "Summit Heights Buildout",
              progress: 42,
              status: "amber",
              statusLabel: "Material Delay",
              detail: "Steel beams delayed 5 days from supplier",
              deadline: "Aug 30",
            },
            {
              name: "Harbor View Kitchen",
              progress: 85,
              status: "green",
              statusLabel: "On Track",
              detail: "Final finishes and punch list",
              deadline: "Mar 28",
            },
            {
              name: "Lakewood Commercial",
              progress: 23,
              status: "red",
              statusLabel: "At Risk",
              detail:
                "Concrete sub no-showed 2x. 2 weeks behind schedule",
              deadline: "Jun 29",
            },
            {
              name: "Castillo Residence",
              progress: 30,
              status: "green",
              statusLabel: "On Track",
              detail: "Foundation complete, framing started",
              deadline: "Sep 12",
            },
          ],
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content:
        "Send an alert to Mike about Lakewood and draft a message to the backup subcontractor",
      timestamp: "9:18 AM",
    },
    {
      id: "m4",
      role: "agent",
      content:
        "Alert sent to Mike Torres. Draft message to Pacific Concrete:",
      timestamp: "9:18 AM",
      card: {
        type: "message",
        data: {
          to: "Pacific Concrete Services \u2014 dispatch@pacificconcrete.com",
          subject: "Urgent: Concrete Work Available \u2014 Lakewood Commercial",
          body: "Hi Pacific Concrete Team,\n\nWe have an immediate need for concrete work on our Lakewood Commercial Buildout project. The scope includes:\n\n\u2022 Foundation slab pour \u2014 4,200 sq ft\n\u2022 Grade beams and footings\n\u2022 Estimated 3-week engagement starting ASAP\n\nWe've worked together on the Riverside project last year and were impressed with your quality and reliability. Can you provide availability and a quote by end of day Wednesday?\n\nProject address: 1200 Lakewood Blvd, Suite 100\nProject Manager: Mike Torres (mike.t@apexintel.co)\n\nThank you,\nApex Intelligence Team",
        },
      },
      actions: [
        { label: "Send", variant: "primary", icon: Check },
        { label: "Edit", variant: "secondary", icon: PenLine },
      ],
    },
  ],

  // ===================== DESIGN SPEC ASSISTANT =====================
  "field-operations": [
    {
      id: "m1",
      role: "user",
      content:
        "New kitchen design for the Johnson project. L-shaped room, roughly 12 by 10 feet. They want white shaker cabinets, quartz countertops, and an island with seating for 3. Sink under the window on the north wall, range on the east wall.",
      timestamp: "2:00 PM",
    },
    {
      id: "m2",
      role: "agent",
      content:
        "I've generated 2 layout options based on the Johnson kitchen specs. Both comply with NKBA guidelines and maintain proper work triangle distances. These are AutoCAD 2D floor plans (DXF) \u2014 I can generate a full Revit 3D model once you approve a layout.",
      timestamp: "2:01 PM",
      card: {
        type: "design-preview",
        data: {
          title: "Johnson Kitchen \u2014 Layout Options",
          options: [
            {
              name: "Option A \u2014 Classic L",
              description:
                'Standard L-shaped with 42" \u00d7 84" center island. Work triangle: 21ft. All clearances pass NKBA minimums.',
              specs: [
                { label: "Cabinets", value: "14 base + 10 wall" },
                { label: "Island", value: '42" \u00d7 84" with overhang' },
                { label: "Countertop", value: "48.2 sq ft quartz" },
                { label: "Work Triangle", value: "21 ft \u2713" },
              ],
            },
            {
              name: "Option B \u2014 Extended Island",
              description:
                'L-shaped with extended 48" \u00d7 96" island and prep sink. Maximizes counter space. Work triangle: 23ft.',
              specs: [
                { label: "Cabinets", value: "12 base + 10 wall" },
                { label: "Island", value: '48" \u00d7 96" with prep sink' },
                { label: "Countertop", value: "54.8 sq ft quartz" },
                { label: "Work Triangle", value: "23 ft \u2713" },
              ],
            },
          ],
        },
      },
    },
    {
      id: "m3",
      role: "user",
      content:
        "Option A looks good but can you move the island about 6 inches closer to the window? And add a pantry cabinet on the east wall next to the range.",
      timestamp: "2:03 PM",
    },
    {
      id: "m4",
      role: "agent",
      content:
        'Updated. Island shifted 6" north toward the window \u2014 clearance is now 44" (NKBA min 42" \u2713). Added a 24" pantry tall cabinet east of the range with 15" landing space between them.',
      timestamp: "2:04 PM",
      card: {
        type: "design-preview",
        data: {
          title: "Johnson Kitchen \u2014 Option A (Revised)",
          options: [
            {
              name: "Revision 2",
              description:
                'Island shifted 6" north. 24" pantry added east of range. All clearances still pass.',
              specs: [
                { label: "Cabinets", value: "14 base + 10 wall + 1 tall" },
                { label: "Island Clearance", value: '44" south, 42" east \u2713' },
                { label: "Countertop", value: "48.2 sq ft quartz" },
                { label: "Pantry", value: '24"W \u00d7 84"H \u00d7 24"D' },
                { label: "NKBA Check", value: "31/31 rules pass \u2713" },
              ],
            },
          ],
        },
      },
      actions: [
        { label: "Open in Canvas", variant: "primary", icon: Palette },
        { label: "Export AutoCAD DXF", variant: "secondary", icon: FileText },
      ],
    },
    {
      id: "m5",
      role: "user",
      content: "Perfect. Generate the Revit 3D model and full estimate.",
      timestamp: "2:06 PM",
    },
    {
      id: "m6",
      role: "agent",
      content:
        "Revit 3D model generated via cloud engine (took 2m 14s). Estimate calculated from the BIM model. Here's the full breakdown for the Johnson Kitchen:",
      timestamp: "2:08 PM",
      card: {
        type: "estimate",
        data: {
          title: "Johnson Kitchen Remodel \u2014 Full Estimate",
          subtitle: "Mike & Sarah Johnson | 12\u2019 \u00d7 10\u2019 L-Shaped Kitchen",
          rows: [
            { label: "Base cabinets (14 units)", value: "$6,440" },
            { label: "Wall cabinets (10 units)", value: "$3,800" },
            { label: "Tall pantry cabinet", value: "$890" },
            { label: "Island cabinet base", value: "$1,240" },
            { label: "Quartz countertop (48.2 sq ft)", value: "$4,818" },
            { label: "Island countertop with overhang", value: "$2,100" },
            { label: "Backsplash tile (32 sq ft)", value: "$960" },
            { label: "Undermount sink + faucet", value: "$680" },
            { label: "Disposal", value: "$220" },
            { label: "Demo & disposal", value: "$2,200" },
            { label: "Cabinet installation", value: "$3,600" },
            { label: "Countertop template & install", value: "$1,800" },
            { label: "Plumbing", value: "$1,400" },
            { label: "Electrical (6 outlets + lighting)", value: "$2,100" },
            { label: "Tile installation", value: "$1,200" },
          ],
          total: "$33,448",
        },
      },
    },
    {
      id: "m7",
      role: "user",
      content:
        "Looks great. Send the 3D render and estimate to Adam for approval.",
      timestamp: "2:10 PM",
    },
    {
      id: "m8",
      role: "agent",
      content:
        "Done. I've packaged everything and sent it to Adam for sign-off. Here's what was included:",
      timestamp: "2:10 PM",
      statusItems: [
        "Revit 3D model (.rvt) saved to Johnson project folder",
        "AutoCAD floor plan (.dxf) exported for permit submission",
        "3D photorealistic render from Revit model (4 angles: aerial, perspective, sink wall, island detail)",
        "Interactive 360\u00b0 tour link generated from Revit model",
        "Itemized estimate ($33,448) extracted from Revit BIM data",
        "Digital approval link sent to adam@slatedesignremodel.com",
        "Estimated timeline: 3\u20134 weeks for cabinet order + 2 weeks install",
      ],
      statusComplete: true,
      attachment: { name: "Johnson_Kitchen_v2.rvt  |  Johnson_Kitchen_v2.dxf  |  Estimate.pdf", type: "pdf" },
    },
  ],
};

// ---------------------------------------------------------------------------
// Quick Actions (per agent)
// ---------------------------------------------------------------------------

const quickActionsByAgent: Record<
  string,
  { label: string; icon: LucideIcon }[]
> = {
  "customer-support": [
    { label: "Draft Response", icon: PenLine },
    { label: "Look Up Customer", icon: Sparkles },
    { label: "Create Ticket", icon: FileText },
    { label: "Escalate", icon: Megaphone },
  ],
  "sales-outreach": [
    { label: "Qualify Lead", icon: Sparkles },
    { label: "Draft Proposal", icon: PenLine },
    { label: "Schedule Call", icon: CalendarClock },
    { label: "Pipeline Report", icon: FileText },
  ],
  scheduling: [
    { label: "Check Availability", icon: CalendarClock },
    { label: "Resolve Conflict", icon: Sparkles },
    { label: "Weekly Schedule", icon: FileText },
    { label: "Notify Crew", icon: Megaphone },
  ],
  estimation: [
    { label: "New Estimate", icon: Calculator },
    { label: "Compare Materials", icon: Sparkles },
    { label: "Pull Comps", icon: FileText },
    { label: "Export PDF", icon: PenLine },
  ],
  bookkeeping: [
    { label: "Reconcile", icon: BookOpen },
    { label: "Generate Invoice", icon: FileText },
    { label: "Run Report", icon: Sparkles },
    { label: "Check Payments", icon: Calculator },
  ],
  "project-management": [
    { label: "Status Update", icon: FolderKanban },
    { label: "Risk Assessment", icon: Sparkles },
    { label: "Resource Check", icon: CalendarClock },
    { label: "Timeline Review", icon: FileText },
  ],
  "field-operations": [
    { label: "New Design", icon: Palette },
    { label: "Room Measurements", icon: PenLine },
    { label: "Generate Estimate", icon: Calculator },
    { label: "Client Presentation", icon: Sparkles },
  ],
};

const defaultQuickActions = [
  { label: "Draft Response", icon: PenLine },
  { label: "Look Up Info", icon: Sparkles },
  { label: "Create Report", icon: FileText },
  { label: "Escalate", icon: Megaphone },
];

// ---------------------------------------------------------------------------
// Conversation start times (per agent)
// ---------------------------------------------------------------------------

const conversationStartTimes: Record<string, string> = {
  "customer-support": "Today, 2:31 PM",
  "sales-outreach": "Today, 10:15 AM",
  scheduling: "Today, 9:00 AM",
  estimation: "Today, 11:00 AM",
  bookkeeping: "Today, 10:30 AM",
  "project-management": "Today, 9:15 AM",
  "field-operations": "Today, 2:00 PM",
};

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function InvoiceCard({ data }: { data: Record<string, unknown> }) {
  const rows = data.rows as Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  const note = data.note as string;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      {/* Card header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <FileText className="size-4 text-indigo-400" />
        <span className="text-xs font-semibold text-foreground">
          Invoice {data.invoiceNumber as string}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {data.project as string}
        </span>
      </div>
      {/* Rows */}
      <div className="divide-y divide-border/50">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-2.5 ${
              row.highlight ? "bg-amber-500/5" : ""
            }`}
          >
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span
              className={`text-sm font-semibold ${
                row.highlight ? "text-amber-400" : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {/* Note */}
      {note && (
        <div className="border-t border-border bg-muted/10 px-4 py-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {note}
          </p>
        </div>
      )}
    </div>
  );
}

function EmailCard({ data }: { data: Record<string, unknown> }) {
  const to = data.to as string;
  const subject = data.subject as string;
  const body = data.body as string;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      {/* Email header */}
      <div className="space-y-1.5 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">To:</span>
          <span className="text-foreground">{to}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">Subject:</span>
          <span className="font-medium text-foreground">{subject}</span>
        </div>
      </div>
      {/* Email body */}
      <div className="px-4 py-3">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
          {body}
        </p>
      </div>
    </div>
  );
}

function LeadsCard({ data }: { data: Record<string, unknown> }) {
  const leads = data.leads as Array<{
    rank: number;
    company: string;
    contact: string;
    project: string;
    value: string;
    score: number;
    scoreColor: string;
    notes: string;
  }>;

  const scoreColorMap: Record<string, string> = {
    green: "bg-green-500/15 text-green-400 ring-green-500/20",
    amber: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
    red: "bg-red-500/15 text-red-400 ring-red-500/20",
  };

  return (
    <div className="mt-3 space-y-2">
      {leads.map((lead) => (
        <div
          key={lead.rank}
          className="overflow-hidden rounded-xl border border-border bg-muted/20"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-muted/50 text-[11px] font-bold text-muted-foreground">
                {lead.rank}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {lead.company}
              </span>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                scoreColorMap[lead.scoreColor]
              }`}
            >
              Score: {lead.score}
            </span>
          </div>
          <div className="space-y-1.5 px-4 py-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">
                Contact:
              </span>
              <span className="text-foreground">{lead.contact}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">
                Project:
              </span>
              <span className="text-foreground">{lead.project}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">
                Est. Value:
              </span>
              <span className="font-semibold text-foreground">
                {lead.value}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground/70">
              {lead.notes}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const conflict = data.conflict as string | null;
  const rows = data.rows as Array<{
    day: string;
    assignments: Array<{
      crew: string;
      site: string;
      highlight?: boolean;
      label?: string;
    }>;
  }>;
  const options = (data.options || []) as Array<{
    label: string;
    description: string;
    impact: string;
    recommended: boolean;
  }>;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        {conflict && (
          <p className="mt-1 text-[11px] text-amber-400">{conflict}</p>
        )}
      </div>
      {/* Schedule grid */}
      <div className="divide-y divide-border/50">
        {rows.map((row) => (
          <div key={row.day} className="flex items-center gap-3 px-4 py-2">
            <span className="w-8 shrink-0 text-xs font-bold text-muted-foreground">
              {row.day}
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {row.assignments.map((a, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                    a.highlight
                      ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
                      : "bg-muted/30 text-foreground/70"
                  }`}
                >
                  <span className="font-semibold">{a.crew}</span>
                  <span className="text-muted-foreground/50">\u2192</span>
                  <span>{a.site}</span>
                  {a.label && (
                    <span className="ml-1 rounded bg-amber-500/20 px-1 text-[9px] font-bold text-amber-400">
                      {a.label}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Options */}
      {options.length > 0 && (
        <div className="border-t border-border px-4 py-3 space-y-2">
          {options.map((opt) => (
            <div
              key={opt.label}
              className={`rounded-lg border px-3 py-2 ${
                opt.recommended
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-border bg-muted/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {opt.label}
                </span>
                {opt.recommended && (
                  <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-[9px] font-bold text-green-400">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground/80">
                {opt.description}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Impact: {opt.impact}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EstimateCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const subtitle = data.subtitle as string;
  const rows = data.rows as Array<{
    label: string;
    value: string;
    highlight?: boolean;
    note?: string;
  }>;
  const total = data.total as string;
  const totalHighlight = data.totalHighlight as boolean | undefined;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="divide-y divide-border/50">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-2.5 ${
              row.highlight ? "bg-amber-500/5" : ""
            }`}
          >
            <div>
              <span className="text-sm text-muted-foreground">{row.label}</span>
              {row.note && (
                <span className="ml-2 text-[10px] text-amber-400">
                  {row.note}
                </span>
              )}
            </div>
            <span
              className={`text-sm font-semibold ${
                row.highlight ? "text-amber-400" : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {/* Total */}
      <div
        className={`flex items-center justify-between border-t border-border px-4 py-3 ${
          totalHighlight ? "bg-amber-500/5" : "bg-muted/10"
        }`}
      >
        <span className="text-sm font-bold text-foreground">Total</span>
        <span
          className={`text-base font-bold ${
            totalHighlight ? "text-amber-400" : "text-foreground"
          }`}
        >
          {total}
        </span>
      </div>
    </div>
  );
}

function FinancialCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const summary = data.summary as Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
  const issues = data.issues as Array<{
    invoice: string;
    amount: string;
    wrongProject: string;
    correctProject: string;
  }>;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      {/* Summary rows */}
      <div className="divide-y divide-border/50">
        {summary.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-2.5 ${
              row.highlight ? "bg-red-500/5" : ""
            }`}
          >
            <span className="text-sm text-muted-foreground">{row.label}</span>
            <span
              className={`text-sm font-semibold ${
                row.highlight ? "text-red-400" : "text-foreground"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      {/* Issue table */}
      {issues && issues.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold text-muted-foreground">
            Misallocated Invoices
          </p>
          <div className="space-y-2">
            {issues.map((issue) => (
              <div
                key={issue.invoice}
                className="rounded-lg border border-border bg-muted/10 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {issue.invoice}
                  </span>
                  <span className="text-xs font-semibold text-amber-400">
                    {issue.amount}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="text-red-400/70 line-through">
                    {issue.wrongProject}
                  </span>
                  <span className="text-muted-foreground/50">\u2192</span>
                  <span className="text-green-400">{issue.correctProject}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PnlCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const rows = data.rows as Array<{
    label: string;
    value: string;
    bold?: boolean;
    indent?: boolean;
    highlight?: boolean;
    separator?: boolean;
  }>;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      <div className="divide-y divide-border/50">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-4 py-2.5 ${
              row.highlight ? "bg-green-500/5" : ""
            } ${row.separator ? "border-t border-border" : ""}`}
          >
            <span
              className={`text-sm ${
                row.indent ? "pl-4 " : ""
              }${
                row.bold
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {row.label}
            </span>
            <span
              className={`text-sm ${
                row.bold ? "font-bold" : "font-semibold"
              } ${row.highlight ? "text-green-400" : "text-foreground"}`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const projects = data.projects as Array<{
    name: string;
    progress: number;
    status: string;
    statusLabel: string;
    detail: string;
    deadline: string;
  }>;

  const statusStyles: Record<string, string> = {
    green: "bg-green-500/15 text-green-400 ring-green-500/20",
    amber: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
    red: "bg-red-500/15 text-red-400 ring-red-500/20",
  };

  const barColors: Record<string, string> = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      <div className="divide-y divide-border/50">
        {projects.map((project) => (
          <div key={project.name} className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {project.name}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                    statusStyles[project.status]
                  }`}
                >
                  {project.statusLabel}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Due {project.deadline}
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className={`h-full rounded-full transition-all ${
                  barColors[project.status]
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground/70">
                {project.detail}
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {project.progress}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageCard({ data }: { data: Record<string, unknown> }) {
  const to = data.to as string;
  const subject = data.subject as string;
  const body = data.body as string;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="space-y-1.5 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">To:</span>
          <span className="text-foreground">{to}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">Subject:</span>
          <span className="font-medium text-foreground">{subject}</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
          {body}
        </p>
      </div>
    </div>
  );
}

function InspectionCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const fields = data.fields as Array<{ label: string; value: string }>;
  const checklist = data.checklist as Array<{
    item: string;
    passed: boolean;
  }>;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      {/* Fields */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-border px-4 py-3">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[10px] font-medium text-muted-foreground">
              {f.label}
            </p>
            <p className="text-xs font-semibold text-foreground">{f.value}</p>
          </div>
        ))}
      </div>
      {/* Checklist */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-[11px] font-semibold text-muted-foreground">
          Inspection Checklist
        </p>
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.passed ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-400" />
            ) : (
              <X className="size-4 shrink-0 text-red-400" />
            )}
            <span className="text-xs text-foreground/80">{item.item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeatherCard({ data }: { data: Record<string, unknown> }) {
  const title = data.title as string;
  const days = data.days as Array<{
    day: string;
    condition: string;
    precipitation: string;
    amount: string;
    temp: string;
    alert: boolean;
  }>;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold text-foreground">{title}</p>
      </div>
      <div className="divide-y divide-border/50">
        {days.map((day) => (
          <div
            key={day.day}
            className={`flex items-center justify-between px-4 py-2.5 ${
              day.alert ? "bg-amber-500/5" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold ${
                  day.alert ? "text-amber-400" : "text-foreground"
                }`}
              >
                {day.day}
              </span>
              <span className="text-xs text-muted-foreground">
                {day.condition}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span
                className={
                  day.alert
                    ? "font-semibold text-amber-400"
                    : "text-muted-foreground"
                }
              >
                {day.precipitation} rain
              </span>
              <span className="text-muted-foreground">{day.amount}</span>
              <span className="text-foreground">{day.temp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignPreviewCard({ data }: { data: Record<string, unknown> }) {
  const d = data as {
    title: string;
    options: Array<{
      name: string;
      description: string;
      specs: Array<{ label: string; value: string }>;
    }>;
  };
  return (
    <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/40 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10">
        <p className="text-xs font-semibold text-cyan-400 flex items-center gap-2">
          <Palette className="size-3.5" />
          {d.title}
        </p>
      </div>
      <div className="p-4 space-y-4">
        {d.options.map(
          (
            opt: {
              name: string;
              description: string;
              specs: Array<{ label: string; value: string }>;
            },
            i: number
          ) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-cyan-400" />
                <p className="text-sm font-semibold text-foreground">
                  {opt.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {opt.description}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {opt.specs.map(
                  (s: { label: string; value: string }, j: number) => (
                    <div key={j} className="rounded-lg bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {s.value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )
        )}
      </div>
      {/* Simulated SVG floor plan preview */}
      <div className="mx-4 mb-4 rounded-lg border border-border/40 bg-[#0c1222] p-4 relative overflow-hidden">
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
            AutoCAD 2D
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground font-medium">
            Revit 3D
          </span>
        </div>
        <svg
          viewBox="0 0 480 360"
          className="w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Room outline */}
          <rect
            x="40"
            y="40"
            width="400"
            height="280"
            fill="none"
            stroke="#334155"
            strokeWidth="3"
          />
          {/* Inner walls */}
          <line
            x1="40"
            y1="180"
            x2="120"
            y2="180"
            stroke="#334155"
            strokeWidth="3"
          />

          {/* Base cabinets - south wall */}
          <rect
            x="50"
            y="280"
            width="60"
            height="30"
            rx="2"
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <rect
            x="115"
            y="280"
            width="60"
            height="30"
            rx="2"
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <rect
            x="180"
            y="280"
            width="80"
            height="30"
            rx="2"
            fill="#1e293b"
            stroke="#22d3ee"
            strokeWidth="1.5"
          />
          <text
            x="220"
            y="299"
            textAnchor="middle"
            className="text-[8px]"
            fill="#22d3ee"
          >
            SINK
          </text>
          <rect
            x="265"
            y="280"
            width="60"
            height="30"
            rx="2"
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <rect
            x="330"
            y="280"
            width="60"
            height="30"
            rx="2"
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth="1.5"
          />

          {/* Base cabinets - east wall */}
          <rect
            x="400"
            y="60"
            width="30"
            height="60"
            rx="2"
            fill="#1e293b"
            stroke="#6366f1"
            strokeWidth="1.5"
          />
          <rect
            x="400"
            y="125"
            width="30"
            height="80"
            rx="2"
            fill="#1e293b"
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
          <text
            x="415"
            y="170"
            textAnchor="middle"
            className="text-[8px]"
            fill="#f59e0b"
          >
            RANGE
          </text>
          <rect
            x="400"
            y="210"
            width="30"
            height="60"
            rx="2"
            fill="#1e293b"
            stroke="#a855f7"
            strokeWidth="1.5"
          />
          <text
            x="415"
            y="244"
            textAnchor="middle"
            className="text-[8px]"
            fill="#a855f7"
          >
            PANTRY
          </text>

          {/* Wall cabinets - south (shown as dashed) */}
          <rect
            x="50"
            y="270"
            width="340"
            height="6"
            rx="1"
            fill="#6366f1"
            opacity="0.2"
          />

          {/* Island */}
          <rect
            x="160"
            y="140"
            width="160"
            height="70"
            rx="4"
            fill="#1e293b"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text
            x="240"
            y="175"
            textAnchor="middle"
            className="text-[9px]"
            fill="#94a3b8"
            fontWeight="500"
          >
            ISLAND
          </text>
          <text
            x="240"
            y="188"
            textAnchor="middle"
            className="text-[7px]"
            fill="#64748b"
          >
            42&quot; &times; 84&quot;
          </text>

          {/* Window on north wall */}
          <line
            x1="160"
            y1="40"
            x2="280"
            y2="40"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
          <text
            x="220"
            y="34"
            textAnchor="middle"
            className="text-[7px]"
            fill="#22d3ee"
          >
            WINDOW
          </text>

          {/* Door */}
          <line
            x1="40"
            y1="80"
            x2="40"
            y2="140"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
          <text
            x="28"
            y="114"
            textAnchor="middle"
            className="text-[7px]"
            fill="#22d3ee"
            transform="rotate(-90, 28, 114)"
          >
            DOOR
          </text>

          {/* Dimension lines */}
          <line
            x1="40"
            y1="335"
            x2="440"
            y2="335"
            stroke="#475569"
            strokeWidth="0.5"
          />
          <text
            x="240"
            y="348"
            textAnchor="middle"
            className="text-[8px]"
            fill="#64748b"
          >
            12&apos;-0&quot;
          </text>
          <line
            x1="455"
            y1="40"
            x2="455"
            y2="320"
            stroke="#475569"
            strokeWidth="0.5"
          />
          <text
            x="468"
            y="180"
            textAnchor="middle"
            className="text-[8px]"
            fill="#64748b"
            transform="rotate(90, 468, 180)"
          >
            10&apos;-0&quot;
          </text>

          {/* Work triangle */}
          <line
            x1="220"
            y1="290"
            x2="415"
            y2="165"
            stroke="#f59e0b"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <line
            x1="415"
            y1="165"
            x2="400"
            y2="90"
            stroke="#f59e0b"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <line
            x1="400"
            y1="90"
            x2="220"
            y2="290"
            stroke="#f59e0b"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.5"
          />

          {/* Legend */}
          <rect
            x="50"
            y="52"
            width="8"
            height="8"
            rx="1"
            fill="#6366f1"
            opacity="0.6"
          />
          <text x="63" y="59" className="text-[7px]" fill="#94a3b8">
            Cabinets
          </text>
          <rect
            x="110"
            y="52"
            width="8"
            height="8"
            rx="1"
            fill="#22d3ee"
            opacity="0.6"
          />
          <text x="123" y="59" className="text-[7px]" fill="#94a3b8">
            Fixtures
          </text>
          <rect
            x="170"
            y="52"
            width="8"
            height="8"
            rx="1"
            fill="#f59e0b"
            opacity="0.6"
          />
          <text x="183" y="59" className="text-[7px]" fill="#94a3b8">
            Appliances
          </text>
          <line
            x1="243"
            y1="56"
            x2="263"
            y2="56"
            stroke="#f59e0b"
            strokeWidth="0.75"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <text x="268" y="59" className="text-[7px]" fill="#94a3b8">
            Work Triangle
          </text>
        </svg>
      </div>
    </div>
  );
}

function StatusCard({
  items,
  complete,
}: {
  items: string[];
  complete: boolean;
}) {
  return (
    <div className="mt-3 space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          {complete ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-400" />
          ) : (
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-indigo-400" />
          )}
          <span className="text-sm text-foreground/80">{item}</span>
        </div>
      ))}
      {complete && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 ring-1 ring-green-500/20">
          <CheckCircle2 className="size-3" />
          All actions completed
        </div>
      )}
    </div>
  );
}

function AttachmentChip({ name }: { name: string }) {
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50">
      <div className="flex size-8 items-center justify-center rounded-md bg-red-500/15">
        <FileText className="size-4 text-red-400" />
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">{name}</p>
        <p className="text-[10px] text-muted-foreground">PDF Document</p>
      </div>
    </div>
  );
}

function ActionButtons({ actions }: { actions: ActionButton[] }) {
  const variantStyles: Record<string, string> = {
    primary:
      "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/25 hover:bg-indigo-500/25 hover:ring-indigo-500/40",
    secondary:
      "bg-muted/50 text-foreground/80 ring-1 ring-border hover:bg-muted/80",
    danger:
      "bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20",
  };

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
              variantStyles[action.variant]
            }`}
          >
            {Icon && <Icon className="size-3.5" />}
            {action.label}
          </button>
        );
      })}
    </div>
  );
}

function TypingIndicator({ agentColor }: { agentColor: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ${agentColor}`}
      >
        <Bot className="size-4" />
      </div>
      <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card Renderer
// ---------------------------------------------------------------------------

function renderCard(card: StructuredCard) {
  switch (card.type) {
    case "invoice":
      return <InvoiceCard data={card.data} />;
    case "email":
      return <EmailCard data={card.data} />;
    case "leads":
      return <LeadsCard data={card.data} />;
    case "schedule":
      return <ScheduleCard data={card.data} />;
    case "estimate":
      return <EstimateCard data={card.data} />;
    case "financial":
      return <FinancialCard data={card.data} />;
    case "pnl":
      return <PnlCard data={card.data} />;
    case "dashboard":
      return <DashboardCard data={card.data} />;
    case "message":
      return <MessageCard data={card.data} />;
    case "inspection":
      return <InspectionCard data={card.data} />;
    case "weather":
      return <WeatherCard data={card.data} />;
    case "design-preview":
      return <DesignPreviewCard data={card.data} />;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mock AI Responses (per agent type)
// ---------------------------------------------------------------------------

const mockAgentResponses: Record<string, string[]> = {
  "customer-support": [
    "I've looked into this and found the relevant records. The client's account shows the issue was first reported 3 days ago. I've escalated it to priority status and drafted a follow-up email for your review.",
    "I've checked our CRM and the customer has been with us for 2 years with 4 completed projects. Based on their history, I recommend offering a courtesy discount. Shall I draft the response?",
    "The warranty claim is valid based on our records. I've prepared the documentation and notified the field team. The client will receive a confirmation email within the hour.",
  ],
  "sales-outreach": [
    "I've analyzed the lead and they match our ideal customer profile. Revenue potential is estimated at $180K-$240K. I recommend scheduling a discovery call this week. Want me to draft the outreach email?",
    "I've reviewed the pipeline and identified 3 deals that are likely to close this month, totaling approximately $520K. I've prepared a summary with next steps for each opportunity.",
    "Based on market analysis, this prospect has been evaluating competitors. I suggest a value-first approach highlighting our 98% on-time completion rate. Shall I draft a proposal?",
  ],
  scheduling: [
    "I've found an available crew for that time slot. Mike's team can cover Wednesday if we shift the Riverside job to Thursday morning. This keeps both projects on schedule. Want me to confirm the changes?",
    "I've optimized next week's schedule to minimize travel time between sites. This saves approximately 4.5 crew-hours. The updated schedule is ready for your review.",
    "The subcontractor confirmed availability for Tuesday. I've blocked the time and sent calendar invites to all parties. Equipment delivery is aligned for 7 AM.",
  ],
  estimation: [
    "I've calculated the estimate based on current material costs and labor rates. The total comes to $127,500 with a 12% contingency buffer. I've broken it down by phase for your review.",
    "After analyzing comparable projects in the area, I recommend pricing this at $85/sq ft for the renovation work. This is competitive while maintaining our target margins.",
    "I've updated the estimate with the revised scope. The change order adds $18,200 to the original quote, primarily driven by upgraded fixtures. Shall I generate the client-facing proposal?",
  ],
  bookkeeping: [
    "I've reconciled the accounts and found 3 discrepancies totaling $2,340. Two are duplicate vendor payments and one is a misclassified expense. I've prepared the journal entries for correction.",
    "The monthly P&L report is ready. Revenue is up 12% month-over-month, and expenses are within budget across all categories. I've flagged one line item that needs your attention.",
    "I've processed the invoices and scheduled payments according to terms. Three vendors are eligible for early payment discounts totaling $1,850 in savings. Want me to proceed?",
  ],
  "project-management": [
    "I've reviewed the project timeline and identified a potential 3-day delay on the critical path due to material delivery. I recommend fast-tracking the interior work to compensate. Here's the revised schedule.",
    "The weekly status report is ready. 4 out of 5 active projects are on track. The Harbor View project needs attention — I've outlined the issues and recommended actions.",
    "I've analyzed resource allocation across all active projects. We have capacity for one more medium-sized job starting next month. I've prepared a resource loading chart for your review.",
  ],
  "field-operations": [
    "I've completed the site inspection checklist. 12 of 14 items passed. The two flagged items are related to grading and drainage — I've created work orders for the corrections.",
    "Weather forecast shows rain Thursday through Saturday. I've identified 3 exterior tasks that should be moved up and prepared an adjusted work plan for the affected crews.",
    "Equipment utilization report is ready. The excavator has been idle for 4 days — I recommend reassigning it to the Summit Heights project or returning the rental to save $800/day.",
  ],
};

const defaultMockResponses = [
  "I've processed your request. Based on my analysis, here's what I found — the data looks consistent with recent trends and I've prepared a detailed summary for your review.",
  "I've looked into this and have some recommendations. Let me walk you through the key findings and suggest next steps.",
  "Got it. I've analyzed the information and prepared an action plan. Would you like me to proceed with the implementation or would you prefer to review the details first?",
];

/* ------------------------------------------------------------------ */
/*  K&B Designer: SVG Floor Plan (2D Mock)                             */
/* ------------------------------------------------------------------ */

function FloorPlan2D() {
  // Elevation view — front-facing cabinet drawing (like installation book)
  const ox = 70, oy = 50;

  // Y positions (top to bottom): crown → upper cabs → light rail → backsplash → countertop → base cabs → toe kick → floor
  const yCr = oy;
  const yUT = oy + 8;       // upper cab top
  const yUB = yUT + 84;     // upper cab bottom
  const yLR = yUB + 4;      // light rail
  const yBS = yLR + 50;     // backsplash bottom = countertop top
  const yCT = yBS + 5;      // countertop bottom = base cab top
  const yBB = yCT + 84;     // base cab bottom = toe kick top
  const yFL = yBB + 13;     // floor

  // X positions (left to right): cabinet starts
  const c1 = ox;             // B21 (21" = 59px)
  const c2 = c1 + 59;        // B24 wine (24" = 67px)
  const c3 = c2 + 67;        // Sink B30 (30" = 84px)
  const c4 = c3 + 84;        // DW (24" = 67px)
  const c5 = c4 + 67;        // B30 (30" = 84px)
  const c6 = c5 + 84;        // end of base run
  const c7 = c6 + 14;        // Tall pantry start (36" = 101px)
  const c8 = c7 + 101;       // end

  // Shaker door panel — Cloud White with honey bronze pull
  const SD = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1"
        fill="rgba(245,243,238,0.12)" stroke="rgba(220,215,205,0.45)" strokeWidth="0.7" />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} rx="1"
        fill="rgba(245,243,238,0.06)" stroke="rgba(210,205,195,0.3)" strokeWidth="0.5" />
      <rect x={x + w / 2 - 6} y={y + h - 14} width={12} height={3} rx="1"
        fill="rgba(195,155,70,0.45)" stroke="rgba(195,155,70,0.7)" strokeWidth="0.4" />
    </g>
  );

  // Cabinet number badge (red, like installation book)
  const N = ({ x, y, n }: { x: number; y: number; n: number }) => (
    <g>
      <rect x={x - 8} y={y - 9} width={16} height={16} rx="2"
        fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.5)" strokeWidth="0.8" />
      <text x={x} y={y + 3} fill="rgba(239,68,68,0.9)" fontSize="9" fontWeight="600"
        textAnchor="middle" fontFamily="monospace">{n}</text>
    </g>
  );

  return (
    <svg viewBox="0 0 720 400" className="h-full w-full" style={{ maxHeight: "100%" }}>
      <defs>
        <pattern id="grid-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="0.5" fill="rgba(255,255,255,0.04)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-dots)" />

      {/* ═══ CEILING & FLOOR LINES ═══ */}
      <line x1={c1} y1={oy} x2={c8} y2={oy} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1={c1} y1={yFL} x2={c8} y2={yFL} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* ═══ TOE KICK ═══ */}
      <rect x={c1} y={yBB} width={c6 - c1} height={13} fill="rgba(30,28,25,0.5)" stroke="rgba(100,95,85,0.25)" strokeWidth="0.5" />
      <rect x={c7} y={yBB} width={101} height={13} fill="rgba(30,28,25,0.5)" stroke="rgba(100,95,85,0.25)" strokeWidth="0.5" />

      {/* ═══ BASE CABINETS ═══ */}

      {/* 7 — B21 (Cloud White shaker) */}
      <rect x={c1} y={yCT} width={59} height={84} rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.4)" strokeWidth="1" />
      <SD x={c1 + 3} y={yCT + 3} w={53} h={78} />
      <N x={c1 + 30} y={yBB + 14} n={7} />

      {/* 8 — B24 Wine Cooler (stainless/glass) */}
      <rect x={c2} y={yCT} width={67} height={84} rx="1" fill="rgba(160,165,170,0.08)" stroke="rgba(180,185,190,0.35)" strokeWidth="1" />
      <rect x={c2 + 6} y={yCT + 6} width={55} height={72} rx="2" fill="rgba(140,150,160,0.06)" stroke="rgba(180,185,190,0.2)" strokeWidth="0.5" />
      {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
        <line key={`wr-${i}`} x1={c2 + 10} y1={yCT + 6 + 72 * f} x2={c2 + 57} y2={yCT + 6 + 72 * f} stroke="rgba(180,185,190,0.18)" strokeWidth="0.5" />
      ))}
      <N x={c2 + 34} y={yBB + 14} n={8} />

      {/* 10 — Sink B30 (Cloud White shaker) */}
      <rect x={c3} y={yCT} width={84} height={84} rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.4)" strokeWidth="1" />
      <SD x={c3 + 3} y={yCT + 3} w={36} h={78} />
      <SD x={c3 + 42} y={yCT + 3} w={39} h={78} />
      <N x={c3 + 42} y={yBB + 14} n={10} />

      {/* Faucet profile (brushed nickel — above countertop) */}
      <line x1={c3 + 42} y1={yBS} x2={c3 + 42} y2={yBS - 22} stroke="rgba(190,185,175,0.55)" strokeWidth="1.5" />
      <line x1={c3 + 42} y1={yBS - 22} x2={c3 + 55} y2={yBS - 22} stroke="rgba(190,185,175,0.55)" strokeWidth="1.5" />
      <circle cx={c3 + 55} cy={yBS - 20} r="2" fill="rgba(190,185,175,0.35)" />

      {/* 11 — DW (Dishwasher — stainless steel) */}
      <rect x={c4} y={yCT} width={67} height={84} rx="1" fill="rgba(170,175,180,0.08)" stroke="rgba(180,185,190,0.35)" strokeWidth="1" />
      <rect x={c4 + 5} y={yCT + 5} width={57} height={74} rx="1" fill="none" stroke="rgba(180,185,190,0.2)" strokeWidth="0.5" />
      <line x1={c4 + 10} y1={yCT + 14} x2={c4 + 57} y2={yCT + 14} stroke="rgba(180,185,190,0.2)" strokeWidth="0.5" />
      <rect x={c4 + 22} y={yCT + 6} width={23} height={5} rx="1" fill="none" stroke="rgba(180,185,190,0.22)" strokeWidth="0.5" />
      <N x={c4 + 34} y={yBB + 14} n={11} />

      {/* 13 — B30 (Cloud White shaker) */}
      <rect x={c5} y={yCT} width={84} height={84} rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.4)" strokeWidth="1" />
      <SD x={c5 + 3} y={yCT + 3} w={36} h={78} />
      <SD x={c5 + 42} y={yCT + 3} w={39} h={78} />
      <N x={c5 + 42} y={yBB + 14} n={13} />

      {/* ═══ COUNTERTOP — Quartz Calacatta ═══ */}
      <rect x={c1 - 3} y={yBS} width={c6 - c1 + 6} height={5} fill="rgba(235,228,215,0.22)" stroke="rgba(225,218,205,0.45)" strokeWidth="0.8" />

      {/* ═══ BACKSPLASH — Subway Tile ═══ */}
      <rect x={c1} y={yLR} width={c6 - c1} height={50} fill="rgba(230,225,215,0.06)" stroke="rgba(210,205,195,0.15)" strokeWidth="0.5" />
      {[0.33, 0.66].map((f, i) => (
        <line key={`bs-${i}`} x1={c1 + 3} y1={yLR + 50 * f} x2={c6 - 3} y2={yLR + 50 * f} stroke="rgba(210,205,195,0.1)" strokeWidth="0.4" />
      ))}

      {/* ═══ LIGHT RAIL ═══ */}
      <rect x={c1} y={yUB} width={c6 - c1} height={4} fill="rgba(220,215,205,0.15)" stroke="rgba(210,205,195,0.3)" strokeWidth="0.5" />
      <text x={(c1 + c6) / 2} y={yUB - 3} fill="rgba(200,195,185,0.35)" fontSize="6" textAnchor="middle" fontStyle="italic">Light Rail</text>

      {/* ═══ UPPER CABINETS ═══ */}

      {/* 12 — W2130 (Cloud White shaker upper) */}
      <rect x={c1} y={yUT} width={59} height={84} rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.35)" strokeWidth="1" />
      <SD x={c1 + 3} y={yUT + 3} w={53} h={78} />
      <N x={c1 + 30} y={yUT - 10} n={12} />

      {/* Open shelving — natural wood (over wine + sink) */}
      <rect x={c2} y={yUT} width={c4 - c2} height={84} rx="1" fill="none" stroke="rgba(175,150,120,0.15)" strokeWidth="0.5" strokeDasharray="3 2" />
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={`sh-${i}`} x1={c2 + 4} y1={yUT + 84 * f} x2={c4 - 4} y2={yUT + 84 * f} stroke="rgba(175,150,120,0.35)" strokeWidth="0.8" />
      ))}
      <text x={(c2 + c4) / 2} y={yUT + 46} fill="rgba(175,150,120,0.3)" fontSize="7" textAnchor="middle" fontFamily="monospace">open shelving</text>

      {/* 14 — W3030 (Cloud White shaker upper) */}
      <rect x={c4} y={yUT} width={c6 - c4} height={84} rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.35)" strokeWidth="1" />
      <SD x={c4 + 3} y={yUT + 3} w={(c6 - c4) / 2 - 5} h={78} />
      <SD x={c4 + (c6 - c4) / 2 + 2} y={yUT + 3} w={(c6 - c4) / 2 - 5} h={78} />
      <N x={(c4 + c6) / 2} y={yUT - 10} n={14} />

      {/* ═══ CROWN MOLDING ═══ */}
      <rect x={c1} y={yCr} width={c6 - c1} height={8} fill="rgba(235,230,220,0.1)" stroke="rgba(210,205,195,0.25)" strokeWidth="0.5" />
      <rect x={c7} y={yCr} width={101} height={8} fill="rgba(235,230,220,0.1)" stroke="rgba(210,205,195,0.25)" strokeWidth="0.5" />

      {/* ═══ TALL PANTRY T2496 (Cloud White shaker) ═══ */}
      <rect x={c7} y={yUT} width={101} height={yBB - yUT} rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.4)" strokeWidth="1" />
      <SD x={c7 + 3} y={yUT + 3} w={45} h={yBB - yUT - 6} />
      <SD x={c7 + 51} y={yUT + 3} w={47} h={yBB - yUT - 6} />
      <line x1={c7 + 48} y1={yUT + 4} x2={c7 + 48} y2={yBB - 4} stroke="rgba(210,205,195,0.18)" strokeWidth="0.5" />
      <N x={c7 + 50} y={yUT - 10} n={9} />

      {/* ═══ PENDANT LIGHTS — matte black dome fixtures ═══ */}
      {[c3 + 10, c5 + 20].map((px, i) => (
        <g key={`pnd-${i}`}>
          <line x1={px} y1={oy} x2={px} y2={oy + 30} stroke="rgba(60,55,50,0.5)" strokeWidth="0.8" />
          <path d={`M ${px - 14} ${oy + 42} Q ${px} ${oy + 28} ${px + 14} ${oy + 42}`} fill="rgba(40,38,35,0.45)" stroke="rgba(60,55,50,0.55)" strokeWidth="0.8" />
          <circle cx={px} cy={oy + 40} r="3" fill="rgba(245,210,130,0.3)" stroke="rgba(245,210,130,0.55)" strokeWidth="0.5" />
        </g>
      ))}

      {/* ═══ DIMENSION LINES ═══ */}

      {/* Overall width (top) */}
      <line x1={c1} y1={oy - 20} x2={c8} y2={oy - 20} stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      <line x1={c1} y1={oy - 24} x2={c1} y2={oy - 16} stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
      <line x1={c8} y1={oy - 24} x2={c8} y2={oy - 16} stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />

      {/* Individual cabinet widths */}
      {[[c1, 59, '21"'], [c2, 67, '24"'], [c3, 84, '30"'], [c4, 67, '24"'], [c5, 84, '30"'], [c7, 101, '36"']].map(([x, w, label], i) => (
        <g key={`dim-${i}`}>
          <line x1={x as number} y1={oy - 12} x2={(x as number) + (w as number)} y2={oy - 12} stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" />
          <text x={(x as number) + (w as number) / 2} y={oy - 6} fill="rgba(148,163,184,0.45)" fontSize="7" textAnchor="middle" fontFamily="monospace">{label as string}</text>
        </g>
      ))}

      {/* Height: counter (right side) */}
      <line x1={c8 + 14} y1={yBS} x2={c8 + 14} y2={yFL} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c8 + 10} y1={yBS} x2={c8 + 18} y2={yBS} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c8 + 10} y1={yFL} x2={c8 + 18} y2={yFL} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <text x={c8 + 26} y={(yBS + yFL) / 2 + 3} fill="rgba(148,163,184,0.45)" fontSize="7" fontFamily="monospace">36&quot;</text>

      {/* Height: total (far right) */}
      <line x1={c8 + 38} y1={oy} x2={c8 + 38} y2={yFL} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c8 + 34} y1={oy} x2={c8 + 42} y2={oy} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c8 + 34} y1={yFL} x2={c8 + 42} y2={yFL} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <text x={c8 + 52} y={(oy + yFL) / 2 + 3} fill="rgba(148,163,184,0.45)" fontSize="7" fontFamily="monospace" transform={`rotate(90, ${c8 + 52}, ${(oy + yFL) / 2})`}>96&quot;</text>

      {/* Height: upper cabs (left side) */}
      <line x1={c1 - 14} y1={yUT} x2={c1 - 14} y2={yUB} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c1 - 18} y1={yUT} x2={c1 - 10} y2={yUT} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c1 - 18} y1={yUB} x2={c1 - 10} y2={yUB} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <text x={c1 - 26} y={(yUT + yUB) / 2 + 3} fill="rgba(148,163,184,0.45)" fontSize="7" fontFamily="monospace" transform={`rotate(-90, ${c1 - 26}, ${(yUT + yUB) / 2})`}>30&quot;</text>

      {/* Height: base cabs (left side) */}
      <line x1={c1 - 14} y1={yCT} x2={c1 - 14} y2={yBB} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c1 - 18} y1={yCT} x2={c1 - 10} y2={yCT} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <line x1={c1 - 18} y1={yBB} x2={c1 - 10} y2={yBB} stroke="rgba(148,163,184,0.3)" strokeWidth="0.6" />
      <text x={c1 - 26} y={(yCT + yBB) / 2 + 3} fill="rgba(148,163,184,0.45)" fontSize="7" fontFamily="monospace" transform={`rotate(-90, ${c1 - 26}, ${(yCT + yBB) / 2})`}>30&quot;</text>

      {/* ═══ SPECIFICATIONS CALLOUT ═══ */}
      <g transform={`translate(${c1}, ${yFL + 20})`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600" letterSpacing="0.5">HARDWARE</text>
        <text x={0} y={13} fill="rgba(148,163,184,0.4)" fontSize="7" fontStyle="italic">Top Knob Ascendra Pull, 6-5/16&quot;, Honey Bronze</text>
        <text x={0} y={25} fill="rgba(148,163,184,0.4)" fontSize="7" fontWeight="600">INSTALL AS SHOWN</text>
      </g>
      <g transform={`translate(${c4}, ${yFL + 20})`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600" letterSpacing="0.5">FINISHES</text>
        <text x={0} y={13} fill="rgba(148,163,184,0.4)" fontSize="7">Door: Shaker, Cloud White &bull; Counter: Quartz Calacatta</text>
        <text x={0} y={25} fill="rgba(148,163,184,0.4)" fontSize="7">Backsplash: Subway Tile &bull; Base Depth: 24&quot; &bull; Wall Depth: 12&quot;</text>
      </g>

      {/* Verify note */}
      <text x={c8} y={yFL + 55} fill="rgba(239,68,68,0.45)" fontSize="7" textAnchor="end" fontWeight="600">
        ALL DIMENSIONS ARE FINISHED DIMENSIONS. VERIFY IN FIELD.
      </text>

      {/* ═══ LEGEND ═══ */}
      <g transform={`translate(${c1}, ${yFL + 55})`}>
        <rect x="0" y="0" width="8" height="8" rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.45)" strokeWidth="0.8" />
        <text x="11" y="7" fill="rgba(200,195,185,0.55)" fontSize="7">Base/Tall</text>

        <rect x="60" y="0" width="8" height="8" rx="1" fill="rgba(240,237,230,0.1)" stroke="rgba(210,205,195,0.35)" strokeWidth="0.8" />
        <text x="71" y="7" fill="rgba(200,195,185,0.55)" fontSize="7">Wall</text>

        <rect x="100" y="0" width="8" height="8" rx="1" fill="rgba(170,175,180,0.08)" stroke="rgba(180,185,190,0.4)" strokeWidth="0.8" />
        <text x="111" y="7" fill="rgba(200,195,185,0.55)" fontSize="7">Appliances</text>

        <rect x="172" y="0" width="8" height="8" rx="1" fill="rgba(175,150,120,0.12)" stroke="rgba(175,150,120,0.45)" strokeWidth="0.8" />
        <text x="183" y="7" fill="rgba(200,195,185,0.55)" fontSize="7">Shelving</text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  K&B Designer: 3D Placeholder                                       */
/* ------------------------------------------------------------------ */

function View3DKitchen() {
  const [activeMode, setActiveMode] = useState("Orbit");

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: '#090b10' }}>
      {/* ---------- Photorealistic Kitchen Render ---------- */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/kitchen-3d-render.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }}
      />

      {/* Subtle top/bottom fade for HUD readability only */}
      <div
        className="absolute inset-x-0 top-0 h-10 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(9,11,16,0.45) 0%, transparent 100%)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
        style={{ background: 'linear-gradient(0deg, rgba(9,11,16,0.45) 0%, transparent 100%)' }}
      />

      {/* ---------- HUD Overlays ---------- */}

      {/* Top-left: render status */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-sm">
          REALTIME
        </span>
        <span className="text-[10px] text-white/60">
          PBR &bull; Path Tracing
        </span>
      </div>

      {/* Top-right: resolution & FPS */}
      <div className="absolute top-3 right-3 flex items-center gap-2 text-[10px] text-white/60">
        <span>60 FPS</span>
        <span className="h-3 w-px bg-white/20" />
        <span>1920&times;1080</span>
      </div>

      {/* Material callouts — positioned on actual elements in the image */}
      {/* Countertop: the beige surface running across center of image */}
      <div
        className="absolute flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md"
        style={{ top: '42%', left: '12%' }}
      >
        <div className="h-2 w-2 rounded-full bg-amber-400/80" />
        <span className="text-[10px] font-medium text-white/80">Quartz Calacatta</span>
      </div>

      {/* Shaker Cabinets: the white base cabinets visible on the left */}
      <div
        className="absolute flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md"
        style={{ top: '58%', left: '3%' }}
      >
        <div className="h-2 w-2 rounded-full bg-sky-400/80" />
        <span className="text-[10px] font-medium text-white/80">Shaker — Cloud White</span>
      </div>

      {/* Pendant Lights: the two dark fixtures hanging center-left */}
      <div
        className="absolute flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md"
        style={{ top: '18%', left: '28%' }}
      >
        <div className="h-2 w-2 rounded-full bg-orange-400/80" />
        <span className="text-[10px] font-medium text-white/80">Pendant Fixtures</span>
      </div>

      {/* Tall pantry: the tall white cabinets on the right */}
      <div
        className="absolute flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-md"
        style={{ top: '35%', right: '8%' }}
      >
        <div className="h-2 w-2 rounded-full bg-sky-400/80" />
        <span className="text-[10px] font-medium text-white/80">T2496 Pantry</span>
      </div>

      {/* Bottom-left: camera modes */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        {["Orbit", "Pan", "Zoom", "Walk"].map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium backdrop-blur-sm transition-colors ${
              mode === activeMode
                ? "bg-primary/30 text-primary border border-primary/30"
                : "text-white/50 hover:text-white/80 hover:bg-white/10 border border-transparent"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Bottom-right: engine info */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px] text-white/50">
        <span>Three.js r168</span>
        <span className="h-3 w-px bg-white/20" />
        <span>WebGPU</span>
      </div>
    </div>
  );
}
/* ------------------------------------------------------------------ */
/*  K&B Designer: Mock selected item                                   */
/* ------------------------------------------------------------------ */

const mockSelectedItem = {
  name: "Base Cabinet - B36",
  manufacturer: "KraftMaid",
  sku: "B36-QUAJ-QUMD",
  dimensions: "36\"W x 24\"D x 34.5\"H",
  finish: "Quartersawn Oak - Aged Brandy",
  price: "$842.00",
  category: "Base Cabinet",
};

export default function AgentChatPage() {
  const params = useParams();
  const id = params.id as string;

  // Resolve Plan v3 IDs to legacy data IDs for data lookups
  const dataId = idAliasMap[id] || id;

  // Use v3 canonical name/icon when available, otherwise fall back to legacy
  const agentName = v3NameMap[id] || agentNameMap[id] || "Customer Support Agent";
  const AgentIcon = v3IconMap[id] || agentIconMap[id] || Headset;
  const colors = agentColorMap[dataId] || defaultColor;

  const conversations = conversationsByAgent[dataId] || conversationsByAgent["customer-support"];
  const mockMessages = messagesByAgent[dataId] || messagesByAgent["customer-support"];
  const quickActions = quickActionsByAgent[dataId] || defaultQuickActions;
  const startTime = conversationStartTimes[dataId] || "Today";

  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("conv-1");
  const [isTyping, setIsTyping] = useState(false);

  // Send a message and get a mock AI response
  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: timeStr,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Show typing indicator, then respond
    setIsTyping(true);
    const delay = 1000 + Math.random() * 500; // 1-1.5s
    setTimeout(() => {
      const responses = mockAgentResponses[dataId] || defaultMockResponses;
      const responseText = responses[Math.floor(Math.random() * responses.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: responseText,
        timestamp: replyTime,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, agentMsg]);
    }, delay);
  };
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [canvasTab, setCanvasTab] = useState<"2d" | "3d" | "materials">("2d");
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [snapGrid, setSnapGrid] = useState(true);
  const [units, setUnits] = useState<"in" | "cm">("in");
  const [renderLevel, setRenderLevel] = useState<1 | 2>(1);
  const [showSelected, setShowSelected] = useState(true);
  const [bomOpen, setBomOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  return (
    <div className="flex h-full flex-col bg-background bg-mesh">
      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="glass-strong z-10 pl-14 pr-3 py-2 lg:pl-5 lg:pr-5 lg:py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href={`/dashboard/agents/${id}`}
              className="flex items-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="hidden sm:block h-6 w-px bg-border shrink-0" />

            <div
              className={`hidden sm:flex size-9 items-center justify-center rounded-xl ring-1 shrink-0 ${colors.icon}`}
            >
              <AgentIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-sm font-semibold text-foreground">
                  {agentName}
                </h1>
                <span className="size-2 rounded-full bg-green-400 shrink-0" />
              </div>
              <p className="hidden sm:block text-[11px] text-muted-foreground">
                Avg response: 1.8s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center rounded-lg p-2 text-muted-foreground ring-1 ring-border transition-all hover:bg-muted/30 hover:text-foreground sm:hidden"
              title="History"
            >
              <Clock className="size-4" />
            </button>
            {id === "design-spec-assistant" && (
              <button
                onClick={() => setCanvasOpen(!canvasOpen)}
                className={`inline-flex items-center gap-1.5 rounded-lg p-2 sm:px-3.5 sm:py-2 text-xs font-semibold transition-all ${
                  canvasOpen
                    ? "bg-cyan-500/25 text-cyan-300 ring-1 ring-cyan-400/40"
                    : "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25 hover:bg-cyan-500/25"
                }`}
                title={canvasOpen ? "Close Canvas" : "Open Canvas"}
              >
                <Palette className="size-4" />
                <span className="hidden sm:inline">{canvasOpen ? "Close Canvas" : "Open Canvas"}</span>
              </button>
            )}
            <button
              className="inline-flex items-center rounded-lg bg-indigo-500/15 p-2 sm:gap-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/25 transition-all hover:bg-indigo-500/25"
              title="New Conversation"
            >
              <MessageSquarePlus className="size-4" />
              <span className="hidden sm:inline">New Conversation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Body: Sidebar + Chat */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex min-h-0 flex-1">
        {/* ----- Conversation Sidebar ----- */}
        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`glass-strong flex w-80 shrink-0 flex-col border-r border-border transition-all duration-300 fixed inset-y-0 left-0 z-30 sm:relative sm:z-auto !bg-background sm:!bg-[var(--glass-hover)] ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full sm:translate-x-0"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Conversations
            </h2>
            <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {conversations.length}
            </span>
          </div>

          {/* Search conversations */}
          <div className="px-3 pb-2">
            <div className="relative">
              <Sparkles className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="h-8 w-full rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            <div className="space-y-0.5">
              {conversations.map((conv) => {
                const isActive = conv.id === selectedConversation;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`group w-full rounded-lg px-3 py-3 text-left transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-500/10 ring-1 ring-indigo-500/20"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          isActive
                            ? "text-foreground"
                            : "text-foreground/80 group-hover:text-foreground"
                        }`}
                      >
                        {conv.title}
                      </p>
                      <span className="mt-0.5 shrink-0 text-[10px] text-muted-foreground/60">
                        {conv.messageCount}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground/70">
                      {conv.preview}
                    </p>
                    <p className="mt-1.5 text-[10px] text-muted-foreground/50">
                      {conv.date}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ----- Main Chat Area ----- */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {/* Conversation start marker */}
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-medium text-muted-foreground/50">
                  {startTime}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {messages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end gap-3">
                      <div className="max-w-[85%] space-y-1">
                        <div className="rounded-2xl rounded-tr-md bg-indigo-500/15 px-4 py-3 ring-1 ring-indigo-500/20">
                          <p className="text-sm leading-relaxed text-foreground">
                            {msg.content}
                          </p>
                        </div>
                        <p className="text-right text-[10px] text-muted-foreground/50">
                          {msg.timestamp}
                        </p>
                      </div>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                        JW
                      </div>
                    </div>
                  );
                }

                // Agent message
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ${colors.icon}`}
                    >
                      <Bot className="size-4" />
                    </div>
                    <div className="max-w-[85%] space-y-1">
                      <div
                        className={`glass rounded-2xl rounded-tl-md px-4 py-3 ${colors.bubble}`}
                      >
                        <p className="text-sm leading-relaxed text-foreground/90">
                          {msg.content}
                        </p>

                        {/* Structured cards */}
                        {msg.card && renderCard(msg.card)}

                        {/* Status items */}
                        {msg.statusItems && (
                          <StatusCard
                            items={msg.statusItems}
                            complete={msg.statusComplete ?? false}
                          />
                        )}

                        {/* File attachment */}
                        {msg.attachment && (
                          <AttachmentChip name={msg.attachment.name} />
                        )}

                        {/* Action buttons */}
                        {msg.actions && <ActionButtons actions={msg.actions} />}
                      </div>
                      <p className="text-[10px] text-muted-foreground/50">
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && <TypingIndicator agentColor={colors.icon} />}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Input Area */}
          {/* ----------------------------------------------------------------- */}
          <div className="border-t border-border bg-background/80 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              {/* Quick action chips */}
              <div className="mb-3 flex gap-2 overflow-x-auto sm:flex-wrap">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-150 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400"
                    >
                      <Icon className="size-3" />
                      {action.label}
                    </button>
                  );
                })}
              </div>

              {/* Text input */}
              <div className="glass glow-primary relative rounded-xl transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/30">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask the agent..."
                  rows={1}
                  className="block w-full resize-none bg-transparent px-4 py-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <button className="flex size-10 sm:size-8 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted/30 hover:text-muted-foreground">
                    <Paperclip className="size-4" />
                  </button>
                  <button
                    disabled={!inputValue.trim() || isTyping}
                    onClick={handleSend}
                    className={`flex size-10 sm:size-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      inputValue.trim() && !isTyping
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600"
                        : "bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                </div>
              </div>

              {/* Subtle hint */}
              <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
                Press Enter to send. Shift + Enter for new line. Agent actions
                require your approval before executing.
              </p>
            </div>
          </div>
        </div>

        {/* ----- Design Canvas Panel ----- */}
        {canvasOpen && id === "design-spec-assistant" && (
          <div
            className={`flex flex-col border-l transition-all duration-300 ${canvasFullscreen ? "fixed inset-0 z-50" : "fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto lg:w-[55%] lg:shrink-0"}`}
            style={{
              backgroundColor: '#080e1a',
              color: '#e8eaf0',
              '--background': '#0a0e1a',
              '--foreground': '#e8eaf0',
              '--card': 'rgba(255,255,255,0.05)',
              '--card-foreground': '#e8eaf0',
              '--popover': '#151d2e',
              '--popover-foreground': '#e8eaf0',
              '--muted': 'rgba(255,255,255,0.06)',
              '--muted-foreground': '#64748b',
              '--border': 'rgba(255,255,255,0.08)',
              '--input': 'rgba(255,255,255,0.1)',
              '--glass': 'rgba(255,255,255,0.05)',
              '--glass-border': 'rgba(255,255,255,0.1)',
              '--glass-hover': 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.08)',
            } as React.CSSProperties}
          >
            {/* ============================================================= */}
            {/* K&B DESIGNER VIEWPORT                                          */}
            {/* ============================================================= */}
            {/* Top toolbar */}
            <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-3 py-2">
              {/* View toggle */}
              <div className="glass flex items-center gap-0.5 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("2d")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === "2d"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    viewMode === "3d"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  3D
                </button>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Zoom controls */}
              <Button variant="ghost" size="icon-sm" title="Zoom in" onClick={() => toast("Zoomed in")}>
                <ZoomIn className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" title="Zoom out" onClick={() => toast("Zoomed out")}>
                <ZoomOut className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" title="Fit to view" onClick={() => toast("Fit to view")}>
                <Maximize2 className="size-4" />
              </Button>

              <div className="h-4 w-px bg-border" />

              {/* Undo / Redo */}
              <Button variant="ghost" size="icon-sm" title="Undo" onClick={() => toast("Undo")}>
                <Undo2 className="size-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" title="Redo" onClick={() => toast("Redo")}>
                <Redo2 className="size-4" />
              </Button>

              <div className="h-4 w-px bg-border" />

              {/* Snap-to-grid */}
              <button
                onClick={() => setSnapGrid(!snapGrid)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                  snapGrid
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Snap to grid"
              >
                <Grid3X3 className="size-3.5" />
                Snap
              </button>

              {/* Units */}
              <button
                onClick={() => setUnits(units === "in" ? "cm" : "in")}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                title="Toggle units"
              >
                <Ruler className="size-3.5" />
                {units === "in" ? "inches" : "cm"}
              </button>

              <div className="flex-1" />

              {/* Render quality */}
              <div className="glass flex items-center gap-0.5 rounded-lg p-0.5">
                <button
                  onClick={() => setRenderLevel(1)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                    renderLevel === 1
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="mr-1 inline size-3" />
                  Level 1
                </button>
                <button
                  onClick={() => setRenderLevel(2)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                    renderLevel === 2
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Camera className="mr-1 inline size-3" />
                  Level 2
                </button>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Fullscreen / Close */}
              <Button variant="ghost" size="icon-sm" title={canvasFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => setCanvasFullscreen(!canvasFullscreen)}>
                {canvasFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </Button>
              <Button variant="ghost" size="icon-sm" title="Close canvas" onClick={() => { setCanvasOpen(false); setCanvasFullscreen(false); }}>
                <X className="size-4" />
              </Button>
            </div>

            {/* Canvas + Properties row */}
            <div className="flex flex-1 overflow-hidden">
              {/* Canvas area */}
              <div
                className="flex-1 overflow-hidden"
                style={{
                  background: "#0d1117",
                  backgroundImage:
                    "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {viewMode === "2d" ? <FloorPlan2D /> : <View3DKitchen />}
              </div>

              {/* Right properties panel */}
              <div className="w-full sm:w-72 shrink-0 overflow-y-auto border-t sm:border-t-0 sm:border-l border-border bg-[var(--background)] max-h-[40vh] sm:max-h-none">
                {showSelected ? (
                  /* Selected item properties */
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Properties</h3>
                      <button
                        onClick={() => setShowSelected(false)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>

                    {/* Category badge */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400">
                      {mockSelectedItem.category}
                    </span>

                    {/* Name */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Name
                      </label>
                      <p className="text-sm font-medium text-foreground">{mockSelectedItem.name}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      {[
                        { label: "Manufacturer", value: mockSelectedItem.manufacturer },
                        { label: "SKU", value: mockSelectedItem.sku, mono: true },
                        { label: "Dimensions", value: mockSelectedItem.dimensions },
                        { label: "Finish", value: mockSelectedItem.finish },
                        { label: "Price", value: mockSelectedItem.price, highlight: true },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                            {field.label}
                          </label>
                          <p
                            className={`text-sm ${
                              field.highlight
                                ? "font-semibold text-green-400"
                                : field.mono
                                  ? "font-mono text-xs text-muted-foreground"
                                  : "text-foreground"
                            }`}
                          >
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-border" />

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full gap-2 text-xs"
                        onClick={() => toast.success("Opening product swap dialog")}
                      >
                        <RefreshCw className="size-3.5" />
                        Swap Product
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full gap-2 text-xs"
                        onClick={() => {
                          toast.success("Item removed from design");
                          setShowSelected(false);
                        }}
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Design summary (nothing selected) */
                  <div className="p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Design Summary</h3>

                    {/* Room dimensions */}
                    <div className="glass rounded-lg p-3">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Room Dimensions
                      </label>
                      <p className="text-sm font-medium text-foreground mt-0.5">
                        12&apos;-0&quot; x 14&apos;-0&quot; (168 sq ft)
                      </p>
                    </div>

                    {/* Item counts */}
                    <div className="glass rounded-lg p-3 space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Items by Category
                      </label>
                      {[
                        { cat: "Base Cabinets", count: 5, color: "bg-blue-400" },
                        { cat: "Wall Cabinets", count: 4, color: "bg-indigo-400" },
                        { cat: "Tall Cabinets", count: 1, color: "bg-violet-400" },
                        { cat: "Appliances", count: 4, color: "bg-amber-400" },
                        { cat: "Fixtures", count: 2, color: "bg-cyan-400" },
                        { cat: "Lighting", count: 1, color: "bg-yellow-400" },
                      ].map((item) => (
                        <div key={item.cat} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-full ${item.color}`} />
                            <span className="text-muted-foreground">{item.cat}</span>
                          </div>
                          <span className="font-medium text-foreground">{item.count}</span>
                        </div>
                      ))}
                    </div>

                    {/* Material cost */}
                    <div className="glass rounded-lg p-3">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        Material Cost Estimate
                      </label>
                      <p className="text-lg font-bold text-foreground mt-0.5">$24,350</p>
                    </div>

                    {/* NKBA Compliance */}
                    <div className="glass rounded-lg p-3 space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                        NKBA Compliance
                      </label>
                      {[
                        { rule: "Work Triangle", pass: true },
                        { rule: "Clearances", pass: true },
                        { rule: "Landing Zones", pass: true },
                        { rule: "Ventilation", pass: true },
                        { rule: "Door Clearance", pass: true },
                        { rule: "Counter Heights", pass: true },
                      ].map((item) => (
                        <div key={item.rule} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{item.rule}</span>
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              item.pass ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            <Check className="size-3" />
                            Pass
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Select prompt */}
                    <p className="text-center text-xs text-muted-foreground/50 italic">
                      Click an item in the viewport to see its properties
                    </p>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-xs"
                      onClick={() => setShowSelected(true)}
                    >
                      <Eye className="size-3.5" />
                      Select B36 Cabinet (demo)
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-4 border-t border-border bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground">
              <span className="hidden sm:inline font-mono">12&apos;-0&quot; x 14&apos;-0&quot; | 168 sq ft</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                <Check className="size-3" />
                NKBA Compliant
              </span>
              <span>15 items | $24,350 material cost</span>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Exported as DXF")}
                  className="rounded-md bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Export DXF
                </button>
                <button
                  onClick={() => toast.success("Exported as RVT")}
                  className="rounded-md bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Export RVT
                </button>
                <button
                  onClick={() => setBomOpen(true)}
                  className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary/30 transition-colors"
                >
                  Generate Estimate
                </button>
              </div>
              <span className="hidden sm:inline font-medium text-foreground/60">Design v3 (3 AI iterations)</span>
            </div>
          </div>
        )}
      </div>
      <BomPreview open={bomOpen} onOpenChange={setBomOpen} />
    </div>
  );
}
