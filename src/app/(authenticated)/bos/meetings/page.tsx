'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Trash2,
  Pencil,
  X,
  Check,
  Eye,
  ListChecks,
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
import { toast } from 'sonner';

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
  sections: { name: string; minutes: number }[];
  totalMinutes: number;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const initialMeetings: Meeting[] = [
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
    sections: [
      { name: 'Segue / Check-in', minutes: 5 },
      { name: 'Scorecard Review', minutes: 5 },
      { name: 'Rock Review', minutes: 5 },
      { name: 'To-Do Review', minutes: 5 },
      { name: 'Headlines', minutes: 5 },
      { name: 'IDS - Identify, Discuss, Solve', minutes: 60 },
      { name: 'Conclude', minutes: 5 },
    ],
    totalMinutes: 90,
  },
  {
    id: 'tmpl-002',
    name: 'Quick Standup',
    description: 'Fast daily standup: What did you do, what will you do, any blockers.',
    sections: [
      { name: 'Yesterday', minutes: 5 },
      { name: 'Today', minutes: 5 },
      { name: 'Blockers', minutes: 5 },
    ],
    totalMinutes: 15,
  },
  {
    id: 'tmpl-003',
    name: 'Quarterly Planning',
    description: 'Quarterly rock-setting session with vision review, SWOT, and rock selection.',
    sections: [
      { name: 'Vision Review', minutes: 15 },
      { name: 'SWOT Analysis', minutes: 20 },
      { name: 'Rock Brainstorming', minutes: 30 },
      { name: 'Rock Selection & Assignment', minutes: 40 },
      { name: 'Wrap-up', minutes: 15 },
    ],
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
    text: 'text-muted-foreground',
    ring: 'ring-gray-400/20',
  },
};

// ---------------------------------------------------------------------------
// Meeting Card
// ---------------------------------------------------------------------------

function MeetingCard({
  meeting,
  onDelete,
  onEdit,
}: {
  meeting: Meeting;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string) => void;
}) {
  const status = statusConfig[meeting.status];
  const isUpcoming = meeting.status === 'Scheduled' || meeting.status === 'In Progress';
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(meeting.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  return (
    <div className="glass glass-hover rounded-xl p-5 transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {editing ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 rounded-md border-border bg-muted/30 text-sm font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onEdit(meeting.id, editName);
                      setEditing(false);
                      toast.success('Meeting renamed');
                    }
                    if (e.key === 'Escape') {
                      setEditName(meeting.name);
                      setEditing(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    onEdit(meeting.id, editName);
                    setEditing(false);
                    toast.success('Meeting renamed');
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-green-400 hover:bg-green-500/10 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditName(meeting.name);
                    setEditing(false);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
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

        <div className="shrink-0 flex items-center gap-1.5">
          {/* Edit / Delete - shown on hover */}
          {!editing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(true);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2 duration-200">
                  <span className="text-[10px] text-red-400 mr-1">Delete?</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(meeting.id);
                      toast.success('Meeting deleted');
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(false);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

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
            <Button
              size="sm"
              className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
              onClick={() => {
                toast.success(`Joined "${meeting.name}"`);
                router.push(`/bos/meetings/${meeting.id}`);
              }}
            >
              <Video className="h-3.5 w-3.5" />
              Join
            </Button>
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
// Template Card with Preview Modal
// ---------------------------------------------------------------------------

function TemplateCard({
  template,
  onUseTemplate,
}: {
  template: MeetingTemplate;
  onUseTemplate: (template: MeetingTemplate) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div
        className="glass glass-hover rounded-xl p-5 transition-all duration-300 cursor-pointer"
        onClick={() => setPreviewOpen(true)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
              <Eye className="h-3.5 w-3.5 text-muted-foreground/40" />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
            <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{template.sections.length} sections</span>
              <span className="text-border">|</span>
              <span>{template.totalMinutes} min</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 shrink-0 rounded-lg px-2.5 text-xs font-medium text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(template);
            }}
          >
            <Copy className="h-3.5 w-3.5" />
            Use
          </Button>
        </div>
      </div>

      {/* Template Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{template.name}</DialogTitle>
            <DialogDescription>{template.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Agenda Structure
            </p>
            {template.sections.map((section, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{section.name}</span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {section.minutes} min
                </span>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-sm font-bold text-primary tabular-nums">
                {template.totalMinutes} min
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="rounded-lg bg-primary text-primary-foreground"
              onClick={() => {
                onUseTemplate(template);
                setPreviewOpen(false);
              }}
            >
              <ListChecks className="h-3.5 w-3.5 mr-1.5" />
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MeetingsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'templates'>('upcoming');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [meetings, setMeetings] = useState(initialMeetings);

  // Schedule form state
  const [newMeetingName, setNewMeetingName] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('2026-03-27');
  const [newMeetingTime, setNewMeetingTime] = useState('09:00');
  const [newMeetingTeam, setNewMeetingTeam] = useState('');
  const [selectedTemplateName, setSelectedTemplateName] = useState('Level 10 Meeting');
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);

  const upcomingMeetings = meetings.filter(
    (m) => m.status === 'Scheduled' || m.status === 'In Progress'
  );
  const pastMeetings = meetings.filter(
    (m) => m.status === 'Completed' || m.status === 'Cancelled'
  );

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const editMeetingName = (id: string, name: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m))
    );
  };

  const scheduleMeeting = () => {
    if (!newMeetingName.trim()) {
      toast.error('Meeting name is required');
      return;
    }
    if (!newMeetingTeam.trim()) {
      toast.error('Team is required');
      return;
    }

    const dateObj = new Date(newMeetingDate + 'T' + newMeetingTime);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`,
      name: newMeetingName.trim(),
      date: formattedDate,
      time: formattedTime,
      duration: '90 min',
      team: newMeetingTeam.trim(),
      memberCount: 5,
      status: 'Scheduled',
      facilitator: 'Joseph',
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setScheduleOpen(false);
    setNewMeetingName('');
    setNewMeetingTeam('');
    setActiveTab('upcoming');
    toast.success(`"${newMeeting.name}" scheduled for ${formattedDate}`);
  };

  const useTemplate = (template: MeetingTemplate) => {
    setSelectedTemplateName(template.name);
    setNewMeetingName(template.name === 'Level 10 Meeting' ? '' : template.name);
    setScheduleOpen(true);
    toast.info(`Template "${template.name}" selected`);
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                    value={newMeetingName}
                    onChange={(e) => setNewMeetingName(e.target.value)}
                    className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Date</label>
                    <Input
                      type="date"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Time</label>
                    <Input
                      type="time"
                      value={newMeetingTime}
                      onChange={(e) => setNewMeetingTime(e.target.value)}
                      className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Team</label>
                  <Input
                    placeholder="e.g., Leadership Team"
                    value={newMeetingTeam}
                    onChange={(e) => setNewMeetingTeam(e.target.value)}
                    className="h-9 rounded-lg border-border bg-muted/30 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Template</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      {selectedTemplateName}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                      onClick={() => setTemplatePickerOpen(!templatePickerOpen)}
                    >
                      Change
                    </Button>
                  </div>
                  {templatePickerOpen && (
                    <div className="space-y-1 rounded-lg border border-border bg-muted/10 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {meetingTemplates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTemplateName(t.name);
                            setTemplatePickerOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            selectedTemplateName === t.name
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted/30'
                          }`}
                        >
                          <span>{t.name}</span>
                          <span className="text-xs text-muted-foreground">{t.totalMinutes} min</span>
                        </button>
                      ))}
                    </div>
                  )}
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
                  onClick={scheduleMeeting}
                >
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto rounded-lg bg-muted/50 p-1 w-fit max-w-full">
          <div className="inline-flex items-center gap-1 whitespace-nowrap">
          {(['upcoming', 'past', 'templates'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
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
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onDelete={deleteMeeting}
                  onEdit={editMeetingName}
                />
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
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onDelete={deleteMeeting}
                  onEdit={editMeetingName}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-3">
            {meetingTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onUseTemplate={useTemplate}
              />
            ))}
            <button className="glass glass-hover flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
              <Plus className="h-4 w-4" />
              Create Custom Template
            </button>
          </div>
        )}

        {/* Quick link to active meeting if one is in progress */}
        {activeTab !== 'upcoming' &&
          meetings.some((m) => m.status === 'In Progress') && (
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
