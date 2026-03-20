'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronLeft,
  Star,
  Plus,
  ArrowRight,
  ThumbsUp,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SectionStatus = 'upcoming' | 'active' | 'completed';

interface MeetingSection {
  id: string;
  name: string;
  minutes: number;
  status: SectionStatus;
}

interface Attendee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  presence: 'active' | 'joined' | 'absent';
  rating?: number;
}

interface KPI {
  name: string;
  target: string;
  actual: string;
  onTrack: boolean;
}

interface Rock {
  id: string;
  name: string;
  owner: string;
  status: 'On Track' | 'Off Track' | 'At Risk';
}

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  completed: boolean;
}

interface Headline {
  id: string;
  text: string;
  author: string;
  time: string;
}

interface Issue {
  id: string;
  title: string;
  raisedBy: string;
  priority: 'High' | 'Medium' | 'Low';
  votes: number;
  status: 'open' | 'discussing' | 'resolved';
  resolution?: string;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialSections: MeetingSection[] = [
  { id: 'checkin', name: 'Check-in', minutes: 5, status: 'completed' },
  { id: 'scorecard', name: 'Scorecard Review', minutes: 5, status: 'completed' },
  { id: 'rocks', name: 'Rock Review', minutes: 5, status: 'active' },
  { id: 'actions', name: 'Action Item Review', minutes: 5, status: 'upcoming' },
  { id: 'headlines', name: 'Headlines', minutes: 5, status: 'upcoming' },
  { id: 'ids', name: 'IDS - Issues', minutes: 60, status: 'upcoming' },
  { id: 'conclude', name: 'Conclude', minutes: 5, status: 'upcoming' },
];

const attendees: Attendee[] = [
  { id: 'a1', name: 'Joseph', role: 'Visionary', avatar: 'J', presence: 'active' },
  { id: 'a2', name: 'Mike Torres', role: 'Integrator', avatar: 'M', presence: 'active' },
  { id: 'a3', name: 'Sarah Chen', role: 'Sales Lead', avatar: 'S', presence: 'active' },
  { id: 'a4', name: 'Lisa Park', role: 'Design Lead', avatar: 'L', presence: 'joined' },
  { id: 'a5', name: 'David Kim', role: 'Ops Manager', avatar: 'D', presence: 'active' },
  { id: 'a6', name: 'Rachel Adams', role: 'Finance', avatar: 'R', presence: 'absent' },
];

const kpis: KPI[] = [
  { name: 'Revenue', target: '$280K', actual: '$295K', onTrack: true },
  { name: 'New Leads', target: '40', actual: '38', onTrack: false },
  { name: 'Close Rate', target: '35%', actual: '42%', onTrack: true },
  { name: 'Project Margin', target: '28%', actual: '31%', onTrack: true },
  { name: 'Customer Sat.', target: '4.5', actual: '4.7', onTrack: true },
  { name: 'Active Projects', target: '15', actual: '12', onTrack: false },
];

const initialRocks: Rock[] = [
  { id: 'r1', name: 'Launch AI estimating for all project types', owner: 'Joseph', status: 'On Track' },
  { id: 'r2', name: 'Hire 2 senior project managers', owner: 'Mike Torres', status: 'Off Track' },
  { id: 'r3', name: 'Implement customer portal v2', owner: 'Sarah Chen', status: 'On Track' },
  { id: 'r4', name: 'Reduce material waste by 15%', owner: 'David Kim', status: 'At Risk' },
  { id: 'r5', name: 'Complete brand refresh', owner: 'Lisa Park', status: 'On Track' },
];

const initialActionItems: ActionItem[] = [
  { id: 'ai1', description: 'Send revised proposal to Westfield client', owner: 'Sarah Chen', dueDate: 'Mar 20', completed: false },
  { id: 'ai2', description: 'Review Q1 financials with bookkeeper', owner: 'Joseph', dueDate: 'Mar 19', completed: true },
  { id: 'ai3', description: 'Schedule crew training for new safety protocols', owner: 'Mike Torres', dueDate: 'Mar 21', completed: false },
  { id: 'ai4', description: 'Update project timeline for Henderson reno', owner: 'David Kim', dueDate: 'Mar 20', completed: false },
  { id: 'ai5', description: 'Prepare design mockups for customer portal', owner: 'Lisa Park', dueDate: 'Mar 22', completed: true },
];

const initialHeadlines: Headline[] = [
  { id: 'h1', text: 'Won the Riverside commercial project - $180K contract', author: 'Sarah Chen', time: '9:22 AM' },
  { id: 'h2', text: 'New safety certification achieved for all crews', author: 'Mike Torres', time: '9:23 AM' },
  { id: 'h3', text: 'QuickBooks integration now live and syncing daily', author: 'Joseph', time: '9:24 AM' },
];

const initialIssues: Issue[] = [
  { id: 'i1', title: 'Material costs increasing 12% - need pricing strategy', raisedBy: 'David Kim', priority: 'High', votes: 5, status: 'open' },
  { id: 'i2', title: 'Two PM candidates declined offers - compensation gap', raisedBy: 'Mike Torres', priority: 'High', votes: 4, status: 'open' },
  { id: 'i3', title: 'Customer complaints about response time on weekends', raisedBy: 'Sarah Chen', priority: 'Medium', votes: 3, status: 'open' },
  { id: 'i4', title: 'Design tool licenses expiring next month', raisedBy: 'Lisa Park', priority: 'Low', votes: 1, status: 'open' },
  { id: 'i5', title: 'Subcontractor availability for Q2 projects', raisedBy: 'Mike Torres', priority: 'Medium', votes: 2, status: 'open' },
];

// ---------------------------------------------------------------------------
// AI Notes simulation data
// ---------------------------------------------------------------------------

const sectionNotes: Record<string, string[]> = {
  checkin: [
    'All attendees shared personal and professional updates.',
    'Joseph: Excited about the new AI estimating beta results.',
    'Mike: Crew morale is high after the safety certification.',
    'Sarah: Closed the Riverside deal last Friday.',
  ],
  scorecard: [
    'Revenue tracking above target at $295K vs $280K goal.',
    'New leads slightly below target (38 vs 40) - marketing campaign delayed.',
    'Close rate significantly improved to 42% (target 35%).',
    'Active projects below target - need to accelerate pipeline.',
  ],
  rocks: [
    'AI estimating launch on track - beta testing with 3 clients.',
    'PM hiring off track - two candidates declined. Action: revisit compensation packages.',
    'Customer portal v2 on track for Q1 delivery.',
    'Material waste reduction at risk - need supplier meeting.',
  ],
  actions: [
    'Reviewing action items from last week...',
    '3 of 5 items completed on time.',
    '2 items to carry forward to next week.',
  ],
  headlines: [
    'Team sharing this week\'s highlights and announcements.',
  ],
  ids: [
    'Identifying, discussing, and solving key issues...',
  ],
  conclude: [
    'Meeting summary and ratings.',
  ],
};

// ---------------------------------------------------------------------------
// Priority config
// ---------------------------------------------------------------------------

const priorityConfig = {
  High: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
  Low: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
};

const rockStatusConfig = {
  'On Track': { bg: 'bg-green-500/15', text: 'text-green-400', ring: 'ring-green-500/20' },
  'Off Track': { bg: 'bg-red-500/15', text: 'text-red-400', ring: 'ring-red-500/20' },
  'At Risk': { bg: 'bg-amber-500/15', text: 'text-amber-400', ring: 'ring-amber-500/20' },
};

// ---------------------------------------------------------------------------
// Timer hook
// ---------------------------------------------------------------------------

function useTimer(initialSeconds: number, isActive: boolean) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!isActive || paused) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, paused]);

  const reset = useCallback((newSeconds: number) => {
    setSeconds(newSeconds);
    setPaused(false);
  }, []);

  return { seconds, paused, setPaused, reset };
}

// ---------------------------------------------------------------------------
// Circular Timer Component
// ---------------------------------------------------------------------------

function CircularTimer({
  seconds,
  totalSeconds,
}: {
  seconds: number;
  totalSeconds: number;
}) {
  const progress = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference * (1 - progress);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const isLow = seconds > 0 && seconds <= 60;
  const isOvertime = seconds === 0;

  let strokeColor = 'stroke-indigo-400';
  if (isOvertime) strokeColor = 'stroke-red-400';
  else if (isLow) strokeColor = 'stroke-amber-400';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          className={cn('transition-all duration-1000', strokeColor)}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span
        className={cn(
          'absolute font-mono text-sm font-bold tabular-nums',
          isOvertime ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-foreground'
        )}
      >
        {minutes}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section content components
// ---------------------------------------------------------------------------

function CheckInContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Each team member shares one personal and one professional best from the past week.
      </p>
      <div className="glass rounded-lg p-4">
        <textarea
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none min-h-[120px]"
          placeholder="Capture check-in notes here..."
          defaultValue="Joseph: Family vacation to Lake Tahoe was great. Professionally, excited about the AI estimating beta results - 3 clients testing now.&#10;&#10;Mike: Son's baseball team won their first game. Crew morale is high after the safety certification achievement.&#10;&#10;Sarah: Closed the Riverside commercial deal on Friday - $180K contract."
        />
      </div>
    </div>
  );
}

function ScorecardContent() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Review weekly KPIs against targets. Focus on off-track metrics.
      </p>
      <div className="glass overflow-hidden rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Metric
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Target
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actual
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi) => (
              <tr key={kpi.name} className="border-b border-border/50">
                <td className="px-4 py-2.5 font-medium text-foreground">
                  {kpi.name}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">
                  {kpi.target}
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-foreground">
                  {kpi.actual}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {kpi.onTrack ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-green-400 ring-1 ring-green-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      On Track
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-red-500/20">
                      <AlertTriangle className="h-3 w-3" />
                      Off Track
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RockReviewContent({ rocks }: { rocks: Rock[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Review quarterly rocks. Update status and discuss any blockers.
      </p>
      <div className="space-y-2">
        {rocks.map((rock) => {
          const cfg = rockStatusConfig[rock.status];
          return (
            <div
              key={rock.id}
              className="glass glass-hover flex items-center justify-between gap-3 rounded-lg p-4 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{rock.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{rock.owner}</p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1',
                  cfg.bg,
                  cfg.text,
                  cfg.ring
                )}
              >
                {rock.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionItemContent({
  items,
  onToggle,
}: {
  items: ActionItem[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Review action items from last week. Mark completed or carry forward.
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'glass flex items-start gap-3 rounded-lg p-4 transition-all',
              item.completed && 'opacity-60'
            )}
          >
            <button
              onClick={() => onToggle(item.id)}
              className={cn(
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all',
                item.completed
                  ? 'border-green-400 bg-green-400/20 text-green-400'
                  : 'border-border hover:border-primary'
              )}
            >
              {item.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm text-foreground',
                  item.completed && 'line-through text-muted-foreground'
                )}
              >
                {item.description}
              </p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{item.owner}</span>
                <span className="text-border">|</span>
                <span>Due: {item.dueDate}</span>
              </div>
            </div>
            {!item.completed && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 h-7 rounded-md px-2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Carry Forward
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function HeadlinesContent({
  headlines,
  onAdd,
}: {
  headlines: Headline[];
  onAdd: (text: string) => void;
}) {
  const [newHeadline, setNewHeadline] = useState('');

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Share good news, updates, and announcements with the team.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Add a headline..."
          value={newHeadline}
          onChange={(e) => setNewHeadline(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newHeadline.trim()) {
              onAdd(newHeadline.trim());
              setNewHeadline('');
            }
          }}
          className="h-9 rounded-lg border-border bg-muted/30 text-sm"
        />
        <Button
          size="sm"
          className="h-9 shrink-0 rounded-lg bg-primary px-3 text-xs text-primary-foreground"
          onClick={() => {
            if (newHeadline.trim()) {
              onAdd(newHeadline.trim());
              setNewHeadline('');
            }
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-2">
        {headlines.map((headline) => (
          <div key={headline.id} className="glass rounded-lg p-3">
            <p className="text-sm text-foreground">{headline.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {headline.author} &middot; {headline.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function IDSContent({
  issues,
  onVote,
  onStatusChange,
}: {
  issues: Issue[];
  onVote: (id: string) => void;
  onStatusChange: (id: string, status: Issue['status']) => void;
}) {
  const [newIssue, setNewIssue] = useState('');
  const sortedIssues = [...issues].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Identify, Discuss, Solve. Vote to prioritize issues, then work through them one at a time.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Add an issue..."
          value={newIssue}
          onChange={(e) => setNewIssue(e.target.value)}
          className="h-9 rounded-lg border-border bg-muted/30 text-sm"
        />
        <Button
          size="sm"
          className="h-9 shrink-0 rounded-lg bg-primary px-3 text-xs text-primary-foreground"
          onClick={() => setNewIssue('')}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <div className="space-y-2">
        {sortedIssues.map((issue) => {
          const pCfg = priorityConfig[issue.priority];
          return (
            <div
              key={issue.id}
              className={cn(
                'glass rounded-lg p-4 transition-all',
                issue.status === 'discussing' &&
                  'ring-2 ring-indigo-400/30 bg-indigo-500/5',
                issue.status === 'resolved' && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onVote(issue.id)}
                  className="mt-0.5 flex shrink-0 flex-col items-center gap-0.5 rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold tabular-nums">
                    {issue.votes}
                  </span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'text-sm font-medium text-foreground',
                        issue.status === 'resolved' && 'line-through'
                      )}
                    >
                      {issue.title}
                    </p>
                    <span
                      className={cn(
                        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                        pCfg.bg,
                        pCfg.text,
                        pCfg.border
                      )}
                    >
                      {issue.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Raised by {issue.raisedBy}
                  </p>
                  {issue.status === 'discussing' && (
                    <div className="mt-3 rounded-md border border-border/50 bg-muted/20 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Discussion Notes
                      </p>
                      <textarea
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none min-h-[60px]"
                        placeholder="Capture discussion points..."
                      />
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {issue.status === 'open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 rounded-md px-2 text-[10px] text-primary hover:bg-primary/10"
                      onClick={() => onStatusChange(issue.id, 'discussing')}
                    >
                      <MessageSquare className="h-3 w-3" />
                      Discuss
                    </Button>
                  )}
                  {issue.status === 'discussing' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 rounded-md px-2 text-[10px] text-green-400 hover:bg-green-500/10"
                      onClick={() => onStatusChange(issue.id, 'resolved')}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConcludeContent({
  attendees,
  onRate,
}: {
  attendees: Attendee[];
  onRate: (id: string, rating: number) => void;
}) {
  const completedItems = initialActionItems.filter((a) => a.completed).length;
  const totalItems = initialActionItems.length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Wrap up the meeting. Rate the session and review the summary.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">{completedItems}/{totalItems}</p>
          <p className="text-[10px] text-muted-foreground">Actions Complete</p>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground">Issues Resolved</p>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-foreground">2</p>
          <p className="text-[10px] text-muted-foreground">New Action Items</p>
        </div>
      </div>

      {/* Rating */}
      <div className="glass rounded-lg p-4">
        <p className="text-sm font-medium text-foreground mb-3">Rate this meeting (1-10)</p>
        <div className="space-y-3">
          {attendees
            .filter((a) => a.presence !== 'absent')
            .map((attendee) => (
              <div key={attendee.id} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                  {attendee.avatar}
                </div>
                <span className="text-sm text-foreground w-24 truncate">
                  {attendee.name}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => onRate(attendee.id, n)}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-all',
                        attendee.rating === n
                          ? 'bg-indigo-500 text-white'
                          : attendee.rating && n <= attendee.rating
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* End meeting button */}
      <Link href="/bos/meetings/mtg-001/recap">
        <Button className="w-full h-10 rounded-lg bg-red-500/80 text-sm font-semibold text-white hover:bg-red-500">
          End Meeting & Generate Recap
        </Button>
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function ActiveMeetingPage() {
  const [sections, setSections] = useState(initialSections);
  const [actionItems, setActionItems] = useState(initialActionItems);
  const [headlines, setHeadlines] = useState(initialHeadlines);
  const [issues, setIssues] = useState(initialIssues);
  const [meetingAttendees, setMeetingAttendees] = useState(attendees);
  const [typingNotes, setTypingNotes] = useState<string[]>([]);
  const [showAiTyping, setShowAiTyping] = useState(true);

  const activeSectionIndex = sections.findIndex((s) => s.status === 'active');
  const activeSection = sections[activeSectionIndex];
  const totalMinutesElapsed = sections
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + s.minutes, 0);
  const totalMinutes = sections.reduce((acc, s) => acc + s.minutes, 0);

  const { seconds, paused, setPaused, reset } = useTimer(
    activeSection ? activeSection.minutes * 60 - 120 : 0,
    !!activeSection
  );

  // Simulate AI typing notes
  useEffect(() => {
    if (!activeSection) return;
    const notes = sectionNotes[activeSection.id] || [];
    setTypingNotes([]);

    const timeouts: NodeJS.Timeout[] = [];
    notes.forEach((note, i) => {
      const timeout = setTimeout(() => {
        setTypingNotes((prev) => [...prev, note]);
      }, (i + 1) * 2500);
      timeouts.push(timeout);
    });

    const hideTyping = setTimeout(() => {
      setShowAiTyping(false);
      setTimeout(() => setShowAiTyping(true), 500);
    }, (notes.length + 1) * 2500);
    timeouts.push(hideTyping);

    return () => timeouts.forEach(clearTimeout);
  }, [activeSection?.id]);

  // Navigation
  const goToSection = (index: number) => {
    setSections((prev) =>
      prev.map((s, i) => ({
        ...s,
        status: i < index ? 'completed' : i === index ? 'active' : 'upcoming',
      }))
    );
    reset(sections[index].minutes * 60);
  };

  const nextSection = () => {
    if (activeSectionIndex < sections.length - 1) {
      goToSection(activeSectionIndex + 1);
    }
  };

  const prevSection = () => {
    if (activeSectionIndex > 0) {
      goToSection(activeSectionIndex - 1);
    }
  };

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addHeadline = (text: string) => {
    setHeadlines((prev) => [
      ...prev,
      {
        id: `h${prev.length + 1}`,
        text,
        author: 'Joseph',
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const voteIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id ? { ...issue, votes: issue.votes + 1 } : issue
      )
    );
  };

  const changeIssueStatus = (id: string, status: Issue['status']) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status } : issue))
    );
  };

  const rateAttendee = (id: string, rating: number) => {
    setMeetingAttendees((prev) =>
      prev.map((a) => (a.id === id ? { ...a, rating } : a))
    );
  };

  const isLowTime = seconds > 0 && seconds <= 60;
  const isOvertime = seconds === 0 && activeSection?.status === 'active';

  return (
    <div className="flex h-full flex-col bg-background bg-mesh">
      {/* Top header bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link
            href="/bos/meetings"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Meetings
          </Link>
          <span className="text-border">/</span>
          <h1 className="text-sm font-semibold text-foreground">
            Leadership Team Weekly Sync
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-400/20 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Meeting in Progress
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Started 9:00 AM &middot; {totalMinutesElapsed} min elapsed</span>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="flex w-64 shrink-0 flex-col border-r border-border overflow-y-auto">
          {/* Meeting info */}
          <div className="border-b border-border p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Team
              </p>
              <p className="text-sm font-medium text-foreground">Leadership Team</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Facilitator
              </p>
              <p className="text-sm font-medium text-foreground">Joseph</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Date
              </p>
              <p className="text-sm font-medium text-foreground">Mar 20, 2026</p>
            </div>
          </div>

          {/* Attendees */}
          <div className="border-b border-border p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Attendees ({attendees.filter((a) => a.presence !== 'absent').length}/{attendees.length})
            </p>
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      {attendee.avatar}
                    </div>
                    {attendee.presence !== 'absent' && (
                      <span
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background',
                          attendee.presence === 'active'
                            ? 'bg-emerald-400 animate-pulse'
                            : 'bg-gray-400'
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-xs font-medium truncate',
                        attendee.presence === 'absent'
                          ? 'text-muted-foreground/50'
                          : 'text-foreground'
                      )}
                    >
                      {attendee.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{attendee.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section navigation */}
          <div className="flex-1 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Agenda
            </p>
            <div className="space-y-1">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(index)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all',
                    section.status === 'active' &&
                      'border-l-2 border-l-indigo-400 bg-indigo-500/5 text-foreground font-medium',
                    section.status === 'completed' &&
                      'text-muted-foreground hover:bg-muted/30',
                    section.status === 'upcoming' &&
                      'text-muted-foreground/60 hover:bg-muted/20 hover:text-muted-foreground',
                    section.status === 'active' && isLowTime &&
                      'border-l-amber-400 bg-amber-500/5',
                    section.status === 'active' && isOvertime &&
                      'border-l-red-400 bg-red-500/5'
                  )}
                >
                  {section.status === 'completed' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-400" />
                  ) : section.status === 'active' ? (
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full animate-pulse',
                        isOvertime
                          ? 'bg-red-400'
                          : isLowTime
                          ? 'bg-amber-400'
                          : 'bg-indigo-400'
                      )}
                    />
                  ) : (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-muted-foreground/30" />
                  )}
                  <span className="flex-1 truncate">{section.name}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {section.minutes}m
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Section header */}
          {activeSection && (
            <div
              className={cn(
                'border-b border-border px-6 py-4 transition-colors',
                isOvertime && 'bg-red-500/5',
                isLowTime && !isOvertime && 'bg-amber-500/5'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-foreground">
                      {activeSection.name}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      Section {activeSectionIndex + 1} of {sections.length}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 w-48 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-1000',
                          isOvertime
                            ? 'bg-red-400'
                            : isLowTime
                            ? 'bg-amber-400'
                            : 'bg-indigo-400'
                        )}
                        style={{
                          width: `${Math.min(
                            100,
                            ((activeSection.minutes * 60 - seconds) /
                              (activeSection.minutes * 60)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {Math.floor((activeSection.minutes * 60 - seconds) / 60)}m /{' '}
                      {activeSection.minutes}m
                    </span>
                  </div>
                </div>
                <CircularTimer
                  seconds={seconds}
                  totalSeconds={activeSection.minutes * 60}
                />
              </div>
            </div>
          )}

          {/* Section content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeSection?.id === 'checkin' && <CheckInContent />}
            {activeSection?.id === 'scorecard' && <ScorecardContent />}
            {activeSection?.id === 'rocks' && (
              <RockReviewContent rocks={initialRocks} />
            )}
            {activeSection?.id === 'actions' && (
              <ActionItemContent
                items={actionItems}
                onToggle={toggleActionItem}
              />
            )}
            {activeSection?.id === 'headlines' && (
              <HeadlinesContent headlines={headlines} onAdd={addHeadline} />
            )}
            {activeSection?.id === 'ids' && (
              <IDSContent
                issues={issues}
                onVote={voteIssue}
                onStatusChange={changeIssueStatus}
              />
            )}
            {activeSection?.id === 'conclude' && (
              <ConcludeContent
                attendees={meetingAttendees}
                onRate={rateAttendee}
              />
            )}
          </div>

          {/* Bottom control bar */}
          <div
            className={cn(
              'border-t border-border px-6 py-3 flex items-center justify-between',
              isOvertime && 'border-t-red-500/30',
              isLowTime && !isOvertime && 'border-t-amber-500/30'
            )}
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={prevSection}
                disabled={activeSectionIndex <= 0}
              >
                <SkipBack className="h-3.5 w-3.5" />
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs"
                onClick={() => setPaused(!paused)}
              >
                {paused ? (
                  <>
                    <Play className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-green-400">Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-amber-400">Pause</span>
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={nextSection}
                disabled={activeSectionIndex >= sections.length - 1}
              >
                Next
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Section dots */}
            <div className="flex items-center gap-1.5">
              {sections.map((section, i) => (
                <button
                  key={section.id}
                  onClick={() => goToSection(i)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    section.status === 'active'
                      ? isOvertime
                        ? 'bg-red-400 w-4'
                        : isLowTime
                        ? 'bg-amber-400 w-4'
                        : 'bg-indigo-400 w-4'
                      : section.status === 'completed'
                      ? 'bg-green-400/60'
                      : 'bg-muted-foreground/20'
                  )}
                  title={section.name}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'font-mono text-lg font-bold tabular-nums',
                  isOvertime
                    ? 'text-red-400'
                    : isLowTime
                    ? 'text-amber-400'
                    : 'text-foreground'
                )}
              >
                {Math.floor(seconds / 60)}:
                {(seconds % 60).toString().padStart(2, '0')}
              </span>
              <Link href="/bos/meetings/mtg-001/recap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 rounded-lg px-3 text-xs text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                  End
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right sidebar - Notes */}
        <div className="flex w-80 shrink-0 flex-col border-l border-border overflow-hidden">
          {/* Notes header */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Meeting Notes</h3>
              <span className="text-[10px] text-muted-foreground">
                {activeSection?.name}
              </span>
            </div>
            {showAiTyping && (
              <div className="mt-2 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                <span className="text-[10px] text-indigo-400 animate-pulse">
                  AI is taking notes...
                </span>
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            )}
          </div>

          {/* Notes content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Previously completed sections notes */}
            {sections
              .filter((s) => s.status === 'completed')
              .map((section) => (
                <div key={section.id} className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {section.name}
                  </p>
                  {(sectionNotes[section.id] || []).map((note, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                      {note}
                    </p>
                  ))}
                  <div className="my-2 border-t border-border/30" />
                </div>
              ))}

            {/* Current section notes (typed in) */}
            {activeSection && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                  {activeSection.name} (Current)
                </p>
                {typingNotes.map((note, i) => (
                  <p
                    key={i}
                    className="text-xs text-foreground/80 leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-300"
                  >
                    {note}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Manual notes area */}
          <div className="border-t border-border p-4">
            <textarea
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none min-h-[60px]"
              placeholder="Add your own notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
