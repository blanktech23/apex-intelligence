"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Headset,
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
  Palette,
  Paperclip,
  PenLine,
  Ruler,
  RotateCcw,
  RotateCw,
  Sparkles,
  Square,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";

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
  "design-spec-assistant": "field-operations",
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

  const [messages] = useState<ChatMessage[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("conv-1");
  const [isTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [canvasTab, setCanvasTab] = useState<"2d" | "3d" | "materials">("2d");
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
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
      <div className="glass-strong z-10 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/agents/${id}`}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-3">
            <div
              className={`flex size-9 items-center justify-center rounded-xl ring-1 ${colors.icon}`}
            >
              <AgentIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-foreground">
                  {agentName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                  <span className="size-1.5 rounded-full bg-green-400" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Avg response: 1.8s
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition-all hover:bg-muted/30 hover:text-foreground sm:hidden"
          >
            <Clock className="size-3.5" />
            History
          </button>
          {id === "design-spec-assistant" && (
            <button
              onClick={() => setCanvasOpen(!canvasOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${
                canvasOpen
                  ? "bg-cyan-500/25 text-cyan-300 ring-1 ring-cyan-400/40"
                  : "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/25 hover:bg-cyan-500/25"
              }`}
            >
              <Palette className="size-3.5" />
              {canvasOpen ? "Close Canvas" : "Open Canvas"}
            </button>
          )}
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/15 px-3.5 py-2 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/25 transition-all hover:bg-indigo-500/25">
            <MessageSquarePlus className="size-3.5" />
            New Conversation
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Body: Sidebar + Chat */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex min-h-0 flex-1">
        {/* ----- Conversation Sidebar ----- */}
        <aside
          className={`glass-strong flex w-80 shrink-0 flex-col border-r border-border transition-all duration-300 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full absolute inset-y-0 left-0 z-20 sm:relative sm:translate-x-0"
          } hidden sm:flex`}
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
          <div className="border-t border-border bg-background/80 px-4 pb-4 pt-3 backdrop-blur-sm sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              {/* Quick action chips */}
              <div className="mb-3 flex flex-wrap gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all duration-150 hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-400"
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
                    }
                  }}
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                  <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/50 transition-colors hover:bg-muted/30 hover:text-muted-foreground">
                    <Paperclip className="size-4" />
                  </button>
                  <button
                    disabled={!inputValue.trim()}
                    className={`flex size-8 items-center justify-center rounded-lg transition-all duration-200 ${
                      inputValue.trim()
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
          <div className={`flex flex-col border-l border-border bg-[#080e1a] transition-all duration-300 ${canvasFullscreen ? "fixed inset-0 z-50" : "w-[55%] shrink-0"}`}>
            {/* ============================================================= */}
            {/* AUTOCAD 2D TAB — Realistic AutoCAD Web Viewer                  */}
            {/* ============================================================= */}
            {canvasTab === "2d" && (
              <>
                {/* AutoCAD-style ribbon toolbar */}
                <div className="flex items-center border-b border-[#3a3a3a] bg-[#2d2d2d]">
                  {/* File tab */}
                  <div className="flex items-center border-r border-[#3a3a3a]">
                    <button className="px-3 py-1.5 text-[10px] font-medium text-[#e8e8e8] bg-[#3574f0] hover:bg-[#4a82f0]">File</button>
                  </div>
                  {/* Ribbon tabs */}
                  {["Home", "Insert", "Annotate", "View"].map((t, i) => (
                    <button key={t} className={`px-3 py-1.5 text-[10px] font-medium transition-colors ${i === 0 ? "text-white bg-[#383838] border-b-2 border-[#3574f0]" : "text-[#b0b0b0] hover:text-white hover:bg-[#383838]"}`}>{t}</button>
                  ))}
                  <div className="flex-1" />
                  <div className="flex items-center gap-1 px-2">
                    <button onClick={() => setCanvasFullscreen(!canvasFullscreen)} className="flex size-6 items-center justify-center rounded text-[#909090] hover:text-white hover:bg-[#484848]">
                      {canvasFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
                    </button>
                    <button onClick={() => { setCanvasOpen(false); setCanvasFullscreen(false); }} className="flex size-6 items-center justify-center rounded text-[#909090] hover:text-white hover:bg-[#c42b1c]">
                      <X className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Ribbon panel — Draw / Modify / Layers / Annotation */}
                <div className="flex items-end border-b border-[#3a3a3a] bg-[#383838] px-1 py-1 gap-px">
                  {/* Draw group */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5">
                      {[
                        { label: "Line", path: "M4 18L18 4" },
                        { label: "Polyline", path: "M4 18L10 6L14 14L20 4" },
                        { label: "Rectangle", path: "M5 5h14v10H5z" },
                        { label: "Circle", path: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" },
                        { label: "Arc", path: "M5 17A8 8 0 0 1 19 17" },
                      ].map((tool) => (
                        <button key={tool.label} title={tool.label} className="flex size-7 items-center justify-center rounded hover:bg-[#4a4a4a] text-[#c0c0c0] hover:text-white">
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={tool.path} /></svg>
                        </button>
                      ))}
                    </div>
                    <span className="text-[8px] text-[#808080] pb-0.5">Draw</span>
                  </div>
                  <div className="w-px h-8 bg-[#4a4a4a] mx-0.5" />
                  {/* Modify group */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5">
                      {[
                        { label: "Move", icon: Move },
                        { label: "Copy", icon: Square },
                        { label: "Rotate", icon: RotateCw },
                        { label: "Trim", icon: X },
                      ].map((tool) => (
                        <button key={tool.label} title={tool.label} className="flex size-7 items-center justify-center rounded hover:bg-[#4a4a4a] text-[#c0c0c0] hover:text-white">
                          <tool.icon className="size-3.5" />
                        </button>
                      ))}
                    </div>
                    <span className="text-[8px] text-[#808080] pb-0.5">Modify</span>
                  </div>
                  <div className="w-px h-8 bg-[#4a4a4a] mx-0.5" />
                  {/* Layers group */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 px-1.5 py-0.5">
                      <select className="h-6 rounded bg-[#2d2d2d] border border-[#555] text-[9px] text-[#e0e0e0] px-1 pr-4 appearance-none">
                        <option>0 — Default</option>
                        <option>A-WALL</option>
                        <option>A-FLOR-FIXT</option>
                        <option>A-FLOR-CASE</option>
                        <option>A-FLOR-APPL</option>
                        <option>A-ANNO-DIMS</option>
                      </select>
                      <button title="Layer Properties" className="flex size-7 items-center justify-center rounded hover:bg-[#4a4a4a] text-[#c0c0c0] hover:text-white">
                        <Layers className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-[8px] text-[#808080] pb-0.5">Layers</span>
                  </div>
                  <div className="w-px h-8 bg-[#4a4a4a] mx-0.5" />
                  {/* Annotation group */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-0.5 px-1.5 py-0.5">
                      <button title="Linear Dimension" className="flex size-7 items-center justify-center rounded hover:bg-[#4a4a4a] text-[#c0c0c0] hover:text-white">
                        <Ruler className="size-3.5" />
                      </button>
                      <button title="Text" className="flex size-7 items-center justify-center rounded hover:bg-[#4a4a4a] text-[#c0c0c0] hover:text-white">
                        <PenLine className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-[8px] text-[#808080] pb-0.5">Annotate</span>
                  </div>
                </div>

                {/* Main viewport area */}
                <div className="flex-1 relative overflow-hidden flex">
                  {/* Layer panel (collapsible side) */}
                  <div className="w-44 shrink-0 border-r border-[#3a3a3a] bg-[#2d2d2d] flex flex-col text-[10px]">
                    <div className="px-2 py-1.5 border-b border-[#3a3a3a] text-[9px] font-semibold text-[#b0b0b0] uppercase tracking-wider">Layers</div>
                    <div className="flex-1 overflow-y-auto">
                      {[
                        { name: "A-WALL", color: "#ffffff", on: true, items: 12 },
                        { name: "A-FLOR-CASE", color: "#00ff00", on: true, items: 18 },
                        { name: "A-FLOR-FIXT", color: "#00ffff", on: true, items: 6 },
                        { name: "A-FLOR-APPL", color: "#ffff00", on: true, items: 4 },
                        { name: "A-FLOR-STOR", color: "#ff00ff", on: true, items: 2 },
                        { name: "A-ANNO-DIMS", color: "#ff0000", on: true, items: 8 },
                        { name: "A-ANNO-NOTE", color: "#ff0000", on: true, items: 3 },
                        { name: "A-DOOR", color: "#00ffff", on: true, items: 1 },
                        { name: "A-GLAZ", color: "#00ffff", on: true, items: 1 },
                        { name: "A-WORK-TRI", color: "#ffff00", on: false, items: 3 },
                      ].map((layer) => (
                        <div key={layer.name} className="flex items-center gap-1.5 px-2 py-1 hover:bg-[#383838] cursor-pointer">
                          <div className="size-2.5 rounded-sm border border-[#555]" style={{ backgroundColor: layer.on ? layer.color : "transparent" }} />
                          <span className={`flex-1 truncate ${layer.on ? "text-[#d0d0d0]" : "text-[#606060]"}`} style={{ fontFamily: "monospace" }}>{layer.name}</span>
                          <span className="text-[8px] text-[#606060]">{layer.items}</span>
                        </div>
                      ))}
                    </div>
                    {/* Properties panel */}
                    <div className="border-t border-[#3a3a3a]">
                      <div className="px-2 py-1.5 border-b border-[#3a3a3a] text-[9px] font-semibold text-[#b0b0b0] uppercase tracking-wider">Properties</div>
                      <div className="p-2 space-y-1">
                        <div className="flex justify-between"><span className="text-[#808080]">Color</span><span className="text-[#d0d0d0]">ByLayer</span></div>
                        <div className="flex justify-between"><span className="text-[#808080]">Linetype</span><span className="text-[#d0d0d0]">Continuous</span></div>
                        <div className="flex justify-between"><span className="text-[#808080]">Lineweight</span><span className="text-[#d0d0d0]">0.30 mm</span></div>
                        <div className="flex justify-between"><span className="text-[#808080]">Scale</span><span className="text-[#d0d0d0]">1/4&quot; = 1&apos;-0&quot;</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Drawing canvas — true black like AutoCAD */}
                  <div className="flex-1 relative bg-black">
                    {/* Crosshair cursor overlay */}
                    <div className="absolute inset-0 cursor-crosshair">
                      {/* Grid */}
                      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="acad-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                            <circle cx="12" cy="12" r="0.4" fill="#1a2a1a" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#acad-grid)" />
                      </svg>

                      {/* The architectural floor plan — AutoCAD style */}
                      <svg viewBox="0 0 600 450" className="absolute inset-0 w-full h-full p-4" xmlns="http://www.w3.org/2000/svg">
                        {/* === WALLS (white, heavy lineweight — Layer A-WALL) === */}
                        {/* Outer walls */}
                        <rect x="80" y="60" width="440" height="310" fill="none" stroke="#ffffff" strokeWidth="3.5" />
                        {/* Wall fills (poche) — hatched */}
                        <rect x="80" y="60" width="440" height="6" fill="#2a2a2a" />
                        <rect x="80" y="364" width="440" height="6" fill="#2a2a2a" />
                        <rect x="80" y="60" width="6" height="310" fill="#2a2a2a" />
                        <rect x="514" y="60" width="6" height="310" fill="#2a2a2a" />
                        {/* Interior wall stub */}
                        <line x1="80" y1="220" x2="155" y2="220" stroke="#ffffff" strokeWidth="3.5" />
                        <rect x="80" y="218" width="75" height="6" fill="#2a2a2a" />

                        {/* === DOOR (cyan — Layer A-DOOR) === */}
                        {/* Door opening */}
                        <line x1="80" y1="110" x2="80" y2="190" stroke="black" strokeWidth="4" />
                        <line x1="80" y1="110" x2="80" y2="190" stroke="#00ffff" strokeWidth="1" />
                        {/* Door swing arc */}
                        <path d="M 80 110 A 80 80 0 0 0 80 190" fill="none" stroke="#00ffff" strokeWidth="0.6" strokeDasharray="4 2" transform="translate(-1,0)" />
                        {/* Door leaf */}
                        <line x1="80" y1="110" x2="60" y2="150" stroke="#00ffff" strokeWidth="0.8" />

                        {/* === WINDOW (cyan — Layer A-GLAZ) === */}
                        {/* Window on north wall - architectural convention: 3 parallel lines */}
                        <line x1="200" y1="60" x2="340" y2="60" stroke="black" strokeWidth="4" />
                        <line x1="200" y1="57" x2="340" y2="57" stroke="#00ffff" strokeWidth="0.7" />
                        <line x1="200" y1="60" x2="340" y2="60" stroke="#00ffff" strokeWidth="0.7" />
                        <line x1="200" y1="63" x2="340" y2="63" stroke="#00ffff" strokeWidth="0.7" />

                        {/* === BASE CABINETS — south wall (green — Layer A-FLOR-CASE) === */}
                        {/* 24" deep base cabs */}
                        <rect x="95" y="330" width="55" height="30" fill="none" stroke="#00ff00" strokeWidth="0.8" />
                        <line x1="95" y1="330" x2="150" y2="360" stroke="#00ff00" strokeWidth="0.3" opacity="0.4" />
                        <rect x="152" y="330" width="55" height="30" fill="none" stroke="#00ff00" strokeWidth="0.8" />
                        <line x1="152" y1="330" x2="207" y2="360" stroke="#00ff00" strokeWidth="0.3" opacity="0.4" />
                        {/* Sink cabinet */}
                        <rect x="209" y="330" width="80" height="30" fill="none" stroke="#00ffff" strokeWidth="0.8" />
                        {/* Sink basin — double oval */}
                        <ellipse cx="235" cy="347" rx="10" ry="7" fill="none" stroke="#00ffff" strokeWidth="0.6" />
                        <ellipse cx="263" cy="347" rx="10" ry="7" fill="none" stroke="#00ffff" strokeWidth="0.6" />
                        {/* Faucet dot */}
                        <circle cx="249" cy="335" r="1.5" fill="#00ffff" />
                        <rect x="291" y="330" width="55" height="30" fill="none" stroke="#00ff00" strokeWidth="0.8" />
                        <line x1="291" y1="330" x2="346" y2="360" stroke="#00ff00" strokeWidth="0.3" opacity="0.4" />
                        <rect x="348" y="330" width="55" height="30" fill="none" stroke="#00ff00" strokeWidth="0.8" />
                        <line x1="348" y1="330" x2="403" y2="360" stroke="#00ff00" strokeWidth="0.3" opacity="0.4" />
                        {/* DW = dishwasher */}
                        <rect x="405" y="330" width="45" height="30" fill="none" stroke="#00ffff" strokeWidth="0.8" />
                        <text x="427" y="349" textAnchor="middle" fontSize="7" fill="#00ffff" fontFamily="monospace">DW</text>

                        {/* === UPPER CABINETS — south wall (green dashed) === */}
                        <rect x="95" y="323" width="358" height="5" fill="none" stroke="#00ff00" strokeWidth="0.5" strokeDasharray="3 2" />

                        {/* === CABINETS — east wall === */}
                        <rect x="480" y="80" width="30" height="55" fill="none" stroke="#00ff00" strokeWidth="0.8" />
                        <line x1="480" y1="80" x2="510" y2="135" stroke="#00ff00" strokeWidth="0.3" opacity="0.4" />
                        {/* Range/Cooktop (yellow — Layer A-FLOR-APPL) */}
                        <rect x="480" y="140" width="30" height="65" fill="none" stroke="#ffff00" strokeWidth="0.8" />
                        {/* 4 burner circles */}
                        <circle cx="492" cy="155" r="5" fill="none" stroke="#ffff00" strokeWidth="0.5" />
                        <circle cx="505" cy="155" r="5" fill="none" stroke="#ffff00" strokeWidth="0.5" />
                        <circle cx="492" cy="175" r="6" fill="none" stroke="#ffff00" strokeWidth="0.5" />
                        <circle cx="505" cy="175" r="4" fill="none" stroke="#ffff00" strokeWidth="0.5" />
                        <circle cx="492" cy="155" r="1" fill="#ffff00" opacity="0.4" />
                        <circle cx="505" cy="155" r="1" fill="#ffff00" opacity="0.4" />
                        <circle cx="492" cy="175" r="1" fill="#ffff00" opacity="0.4" />
                        <circle cx="505" cy="175" r="1" fill="#ffff00" opacity="0.4" />
                        {/* Refrigerator (yellow) */}
                        <rect x="480" y="210" width="30" height="50" fill="none" stroke="#ffff00" strokeWidth="0.8" />
                        <line x1="480" y1="210" x2="510" y2="260" stroke="#ffff00" strokeWidth="0.4" />
                        <line x1="510" y1="210" x2="480" y2="260" stroke="#ffff00" strokeWidth="0.4" />
                        <text x="495" y="238" textAnchor="middle" fontSize="6" fill="#ffff00" fontFamily="monospace">REF</text>
                        {/* Pantry (magenta — Layer A-FLOR-STOR) */}
                        <rect x="480" y="265" width="30" height="55" fill="none" stroke="#ff00ff" strokeWidth="0.8" />
                        <text x="495" y="296" textAnchor="middle" fontSize="6" fill="#ff00ff" fontFamily="monospace">PANTRY</text>

                        {/* === ISLAND (cyan dashed — Layer A-FLOR-FIXT) === */}
                        <rect x="195" y="175" width="175" height="70" fill="none" stroke="#00ffff" strokeWidth="0.8" strokeDasharray="5 3" />
                        <text x="282" y="213" textAnchor="middle" fontSize="8" fill="#808080" fontFamily="monospace">ISLAND</text>
                        <text x="282" y="225" textAnchor="middle" fontSize="6" fill="#606060" fontFamily="monospace">42&quot; x 84&quot;</text>
                        {/* Bar seating lines on north side */}
                        <line x1="210" y1="172" x2="210" y2="168" stroke="#00ffff" strokeWidth="0.4" />
                        <line x1="240" y1="172" x2="240" y2="168" stroke="#00ffff" strokeWidth="0.4" />
                        <line x1="270" y1="172" x2="270" y2="168" stroke="#00ffff" strokeWidth="0.4" />
                        <line x1="300" y1="172" x2="300" y2="168" stroke="#00ffff" strokeWidth="0.4" />
                        <line x1="330" y1="172" x2="330" y2="168" stroke="#00ffff" strokeWidth="0.4" />
                        <line x1="355" y1="172" x2="355" y2="168" stroke="#00ffff" strokeWidth="0.4" />

                        {/* === DIMENSION LINES (red — Layer A-ANNO-DIMS) === */}
                        {/* Bottom dimension — overall width */}
                        <line x1="80" y1="395" x2="80" y2="385" stroke="#ff0000" strokeWidth="0.4" />
                        <line x1="520" y1="395" x2="520" y2="385" stroke="#ff0000" strokeWidth="0.4" />
                        <line x1="80" y1="390" x2="520" y2="390" stroke="#ff0000" strokeWidth="0.4" />
                        {/* Arrowheads */}
                        <polygon points="80,390 86,388 86,392" fill="#ff0000" />
                        <polygon points="520,390 514,388 514,392" fill="#ff0000" />
                        <text x="300" y="388" textAnchor="middle" fontSize="8" fill="#ff0000" fontFamily="monospace">14&apos;-6&quot;</text>

                        {/* Right dimension — overall height */}
                        <line x1="540" y1="60" x2="548" y2="60" stroke="#ff0000" strokeWidth="0.4" />
                        <line x1="540" y1="370" x2="548" y2="370" stroke="#ff0000" strokeWidth="0.4" />
                        <line x1="545" y1="60" x2="545" y2="370" stroke="#ff0000" strokeWidth="0.4" />
                        <polygon points="545,60 543,66 547,66" fill="#ff0000" />
                        <polygon points="545,370 543,364 547,364" fill="#ff0000" />
                        <text x="555" y="218" textAnchor="middle" fontSize="8" fill="#ff0000" fontFamily="monospace" transform="rotate(90, 555, 218)">12&apos;-0&quot;</text>

                        {/* Interior dimension — sink to range */}
                        <line x1="249" y1="330" x2="249" y2="298" stroke="#ff0000" strokeWidth="0.3" />
                        <line x1="480" y1="165" x2="456" y2="165" stroke="#ff0000" strokeWidth="0.3" />
                        <line x1="249" y1="300" x2="458" y2="165" stroke="#ff0000" strokeWidth="0.3" strokeDasharray="2 1" />
                        <text x="360" y="224" textAnchor="middle" fontSize="7" fill="#ff0000" fontFamily="monospace" transform="rotate(-30, 360, 224)">8&apos;-3&quot;</text>

                        {/* Cabinet run dimension */}
                        <line x1="95" y1="375" x2="453" y2="375" stroke="#ff0000" strokeWidth="0.3" />
                        <line x1="95" y1="370" x2="95" y2="378" stroke="#ff0000" strokeWidth="0.3" />
                        <line x1="453" y1="370" x2="453" y2="378" stroke="#ff0000" strokeWidth="0.3" />
                        <polygon points="95,375 100,373 100,377" fill="#ff0000" />
                        <polygon points="453,375 448,373 448,377" fill="#ff0000" />
                        <text x="274" y="373" textAnchor="middle" fontSize="7" fill="#ff0000" fontFamily="monospace">11&apos;-10&quot;</text>

                        {/* === WORK TRIANGLE (yellow dashed) === */}
                        <line x1="249" y1="345" x2="495" y2="165" stroke="#ffff00" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />
                        <line x1="495" y1="165" x2="495" y2="235" stroke="#ffff00" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />
                        <line x1="495" y1="235" x2="249" y2="345" stroke="#ffff00" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.3" />

                        {/* === ANNOTATIONS (red — Layer A-ANNO-NOTE) === */}
                        <text x="249" y="322" textAnchor="middle" fontSize="6" fill="#ff0000" fontFamily="monospace">SINK (KRAUS KWU110-33)</text>
                        <text x="495" y="136" textAnchor="middle" fontSize="6" fill="#ff0000" fontFamily="monospace">OVEN/RANGE</text>
                        <text x="495" y="280" textAnchor="middle" fontSize="6" fill="#ff0000" fontFamily="monospace">36&quot; PANTRY</text>

                        {/* UCS icon — bottom left */}
                        <g transform="translate(30, 410)">
                          <line x1="0" y1="0" x2="20" y2="0" stroke="#ff0000" strokeWidth="0.8" />
                          <line x1="0" y1="0" x2="0" y2="-20" stroke="#00ff00" strokeWidth="0.8" />
                          <polygon points="20,0 17,-2 17,2" fill="#ff0000" />
                          <polygon points="0,-20 -2,-17 2,-17" fill="#00ff00" />
                          <text x="22" y="3" fontSize="6" fill="#ff0000" fontFamily="monospace">X</text>
                          <text x="-4" y="-22" fontSize="6" fill="#00ff00" fontFamily="monospace">Y</text>
                        </g>
                      </svg>
                    </div>

                    {/* AutoCAD command line — bottom */}
                    <div className="absolute bottom-0 left-44 right-0 bg-[#1e1e1e] border-t border-[#3a3a3a]">
                      <div className="px-2 py-0.5 text-[9px] font-mono text-[#808080] border-b border-[#2a2a2a]">
                        <span className="text-[#c0c0c0]">Command:</span> _SELECT
                      </div>
                      <div className="px-2 py-0.5 text-[9px] font-mono text-[#808080]">
                        <span className="text-[#00ff00]">Specify opposite corner:</span> 3 found
                      </div>
                    </div>

                    {/* Coordinate readout */}
                    <div className="absolute bottom-0 left-0 w-44 bg-[#2d2d2d] border-t border-[#3a3a3a] px-2 py-1 flex items-center gap-3">
                      <span className="text-[8px] font-mono text-[#808080]">X: <span className="text-[#d0d0d0]">7&apos;-3&quot;</span></span>
                      <span className="text-[8px] font-mono text-[#808080]">Y: <span className="text-[#d0d0d0]">4&apos;-6&quot;</span></span>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between border-t border-[#3a3a3a] bg-[#2d2d2d] px-3 py-1">
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    {["SNAP", "GRID", "ORTHO", "POLAR", "OSNAP", "OTRACK", "LWT"].map((mode, i) => (
                      <button key={mode} className={`px-1.5 py-0.5 rounded ${[0,1,4].includes(i) ? "text-[#3574f0] bg-[#3574f0]/10" : "text-[#606060] hover:text-[#909090]"}`}>{mode}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-mono text-[#808080]">
                    <span>Scale: 1/4&quot; = 1&apos;-0&quot;</span>
                    <span>|</span>
                    <span>Johnson_Kitchen_v2.dxf</span>
                  </div>
                </div>
              </>
            )}

            {/* ============================================================= */}
            {/* REVIT 3D TAB — Realistic APS Viewer (Forge Viewer v7)         */}
            {/* ============================================================= */}
            {canvasTab === "3d" && (
              <>
                <div className="flex-1 relative overflow-hidden flex">
                  {/* Model Browser panel — left side */}
                  <div className="w-52 shrink-0 border-r border-[#3a3a3a] bg-[#2b2b2b] flex flex-col text-[10px]">
                    <div className="px-2 py-2 border-b border-[#3a3a3a] flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-[#b0b0b0] uppercase tracking-wider">Model Browser</span>
                      <button className="text-[9px] text-[#808080] hover:text-white">Filter</button>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1">
                      {/* Tree structure */}
                      {[
                        { name: "Johnson_Kitchen_v2.rvt", indent: 0, bold: true, expanded: true },
                        { name: "Walls (8)", indent: 1, expanded: true },
                        { name: "Basic Wall - Interior - 5\"", indent: 2 },
                        { name: "Basic Wall - Exterior - 8\"", indent: 2 },
                        { name: "Floors (1)", indent: 1 },
                        { name: "Ceilings (1)", indent: 1 },
                        { name: "Casework (18)", indent: 1, expanded: true, selected: true },
                        { name: "Base Cabinet - 24\"x24\"", indent: 2, count: "x4" },
                        { name: "Base Cabinet - 24\"x36\" Sink", indent: 2, count: "x1" },
                        { name: "Wall Cabinet - 12\"x30\"", indent: 2, count: "x6" },
                        { name: "Island - 42\"x84\"", indent: 2, count: "x1" },
                        { name: "Tall Cabinet - 24\"x84\" Pantry", indent: 2, count: "x1" },
                        { name: "Plumbing Fixtures (3)", indent: 1 },
                        { name: "Mechanical Equipment (3)", indent: 1 },
                        { name: "Generic Models (2)", indent: 1 },
                      ].map((node, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1 px-2 py-0.5 cursor-pointer ${node.selected ? "bg-[#3574f0]/20 text-white" : "text-[#c0c0c0] hover:bg-[#363636]"}`}
                          style={{ paddingLeft: `${8 + node.indent * 12}px` }}
                        >
                          {node.expanded !== undefined && <span className="text-[8px] text-[#808080]">{node.expanded ? "▼" : "▶"}</span>}
                          {node.expanded === undefined && node.indent > 0 && <span className="w-2" />}
                          <span className={`truncate ${node.bold ? "font-semibold" : ""}`} style={{ fontFamily: "system-ui" }}>{node.name}</span>
                          {node.count && <span className="text-[8px] text-[#606060] ml-auto shrink-0">{node.count}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3D Viewport */}
                  <div className="flex-1 relative" style={{ background: "linear-gradient(180deg, #2a3a4a 0%, #1a2a3a 40%, #1e2e3e 100%)" }}>
                    {/* APS Viewer toolbar — bottom center */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-lg bg-[#3c3c3c]/95 p-1 shadow-xl backdrop-blur-sm border border-[#555]">
                      {[
                        { label: "Home", path: "M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" },
                        { label: "Orbit", path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v4M12 17v4M3 12h4M17 12h4" },
                        { label: "Pan", path: "M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3" },
                        { label: "Zoom", path: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" },
                        null,
                        { label: "Section", path: "M3 3h18v18H3zM3 12h18" },
                        { label: "Measure", path: "M2 20L20 2M6 20l-4-4M10 20l-4-4M14 20l-4-4M18 20l-4-4M20 16l-2-2" },
                        { label: "Explode", path: "M8 2l4 4-4 4M16 2l-4 4 4 4M8 18l4-4-4-4M16 18l-4-4 4-4" },
                        null,
                        { label: "Properties", path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8v4M12 16h.01" },
                      ].map((tool, i) => tool === null ? (
                        <div key={i} className="w-px h-5 bg-[#555] mx-0.5" />
                      ) : (
                        <button key={i} title={tool.label} className={`flex size-8 items-center justify-center rounded-md transition-colors ${tool.label === "Orbit" ? "bg-[#5a5a5a] text-white" : "text-[#b0b0b0] hover:bg-[#5a5a5a] hover:text-white"}`}>
                          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={tool.path} /></svg>
                        </button>
                      ))}
                    </div>

                    {/* ViewCube — top right (signature Autodesk element) */}
                    <div className="absolute top-4 right-4">
                      <svg viewBox="0 0 100 100" className="size-16 drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
                        {/* Cube faces — isometric projection */}
                        {/* Top face */}
                        <polygon points="50,15 85,30 50,45 15,30" fill="#4a6a8a" stroke="#7a9aba" strokeWidth="0.5" />
                        <text x="50" y="34" textAnchor="middle" fontSize="7" fill="#c0d0e0" fontWeight="bold">TOP</text>
                        {/* Left face */}
                        <polygon points="15,30 50,45 50,80 15,65" fill="#3a5a7a" stroke="#6a8aaa" strokeWidth="0.5" />
                        <text x="32" y="58" textAnchor="middle" fontSize="6" fill="#a0b8d0" fontWeight="bold" transform="rotate(-30,32,58)">LEFT</text>
                        {/* Right face */}
                        <polygon points="85,30 50,45 50,80 85,65" fill="#2a4a6a" stroke="#5a7a9a" strokeWidth="0.5" />
                        <text x="68" y="58" textAnchor="middle" fontSize="6" fill="#90a8c0" fontWeight="bold" transform="rotate(30,68,58)">FRONT</text>
                        {/* Compass directions */}
                        <text x="50" y="10" textAnchor="middle" fontSize="6" fill="#808080">N</text>
                        <text x="92" y="34" textAnchor="middle" fontSize="6" fill="#808080">E</text>
                        <text x="50" y="95" textAnchor="middle" fontSize="6" fill="#808080">S</text>
                        <text x="8" y="34" textAnchor="middle" fontSize="6" fill="#808080">W</text>
                      </svg>
                    </div>

                    {/* 3D Kitchen Rendering — isometric perspective */}
                    <svg viewBox="0 0 700 500" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3a2a1a" />
                          <stop offset="100%" stopColor="#2a1a0a" />
                        </linearGradient>
                        <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#e8e0d8" />
                          <stop offset="100%" stopColor="#c8c0b8" />
                        </linearGradient>
                        <linearGradient id="cabinetFace" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#d4b896" />
                          <stop offset="30%" stopColor="#c4a880" />
                          <stop offset="100%" stopColor="#a8906a" />
                        </linearGradient>
                        <linearGradient id="cabinetSide" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a08060" />
                          <stop offset="100%" stopColor="#907050" />
                        </linearGradient>
                        <linearGradient id="counterTop" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f0ebe5" />
                          <stop offset="50%" stopColor="#e8e0d8" />
                          <stop offset="100%" stopColor="#d8d0c8" />
                        </linearGradient>
                        <linearGradient id="counterSide" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#e0d8d0" />
                          <stop offset="100%" stopColor="#c8c0b8" />
                        </linearGradient>
                        <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#d0d0d0" />
                          <stop offset="50%" stopColor="#a0a0a0" />
                          <stop offset="100%" stopColor="#808080" />
                        </linearGradient>
                        <linearGradient id="backsplash" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f8f4f0" />
                          <stop offset="100%" stopColor="#e8e4e0" />
                        </linearGradient>
                        {/* Floor tile pattern */}
                        <pattern id="floorPattern" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse" patternTransform="skewX(-30)">
                          <rect width="29" height="14" fill="#4a3520" stroke="#3a2510" strokeWidth="0.5" />
                        </pattern>
                        {/* Shadow filter */}
                        <filter id="dropShadow3d">
                          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3" />
                        </filter>
                      </defs>

                      {/* ---- ROOM SHELL ---- */}
                      {/* Floor */}
                      <polygon points="100,340 400,440 650,340 350,240" fill="url(#floorPattern)" opacity="0.8" />

                      {/* Back wall */}
                      <polygon points="100,340 350,240 350,70 100,170" fill="url(#wallGrad)" opacity="0.6" />
                      {/* Left wall partial */}
                      <polygon points="100,340 400,440 400,270 100,170" fill="#d0c8c0" opacity="0.3" />

                      {/* ---- BACK WALL CABINETS (oak, left to right) ---- */}
                      {/* Lower cabs — row of 5 */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <g key={`bcab${i}`} transform={`translate(${115 + i * 42}, 0)`} filter="url(#dropShadow3d)">
                          {/* Front face */}
                          <polygon points="0,280 38,267 38,215 0,228" fill="url(#cabinetFace)" stroke="#8a7050" strokeWidth="0.5" />
                          {/* Top face (countertop) */}
                          <polygon points="0,228 38,215 58,225 20,238" fill="url(#counterTop)" stroke="#b0a890" strokeWidth="0.5" />
                          {/* Side face */}
                          <polygon points="38,267 58,257 58,225 38,215" fill="url(#cabinetSide)" stroke="#8a7050" strokeWidth="0.5" />
                          {/* Door lines */}
                          <line x1="18" y1="278" x2="18" y2="230" stroke="#a08868" strokeWidth="0.3" />
                          {/* Handle */}
                          <line x1="15" y1="252" x2="15" y2="258" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                          <line x1="22" y1="250" x2="22" y2="256" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" />
                        </g>
                      ))}

                      {/* Sink area (3rd cabinet) */}
                      <g transform="translate(199, 0)">
                        <ellipse cx="20" cy="220" rx="12" ry="4" fill="#909090" stroke="#707070" strokeWidth="0.5" />
                        <ellipse cx="20" cy="220" rx="9" ry="3" fill="#a0a0a0" />
                        <circle cx="20" cy="214" r="2" fill="#c9a84c" />
                      </g>

                      {/* Backsplash behind cabs */}
                      <polygon points="115,228 325,180 325,155 115,203" fill="url(#backsplash)" stroke="#d0c8c0" strokeWidth="0.3" opacity="0.9" />
                      {/* Tile lines on backsplash */}
                      {[0, 1, 2, 3].map((i) => (
                        <line key={`bt${i}`} x1="115" y1={208 + i * -6} x2="325" y2={160 + i * -6} stroke="#c8c0b8" strokeWidth="0.2" />
                      ))}

                      {/* Upper cabs on back wall */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <g key={`ucab${i}`} transform={`translate(${115 + i * 42}, 0)`}>
                          <polygon points="0,200 38,188 38,150 0,162" fill="url(#cabinetFace)" stroke="#8a7050" strokeWidth="0.5" opacity="0.9" />
                          <polygon points="38,188 56,180 56,142 38,150" fill="url(#cabinetSide)" stroke="#8a7050" strokeWidth="0.5" opacity="0.8" />
                        </g>
                      ))}

                      {/* ---- RIGHT WALL APPLIANCES ---- */}
                      {/* Range */}
                      <g transform="translate(330, 0)" filter="url(#dropShadow3d)">
                        <polygon points="0,268 50,288 50,235 0,215" fill="url(#steelGrad)" stroke="#707070" strokeWidth="0.5" />
                        <polygon points="0,215 50,235 80,220 30,200" fill="#c0c0c0" stroke="#909090" strokeWidth="0.5" />
                        <polygon points="50,288 80,273 80,220 50,235" fill="#909090" stroke="#707070" strokeWidth="0.5" />
                        {/* Burners */}
                        <ellipse cx="18" cy="207" rx="6" ry="3" fill="none" stroke="#505050" strokeWidth="0.8" />
                        <ellipse cx="38" cy="212" rx="6" ry="3" fill="none" stroke="#505050" strokeWidth="0.8" />
                        <ellipse cx="55" cy="215" rx="5" ry="2.5" fill="none" stroke="#505050" strokeWidth="0.8" />
                        {/* Oven door line */}
                        <line x1="5" y1="258" x2="45" y2="278" stroke="#808080" strokeWidth="0.5" />
                        <line x1="25" y1="272" x2="25" y2="268" stroke="#a0a0a0" strokeWidth="1" strokeLinecap="round" />
                      </g>

                      {/* Refrigerator */}
                      <g transform="translate(370, 0)" filter="url(#dropShadow3d)">
                        <polygon points="0,256 50,276 50,180 0,160" fill="url(#steelGrad)" stroke="#707070" strokeWidth="0.5" />
                        <polygon points="50,276 78,263 78,168 50,180" fill="#808080" stroke="#606060" strokeWidth="0.5" />
                        <polygon points="0,160 50,180 78,168 28,148" fill="#d0d0d0" stroke="#909090" strokeWidth="0.3" />
                        {/* Door split */}
                        <line x1="0" y1="215" x2="50" y2="235" stroke="#909090" strokeWidth="0.5" />
                        {/* Handles */}
                        <line x1="40" y1="200" x2="40" y2="230" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="40" y1="245" x2="40" y2="265" stroke="#b0b0b0" strokeWidth="1.5" strokeLinecap="round" />
                      </g>

                      {/* ---- ISLAND ---- */}
                      <g transform="translate(210, 0)" filter="url(#dropShadow3d)">
                        {/* Front */}
                        <polygon points="0,360 130,400 130,370 0,330" fill="url(#cabinetFace)" stroke="#8a7050" strokeWidth="0.5" />
                        {/* Top = countertop */}
                        <polygon points="0,330 130,370 175,350 45,310" fill="url(#counterTop)" stroke="#b0a890" strokeWidth="0.5" />
                        {/* Side */}
                        <polygon points="130,400 175,380 175,350 130,370" fill="url(#cabinetSide)" stroke="#8a7050" strokeWidth="0.5" />
                        {/* Cabinet doors */}
                        <line x1="43" y1="358" x2="43" y2="332" stroke="#a08868" strokeWidth="0.3" />
                        <line x1="86" y1="374" x2="86" y2="348" stroke="#a08868" strokeWidth="0.3" />
                        {/* Handles */}
                        <line x1="40" y1="345" x2="40" y2="350" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" />
                        <line x1="83" y1="361" x2="83" y2="366" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" />
                        {/* Prep sink */}
                        <ellipse cx="60" cy="335" rx="10" ry="4" fill="#a0a0a0" stroke="#808080" strokeWidth="0.3" />
                      </g>

                      {/* ---- WINDOW (back wall, high) ---- */}
                      <polygon points="160,180 280,140 280,110 160,150" fill="#87CEEB" opacity="0.3" stroke="#b0a890" strokeWidth="0.5" />
                      <line x1="220" y1="160" x2="220" y2="125" stroke="#b0a890" strokeWidth="0.5" />
                      <line x1="160" y1="165" x2="280" y2="125" stroke="#b0a890" strokeWidth="0.5" />

                      {/* ---- LIGHTING ---- */}
                      {/* Pendant lights over island */}
                      <line x1="250" y1="100" x2="250" y2="270" stroke="#404040" strokeWidth="0.5" />
                      <ellipse cx="250" cy="272" rx="8" ry="3" fill="#f0e0c0" stroke="#d0c0a0" strokeWidth="0.3" />
                      <ellipse cx="250" cy="272" rx="4" ry="1.5" fill="#fff8e0" opacity="0.6" />
                      <line x1="310" y1="90" x2="310" y2="282" stroke="#404040" strokeWidth="0.5" />
                      <ellipse cx="310" cy="284" rx="8" ry="3" fill="#f0e0c0" stroke="#d0c0a0" strokeWidth="0.3" />
                      <ellipse cx="310" cy="284" rx="4" ry="1.5" fill="#fff8e0" opacity="0.6" />

                      {/* Ground shadow */}
                      <ellipse cx="350" cy="420" rx="200" ry="20" fill="black" opacity="0.1" />
                    </svg>

                    {/* Selection highlight overlay */}
                    <div className="absolute top-4 left-4 rounded-md bg-black/60 px-3 py-2 backdrop-blur-sm border border-[#555]/50">
                      <p className="text-[10px] text-[#b0b0b0]">Selected: <span className="text-white font-medium">Casework (18 objects)</span></p>
                      <p className="text-[9px] text-[#808080] mt-0.5">Category: Casework | Family: Base Cabinet</p>
                    </div>

                    {/* Autodesk watermark */}
                    <div className="absolute bottom-14 right-4 text-[9px] text-[#404040] font-medium">
                      Powered by Autodesk
                    </div>
                  </div>

                  {/* Properties panel — right side */}
                  <div className="w-48 shrink-0 border-l border-[#3a3a3a] bg-[#2b2b2b] flex flex-col text-[10px]">
                    <div className="px-2 py-2 border-b border-[#3a3a3a]">
                      <span className="text-[9px] font-semibold text-[#b0b0b0] uppercase tracking-wider">Properties</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                      <div>
                        <p className="text-[9px] text-[#3574f0] font-semibold mb-1">Identity</p>
                        {[
                          ["Family", "Base Cabinet"],
                          ["Type", "24\"x24\" - Oak"],
                          ["Level", "Level 1"],
                          ["Phase", "New Construction"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 border-b border-[#333]">
                            <span className="text-[#808080]">{k}</span>
                            <span className="text-[#d0d0d0] text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[9px] text-[#3574f0] font-semibold mb-1">Dimensions</p>
                        {[
                          ["Width", "24\""],
                          ["Depth", "24\""],
                          ["Height", "34.5\""],
                          ["Toe Kick", "4\""],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 border-b border-[#333]">
                            <span className="text-[#808080]">{k}</span>
                            <span className="text-[#d0d0d0] text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[9px] text-[#3574f0] font-semibold mb-1">Materials</p>
                        {[
                          ["Door", "White Oak - Natural"],
                          ["Carcass", "Birch Plywood"],
                          ["Counter", "Calacatta Quartz"],
                          ["Hardware", "Brushed Brass"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 border-b border-[#333]">
                            <span className="text-[#808080]">{k}</span>
                            <span className="text-[#d0d0d0] text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-[9px] text-[#3574f0] font-semibold mb-1">Cost</p>
                        {[
                          ["Unit Cost", "$340/lf"],
                          ["Total", "$2,720"],
                          ["Markup", "35%"],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between py-0.5 border-b border-[#333]">
                            <span className="text-[#808080]">{k}</span>
                            <span className="text-[#d0d0d0] text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-[#3a3a3a] p-2">
                      <p className="text-[8px] text-[#606060]">Johnson_Kitchen_v2.rvt</p>
                      <p className="text-[8px] text-[#606060]">227 elements | 18.4 MB</p>
                    </div>
                  </div>
                </div>

                {/* Viewer status bar */}
                <div className="flex items-center justify-between border-t border-[#3a3a3a] bg-[#2d2d2d] px-3 py-1">
                  <div className="flex items-center gap-3 text-[9px] text-[#808080]">
                    <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-green-400" /> Revit 2026</span>
                    <span>|</span>
                    <span>LOD: Fine</span>
                    <span>|</span>
                    <span>Render: Realistic</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[#808080]">
                    <span>APS Viewer v7.98</span>
                    <span>|</span>
                    <span>Generated in 2m 14s</span>
                  </div>
                </div>
              </>
            )}

            {/* ============================================================= */}
            {/* MATERIALS TAB — Enhanced with realistic swatches               */}
            {/* ============================================================= */}
            {canvasTab === "materials" && (
              <>
                <div className="flex-1 overflow-hidden flex">
                  {/* Material list */}
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="max-w-lg mx-auto space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Material Schedule</p>
                          <p className="text-[11px] text-muted-foreground">Johnson Kitchen Remodel — 7 specifications</p>
                        </div>
                        <button className="rounded-md bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/25 hover:bg-amber-500/25 transition-colors">
                          Export Schedule
                        </button>
                      </div>
                      {[
                        { name: "Countertops", material: "Caesarstone Calacatta Maximus", color: "#e8e0d4", code: "5114", price: "$75/sf", qty: "52 sf", total: "$3,900", lead: "3-4 wks", gradient: "linear-gradient(135deg, #f0ebe5 0%, #e0d5c5 40%, #ddd0c0 60%, #e8e0d4 100%)" },
                        { name: "Base Cabinets", material: "Shaker Style — White Oak Natural", color: "#c4a972", code: "WO-2240", price: "$340/lf", qty: "18 lf", total: "$6,120", lead: "6-8 wks", gradient: "linear-gradient(135deg, #d4b896 0%, #c4a878 30%, #b89868 60%, #d0b090 100%)" },
                        { name: "Upper Cabinets", material: "Shaker Style — White Oak Natural", color: "#c4a972", code: "WO-2240", price: "$280/lf", qty: "12 lf", total: "$3,360", lead: "6-8 wks", gradient: "linear-gradient(135deg, #d4b896 0%, #c4a878 30%, #b89868 60%, #d0b090 100%)" },
                        { name: "Backsplash", material: "Zellige Tile — Weathered White", color: "#f0ece4", code: "ZT-100", price: "$22/sf", qty: "28 sf", total: "$616", lead: "In stock", gradient: "linear-gradient(135deg, #f8f4f0 0%, #ece4dc 40%, #f0ece4 70%, #e8e0d8 100%)" },
                        { name: "Flooring", material: "Engineered Hardwood — European Oak", color: "#a08260", code: "EO-7714", price: "$12/sf", qty: "120 sf", total: "$1,440", lead: "2-3 wks", gradient: "repeating-linear-gradient(90deg, #a08260 0px, #b09270 8px, #907050 12px, #a08060 20px)" },
                        { name: "Sink", material: "Kraus Workstation 33\" Undermount SS", color: "#8a8a8a", code: "KWU110-33", price: "$429", qty: "1 ea", total: "$429", lead: "In stock", gradient: "linear-gradient(135deg, #d0d0d0 0%, #a0a0a0 40%, #b0b0b0 70%, #909090 100%)" },
                        { name: "Faucet", material: "Brizo Litze Pull-Down — Luxe Gold", color: "#d4a843", code: "63064LF-GL", price: "$620", qty: "1 ea", total: "$620", lead: "In stock", gradient: "linear-gradient(135deg, #e8c868 0%, #d4a843 40%, #c49838 70%, #d8b050 100%)" },
                        { name: "Hardware", material: "Top Knobs Brushed Brass Pulls 6\"", color: "#c9a84c", code: "TK-BB6", price: "$18/ea", qty: "24 ea", total: "$432", lead: "In stock", gradient: "linear-gradient(135deg, #d8b860 0%, #c9a84c 50%, #b89840 100%)" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg bg-[#0c1222] p-3 ring-1 ring-border/30 hover:ring-border/50 transition-all cursor-pointer group">
                          <div
                            className="size-14 rounded-lg ring-1 ring-white/10 shrink-0 shadow-inner"
                            style={{ background: item.gradient }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.name}</p>
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted/20 text-muted-foreground/70">{item.lead}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">{item.material}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-muted-foreground font-mono">SKU: {item.code}</span>
                              <span className="text-[10px] text-muted-foreground">{item.price} &times; {item.qty}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-foreground">{item.total}</p>
                            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100">Change</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary sidebar */}
                  <div className="w-56 shrink-0 border-l border-border/40 bg-[#0c1222] p-4 flex flex-col">
                    <p className="text-xs font-semibold text-foreground mb-3">Cost Summary</p>
                    <div className="space-y-2 flex-1">
                      {[
                        ["Countertops", "$3,900"],
                        ["Base Cabinets", "$6,120"],
                        ["Upper Cabinets", "$3,360"],
                        ["Backsplash", "$616"],
                        ["Flooring", "$1,440"],
                        ["Sink", "$429"],
                        ["Faucet", "$620"],
                        ["Hardware", "$432"],
                      ].map(([label, cost]) => (
                        <div key={label} className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-foreground font-mono">{cost}</span>
                        </div>
                      ))}
                      <div className="h-px bg-border/40 my-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Materials Subtotal</span>
                        <span className="text-foreground font-bold font-mono">$16,917</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Labor (estimated)</span>
                        <span className="text-foreground font-mono">$8,450</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Markup (35%)</span>
                        <span className="text-foreground font-mono">$8,878</span>
                      </div>
                      <div className="h-px bg-border/40 my-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground font-semibold">Project Total</span>
                        <span className="text-foreground font-bold font-mono">$34,245</span>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4 pt-4 border-t border-border/40">
                      <button className="w-full rounded-md bg-indigo-500/20 py-2 text-[11px] font-semibold text-indigo-400 ring-1 ring-indigo-500/30 hover:bg-indigo-500/30 transition-colors">
                        Generate Estimate PDF
                      </button>
                      <button className="w-full rounded-md bg-muted/20 py-2 text-[11px] font-medium text-muted-foreground ring-1 ring-border/40 hover:bg-muted/30 transition-colors">
                        Export to QuickBooks
                      </button>
                    </div>
                  </div>
                </div>

                {/* Materials footer */}
                <div className="flex items-center justify-between border-t border-border/40 bg-[#0c1222] px-4 py-1.5">
                  <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                    <span>8 specifications</span>
                    <span>|</span>
                    <span>Room: 12&apos; &times; 10&apos; (120 sf)</span>
                    <span>|</span>
                    <span className="flex items-center gap-1">NKBA Compliant <span className="inline-flex items-center gap-0.5 text-green-400"><Check className="size-2.5" /> 31/31</span></span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">Last updated: 2 min ago</span>
                </div>
              </>
            )}

            {/* Canvas tab selector — bottom tabs */}
            <div className="flex items-center border-t border-[#3a3a3a] bg-[#2d2d2d]">
              {(["2d", "3d", "materials"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCanvasTab(tab)}
                  className={`px-4 py-1.5 text-[10px] font-medium transition-colors border-r border-[#3a3a3a] ${
                    canvasTab === tab
                      ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#3574f0]"
                      : "text-[#808080] hover:text-[#c0c0c0] hover:bg-[#383838]"
                  }`}
                >
                  {tab === "2d" ? "AutoCAD 2D — Johnson_Kitchen_v2.dxf" : tab === "3d" ? "Revit 3D — Johnson_Kitchen_v2.rvt" : "Materials Schedule"}
                </button>
              ))}
              <div className="flex-1" />
              <div className="flex items-center gap-2 px-3">
                <button className="rounded-md bg-muted/20 px-2 py-0.5 text-[9px] font-medium text-[#808080] hover:text-white hover:bg-[#484848] transition-colors">
                  Export DXF
                </button>
                <button className="rounded-md bg-muted/20 px-2 py-0.5 text-[9px] font-medium text-[#808080] hover:text-white hover:bg-[#484848] transition-colors">
                  Export RVT
                </button>
                <button className="rounded-md bg-[#3574f0]/20 px-2 py-0.5 text-[9px] font-semibold text-[#3574f0] hover:bg-[#3574f0]/30 transition-colors">
                  Generate Estimate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
