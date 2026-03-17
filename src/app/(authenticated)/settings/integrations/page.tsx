"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  PlugZap,
  RefreshCw,
  X,
  XCircle,
  MessageSquare,
  Zap,
  CreditCard,
  Phone,
  HardDrive,
  Settings,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";

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

const integrations: Integration[] = [
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const { config } = useRole();
  const connectedCount = integrations.filter(
    (i) => i.status === "connected"
  ).length;

  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "ok" | "failed">>({});
  const [disconnectModal, setDisconnectModal] = useState<string | null>(null);
  const [disconnectInput, setDisconnectInput] = useState("");
  const [syncLogsOpen, setSyncLogsOpen] = useState(false);

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

  return (
    <div className="space-y-6">
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
