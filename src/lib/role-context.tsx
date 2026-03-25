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
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/15 ring-purple-500/20",
    avatar: "JW",
    name: "Joseph Wells",
    email: "joseph@kiptra.io",
    sidebarItems: [
      "Dashboard", "Agents", "CRM", "Chat", "Projects", "Escalations", "Approvals", "Reports", "Business OS", "Settings",
      "Orders", "Contractors", "Catalog", "Reps", "Territory", "Commissions", "Production", "Dealers", "Distribution",
      "BOS Hub", "KPI Dashboard", "Meetings", "Goals & Milestones", "Issues", "Action Items", "Org Chart", "People", "Vision Plan", "Reviews", "Announcements", "Processes", "Knowledge Portal", "Assessments", "Fit Check", "Analytics",
      "Scorecard", "Quarterly Rocks",
    ],
    canApprove: true,
    canManageTeam: true,
    canViewBilling: true,
    canConfigureAgents: true,
    canViewReports: true,
    canEditProjects: true,
    agents: ["Leads Agent", "Sales Agent", "Bookkeeping Agent", "CEO Agent", "Project Management Agent", "Design Agent", "Support Agent"],
  },
  admin: {
    label: "Admin",
    description: "System administration. Can configure agents, manage team, view billing.",
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/15 ring-blue-500/20",
    avatar: "SC",
    name: "Sarah Chen",
    email: "sarah@kiptra.io",
    sidebarItems: [
      "Dashboard", "Agents", "CRM", "Chat", "Projects", "Escalations", "Approvals", "Reports", "Business OS", "Settings",
      "Orders", "Contractors", "Catalog", "Reps", "Territory", "Commissions", "Production", "Dealers", "Distribution",
      "BOS Hub", "KPI Dashboard", "Meetings", "Goals & Milestones", "Issues", "Action Items", "Org Chart", "People", "Vision Plan", "Reviews", "Announcements", "Processes", "Knowledge Portal", "Assessments", "Fit Check", "Analytics",
      "Scorecard", "Quarterly Rocks",
    ],
    canApprove: true,
    canManageTeam: true,
    canViewBilling: true,
    canConfigureAgents: true,
    canViewReports: true,
    canEditProjects: true,
    agents: ["Leads Agent", "Sales Agent", "Bookkeeping Agent", "CEO Agent", "Project Management Agent", "Design Agent", "Support Agent"],
  },
  manager: {
    label: "Manager",
    description: "Project oversight. Scope-relevant escalations and approvals.",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 ring-emerald-500/20",
    avatar: "MT",
    name: "Mike Torres",
    email: "mike@kiptra.io",
    sidebarItems: [
      "Dashboard", "Agents", "CRM", "Chat", "Projects", "Escalations", "Approvals", "Reports", "Business OS", "Settings",
      "Orders", "Contractors", "Catalog", "Reps", "Territory", "Commissions", "Production", "Dealers", "Distribution",
      "BOS Hub", "KPI Dashboard", "Meetings", "Goals & Milestones", "Issues", "Action Items", "Org Chart", "People", "Reviews", "Announcements", "Processes", "Fit Check",
      "Scorecard", "Quarterly Rocks",
    ],
    canApprove: true,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: true,
    canEditProjects: true,
    agents: ["Bookkeeping Agent", "Project Management Agent", "Sales Agent", "Support Agent"],
  },
  designer: {
    label: "Designer",
    description: "Design specs and submittals. Works with Design Agent.",
    color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 ring-cyan-500/20",
    avatar: "LP",
    name: "Lisa Park",
    email: "lisa@kiptra.io",
    sidebarItems: [
      "Dashboard", "Agents", "Chat", "Projects", "Catalog", "Business OS",
      "BOS Hub", "Goals & Milestones",
    ],
    canApprove: false,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: false,
    canEditProjects: true,
    agents: ["Design Agent", "Support Agent"],
  },
  bookkeeper: {
    label: "Bookkeeper",
    description: "Financial operations. Works with Bookkeeping Agent and Support Agent.",
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/15 ring-amber-500/20",
    avatar: "DK",
    name: "David Kim",
    email: "david@kiptra.io",
    sidebarItems: [
      "Dashboard", "Agents", "CRM", "Chat", "Orders", "Commissions", "Reports", "Business OS",
      "BOS Hub", "KPI Dashboard", "Analytics",
    ],
    canApprove: false,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: true,
    canEditProjects: false,
    agents: ["Bookkeeping Agent", "Support Agent"],
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access. Can view agent output, projects, and integration status.",
    color: "text-gray-600 dark:text-gray-400 bg-gray-500/15 ring-gray-500/20",
    avatar: "AN",
    name: "Alex Nguyen",
    email: "alex@kiptra.io",
    sidebarItems: [
      "Dashboard", "Agents", "Chat", "Projects", "Orders", "Catalog", "Reports", "Business OS",
      "BOS Hub", "KPI Dashboard",
    ],
    canApprove: false,
    canManageTeam: false,
    canViewBilling: false,
    canConfigureAgents: false,
    canViewReports: true,
    canEditProjects: false,
    agents: ["Support Agent", "Project Management Agent"],
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
