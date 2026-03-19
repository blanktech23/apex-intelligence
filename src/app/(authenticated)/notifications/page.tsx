"use client";

import { useState } from "react";
import { PaginationBar } from "@/components/ui/pagination-bar";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  XCircle,
  UserPlus,
  CreditCard,
  Bot,
  MessageSquare,
  Shield,
  Server,
  ArrowUpCircle,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types & config                                                     */
/* ------------------------------------------------------------------ */

type NotificationType = "info" | "warning" | "success" | "error";
type NotificationCategory = "all" | "unread" | "mentions" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  category: NotificationCategory;
  action?: { label: string; href: string };
}

const typeConfig: Record<
  NotificationType,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    iconBg: string;
    border: string;
  }
> = {
  info: {
    icon: Info,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    border: "border-l-blue-500/40",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    border: "border-l-amber-500/40",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    border: "border-l-green-500/40",
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
    border: "border-l-red-500/40",
  },
};

const filterTabs: { value: NotificationCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "mentions", label: "Mentions" },
  { value: "system", label: "System" },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const notifications: Notification[] = [
  {
    id: "n-001",
    type: "error",
    title: "Escalation requires immediate attention",
    description:
      "Discovery Concierge flagged a high-priority lead from Johnson Remodeling that needs manual review within 30 minutes.",
    timestamp: "2 minutes ago",
    read: false,
    category: "mentions",
    action: { label: "View Escalation", href: "/escalations/esc-001" },
  },
  {
    id: "n-002",
    type: "warning",
    title: "Estimate Engine accuracy drop detected",
    description:
      "The Estimate Engine's cost prediction accuracy dropped below 90% threshold over the last 24 hours. Review recent estimates for potential issues.",
    timestamp: "15 minutes ago",
    read: false,
    category: "system",
    action: { label: "Review", href: "/dashboard/agents/estimating" },
  },
  {
    id: "n-003",
    type: "success",
    title: "Support Agent resolved 50 tickets today",
    description:
      "New daily record! The Support Agent handled 50 customer tickets with a 96.2% satisfaction rate. Average resolution time: 3.4 minutes.",
    timestamp: "34 minutes ago",
    read: false,
    category: "system",
  },
  {
    id: "n-004",
    type: "info",
    title: "Sarah Chen mentioned you in a comment",
    description:
      '@joseph "Can you review the updated bid for the Westfield project? The Operations Controller flagged a potential scheduling conflict."',
    timestamp: "1 hour ago",
    read: false,
    category: "mentions",
    action: { label: "View", href: "/projects/westfield" },
  },
  {
    id: "n-005",
    type: "warning",
    title: "Monthly billing threshold approaching",
    description:
      "AI agent usage is at 82% of your monthly budget ($342 of $420). Consider upgrading your plan or adjusting agent activity limits.",
    timestamp: "2 hours ago",
    read: false,
    category: "system",
    action: { label: "Review", href: "/settings/billing" },
  },
  {
    id: "n-006",
    type: "success",
    title: "QuickBooks sync completed",
    description:
      "Successfully synced 147 transactions and 23 invoices from QuickBooks. All records are up to date as of 2:30 PM.",
    timestamp: "3 hours ago",
    read: true,
    category: "system",
  },
  {
    id: "n-007",
    type: "info",
    title: "Team invite accepted",
    description:
      "Emily Rodriguez accepted your invitation and joined the team as a Manager. She now has access to all agent dashboards.",
    timestamp: "4 hours ago",
    read: true,
    category: "all",
  },
  {
    id: "n-008",
    type: "warning",
    title: "Schedule conflict detected",
    description:
      "The Project Orchestrator found a double-booking for Crew A on March 22. Both the Riverside and Oak Park projects overlap from 9 AM - 1 PM.",
    timestamp: "5 hours ago",
    read: true,
    category: "mentions",
    action: { label: "View Escalation", href: "/escalations/esc-012" },
  },
  {
    id: "n-009",
    type: "success",
    title: "Design Spec Assistant re-enabled",
    description:
      "The Design Spec Assistant has been re-activated after maintenance. All pending document extractions will resume processing.",
    timestamp: "6 hours ago",
    read: true,
    category: "system",
  },
  {
    id: "n-010",
    type: "error",
    title: "Gmail integration connection lost",
    description:
      "The OAuth token for your Gmail integration has expired. Reconnect to resume email thread syncing and contact updates.",
    timestamp: "8 hours ago",
    read: true,
    category: "system",
    action: { label: "Reconnect", href: "/settings/integrations" },
  },
  {
    id: "n-011",
    type: "info",
    title: "Weekly performance report ready",
    description:
      "Your weekly AI agent performance report is available. This week: 12,847 conversations handled, 94.2% resolution rate.",
    timestamp: "1 day ago",
    read: true,
    category: "all",
    action: { label: "View Report", href: "/reports" },
  },
  {
    id: "n-012",
    type: "info",
    title: "System update scheduled",
    description:
      "Apex Intelligence v2.4.1 will be deployed on Sunday at 2:00 AM EST. Expected downtime: 5 minutes. New features include improved agent memory.",
    timestamp: "2 days ago",
    read: true,
    category: "system",
    action: { label: "Dismiss", href: "#" },
  },
];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "n-001": AlertTriangle,
  "n-002": Bot,
  "n-003": CheckCircle2,
  "n-004": MessageSquare,
  "n-005": CreditCard,
  "n-006": ArrowUpCircle,
  "n-007": UserPlus,
  "n-008": AlertTriangle,
  "n-009": Bot,
  "n-010": XCircle,
  "n-011": Shield,
  "n-012": Server,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [readState, setReadState] = useState<Record<string, boolean>>(
    Object.fromEntries(notifications.map((n) => [n.id, n.read]))
  );
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const unreadCount = Object.values(readState).filter((v) => !v).length;

  const handleMarkAllRead = () => {
    setReadState(Object.fromEntries(Object.keys(readState).map((k) => [k, true])));
    toast.success("All notifications marked as read");
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    setReadState((prev) => ({ ...prev, [id]: true }));
    toast.success("Notification dismissed");
  };

  const filtered = notifications.filter((n) => {
    if (dismissed.has(n.id)) return false;
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !readState[n.id];
    return n.category === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="flex h-6 items-center rounded-full bg-indigo-500/15 px-2.5 text-xs font-semibold text-indigo-400 ring-1 ring-indigo-500/20">
              {unreadCount} unread
            </span>
          )}
        </div>
        <Button
          onClick={handleMarkAllRead}
          variant="outline"
          className="h-9 gap-2 rounded-lg border-border px-4 text-xs font-medium text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark All Read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="glass flex items-center gap-1 rounded-lg p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.value === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500/20 px-1 text-[10px] text-indigo-300">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Bell className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground">No notifications to show</p>
          </div>
        ) : (
          filtered.map((notification) => {
            const config = typeConfig[notification.type];
            const TypeIcon = config.icon;
            const isUnread = !readState[notification.id];

            return (
              <div
                key={notification.id}
                onClick={() =>
                  setReadState((prev) => ({ ...prev, [notification.id]: true }))
                }
                className={`glass cursor-pointer rounded-xl border-l-2 p-4 transition-all duration-200 hover:bg-muted/40 ${
                  config.border
                } ${isUnread ? "bg-muted/30" : ""}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`mt-0.5 shrink-0 rounded-lg p-2 ${config.iconBg}`}>
                    <TypeIcon className={`size-4 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-medium ${
                            isUnread ? "text-foreground" : "text-foreground/80"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {isUnread && (
                          <span className="size-2 shrink-0 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground/60">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {notification.description}
                    </p>
                    {notification.action && (
                      <div className="mt-3 flex items-center gap-2">
                        {notification.action.label === "Dismiss" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismiss(notification.id);
                            }}
                            className="h-7 rounded-md px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                          >
                            Dismiss
                          </Button>
                        ) : (
                          <Link href={notification.action.href}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReadState((prev) => ({ ...prev, [notification.id]: true }));
                              }}
                              className="h-7 rounded-md px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                            >
                              {notification.action.label}
                            </Button>
                          </Link>
                        )}
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadState((prev) => ({ ...prev, [notification.id]: true }));
                              toast.success("Marked as read");
                            }}
                            className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalItems={notifications.length}
        itemsPerPage={25}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
