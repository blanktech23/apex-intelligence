"use client";

import { useState, useMemo } from "react";
import {
  Mail,
  Calculator,
  Wrench,
  BarChart3,
  Calendar,
  Palette,
  Headset,
  Search,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRole } from "@/lib/role-context";

// ---------------------------------------------------------------------------
// Types & Data
// ---------------------------------------------------------------------------

type AgentStatus = "Active" | "Paused" | "Error";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  lastRun: string;
  nextScheduled: string;
  todayRuns: number;
  enabled: boolean;
  keyMetricLabel: string;
  keyMetricValue: string;
}

const initialAgents: Agent[] = [
  {
    id: "discovery-concierge",
    name: "Discovery Concierge",
    description: "Qualifies and routes inbound leads automatically",
    icon: Mail,
    status: "Active",
    lastRun: "5m ago",
    nextScheduled: "In 10m",
    todayRuns: 12,
    enabled: true,
    keyMetricLabel: "Leads Qualified",
    keyMetricValue: "1,234",
  },
  {
    id: "estimate-engine",
    name: "Estimate Engine",
    description: "Generates detailed project cost estimates from specs and pricing data",
    icon: Calculator,
    status: "Active",
    lastRun: "15m ago",
    nextScheduled: "In 30m",
    todayRuns: 9,
    enabled: true,
    keyMetricLabel: "Estimates",
    keyMetricValue: "456",
  },
  {
    id: "operations-controller",
    name: "Operations Controller",
    description: "Manages billing, AP/AR tracking, lien waivers, and QuickBooks integration",
    icon: Wrench,
    status: "Active",
    lastRun: "30m ago",
    nextScheduled: "In 20m",
    todayRuns: 6,
    enabled: true,
    keyMetricLabel: "Projects Tracked",
    keyMetricValue: "47",
  },
  {
    id: "executive-navigator",
    name: "Executive Navigator",
    description: "Surfaces KPIs, financial insights, and strategic briefings for leadership",
    icon: BarChart3,
    status: "Active",
    lastRun: "1h ago",
    nextScheduled: "In 2h",
    todayRuns: 3,
    enabled: true,
    keyMetricLabel: "Briefings",
    keyMetricValue: "89",
  },
  {
    id: "project-orchestrator",
    name: "Project Orchestrator",
    description: "Manages crew scheduling, equipment, and appointment coordination",
    icon: Calendar,
    status: "Active",
    lastRun: "1m ago",
    nextScheduled: "In 3m",
    todayRuns: 31,
    enabled: true,
    keyMetricLabel: "Schedules",
    keyMetricValue: "892",
  },
  {
    id: "design-spec-assistant",
    name: "Design Spec Assistant",
    description: "Extracts specs and submittals from design documents",
    icon: Palette,
    status: "Paused",
    lastRun: "1d ago",
    nextScheduled: "--",
    todayRuns: 0,
    enabled: false,
    keyMetricLabel: "Specs Processed",
    keyMetricValue: "234",
  },
  {
    id: "support-agent",
    name: "Support Agent",
    description: "AI-first customer support targeting 20-25% autonomous resolution at launch",
    icon: Headset,
    status: "Active",
    lastRun: "2m ago",
    nextScheduled: "In 5m",
    todayRuns: 47,
    enabled: true,
    keyMetricLabel: "Conversations",
    keyMetricValue: "2,847",
  },
];

// ---------------------------------------------------------------------------
// Status styles
// ---------------------------------------------------------------------------

const statusStyles: Record<AgentStatus, { dot: string; badge: string }> = {
  Active: { dot: "bg-green-400", badge: "bg-green-500/15 text-green-400 border-green-500/20" },
  Paused: { dot: "bg-gray-400", badge: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
  Error: { dot: "bg-red-400", badge: "bg-red-500/15 text-red-400 border-red-500/20" },
};

const filterOptions: Array<{ label: string; value: AgentStatus | "All" }> = [
  { label: "All Statuses", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Paused", value: "Paused" },
  { label: "Error", value: "Error" },
];

// ---------------------------------------------------------------------------
// Toggle Component
// ---------------------------------------------------------------------------

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
        checked ? "bg-green-500/30" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none block size-3.5 rounded-full shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px] bg-green-400" : "translate-x-[3px] bg-gray-400"
        }`}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentsListPage() {
  const { config } = useRole();
  const [agentList, setAgentList] = useState(initialAgents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgentStatus | "All">("All");

  const filteredAgents = useMemo(() => {
    return agentList.filter((a) => {
      const matchesRole = config.agents.includes(a.name);
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesRole && matchesSearch && matchesStatus;
    });
  }, [agentList, search, statusFilter, config.agents]);

  const toggleAgent = (id: string) => {
    setAgentList((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              enabled: !a.enabled,
              status: !a.enabled ? "Active" : "Paused",
              nextScheduled: !a.enabled ? "In 10m" : "--",
            }
          : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agents</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and monitor your AI agent fleet
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search agents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-56 rounded-lg border border-border bg-muted/50 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AgentStatus | "All")}
              className="h-8 rounded-lg border border-border bg-muted/50 px-3 text-sm text-foreground outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => {
            const Icon = agent.icon;
            const cfg = statusStyles[agent.status];
            return (
              <Link
                key={agent.id}
                href={`/dashboard/agents/${agent.id}`}
                className="glass glass-hover group rounded-xl p-5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-500/10 p-2 ring-1 ring-indigo-500/20">
                      <Icon className="size-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-indigo-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                  {config.canConfigureAgents && (
                    <div onClick={(e) => e.preventDefault()}>
                      <Toggle checked={agent.enabled} onChange={() => toggleAgent(agent.id)} />
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}
                  >
                    <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                    {agent.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="text-lg font-bold text-foreground">{agent.keyMetricValue}</p>
                    <p className="text-[10px] text-muted-foreground">{agent.keyMetricLabel}</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="text-lg font-bold text-foreground">{agent.todayRuns}</p>
                    <p className="text-[10px] text-muted-foreground">Runs Today</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 px-3 py-2">
                    <p className="text-sm font-medium text-foreground mt-0.5">{agent.lastRun}</p>
                    <p className="text-[10px] text-muted-foreground">Last Run</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredAgents.length === 0 && (
          <div className="glass rounded-xl px-5 py-12 text-center text-muted-foreground">
            No agents match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
