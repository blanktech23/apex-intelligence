"use client";

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  summary: string;
  time: string;
  unread: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Estimate Engine completed 3 estimates",
    summary: "Roofing replacement, Kitchen remodel, and HVAC installation estimates are ready for review.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "warning",
    title: "Discovery Concierge needs approval",
    summary: "A new lead requires manual qualification before the agent can proceed with outreach.",
    time: "15 min ago",
    unread: true,
  },
  {
    id: "3",
    type: "error",
    title: "QuickBooks sync failed",
    summary: "Invoice sync encountered an authentication error. Re-authorization may be required.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "4",
    type: "info",
    title: "New team member joined",
    summary: "Sarah Mitchell has been added to the workspace with Viewer permissions.",
    time: "3 hours ago",
    unread: false,
  },
];

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: {
    icon: "text-green-400",
    dot: "bg-green-400",
    bg: "bg-green-400/10",
  },
  warning: {
    icon: "text-amber-400",
    dot: "bg-amber-400",
    bg: "bg-amber-400/10",
  },
  error: {
    icon: "text-red-400",
    dot: "bg-red-400",
    bg: "bg-red-400/10",
  },
  info: {
    icon: "text-cyan-400",
    dot: "bg-cyan-400",
    bg: "bg-cyan-400/10",
  },
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-2rem))] origin-top-right animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
        <div className="overflow-hidden rounded-xl border border-border bg-[var(--background)] shadow-2xl shadow-black/30">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
              Mark all as read
            </button>
          </div>

          {/* Notification list */}
          <div className="max-h-[400px] overflow-y-auto">
            {mockNotifications.map((notification) => {
              const Icon = iconMap[notification.type];
              const colors = colorMap[notification.type];

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/50",
                    notification.unread && "bg-muted/30"
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      colors.bg
                    )}
                  >
                    <Icon className={cn("h-4 w-4", colors.icon)} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {notification.title}
                      </p>
                      {notification.unread && (
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            colors.dot
                          )}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {notification.summary}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/60">
                      {notification.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <button className="w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              View all notifications
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
