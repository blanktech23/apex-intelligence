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
  Pin,
  MessageSquare,
  Share2,
  X,
  Send,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// --- Types ---

type AnnouncementCategory = "win" | "update" | "alert" | "general";
type TimeFilter = "this_week" | "this_month" | "all";
type ReactionType = "thumbsUp" | "clap" | "heart" | "celebrate";

interface Comment {
  id: string;
  author: { name: string; initials: string; color: string };
  content: string;
  timestamp: string;
}

interface Announcement {
  id: string;
  author: { name: string; role: string; initials: string; color: string };
  timestamp: string;
  category: AnnouncementCategory;
  content: string;
  scope: string;
  reactions: Record<ReactionType, number>;
  pinned: boolean;
  comments: Comment[];
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
    badge: "bg-muted/50 text-muted-foreground border-border",
    icon: Bell,
  },
};

const reactionConfig: Record<ReactionType, { emoji: string; label: string }> = {
  thumbsUp: { emoji: "\uD83D\uDC4D", label: "Like" },
  clap: { emoji: "\uD83D\uDC4F", label: "Clap" },
  heart: { emoji: "\u2764\uFE0F", label: "Love" },
  celebrate: { emoji: "\uD83C\uDF89", label: "Celebrate" },
};

const timeFilterOptions: { label: string; value: TimeFilter }[] = [
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "All Time", value: "all" },
];

const categoryFilterOptions: { label: string; value: AnnouncementCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Wins", value: "win" },
  { label: "Updates", value: "update" },
  { label: "Alerts", value: "alert" },
  { label: "General", value: "general" },
];

// --- Mock Data ---

const initialAnnouncements: Announcement[] = [
  {
    id: "ann-001",
    author: { name: "Marcus Rivera", role: "CEO / Founder", initials: "MR", color: "bg-indigo-500/30 text-primary" },
    timestamp: "2026-03-14T09:30:00",
    category: "win",
    content:
      "Landed the $450K kitchen renovation project with the Westbrook family! This is our largest single-family residential project to date. Huge credit to Lisa for the client relationship and Amy for the stunning design concept that sealed the deal. This puts us ahead of our Q1 revenue target by 12%. Let's keep this momentum going into Q2!",
    scope: "Company-wide",
    reactions: { thumbsUp: 14, clap: 8, heart: 5, celebrate: 11 },
    pinned: true,
    comments: [
      { id: "c-001", author: { name: "Lisa Torres", initials: "LT", color: "bg-emerald-500/30 text-emerald-500" }, content: "Thank you! The Westbrooks are amazing clients. Excited for this one!", timestamp: "2026-03-14T10:15:00" },
      { id: "c-002", author: { name: "Amy Foster", initials: "AF", color: "bg-pink-500/30 text-pink-500" }, content: "The design concept really resonated with them. Can't wait to bring it to life!", timestamp: "2026-03-14T10:45:00" },
    ],
  },
  {
    id: "ann-002",
    author: { name: "Kevin Wu", role: "Operations Manager", initials: "KW", color: "bg-teal-500/30 text-teal-500" },
    timestamp: "2026-03-13T14:15:00",
    category: "alert",
    content:
      "New safety protocol for all job sites effective immediately. Following last week's near-miss at Lakewood, we've implemented a mandatory end-of-shift safety checklist. Every crew lead must complete the checklist before leaving the site. The checklist is available in the Safety section of our Knowledge Portal and has been printed for each job site's binder. Failure to complete will result in a safety review meeting.",
    scope: "Operations",
    reactions: { thumbsUp: 8, clap: 2, heart: 1, celebrate: 0 },
    pinned: false,
    comments: [
      { id: "c-003", author: { name: "Sarah Chen", initials: "SC", color: "bg-purple-500/30 text-purple-500" }, content: "Already distributed to all crew leads. Will follow up Monday.", timestamp: "2026-03-13T15:00:00" },
    ],
  },
  {
    id: "ann-003",
    author: { name: "David Park", role: "Finance Director", initials: "DP", color: "bg-amber-500/30 text-amber-500" },
    timestamp: "2026-03-12T11:00:00",
    category: "win",
    content:
      "Q1 revenue target exceeded by 12%! We closed $2.8M against our $2.5M target. Gross margins held steady at 34%. Net cash position is the strongest it's been in 18 months. Great work across all teams - the combination of higher close rates and better project management is really paying off.",
    scope: "Company-wide",
    reactions: { thumbsUp: 18, clap: 12, heart: 7, celebrate: 15 },
    pinned: false,
    comments: [],
  },
  {
    id: "ann-004",
    author: { name: "Sarah Chen", role: "Project Manager", initials: "SC", color: "bg-purple-500/30 text-purple-500" },
    timestamp: "2026-03-11T16:45:00",
    category: "update",
    content:
      "The AI scheduling assistant is now live for all project managers. You can access it from the Operations Dashboard. It will automatically flag scheduling conflicts, suggest optimal crew assignments based on skills and location, and send confirmation requests to subcontractors. Please report any issues in the #ops-tools Slack channel. Training session this Thursday at 2pm.",
    scope: "Operations",
    reactions: { thumbsUp: 11, clap: 6, heart: 3, celebrate: 4 },
    pinned: false,
    comments: [],
  },
  {
    id: "ann-005",
    author: { name: "Lisa Torres", role: "Client Relations Lead", initials: "LT", color: "bg-emerald-500/30 text-emerald-500" },
    timestamp: "2026-03-10T10:30:00",
    category: "update",
    content:
      "Client portal v2 is launching next Monday. New features include real-time project photo galleries, milestone tracking with automated notifications, and a direct messaging feature for quick questions. We've had 3 beta testers and the feedback has been extremely positive. This should significantly improve our mid-project communication scores.",
    scope: "Company-wide",
    reactions: { thumbsUp: 9, clap: 5, heart: 4, celebrate: 3 },
    pinned: false,
    comments: [],
  },
  {
    id: "ann-006",
    author: { name: "Amy Foster", role: "Lead Designer", initials: "AF", color: "bg-pink-500/30 text-pink-500" },
    timestamp: "2026-03-08T13:00:00",
    category: "general",
    content:
      "Reminder: Design team is attending the National Kitchen & Bath Association (NKBA) conference next week in Orlando. We'll be scouting new fixture suppliers, attending sessions on sustainable materials, and networking with potential partners. If anyone has specific supplier contacts or product categories they'd like us to explore, please send them my way by Friday.",
    scope: "Design",
    reactions: { thumbsUp: 5, clap: 2, heart: 1, celebrate: 0 },
    pinned: false,
    comments: [],
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
  return d.getMonth() === 2 && d.getFullYear() === 2026;
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
  const [categoryFilter, setCategoryFilter] = useState<AnnouncementCategory | "all">("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [userReactions, setUserReactions] = useState<Record<string, Set<ReactionType>>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTargetId, setShareTargetId] = useState<string | null>(null);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<AnnouncementCategory>("update");
  const [newScope, setNewScope] = useState("Company-wide");

  const toggleReaction = (annId: string, reaction: ReactionType) => {
    setUserReactions((prev) => {
      const next = { ...prev };
      if (!next[annId]) next[annId] = new Set();
      const reactions = new Set(next[annId]);
      if (reactions.has(reaction)) {
        reactions.delete(reaction);
      } else {
        reactions.add(reaction);
      }
      next[annId] = reactions;
      return next;
    });
  };

  const togglePin = (annId: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === annId) {
          const newPinned = !ann.pinned;
          toast.success(newPinned ? "Headline pinned" : "Headline unpinned");
          return { ...ann, pinned: newPinned };
        }
        return ann;
      })
    );
  };

  const toggleComments = (annId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(annId)) {
        next.delete(annId);
      } else {
        next.add(annId);
      }
      return next;
    });
  };

  const addComment = (annId: string) => {
    const content = commentInputs[annId]?.trim();
    if (!content) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: { name: "Joseph Wells", initials: "JW", color: "bg-indigo-500/30 text-primary" },
      content,
      timestamp: "2026-03-14T12:00:00",
    };
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === annId) {
          return { ...ann, comments: [...ann.comments, newComment] };
        }
        return ann;
      })
    );
    setCommentInputs((prev) => ({ ...prev, [annId]: "" }));
    toast.success("Comment added");
  };

  const handleCreate = () => {
    if (!newTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      author: { name: "Joseph Wells", role: "CEO / Founder", initials: "JW", color: "bg-indigo-500/30 text-primary" },
      timestamp: "2026-03-14T12:00:00",
      category: newCategory,
      content: newContent || newTitle,
      scope: newScope,
      reactions: { thumbsUp: 0, clap: 0, heart: 0, celebrate: 0 },
      pinned: false,
      comments: [],
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    toast.success("Headline posted successfully");
    setShowCreateModal(false);
    setNewTitle("");
    setNewContent("");
    setNewCategory("update");
    setNewScope("Company-wide");
  };

  const handleShare = (teamName: string) => {
    toast.success(`Headline shared with ${teamName}`);
    setShowShareModal(false);
    setShareTargetId(null);
  };

  // Sort: pinned first, then by timestamp
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const filtered = sorted.filter((ann) => {
    if (timeFilter === "this_week" && !isThisWeek(ann.timestamp)) return false;
    if (timeFilter === "this_month" && !isThisMonth(ann.timestamp)) return false;
    if (teamFilter !== "All" && ann.scope !== teamFilter && ann.scope !== "Company-wide") return false;
    if (categoryFilter !== "all" && ann.category !== categoryFilter) return false;
    return true;
  });

  const teamOptions = ["All", "Leadership", "Sales", "Operations", "Finance", "HR", ...Array.from(new Set(announcements.map((a) => a.scope).filter((s) => !["Company-wide", "All"].includes(s) && !["Leadership", "Sales", "Operations", "Finance", "HR"].includes(s))))];

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
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
          New Headline
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-wrap items-center gap-3">
        {/* Time filter tabs */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Time</span>
          <div className="inline-flex gap-1 rounded-lg bg-muted/50 p-1">
            {timeFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeFilter(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  timeFilter === opt.value
                    ? "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Category</span>
          <div className="inline-flex gap-1 rounded-lg bg-muted/50 p-1">
            {categoryFilterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategoryFilter(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                  categoryFilter === opt.value
                    ? "bg-indigo-600 text-primary-foreground shadow-lg shadow-indigo-500/25"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
            const myReactions = userReactions[ann.id] || new Set();
            const commentsOpen = expandedComments.has(ann.id);

            return (
              <div
                key={ann.id}
                className={`rounded-xl bg-card border backdrop-blur-xl p-5 hover:bg-muted/40 transition-all ${
                  ann.pinned
                    ? "border-indigo-500/30 bg-indigo-500/[0.03]"
                    : "border-border"
                }`}
              >
                {/* Pin indicator */}
                {ann.pinned && (
                  <div className="flex items-center gap-1.5 mb-3 text-[11px] text-indigo-400 font-medium">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </div>
                )}

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
                    {/* Pin button */}
                    <button
                      onClick={() => togglePin(ann.id)}
                      className={`rounded-lg p-1.5 transition-colors ${
                        ann.pinned
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-muted-foreground/50 hover:text-foreground hover:bg-muted/50"
                      }`}
                      title={ann.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                    {/* Share button */}
                    <button
                      onClick={() => { setShareTargetId(ann.id); setShowShareModal(true); }}
                      className="rounded-lg p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
                      title="Share to Other Teams"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
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

                {/* Reactions & Actions */}
                <div className="mt-4 ml-12">
                  <Separator className="bg-border mb-3" />
                  <div className="flex items-center gap-2 flex-wrap">
                    {(Object.keys(reactionConfig) as ReactionType[]).map((type) => {
                      const rc = reactionConfig[type];
                      const isActive = myReactions.has(type);
                      const count = ann.reactions[type] + (isActive ? 1 : 0);
                      if (count === 0 && !isActive) {
                        return (
                          <button
                            key={type}
                            onClick={() => toggleReaction(ann.id, type)}
                            className="flex items-center gap-1 text-xs transition-all rounded-lg px-2 py-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50"
                            title={rc.label}
                          >
                            <span className="text-sm">{rc.emoji}</span>
                          </button>
                        );
                      }
                      return (
                        <button
                          key={type}
                          onClick={() => toggleReaction(ann.id, type)}
                          className={`flex items-center gap-1.5 text-xs transition-all rounded-lg px-2.5 py-1.5 ${
                            isActive
                              ? "text-indigo-400 bg-indigo-500/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                          title={rc.label}
                        >
                          <span className="text-sm">{rc.emoji}</span>
                          <span className="tabular-nums">{count}</span>
                        </button>
                      );
                    })}

                    <div className="h-4 w-px bg-border mx-1" />

                    {/* Comments toggle */}
                    <button
                      onClick={() => toggleComments(ann.id)}
                      className={`flex items-center gap-1.5 text-xs transition-all rounded-lg px-2.5 py-1.5 ${
                        commentsOpen
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{ann.comments.length}</span>
                      {commentsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {commentsOpen && (
                    <div className="mt-3 space-y-3">
                      {ann.comments.length > 0 && (
                        <div className="space-y-2.5">
                          {ann.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5">
                              <Avatar className="h-6 w-6 shrink-0">
                                <AvatarFallback className={`${comment.author.color} text-[7px]`}>
                                  {comment.author.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 rounded-lg bg-muted/30 px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">{comment.author.name}</span>
                                  <span className="text-[10px] text-muted-foreground/60">{formatTimestamp(comment.timestamp)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Add comment input */}
                      <div className="flex gap-2">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="bg-indigo-500/30 text-primary text-[7px]">JW</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={commentInputs[ann.id] || ""}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [ann.id]: e.target.value }))}
                            placeholder="Write a comment..."
                            className="h-7 text-xs bg-muted/30 border-border rounded-lg"
                            onKeyDown={(e) => { if (e.key === "Enter") addComment(ann.id); }}
                          />
                          <button
                            onClick={() => addComment(ann.id)}
                            className="shrink-0 rounded-lg bg-indigo-600 px-2.5 h-7 text-primary-foreground hover:bg-indigo-500 transition-colors"
                          >
                            <Send className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Headline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">New Headline</h2>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's the headline?"
                  className="bg-muted/30 border-border"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share the details..."
                  rows={4}
                  className="w-full rounded-lg bg-muted/30 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["win", "update", "alert", "general"] as AnnouncementCategory[]).map((cat) => {
                      const cc = categoryConfig[cat];
                      return (
                        <button
                          key={cat}
                          onClick={() => setNewCategory(cat)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            newCategory === cat
                              ? `${cc.badge} ring-1`
                              : "bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {cc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Scope</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value)}
                    className="w-full rounded-lg bg-muted/30 border border-border px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                  >
                    <option value="Company-wide">Company-wide</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={handleCreate} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-indigo-500 transition-colors">
                Post Headline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share to Teams Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowShareModal(false); setShareTargetId(null); }} />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-popover border border-border backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Share to Other Teams</h2>
              <button onClick={() => { setShowShareModal(false); setShareTargetId(null); }} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Select teams to share this headline with:</p>
            <div className="space-y-2">
              {["Leadership", "Sales", "Operations", "Finance", "Design", "All Teams"].map((team) => (
                <button
                  key={team}
                  onClick={() => handleShare(team)}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-foreground bg-muted/30 hover:bg-muted/60 transition-colors"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {team}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
