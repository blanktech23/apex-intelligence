"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const bosNavItems = [
  { label: "Hub", href: "/bos" },
  { label: "KPIs", href: "/bos/kpis" },
  { label: "Meetings", href: "/bos/meetings" },
  { label: "Goals", href: "/bos/goals" },
  { label: "Issues", href: "/bos/issues" },
  { label: "Actions", href: "/bos/actions" },
  { label: "Org Chart", href: "/bos/org-chart" },
  { label: "People", href: "/bos/people" },
  { label: "Vision", href: "/bos/vision" },
  { label: "Reviews", href: "/bos/reviews" },
  { label: "Announcements", href: "/bos/announcements" },
  { label: "Processes", href: "/bos/processes" },
  { label: "Knowledge", href: "/bos/knowledge" },
  { label: "Assessments", href: "/bos/assessments" },
  { label: "Fit Check", href: "/bos/fit-check" },
  { label: "Analytics", href: "/bos/analytics" },
];

function getBreadcrumbs(pathname: string) {
  const crumbs = [{ label: "Business OS", href: "/bos" }];
  const match = bosNavItems.find((item) => item.href !== "/bos" && pathname.startsWith(item.href));
  if (match) crumbs.push({ label: match.label, href: match.href });
  if (pathname.includes("/onboarding")) crumbs.push({ label: "Onboarding", href: "/bos/onboarding" });
  return crumbs;
}

export default function BosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-7xl p-6">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              {i < breadcrumbs.length - 1 ? (
                <Link href={crumb.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{crumb.label}</span>
              )}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
