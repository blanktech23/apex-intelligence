"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronRight, LogOut, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationPanel } from "@/components/notification-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  agents: "Agents",
  crm: "CRM",
  projects: "Projects",
  escalations: "Escalations",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
  profile: "Profile",
  security: "Security",
  team: "Team",
  billing: "Billing",
  integrations: "Integrations",
  onboarding: "Onboarding",
};

export function TopBar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = usePathname();
  const { config } = useRole();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const unreadCount = 3;
  const firstName = config.name.split(" ")[0];

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: routeLabels[seg] || seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <header className="glass flex h-14 shrink-0 items-center justify-between border-b border-border pl-16 pr-6 lg:px-6">
      {/* Left: Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm overflow-hidden whitespace-nowrap sm:whitespace-normal">
        {breadcrumbs.map((crumb, index) => {
          // On mobile, only show the last 2 segments
          const isMobileHidden = breadcrumbs.length > 2 && index < breadcrumbs.length - 2;
          return (
            <div
              key={crumb.href}
              className={cn(
                "flex items-center gap-1.5",
                isMobileHidden && "hidden sm:flex"
              )}
            >
              {index > 0 && (
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 shrink-0 text-muted-foreground/50",
                  isMobileHidden && "hidden sm:block"
                )} />
              )}
              {crumb.isLast ? (
                <span className="font-medium text-foreground max-w-[120px] sm:max-w-none truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground transition-colors hover:text-foreground max-w-[120px] sm:max-w-none truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <div className="relative">
          <button
            data-tour="notification-bell"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
              notificationsOpen
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
            )}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationPanel
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-muted" />

        {/* User avatar dropdown */}
        {mounted && <DropdownMenu>
          <DropdownMenuTrigger data-tour="user-avatar" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-foreground/[0.06] focus:outline-none">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/20 text-xs font-semibold text-primary">
                {config.avatar}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-foreground">{firstName}</span>
            <span
              className={cn(
                "hidden sm:inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1",
                config.color
              )}
            >
              {config.label}
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-48 glass-strong"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{config.name}</span>
                  <span className="text-xs text-muted-foreground">{config.email}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Link href="/settings/profile">
              <DropdownMenuItem className="gap-2 px-2 py-1.5">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem className="gap-2 px-2 py-1.5">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/login" onClick={() => toast.success("Signed out")}>
              <DropdownMenuItem className="gap-2 px-2 py-1.5 text-red-400 focus:text-red-400">
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
    </header>
  );
}
