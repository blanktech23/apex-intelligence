"use client";

import { useState } from "react";
import { PaginationBar } from "@/components/ui/pagination-bar";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  Plus,
  Filter,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Bot,
  MoreHorizontal,
  Loader2,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const statusConfig: Record<
  string,
  { color: string; icon: typeof CheckCircle2 }
> = {
  Planning: {
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: Clock,
  },
  "In Progress": {
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: Loader2,
  },
  "On Hold": {
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Pause,
  },
  Completed: {
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: CheckCircle2,
  },
};

const stats = [
  {
    label: "Total Projects",
    value: "47",
    icon: FolderKanban,
    change: "+3 this month",
    color: "text-indigo-400",
  },
  {
    label: "In Progress",
    value: "23",
    icon: TrendingUp,
    change: "49% of total",
    color: "text-emerald-400",
  },
  {
    label: "Completed This Month",
    value: "8",
    icon: CheckCircle2,
    change: "+2 vs last month",
    color: "text-blue-400",
  },
  {
    label: "Total Value",
    value: "$2.4M",
    icon: DollarSign,
    change: "+12.5% MoM",
    color: "text-amber-400",
  },
];

const projects = [
  {
    id: "proj-001",
    name: "Riverside Office Renovation",
    client: "Rivera General Contracting",
    status: "In Progress",
    progress: 68,
    budget: 185000,
    dueDate: "2026-05-15",
    team: [
      { initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
      { initials: "KL", color: "bg-emerald-500/30 text-emerald-300" },
      { initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    ],
    aiManaged: true,
  },
  {
    id: "proj-002",
    name: "Summit Heights Foundation",
    client: "Summit Builders LLC",
    status: "In Progress",
    progress: 42,
    budget: 92500,
    dueDate: "2026-06-30",
    team: [
      { initials: "SC", color: "bg-purple-500/30 text-purple-300" },
      { initials: "JT", color: "bg-red-500/30 text-red-300" },
    ],
    aiManaged: false,
  },
  {
    id: "proj-003",
    name: "Harbor View Kitchen Remodel",
    client: "Harbor View Construction",
    status: "Planning",
    progress: 10,
    budget: 47800,
    dueDate: "2026-07-20",
    team: [
      { initials: "RN", color: "bg-cyan-500/30 text-cyan-300" },
      { initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    ],
    aiManaged: true,
  },
  {
    id: "proj-004",
    name: "Lakewood Commercial Buildout",
    client: "Brooks Concrete & Masonry",
    status: "In Progress",
    progress: 85,
    budget: 312000,
    dueDate: "2026-04-10",
    team: [
      { initials: "MB", color: "bg-orange-500/30 text-orange-300" },
      { initials: "DP", color: "bg-amber-500/30 text-amber-300" },
      { initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    ],
    aiManaged: false,
  },
  {
    id: "proj-005",
    name: "Castillo Residence Landscape",
    client: "Castillo Landscape Design",
    status: "On Hold",
    progress: 30,
    budget: 28500,
    dueDate: "2026-08-01",
    team: [
      { initials: "LC", color: "bg-lime-500/30 text-lime-300" },
      { initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    ],
    aiManaged: false,
  },
  {
    id: "proj-006",
    name: "Downtown Electrical Overhaul",
    client: "Parkway Electrical Services",
    status: "Completed",
    progress: 100,
    budget: 78500,
    dueDate: "2026-03-01",
    team: [
      { initials: "DP", color: "bg-amber-500/30 text-amber-300" },
      { initials: "JT", color: "bg-red-500/30 text-red-300" },
      { initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    ],
    aiManaged: true,
  },
];

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      p.status.toLowerCase().replace(" ", "-") === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage construction projects
          </p>
        </div>
        <Button className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2" onClick={() => toast.success("Project created successfully")}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="glass border-border p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`mt-1 text-xs ${stat.color}`}>{stat.change}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass border-border bg-muted/30 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
          />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="glass w-[180px] border-border bg-muted/30 text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="glass-strong border-border bg-popover">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="planning">Planning</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-muted/30" />

      {/* Project Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project) => {
          const config = statusConfig[project.status];
          const StatusIcon = config.icon;
          return (
            <Link key={project.id} href={`/projects/${project.id}`} className="block">
            <Card
              className="glass border-border p-5 hover:bg-muted/30 hover:border-indigo-500/20 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer group h-full"
            >
              {/* Top: Name + Status */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-semibold text-foreground group-hover:text-indigo-300 transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {project.client}
                  </p>
                </div>
                <Badge variant="outline" className={config.color}>
                  <StatusIcon
                    className={`h-3 w-3 mr-1 ${
                      project.status === "In Progress"
                        ? "animate-spin"
                        : ""
                    }`}
                    style={
                      project.status === "In Progress"
                        ? { animationDuration: "3s" }
                        : undefined
                    }
                  />
                  {project.status}
                </Badge>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>
                <Progress
                  value={project.progress}
                  className="h-1.5 bg-muted/30"
                />
              </div>

              {/* Budget + Due Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    ${project.budget.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {new Date(project.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <Separator className="bg-muted/30 mb-4" />

              {/* Bottom: Team + AI Badge */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.team.map((member, i) => (
                    <Avatar
                      key={i}
                      className="h-7 w-7 border-2 border-background"
                    >
                      <AvatarFallback
                        className={`${member.color} text-[10px]`}
                      >
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {project.aiManaged && (
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-2 py-0.5"
                  >
                    <Bot className="h-3 w-3 mr-1" />
                    AI Managed
                  </Badge>
                )}
              </div>
            </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalItems={47}
        itemsPerPage={25}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
