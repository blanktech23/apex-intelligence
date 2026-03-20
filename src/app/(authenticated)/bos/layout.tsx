"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

interface BosNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  sidebarLabel: string;
}

const bosNavItems: BosNavItem[] = [
  { label: "Hub", href: "/bos", icon: Building2, sidebarLabel: "BOS Hub" },
  { label: "KPIs", href: "/bos/kpis", icon: Target, sidebarLabel: "KPI Dashboard" },
  { label: "Meetings", href: "/bos/meetings", icon: CalendarDays, sidebarLabel: "Meetings" },
  { label: "Goals", href: "/bos/goals", icon: Flag, sidebarLabel: "Goals & Milestones" },
  { label: "Issues", href: "/bos/issues", icon: CircleAlert, sidebarLabel: "Issues" },
  { label: "Actions", href: "/bos/actions", icon: ListChecks, sidebarLabel: "Action Items" },
  { label: "Org Chart", href: "/bos/org-chart", icon: Network, sidebarLabel: "Org Chart" },
  { label: "People", href: "/bos/people", icon: UserCircle, sidebarLabel: "People" },
  { label: "Vision", href: "/bos/vision", icon: Eye, sidebarLabel: "Vision Plan" },
  { label: "Reviews", href: "/bos/reviews", icon: Star, sidebarLabel: "Reviews" },
  { label: "Knowledge", href: "/bos/knowledge", icon: BookOpen, sidebarLabel: "Knowledge Portal" },
  { label: "Analytics", href: "/bos/analytics", icon: TrendingUp, sidebarLabel: "Analytics" },
];

function getBreadcrumbs(pathname: string) {
  const crumbs: { label: string; href: string }[] = [
    { label: "Business OS", href: "/bos" },
  ];

  const match = bosNavItems.find((item) =>
    item.href !== "/bos" && pathname.startsWith(item.href)
  );

  if (match) {
    crumbs.push({ label: match.label, href: match.href });
  }

  if (pathname.includes("/onboarding")) {
    crumbs.push({ label: "Onboarding", href: "/bos/onboarding" });
  }

  return crumbs;
}

export default function BosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { config } = useRole();
  const breadcrumbs = getBreadcrumbs(pathname);

  const visibleNavItems = bosNavItems.filter((item) =>
    config.sidebarItems.includes(item.sidebarLabel)
  );

  const isOnboarding = pathname.includes("/onboarding");

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-7xl p-6">
        {/* Breadcrumbs */}
        <div className="mb-4 flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              {i < breadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Secondary nav tabs — hidden on onboarding */}
        {!isOnboarding && (
          <div className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-[rgba(255,255,255,0.03)] p-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/bos"
                  ? pathname === "/bos"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
