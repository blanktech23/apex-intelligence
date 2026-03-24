"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const crmNavItems = [
  { label: "Overview", href: "/crm" },
  { label: "Pipeline", href: "/crm/pipeline" },
  { label: "Contacts", href: "/crm/contacts" },
  { label: "Activities", href: "/crm/activities" },
  { label: "Deals", href: "/crm/deals" },
];

function getBreadcrumbs(pathname: string) {
  const crumbs = [{ label: "CRM", href: "/crm" }];
  const match = crmNavItems.find((item) => item.href !== "/crm" && pathname.startsWith(item.href));
  if (match) crumbs.push({ label: match.label, href: match.href });
  // Handle detail pages (e.g., /crm/contacts/[id] or /crm/deals/[id])
  const segments = pathname.split("/");
  if (segments.length >= 4 && segments[3]) {
    const parentMatch = crmNavItems.find((item) => item.href === `/crm/${segments[2]}`);
    if (parentMatch && !crumbs.find((c) => c.label === parentMatch.label)) {
      crumbs.push({ label: parentMatch.label, href: parentMatch.href });
    }
  }
  return crumbs;
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
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
