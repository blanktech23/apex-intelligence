"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Zap,
  MapPin,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  activities as allActivities,
  contacts,
  deals,
  getContactById,
  ACTIVITY_TYPES,
  type Activity,
} from "@/lib/crm-data";

// ─── Date grouping helpers ───────────────────────────────────
function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const actDate = new Date(date);
  actDate.setHours(0, 0, 0, 0);

  if (actDate.getTime() === today.getTime()) return "Today";
  if (actDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff <= days * 24 * 60 * 60 * 1000 && diff >= 0;
}

export default function ActivitiesPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [contactFilter, setContactFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logForm, setLogForm] = useState({
    type: "note" as string,
    contactId: "" as string,
    dealId: "" as string,
    subject: "",
    description: "",
    duration: "",
  });

  // ─── Filter activities ──────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...allActivities];

    if (typeFilter !== "all") {
      result = result.filter((a) => a.type === typeFilter);
    }
    if (contactFilter !== "all") {
      result = result.filter((a) => a.contactId === contactFilter);
    }
    if (agentFilter === "ai") {
      result = result.filter((a) => a.agent === "ai");
    } else if (agentFilter === "manual") {
      result = result.filter((a) => a.agent === "manual");
    }
    if (dateFilter === "week") {
      result = result.filter((a) => isWithinDays(a.date, 7));
    } else if (dateFilter === "month") {
      result = result.filter((a) => isWithinDays(a.date, 30));
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [typeFilter, contactFilter, agentFilter, dateFilter]);

  // ─── Group by date ──────────────────────────────────────────
  const grouped = useMemo(() => {
    const groups: { label: string; key: string; items: typeof filtered }[] = [];
    const seen = new Map<string, number>();

    for (const act of filtered) {
      const key = getDateKey(act.date);
      if (seen.has(key)) {
        groups[seen.get(key)!].items.push(act);
      } else {
        seen.set(key, groups.length);
        groups.push({ label: getDateLabel(act.date), key, items: [act] });
      }
    }
    return groups;
  }, [filtered]);

  // ─── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const weekActivities = allActivities.filter((a) => isWithinDays(a.date, 7));
    const aiHandled = weekActivities.filter((a) => a.agent === "ai").length;
    const siteVisits = allActivities.filter(
      (a) => a.type === "site_visit" && isWithinDays(a.date, 30)
    ).length;
    const callsWithDuration = weekActivities.filter(
      (a) => a.duration && (a.type === "call" || a.type === "email")
    );
    const avgResponse =
      callsWithDuration.length > 0
        ? Math.round(
            callsWithDuration.reduce((s, a) => s + (a.duration ?? 0), 0) /
              callsWithDuration.length
          )
        : 0;

    return {
      weekTotal: weekActivities.length,
      aiHandled,
      avgResponse,
      siteVisits,
    };
  }, []);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleLogActivity() {
    if (!logForm.subject.trim() || !logForm.contactId) return;
    toast.success("Activity logged successfully");
    setLogForm({ type: "note", contactId: "", dealId: "", subject: "", description: "", duration: "" });
    setShowLogDialog(false);
  }

  // Deals for selected contact
  const contactDeals = logForm.contactId
    ? deals.filter((d) => d.contactId === logForm.contactId)
    : [];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-gradient text-2xl font-bold tracking-tight">
          Activities
        </h1>
        <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
          <DialogTrigger
            render={
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              />
            }
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Log Activity
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Activity</DialogTitle>
              <DialogDescription>Record a new activity.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                <Select
                  value={logForm.type}
                  onValueChange={(v) => v && setLogForm({ ...logForm, type: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Contact</label>
                <Select
                  value={logForm.contactId}
                  onValueChange={(v) =>
                    v && setLogForm({ ...logForm, contactId: v, dealId: "" })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {contactDeals.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Deal <span className="text-muted-foreground/50">(optional)</span>
                  </label>
                  <Select
                    value={logForm.dealId}
                    onValueChange={(v) =>
                      v && setLogForm({ ...logForm, dealId: v })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactDeals.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                <Input
                  value={logForm.subject}
                  onChange={(e) =>
                    setLogForm({ ...logForm, subject: e.target.value })
                  }
                  placeholder="Activity subject..."
                  className="bg-transparent border-border"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea
                  value={logForm.description}
                  onChange={(e) =>
                    setLogForm({ ...logForm, description: e.target.value })
                  }
                  placeholder="Add details..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg p-2 resize-none focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Duration (minutes) <span className="text-muted-foreground/50">(optional)</span>
                </label>
                <Input
                  type="number"
                  value={logForm.duration}
                  onChange={(e) =>
                    setLogForm({ ...logForm, duration: e.target.value })
                  }
                  placeholder="e.g. 30"
                  className="bg-transparent border-border w-32"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose
                render={<Button variant="outline" className="border-border" />}
              >
                Cancel
              </DialogClose>
              <Button
                onClick={handleLogActivity}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Log Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-muted-foreground">This Week</span>
          </div>
          <p className="text-xl font-bold text-foreground">{stats.weekTotal}</p>
        </Card>
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-muted-foreground">AI-Handled</span>
          </div>
          <p className="text-xl font-bold text-foreground">{stats.aiHandled}</p>
        </Card>
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-muted-foreground">Avg Response</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {stats.avgResponse} <span className="text-sm font-normal text-muted-foreground">min</span>
          </p>
        </Card>
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-muted-foreground">Site Visits (Month)</span>
          </div>
          <p className="text-xl font-bold text-foreground">{stats.siteVisits}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ACTIVITY_TYPES.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={contactFilter} onValueChange={(v) => v && setContactFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              {contacts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={agentFilter} onValueChange={(v) => v && setAgentFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="ai">AI Only</SelectItem>
              <SelectItem value="manual">Manual Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(v) => v && setDateFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          {(typeFilter !== "all" ||
            contactFilter !== "all" ||
            agentFilter !== "all" ||
            dateFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setContactFilter("all");
                setAgentFilter("all");
                setDateFilter("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Filters
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} activit{filtered.length === 1 ? "y" : "ies"}
          </span>
        </div>
      </Card>

      {/* Activity Feed */}
      {grouped.length === 0 ? (
        <Card className="glass border-border p-8 text-center">
          <p className="text-muted-foreground">No activities match the current filters.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {group.label}
                </h3>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
              </div>
              <div className="relative space-y-0">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                {group.items.map((activity) => {
                  const typeConfig = ACTIVITY_TYPES.find(
                    (t) => t.key === activity.type
                  );
                  const TypeIcon = typeConfig?.icon ?? Clock;
                  const actContact = getContactById(activity.contactId);
                  const actDeal = activity.dealId
                    ? deals.find((d) => d.id === activity.dealId)
                    : null;
                  const isExpanded = expandedIds.has(activity.id);
                  const descTruncated =
                    activity.description.length > 100 && !isExpanded;

                  return (
                    <div key={activity.id} className="relative flex gap-4 py-3">
                      <div
                        className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                          activity.agent === "ai"
                            ? "border-amber-500/30 bg-amber-500/10"
                            : "border-border bg-foreground/5"
                        }`}
                      >
                        <TypeIcon
                          className={`h-4 w-4 ${
                            activity.agent === "ai"
                              ? "text-amber-600 dark:text-amber-400"
                              : typeConfig?.color ?? "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {activity.subject}
                          </span>
                          {activity.agent === "ai" && (
                            <Badge
                              variant="outline"
                              className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] px-1.5 py-0"
                            >
                              <Bot className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          {activity.direction && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              {activity.direction === "inbound" ? (
                                <>
                                  <ArrowDownLeft className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-sm text-muted-foreground cursor-pointer"
                          onClick={() =>
                            activity.description.length > 100 &&
                            toggleExpand(activity.id)
                          }
                        >
                          {descTruncated
                            ? activity.description.slice(0, 100) + "..."
                            : activity.description}
                          {activity.description.length > 100 && (
                            <button className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 text-xs inline-flex items-center gap-0.5">
                              {isExpanded ? (
                                <>
                                  less <ChevronUp className="h-3 w-3" />
                                </>
                              ) : (
                                <>
                                  more <ChevronDown className="h-3 w-3" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                          {actContact && (
                            <Link
                              href={`/crm/contacts/${actContact.id}`}
                              className="hover:text-indigo-600 dark:text-indigo-400 transition-colors"
                            >
                              {actContact.name}
                            </Link>
                          )}
                          {actDeal && (
                            <>
                              <span className="text-border">|</span>
                              <Link
                                href={`/crm/deals/${actDeal.id}`}
                                className="hover:text-indigo-600 dark:text-indigo-400 transition-colors"
                              >
                                {actDeal.name}
                              </Link>
                            </>
                          )}
                          <span className="text-border">|</span>
                          <span>
                            {new Date(activity.date).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          {activity.duration && (
                            <>
                              <span className="text-border">|</span>
                              <span>{activity.duration} min</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
