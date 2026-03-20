"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "owner" | "admin" | "manager" | "designer" | "bookkeeper" | "viewer";

export interface RoleConfig {
  label: string;
  description: string;
  color: string;
  avatar: string;
  name: string;
  email: string;
  sidebarItems: string[];
  canApprove: boolean;
  canManageTeam: boolean;
  canViewBilling: boolean;
  canConfigureAgents: boolean;
  canViewReports: boolean;
  canEditProjects: boolean;
  agents: string[];
}

export const roleConfigs: Record<Role, RoleConfig> = {
  owner: {
    label: "Owner",
    description: "Full access to everything. Business owner perspective.",
    color: "text-purple-400 bg-purple-500/15 ring-purple-500/20",
    avatar: "JW",
    name: "Joseph Wells",
    email: "joseph@apexintelligence.ai",
    sidebarItems: [
      "Dashboard", "Agents", "Customers", "Projects", "Escalations", "Approvals", "Reports", "Settings",
      "BOS Hub", "KPI Dashboard", "Meetings", "Goals & Milestones", "Issues", "Action Items", "Org Chart", "People", "Vision Plan", "Reviews", "Announcements", "Knowledge Portal", "Analytics",
    ],
    canApprove: true,
    canManageTeam: true,
    canViewBilling: true,
    canConfigureAgents: true,
    canViewReports: true,
    canEditProjects: true,
    agents: ["Discovery Concierge", "Estimate Engine", "Operations Controller", "Executive Navigator", "Project Orchestrator", "Design Spec Assistant", "Support Agent"],
  },
  admin: {
    label: "Admin",
    description: "System administration. Can configure agents, manage team, view billing.",
    color: "text-blue-400 bg-blue-500/15 ring-blue-500/20",
    avatar: "SC",
    name: "Sarah Chen",
    email: "sarah@apexintelligence.ai",
    sidebarItems: [
      "Dashboard", "Agents", "Customers", "Projects", "Escalations", "Approvals", "Reports", "Settings",
      "BOS Hub", "KPI Dashboard", "Meetings", "Goals & Milestones", "Issues", "Action Items", "Org Chart", "People", "Vision Plan", "Reviews", "Announcements", "Knowledge Portal", "Analytics",
    ],
    canApprove: true,
    canManageTeam: true,
    canViewBilling: true,
    canConfigureAgents: true,
    canViewReports: true,
    canEditProjects: true,
    agents: ["Discovery Concierge", "Estimate Engine", "Operations Controller", "Executive Navigator", "Project Orchestrator", "Design Spec Assistant", "Support Agent"],
  },
  manager: {
    label: "Manager",
    description: "Project oversight. Scope-relevant escalations and approvals.",
    color: "text-emerald-400 bg-emerald-500/15 ring-emerald-500/20",
    avatar: "MT",
    name: "Mike Torres",
    email: "mike@apexintelligence.ai",
    sidebarItems: [
      "Dashboard", "Agents", "Customers", "Projects", "Escalations", "Approvals", "Reports", "Settings",
      "BOS Hub", "KPI Dashboard", "Meetings", "Goals & Milestones", "Issues", "Action Items", "Org Chart", "People", "Reviews", "Announcements",
    ],
    canApprove: true,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: true,
    canEditProjects: true,
    agents: ["Operations Controller", "Project Orchestrator", "Estimate Engine", "Support Agent"],
  },
  designer: {
    label: "Designer",
    description: "Design specs and submittals. Works with Design Spec Assistant.",
    color: "text-cyan-400 bg-cyan-500/15 ring-cyan-500/20",
    avatar: "LP",
    name: "Lisa Park",
    email: "lisa@apexintelligence.ai",
    sidebarItems: [
      "Dashboard", "Agents", "Projects",
      "BOS Hub", "Goals & Milestones",
    ],
    canApprove: false,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: false,
    canEditProjects: true,
    agents: ["Design Spec Assistant", "Support Agent"],
  },
  bookkeeper: {
    label: "Bookkeeper",
    description: "Financial operations. Works with Operations Controller and Support Agent.",
    color: "text-amber-400 bg-amber-500/15 ring-amber-500/20",
    avatar: "DK",
    name: "David Kim",
    email: "david@apexintelligence.ai",
    sidebarItems: [
      "Dashboard", "Agents", "Customers", "Reports",
      "BOS Hub", "KPI Dashboard", "Analytics",
    ],
    canApprove: false,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: true,
    canEditProjects: false,
    agents: ["Operations Controller", "Support Agent"],
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access. Can view agent output, projects, and integration status.",
    color: "text-gray-400 bg-gray-500/15 ring-gray-500/20",
    avatar: "AN",
    name: "Alex Nguyen",
    email: "alex@apexintelligence.ai",
    sidebarItems: [
      "Dashboard", "Agents", "Projects", "Reports",
      "BOS Hub", "KPI Dashboard",
    ],
    canApprove: false,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: true,
    canEditProjects: false,
    agents: ["Support Agent", "Project Orchestrator"],
  },
};

interface RoleContextType {
  role: Role;
  config: RoleConfig;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType>({
  role: "owner",
  config: roleConfigs.owner,
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("owner");
  return (
    <RoleContext.Provider value={{ role, config: roleConfigs[role], setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
