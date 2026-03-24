"use client";

import {
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
  CircleDot,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Theme colors                                                       */
/* ------------------------------------------------------------------ */

const COLORS = {
  indigo: "#6366f1",
  cyan: "#22d3ee",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
};

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const myGoals = [
  {
    id: "g1",
    name: "Increase revenue to $300K/quarter",
    status: "on_track" as const,
    progress: 72,
    dueDate: "Mar 31, 2026",
  },
  {
    id: "g2",
    name: "Launch 2 new service offerings",
    status: "on_track" as const,
    progress: 50,
    dueDate: "Mar 31, 2026",
  },
  {
    id: "g3",
    name: "Improve lead conversion to 22%",
    status: "off_track" as const,
    progress: 84,
    dueDate: "Mar 31, 2026",
  },
  {
    id: "g4",
    name: "Reduce customer churn by 15%",
    status: "on_track" as const,
    progress: 60,
    dueDate: "Mar 31, 2026",
  },
];

interface MyKpi {
  id: string;
  name: string;
  currentValue: number;
  goalValue: number;
  unit: "$" | "%" | "#" | "days";
  weeklyValues: number[];
  status: "on_track" | "off_track";
  trend: number;
}

const myKpis: MyKpi[] = [
  {
    id: "k1",
    name: "Revenue",
    currentValue: 284000,
    goalValue: 250000,
    unit: "$",
    weeklyValues: [210, 218, 225, 230, 228, 240, 248, 255, 260, 268, 272, 278, 284],
    status: "on_track",
    trend: 4.2,
  },
  {
    id: "k2",
    name: "Lead Conversion Rate",
    currentValue: 18.5,
    goalValue: 22,
    unit: "%",
    weeklyValues: [15, 16, 14, 15.5, 16, 17, 16.5, 17, 17.5, 18, 17.8, 18.2, 18.5],
    status: "off_track",
    trend: 1.6,
  },
];

const myActionItems = [
  { id: "a1", text: "Review Q1 financial projections", due: "Today", priority: "high" as const, overdue: false },
  { id: "a2", text: "Approve new subcontractor agreement", due: "Tomorrow", priority: "high" as const, overdue: false },
  { id: "a3", text: "Follow up with Johnson project change order", due: "Mar 14", priority: "medium" as const, overdue: true },
  { id: "a4", text: "Schedule quarterly all-hands meeting", due: "Mar 18", priority: "low" as const, overdue: false },
  { id: "a5", text: "Submit safety audit findings", due: "Mar 12", priority: "high" as const, overdue: true },
  { id: "a6", text: "Update bid pipeline spreadsheet", due: "Mar 20", priority: "medium" as const, overdue: false },
];

const upcomingMeetings = [
  { id: "m1", name: "Leadership L10", date: "Mar 17, 2026", time: "9:00 AM", team: "Leadership" },
  { id: "m2", name: "Sales Weekly", date: "Mar 18, 2026", time: "10:30 AM", team: "Sales" },
  { id: "m3", name: "Quarterly Planning", date: "Mar 20, 2026", time: "1:00 PM", team: "All Teams" },
];

const myIssues = [
  { id: "i1", title: "Subcontractor scheduling conflicts on 3 projects", priority: "high" as const, raisedBy: "Me", daysOpen: 5 },
  { id: "i2", title: "Material cost increases impacting margins", priority: "high" as const, raisedBy: "David Kim", daysOpen: 12 },
  { id: "i3", title: "Client approval delays on Henderson project", priority: "medium" as const, raisedBy: "Mike Torres", daysOpen: 8 },
];

const recentActivity = [
  { id: "r1", action: "Updated KPI", detail: "Revenue value updated to $284K", time: "2 hours ago", icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
  { id: "r2", action: "Resolved Issue", detail: "Permit delay on Oak Street project", time: "5 hours ago", icon: CheckCircle2, color: "text-cyan-600 dark:text-cyan-400" },
  { id: "r3", action: "Completed Action", detail: "Reviewed Q1 hiring plan", time: "Yesterday", icon: CircleDot, color: "text-indigo-600 dark:text-indigo-400" },
  { id: "r4", action: "Goal Updated", detail: "Lead conversion progress to 84%", time: "Yesterday", icon: Target, color: "text-amber-600 dark:text-amber-400" },
  { id: "r5", action: "Meeting Rated", detail: "Leadership L10 rated 8/10", time: "2 days ago", icon: Calendar, color: "text-cyan-600 dark:text-cyan-400" },
  { id: "r6", action: "Issue Created", detail: "Subcontractor scheduling conflicts", time: "3 days ago", icon: AlertCircle, color: "text-red-600 dark:text-red-400" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatValue(value: number, unit: string): string {
  if (unit === "$") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  }
  if (unit === "%") return `${value}%`;
  if (unit === "days") return `${value}d`;
  return value.toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Mini Sparkline                                                     */
/* ------------------------------------------------------------------ */

function MiniSparkline({ data, status }: { data: number[]; status: string }) {
  const chartData = data.map((v, i) => ({ w: i, v }));
  const color = status === "on_track" ? COLORS.green : COLORS.red;
  return (
    <ResponsiveContainer width={120} height={40}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function MyDashboardPage() {
  const overdue = myActionItems.filter((a) => a.overdue).length;
  const dueThisWeek = myActionItems.filter((a) => !a.overdue && (a.due === "Today" || a.due === "Tomorrow")).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          My Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your personal view across goals, KPIs, action items, and meetings
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass rounded-xl p-4 transition-all duration-300 glass-hover">
          <p className="text-xs text-muted-foreground">My Goals</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{myGoals.length}</p>
          <p className="text-xs text-green-600 dark:text-green-400">{myGoals.filter((g) => g.status === "on_track").length} on track</p>
        </div>
        <div className="glass rounded-xl p-4 transition-all duration-300 glass-hover">
          <p className="text-xs text-muted-foreground">Action Items</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{myActionItems.length}</p>
          <p className="text-xs text-red-600 dark:text-red-400">{overdue} overdue</p>
        </div>
        <div className="glass rounded-xl p-4 transition-all duration-300 glass-hover">
          <p className="text-xs text-muted-foreground">Open Issues</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{myIssues.length}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">{myIssues.filter((i) => i.priority === "high").length} high priority</p>
        </div>
        <div className="glass rounded-xl p-4 transition-all duration-300 glass-hover">
          <p className="text-xs text-muted-foreground">Next Meeting</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{upcomingMeetings[0].time}</p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">{upcomingMeetings[0].date}</p>
        </div>
      </div>

      {/* Main grid: Goals + KPIs side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Goals */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">My Goals</h2>
            <span className="text-xs text-muted-foreground">Q1 2026</span>
          </div>
          <div className="space-y-3">
            {myGoals.map((goal) => (
              <div key={goal.id} className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="mb-2 flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground">{goal.name}</p>
                  <span
                    className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      goal.status === "on_track"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                        : "bg-red-500/15 text-red-600 dark:text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                    }`}
                  >
                    {goal.status === "on_track" ? "On Track" : "Off Track"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        goal.status === "on_track" ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{goal.progress}%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground/70">Due {goal.dueDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My KPIs */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">My KPIs</h2>
            <span className="text-xs text-muted-foreground">Assigned measurables</span>
          </div>
          <div className="space-y-4">
            {myKpis.map((kpi) => (
              <div key={kpi.id} className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{kpi.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      kpi.status === "on_track"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                        : "bg-red-500/15 text-red-600 dark:text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                    }`}
                  >
                    {kpi.status === "on_track" ? "On Track" : "Off Track"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {formatValue(kpi.currentValue, kpi.unit)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Goal: {formatValue(kpi.goalValue, kpi.unit)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1">
                      {kpi.trend > 0 ? (
                        <TrendingUp className="size-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="size-3.5 text-red-600 dark:text-red-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          kpi.trend > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
                      </span>
                    </div>
                    <MiniSparkline data={kpi.weeklyValues} status={kpi.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items + Upcoming Meetings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Action Items - wider */}
        <div className="glass rounded-xl p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">My Action Items</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-amber-600 dark:text-amber-400">{dueThisWeek} due this week</span>
              <span className="text-xs text-red-600 dark:text-red-400">{overdue} overdue</span>
            </div>
          </div>
          <div className="space-y-2">
            {myActionItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  item.overdue
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-border bg-muted/20"
                }`}
              >
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                    item.overdue ? "bg-red-500/15" : "bg-muted"
                  }`}
                >
                  {item.overdue ? (
                    <AlertCircle className="size-3.5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Clock className="size-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{item.text}</p>
                  <p className={`text-xs ${item.overdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                    {item.overdue ? `Overdue - was due ${item.due}` : `Due ${item.due}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.priority === "high"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : item.priority === "medium"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings - narrower */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Upcoming Meetings</h2>
          </div>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Calendar className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{meeting.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {meeting.date} at {meeting.time}
                  </p>
                  <p className="text-xs text-muted-foreground/70">{meeting.team}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issues + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Issues */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">My Issues</h2>
            <span className="text-xs text-muted-foreground">{myIssues.length} open</span>
          </div>
          <div className="space-y-3">
            {myIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <div className="mb-1 flex items-start justify-between">
                  <p className="text-sm font-medium text-foreground">{issue.title}</p>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      issue.priority === "high"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {issue.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Raised by {issue.raisedBy}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <span>{issue.daysOpen} days open</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {recentActivity.map((activity, idx) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-3 py-2.5">
                  <div className="relative flex flex-col items-center">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className={`size-3.5 ${activity.color}`} />
                    </div>
                    {idx < recentActivity.length - 1 && (
                      <div className="mt-1 h-6 w-px bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.action}</span>{" "}
                      <span className="text-muted-foreground">{activity.detail}</span>
                    </p>
                    <p className="text-xs text-muted-foreground/70">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
