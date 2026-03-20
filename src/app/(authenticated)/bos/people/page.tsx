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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  status: PersonStatus;
  coreValuesFit: CoreValuesRating;
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
    email: 'joseph@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-002',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'VP of Sales & Marketing',
    team: 'Sales',
    email: 'sarah@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-003',
    name: 'Mike Torres',
    initials: 'MT',
    role: 'VP of Operations',
    team: 'Operations',
    email: 'mike@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-004',
    name: 'David Kim',
    initials: 'DK',
    role: 'Controller / Finance',
    team: 'Finance',
    email: 'david@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'neutral',
  },
  {
    id: 'p-005',
    name: 'Lisa Park',
    initials: 'LP',
    role: 'HR / People Director',
    team: 'HR',
    email: 'lisa@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-006',
    name: 'Carlos Rivera',
    initials: 'CR',
    role: 'Integrator / COO',
    team: 'Leadership',
    email: 'carlos@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-007',
    name: 'Ryan Nakamura',
    initials: 'RN',
    role: 'Lead Estimator',
    team: 'Sales',
    email: 'ryan@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'neutral',
  },
  {
    id: 'p-008',
    name: 'Kim Lee',
    initials: 'KL',
    role: 'Project Manager',
    team: 'Operations',
    email: 'kim@apexbuilders.com',
    status: 'On Leave',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-009',
    name: 'Dan Parker',
    initials: 'DP',
    role: 'Site Superintendent',
    team: 'Operations',
    email: 'dan@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-010',
    name: 'Maria Gonzalez',
    initials: 'MG',
    role: 'AP/AR Specialist',
    team: 'Finance',
    email: 'maria@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'positive',
  },
  {
    id: 'p-011',
    name: 'James Taylor',
    initials: 'JT',
    role: 'Payroll Administrator',
    team: 'Finance',
    email: 'james@apexbuilders.com',
    status: 'Active',
    coreValuesFit: 'negative',
  },
  {
    id: 'p-012',
    name: 'Tom Bradley',
    initials: 'TB',
    role: 'IT / Systems Admin',
    team: 'Operations',
    email: 'tom@apexbuilders.com',
    status: 'Inactive',
    coreValuesFit: 'neutral',
  },
];

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const statusConfig: Record<PersonStatus, { bg: string; text: string; ring: string }> = {
  Active: { bg: 'bg-green-400/10', text: 'text-green-400', ring: 'ring-green-400/20' },
  'On Leave': { bg: 'bg-amber-400/10', text: 'text-amber-400', ring: 'ring-amber-400/20' },
  Inactive: { bg: 'bg-gray-400/10', text: 'text-gray-400', ring: 'ring-gray-400/20' },
};

const coreValuesConfig: Record<CoreValuesRating, { color: string; label: string }> = {
  positive: { color: 'bg-green-400', label: '+' },
  neutral: { color: 'bg-amber-400', label: '+/-' },
  negative: { color: 'bg-red-400', label: '-' },
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
            <User className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{people.length}</span>
            <span className="text-xs text-muted-foreground">Total People</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-400">{activeCount}</span>
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium text-amber-400">{onLeaveCount}</span>
            <span className="text-xs text-muted-foreground">On Leave</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-400">{inactiveCount}</span>
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
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-indigo-300">
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
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 flex-1 gap-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground"
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
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-300">
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
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
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
    </div>
  );
}
