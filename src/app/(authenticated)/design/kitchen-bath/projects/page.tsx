"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Clock,
  ChevronRight,
  Bath,
  ChefHat,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RoomType = "kitchen" | "bathroom" | "both";
type ProjectStatus =
  | "draft"
  | "in-design"
  | "awaiting-estimate"
  | "approved"
  | "in-production";

interface DesignProject {
  id: string;
  name: string;
  client: string;
  roomType: RoomType;
  status: ProjectStatus;
  lastModified: string;
  thumbnailGradient: string;
  dimensions: string;
  itemCount: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const roomTypeConfig: Record<
  RoomType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  kitchen: { label: "Kitchen", icon: ChefHat, color: "text-amber-400 bg-amber-500/10" },
  bathroom: { label: "Bathroom", icon: Bath, color: "text-cyan-400 bg-cyan-500/10" },
  both: { label: "Both", icon: Layers, color: "text-indigo-400 bg-indigo-500/10" },
};

const statusConfig: Record<
  ProjectStatus,
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "text-gray-400 bg-gray-500/10" },
  "in-design": { label: "In Design", color: "text-indigo-400 bg-indigo-500/10" },
  "awaiting-estimate": {
    label: "Awaiting Estimate",
    color: "text-amber-400 bg-amber-500/10",
  },
  approved: { label: "Approved", color: "text-green-400 bg-green-500/10" },
  "in-production": { label: "In Production", color: "text-cyan-400 bg-cyan-500/10" },
};

const mockProjects: DesignProject[] = [
  {
    id: "prj-1",
    name: "Johnson Kitchen Renovation",
    client: "Mike & Sarah Johnson",
    roomType: "kitchen",
    status: "in-design",
    lastModified: "Today, 2:15 PM",
    thumbnailGradient: "from-blue-500/20 via-indigo-500/10 to-cyan-500/20",
    dimensions: "12' x 14'",
    itemCount: 17,
  },
  {
    id: "prj-2",
    name: "Park Bathroom Remodel",
    client: "Lisa Park",
    roomType: "bathroom",
    status: "awaiting-estimate",
    lastModified: "Today, 10:30 AM",
    thumbnailGradient: "from-cyan-500/20 via-teal-500/10 to-emerald-500/20",
    dimensions: "8' x 10'",
    itemCount: 12,
  },
  {
    id: "prj-3",
    name: "Torres Kitchen + Bath Bundle",
    client: "Maria Torres",
    roomType: "both",
    status: "approved",
    lastModified: "Yesterday, 4:30 PM",
    thumbnailGradient: "from-violet-500/20 via-purple-500/10 to-pink-500/20",
    dimensions: "Kitchen 10'x12' + Bath 6'x8'",
    itemCount: 28,
  },
  {
    id: "prj-4",
    name: "Chen Kitchen Refresh",
    client: "David Chen",
    roomType: "kitchen",
    status: "in-production",
    lastModified: "Mar 15, 3:00 PM",
    thumbnailGradient: "from-amber-500/20 via-orange-500/10 to-red-500/20",
    dimensions: "14' x 16'",
    itemCount: 22,
  },
  {
    id: "prj-5",
    name: "Oakwood Spec Home - Kitchen",
    client: "Oakwood Development",
    roomType: "kitchen",
    status: "draft",
    lastModified: "Mar 14, 11:00 AM",
    thumbnailGradient: "from-gray-500/20 via-slate-500/10 to-zinc-500/20",
    dimensions: "11' x 13'",
    itemCount: 0,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DesignProjectsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/design/kitchen-bath">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Design Projects
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Kitchen & bath designs managed by the Design Spec Assistant
            </p>
          </div>
        </div>
        <Button
          className="gap-2 bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          onClick={() => toast.success("New project dialog would open")}
        >
          <Plus className="size-3.5" />
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects or clients..."
          className="w-full rounded-lg border border-border bg-muted/30 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Project cards */}
      <div className="space-y-3">
        {filtered.map((project) => {
          const room = roomTypeConfig[project.roomType];
          const status = statusConfig[project.status];
          const RoomIcon = room.icon;

          return (
            <div
              key={project.id}
              className="glass rounded-xl p-4 transition-all duration-200 glass-hover group"
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail placeholder */}
                <div
                  className={`hidden sm:flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${project.thumbnailGradient} border border-border`}
                >
                  {/* Mini room outline */}
                  <svg viewBox="0 0 80 56" className="h-10 w-14 opacity-40">
                    <rect
                      x="4"
                      y="4"
                      width="72"
                      height="48"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-foreground"
                    />
                    <rect x="6" y="6" width="20" height="6" rx="1" fill="currentColor" className="text-foreground/30" />
                    <rect x="6" y="14" width="6" height="20" rx="1" fill="currentColor" className="text-foreground/30" />
                    {project.roomType !== "bathroom" && (
                      <rect x="28" y="24" width="24" height="14" rx="1" fill="currentColor" className="text-foreground/20" />
                    )}
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {project.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${room.color}`}
                    >
                      <RoomIcon className="size-3" />
                      {room.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {project.client}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground/60">
                    <span>{project.dimensions}</span>
                    <span className="size-0.5 rounded-full bg-muted-foreground/30" />
                    <span>{project.itemCount} items</span>
                    <span className="size-0.5 rounded-full bg-muted-foreground/30" />
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {project.lastModified}
                    </span>
                  </div>
                </div>

                {/* Open button */}
                <Link href="/design/kitchen-bath">
                  <Button
                    variant="outline"
                    className="gap-1.5 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    Open
                    <ChevronRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass rounded-xl px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No projects match your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
