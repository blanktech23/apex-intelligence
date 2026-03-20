"use client";

import { useState } from "react";
import {
  Megaphone,
  Plus,
  ThumbsUp,
  Trophy,
  Bell,
  AlertTriangle,
  Info,
  Clock,
  Users,
  ChevronDown,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// --- Types ---

type AnnouncementCategory = "win" | "update" | "alert" | "general";
type TimeFilter = "this_week" | "this_month" | "all";

interface Announcement {
  id: string;
  author: { name: string; role: string; initials: string; color: string };
  timestamp: string;
  category: AnnouncementCategory;
  content: string;
  scope: string;
  reactions: number;
}

// --- Config ---

const categoryConfig: Record<
  AnnouncementCategory,
  { label: string; badge: string; icon: typeof Trophy }
> = {
  win: {
    label: "Win",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: Trophy,
  },
  update: {
    label: "Update",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: Info,
  },
  alert: {
    label: "Alert",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: AlertTriangle,
  },
  general: {
    label: "General",
    badge: "bg-[rgba(255,255,255,0.06)] text-muted-foreground border-[rgba(255,255,255,0.1)]",
    icon: Bell,
  },
};

const timeFilterOptions: { label: string; value: TimeFilter }[] = [
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "All", value: "all" },
];

// --- Mock Data ---

const mockAnnouncements: Announcement[] = [
  {
    id: "ann-001",
    author: { name: "Marcus Rivera", role: "CEO / Founder", initials: "MR", color: "bg-indigo-500/30 text-indigo-300" },
    timestamp: "2026-03-14T09:30:00",
    category: "win",
    content:
      "Landed the $450K kitchen renovation project with the Westbrook family! This is our largest single-family residential project to date. Huge credit to Lisa for the client relationship and Amy for the stunning design concept that sealed the deal. This puts us ahead of our Q1 revenue target by 12%. Let's keep this momentum going into Q2!",
    scope: "Company-wide",
    reactions: 14,
  },
  {
    id: "ann-002",
    author: { name: "Kevin Wu", role: "Operations Manager", initials: "KW", color: "bg-teal-500/30 text-teal-300" },
    timestamp: "2026-03-13T14:15:00",
    category: "alert",
    content:
      "New safety protocol for all job sites effective immediately. Following last week's near-miss at Lakewood, we've implemented a mandatory end-of-shift safety checklist. Every crew lead must complete the checklist before leaving the site. The checklist is available in the Safety section of our Knowledge Portal and has been printed for each job site's binder. Failure to complete will result in a safety review meeting.",
    scope: "Operations",
    reactions: 8,
  },
  {
    id: "ann-003",
    author: { name: "David Park", role: "Finance Director", initials: "DP", color: "bg-amber-500/30 text-amber-300" },
    timestamp: "2026-03-12T11:00:00",
    category: "win",
    content:
      "Q1 revenue target exceeded by 12%! We closed $2.8M against our $2.5M target. Gross margins held steady at 34%. Net cash position is the strongest it's been in 18 months. Great work across all teams - the combination of higher close rates and better project management is really paying off.",
    scope: "Company-wide",
    reactions: 18,
  },
  {
    id: "ann-004",
    author: { name: "Sarah Chen", role: "Project Manager", initials: "SC", color: "bg-purple-500/30 text-purple-300" },
    timestamp: "2026-03-11T16:45:00",
    category: "update",
    content:
      "The AI scheduling assistant is now live for all project managers. You can access it from the Operations Dashboard. It will automatically flag scheduling conflicts, suggest optimal crew assignments based on skills and location, and send confirmation requests to subcontractors. Please report any issues in the #ops-tools Slack channel. Training session this Thursday at 2pm.",
    scope: "Operations",
    reactions: 11,
  },
  {
    id: "ann-005",
    author: { name: "Lisa Torres", role: "Client Relations Lead", initials: "LT", color: "bg-emerald-500/30 text-emerald-300" },
    timestamp: "2026-03-10T10:30:00",
    category: "update",
    content:
      "Client portal v2 is launching next Monday. New features include real-time project photo galleries, milestone tracking with automated notifications, and a direct messaging feature for quick questions. We've had 3 beta testers and the feedback has been extremely positive. This should significantly improve our mid-project communication scores.",
    scope: "Company-wide",
    reactions: 9,
  },
  {
    id: "ann-006",
    author: { name: "Amy Foster", role: "Lead Designer", initials: "AF", color: "bg-pink-500/30 text-pink-300" },
    timestamp: "2026-03-08T13:00:00",
    category: "general",
    content:
      "Reminder: Design team is attending the National Kitchen & Bath Association (NKBA) conference next week in Orlando. We'll be scouting new fixture suppliers, attending sessions on sustainable materials, and networking with potential partners. If anyone has specific supplier contacts or product categories they'd like us to explore, please send them my way by Friday.",
    scope: "Design",
    reactions: 5,
  },
];

// --- Helpers ---

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const weekStart = new Date("2026-03-09");
  const weekEnd = new Date("2026-03-15");
  return d >= weekStart && d <= weekEnd;
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  return d.getMonth() === 2 && d.getFullYear() === 2026; // March 2026
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date("2026-03-14T12:00:00");
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// --- Component ---

export default function AnnouncementsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [teamFilter, setTeamFilter] = useState("All");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filtered = mockAnnouncements.filter((ann) => {
    // Time filter
    if (timeFilter === "this_week" && !isThisWeek(ann.timestamp)) return false;
    if (timeFilter === "this_month" && !isThisMonth(ann.timestamp)) return false;
    // Team filter
    if (teamFilter !== "All" && ann.scope !== teamFilter && ann.scope !== "Company-wide") return false;
    return true;
  });

  const teamOptions = ["All", ...Array.from(new Set(mockAnnouncements.map((a) => a.scope)))];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Company news, wins, and team updates
          </p>
        </div>
        <Button
          className="glow-primary bg-indigo-600 hover:bg-indigo-500 text-primary-foreground gap-2"
          onClick={() => toast.success("Announcement posted successfully")}
        >
          <Plus className="h-4 w-4" />
          Post Announcement
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        {/* Time filter tabs */}
        <div className="inline-flex gap-1 rounded-lg bg-[rgba(255,255,255,0.04)] p-1">
          {timeFilterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                timeFilter === opt.value
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Team / scope filter */}
        <div className="relative ml-auto">
          <button
            onClick={() => setOpenDropdown(openDropdown === "team" ? null : "team")}
            className={`glass glass-hover flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
              teamFilter !== "All"
                ? "text-primary ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{teamFilter === "All" ? "All Teams" : teamFilter}</span>
            <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${openDropdown === "team" ? "rotate-180" : ""}`} />
          </button>
          {openDropdown === "team" && (
            <div className="glass absolute right-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {teamOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setTeamFilter(opt); setOpenDropdown(null); }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    teamFilter === opt ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No announcements match the current filters.</p>
          </div>
        ) : (
          filtered.map((ann) => {
            const config = categoryConfig[ann.category];
            const CatIcon = config.icon;
            const liked = likedPosts.has(ann.id);
            const reactionCount = ann.reactions + (liked ? 1 : 0);

            return (
              <div
                key={ann.id}
                className="rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl p-5 hover:bg-[rgba(255,255,255,0.06)] transition-all"
              >
                {/* Author header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={`${ann.author.color} text-xs`}>
                        {ann.author.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{ann.author.name}</span>
                        <span className="text-xs text-muted-foreground">{ann.author.role}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(ann.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Category badge */}
                    <Badge variant="outline" className={`${config.badge} text-[10px]`}>
                      <CatIcon className="h-3 w-3 mr-1" />
                      {config.label}
                    </Badge>
                    {/* Scope badge */}
                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                      {ann.scope === "Company-wide" ? (
                        <Users className="h-3 w-3 mr-1" />
                      ) : null}
                      {ann.scope}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4 ml-12">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                {/* Reactions */}
                <div className="mt-4 ml-12">
                  <Separator className="bg-[rgba(255,255,255,0.06)] mb-3" />
                  <button
                    onClick={() => toggleLike(ann.id)}
                    className={`flex items-center gap-1.5 text-xs transition-all rounded-lg px-2.5 py-1.5 ${
                      liked
                        ? "text-indigo-400 bg-indigo-500/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-[rgba(255,255,255,0.05)]"
                    }`}
                  >
                    <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-indigo-400" : ""}`} />
                    <span className="tabular-nums">{reactionCount}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
