"use client";

import { useState, useEffect } from "react";
import { Bell, Lock, Mail, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Notification categories                                            */
/* ------------------------------------------------------------------ */

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  defaultEmail: boolean;
  defaultInApp: boolean;
  lockEmail?: (role: string) => boolean;
  lockInApp?: (role: string) => boolean;
  lockNote?: string;
}

const categories: NotificationCategory[] = [
  {
    id: "agent-alerts",
    label: "Agent alerts",
    description: "Errors, completions, and status changes",
    defaultEmail: true,
    defaultInApp: true,
  },
  {
    id: "escalation-requests",
    label: "Escalation requests",
    description: "Tasks requiring human review or approval",
    defaultEmail: true,
    defaultInApp: true,
  },
  {
    id: "daily-briefing",
    label: "Daily briefing",
    description: "Summary of agent activity and key metrics",
    defaultEmail: true,
    defaultInApp: false,
  },
  {
    id: "team-activity",
    label: "Team activity",
    description: "Member joins, role changes, and invitations",
    defaultEmail: false,
    defaultInApp: true,
  },
  {
    id: "billing-alerts",
    label: "Billing alerts",
    description: "Payment confirmations, usage warnings, plan changes",
    defaultEmail: true,
    defaultInApp: true,
    lockEmail: (role) => role === "owner" || role === "admin",
    lockInApp: (role) => role === "owner" || role === "admin",
    lockNote: "Locked on for Owner & Admin roles",
  },
  {
    id: "security-alerts",
    label: "Security alerts",
    description: "New logins, MFA changes, password resets",
    defaultEmail: true,
    defaultInApp: true,
    lockEmail: () => true,
    lockInApp: () => true,
    lockNote: "Locked on for all roles",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NotificationsSettingsPage() {
  const { role } = useRole();

  // Build initial state from defaults
  const buildInitialState = () => {
    const state: Record<string, { email: boolean; inApp: boolean }> = {};
    for (const cat of categories) {
      state[cat.id] = {
        email: cat.defaultEmail,
        inApp: cat.defaultInApp,
      };
    }
    return state;
  };

  const [prefs, setPrefs] = useState(buildInitialState);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggle = (categoryId: string, channel: "email" | "inApp") => {
    setPrefs((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [channel]: !prev[categoryId][channel],
      },
    }));
  };

  const isLocked = (cat: NotificationCategory, channel: "email" | "inApp") => {
    const lockFn = channel === "email" ? cat.lockEmail : cat.lockInApp;
    return lockFn ? lockFn(role) : false;
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
    }, 800);
  };

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how and when you want to be notified
        </p>
      </div>

      {/* Success toast */}
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400 transition-all duration-500",
          showSuccess
            ? "max-h-20 opacity-100"
            : "max-h-0 border-0 py-0 opacity-0"
        )}
      >
        Notification preferences saved successfully.
      </div>

      {/* Toggle matrix */}
      <div className="glass rounded-xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Notification preferences
          </h2>
        </div>

        {/* Column headers */}
        <div className="mb-3 grid grid-cols-[1fr_80px_80px] items-center gap-4 px-1">
          <div />
          <div className="flex flex-col items-center gap-1">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Email
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              In-App
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {categories.map((cat) => {
            const emailLocked = isLocked(cat, "email");
            const inAppLocked = isLocked(cat, "inApp");

            return (
              <div
                key={cat.id}
                className="grid grid-cols-[1fr_80px_80px] items-center gap-4 px-1 py-4"
              >
                {/* Label */}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {cat.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {cat.description}
                  </p>
                  {cat.lockNote && (emailLocked || inAppLocked) && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/60">
                      <Lock className="h-3 w-3" />
                      {cat.lockNote}
                    </div>
                  )}
                </div>

                {/* Email toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={() => !emailLocked && toggle(cat.id, "email")}
                    disabled={emailLocked}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      emailLocked && "cursor-not-allowed opacity-50",
                      prefs[cat.id].email ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        prefs[cat.id].email ? "left-[22px]" : "left-0.5"
                      )}
                    />
                    {emailLocked && (
                      <Lock className="absolute -right-1 -top-1 h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* In-App toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={() => !inAppLocked && toggle(cat.id, "inApp")}
                    disabled={inAppLocked}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      inAppLocked && "cursor-not-allowed opacity-50",
                      prefs[cat.id].inApp ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        prefs[cat.id].inApp ? "left-[22px]" : "left-0.5"
                      )}
                    />
                    {inAppLocked && (
                      <Lock className="absolute -right-1 -top-1 h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-10 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]"
        >
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
