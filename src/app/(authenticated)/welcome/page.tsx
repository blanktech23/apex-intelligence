"use client";

import { useState } from "react";
import {
  Crown,
  ShieldCheck,
  Briefcase,
  Palette,
  Calculator,
  Eye,
  Users,
  Bot,
  Settings,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  FileText,
  Clock,
  DollarSign,
  Bell,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole, type Role } from "@/lib/role-context";

const roleIcons: Record<Role, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: ShieldCheck,
  manager: Briefcase,
  designer: Palette,
  bookkeeper: Calculator,
  viewer: Eye,
};

const roleBullets: Record<
  Role,
  { icon: React.ComponentType<{ className?: string }>; text: string }[]
> = {
  owner: [
    { icon: Users, text: "Manage team & agents" },
    { icon: BarChart3, text: "Full dashboard access" },
    { icon: Settings, text: "Configure integrations" },
    { icon: AlertTriangle, text: "Approve all escalations" },
  ],
  admin: [
    { icon: Users, text: "Manage team members & invitations" },
    { icon: Bot, text: "Configure agents & integrations" },
    { icon: BarChart3, text: "View all reports" },
    { icon: AlertTriangle, text: "Approve escalations" },
  ],
  manager: [
    { icon: ClipboardCheck, text: "Approve agent drafts within scope" },
    { icon: AlertTriangle, text: "Manage escalation queue" },
    { icon: FileText, text: "View project status & activity" },
    { icon: Clock, text: "Coordinate team tasks" },
  ],
  designer: [
    { icon: Palette, text: "Access Design Spec Assistant" },
    { icon: FileText, text: "Review & collaborate on specs" },
    { icon: Clock, text: "View project timelines" },
  ],
  bookkeeper: [
    { icon: DollarSign, text: "View financial summaries" },
    { icon: FileText, text: "Monitor invoice status" },
    { icon: Bell, text: "Track payment alerts" },
  ],
  viewer: [
    { icon: BarChart3, text: "View dashboards & project status (read-only)" },
    { icon: Bot, text: "See agent activity summaries" },
    { icon: FileText, text: "Access shared reports" },
  ],
};

export default function WelcomePage() {
  const { role, config } = useRole();
  const [showToast, setShowToast] = useState(false);

  const RoleIcon = roleIcons[role];
  const bullets = roleBullets[role];
  const firstName = config.name.split(" ")[0];

  const handleTour = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-[560px] rounded-2xl p-8">
        {/* Role icon */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${config.color.split(" ").slice(1).join(" ")}`}
          >
            <RoleIcon
              className={`h-7 w-7 ${config.color.split(" ")[0]}`}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Welcome to Slate Design Remodel, {firstName}!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been added as{" "}
            {["a", "e", "i", "o", "u"].includes(
              config.label[0].toLowerCase()
            )
              ? "an"
              : "a"}{" "}
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${config.color}`}
            >
              {config.label}
            </span>
          </p>
        </div>

        {/* Role-specific bullets */}
        <div className="mb-8 rounded-xl border border-border bg-muted/20 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What you can do
          </p>
          <ul className="space-y-3">
            {bullets.map((bullet, i) => {
              const BulletIcon = bullet.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                    <BulletIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground">{bullet.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleTour}
            className="h-11 w-full gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]"
          >
            <Rocket className="h-4 w-4" />
            Take a quick tour
          </Button>
          <a
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Skip and go to dashboard
          </a>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass rounded-xl border border-border px-5 py-3 shadow-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Rocket className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Tour started
                </p>
                <p className="text-xs text-muted-foreground">
                  Follow the highlighted areas to learn the basics
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
