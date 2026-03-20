'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Users,
  Star,
  Plus,
  Video,
  FileText,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MeetingStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

interface Meeting {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: string;
  team: string;
  memberCount: number;
  status: MeetingStatus;
  avgRating?: number;
  facilitator: string;
}

interface MeetingTemplate {
  id: string;
  name: string;
  description: string;
  sections: number;
  totalMinutes: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const mockMeetings: Meeting[] = [
  {
    id: 'mtg-001',
    name: 'Leadership Team Weekly Sync',
    date: 'Mar 20, 2026',
    time: '9:00 AM',
    duration: '90 min',
    team: 'Leadership Team',
    memberCount: 6,
    status: 'In Progress',
    facilitator: 'Joseph',
  },
  {
    id: 'mtg-002',
    name: 'Operations Weekly Level 10',
    date: 'Mar 20, 2026',
    time: '2:00 PM',
    duration: '90 min',
    team: 'Operations',
    memberCount: 5,
    status: 'Scheduled',
    facilitator: 'Mike Torres',
  },
  {
    id: 'mtg-003',
    name: 'Sales Team Weekly Sync',
    date: 'Mar 21, 2026',
    time: '10:00 AM',
    duration: '90 min',
    team: 'Sales',
    memberCount: 4,
    status: 'Scheduled',
    facilitator: 'Sarah Chen',
  },
  {
    id: 'mtg-004',
    name: 'Leadership Team Weekly Sync',
    date: 'Mar 13, 2026',
    time: '9:00 AM',
    duration: '90 min',
    team: 'Leadership Team',
    memberCount: 6,
    status: 'Completed',
    avgRating: 8.2,
    facilitator: 'Joseph',
  },
  {
    id: 'mtg-005',
    name: 'Operations Weekly Level 10',
    date: 'Mar 13, 2026',
    time: '2:00 PM',
    duration: '90 min',
    team: 'Operations',
    memberCount: 5,
    status: 'Completed',
    avgRating: 7.8,
    facilitator: 'Mike Torres',
  },
  {
    id: 'mtg-006',
    name: 'Design Review Sync',
    date: 'Mar 12, 2026',
    time: '11:00 AM',
    duration: '60 min',
    team: 'Design',
    memberCount: 3,
    status: 'Cancelled',
    facilitator: 'Lisa Park',
  },
];

const meetingTemplates: MeetingTemplate[] = [
  {
    id: 'tmpl-001',
    name: 'Level 10 Meeting',
    description: 'Standard EOS Level 10 format with 7 sections: Check-in, Scorecard, Rock Review, Action Items, Headlines, IDS, Conclude.',
    sections: 7,
    totalMinutes: 90,
  },
  {
    id: 'tmpl-002',
    name: 'Quick Standup',
    description: 'Fast daily standup: What did you do, what will you do, any blockers.',
    sections: 3,
    totalMinutes: 15,
  },
  {
    id: 'tmpl-003',
    name: 'Quarterly Planning',
    description: 'Quarterly rock-setting session with vision review, SWOT, and rock selection.',
    sections: 5,
    totalMinutes: 120,
  },
];

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const statusConfig: Record<
  MeetingStatus,
  { bg: string; text: string; ring: string; pulse?: boolean }
> = {
  Scheduled: {
    bg: 'bg-blue-400/10',
    text: 'text-blue-400',
    ring: 'ring-blue-400/20',
  },
  'In Progress': {
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    ring: 'ring-amber-400/20',
    pulse: true,
  },
  Completed: {
    bg: 'bg-green-400/10',
    text: 'text-green-400',
    ring: 'ring-green-400/20',
  },
  Cancelled: {
    bg: 'bg-gray-400/10',
    text: 'text-gray-400',
    ring: 'ring-gray-400/20',
  },
};

// ---------------------------------------------------------------------------
// Meeting Card
// ---------------------------------------------------------------------------

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const status = statusConfig[meeting.status];
  const isUpcoming = meeting.status === 'Scheduled' || meeting.status === 'In Progress';

  return (
    <div className="glass glass-hover rounded-xl p-5 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {meeting.name}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${status.bg} ${status.text} ${status.ring}`}
            >
              {status.pulse && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              {meeting.status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {meeting.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {meeting.time} &middot; {meeting.duration}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {meeting.team} &middot; {meeting.memberCount} members
            </span>
          </div>

          {meeting.avgRating !== undefined && (
            <div className="mt-2.5 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium text-amber-400">
                {meeting.avgRating}/10
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {meeting.status === 'In Progress' ? (
            <Link href={`/bos/meetings/${meeting.id}`}>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600"
              >
                <Video className="h-3.5 w-3.5" />
                Join
              </Button>
            </Link>
          ) : isUpcoming ? (
            <Link href={`/bos/meetings/${meeting.id}`}>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
              >
                <Video className="h-3.5 w-3.5" />
                Join
              </Button>
            </Link>
          ) : meeting.status === 'Completed' ? (
            <Link href={`/bos/meetings/${meeting.id}/recap`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-primary hover:bg-primary/10"
              >
                <FileText className="h-3.5 w-3.5" />
                View Recap
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Template Card
// ---------------------------------------------------------------------------

function TemplateCard({ template }: { template: MeetingTemplate }) {
  return (
    <div className="glass glass-hover rounded-xl p-5 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
            {template.description}
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{template.sections} sections</span>
            <span className="text-border">|</span>
            <span>{template.totalMinutes} min</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 shrink-0 rounded-lg px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <Copy className="h-3.5 w-3.5" />
          Use
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'templates'>('upcoming');
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const upcomingMeetings = mockMeetings.filter(
    (m) => m.status === 'Scheduled' || m.status === 'In Progress'
  );
  const pastMeetings = mockMeetings.filter(
    (m) => m.status === 'Completed' || m.status === 'Cancelled'
  );

  return (
    <div className="min-h-screen bg-background bg-mesh">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Meeting Hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Schedule, run, and review your weekly syncs
            </p>
          </div>
          <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <DialogTrigger
              render={
                <Button className="h-9 gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" />
              }
            >
              <Plus className="h-4 w-4" />
              Schedule Meeting
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule Meeting</DialogTitle>
                <DialogDescription>
                  Set up a new recurring or one-time meeting for your team.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Meeting Name
                  </label>
                  <Input
                    placeholder="e.g., Leadership Team Weekly Sync"
                    className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Date</label>
                    <Input
                      type="date"
                      defaultValue="2026-03-27"
                      className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Time</label>
                    <Input
                      type="time"
                      defaultValue="09:00"
                      className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Team</label>
                  <Input
                    placeholder="e.g., Leadership Team"
                    className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Template</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      Level 10 Meeting
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setScheduleOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-primary text-primary-foreground"
                  onClick={() => setScheduleOpen(false)}
                >
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
          {(['upcoming', 'past', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'upcoming' && `Upcoming (${upcomingMeetings.length})`}
              {tab === 'past' && `Past (${pastMeetings.length})`}
              {tab === 'templates' && 'Templates'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'upcoming' && (
          <div className="space-y-3">
            {upcomingMeetings.length === 0 ? (
              <div className="glass rounded-xl py-12 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No upcoming meetings scheduled
                </p>
              </div>
            ) : (
              upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-3">
            {pastMeetings.length === 0 ? (
              <div className="glass rounded-xl py-12 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No past meetings yet
                </p>
              </div>
            ) : (
              pastMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-3">
            {meetingTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
            <button className="glass glass-hover flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
              <Plus className="h-4 w-4" />
              Create Custom Template
            </button>
          </div>
        )}

        {/* Quick link to active meeting if one is in progress */}
        {activeTab !== 'upcoming' &&
          mockMeetings.some((m) => m.status === 'In Progress') && (
            <Link href="/bos/meetings/mtg-001">
              <div className="glass flex items-center justify-between rounded-xl border-l-2 border-l-amber-400 p-4 transition-all hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    Leadership Team Weekly Sync is in progress
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          )}
      </div>
    </div>
  );
}
