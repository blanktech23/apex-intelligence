"use client";

import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { PersonaProvider } from "@/lib/persona-context";
import { RoleProvider } from "@/lib/role-context";
import { RoleSwitcher } from "@/components/role-switcher";
import { HelpPanel } from "@/components/help-panel";
import { ConnectionStatus } from "@/components/connection-status";
import { DegradedBanner } from "@/components/degraded-banner";
import { AiUsageBanner } from "@/components/ai-usage-banner";
import { TourProvider, TourTrigger } from "@/components/tour";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PersonaProvider>
    <RoleProvider>
      <TourProvider>
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

        {/* Tour triggers */}
        <TourTrigger tourId="platform" trigger="first_login" />
        <TourTrigger tourId="bos" trigger="first_visit" route="/bos" />
        <TourTrigger tourId="canvas" trigger="first_visit" route="/canvas" />
        <TourTrigger tourId="integrations" trigger="first_visit" route="/settings/integrations" />
      </TourProvider>
    </RoleProvider>
    </PersonaProvider>
  );
}
