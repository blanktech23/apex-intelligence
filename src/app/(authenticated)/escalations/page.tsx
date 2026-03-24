"use client";

import { useState, useEffect, useRef } from "react";
import { PaginationBar } from "@/components/ui/pagination-bar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRole } from "@/lib/role-context";

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
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-400/20",
  },
  Approved: {
    bg: "bg-green-400/10",
    text: "text-green-600 dark:text-green-400",
    ring: "ring-green-400/20",
  },
  Rejected: {
    bg: "bg-red-400/10",
    text: "text-red-600 dark:text-red-400",
    ring: "ring-red-400/20",
  },
  Modified: {
    bg: "bg-blue-400/10",
    text: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-400/20",
  },
};

const agentOptions = [
  "All",
  "Discovery Concierge",
  "Estimate Engine",
  "Operations Controller",
  "Executive Navigator",
  "Project Orchestrator",
  "Design Spec Assistant",
  "Support Agent",
];

const priorityOptions = ["All", "Critical", "High", "Medium", "Low"];

const statusOptions = ["All", "Open", "In Progress", "Resolved"];

type OpenDropdown = "agent" | "priority" | "status" | "dateRange" | null;

const dateRangeOptions = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "last7" },
  { label: "Last 30 days", value: "last30" },
  { label: "Last 90 days", value: "last90" },
  { label: "All time", value: "all" },
];

export default function EscalationsPage() {
  const router = useRouter();
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: OpenDropdown) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  // Filter escalations
  const filteredEscalations = mockEscalations.filter((e) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        e.summary.toLowerCase().includes(q) ||
        e.agent.name.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }
    if (selectedAgent !== "All" && e.agent.name !== selectedAgent) return false;
    if (selectedPriority !== "All") {
      const priorityMap: Record<string, Priority[]> = {
        Critical: ["HIGH"],
        High: ["HIGH"],
        Medium: ["MEDIUM"],
        Low: ["LOW"],
      };
      const allowed = priorityMap[selectedPriority];
      if (allowed && !allowed.includes(e.priority)) return false;
    }
    if (selectedStatus !== "All") {
      const statusMap: Record<string, Status[]> = {
        Open: ["Pending"],
        "In Progress": ["Modified"],
        Resolved: ["Approved", "Rejected"],
      };
      const allowed = statusMap[selectedStatus];
      if (allowed && !allowed.includes(e.status)) return false;
    }
    return true;
  });

  const pendingCount = mockEscalations.filter(
    (e) => e.status === "Pending"
  ).length;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // RBAC: Designer, Bookkeeper, Viewer cannot access escalations
  const restrictedRoles = new Set(["designer", "bookkeeper", "viewer"]);
  if (restrictedRoles.has(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <AlertTriangle className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You don&apos;t have permission to view escalations. Contact your admin for access.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          className="mt-2 h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-40 bg-muted/40" />
          <Skeleton className="h-6 w-24 rounded-full bg-muted/30" />
        </div>

        {/* Filter bar skeleton */}
        <div className="glass flex flex-wrap items-center gap-3 rounded-xl p-4">
          <Skeleton className="h-9 min-w-[200px] flex-1 rounded-lg bg-muted/30" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg bg-muted/20" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="glass overflow-hidden rounded-xl">
          <div className="border-b border-border px-4 py-3 flex gap-4">
            {["w-[100px]", "w-[140px]", "flex-1", "w-[100px]", "w-[110px]", "w-[90px]"].map((w, i) => (
              <Skeleton key={i} className={`h-4 ${w} bg-muted/20`} />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-4">
              <div className="flex items-center gap-2 w-[100px]">
                <Skeleton className="h-2 w-2 rounded-full bg-muted/30" />
                <Skeleton className="h-4 w-14 bg-muted/20" />
              </div>
              <div className="flex items-center gap-2.5 w-[140px]">
                <Skeleton className="h-7 w-7 rounded-lg bg-muted/30" />
                <Skeleton className="h-4 w-24 bg-muted/20" />
              </div>
              <Skeleton className="h-4 flex-1 bg-muted/15" />
              <Skeleton className="h-4 w-[80px] bg-muted/20" />
              <Skeleton className="h-5 w-[80px] rounded-full bg-muted/20" />
              <Skeleton className="h-7 w-[60px] rounded-md bg-muted/20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Escalations</h1>
        <span className="flex h-6 items-center rounded-full bg-amber-400/15 px-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-amber-400/20">
          {pendingCount} pending
        </span>
      </div>

      {/* Filter bar */}
      <div
        className="glass flex flex-wrap items-center gap-3 rounded-xl p-4"
        ref={dropdownRef}
      >
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
        <div className="relative">
          <button
            onClick={() => toggleDropdown("agent")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              selectedAgent !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain className="h-3.5 w-3.5" />
            <span>{selectedAgent === "All" ? "Agent" : selectedAgent}</span>
            <ChevronDown
              className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "agent" ? "rotate-180" : ""}`}
            />
          </button>
          {openDropdown === "agent" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[220px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {agentOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedAgent(option);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    selectedAgent === option
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("priority")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              selectedPriority !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>
              {selectedPriority === "All" ? "Priority" : selectedPriority}
            </span>
            <ChevronDown
              className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "priority" ? "rotate-180" : ""}`}
            />
          </button>
          {openDropdown === "priority" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {priorityOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedPriority(option);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    selectedPriority === option
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("status")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              selectedStatus !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>
              {selectedStatus === "All" ? "Status" : selectedStatus}
            </span>
            <ChevronDown
              className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`}
            />
          </button>
          {openDropdown === "status" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedStatus(option);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    selectedStatus === option
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("dateRange")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              selectedDateRange !== "all"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {selectedDateRange === "all"
                ? "Date range"
                : dateRangeOptions.find((o) => o.value === selectedDateRange)?.label}
            </span>
            <ChevronDown
              className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "dateRange" ? "rotate-180" : ""}`}
            />
          </button>
          {openDropdown === "dateRange" && (
            <div className="glass absolute left-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {dateRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedDateRange(option.value);
                    setOpenDropdown(null);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    selectedDateRange === option.value
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Desktop table */}
      <div className="glass hidden md:block overflow-hidden rounded-xl">
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
            {filteredEscalations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No escalations match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredEscalations.map((escalation) => {
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredEscalations.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No escalations match the current filters.
          </div>
        ) : (
          filteredEscalations.map((escalation) => {
            const Icon = escalation.agent.icon;
            const priority = priorityConfig[escalation.priority];
            const status = statusConfig[escalation.status];

            return (
              <Link
                key={escalation.id}
                href={`/escalations/${escalation.id}`}
                className="block rounded-lg border border-border p-4 space-y-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${priority.dot}`}
                    />
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {escalation.agent.name}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${status.bg} ${status.text} ${status.ring}`}
                  >
                    {escalation.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {escalation.summary}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {escalation.created}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 rounded-md px-2.5 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    Review
                  </Button>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalItems={filteredEscalations.length}
        itemsPerPage={25}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
