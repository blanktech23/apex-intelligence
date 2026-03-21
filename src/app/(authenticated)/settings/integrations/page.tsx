"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  HardDrive,
  Loader2,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  PlugZap,
  RefreshCw,
  Settings,
  Shield,
  Wrench,
  X,
  XCircle,
  Zap,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types & config                                                     */
/* ------------------------------------------------------------------ */

type IntegrationStatus = "connected" | "not_connected";
type HealthStatus = "healthy" | "sync_delayed" | "reconnection_required";

interface Integration {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  status: IntegrationStatus;
  lastSync?: string;
  health?: HealthStatus;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    name: "QuickBooks",
    description: "Accounting, invoicing, and financial reporting sync",
    icon: PlugZap,
    iconBg: "bg-emerald-500/15",
    status: "connected",
    lastSync: "2 min ago",
    health: "healthy",
  },
  {
    name: "Google Calendar",
    description: "Scheduling, availability, and appointment management",
    icon: Calendar,
    iconBg: "bg-blue-500/15",
    status: "connected",
    lastSync: "5 min ago",
    health: "sync_delayed",
  },
  {
    name: "Gmail",
    description: "Email communication threads and contact sync",
    icon: Mail,
    iconBg: "bg-red-500/15",
    status: "connected",
    lastSync: "1 min ago",
    health: "reconnection_required",
  },
  {
    name: "JobTread",
    description: "Construction project management and job costing",
    icon: HardDrive,
    iconBg: "bg-orange-500/15",
    status: "not_connected",
  },
  {
    name: "Slack",
    description: "Team messaging, notifications, and alert channels",
    icon: MessageSquare,
    iconBg: "bg-purple-500/15",
    status: "not_connected",
  },
  {
    name: "Zapier",
    description: "Workflow automation across 5,000+ apps",
    icon: Zap,
    iconBg: "bg-amber-500/15",
    status: "not_connected",
  },
  {
    name: "Stripe",
    description: "Payment processing, subscriptions, and revenue tracking",
    icon: CreditCard,
    iconBg: "bg-indigo-500/15",
    status: "connected",
    lastSync: "10 min ago",
    health: "healthy",
  },
  {
    name: "Twilio",
    description: "SMS, voice calls, and communication APIs",
    icon: Phone,
    iconBg: "bg-cyan-500/15",
    status: "not_connected",
  },
];

const statusConfig: Record<
  IntegrationStatus,
  {
    badge: string;
    badgeText: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    borderAccent: string;
  }
> = {
  connected: {
    badge: "bg-emerald-400/10",
    badgeText: "text-emerald-400",
    icon: CheckCircle2,
    label: "Connected",
    borderAccent: "border-l-emerald-400/50",
  },
  not_connected: {
    badge: "bg-muted",
    badgeText: "text-muted-foreground",
    icon: XCircle,
    label: "Not connected",
    borderAccent: "border-l-border",
  },
};

const healthConfig: Record<
  HealthStatus,
  { dot: string; label: string; textColor: string }
> = {
  healthy: {
    dot: "bg-emerald-400",
    label: "Healthy",
    textColor: "text-emerald-400",
  },
  sync_delayed: {
    dot: "bg-amber-400",
    label: "Sync delayed",
    textColor: "text-amber-400",
  },
  reconnection_required: {
    dot: "bg-red-400",
    label: "Reconnection required",
    textColor: "text-red-400",
  },
};

/* ------------------------------------------------------------------ */
/*  Sync Log Data                                                      */
/* ------------------------------------------------------------------ */

const syncLogs = [
  { time: "Mar 16, 2:30 PM", integration: "QuickBooks", status: "success" as const, detail: "47 invoices synced" },
  { time: "Mar 16, 2:28 PM", integration: "Stripe", status: "success" as const, detail: "12 payments reconciled" },
  { time: "Mar 16, 2:15 PM", integration: "Google Calendar", status: "warning" as const, detail: "2 events skipped (missing attendees)" },
  { time: "Mar 16, 1:45 PM", integration: "QuickBooks", status: "success" as const, detail: "3 expense reports synced" },
  { time: "Mar 16, 1:15 PM", integration: "Gmail", status: "error" as const, detail: "OAuth token expired, reconnection required" },
  { time: "Mar 16, 12:30 PM", integration: "Google Calendar", status: "success" as const, detail: "18 appointments synced" },
  { time: "Mar 16, 12:00 PM", integration: "Stripe", status: "success" as const, detail: "Monthly revenue snapshot updated" },
  { time: "Mar 16, 11:30 AM", integration: "QuickBooks", status: "warning" as const, detail: "1 invoice skipped (duplicate detected)" },
  { time: "Mar 16, 11:00 AM", integration: "Gmail", status: "success" as const, detail: "156 emails indexed" },
  { time: "Mar 16, 10:30 AM", integration: "Google Calendar", status: "success" as const, detail: "Weekly schedule synced" },
];

const syncStatusStyles = {
  success: { bg: "bg-emerald-400/10", text: "text-emerald-400", label: "Success" },
  warning: { bg: "bg-amber-400/10", text: "text-amber-400", label: "Warning" },
  error: { bg: "bg-red-400/10", text: "text-red-400", label: "Error" },
};

/* ------------------------------------------------------------------ */
/*  Agent cross-reference                                              */
/* ------------------------------------------------------------------ */

interface AgentRef {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

const agentDirectory: Record<string, AgentRef> = {
  "discovery-concierge": {
    id: "discovery-concierge",
    name: "Discovery Concierge",
    icon: Mail,
    description: "Qualifies and routes inbound leads automatically",
  },
  "estimate-engine": {
    id: "estimate-engine",
    name: "Estimate Engine",
    icon: Calculator,
    description: "Generates detailed project cost estimates from specs and pricing data",
  },
  "operations-controller": {
    id: "operations-controller",
    name: "Operations Controller",
    icon: Wrench,
    description: "Manages billing, AP/AR tracking, lien waivers, and QuickBooks integration",
  },
  "executive-navigator": {
    id: "executive-navigator",
    name: "Executive Navigator",
    icon: BarChart3,
    description: "Surfaces KPIs, financial insights, and strategic briefings for leadership",
  },
  "project-orchestrator": {
    id: "project-orchestrator",
    name: "Project Orchestrator",
    icon: Calendar,
    description: "Manages crew scheduling, equipment, and appointment coordination",
  },
  "design-spec-assistant": {
    id: "design-spec-assistant",
    name: "Design Spec Assistant",
    icon: Palette,
    description: "Extracts specs and submittals from design documents",
  },
};

const integrationAgentMap: Record<string, string[]> = {
  JobTread: [
    "discovery-concierge",
    "estimate-engine",
    "executive-navigator",
    "project-orchestrator",
    "design-spec-assistant",
  ],
  QuickBooks: ["estimate-engine", "operations-controller", "executive-navigator"],
  "Google Calendar": ["discovery-concierge", "project-orchestrator", "design-spec-assistant"],
  Gmail: ["discovery-concierge"],
  Stripe: ["operations-controller"],
  Slack: [],
  Zapier: [],
  Twilio: [],
};

function AgentPills({
  integrationName,
  isConnected,
}: {
  integrationName: string;
  isConnected: boolean;
}) {
  const agentIds = integrationAgentMap[integrationName] ?? [];
  const agents = agentIds
    .map((id) => agentDirectory[id])
    .filter(Boolean);

  if (isConnected && agents.length > 0) {
    return (
      <div className="mt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-medium text-muted-foreground/60 mr-0.5">
            Used by
          </span>
          <TooltipProvider>
            {agents.map((agent) => {
              const AgentIcon = agent.icon;
              return (
                <Tooltip key={agent.id}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={`/dashboard/agents/${agent.id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-foreground/70 transition-colors hover:bg-primary/15 hover:text-foreground"
                      />
                    }
                  >
                    <AgentIcon className="h-2.5 w-2.5" />
                    {agent.name}
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {agent.description}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>
    );
  }

  if (!isConnected && agents.length > 0) {
    return (
      <div className="mt-3">
        <div className="flex items-center gap-1.5 text-amber-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span className="text-[10px] font-semibold">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} need{agents.length === 1 ? "s" : ""} this integration
          </span>
        </div>
        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground/60">
          {agents.map((a) => a.name).join(", ")}
        </p>
      </div>
    );
  }

  if (!isConnected && agents.length === 0) {
    return (
      <div className="mt-3">
        <p className="text-[10px] text-muted-foreground/40">
          No agents configured for this integration yet
        </p>
      </div>
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  OAuth Permission Scopes                                            */
/* ------------------------------------------------------------------ */

const integrationScopes: Record<string, string[]> = {
  JobTread: [
    "Read project data",
    "Read/write estimates",
    "Read contact information",
  ],
  "Google Calendar": [
    "Read calendar events",
    "Check availability",
    "Create appointments",
  ],
  QuickBooks: [
    "Read financial reports",
    "Read invoices and payments",
    "Read vendor data",
  ],
  Gmail: [
    "Create and send email drafts",
    "Read email threads",
  ],
  Slack: [
    "Send messages to channels",
    "Read channel history",
  ],
  Zapier: [
    "Trigger workflows",
    "Receive webhook events",
  ],
  Twilio: [
    "Send SMS messages",
    "Make voice calls",
  ],
};

const integrationSyncItems: Record<string, string[]> = {
  JobTread: ["Importing projects...", "Importing contacts...", "Setting up webhooks..."],
  "Google Calendar": ["Importing events...", "Syncing availability...", "Setting up webhooks..."],
  QuickBooks: ["Importing invoices...", "Importing vendors...", "Setting up webhooks..."],
  Gmail: ["Indexing email threads...", "Syncing contacts...", "Setting up webhooks..."],
  Slack: ["Joining channels...", "Importing history...", "Setting up webhooks..."],
  Zapier: ["Registering triggers...", "Configuring webhooks...", "Testing connection..."],
  Twilio: ["Verifying phone numbers...", "Configuring SMS...", "Setting up webhooks..."],
};

/* ------------------------------------------------------------------ */
/*  OAuth Connect Modal                                                */
/* ------------------------------------------------------------------ */

type OAuthStep = "permissions" | "connecting" | "sync";

function OAuthConnectModal({
  integration,
  open,
  onOpenChange,
  onConnected,
}: {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (name: string) => void;
}) {
  const [step, setStep] = useState<OAuthStep>("permissions");
  const [connectSubStep, setConnectSubStep] = useState<"redirecting" | "success">("redirecting");
  const [syncProgress, setSyncProgress] = useState(0);
  const [completedSyncItems, setCompletedSyncItems] = useState<number[]>([]);
  const [syncComplete, setSyncComplete] = useState(false);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  }, []);

  // Clean up timers when modal closes
  useEffect(() => {
    if (!open) {
      clearAllTimers();
    }
  }, [open, clearAllTimers]);

  // Step 2: Simulated redirect + callback
  useEffect(() => {
    if (step !== "connecting") return;

    addTimer(() => {
      setConnectSubStep("success");
      addTimer(() => {
        setStep("sync");
      }, 1000);
    }, 2000);

    return clearAllTimers;
  }, [step, addTimer, clearAllTimers]);

  // Step 3: Sync progress animation
  useEffect(() => {
    if (step !== "sync" || !integration) return;

    const items = integrationSyncItems[integration.name] ?? [
      "Importing data...",
      "Configuring settings...",
      "Setting up webhooks...",
    ];

    const totalDuration = 3000;
    const itemDelay = totalDuration / items.length;

    // Animate progress bar
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / totalDuration) * 100, 100);
      setSyncProgress(pct);
      if (pct >= 100) clearInterval(progressInterval);
    }, 50);
    timerRefs.current.push(progressInterval as unknown as ReturnType<typeof setTimeout>);

    // Show sync items one by one
    items.forEach((_, idx) => {
      addTimer(() => {
        setCompletedSyncItems((prev) => [...prev, idx]);
      }, itemDelay * (idx + 1));
    });

    // Mark complete
    addTimer(() => {
      setSyncComplete(true);
    }, totalDuration + 200);

    return () => {
      clearInterval(progressInterval);
    };
  }, [step, integration, addTimer]);

  if (!integration) return null;

  const Icon = integration.icon;
  const scopes = integrationScopes[integration.name] ?? [];
  const syncItems = integrationSyncItems[integration.name] ?? [
    "Importing data...",
    "Configuring settings...",
    "Setting up webhooks...",
  ];

  const handleContinue = () => {
    setConnectSubStep("redirecting");
    setStep("connecting");
  };

  const handleDone = () => {
    onConnected(integration.name);
    onOpenChange(false);
    toast.success(`${integration.name} connected successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-[#0F1629] border-border"
        showCloseButton={step === "permissions"}
      >
        {/* ---- Step 1: Review Permissions ---- */}
        {step === "permissions" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${integration.iconBg}`}
                >
                  <Icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    Connect {integration.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Review permissions before connecting
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-3">
                  Apex Intelligence will request access to:
                </h4>
                <ul className="space-y-2.5">
                  {scopes.map((scope) => (
                    <li key={scope} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/90">{scope}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-emerald-400/5 border border-emerald-400/10 px-3 py-2.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-relaxed text-emerald-400/80">
                  Your data is encrypted with AES-256-GCM and never shared with
                  third parties.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 px-4 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleContinue}
                className="h-8 gap-1.5 px-4 text-xs font-semibold bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
              >
                <ExternalLink className="h-3 w-3" />
                Continue to {integration.name}
              </Button>
            </div>
          </>
        )}

        {/* ---- Step 2: Connecting (Simulated Redirect) ---- */}
        {step === "connecting" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-5">
            {connectSubStep === "redirecting" ? (
              <>
                <div className="relative">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${integration.iconBg}`}
                  >
                    <Icon className="h-7 w-7 text-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F1629] ring-2 ring-border">
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    Redirecting to {integration.name}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complete authorization in the popup window
                  </p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15">
                    <Check className="h-7 w-7 text-emerald-400" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-emerald-400">
                    Authorization successful
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Setting up your connection...
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ---- Step 3: Initial Sync ---- */}
        {step === "sync" && (
          <div className="space-y-5 py-2">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">
                {syncComplete ? "Connection Complete" : "Initial Sync"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {syncComplete
                  ? `Connected successfully! Your agents can now access ${integration.name} data.`
                  : "Syncing your data..."}
              </DialogDescription>
            </DialogHeader>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground tabular-nums">
                  {Math.round(syncProgress)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-100 ease-linear"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>

            {/* Sync items */}
            <div className="space-y-2">
              {syncItems.map((item, idx) => {
                const isCompleted = completedSyncItems.includes(idx);
                const isActive =
                  !isCompleted &&
                  (idx === 0 || completedSyncItems.includes(idx - 1));

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-400/5"
                        : isActive
                        ? "bg-muted/30"
                        : "opacity-40"
                    }`}
                  >
                    {isCompleted ? (
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
                        <Check className="h-2.5 w-2.5 text-emerald-400" />
                      </div>
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 shrink-0 text-primary animate-spin" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-border" />
                    )}
                    <span
                      className={
                        isCompleted
                          ? "text-emerald-400/90 font-medium"
                          : isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {isCompleted ? item.replace("...", "") : item}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className="ml-auto h-3 w-3 text-emerald-400/60" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Done button */}
            {syncComplete && (
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={handleDone}
                  className="h-8 gap-1.5 px-5 text-xs font-semibold bg-emerald-500 text-white transition-all hover:bg-emerald-500/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                >
                  <Check className="h-3 w-3" />
                  Done
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const { config } = useRole();
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const connectedCount = integrations.filter(
    (i) => i.status === "connected"
  ).length;

  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "ok" | "failed">>({});
  const [disconnectModal, setDisconnectModal] = useState<string | null>(null);
  const [disconnectInput, setDisconnectInput] = useState("");
  const [syncLogsOpen, setSyncLogsOpen] = useState(false);

  // OAuth connect modal state
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [oauthTarget, setOauthTarget] = useState<Integration | null>(null);
  const [oauthModalKey, setOauthModalKey] = useState(0);

  const handleTestConnection = (name: string) => {
    setTestingConnection(name);
    setTestResults((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    // Simulate test
    setTimeout(() => {
      setTestingConnection(null);
      // Gmail fails to match the reconnection_required health
      const result = name === "Gmail" ? "failed" : "ok";
      setTestResults((prev) => ({ ...prev, [name]: result }));
      // Clear result after 4 seconds
      setTimeout(() => {
        setTestResults((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }, 4000);
    }, 1500);
  };

  const handleDisconnectConfirm = () => {
    // In a real app this would disconnect; for mockup just close
    setDisconnectModal(null);
    setDisconnectInput("");
  };

  const handleConnectClick = (integration: Integration) => {
    setOauthTarget(integration);
    setOauthModalKey((k) => k + 1);
    setOauthModalOpen(true);
  };

  const handleOauthConnected = (name: string) => {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.name === name
          ? { ...i, status: "connected" as IntegrationStatus, lastSync: "Just now", health: "healthy" as HealthStatus }
          : i
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* OAuth Connect Modal */}
      <OAuthConnectModal
        key={oauthModalKey}
        integration={oauthTarget}
        open={oauthModalOpen}
        onOpenChange={setOauthModalOpen}
        onConnected={handleOauthConnected}
      />

      {/* Disconnect Confirmation Modal */}
      {disconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 glass-strong rounded-2xl border border-border p-6 shadow-2xl">
            <button
              onClick={() => {
                setDisconnectModal(null);
                setDisconnectInput("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Disconnect {disconnectModal}?
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action cannot be undone easily
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              All synced data will be preserved, but new syncs will stop
              immediately. To confirm, type{" "}
              <span className="font-mono font-semibold text-foreground">
                {disconnectModal}
              </span>{" "}
              below.
            </p>

            <input
              value={disconnectInput}
              onChange={(e) => setDisconnectInput(e.target.value)}
              placeholder={`Type "${disconnectModal}" to confirm`}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-red-400/40 focus:outline-none focus:ring-1 focus:ring-red-400/30 transition-colors"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDisconnectModal(null);
                  setDisconnectInput("");
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <Button
                disabled={disconnectInput !== disconnectModal}
                onClick={handleDisconnectConfirm}
                className="h-9 gap-2 rounded-lg bg-red-500 px-5 text-sm font-semibold text-white transition-all hover:bg-red-500/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-500 disabled:hover:shadow-none"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your tools to let agents work across your business systems.{" "}
          <span className="text-foreground/60">
            {connectedCount} of {integrations.length} connected
          </span>
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const statusCfg = statusConfig[integration.status];
          const StatusIcon = statusCfg.icon;
          const isConnected = integration.status === "connected";
          const health = integration.health
            ? healthConfig[integration.health]
            : null;

          return (
            <div
              key={integration.name}
              className={`group glass rounded-xl border-l-2 p-5 transition-all duration-200 hover:bg-muted/40 ${statusCfg.borderAccent}`}
            >
              {/* Top row: icon + status */}
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${integration.iconBg}`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isConnected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusCfg.badge} ${statusCfg.badgeText}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusCfg.label}
                  </div>
                  {/* Health indicator */}
                  {isConnected && health && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${health.dot} ${
                          integration.health === "reconnection_required"
                            ? "animate-pulse"
                            : ""
                        }`}
                      />
                      <span
                        className={`text-[10px] font-medium ${health.textColor}`}
                      >
                        {health.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name + description */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {integration.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {integration.description}
                </p>
              </div>

              {/* Test Connection Result */}
              {isConnected && testResults[integration.name] && (
                <div className="mt-3">
                  {testResults[integration.name] === "ok" ? (
                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Connection OK
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-lg bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-400">
                      <XCircle className="h-3 w-3" />
                      Connection failed
                    </div>
                  )}
                </div>
              )}

              {/* Agent cross-reference */}
              <AgentPills
                integrationName={integration.name}
                isConnected={isConnected}
              />

              {/* Footer: last sync + actions */}
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                {isConnected && integration.lastSync ? (
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-[11px] text-muted-foreground/60">
                      Synced {integration.lastSync}
                    </span>
                  </div>
                ) : (
                  <span />
                )}

                {isConnected ? (
                  <div className="flex items-center gap-2">
                    {/* Test Connection */}
                    {config.canConfigureAgents && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(integration.name)}
                        disabled={testingConnection === integration.name}
                        className="h-7 gap-1.5 rounded-md border-border px-2.5 text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground disabled:opacity-60"
                      >
                        {testingConnection === integration.name ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Test
                      </Button>
                    )}
                    {/* Configure */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.info(`Opening ${integration.name} settings...`)}
                      className="h-7 gap-1.5 rounded-md border-border px-3 text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                    >
                      <Settings className="h-3 w-3" />
                      Configure
                    </Button>
                    {/* Disconnect */}
                    {config.canConfigureAgents && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDisconnectModal(integration.name)}
                        className="h-7 gap-1.5 rounded-md border-red-500/20 px-2.5 text-xs font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnectClick(integration)}
                    className="h-7 gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* — Recent Sync Activity — */}
      <div className="glass rounded-xl overflow-hidden">
        <button
          onClick={() => setSyncLogsOpen(!syncLogsOpen)}
          className="flex w-full items-center gap-2 p-5 text-left transition-colors hover:bg-muted/20"
        >
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Recent Sync Activity
          </h3>
          <span className="ml-2 text-[11px] text-muted-foreground/50">
            {syncLogs.length} entries
          </span>
          <span className="ml-auto">
            {syncLogsOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </button>

        {syncLogsOpen && (
          <div className="border-t border-border">
            <div className="divide-y divide-border">
              {syncLogs.map((log, i) => {
                const style = syncStatusStyles[log.status];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/20"
                  >
                    <span className="shrink-0 text-[11px] text-muted-foreground/50 w-[120px]">
                      {log.time}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-foreground w-[120px]">
                      {log.integration}
                    </span>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-current/20 ${style.bg} ${style.text}`}
                    >
                      {style.label}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                      {log.detail}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
