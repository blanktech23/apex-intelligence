"use client";

import { useState } from "react";
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  Brain,
  AlertTriangle,
  CreditCard,
  Users,
  Code,
  Mail,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

const quickLinks = [
  { label: "Getting Started Guide", icon: BookOpen },
  { label: "Agent Configuration", icon: Brain },
  { label: "Managing Escalations", icon: AlertTriangle },
  { label: "Billing & Plans", icon: CreditCard },
  { label: "Team Management", icon: Users },
  { label: "API Documentation", icon: Code },
];

export function HelpPanel() {
  const [open, setOpen] = useState(false);
  const { role } = useRole();
  const canScheduleCall = role === "owner" || role === "admin";

  return (
    <>
      {/* Help trigger button — fixed bottom-left */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[var(--background)] text-muted-foreground shadow-lg transition-all duration-200 hover:border-primary/40 hover:text-foreground hover:ring-1 hover:ring-primary/20"
        aria-label="Help"
      >
        <HelpCircle className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col border-l border-border bg-[var(--background)] shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-foreground">
            Help &amp; Support
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search help articles..."
              className="w-full rounded-lg border border-border bg-muted/40 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Quick Links */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Links
            </h3>
            <div className="space-y-1">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.label}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/80"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span>{link.label}</span>
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Support
            </h3>
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-3 text-sm text-foreground">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>support@apexintelligence.ai</span>
              </div>
              {canScheduleCall && (
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/25">
                  <Calendar className="h-4 w-4" />
                  Schedule a call
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3">
          <p className="text-center text-xs text-muted-foreground">
            Apex Intelligence v1.0 &middot; Documentation
          </p>
        </div>
      </div>
    </>
  );
}
