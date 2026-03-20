'use client';

import { useState } from 'react';
import {
  Network,
  Plus,
  GripVertical,
  ZoomIn,
  ZoomOut,
  ChevronsUpDown,
  Pencil,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Seat {
  id: string;
  title: string;
  person?: { name: string; initials: string };
  responsibilities: string[];
  roleCount: number;
  children?: Seat[];
}

// ---------------------------------------------------------------------------
// Mock Data — Construction company EOS-style org chart
// ---------------------------------------------------------------------------

const orgChart: Seat = {
  id: 'seat-ceo',
  title: 'Strategic Leader',
  person: { name: 'Joseph Wells', initials: 'JW' },
  responsibilities: ['Vision & culture', 'Key relationships', 'Big decisions'],
  roleCount: 5,
  children: [
    {
      id: 'seat-sales',
      title: 'VP of Sales & Marketing',
      person: { name: 'Sarah Chen', initials: 'SC' },
      responsibilities: ['Revenue targets', 'Lead generation', 'Client retention'],
      roleCount: 5,
      children: [
        {
          id: 'seat-estimator',
          title: 'Lead Estimator',
          person: { name: 'Ryan Nakamura', initials: 'RN' },
          responsibilities: ['Estimate accuracy', 'Bid management'],
          roleCount: 4,
        },
        {
          id: 'seat-marketing',
          title: 'Marketing Coordinator',
          person: undefined,
          responsibilities: ['Digital campaigns', 'Brand presence'],
          roleCount: 3,
        },
        {
          id: 'seat-bdr',
          title: 'Business Dev Rep',
          person: { name: 'Alex Flores', initials: 'AF' },
          responsibilities: ['Outbound prospecting', 'Lead qualification'],
          roleCount: 4,
        },
      ],
    },
    {
      id: 'seat-ops',
      title: 'VP of Operations',
      person: { name: 'Mike Torres', initials: 'MT' },
      responsibilities: ['Project delivery', 'Crew management', 'Quality control'],
      roleCount: 5,
      children: [
        {
          id: 'seat-pm',
          title: 'Project Manager',
          person: { name: 'Kim Lee', initials: 'KL' },
          responsibilities: ['Schedule management', 'Client communication'],
          roleCount: 5,
        },
        {
          id: 'seat-super',
          title: 'Site Superintendent',
          person: { name: 'Dan Parker', initials: 'DP' },
          responsibilities: ['On-site supervision', 'Safety compliance'],
          roleCount: 5,
        },
        {
          id: 'seat-safety',
          title: 'Safety Manager',
          person: undefined,
          responsibilities: ['OSHA compliance', 'Training programs'],
          roleCount: 4,
        },
      ],
    },
    {
      id: 'seat-finance',
      title: 'Controller / Finance',
      person: { name: 'David Kim', initials: 'DK' },
      responsibilities: ['Cash flow management', 'Budgeting', 'AR/AP oversight'],
      roleCount: 5,
      children: [
        {
          id: 'seat-ap',
          title: 'AP/AR Specialist',
          person: { name: 'Maria Gonzalez', initials: 'MG' },
          responsibilities: ['Invoice processing', 'Collections'],
          roleCount: 3,
        },
        {
          id: 'seat-payroll',
          title: 'Payroll Administrator',
          person: { name: 'James Taylor', initials: 'JT' },
          responsibilities: ['Weekly payroll', 'Benefits admin'],
          roleCount: 4,
        },
      ],
    },
    {
      id: 'seat-hr',
      title: 'HR / People Director',
      person: { name: 'Lisa Park', initials: 'LP' },
      responsibilities: ['Hiring & onboarding', 'Culture & retention', 'Performance reviews'],
      roleCount: 5,
      children: [
        {
          id: 'seat-recruiter',
          title: 'Recruiter',
          person: undefined,
          responsibilities: ['Pipeline management', 'Interview coordination'],
          roleCount: 3,
        },
      ],
    },
    {
      id: 'seat-strategy',
      title: 'Integrator / COO',
      person: { name: 'Carlos Rivera', initials: 'CR' },
      responsibilities: ['Execution alignment', 'Process improvement', 'Cross-team sync'],
      roleCount: 5,
      children: [
        {
          id: 'seat-it',
          title: 'IT / Systems Admin',
          person: { name: 'Tom Bradley', initials: 'TB' },
          responsibilities: ['Tech infrastructure', 'Software management'],
          roleCount: 4,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Seat Card component
// ---------------------------------------------------------------------------

function SeatCard({
  seat,
  editMode,
}: {
  seat: Seat;
  editMode: boolean;
}) {
  const isOpen = !seat.person;

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 min-w-[220px] max-w-[260px] ${
        isOpen
          ? 'border border-dashed border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.02)]'
          : 'glass glass-hover'
      }`}
    >
      {editMode && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      {/* Header: title + status */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h4 className="text-xs font-semibold text-foreground leading-tight">
          {seat.title}
        </h4>
        <span
          className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
            isOpen
              ? 'border border-[rgba(255,255,255,0.3)] bg-transparent'
              : 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
          }`}
        />
      </div>

      {/* Person or Open Seat */}
      <div className="mb-3 flex items-center gap-2">
        {seat.person ? (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-300">
              {seat.person.initials}
            </div>
            <span className="text-xs font-medium text-foreground">
              {seat.person.name}
            </span>
          </>
        ) : (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[rgba(255,255,255,0.2)]">
              <User className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-xs italic text-muted-foreground">
              Open Seat
            </span>
          </>
        )}
      </div>

      {/* Responsibilities */}
      <ul className="mb-3 space-y-0.5">
        {seat.responsibilities.slice(0, 3).map((r, i) => (
          <li
            key={i}
            className="text-[10px] text-muted-foreground truncate before:mr-1.5 before:content-['\\2022'] before:text-muted-foreground/40"
          >
            {r}
          </li>
        ))}
      </ul>

      {/* Role count */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
        <Network className="h-3 w-3" />
        <span>{seat.roleCount} Roles</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recursive branch renderer
// ---------------------------------------------------------------------------

function OrgBranch({
  seat,
  editMode,
  collapsed,
  isRoot,
}: {
  seat: Seat;
  editMode: boolean;
  collapsed: boolean;
  isRoot?: boolean;
}) {
  const hasChildren = seat.children && seat.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <SeatCard seat={seat} editMode={editMode} />

      {hasChildren && !collapsed && (
        <>
          {/* Vertical connector from parent */}
          <div className="h-6 w-px bg-[rgba(255,255,255,0.15)]" />

          {/* Horizontal rail + children */}
          <div className="relative">
            {/* Horizontal connector line */}
            {seat.children!.length > 1 && (
              <div
                className="absolute top-0 h-px bg-[rgba(255,255,255,0.15)]"
                style={{
                  left: `calc(50% / ${seat.children!.length})`,
                  right: `calc(50% / ${seat.children!.length})`,
                }}
              />
            )}

            <div className="flex items-start gap-4">
              {seat.children!.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical connector to child */}
                  <div className="h-6 w-px bg-[rgba(255,255,255,0.15)]" />
                  <OrgBranch
                    seat={child}
                    editMode={editMode}
                    collapsed={collapsed}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrgChartPage() {
  const [editMode, setEditMode] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [zoom, setZoom] = useState(100);

  const totalSeats = countSeats(orgChart);
  const openSeats = countOpenSeats(orgChart);
  const filledSeats = totalSeats - openSeats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Responsibility Map
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organizational accountability chart showing function-based hierarchy
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
              editMode
                ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setEditMode(!editMode)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {editMode ? 'Done Editing' : 'Edit Mode'}
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Seat
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{totalSeats}</span>
            <span className="text-xs text-muted-foreground">Total Seats</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-400">{filledSeats}</span>
            <span className="text-xs text-muted-foreground">Filled</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full border border-[rgba(255,255,255,0.3)] bg-transparent" />
            <span className="text-sm font-medium text-amber-400">{openSeats}</span>
            <span className="text-xs text-muted-foreground">Open</span>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {isCollapsed ? 'Expand All' : 'Collapse All'}
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center text-xs text-muted-foreground">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-foreground"
            onClick={() => setZoom(Math.min(150, zoom + 10))}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Org chart canvas */}
      <div className="glass rounded-xl overflow-x-auto p-8">
        <div
          className="flex justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <OrgBranch
            seat={orgChart}
            editMode={editMode}
            collapsed={isCollapsed}
            isRoot
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countSeats(seat: Seat): number {
  let count = 1;
  if (seat.children) {
    for (const child of seat.children) {
      count += countSeats(child);
    }
  }
  return count;
}

function countOpenSeats(seat: Seat): number {
  let count = seat.person ? 0 : 1;
  if (seat.children) {
    for (const child of seat.children) {
      count += countOpenSeats(child);
    }
  }
  return count;
}
