"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { RoleProvider } from "@/lib/role-context";
import { RoleSwitcher } from "@/components/role-switcher";
import { HelpPanel } from "@/components/help-panel";
import { ConnectionStatus } from "@/components/connection-status";
import { DegradedBanner } from "@/components/degraded-banner";
import { AiUsageBanner } from "@/components/ai-usage-banner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex h-dvh flex-col overflow-hidden bg-background">
        <DegradedBanner />
        <AiUsageBanner percent={68} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
          </div>
        </div>
      </div>
      <RoleSwitcher />
      <HelpPanel />
      <ConnectionStatus />
    </RoleProvider>
  );
}
