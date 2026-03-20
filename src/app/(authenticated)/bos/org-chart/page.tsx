'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Network,
  Plus,
  GripVertical,
  ZoomIn,
  ZoomOut,
  ChevronsUpDown,
  Pencil,
  User,
  Trash2,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  FileDown,
  Eye,
  Award,
  BookOpen,
  BarChart3,
  Calendar,
  AlertTriangle,
  Check,
  Undo2,
  Send,
  Layers,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkillProficiency = 'Learning' | 'Proficient' | 'Expert';

interface Skill {
  name: string;
  proficiency: SkillProficiency;
  linkedKB?: string;
}

interface Seat {
  id: string;
  title: string;
  person?: { name: string; initials: string };
  responsibilities: string[];
  roleCount: number;
  skills: Skill[];
  kpis: string[];
  tenure?: string;
  department?: string;
  children?: Seat[];
}

// ---------------------------------------------------------------------------
// People pool (for reassignment & multi-seat tracking)
// ---------------------------------------------------------------------------

const allPeople = [
  { name: 'Joseph Wells', initials: 'JW' },
  { name: 'Sarah Chen', initials: 'SC' },
  { name: 'Ryan Nakamura', initials: 'RN' },
  { name: 'Alex Flores', initials: 'AF' },
  { name: 'Mike Torres', initials: 'MT' },
  { name: 'Kim Lee', initials: 'KL' },
  { name: 'Dan Parker', initials: 'DP' },
  { name: 'David Kim', initials: 'DK' },
  { name: 'Maria Gonzalez', initials: 'MG' },
  { name: 'James Taylor', initials: 'JT' },
  { name: 'Lisa Park', initials: 'LP' },
  { name: 'Carlos Rivera', initials: 'CR' },
  { name: 'Tom Bradley', initials: 'TB' },
];

// ---------------------------------------------------------------------------
// Mock Data — Construction company EOS-style org chart
// ---------------------------------------------------------------------------

const initialOrgChart: Seat = {
  id: 'seat-ceo',
  title: 'Strategic Leader',
  person: { name: 'Joseph Wells', initials: 'JW' },
  responsibilities: ['Vision & culture', 'Key relationships', 'Big decisions'],
  roleCount: 5,
  skills: [
    { name: 'Strategic Planning', proficiency: 'Expert', linkedKB: 'strategy-101' },
    { name: 'Leadership', proficiency: 'Expert' },
  ],
  kpis: ['Revenue Growth', 'Employee Satisfaction'],
  tenure: '3 years',
  department: 'Executive',
  children: [
    {
      id: 'seat-sales',
      title: 'VP of Sales & Marketing',
      person: { name: 'Sarah Chen', initials: 'SC' },
      responsibilities: ['Revenue targets', 'Lead generation', 'Client retention'],
      roleCount: 5,
      skills: [
        { name: 'Sales Management', proficiency: 'Expert' },
        { name: 'CRM', proficiency: 'Proficient' },
      ],
      kpis: ['Monthly Revenue', 'Lead Conversion Rate'],
      tenure: '2 years',
      department: 'Sales',
      children: [
        {
          id: 'seat-estimator',
          title: 'Lead Estimator',
          person: { name: 'Ryan Nakamura', initials: 'RN' },
          responsibilities: ['Estimate accuracy', 'Bid management'],
          roleCount: 4,
          skills: [
            { name: 'Cost Estimation', proficiency: 'Expert' },
            { name: 'Blueprint Reading', proficiency: 'Proficient' },
          ],
          kpis: ['Estimate Accuracy %'],
          tenure: '1.5 years',
          department: 'Sales',
        },
        {
          id: 'seat-marketing',
          title: 'Marketing Coordinator',
          person: undefined,
          responsibilities: ['Digital campaigns', 'Brand presence'],
          roleCount: 3,
          skills: [
            { name: 'Digital Marketing', proficiency: 'Proficient' },
            { name: 'Content Creation', proficiency: 'Learning' },
          ],
          kpis: ['Website Traffic', 'Social Engagement'],
          department: 'Sales',
        },
        {
          id: 'seat-bdr',
          title: 'Business Dev Rep',
          person: { name: 'Alex Flores', initials: 'AF' },
          responsibilities: ['Outbound prospecting', 'Lead qualification'],
          roleCount: 4,
          skills: [
            { name: 'Cold Outreach', proficiency: 'Proficient' },
            { name: 'CRM', proficiency: 'Learning' },
          ],
          kpis: ['Qualified Leads/Month'],
          tenure: '8 months',
          department: 'Sales',
        },
      ],
    },
    {
      id: 'seat-ops',
      title: 'VP of Operations',
      person: { name: 'Mike Torres', initials: 'MT' },
      responsibilities: ['Project delivery', 'Crew management', 'Quality control'],
      roleCount: 5,
      skills: [
        { name: 'Project Management', proficiency: 'Expert' },
        { name: 'Quality Systems', proficiency: 'Expert' },
      ],
      kpis: ['On-Time Delivery %', 'Rework Rate'],
      tenure: '4 years',
      department: 'Operations',
      children: [
        {
          id: 'seat-pm',
          title: 'Project Manager',
          person: { name: 'Kim Lee', initials: 'KL' },
          responsibilities: ['Schedule management', 'Client communication'],
          roleCount: 5,
          skills: [
            { name: 'Scheduling', proficiency: 'Expert' },
            { name: 'Client Relations', proficiency: 'Proficient' },
          ],
          kpis: ['Project Margin %', 'Client Satisfaction'],
          tenure: '2 years',
          department: 'Operations',
        },
        {
          id: 'seat-super',
          title: 'Site Superintendent',
          person: { name: 'Dan Parker', initials: 'DP' },
          responsibilities: ['On-site supervision', 'Safety compliance'],
          roleCount: 5,
          skills: [
            { name: 'Field Management', proficiency: 'Expert' },
            { name: 'OSHA Standards', proficiency: 'Proficient' },
          ],
          kpis: ['Safety Incident Rate'],
          tenure: '3 years',
          department: 'Operations',
        },
        {
          id: 'seat-safety',
          title: 'Safety Manager',
          person: undefined,
          responsibilities: ['OSHA compliance', 'Training programs'],
          roleCount: 4,
          skills: [
            { name: 'OSHA Compliance', proficiency: 'Expert' },
            { name: 'Training Delivery', proficiency: 'Proficient' },
          ],
          kpis: ['Training Completion %'],
          department: 'Operations',
        },
      ],
    },
    {
      id: 'seat-finance',
      title: 'Controller / Finance',
      person: { name: 'David Kim', initials: 'DK' },
      responsibilities: ['Cash flow management', 'Budgeting', 'AR/AP oversight'],
      roleCount: 5,
      skills: [
        { name: 'Financial Analysis', proficiency: 'Expert' },
        { name: 'QuickBooks', proficiency: 'Expert' },
      ],
      kpis: ['Cash Flow Accuracy', 'Monthly Close Time'],
      tenure: '2.5 years',
      department: 'Finance',
      children: [
        {
          id: 'seat-ap',
          title: 'AP/AR Specialist',
          person: { name: 'Maria Gonzalez', initials: 'MG' },
          responsibilities: ['Invoice processing', 'Collections'],
          roleCount: 3,
          skills: [
            { name: 'Accounts Payable', proficiency: 'Proficient' },
            { name: 'Collections', proficiency: 'Learning' },
          ],
          kpis: ['Days Sales Outstanding'],
          tenure: '1 year',
          department: 'Finance',
        },
        {
          id: 'seat-payroll',
          title: 'Payroll Administrator',
          person: { name: 'James Taylor', initials: 'JT' },
          responsibilities: ['Weekly payroll', 'Benefits admin'],
          roleCount: 4,
          skills: [
            { name: 'Payroll Processing', proficiency: 'Expert' },
            { name: 'Benefits Admin', proficiency: 'Proficient' },
          ],
          kpis: ['Payroll Accuracy %'],
          tenure: '1.5 years',
          department: 'Finance',
        },
      ],
    },
    {
      id: 'seat-hr',
      title: 'HR / People Director',
      person: { name: 'Lisa Park', initials: 'LP' },
      responsibilities: ['Hiring & onboarding', 'Culture & retention', 'Performance reviews'],
      roleCount: 5,
      skills: [
        { name: 'Talent Acquisition', proficiency: 'Expert' },
        { name: 'HR Compliance', proficiency: 'Proficient' },
      ],
      kpis: ['Time to Hire', 'Retention Rate'],
      tenure: '2 years',
      department: 'HR',
      children: [
        {
          id: 'seat-recruiter',
          title: 'Recruiter',
          person: undefined,
          responsibilities: ['Pipeline management', 'Interview coordination'],
          roleCount: 3,
          skills: [
            { name: 'Sourcing', proficiency: 'Proficient' },
            { name: 'Interviewing', proficiency: 'Learning' },
          ],
          kpis: ['Candidates Sourced/Week'],
          department: 'HR',
        },
      ],
    },
    {
      id: 'seat-strategy',
      title: 'Integrator / COO',
      person: { name: 'Carlos Rivera', initials: 'CR' },
      responsibilities: ['Execution alignment', 'Process improvement', 'Cross-team sync'],
      roleCount: 5,
      skills: [
        { name: 'Process Optimization', proficiency: 'Expert' },
        { name: 'EOS Methodology', proficiency: 'Expert' },
      ],
      kpis: ['Process Efficiency Score', 'Cross-Team Alignment'],
      tenure: '3 years',
      department: 'Strategy',
      children: [
        {
          id: 'seat-it',
          title: 'IT / Systems Admin',
          person: { name: 'Tom Bradley', initials: 'TB' },
          responsibilities: ['Tech infrastructure', 'Software management'],
          roleCount: 4,
          skills: [
            { name: 'Network Admin', proficiency: 'Expert' },
            { name: 'Cloud Infrastructure', proficiency: 'Proficient' },
          ],
          kpis: ['System Uptime %'],
          tenure: '1 year',
          department: 'Strategy',
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// AI Seat Builder mock suggestions
// ---------------------------------------------------------------------------

const aiSuggestions: Record<string, { responsibilities: string[]; skills: Skill[]; parentTitle: string }> = {
  'project coordinator': {
    responsibilities: ['Assist PMs with scheduling', 'Track milestones', 'Coordinate subcontractors', 'Maintain project docs'],
    skills: [
      { name: 'Project Coordination', proficiency: 'Proficient' },
      { name: 'MS Project', proficiency: 'Learning' },
      { name: 'Communication', proficiency: 'Proficient' },
    ],
    parentTitle: 'VP of Operations',
  },
  'social media manager': {
    responsibilities: ['Manage social channels', 'Content calendar', 'Analytics reporting', 'Community engagement'],
    skills: [
      { name: 'Social Media Strategy', proficiency: 'Expert' },
      { name: 'Content Creation', proficiency: 'Proficient' },
      { name: 'Analytics', proficiency: 'Learning' },
    ],
    parentTitle: 'VP of Sales & Marketing',
  },
  default: {
    responsibilities: ['Define core deliverables', 'Report on KPIs weekly', 'Collaborate cross-functionally'],
    skills: [
      { name: 'Communication', proficiency: 'Proficient' },
      { name: 'Problem Solving', proficiency: 'Learning' },
    ],
    parentTitle: 'Strategic Leader',
  },
};

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

function flattenSeats(seat: Seat): Seat[] {
  const result: Seat[] = [seat];
  if (seat.children) {
    for (const child of seat.children) {
      result.push(...flattenSeats(child));
    }
  }
  return result;
}

function countDirectReports(seat: Seat): number {
  return seat.children?.length ?? 0;
}

function cloneSeat(seat: Seat): Seat {
  return {
    ...seat,
    skills: seat.skills.map((s) => ({ ...s })),
    kpis: [...seat.kpis],
    responsibilities: [...seat.responsibilities],
    person: seat.person ? { ...seat.person } : undefined,
    children: seat.children?.map(cloneSeat),
  };
}

function addChildSeat(root: Seat, parentId: string, newSeat: Seat): Seat {
  const clone = cloneSeat(root);
  const stack: Seat[] = [clone];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.id === parentId) {
      if (!current.children) current.children = [];
      current.children.push(newSeat);
      return clone;
    }
    if (current.children) stack.push(...current.children);
  }
  return clone;
}

function removeSeatById(root: Seat, seatId: string): Seat {
  const clone = cloneSeat(root);
  if (clone.id === seatId) return clone; // can't remove root
  const stack: Seat[] = [clone];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.children) {
      current.children = current.children.filter((c) => c.id !== seatId);
      stack.push(...current.children);
    }
  }
  return clone;
}

function updateSeatById(root: Seat, seatId: string, updater: (s: Seat) => void): Seat {
  const clone = cloneSeat(root);
  const stack: Seat[] = [clone];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.id === seatId) {
      updater(current);
      return clone;
    }
    if (current.children) stack.push(...current.children);
  }
  return clone;
}

function moveSeat(root: Seat, seatId: string, newParentId: string): Seat {
  // Find and detach the seat
  let movingSeat: Seat | null = null;
  const withoutSeat = cloneSeat(root);
  const detachStack: Seat[] = [withoutSeat];
  while (detachStack.length > 0) {
    const current = detachStack.pop()!;
    if (current.children) {
      const idx = current.children.findIndex((c) => c.id === seatId);
      if (idx !== -1) {
        movingSeat = current.children[idx];
        current.children.splice(idx, 1);
        break;
      }
      detachStack.push(...current.children);
    }
  }
  if (!movingSeat) return root;
  // Attach to new parent
  const attachStack: Seat[] = [withoutSeat];
  while (attachStack.length > 0) {
    const current = attachStack.pop()!;
    if (current.id === newParentId) {
      if (!current.children) current.children = [];
      current.children.push(movingSeat);
      return withoutSeat;
    }
    if (current.children) attachStack.push(...current.children);
  }
  return root;
}

function getPersonSeatCount(root: Seat, personName: string): number {
  let count = 0;
  const stack: Seat[] = [root];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.person?.name === personName) count++;
    if (current.children) stack.push(...current.children);
  }
  return count;
}

function getDepartments(seat: Seat): string[] {
  const deps = new Set<string>();
  const stack: Seat[] = [seat];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current.department) deps.add(current.department);
    if (current.children) stack.push(...current.children);
  }
  return Array.from(deps).sort();
}

function filterByDepartment(seat: Seat, department: string): Seat | null {
  if (seat.department === department) {
    return cloneSeat(seat);
  }
  if (seat.children) {
    const matchedChildren: Seat[] = [];
    for (const child of seat.children) {
      const result = filterByDepartment(child, department);
      if (result) matchedChildren.push(result);
    }
    if (matchedChildren.length > 0) {
      const clone = cloneSeat(seat);
      clone.children = matchedChildren;
      return clone;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Proficiency badge colors
// ---------------------------------------------------------------------------

function proficiencyColor(p: SkillProficiency): string {
  switch (p) {
    case 'Learning':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'Proficient':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'Expert':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  }
}

// ---------------------------------------------------------------------------
// Seat Card component (Enhanced)
// ---------------------------------------------------------------------------

function SeatCard({
  seat,
  editMode,
  isDraft,
  draftChanges,
  orgRoot,
  onAddChild,
  onRemove,
  onMoveSeat,
  onReassign,
  onAddSkill,
  onExpand,
  isExpanded,
  onSelectSeat,
}: {
  seat: Seat;
  editMode: boolean;
  isDraft: boolean;
  draftChanges: Set<string>;
  orgRoot: Seat;
  onAddChild: (parentId: string) => void;
  onRemove: (seatId: string) => void;
  onMoveSeat: (seatId: string) => void;
  onReassign: (seatId: string) => void;
  onAddSkill: (seatId: string) => void;
  onExpand: (seatId: string) => void;
  isExpanded: boolean;
  onSelectSeat: (seat: Seat) => void;
}) {
  const isOpen = !seat.person;
  const isDraftChanged = draftChanges.has(seat.id);
  const personSeatCount = seat.person ? getPersonSeatCount(orgRoot, seat.person.name) : 0;
  const isOverloaded = personSeatCount >= 3;
  const directReports = countDirectReports(seat);

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 min-w-[220px] max-w-[280px] ${
        isOpen
          ? 'border border-dashed border-border bg-muted/30'
          : 'glass glass-hover'
      } ${isDraft && isDraftChanged ? 'border-2 border-dashed border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]' : ''}`}
    >
      {/* Draft watermark */}
      {isDraft && isDraftChanged && (
        <div className="absolute top-1 right-1 text-[8px] font-bold text-amber-500/50 tracking-widest">
          DRAFT
        </div>
      )}

      {/* Drag handle */}
      {editMode && (
        <div
          className="absolute -left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing"
          onMouseDown={(e) => {
            const el = (e.target as HTMLElement).closest('.cursor-grab');
            if (el) {
              el.classList.add('opacity-50');
              toast.info(`Drag ${seat.title} to reposition`);
              setTimeout(() => el.classList.remove('opacity-50'), 600);
            }
          }}
        >
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
              ? 'border border-border bg-transparent'
              : 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
          }`}
        />
      </div>

      {/* Person or Open Seat — clickable to open detail panel */}
      <button
        type="button"
        className="mb-3 flex items-center gap-2 w-full text-left rounded-lg p-1 -m-1 hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => onSelectSeat(seat)}
        title={`View details for ${seat.person?.name ?? seat.title}`}
      >
        {seat.person ? (
          <>
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-primary">
                {seat.person.initials}
              </div>
              {/* Multi-seat badge */}
              {personSeatCount > 1 && (
                <div
                  className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${
                    isOverloaded
                      ? 'bg-red-500/30 text-red-500 border border-red-500/50'
                      : 'bg-indigo-500/30 text-primary border border-indigo-500/50'
                  }`}
                  title={`${seat.person.name} holds ${personSeatCount} seats${isOverloaded ? ' (overloaded!)' : ''}`}
                >
                  {personSeatCount}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground flex items-center gap-1">
                {seat.person.name}
                {isOverloaded && (
                  <span title="Overloaded: 3+ seats"><AlertTriangle className="h-3 w-3 text-amber-400" /></span>
                )}
              </span>
              {seat.tenure && (
                <span className="text-[9px] text-muted-foreground/60 flex items-center gap-0.5">
                  <Calendar className="h-2.5 w-2.5" />
                  {seat.tenure}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-border">
              <User className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <span className="text-xs italic text-muted-foreground">
              Open Seat
            </span>
          </>
        )}
      </button>

      {/* Responsibilities */}
      <ul className="mb-2 space-y-0.5">
        {(isExpanded ? seat.responsibilities : seat.responsibilities.slice(0, 3)).map((r, i) => (
          <li
            key={i}
            className="text-[10px] text-muted-foreground truncate before:mr-1.5 before:content-['\2022'] before:text-muted-foreground/40"
          >
            {r}
          </li>
        ))}
      </ul>

      {/* Skills section */}
      {seat.skills.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <Award className="h-2.5 w-2.5 text-muted-foreground/50" />
            <span className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wider">Skills</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(isExpanded ? seat.skills : seat.skills.slice(0, 3)).map((skill, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0 text-[8px] font-medium ${proficiencyColor(skill.proficiency)}`}
                title={`${skill.proficiency}${skill.linkedKB ? ' — Linked to Knowledge Portal' : ''}`}
              >
                {skill.linkedKB && <BookOpen className="h-2 w-2" />}
                {skill.name}
              </span>
            ))}
            {!isExpanded && seat.skills.length > 3 && (
              <span className="text-[8px] text-muted-foreground/50">+{seat.skills.length - 3}</span>
            )}
          </div>
          {editMode && (
            <button
              onClick={() => onAddSkill(seat.id)}
              className="mt-1 text-[8px] text-indigo-400 hover:text-primary flex items-center gap-0.5"
            >
              <Plus className="h-2 w-2" /> Add Skill
            </button>
          )}
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="mb-2 space-y-1.5 border-t border-border pt-2">
          {/* KPIs */}
          {seat.kpis.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <BarChart3 className="h-2.5 w-2.5 text-muted-foreground/50" />
                <span className="text-[9px] font-medium text-muted-foreground/70 uppercase tracking-wider">KPIs</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {seat.kpis.map((kpi, i) => (
                  <span key={i} className="text-[9px] text-muted-foreground bg-muted/40 rounded px-1 py-0.5">
                    {kpi}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Direct Reports */}
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
            <Network className="h-2.5 w-2.5" />
            <span>{directReports} direct report{directReports !== 1 ? 's' : ''}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={() => {
                toast.info(`Viewing profile for ${seat.person?.name ?? seat.title}`);
              }}
              className="text-[9px] text-indigo-400 hover:text-primary flex items-center gap-0.5 bg-indigo-500/10 rounded px-1.5 py-0.5"
            >
              <Eye className="h-2.5 w-2.5" /> View Profile
            </button>
            {editMode && (
              <button
                onClick={() => onReassign(seat.id)}
                className="text-[9px] text-emerald-400 hover:text-emerald-500 flex items-center gap-0.5 bg-emerald-500/10 rounded px-1.5 py-0.5"
              >
                <ArrowRightLeft className="h-2.5 w-2.5" /> Reassign
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer: role count + expand toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Network className="h-3 w-3" />
          <span>{seat.roleCount} Roles</span>
        </div>
        <button
          onClick={() => onExpand(seat.id)}
          className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-0.5"
        >
          {isExpanded ? 'Less' : 'More'}
          {isExpanded ? (
            <ChevronDown className="h-2.5 w-2.5 rotate-180" />
          ) : (
            <ChevronDown className="h-2.5 w-2.5" />
          )}
        </button>
      </div>

      {/* Edit mode actions */}
      {editMode && (
        <div className="mt-2 flex items-center gap-1 border-t border-border pt-2">
          <button
            onClick={() => onAddChild(seat.id)}
            className="text-[9px] text-green-400 hover:text-green-500 flex items-center gap-0.5"
            title="Add child seat"
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={() => onRemove(seat.id)}
            className="text-[9px] text-red-400 hover:text-red-500 flex items-center gap-0.5"
            title="Remove seat"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
          <button
            onClick={() => onMoveSeat(seat.id)}
            className="text-[9px] text-blue-400 hover:text-blue-500 flex items-center gap-0.5"
            title="Move to different parent"
          >
            <ArrowRightLeft className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recursive branch renderer
// ---------------------------------------------------------------------------

function OrgBranch({
  seat,
  editMode,
  globalCollapsed,
  collapsedNodes,
  toggleNodeCollapse,
  isDraft,
  draftChanges,
  orgRoot,
  onAddChild,
  onRemove,
  onMoveSeat,
  onReassign,
  onAddSkill,
  expandedCards,
  onExpandCard,
  onSelectSeat,
}: {
  seat: Seat;
  editMode: boolean;
  globalCollapsed: boolean;
  collapsedNodes: Set<string>;
  toggleNodeCollapse: (id: string) => void;
  isDraft: boolean;
  draftChanges: Set<string>;
  orgRoot: Seat;
  onAddChild: (parentId: string) => void;
  onRemove: (seatId: string) => void;
  onMoveSeat: (seatId: string) => void;
  onReassign: (seatId: string) => void;
  onAddSkill: (seatId: string) => void;
  expandedCards: Set<string>;
  onExpandCard: (id: string) => void;
  onSelectSeat: (seat: Seat) => void;
}) {
  const hasChildren = seat.children && seat.children.length > 0;
  const isNodeCollapsed = globalCollapsed || collapsedNodes.has(seat.id);

  return (
    <div className="flex flex-col items-center">
      <SeatCard
        seat={seat}
        editMode={editMode}
        isDraft={isDraft}
        draftChanges={draftChanges}
        orgRoot={orgRoot}
        onAddChild={onAddChild}
        onRemove={onRemove}
        onMoveSeat={onMoveSeat}
        onReassign={onReassign}
        onAddSkill={onAddSkill}
        onExpand={onExpandCard}
        isExpanded={expandedCards.has(seat.id)}
        onSelectSeat={onSelectSeat}
      />

      {/* Collapse/expand toggle for nodes with children */}
      {hasChildren && (
        <button
          onClick={() => toggleNodeCollapse(seat.id)}
          className="my-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors"
          title={isNodeCollapsed ? 'Expand children' : 'Collapse children'}
        >
          {isNodeCollapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      )}

      {hasChildren && !isNodeCollapsed && (
        <>
          {/* Vertical connector from parent */}
          <div className="h-4 w-px bg-border" />

          {/* Horizontal rail + children */}
          <div className="relative">
            {/* Horizontal connector line */}
            {seat.children!.length > 1 && (
              <div
                className="absolute top-0 h-px bg-border"
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
                  <div className="h-6 w-px bg-border" />
                  <OrgBranch
                    seat={child}
                    editMode={editMode}
                    globalCollapsed={globalCollapsed}
                    collapsedNodes={collapsedNodes}
                    toggleNodeCollapse={toggleNodeCollapse}
                    isDraft={isDraft}
                    draftChanges={draftChanges}
                    orgRoot={orgRoot}
                    onAddChild={onAddChild}
                    onRemove={onRemove}
                    onMoveSeat={onMoveSeat}
                    onReassign={onReassign}
                    onAddSkill={onAddSkill}
                    expandedCards={expandedCards}
                    onExpandCard={onExpandCard}
                    onSelectSeat={onSelectSeat}
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
  // Core state
  const [orgChart, setOrgChart] = useState<Seat>(initialOrgChart);
  const [editMode, setEditMode] = useState(false);
  const [isGlobalCollapsed, setIsGlobalCollapsed] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(100);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Draft mode
  const [isDraft, setIsDraft] = useState(false);
  const [draftSnapshot, setDraftSnapshot] = useState<Seat | null>(null);
  const [draftChanges, setDraftChanges] = useState<Set<string>>(new Set());

  // Department filter
  const [viewMode, setViewMode] = useState<'full' | 'department'>('full');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Dialog states
  const [addSeatOpen, setAddSeatOpen] = useState(false);
  const [addSeatParentId, setAddSeatParentId] = useState<string>('');
  const [newSeatTitle, setNewSeatTitle] = useState('');

  const [removeSeatOpen, setRemoveSeatOpen] = useState(false);
  const [removeSeatId, setRemoveSeatId] = useState<string>('');
  const [removeSeatTitle, setRemoveSeatTitle] = useState('');

  const [moveSeatOpen, setMoveSeatOpen] = useState(false);
  const [moveSeatId, setMoveSeatId] = useState<string>('');
  const [moveTargetParentId, setMoveTargetParentId] = useState<string>('');

  const [reassignOpen, setReassignOpen] = useState(false);
  const [reassignSeatId, setReassignSeatId] = useState<string>('');
  const [reassignPersonName, setReassignPersonName] = useState<string>('');

  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [addSkillSeatId, setAddSkillSeatId] = useState<string>('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>('Learning');

  // AI Seat Builder
  const [aiBuilderOpen, setAiBuilderOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState<{ responsibilities: string[]; skills: Skill[]; parentTitle: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Seat detail panel
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  // Computed
  const totalSeats = countSeats(orgChart);
  const openSeats = countOpenSeats(orgChart);
  const filledSeats = totalSeats - openSeats;
  const departments = useMemo(() => getDepartments(orgChart), [orgChart]);

  const displayChart = useMemo(() => {
    if (viewMode === 'department' && selectedDepartment) {
      return filterByDepartment(orgChart, selectedDepartment) ?? orgChart;
    }
    return orgChart;
  }, [orgChart, viewMode, selectedDepartment]);

  // ---------------------------------------------------------------------------
  // Draft mode handlers
  // ---------------------------------------------------------------------------

  const enterDraft = useCallback(() => {
    setDraftSnapshot(cloneSeat(orgChart));
    setIsDraft(true);
    setDraftChanges(new Set());
    toast.info('Draft mode enabled. Changes are highlighted.');
  }, [orgChart]);

  const publishDraft = useCallback(() => {
    setIsDraft(false);
    setDraftSnapshot(null);
    setDraftChanges(new Set());
    toast.success('Draft published successfully!');
  }, []);

  const discardDraft = useCallback(() => {
    if (draftSnapshot) {
      setOrgChart(draftSnapshot);
    }
    setIsDraft(false);
    setDraftSnapshot(null);
    setDraftChanges(new Set());
    toast('Draft discarded. Changes reverted.');
  }, [draftSnapshot]);

  // ---------------------------------------------------------------------------
  // Mutation helper (tracks draft changes)
  // ---------------------------------------------------------------------------

  const applyMutation = useCallback(
    (newChart: Seat, changedIds: string[]) => {
      setOrgChart(newChart);
      if (isDraft) {
        setDraftChanges((prev) => {
          const next = new Set(prev);
          changedIds.forEach((id) => next.add(id));
          return next;
        });
      }
    },
    [isDraft]
  );

  // ---------------------------------------------------------------------------
  // Node collapse
  // ---------------------------------------------------------------------------

  const toggleNodeCollapse = useCallback((id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Card expand
  // ---------------------------------------------------------------------------

  const toggleExpandCard = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Add seat
  // ---------------------------------------------------------------------------

  const handleAddSeatOpen = useCallback((parentId: string) => {
    setAddSeatParentId(parentId);
    setNewSeatTitle('');
    setAddSeatOpen(true);
  }, []);

  const handleAddSeat = useCallback(() => {
    if (!newSeatTitle.trim()) return;
    const newId = `seat-${Date.now()}`;
    const newSeat: Seat = {
      id: newId,
      title: newSeatTitle.trim(),
      person: undefined,
      responsibilities: ['Define core responsibilities'],
      roleCount: 1,
      skills: [],
      kpis: [],
      department: '',
    };
    const updated = addChildSeat(orgChart, addSeatParentId, newSeat);
    applyMutation(updated, [newId, addSeatParentId]);
    setAddSeatOpen(false);
    toast.success(`Seat "${newSeatTitle.trim()}" added`);
  }, [orgChart, addSeatParentId, newSeatTitle, applyMutation]);

  // Top-level add seat (adds under root)
  const handleTopLevelAddSeat = useCallback(() => {
    setAddSeatParentId(orgChart.id);
    setNewSeatTitle('');
    setAddSeatOpen(true);
  }, [orgChart.id]);

  // ---------------------------------------------------------------------------
  // Remove seat
  // ---------------------------------------------------------------------------

  const handleRemoveSeatOpen = useCallback(
    (seatId: string) => {
      const allSeats = flattenSeats(orgChart);
      const seat = allSeats.find((s) => s.id === seatId);
      if (seatId === orgChart.id) {
        toast.error('Cannot remove the root seat');
        return;
      }
      setRemoveSeatId(seatId);
      setRemoveSeatTitle(seat?.title ?? seatId);
      setRemoveSeatOpen(true);
    },
    [orgChart]
  );

  const handleRemoveSeat = useCallback(() => {
    const updated = removeSeatById(orgChart, removeSeatId);
    applyMutation(updated, [removeSeatId]);
    setRemoveSeatOpen(false);
    toast.success(`Seat "${removeSeatTitle}" removed`);
  }, [orgChart, removeSeatId, removeSeatTitle, applyMutation]);

  // ---------------------------------------------------------------------------
  // Move seat
  // ---------------------------------------------------------------------------

  const handleMoveSeatOpen = useCallback((seatId: string) => {
    setMoveSeatId(seatId);
    setMoveTargetParentId('');
    setMoveSeatOpen(true);
  }, []);

  const handleMoveSeat = useCallback(() => {
    if (!moveTargetParentId || moveTargetParentId === moveSeatId) return;
    const updated = moveSeat(orgChart, moveSeatId, moveTargetParentId);
    applyMutation(updated, [moveSeatId, moveTargetParentId]);
    setMoveSeatOpen(false);
    toast.success('Seat moved successfully');
  }, [orgChart, moveSeatId, moveTargetParentId, applyMutation]);

  // ---------------------------------------------------------------------------
  // Reassign
  // ---------------------------------------------------------------------------

  const handleReassignOpen = useCallback((seatId: string) => {
    setReassignSeatId(seatId);
    setReassignPersonName('');
    setReassignOpen(true);
  }, []);

  const handleReassign = useCallback(() => {
    const person = allPeople.find((p) => p.name === reassignPersonName);
    const updated = updateSeatById(orgChart, reassignSeatId, (s) => {
      if (reassignPersonName === '__vacant__') {
        s.person = undefined;
      } else if (person) {
        s.person = { name: person.name, initials: person.initials };
      }
    });
    applyMutation(updated, [reassignSeatId]);
    setReassignOpen(false);
    toast.success(
      reassignPersonName === '__vacant__'
        ? 'Seat marked as vacant'
        : `Seat reassigned to ${reassignPersonName}`
    );
  }, [orgChart, reassignSeatId, reassignPersonName, applyMutation]);

  // ---------------------------------------------------------------------------
  // Add skill
  // ---------------------------------------------------------------------------

  const handleAddSkillOpen = useCallback((seatId: string) => {
    setAddSkillSeatId(seatId);
    setNewSkillName('');
    setNewSkillProficiency('Learning');
    setAddSkillOpen(true);
  }, []);

  const handleAddSkill = useCallback(() => {
    if (!newSkillName.trim()) return;
    const updated = updateSeatById(orgChart, addSkillSeatId, (s) => {
      s.skills.push({
        name: newSkillName.trim(),
        proficiency: newSkillProficiency,
      });
    });
    applyMutation(updated, [addSkillSeatId]);
    setAddSkillOpen(false);
    toast.success(`Skill "${newSkillName.trim()}" added`);
  }, [orgChart, addSkillSeatId, newSkillName, newSkillProficiency, applyMutation]);

  // ---------------------------------------------------------------------------
  // AI Seat Builder
  // ---------------------------------------------------------------------------

  const handleAiBuild = useCallback(() => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    // Simulate AI delay
    setTimeout(() => {
      const key = aiInput.toLowerCase().trim();
      const match =
        Object.entries(aiSuggestions).find(([k]) => key.includes(k))?.[1] ??
        aiSuggestions['default'];
      setAiResult(match);
      setAiLoading(false);
    }, 1500);
  }, [aiInput]);

  const handleApplyAiSuggestions = useCallback(() => {
    if (!aiResult) return;
    const newId = `seat-ai-${Date.now()}`;
    // Find the parent that matches the suggested parent title
    const allSeats = flattenSeats(orgChart);
    const parent = allSeats.find((s) => s.title === aiResult.parentTitle) ?? orgChart;

    const newSeat: Seat = {
      id: newId,
      title: aiInput.trim() || 'New Role',
      person: undefined,
      responsibilities: aiResult.responsibilities,
      roleCount: aiResult.responsibilities.length,
      skills: aiResult.skills,
      kpis: [],
      department: parent.department ?? '',
    };
    const updated = addChildSeat(orgChart, parent.id, newSeat);
    applyMutation(updated, [newId, parent.id]);
    setAiBuilderOpen(false);
    setAiInput('');
    setAiResult(null);
    toast.success(`AI-built seat "${newSeat.title}" added under ${parent.title}`);
  }, [orgChart, aiResult, aiInput, applyMutation]);

  // ---------------------------------------------------------------------------
  // PDF Export
  // ---------------------------------------------------------------------------

  const handleExportPDF = useCallback(() => {
    toast.success('PDF export started. Your download will begin shortly.', {
      duration: 3000,
    });
  }, []);

  // All seats for dropdowns
  const allSeats = useMemo(() => flattenSeats(orgChart), [orgChart]);

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
        <div className="flex flex-wrap items-center gap-2 relative z-20">
          {/* Draft mode controls */}
          {isDraft ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium bg-green-500/15 text-green-400 hover:bg-green-500/20"
                onClick={publishDraft}
              >
                <Check className="h-3.5 w-3.5" />
                Publish Draft
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/20"
                onClick={discardDraft}
              >
                <Undo2 className="h-3.5 w-3.5" />
                Discard Draft
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={enterDraft}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Draft
            </Button>
          )}

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
            onClick={handleTopLevelAddSeat}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Seat
          </Button>

          {/* AI Seat Builder */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-purple-400 hover:bg-purple-500/15"
            onClick={() => {
              setAiBuilderOpen(true);
              setAiInput('');
              setAiResult(null);
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Build Seat
            <span className="ml-0.5 rounded bg-purple-500/20 px-1 py-0.5 text-[8px] font-bold text-purple-500 uppercase tracking-wider">
              Beta
            </span>
          </Button>

          {/* PDF Export */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            onClick={handleExportPDF}
          >
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Draft mode banner */}
      {isDraft && (
        <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center gap-3 relative z-10">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20">
            <Pencil className="h-3 w-3 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-400">Draft Mode Active</p>
            <p className="text-[10px] text-amber-400/60">
              Changes are highlighted in amber. Publish to make them live, or discard to revert.
            </p>
          </div>
          <div className="ml-auto text-[10px] text-amber-400/60">
            {draftChanges.size} change{draftChanges.size !== 1 ? 's' : ''}
          </div>
        </div>
      )}

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
            <span className="h-2 w-2 rounded-full border border-border bg-transparent" />
            <span className="text-sm font-medium text-amber-400">{openSeats}</span>
            <span className="text-xs text-muted-foreground">Open</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-sm font-medium text-foreground">{departments.length}</span>
            <span className="text-xs text-muted-foreground">Departments</span>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between relative z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsGlobalCollapsed(!isGlobalCollapsed);
              if (!isGlobalCollapsed) {
                setCollapsedNodes(new Set());
              }
            }}
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {isGlobalCollapsed ? 'Expand All' : 'Collapse All'}
          </Button>

          {/* Department view toggle */}
          <div className="flex items-center gap-1 border-l border-border pl-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 rounded-lg px-3 text-xs ${
                viewMode === 'full'
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => {
                setViewMode('full');
                setSelectedDepartment('');
              }}
            >
              Full Org
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 gap-1.5 rounded-lg px-3 text-xs ${
                viewMode === 'department'
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setViewMode('department')}
            >
              <Filter className="h-3 w-3" />
              Department
            </Button>
            {viewMode === 'department' && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none focus:border-ring"
              >
                <option value="">Select department...</option>
                {departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            )}
          </div>
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
      <div className="glass rounded-xl overflow-x-auto p-8 relative z-0">
        <div
          className="flex justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <OrgBranch
            seat={displayChart}
            editMode={editMode}
            globalCollapsed={isGlobalCollapsed}
            collapsedNodes={collapsedNodes}
            toggleNodeCollapse={toggleNodeCollapse}
            isDraft={isDraft}
            draftChanges={draftChanges}
            orgRoot={orgChart}
            onAddChild={handleAddSeatOpen}
            onRemove={handleRemoveSeatOpen}
            onMoveSeat={handleMoveSeatOpen}
            onReassign={handleReassignOpen}
            onAddSkill={handleAddSkillOpen}
            expandedCards={expandedCards}
            onExpandCard={toggleExpandCard}
            onSelectSeat={setSelectedSeat}
          />
        </div>
      </div>

      {/* ====================================================================
          DIALOGS
          ==================================================================== */}

      {/* Add Seat Dialog */}
      <Dialog open={addSeatOpen} onOpenChange={setAddSeatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Seat</DialogTitle>
            <DialogDescription>
              Create a new seat under the selected parent node.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Seat Title
              </label>
              <Input
                placeholder="e.g., Project Coordinator"
                value={newSeatTitle}
                onChange={(e) => setNewSeatTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSeat()}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Parent: {allSeats.find((s) => s.id === addSeatParentId)?.title ?? 'Root'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddSeatOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddSeat} disabled={!newSeatTitle.trim()}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Seat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Seat Dialog */}
      <Dialog open={removeSeatOpen} onOpenChange={setRemoveSeatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Seat</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &ldquo;{removeSeatTitle}&rdquo;? This will also remove all child seats.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRemoveSeatOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleRemoveSeat}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Seat Dialog */}
      <Dialog open={moveSeatOpen} onOpenChange={setMoveSeatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move Seat</DialogTitle>
            <DialogDescription>
              Select a new parent for &ldquo;{allSeats.find((s) => s.id === moveSeatId)?.title}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              New Parent
            </label>
            <select
              value={moveTargetParentId}
              onChange={(e) => setMoveTargetParentId(e.target.value)}
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none focus:border-ring"
            >
              <option value="">Select parent...</option>
              {allSeats
                .filter((s) => s.id !== moveSeatId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} {s.person ? `(${s.person.name})` : '(Open)'}
                  </option>
                ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMoveSeatOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleMoveSeat} disabled={!moveTargetParentId}>
              <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Person Dialog */}
      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Seat</DialogTitle>
            <DialogDescription>
              Choose who should fill this seat, or mark it as vacant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Person
            </label>
            <select
              value={reassignPersonName}
              onChange={(e) => setReassignPersonName(e.target.value)}
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2 text-xs text-foreground outline-none focus:border-ring"
            >
              <option value="">Select person...</option>
              <option value="__vacant__">-- Mark as Vacant --</option>
              {allPeople.map((p) => {
                const seatCount = getPersonSeatCount(orgChart, p.name);
                return (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.initials}){seatCount > 0 ? ` [${seatCount} seat${seatCount > 1 ? 's' : ''}]` : ''}
                  </option>
                );
              })}
            </select>
            {reassignPersonName &&
              reassignPersonName !== '__vacant__' &&
              getPersonSeatCount(orgChart, reassignPersonName) >= 2 && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  This person already holds {getPersonSeatCount(orgChart, reassignPersonName)} seats. Assigning another may overload them.
                </div>
              )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReassign} disabled={!reassignPersonName}>
              <User className="h-3.5 w-3.5 mr-1" />
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Skill Dialog */}
      <Dialog open={addSkillOpen} onOpenChange={setAddSkillOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>
              Add a skill to this seat with a proficiency level.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Skill Name
              </label>
              <Input
                placeholder="e.g., Blueprint Reading"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Proficiency
              </label>
              <div className="flex gap-2">
                {(['Learning', 'Proficient', 'Expert'] as SkillProficiency[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setNewSkillProficiency(level)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all ${
                      newSkillProficiency === level
                        ? proficiencyColor(level)
                        : 'border-border text-muted-foreground hover:border-foreground/20'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddSkill} disabled={!newSkillName.trim()}>
              <Award className="h-3.5 w-3.5 mr-1" />
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seat Detail Side Panel */}
      {selectedSeat && (
        <div className="fixed inset-y-0 right-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedSeat(null)} />
          <div className="relative ml-auto w-full max-w-md bg-background/95 border-l border-border backdrop-blur-xl shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedSeat.title}</h2>
                  {selectedSeat.department && (
                    <Badge variant="outline" className="mt-1 text-[10px] border-border text-muted-foreground">
                      {selectedSeat.department}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSeat(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Person */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                {selectedSeat.person ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-primary">
                      {selectedSeat.person.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{selectedSeat.person.name}</p>
                      {selectedSeat.tenure && (
                        <p className="text-[11px] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          Tenure: {selectedSeat.tenure}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-border">
                      <User className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm italic text-muted-foreground">Open Seat</p>
                  </>
                )}
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" />
                  Responsibilities
                </h3>
                <ul className="space-y-1.5">
                  {selectedSeat.responsibilities.map((r, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400/60 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              {selectedSeat.skills.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="h-3 w-3" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeat.skills.map((skill, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${proficiencyColor(skill.proficiency)}`}
                      >
                        {skill.linkedKB && <BookOpen className="h-2.5 w-2.5" />}
                        {skill.name}
                        <span className="opacity-60">({skill.proficiency})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* KPIs */}
              {selectedSeat.kpis.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-3 w-3" />
                    KPIs
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSeat.kpis.map((kpi, i) => (
                      <span key={i} className="text-xs text-foreground bg-muted/50 rounded-lg px-2.5 py-1">
                        {kpi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Reports */}
              <div>
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Network className="h-3 w-3" />
                  Direct Reports
                </h3>
                {selectedSeat.children && selectedSeat.children.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedSeat.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedSeat(child)}
                        className="flex w-full items-center gap-2.5 rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted transition-colors text-left"
                      >
                        {child.person ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-semibold text-primary">
                            {child.person.initials}
                          </div>
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border">
                            <User className="h-3 w-3 text-muted-foreground/50" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-foreground">{child.title}</p>
                          <p className="text-[10px] text-muted-foreground">{child.person?.name ?? 'Open Seat'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60">No direct reports</p>
                )}
              </div>

              {/* Roles count */}
              <div className="text-xs text-muted-foreground/60 pt-2 border-t border-border">
                {selectedSeat.roleCount} Roles assigned to this seat
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Seat Builder Dialog */}
      <Dialog open={aiBuilderOpen} onOpenChange={setAiBuilderOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Seat Builder
              <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-bold text-purple-500 uppercase tracking-wider">
                Beta
              </span>
            </DialogTitle>
            <DialogDescription>
              Describe the role or department need, and AI will suggest responsibilities, skills, and reporting structure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Seat Title or Department Need
              </label>
              <Input
                placeholder="e.g., Project Coordinator, Social Media Manager"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiBuild()}
              />
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleAiBuild}
              disabled={!aiInput.trim() || aiLoading}
            >
              {aiLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate Suggestions
                </>
              )}
            </Button>

            {/* AI Results */}
            {aiResult && (
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-1">
                    Suggested Responsibilities
                  </p>
                  <ul className="space-y-0.5">
                    {aiResult.responsibilities.map((r, i) => (
                      <li key={i} className="text-xs text-foreground before:mr-1.5 before:content-['\2022'] before:text-purple-400/50">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-1">
                    Required Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.skills.map((skill, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-medium ${proficiencyColor(skill.proficiency)}`}
                      >
                        {skill.name} ({skill.proficiency})
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-1">
                    Reports To
                  </p>
                  <p className="text-xs text-foreground">{aiResult.parentTitle}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAiBuilderOpen(false);
                setAiResult(null);
              }}
            >
              Cancel
            </Button>
            {aiResult && (
              <Button
                size="sm"
                className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700"
                onClick={handleApplyAiSuggestions}
              >
                <Send className="h-3.5 w-3.5" />
                Apply Suggestions
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
