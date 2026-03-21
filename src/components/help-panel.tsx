"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageCircleQuestion,
  X,
  Search,
  BookOpen,
  Bot,
  Plug,
  Users,
  CreditCard,
  BarChart3,
  ArrowLeft,
  Send,
  ChevronRight,
  Mail,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Suggestion {
  question: string;
  answer: string;
  link?: string;
}

interface RouteContext {
  title: string;
  suggestions: Suggestion[];
}

interface ChatResponse {
  message: string;
  link?: { label: string; href: string };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  link?: { label: string; href: string };
  revealed?: boolean;
}

// ---------------------------------------------------------------------------
// Route-to-Context Mapping
// ---------------------------------------------------------------------------

const routeContextMap: Record<string, RouteContext> = {
  "/dashboard": {
    title: "Dashboard",
    suggestions: [
      {
        question: "What do the agent status indicators mean?",
        answer:
          "Green means the agent is active and running. Yellow indicates the agent is paused or waiting for input. Red means the agent encountered an error and needs attention. Gray means the agent is disabled.",
      },
      {
        question: "How do I customize my dashboard?",
        answer:
          "Dashboard widgets adjust automatically based on your role and the agents assigned to you. Owners and Admins see the full overview; other roles see a filtered view.",
      },
      {
        question: "Where can I see today's agent activity?",
        answer:
          "The Agent Activity section on the dashboard shows today's actions, approvals pending, and escalations. Click any agent to see its detailed timeline.",
        link: "/dashboard/agents",
      },
    ],
  },
  "/dashboard/agents": {
    title: "Agents",
    suggestions: [
      {
        question: "How do I enable or disable an agent?",
        answer:
          "Toggle the switch on any agent card. Only Owners and Admins can change agent status.",
        link: "/dashboard/agents",
      },
      {
        question: "What integrations does each agent need?",
        answer:
          "Each agent card shows its required integrations. Connect them in Settings > Integrations.",
        link: "/settings/integrations",
      },
      {
        question: "How do I view an agent's execution history?",
        answer:
          "Click on any agent card to see its detail page with execution logs and performance metrics.",
      },
    ],
  },
  "/settings/billing": {
    title: "Billing",
    suggestions: [
      {
        question: "How do I upgrade my plan?",
        answer:
          "You can upgrade from your current page. Click 'Change Plan' to see available options.",
        link: "/settings/billing",
      },
      {
        question: "Where can I see my usage?",
        answer:
          "View detailed usage breakdown including AI costs and agent seats.",
        link: "/settings/billing/usage",
      },
      {
        question: "How does billing work?",
        answer:
          "Apex bills monthly. Setup fees are one-time. Your plan includes a set number of agent seats and AI usage.",
      },
    ],
  },
  "/settings/integrations": {
    title: "Integrations",
    suggestions: [
      {
        question: "How do I connect JobTread?",
        answer:
          "Click 'Connect' on the JobTread card. You'll be redirected to authorize Apex to access your JobTread data.",
        link: "/settings/integrations",
      },
      {
        question: "Why is my integration showing 'Reconnection required'?",
        answer:
          "This usually means your OAuth token has expired. Click 'Reconnect' to re-authorize the connection.",
      },
      {
        question: "Which agents use which integrations?",
        answer:
          "Each integration card shows 'Used by' with the agents that depend on it. You can also see this on each agent's detail page.",
      },
    ],
  },
  "/settings/team": {
    title: "Team",
    suggestions: [
      {
        question: "How do I invite a team member?",
        answer:
          "Click 'Invite Member' and enter their email and role. They'll receive an invitation link.",
        link: "/settings/team",
      },
      {
        question: "What are the different roles?",
        answer:
          "Apex has 6 roles: Owner (full access), Admin (full access), Manager (approvals + reports), Designer (projects only), Bookkeeper (financial views), and Viewer (read-only).",
      },
      {
        question: "How do I change someone's role?",
        answer:
          "Click the member's row in the Team page, then select their new role from the dropdown.",
      },
    ],
  },
  "/approvals": {
    title: "Approvals",
    suggestions: [
      {
        question: "What actions require my approval?",
        answer:
          "Agents create drafts for emails, estimates, and financial actions. You review and approve or reject these before they're sent.",
      },
      {
        question: "Can I edit an approval before approving?",
        answer:
          "Yes! Click 'Edit' on any approval card to modify the content before approving.",
      },
      {
        question: "What happens when I reject an action?",
        answer:
          "The agent is notified and the action is cancelled. You can provide a reason that helps the agent improve future drafts.",
      },
    ],
  },
  "/escalations": {
    title: "Escalations",
    suggestions: [
      {
        question: "What triggers an escalation?",
        answer:
          "Escalations are created when agents encounter situations outside their confidence threshold or when actions fail repeatedly.",
      },
      {
        question: "How do I resolve an escalation?",
        answer:
          "Click on any escalation to see details, then take the recommended action or dismiss it.",
      },
      {
        question: "Can I configure escalation rules?",
        answer:
          "Escalation thresholds are set per agent. Contact support for custom escalation rules.",
      },
    ],
  },
  "/projects": {
    title: "Projects",
    suggestions: [
      {
        question: "How are projects synced from JobTread?",
        answer:
          "Projects sync automatically via webhooks when changes occur in JobTread. A fallback poll runs every 15 minutes.",
        link: "/settings/integrations",
      },
      {
        question: "Can I create projects directly in Apex?",
        answer:
          "Projects are sourced from your connected project management tool (e.g., JobTread). Apex reads and enriches this data.",
      },
    ],
  },
  "/customers": {
    title: "Customers",
    suggestions: [
      {
        question: "Where does customer data come from?",
        answer:
          "Customer data syncs from your connected CRM and project management tools.",
      },
      {
        question: "How does lead scoring work?",
        answer:
          "The Discovery Concierge agent automatically scores leads based on engagement, project size, and response patterns.",
      },
    ],
  },
  "/bos": {
    title: "Business Operating System",
    suggestions: [
      {
        question: "What is the Business Operating System?",
        answer:
          "It's Apex's implementation of the EOS methodology \u2014 scorecards, goals, meeting management, issue tracking, and more, with AI augmentation.",
      },
      {
        question: "How do I set up my first meeting?",
        answer:
          "Go to Meetings and click 'Schedule Meeting'. Choose a meeting type (L10, quarterly, annual) and invite your team.",
        link: "/bos/meetings",
      },
      {
        question: "How do I track KPIs?",
        answer:
          "Set up your scorecard with key metrics. Apex automatically pulls data from connected integrations.",
        link: "/bos/kpis",
      },
    ],
  },
  "/reports": {
    title: "Reports",
    suggestions: [
      {
        question: "What reports are available?",
        answer:
          "Agent ROI, execution history, cost analysis, and custom reports based on your data.",
      },
      {
        question: "How is agent ROI calculated?",
        answer:
          "ROI compares the time and cost savings from agent automation against the subscription cost.",
        link: "/reports/agent-roi",
      },
    ],
  },
  "/onboarding": {
    title: "Getting Started",
    suggestions: [
      {
        question: "How long does setup take?",
        answer:
          "Technical setup takes under 1 hour. Full onboarding including team training takes 1-2 weeks.",
      },
      {
        question: "Can I skip steps and come back later?",
        answer:
          "Yes! You can skip integration connections and team invites during onboarding and set them up later in Settings.",
      },
      {
        question: "What do I need to get started?",
        answer:
          "Your company info, at least one integration (JobTread or QuickBooks), and your team members' email addresses.",
      },
    ],
  },
  "/notifications": {
    title: "Notifications",
    suggestions: [
      {
        question: "How do I control which notifications I receive?",
        answer:
          "Go to Settings > Notifications to configure your preferences for each notification type.",
        link: "/settings/notifications",
      },
    ],
  },
  "/design/kitchen-bath": {
    title: "Design Tool",
    suggestions: [
      {
        question: "How does the AI design assistant work?",
        answer:
          "Describe your kitchen or bathroom layout and the AI generates a 3D design you can refine.",
      },
      {
        question: "Can I export designs?",
        answer:
          "Yes \u2014 designs can be exported as DXF files for CAD software or as PDF presentations for clients.",
      },
    ],
  },
  "/settings/profile": {
    title: "Profile",
    suggestions: [
      {
        question: "How do I update my profile photo?",
        answer:
          "Click your avatar on the Profile page and upload a new image. Supported formats: JPG, PNG (max 2 MB).",
      },
      {
        question: "Can I change my email address?",
        answer:
          "Yes \u2014 update your email on the Profile page. You'll receive a verification link to confirm the change.",
      },
    ],
  },
  "/settings/security": {
    title: "Security",
    suggestions: [
      {
        question: "How do I enable two-factor authentication?",
        answer:
          "Go to Security settings and click 'Enable 2FA'. You can use an authenticator app or SMS.",
        link: "/settings/security",
      },
      {
        question: "How do I change my password?",
        answer:
          "Click 'Change Password' on the Security page. You'll need to enter your current password first.",
      },
    ],
  },
};

const defaultContext: RouteContext = {
  title: "Apex Intelligence",
  suggestions: [
    {
      question: "How do I get started with Apex?",
      answer:
        "Start by connecting your integrations (JobTread, QuickBooks) in Settings > Integrations, then invite your team in Settings > Team.",
      link: "/onboarding",
    },
    {
      question: "What can the AI agents do?",
      answer:
        "Apex agents automate lead follow-up, estimate generation, project operations, financial reconciliation, design specs, and executive reporting.",
      link: "/dashboard/agents",
    },
    {
      question: "How do I contact support?",
      answer:
        "Email us at support@apexintelligence.ai or use the chat assistant right here for instant help.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Chat Response Patterns (regex-keyword matching)
// ---------------------------------------------------------------------------

const chatResponsePatterns: Array<{ pattern: RegExp; response: ChatResponse }> =
  [
    {
      pattern: /upgrade|downgrade|change.*plan|update.*plan|my plan|billing|subscription|pricing|payment|invoice|cost|how much|price/i,
      response: {
        message:
          "You can manage your subscription from the Billing page. Click the button below to go there directly.",
        link: { label: "Go to Billing \u2192", href: "/settings/billing" },
      },
    },
    {
      pattern: /usage|how much.*(used|using|spent)|ai.*(cost|usage|spend)|token|seat/i,
      response: {
        message:
          "View your detailed usage breakdown including AI costs, agent seats, and execution history.",
        link: { label: "Go to Usage \u2192", href: "/settings/billing/usage" },
      },
    },
    {
      pattern: /connect.*gmail|gmail|set.?up.*email|email.*integrat/i,
      response: {
        message:
          "You can connect Gmail from the Integrations page. Click 'Connect' on the Gmail card to authorize Apex to create and send email drafts on your behalf.",
        link: { label: "Go to Integrations \u2192", href: "/settings/integrations" },
      },
    },
    {
      pattern: /connect.*calendar|google.*calendar|calendar.*integrat|scheduling/i,
      response: {
        message:
          "Connect Google Calendar from the Integrations page. This lets agents check availability and manage appointments.",
        link: { label: "Go to Integrations \u2192", href: "/settings/integrations" },
      },
    },
    {
      pattern: /connect.*quickbooks|quickbooks|qb|accounting/i,
      response: {
        message:
          "Connect QuickBooks from the Integrations page. This gives agents access to financial reports, invoices, and payment data.",
        link: { label: "Go to Integrations \u2192", href: "/settings/integrations" },
      },
    },
    {
      pattern: /connect.*jobtread|jobtread|job.*tread/i,
      response: {
        message:
          "Connect JobTread from the Integrations page. Click 'Connect' on the JobTread card to authorize Apex to access your project, estimate, and contact data.",
        link: { label: "Go to Integrations \u2192", href: "/settings/integrations" },
      },
    },
    {
      pattern: /connect|integration|disconnect|reconnect|sync|oauth/i,
      response: {
        message:
          "You can connect and manage all your integrations from the Integrations settings page. Each card shows the connection status and which agents use it.",
        link: { label: "Go to Integrations \u2192", href: "/settings/integrations" },
      },
    },
    {
      pattern: /invite|add.*member|add.*user|team|manage.*team|remove.*member/i,
      response: {
        message:
          "You can invite team members, assign roles, and manage your team from the Team settings page.",
        link: { label: "Go to Team Settings \u2192", href: "/settings/team" },
      },
    },
    {
      pattern: /role|permission|access|owner|admin|manager|designer|bookkeeper|viewer|who can/i,
      response: {
        message:
          "Apex has 6 roles: Owner (full access), Admin (full access), Manager (approvals + reports), Designer (projects only), Bookkeeper (financial views), and Viewer (read-only). Manage roles in Team settings.",
        link: { label: "Go to Team Settings \u2192", href: "/settings/team" },
      },
    },
    {
      pattern: /agent|enable|disable|configure|turn.*(on|off)|activate|deactivate|set.?up.*agent/i,
      response: {
        message:
          "You can view and configure all your agents from the Agents page. Toggle agents on/off or click one for detailed settings and execution history.",
        link: { label: "Go to Agents \u2192", href: "/dashboard/agents" },
      },
    },
    {
      pattern: /password|change.*password|reset.*password|security|2fa|mfa|two.?factor|authenticat/i,
      response: {
        message:
          "You can update your password, enable two-factor authentication, and manage security settings from the Security page.",
        link: { label: "Go to Security Settings \u2192", href: "/settings/security" },
      },
    },
    {
      pattern: /notification|alert|email.*notification|push|digest|how.*notif/i,
      response: {
        message:
          "Configure which notifications you receive and how they're delivered (in-app, email, or both) from the Notification settings.",
        link: { label: "Go to Notification Settings \u2192", href: "/settings/notifications" },
      },
    },
    {
      pattern: /escalation|escalate|urgent|critical|needs.*attention/i,
      response: {
        message:
          "View and manage all escalations from the Escalations page. Each escalation shows the agent, severity, and recommended action.",
        link: { label: "Go to Escalations \u2192", href: "/escalations" },
      },
    },
    {
      pattern: /approv(al|e)|reject|pending|review.*action|action.*review|draft/i,
      response: {
        message:
          "Review and manage pending approvals. You can approve, edit, or reject agent-generated actions like emails, estimates, and financial transactions.",
        link: { label: "Go to Approvals \u2192", href: "/approvals" },
      },
    },
    {
      pattern: /report|analytics|roi|performance|how.*doing|metric|stat/i,
      response: {
        message:
          "View reports on agent performance, ROI analysis, cost breakdowns, and execution history.",
        link: { label: "Go to Reports \u2192", href: "/reports" },
      },
    },
    {
      pattern: /eos|bos|business.*os|meeting|scorecard|kpi|goal|rock|l10|quarterly|weekly|issue.*track/i,
      response: {
        message:
          "The Business Operating System helps you run your company with the EOS methodology. Manage meetings, track KPIs, set goals, and align your team.",
        link: { label: "Go to Business OS \u2192", href: "/bos" },
      },
    },
    {
      pattern: /project|job|work.*order/i,
      response: {
        message:
          "View all your synced projects, their status, timelines, and associated agent activity.",
        link: { label: "Go to Projects \u2192", href: "/projects" },
      },
    },
    {
      pattern: /customer|client|lead|contact|crm|pipeline/i,
      response: {
        message:
          "View your customer pipeline, lead scores, contact history, and communication timeline.",
        link: { label: "Go to Customers \u2192", href: "/customers" },
      },
    },
    {
      pattern: /profile|my name|my email|avatar|photo|picture/i,
      response: {
        message:
          "Update your profile information, avatar, and contact details from the Profile page.",
        link: { label: "Go to Profile \u2192", href: "/settings/profile" },
      },
    },
    {
      pattern: /design|kitchen|bath|3d|layout|cabinet|render/i,
      response: {
        message:
          "Use the AI-powered design tool to create kitchen and bathroom layouts with 3D rendering.",
        link: { label: "Go to Design Tool \u2192", href: "/design/kitchen-bath" },
      },
    },
    {
      pattern: /dashboard|overview|home|main/i,
      response: {
        message:
          "The Dashboard shows a real-time overview of your AI agent workforce — active agents, pending escalations, today's conversations, and the daily briefing.",
        link: { label: "Go to Dashboard \u2192", href: "/dashboard" },
      },
    },
    {
      pattern: /onboarding|get.*start|set.?up|first.*time|new.*here|tutorial|guide|walkthrough/i,
      response: {
        message:
          "The onboarding wizard walks you through connecting integrations, configuring agents, and inviting your team. You can restart it anytime.",
        link: { label: "Go to Onboarding \u2192", href: "/onboarding" },
      },
    },
    {
      pattern: /help|support|contact|phone|call|chat|talk.*human|real.*person/i,
      response: {
        message:
          "You can email us at support@apexintelligence.ai for direct support. Owners and Admins can also schedule a call from the Help panel.",
      },
    },
    {
      pattern: /estimate|bid|quote|proposal/i,
      response: {
        message:
          "The Estimate Engine agent generates detailed project cost estimates from specs and pricing data. View pending estimates in Approvals or check the agent's history.",
        link: { label: "Go to Approvals \u2192", href: "/approvals" },
      },
    },
    {
      pattern: /webhook|api|developer|automation|zapier|slack/i,
      response: {
        message:
          "Manage external integrations and automation tools like Slack and Zapier from the Integrations page.",
        link: { label: "Go to Integrations \u2192", href: "/settings/integrations" },
      },
    },
  ];

const fallbackResponse: ChatResponse = {
  message:
    "I'm not sure about that one. You can try rephrasing your question, or contact our support team at support@apexintelligence.ai for further assistance.",
};

// ---------------------------------------------------------------------------
// Quick Links
// ---------------------------------------------------------------------------

const quickLinks = [
  { label: "Getting Started Guide", icon: BookOpen, href: "/onboarding" },
  { label: "Agent Configuration", icon: Bot, href: "/dashboard/agents" },
  {
    label: "Managing Integrations",
    icon: Plug,
    href: "/settings/integrations",
  },
  { label: "Team Management", icon: Users, href: "/settings/team" },
  { label: "Billing & Plans", icon: CreditCard, href: "/settings/billing" },
  { label: "Reports & Analytics", icon: BarChart3, href: "/reports" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getContextForRoute(pathname: string): RouteContext {
  // Exact match first
  if (routeContextMap[pathname]) return routeContextMap[pathname];

  // Prefix match (longest first)
  const prefixes = Object.keys(routeContextMap).sort(
    (a, b) => b.length - a.length
  );
  for (const prefix of prefixes) {
    if (pathname.startsWith(prefix)) return routeContextMap[prefix];
  }

  return defaultContext;
}

function matchChatResponse(input: string): ChatResponse {
  // First try exact match against routeContextMap suggestions
  for (const ctx of Object.values(routeContextMap)) {
    for (const s of ctx.suggestions) {
      if (s.question.toLowerCase() === input.toLowerCase()) {
        return {
          message: s.answer,
          link: s.link ? { label: "Go there \u2192", href: s.link } : undefined,
        };
      }
    }
  }

  // Then try regex patterns
  for (const { pattern, response } of chatResponsePatterns) {
    if (pattern.test(input)) return response;
  }

  return fallbackResponse;
}

function getAllSuggestions(): Suggestion[] {
  const all: Suggestion[] = [];
  for (const ctx of Object.values(routeContextMap)) {
    all.push(...ctx.suggestions);
  }
  all.push(...defaultContext.suggestions);
  return all;
}

let msgIdCounter = 0;
function nextMsgId(): string {
  return `msg-${++msgIdCounter}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Streaming text hook
// ---------------------------------------------------------------------------

function useStreamingText(text: string, active: boolean, speed = 25) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);

    const words = text.split(" ");
    let i = 0;

    const interval = setInterval(() => {
      i++;
      setDisplayed(words.slice(0, i).join(" "));
      if (i >= words.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function StreamingMessage({
  text,
  shouldStream,
  onDone,
}: {
  text: string;
  shouldStream: boolean;
  onDone?: () => void;
}) {
  const { displayed, done } = useStreamingText(text, shouldStream, 30);

  useEffect(() => {
    if (done && onDone) onDone();
  }, [done, onDone]);

  return (
    <span>
      {displayed}
      {!done && (
        <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-primary/60" />
      )}
    </span>
  );
}

function ChatBubble({
  msg,
  onFeedback,
  onLinkClick,
}: {
  msg: ChatMessage;
  onFeedback?: () => void;
  onLinkClick?: () => void;
}) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const isUser = msg.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isUser
            ? "bg-primary/15 text-primary"
            : "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
        )}
      >
        {isUser ? "You" : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[85%] space-y-2",
          isUser ? "text-right" : ""
        )}
      >
        <div
          className={cn(
            "inline-block rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-muted/80 text-foreground"
          )}
        >
          {msg.role === "assistant" && !msg.revealed ? (
            <StreamingMessage
              text={msg.text}
              shouldStream={true}
              onDone={onFeedback}
            />
          ) : (
            msg.text
          )}
        </div>

        {/* Deep link button */}
        {msg.link && (
          <div className={isUser ? "flex justify-end" : ""}>
            <Link
              href={msg.link.href}
              onClick={onLinkClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {msg.link.label}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Feedback */}
        {msg.role === "assistant" && msg.revealed && !feedbackGiven && (
          <div className="flex items-center gap-1 pt-0.5">
            <span className="mr-1 text-[11px] text-muted-foreground">
              Was this helpful?
            </span>
            <button
              onClick={() => {
                setFeedbackGiven(true);
                toast.success("Thanks for your feedback!");
                console.log("[Help] Positive feedback for:", msg.id);
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
              aria-label="Helpful"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setFeedbackGiven(true);
                toast.success("Thanks for your feedback!");
                console.log("[Help] Negative feedback for:", msg.id);
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
              aria-label="Not helpful"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {feedbackGiven && msg.role === "assistant" && (
          <p className="text-[11px] text-muted-foreground/60">
            Feedback recorded
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"help" | "chat">("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Suggestion[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { role } = useRole();
  const pathname = usePathname();
  const router = useRouter();
  const canScheduleCall = role === "owner" || role === "admin";

  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const routeContext = useMemo(() => getContextForRoute(pathname), [pathname]);
  const allSuggestions = useMemo(() => getAllSuggestions(), []);

  // ---- Keyboard: Escape to close ----
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // ---- Focus management ----
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (mode === "help") {
        searchInputRef.current?.focus();
      } else {
        chatInputRef.current?.focus();
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [open, mode]);

  // ---- Scroll chat to bottom ----
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // ---- Search filter ----
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = allSuggestions.filter((s) =>
      s.question.toLowerCase().includes(q)
    );
    setSearchResults(results.slice(0, 8));
    setShowSearchResults(true);
  }, [searchQuery, allSuggestions]);

  // ---- Send chat message ----
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: nextMsgId(),
        role: "user",
        text: text.trim(),
      };

      const response = matchChatResponse(text);
      const assistantMsg: ChatMessage = {
        id: nextMsgId(),
        role: "assistant",
        text: response.message,
        link: response.link,
        revealed: false,
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [...prev, assistantMsg]);
      }, 600);
    },
    []
  );

  // ---- Handle suggestion click (Quick Help -> Chat) ----
  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      setMode("chat");
      setShowSearchResults(false);
      setSearchQuery("");

      const userMsg: ChatMessage = {
        id: nextMsgId(),
        role: "user",
        text: suggestion.question,
        revealed: true,
      };

      const assistantMsg: ChatMessage = {
        id: nextMsgId(),
        role: "assistant",
        text: suggestion.answer,
        link: suggestion.link
          ? { label: "Go there \u2192", href: suggestion.link }
          : undefined,
        revealed: false,
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
        setChatMessages((prev) => [...prev, assistantMsg]);
      }, 600);
    },
    []
  );

  // ---- Mark messages as revealed after streaming ----
  const markRevealed = useCallback((msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, revealed: true } : m))
    );
  }, []);

  // ---- Chat suggestion chips (shown in chat mode) ----
  const chatSuggestionChips = useMemo(() => {
    return routeContext.suggestions.slice(0, 3);
  }, [routeContext]);

  // ---- Reset on close ----
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    if (mode === "help") {
      setSearchQuery("");
      setShowSearchResults(false);
    }
  }, [mode]);

  const switchToChat = useCallback(() => {
    setMode("chat");
    setSearchQuery("");
    setShowSearchResults(false);
  }, []);

  const switchToHelp = useCallback(() => {
    setMode("help");
  }, []);

  return (
    <>
      {/* ---- Trigger Button ---- */}
      <button
        onClick={open ? handleClose : handleOpen}
        className={cn(
          "fixed bottom-20 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 sm:bottom-6 sm:h-14 sm:w-14",
          open
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-primary/25 hover:shadow-xl"
        )}
        aria-label={open ? "Close help panel" : "Open help panel"}
      >
        <div className="relative">
          <MessageCircleQuestion
            className={cn(
              "h-6 w-6 transition-all duration-300",
              open ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <X
            className={cn(
              "absolute inset-0 h-6 w-6 transition-all duration-300",
              open ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          />
        </div>
      </button>

      {/* ---- Backdrop ---- */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* ---- Panel ---- */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Help and support panel"
        aria-modal={open}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col border-l border-border bg-[var(--background)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* =============================== */}
        {/* MODE 1: QUICK HELP              */}
        {/* =============================== */}
        <div
          className={cn(
            "flex h-full flex-col transition-opacity duration-200",
            mode === "help"
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-foreground">
              Help &amp; Support
            </h2>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Search */}
            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSearchResults(true);
                }}
                onBlur={() => {
                  // Delay to allow click on results
                  setTimeout(() => setShowSearchResults(false), 200);
                }}
                className="w-full rounded-lg border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
              />

              {/* Search results dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-[var(--background)] shadow-lg">
                  {searchResults.map((s, i) => (
                    <button
                      key={i}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(s);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-foreground transition-colors hover:bg-muted/80"
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                      <span className="line-clamp-1">{s.question}</span>
                    </button>
                  ))}
                </div>
              )}

              {showSearchResults &&
                searchQuery.trim() &&
                searchResults.length === 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-[var(--background)] p-3 shadow-lg">
                    <p className="text-center text-xs text-muted-foreground">
                      No results. Try the AI assistant for more help.
                    </p>
                  </div>
                )}
            </div>

            {/* Contextual suggestions */}
            <div className="mb-5">
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested for {routeContext.title}
              </h3>
              <div className="space-y-1">
                {routeContext.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-foreground transition-colors hover:bg-muted/80"
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                    <span className="flex-1 line-clamp-2">{s.question}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-5">
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Links
              </h3>
              <div className="space-y-0.5">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={handleClose}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-muted/80"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1">{link.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* AI Assistant CTA */}
            <div className="mb-5">
              <button
                onClick={switchToChat}
                className="flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3.5 text-left transition-all hover:border-primary/30 hover:from-primary/10 hover:to-primary/15"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-foreground">
                    Ask Apex Assistant
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Chat with our AI for instant answers
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </button>
            </div>

            {/* Contact Support */}
            <div>
              <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Support
              </h3>
              <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3.5">
                <a
                  href="mailto:support@apexintelligence.ai"
                  className="flex items-center gap-2.5 text-[13px] text-foreground transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>support@apexintelligence.ai</span>
                  <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground/40" />
                </a>
                {canScheduleCall && (
                  <button
                    onClick={() => {
                      toast.success("Opening scheduling page...");
                      handleClose();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule a call
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-5 py-2.5">
            <p className="text-center text-[11px] text-muted-foreground">
              Apex Intelligence v1.0 &middot; Documentation
            </p>
          </div>
        </div>

        {/* =============================== */}
        {/* MODE 2: AI CHAT                 */}
        {/* =============================== */}
        <div
          className={cn(
            "flex h-full flex-col transition-opacity duration-200",
            mode === "chat"
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none absolute inset-0 opacity-0"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
            <button
              onClick={switchToHelp}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Back to help"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Apex Assistant
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat messages */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto px-4 py-4"
          >
            {/* Welcome message (always shown) */}
            {chatMessages.length === 0 && (
              <div className="space-y-4">
                {/* Bot intro */}
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="max-w-[85%]">
                    <div className="inline-block rounded-2xl rounded-bl-md bg-muted/80 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground">
                      Hi! I&apos;m your Apex assistant. Ask me anything about
                      using the platform.
                    </div>
                  </div>
                </div>

                {/* Suggestion chips */}
                <div className="ml-9 space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Suggested
                  </p>
                  {chatSuggestionChips.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="block w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-left text-[12px] text-foreground transition-colors hover:border-primary/20 hover:bg-muted/60"
                    >
                      {s.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat history */}
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  onFeedback={
                    msg.role === "assistant" && !msg.revealed
                      ? () => markRevealed(msg.id)
                      : undefined
                  }
                  onLinkClick={handleClose}
                />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted/80 px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat input */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type your question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isTyping) {
                    sendMessage(chatInput);
                  }
                }}
                disabled={isTyping}
                className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim() || isTyping}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
