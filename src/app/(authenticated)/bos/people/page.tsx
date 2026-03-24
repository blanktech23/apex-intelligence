'use client';

import { useState } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Mail,
  MessageSquare,
  User,
  Filter,
  ChevronDown,
  X,
  Send,
  Phone,
  MapPin,
  Star,
  Activity,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PersonStatus = 'Active' | 'On Leave' | 'Inactive';
type CoreValuesRating = 'positive' | 'neutral' | 'negative';

interface Person {
  id: string;
  name: string;
  initials: string;
  role: string;
  team: string;
  email: string;
  phone: string;
  location: string;
  seat: string;
  status: PersonStatus;
  coreValuesFit: CoreValuesRating;
  recentActivity: string[];
}

// ---------------------------------------------------------------------------
// Mock Data — Construction company people
// ---------------------------------------------------------------------------

const people: Person[] = [
  {
    id: 'p-001',
    name: 'Joseph Wells',
    initials: 'JW',
    role: 'Strategic Leader / CEO',
    team: 'Leadership',
    email: 'joseph@kiptrabuilders.com',
    phone: '(555) 100-0001',
    location: 'HQ - Main Office',
    seat: 'Visionary',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Approved Q1 2026 budget allocations',
      'Led quarterly all-hands meeting',
      'Reviewed AI platform MVP progress',
    ],
  },
  {
    id: 'p-002',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'VP of Sales & Marketing',
    team: 'Sales',
    email: 'sarah@kiptrabuilders.com',
    phone: '(555) 100-0002',
    location: 'HQ - Main Office',
    seat: 'Sales/Marketing Lead',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Closed 3 new project contracts ($420K total)',
      'Launched referral incentive program',
      'Updated client communication templates',
    ],
  },
  {
    id: 'p-003',
    name: 'Mike Torres',
    initials: 'MT',
    role: 'VP of Operations',
    team: 'Operations',
    email: 'mike@kiptrabuilders.com',
    phone: '(555) 100-0003',
    location: 'HQ - Main Office',
    seat: 'Operations Lead',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Completed safety protocol handbook update',
      'Hired new site superintendent',
      'Resolved scheduling conflict on Elm St project',
    ],
  },
  {
    id: 'p-004',
    name: 'David Kim',
    initials: 'DK',
    role: 'Controller / Finance',
    team: 'Finance',
    email: 'david@kiptrabuilders.com',
    phone: '(555) 100-0004',
    location: 'HQ - Main Office',
    seat: 'Finance Lead',
    status: 'Active',
    coreValuesFit: 'neutral',
    recentActivity: [
      'Submitted Q4 2025 financial report',
      'Set up automated KPI dashboard',
      'Reviewed subcontractor payment terms',
    ],
  },
  {
    id: 'p-005',
    name: 'Lisa Park',
    initials: 'LP',
    role: 'HR / People Director',
    team: 'HR',
    email: 'lisa@kiptrabuilders.com',
    phone: '(555) 100-0005',
    location: 'HQ - Main Office',
    seat: 'People/HR Lead',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Onboarded 2 new field team members',
      'Updated employee handbook',
      'Scheduled Q1 performance reviews',
    ],
  },
  {
    id: 'p-006',
    name: 'Carlos Rivera',
    initials: 'CR',
    role: 'Integrator / COO',
    team: 'Leadership',
    email: 'carlos@kiptrabuilders.com',
    phone: '(555) 100-0006',
    location: 'HQ - Main Office',
    seat: 'Integrator',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Led weekly L10 meeting',
      'Resolved interdepartmental process bottleneck',
      'Reviewed quarterly rock progress',
    ],
  },
  {
    id: 'p-007',
    name: 'Ryan Nakamura',
    initials: 'RN',
    role: 'Lead Estimator',
    team: 'Sales',
    email: 'ryan@kiptrabuilders.com',
    phone: '(555) 100-0007',
    location: 'HQ - Main Office',
    seat: 'Estimating Lead',
    status: 'Active',
    coreValuesFit: 'neutral',
    recentActivity: [
      'Completed 5 project estimates this week',
      'Testing AI estimating tool v2.0 beta',
      'Updated material pricing database',
    ],
  },
  {
    id: 'p-008',
    name: 'Kim Lee',
    initials: 'KL',
    role: 'Project Manager',
    team: 'Operations',
    email: 'kim@kiptrabuilders.com',
    phone: '(555) 100-0008',
    location: 'Remote',
    seat: 'Project Manager',
    status: 'On Leave',
    coreValuesFit: 'positive',
    recentActivity: [
      'Handed off 2 active projects before leave',
      'Updated project handoff documentation',
      'Completed client walkthrough for Oak Ave project',
    ],
  },
  {
    id: 'p-009',
    name: 'Dan Parker',
    initials: 'DP',
    role: 'Site Superintendent',
    team: 'Operations',
    email: 'dan@kiptrabuilders.com',
    phone: '(555) 100-0009',
    location: 'Field',
    seat: 'Site Superintendent',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Passed OSHA site inspection with zero violations',
      'Coordinated electrical sub for Maple Dr project',
      'Submitted daily progress reports',
    ],
  },
  {
    id: 'p-010',
    name: 'Maria Gonzalez',
    initials: 'MG',
    role: 'AP/AR Specialist',
    team: 'Finance',
    email: 'maria@kiptrabuilders.com',
    phone: '(555) 100-0010',
    location: 'HQ - Main Office',
    seat: 'AP/AR Specialist',
    status: 'Active',
    coreValuesFit: 'positive',
    recentActivity: [
      'Processed 12 vendor invoices',
      'Collected $85K in outstanding receivables',
      'Updated billing templates',
    ],
  },
  {
    id: 'p-011',
    name: 'James Taylor',
    initials: 'JT',
    role: 'Payroll Administrator',
    team: 'Finance',
    email: 'james@kiptrabuilders.com',
    phone: '(555) 100-0011',
    location: 'HQ - Main Office',
    seat: 'Payroll Administrator',
    status: 'Active',
    coreValuesFit: 'negative',
    recentActivity: [
      'Processed bi-weekly payroll',
      'Updated tax withholding tables',
      'Meeting with HR re: core values alignment',
    ],
  },
  {
    id: 'p-012',
    name: 'Tom Bradley',
    initials: 'TB',
    role: 'IT / Systems Admin',
    team: 'Operations',
    email: 'tom@kiptrabuilders.com',
    phone: '(555) 100-0012',
    location: 'HQ - Main Office',
    seat: 'IT/Systems Admin',
    status: 'Inactive',
    coreValuesFit: 'neutral',
    recentActivity: [
      'Last active: Feb 15, 2026',
      'Completed network security audit',
      'Documented IT onboarding procedures',
    ],
  },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const statusConfig: Record<PersonStatus, { bg: string; text: string; ring: string }> = {
  Active: { bg: 'bg-green-400/10', text: 'text-green-600 dark:text-green-400', ring: 'ring-green-400/20' },
  'On Leave': { bg: 'bg-amber-400/10', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-400/20' },
  Inactive: { bg: 'bg-gray-400/10', text: 'text-gray-600 dark:text-gray-400', ring: 'ring-gray-400/20' },
};

const coreValuesConfig: Record<CoreValuesRating, { color: string; label: string; fullLabel: string }> = {
  positive: { color: 'bg-green-400', label: '+', fullLabel: 'Strong Alignment' },
  neutral: { color: 'bg-amber-400', label: '+/-', fullLabel: 'Partial Alignment' },
  negative: { color: 'bg-red-400', label: '-', fullLabel: 'Needs Improvement' },
};

const teams = ['All Teams', 'Leadership', 'Sales', 'Operations', 'Finance', 'HR'];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PeoplePage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [teamOpen, setTeamOpen] = useState(false);

  // Message modal state
  const [messageTarget, setMessageTarget] = useState<Person | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');

  // Profile modal state
  const [profileTarget, setProfileTarget] = useState<Person | null>(null);

  const filtered = people.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'All Teams' || p.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const activeCount = people.filter((p) => p.status === 'Active').length;
  const onLeaveCount = people.filter((p) => p.status === 'On Leave').length;
  const inactiveCount = people.filter((p) => p.status === 'Inactive').length;

  const handleSendMessage = () => {
    if (!messageTarget) return;
    toast.success(`Message sent to ${messageTarget.name}`);
    setMessageTarget(null);
    setMessageSubject('');
    setMessageBody('');
  };

  const openMessage = (person: Person) => {
    setMessageSubject('');
    setMessageBody('');
    setMessageTarget(person);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            People Directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Team members, roles, and organizational contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`rounded-md p-1.5 transition-all ${
                view === 'grid'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`rounded-md p-1.5 transition-all ${
                view === 'table'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{people.length}</span>
            <span className="text-xs text-muted-foreground">Total People</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{activeCount}</span>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{onLeaveCount}</span>
            <span className="text-xs text-muted-foreground">On Leave</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{inactiveCount}</span>
            <span className="text-xs text-muted-foreground">Inactive</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass border-border bg-muted/30 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setTeamOpen(!teamOpen)}
            className="glass flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-all hover:text-foreground"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>{teamFilter}</span>
            <ChevronDown
              className={`h-3 w-3 opacity-60 transition-transform ${teamOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {teamOpen && (
            <div className="glass absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
              {teams.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTeamFilter(t);
                    setTeamOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40 ${
                    teamFilter === t ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((person) => {
            const status = statusConfig[person.status];
            return (
              <div
                key={person.id}
                className="glass glass-hover rounded-xl p-5 transition-all duration-300 cursor-pointer"
              >
                {/* Avatar + status */}
                <div className="mb-4 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-primary">
                      {person.initials}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${
                        person.status === 'Active'
                          ? 'bg-green-400'
                          : person.status === 'On Leave'
                            ? 'bg-amber-400'
                            : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{person.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{person.role}</p>
                </div>

                {/* Team badge */}
                <div className="mb-3 flex justify-center">
                  <Badge
                    variant="outline"
                    className="border-border bg-muted/30 text-[10px] text-muted-foreground"
                  >
                    {person.team}
                  </Badge>
                </div>

                {/* Email */}
                <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{person.email}</span>
                </div>

                {/* Status badge */}
                <div className="mb-4 flex justify-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${status.bg} ${status.text} ${status.ring}`}
                  >
                    {person.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 rounded-lg text-xs text-primary hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMessage(person);
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileTarget(person);
                    }}
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="glass overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Core Values
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((person) => {
                  const status = statusConfig[person.status];
                  const cv = coreValuesConfig[person.coreValuesFit];
                  return (
                    <tr
                      key={person.id}
                      className="border-b border-border/50 transition-colors hover:bg-muted/30 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-primary">
                            {person.initials}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {person.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {person.role}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="border-border bg-muted/30 text-[10px] text-muted-foreground"
                        >
                          {person.team}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {person.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${status.bg} ${status.text} ${status.ring}`}
                        >
                          {person.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${cv.color}`} />
                          <span className="text-xs text-muted-foreground">{cv.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-md px-2 text-xs text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMessage(person);
                            }}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProfileTarget(person);
                            }}
                          >
                            <User className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="glass rounded-xl px-5 py-12 text-center">
          <User className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">
            No people match your search.
          </p>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          Message Modal
      ----------------------------------------------------------------------- */}
      <Dialog
        open={messageTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setMessageTarget(null);
            setMessageSubject('');
            setMessageBody('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Send Message
            </DialogTitle>
            <DialogDescription>
              Compose a message to {messageTarget?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* To field (read-only) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-semibold text-primary">
                  {messageTarget?.initials}
                </div>
                <span className="text-sm text-foreground">{messageTarget?.name}</span>
                <span className="text-xs text-muted-foreground">({messageTarget?.email})</span>
              </div>
            </div>
            {/* Subject */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
              <input
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter subject..."
                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            {/* Message body */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Write your message..."
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!messageBody.trim()}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-3.5 w-3.5" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -----------------------------------------------------------------------
          Profile Modal
      ----------------------------------------------------------------------- */}
      <Dialog
        open={profileTarget !== null}
        onOpenChange={(open) => {
          if (!open) setProfileTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Team Member Profile
            </DialogTitle>
            <DialogDescription>
              Full profile for {profileTarget?.name}
            </DialogDescription>
          </DialogHeader>
          {profileTarget && (
            <div className="space-y-4">
              {/* Avatar + basic info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-primary">
                    {profileTarget.initials}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background ${
                      profileTarget.status === 'Active'
                        ? 'bg-green-400'
                        : profileTarget.status === 'On Leave'
                          ? 'bg-amber-400'
                          : 'bg-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{profileTarget.name}</h3>
                  <p className="text-sm text-muted-foreground">{profileTarget.role}</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${
                      statusConfig[profileTarget.status].bg
                    } ${statusConfig[profileTarget.status].text} ${statusConfig[profileTarget.status].ring}`}
                  >
                    {profileTarget.status}
                  </span>
                </div>
              </div>

              {/* Contact details */}
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{profileTarget.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{profileTarget.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-foreground">{profileTarget.location}</span>
                </div>
              </div>

              {/* Org details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Building2 className="h-3 w-3" />
                    Team
                  </div>
                  <p className="text-sm font-medium text-foreground">{profileTarget.team}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <MapPin className="h-3 w-3" />
                    Seat (Org Chart)
                  </div>
                  <p className="text-sm font-medium text-foreground">{profileTarget.seat}</p>
                </div>
              </div>

              {/* Core values alignment */}
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Star className="h-3 w-3" />
                  Core Values Alignment
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${coreValuesConfig[profileTarget.coreValuesFit].color}`}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {coreValuesConfig[profileTarget.coreValuesFit].fullLabel}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({coreValuesConfig[profileTarget.coreValuesFit].label})
                  </span>
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                  <Activity className="h-3 w-3" />
                  Recent Activity
                </div>
                <ul className="space-y-1.5">
                  {profileTarget.recentActivity.map((activity, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg text-xs"
                />
              }
            >
              Close
            </DialogClose>
            <Button
              size="sm"
              onClick={() => {
                if (profileTarget) {
                  setProfileTarget(null);
                  openMessage(profileTarget);
                }
              }}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
