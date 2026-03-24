"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Brain,
  Bot,
  AlertTriangle,
  CheckSquare,
  Users,
  FolderKanban,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Building2,
  Target,
  CalendarDays,
  Flag,
  CircleAlert,
  ListChecks,
  Network,
  UserCircle,
  Eye,
  BookOpen,
  TrendingUp,
  Star,
  Megaphone,
  FileText,
  ClipboardCheck,
  UserCheck,
  ArrowLeft,
  User,
  Shield,
  Bell,
  CreditCard,
  Plug,
  ShoppingCart,
  HardHat,
  Map,
  DollarSign,
  Factory,
  Store,
  Truck,
  BookUser,
  Kanban,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { usePersona } from "@/lib/persona-context";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  sidebarLabel?: string;
}

interface BosNavGroup {
  label: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Master nav-item registry (all possible items across all personas)  */
/* ------------------------------------------------------------------ */

const NAV_ITEM_REGISTRY: Record<string, { icon: React.ComponentType<{ className?: string }>; href: string; badge?: number; dataTour?: string }> = {
  Dashboard:    { icon: LayoutDashboard, href: "/dashboard", dataTour: "dashboard-link" },
  Agents:       { icon: Bot, href: "/dashboard/agents", dataTour: "agents-link" },
  CRM:          { icon: BookUser, href: "/crm", dataTour: "crm-link" },
  Projects:     { icon: FolderKanban, href: "/projects", dataTour: "projects-link" },
  Escalations:  { icon: AlertTriangle, href: "/escalations", badge: 3, dataTour: "escalations-link" },
  Approvals:    { icon: CheckSquare, href: "/approvals", badge: 12, dataTour: "approvals-link" },
  Reports:      { icon: BarChart3, href: "/reports", dataTour: "reports-link" },
  "Business OS": { icon: Building2, href: "/bos", dataTour: "bos-link" },
  Settings:     { icon: Settings, href: "/settings", dataTour: "settings-link" },
  Orders:       { icon: ShoppingCart, href: "/orders", dataTour: "orders-link" },
  Contractors:  { icon: HardHat, href: "/contractors", dataTour: "contractors-link" },
  Catalog:      { icon: BookOpen, href: "/catalog", dataTour: "catalog-link" },
  Reps:         { icon: UserCheck, href: "/reps", dataTour: "reps-link" },
  Territory:    { icon: Map, href: "/territory", dataTour: "territory-link" },
  Commissions:  { icon: DollarSign, href: "/commissions", dataTour: "commissions-link" },
  Production:   { icon: Factory, href: "/production", dataTour: "production-link" },
  Dealers:      { icon: Store, href: "/dealers", dataTour: "dealers-link" },
  Distribution: { icon: Truck, href: "/distribution", dataTour: "distribution-link" },
};

const bosNavGroups: BosNavGroup[] = [
  {
    label: "Home",
    items: [
      { label: "Hub", icon: Building2, href: "/bos", sidebarLabel: "BOS Hub" },
      { label: "Announcements", icon: Megaphone, href: "/bos/announcements", sidebarLabel: "Announcements" },
      { label: "Analytics", icon: TrendingUp, href: "/bos/analytics", sidebarLabel: "Analytics" },
    ],
  },
  {
    label: "Execution",
    items: [
      { label: "Meetings", icon: CalendarDays, href: "/bos/meetings", sidebarLabel: "Meetings" },
      { label: "Issues", icon: CircleAlert, href: "/bos/issues", sidebarLabel: "Issues" },
      { label: "Actions", icon: ListChecks, href: "/bos/actions", sidebarLabel: "Action Items" },
      { label: "KPIs", icon: Target, href: "/bos/kpis", sidebarLabel: "KPI Dashboard" },
    ],
  },
  {
    label: "Strategy",
    items: [
      { label: "Vision", icon: Eye, href: "/bos/vision", sidebarLabel: "Vision Plan" },
      { label: "Goals", icon: Flag, href: "/bos/goals", sidebarLabel: "Goals & Milestones" },
      { label: "Processes", icon: FileText, href: "/bos/processes", sidebarLabel: "Processes" },
      { label: "Knowledge", icon: BookOpen, href: "/bos/knowledge", sidebarLabel: "Knowledge Portal" },
    ],
  },
  {
    label: "People",
    items: [
      { label: "People", icon: UserCircle, href: "/bos/people", sidebarLabel: "People" },
      { label: "Org Chart", icon: Network, href: "/bos/org-chart", sidebarLabel: "Org Chart" },
      { label: "Reviews", icon: Star, href: "/bos/reviews", sidebarLabel: "Reviews" },
      { label: "Assessments", icon: ClipboardCheck, href: "/bos/assessments", sidebarLabel: "Assessments" },
      { label: "Fit Check", icon: UserCheck, href: "/bos/fit-check", sidebarLabel: "Fit Check" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  AI Usage indicator config                                          */
/* ------------------------------------------------------------------ */

const AI_USAGE_PERCENT = 68;

function getUsageStyle(percent: number) {
  if (percent >= 100) {
    return {
      dotColor: "bg-red-500",
      textColor: "text-red-400",
      label: "Limit reached",
      pulse: false,
    };
  }
  if (percent >= 80) {
    return {
      dotColor: "bg-orange-500",
      textColor: "text-orange-400",
      label: `Usage: ${percent}%`,
      pulse: true,
    };
  }
  if (percent >= 60) {
    return {
      dotColor: "bg-amber-500",
      textColor: "text-amber-400",
      label: `Usage: ${percent}%`,
      pulse: false,
    };
  }
  return null;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { config } = useRole();
  const { template } = usePersona();

  const isBosMode = pathname.startsWith("/bos") && !pathname.includes("/onboarding");
  const isSettingsMode = pathname.startsWith("/settings");
  const isCrmMode = pathname.startsWith("/crm");

  const settingsNavItems: NavItem[] = [
    { label: "Profile", icon: User, href: "/settings/profile" },
    { label: "Security", icon: Shield, href: "/settings/security" },
    { label: "Notifications", icon: Bell, href: "/settings/notifications" },
    ...(config.canManageTeam
      ? [{ label: "Team", icon: Users, href: "/settings/team" }]
      : []),
    ...(config.canViewBilling
      ? [{ label: "Billing", icon: CreditCard, href: "/settings/billing" }]
      : []),
    { label: "Integrations", icon: Plug, href: "/settings/integrations" },
  ];

  const crmNavItems: NavItem[] = [
    { label: "Overview", icon: LayoutDashboard, href: "/crm" },
    { label: "Pipeline", icon: Kanban, href: "/crm/pipeline" },
    { label: "Contacts", icon: Users, href: "/crm/contacts" },
    { label: "Activities", icon: Activity, href: "/crm/activities" },
  ];

  // Build nav items: intersection of persona template's sidebarItems and role's sidebarItems
  const visibleNavItems: NavItem[] = template.sidebarItems
    .filter((label) => config.sidebarItems.includes(label) && NAV_ITEM_REGISTRY[label])
    .map((label) => {
      const entry = NAV_ITEM_REGISTRY[label];
      return { label, icon: entry.icon, href: entry.href, badge: entry.badge };
    });

  // BOS sub-nav: filter by template.bosItems AND role sidebarItems
  const visibleBosGroups = bosNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        config.sidebarItems.includes(item.sidebarLabel!) &&
        template.bosItems.includes(item.sidebarLabel!)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const usageStyle = getUsageStyle(AI_USAGE_PERCENT);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/dashboard/agents") return pathname.startsWith("/dashboard/agents");
    if (href === "/bos") {
      // In BOS mode, Hub is exact match only
      if (isBosMode) return pathname === "/bos";
      // In main nav, Business OS link highlights for any /bos route
      return pathname.startsWith("/bos");
    }
    if (href === "/crm") {
      // In CRM mode, Overview is exact match only
      if (isCrmMode) return pathname === "/crm";
      // In main nav, CRM link highlights for any /crm route
      return pathname.startsWith("/crm");
    }
    // Settings sub-routes: exact match or nested
    if (isSettingsMode && href.startsWith("/settings/")) {
      return pathname === href || pathname.startsWith(href + "/");
    }
    // In main nav, Settings link highlights for any /settings route
    if (href === "/settings") return pathname.startsWith("/settings");
    return pathname.startsWith(href);
  };

  const tourAttrMap: Record<string, string> = {
    // Main nav items get data-tour from registry
    ...Object.fromEntries(
      Object.entries(NAV_ITEM_REGISTRY)
        .filter(([, v]) => v.dataTour)
        .map(([k, v]) => [k, v.dataTour!])
    ),
    // BOS sub-nav items
    KPIs: "kpis-link",
    Meetings: "meetings-link",
    Goals: "goals-link",
    Issues: "issues-link",
    Hub: "bos-hub",
  };

  const renderNavLink = (item: NavItem, isCollapsedDesktop: boolean, indent = false) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const tourAttr = tourAttrMap[item.label];
    const button = (
      <Link
        key={item.label}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        {...(tourAttr ? { "data-tour": tourAttr } : {})}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isCollapsedDesktop && "justify-center px-0",
          indent && !isCollapsedDesktop && "pl-9",
          active
            ? "bg-primary/10 text-foreground glow-primary"
            : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
        )}

        <Icon
          className={cn(
            "h-[18px] w-[18px] shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />

        {!isCollapsedDesktop && (
          <>
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[11px] font-semibold text-amber-400">
                {item.badge}
              </span>
            )}
          </>
        )}

        {isCollapsedDesktop && item.badge !== undefined && item.badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (isCollapsedDesktop) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger className="w-full">{button}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <span>{item.label}</span>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  /* ---- Header content (Logo area) -------------------------------- */

  const renderHeader = (isCollapsedDesktop: boolean) => {
    if (isBosMode) {
      return (
        <div className="border-b border-border">
          {/* Back button */}
          <div className={cn("px-4 pt-4 pb-2", isCollapsedDesktop && "px-2")}>
            {isCollapsedDesktop ? (
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  Back to Dashboard
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            )}
          </div>
          {/* Business OS branding */}
          <div
            className={cn(
              "flex items-center gap-2 px-4 pb-5 pt-2",
              isCollapsedDesktop && "justify-center px-2"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            {!isCollapsedDesktop && (
              <div className="flex flex-col">
                <span className="text-gradient text-lg font-bold leading-tight tracking-tight">
                  Business OS
                </span>
                <span className="text-[10px] font-medium leading-tight text-muted-foreground">
                  Business OS
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isCrmMode) {
      return (
        <div className="border-b border-border">
          {/* Back button */}
          <div className={cn("px-4 pt-4 pb-2", isCollapsedDesktop && "px-2")}>
            {isCollapsedDesktop ? (
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  Back to Dashboard
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            )}
          </div>
          {/* CRM branding */}
          <div
            className={cn(
              "flex items-center gap-2 px-4 pb-5 pt-2",
              isCollapsedDesktop && "justify-center px-2"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <BookUser className="h-4 w-4 text-primary" />
            </div>
            {!isCollapsedDesktop && (
              <div className="flex flex-col">
                <span className="text-gradient text-lg font-bold leading-tight tracking-tight">
                  CRM
                </span>
                <span className="text-[10px] font-medium leading-tight text-muted-foreground">
                  Customer Relationship Management
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isSettingsMode) {
      return (
        <div className="border-b border-border">
          {/* Back button */}
          <div className={cn("px-4 pt-4 pb-2", isCollapsedDesktop && "px-2")}>
            {isCollapsedDesktop ? (
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  Back to Dashboard
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
            )}
          </div>
          {/* Settings branding */}
          <div
            className={cn(
              "flex items-center gap-2 px-4 pb-5 pt-2",
              isCollapsedDesktop && "justify-center px-2"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            {!isCollapsedDesktop && (
              <div className="flex flex-col">
                <span className="text-gradient text-lg font-bold leading-tight tracking-tight">
                  Settings
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default KIPTRA header
    return (
      <Link
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-2 border-b border-border px-4 py-5 transition-opacity hover:opacity-80",
          isCollapsedDesktop && "justify-center px-2"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        {!isCollapsedDesktop && (
          <div className="flex flex-col">
            <span className="text-gradient text-lg font-bold leading-tight tracking-tight">
              KIPTRA
            </span>
            <span className="text-[10px] font-medium leading-tight text-muted-foreground">
              Intelligence
            </span>
          </div>
        )}
      </Link>
    );
  };

  /* ---- Navigation content ---------------------------------------- */

  const renderNav = (isCollapsedDesktop: boolean) => {
    if (isBosMode) {
      return (
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {visibleBosGroups.map((group, groupIdx) => (
            <div key={group.label}>
              {!isCollapsedDesktop && (
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 pt-4 pb-1">
                  {group.label}
                </div>
              )}
              {isCollapsedDesktop && groupIdx > 0 && (
                <div className="my-2 border-t border-border" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => renderNavLink(item, isCollapsedDesktop))}
              </div>
            </div>
          ))}
        </nav>
      );
    }

    if (isCrmMode) {
      return (
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {crmNavItems.map((item) => renderNavLink(item, isCollapsedDesktop))}
        </nav>
      );
    }

    if (isSettingsMode) {
      return (
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {settingsNavItems.map((item) => renderNavLink(item, isCollapsedDesktop))}
        </nav>
      );
    }

    return (
      <nav data-tour="sidebar-nav" className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {visibleNavItems.map((item) => renderNavLink(item, isCollapsedDesktop))}
      </nav>
    );
  };

  /* ---- Build sidebar content ------------------------------------- */

  const buildSidebarContent = (isCollapsedDesktop: boolean) => (
    <>
      {renderHeader(isCollapsedDesktop)}
      {renderNav(isCollapsedDesktop)}

      {/* Bottom section */}
      <div className="border-t border-border p-2">
        {/* Onboarding checklist — above plan badge */}
        <div className="mb-2">
          <OnboardingChecklist collapsed={isCollapsedDesktop} />
        </div>

        {/* Plan badge */}
        <div
          className={cn(
            "mb-2 flex items-center gap-2 rounded-lg bg-primary/[0.06] px-3 py-2",
            isCollapsedDesktop && "justify-center px-1"
          )}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/20">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          {!isCollapsedDesktop && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground">Professional</span>
              <span className="text-[10px] text-muted-foreground">5 agent seats</span>
            </div>
          )}
        </div>

        {/* AI Usage indicator */}
        {usageStyle && (
          <Link
            href="/settings/billing"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "mb-2 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-foreground/[0.06]",
              isCollapsedDesktop && "justify-center px-1"
            )}
          >
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  usageStyle.dotColor,
                  usageStyle.pulse && "animate-pulse"
                )}
              />
            </div>
            {!isCollapsedDesktop && (
              <span className={cn("text-xs font-medium", usageStyle.textColor)}>
                {usageStyle.label}
              </span>
            )}
          </Link>
        )}

        {/* Collapse toggle -- desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "hidden lg:flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground",
            isCollapsedDesktop && "justify-center px-0"
          )}
        >
          {isCollapsedDesktop ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <TooltipProvider>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-[0.875rem] z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-[var(--background)] text-muted-foreground shadow-md transition-colors hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile slide-over sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-[var(--background)] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button inside mobile sidebar */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        {buildSidebarContent(false)}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "glass hidden h-dvh flex-col border-r border-border transition-all duration-300 ease-in-out lg:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {buildSidebarContent(collapsed)}
      </aside>
    </TooltipProvider>
  );
}
