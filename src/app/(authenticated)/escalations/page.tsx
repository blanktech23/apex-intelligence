"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  Calendar,
  ChevronDown,
  Compass,
  Filter,
  Headphones,
  Search,
  Settings2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Priority = "HIGH" | "MEDIUM" | "LOW";
type Status = "Pending" | "Approved" | "Rejected" | "Modified";

interface Escalation {
  id: string;
  priority: Priority;
  agent: {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  summary: string;
  created: string;
  status: Status;
}

const mockEscalations: Escalation[] = [
  {
    id: "esc-001",
    priority: "HIGH",
    agent: { name: "Discovery Concierge", icon: Compass },
    summary:
      "New lead from website: Johnson Remodeling requesting kitchen estimate. Contact info verified, budget range $30-50k...",
    created: "5m ago",
    status: "Pending",
  },
  {
    id: "esc-002",
    priority: "MEDIUM",
    agent: { name: "Estimate Engine", icon: Brain },
    summary:
      "Estimate draft for 2,400 sqft bathroom renovation at $45,200. Includes demolition, plumbing, tile, and fixtures...",
    created: "15m ago",
    status: "Pending",
  },
  {
    id: "esc-003",
    priority: "HIGH",
    agent: { name: "Operations Controller", icon: Settings2 },
    summary:
      "Schedule conflict detected: Two crews assigned to same site on March 18. Crew A (framing) and Crew B (electrical)...",
    created: "30m ago",
    status: "Pending",
  },
  {
    id: "esc-004",
    priority: "LOW",
    agent: { name: "Executive Navigator", icon: Zap },
    summary:
      "Weekly report summary: Revenue up 12%, 3 new leads, 2 projects completed. Cash flow positive for the quarter...",
    created: "2h ago",
    status: "Approved",
  },
  {
    id: "esc-005",
    priority: "MEDIUM",
    agent: { name: "Support Agent", icon: Headphones },
    summary:
      "Customer complaint: Invoice #1247 shows incorrect amount. Customer was billed $12,800 instead of $11,200...",
    created: "4h ago",
    status: "Modified",
  },
  {
    id: "esc-006",
    priority: "LOW",
    agent: { name: "Project Orchestrator", icon: Calendar },
    summary:
      "Suggested reschedule: Rain forecast for exterior work on March 19. Recommending move to March 21 for siding crew...",
    created: "6h ago",
    status: "Rejected",
  },
];

const priorityConfig: Record<Priority, { dot: string; label: string }> = {
  HIGH: { dot: "bg-red-400", label: "High" },
  MEDIUM: { dot: "bg-amber-400", label: "Medium" },
  LOW: { dot: "bg-blue-400", label: "Low" },
};

const statusConfig: Record<
  Status,
  { bg: string; text: string; ring: string }
> = {
  Pending: {
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    ring: "ring-amber-400/20",
  },
  Approved: {
    bg: "bg-green-400/10",
    text: "text-green-400",
    ring: "ring-green-400/20",
  },
  Rejected: {
    bg: "bg-red-400/10",
    text: "text-red-400",
    ring: "ring-red-400/20",
  },
  Modified: {
    bg: "bg-blue-400/10",
    text: "text-blue-400",
    ring: "ring-blue-400/20",
  },
};

export default function EscalationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const pendingCount = mockEscalations.filter(
    (e) => e.status === "Pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Escalations</h1>
        <span className="flex h-6 items-center rounded-full bg-amber-400/15 px-2.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/20">
          {pendingCount} pending
        </span>
      </div>

      {/* Filter bar */}
      <div className="glass flex flex-wrap items-center gap-3 rounded-xl p-4">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search escalations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg border-border bg-muted/30 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:ring-primary/30"
          />
        </div>

        {/* Agent filter */}
        <button className="glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-all hover:text-foreground">
          <Brain className="h-3.5 w-3.5" />
          <span>Agent</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {/* Priority filter */}
        <button className="glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-all hover:text-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Priority</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {/* Status filter */}
        <button className="glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-all hover:text-foreground">
          <Filter className="h-3.5 w-3.5" />
          <span>Status</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>

        {/* Date range */}
        <button className="glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-all hover:text-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Date range</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Priority
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Agent
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </TableHead>
              <TableHead className="w-[100px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Created
              </TableHead>
              <TableHead className="w-[110px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-[90px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEscalations.map((escalation) => {
              const Icon = escalation.agent.icon;
              const priority = priorityConfig[escalation.priority];
              const status = statusConfig[escalation.status];

              return (
                <TableRow
                  key={escalation.id}
                  className="border-border/50 transition-colors hover:bg-muted/30 cursor-pointer"
                  onClick={() => router.push(`/escalations/${escalation.id}`)}
                >
                  {/* Priority */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${priority.dot}`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {priority.label}
                      </span>
                    </div>
                  </TableCell>

                  {/* Agent */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {escalation.agent.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Summary */}
                  <TableCell className="max-w-[360px]">
                    <p className="truncate text-sm text-muted-foreground">
                      {escalation.summary}
                    </p>
                  </TableCell>

                  {/* Created */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {escalation.created}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${status.bg} ${status.text} ${status.ring}`}
                    >
                      {escalation.status}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Link href={`/escalations/${escalation.id}`} onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 rounded-md px-2.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        Review
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
