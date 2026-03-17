"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Users,
  CreditCard,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

const settingsNav = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Team", href: "/settings/team", icon: Users },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Integrations", href: "/settings/integrations", icon: Plug },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { config } = useRole();

  const filteredNav = settingsNav.filter((item) => {
    if (item.label === "Team" && !config.canManageTeam) return false;
    if (item.label === "Billing" && !config.canViewBilling) return false;
    return true;
  });

  return (
    <div className="flex min-h-screen gap-8 p-6 lg:p-8">
      {/* Settings sidebar nav */}
      <aside className="hidden w-56 shrink-0 md:block">
        <h2 className="mb-6 text-lg font-semibold text-foreground">Settings</h2>
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-foreground glow-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content area */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
