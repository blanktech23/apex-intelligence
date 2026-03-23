'use client';

import { useState, useCallback } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Download,
  Play,
  Calendar,
  ClipboardList,
  ArrowUpDown,
  X,
  User,
  MessageSquare,
  BarChart3,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CVRating = '+' | '+/-' | '-';
type CCCRating = boolean;
type Trend = 'up' | 'down' | 'stable';
type FitStatus = 'right-right' | 'right-wrong' | 'wrong';
type SortKey = 'name' | 'status' | 'integrity' | 'quality' | 'team-first' | 'own-it' | 'innovate';

interface QuarterlyScore {
  quarter: string;
  cvAvg: number; // 0-100 scale for chart
  cccPass: number; // 0-3
}

interface PersonFitData {
  id: string;
  name: string;
  initials: string;
  role: string;
  seatTitle: string;
  team: string;
  coreValues: {
    'Integrity First': CVRating;
    'Relentless Quality': CVRating;
    'Team Over Individual': CVRating;
    'Own It': CVRating;
    'Innovate or Stagnate': CVRating;
  };
  coreValueTrends: {
    'Integrity First': Trend;
    'Relentless Quality': Trend;
    'Team Over Individual': Trend;
    'Own It': Trend;
    'Innovate or Stagnate': Trend;
  };
  ccc: {
    competency: CCCRating;
    commitment: CCCRating;
    capacity: CCCRating;
  };
  cccNotes: {
    competency: string;
    commitment: string;
    capacity: string;
  };
  fitStatus: FitStatus;
  managerNotes: string;
  actionItems: string[];
  lastAssessed: string;
  quarterlyHistory: QuarterlyScore[];
}

// ---------------------------------------------------------------------------
// Core Values List
// ---------------------------------------------------------------------------

const coreValueNames = [
  'Integrity First',
  'Relentless Quality',
  'Team Over Individual',
  'Own It',
  'Innovate or Stagnate',
] as const;

type CoreValueName = (typeof coreValueNames)[number];

const cvSortKeyMap: Record<string, CoreValueName> = {
  integrity: 'Integrity First',
  quality: 'Relentless Quality',
  'team-first': 'Team Over Individual',
  'own-it': 'Own It',
  innovate: 'Innovate or Stagnate',
};

// ---------------------------------------------------------------------------
// Mock Data -- 12 team members with varied scores
// ---------------------------------------------------------------------------

const teamMembers: PersonFitData[] = [
  {
    id: 'fc-001',
    name: 'Joseph Wells',
    initials: 'JW',
    role: 'Strategic Leader / CEO',
    seatTitle: 'Visionary',
    team: 'Leadership',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+', 'Innovate or Stagnate': '+' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'up', 'Team Over Individual': 'stable', 'Own It': 'stable', 'Innovate or Stagnate': 'up' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Strong strategic vision and execution ability', commitment: 'Fully committed to company mission', capacity: 'Managing workload effectively with delegation' },
    fitStatus: 'right-right',
    managerNotes: 'Exemplary leadership across all dimensions. Continue developing next-gen leaders.',
    actionItems: [],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 95, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 95, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 100, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 100, cccPass: 3 },
    ],
  },
  {
    id: 'fc-002',
    name: 'Sarah Chen',
    initials: 'SC',
    role: 'VP of Sales & Marketing',
    seatTitle: 'Sales Leader',
    team: 'Sales',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+/-', 'Innovate or Stagnate': '+' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'stable', 'Team Over Individual': 'up', 'Own It': 'up', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Exceeds targets consistently', commitment: 'Highly engaged and proactive', capacity: 'Could delegate more to prevent burnout' },
    fitStatus: 'right-right',
    managerNotes: 'Strong performer. Working on delegation skills to sustain capacity.',
    actionItems: ['Delegate 2 accounts to junior reps by Q2'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 85, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 90, cccPass: 3 },
    ],
  },
  {
    id: 'fc-003',
    name: 'Mike Torres',
    initials: 'MT',
    role: 'VP of Operations',
    seatTitle: 'Operations Leader',
    team: 'Operations',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+', 'Innovate or Stagnate': '+/-' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'stable', 'Team Over Individual': 'stable', 'Own It': 'stable', 'Innovate or Stagnate': 'down' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Deep operational expertise', commitment: 'Reliable and consistent', capacity: 'Well-organized, manages team effectively' },
    fitStatus: 'right-right',
    managerNotes: 'Solid operator. Encourage adoption of newer tools and processes.',
    actionItems: ['Explore 2 new process improvement tools by end of Q2'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 85, cccPass: 3 },
    ],
  },
  {
    id: 'fc-004',
    name: 'David Kim',
    initials: 'DK',
    role: 'Controller / Finance',
    seatTitle: 'Finance Leader',
    team: 'Finance',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+/-', 'Team Over Individual': '+/-', 'Own It': '+', 'Innovate or Stagnate': '-' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'down', 'Team Over Individual': 'down', 'Own It': 'stable', 'Innovate or Stagnate': 'down' },
    ccc: { competency: true, commitment: true, capacity: false },
    cccNotes: { competency: 'Strong financial acumen', commitment: 'Dedicated but showing signs of frustration', capacity: 'Overwhelmed with growing team workload' },
    fitStatus: 'right-wrong',
    managerNotes: 'Right person but seat may need restructuring. Finance team has grown beyond a single controller role. Consider splitting into Controller + Finance Manager.',
    actionItems: ['Hire AP/AR lead to reduce David\'s direct reports', 'Restructure finance team org chart by Q2', 'Schedule bi-weekly 1-on-1 to monitor capacity'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 80, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 75, cccPass: 2 },
      { quarter: 'Q4 2025', cvAvg: 70, cccPass: 2 },
      { quarter: 'Q1 2026', cvAvg: 65, cccPass: 2 },
    ],
  },
  {
    id: 'fc-005',
    name: 'Lisa Park',
    initials: 'LP',
    role: 'HR / People Director',
    seatTitle: 'People Leader',
    team: 'HR',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+', 'Innovate or Stagnate': '+' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'up', 'Team Over Individual': 'stable', 'Own It': 'stable', 'Innovate or Stagnate': 'up' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Excellent people skills and HR knowledge', commitment: 'Deeply invested in company culture', capacity: 'Efficient with current team size' },
    fitStatus: 'right-right',
    managerNotes: 'Cornerstone team member. Key driver of culture and retention improvements.',
    actionItems: [],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 95, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 95, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 100, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 100, cccPass: 3 },
    ],
  },
  {
    id: 'fc-006',
    name: 'Carlos Rivera',
    initials: 'CR',
    role: 'Integrator / COO',
    seatTitle: 'Integrator',
    team: 'Leadership',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+', 'Innovate or Stagnate': '+' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'stable', 'Team Over Individual': 'up', 'Own It': 'stable', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Exceptional at cross-functional coordination', commitment: 'Lives the Business OS framework daily', capacity: 'Manages complexity well' },
    fitStatus: 'right-right',
    managerNotes: 'Ideal integrator. Keeps the entire organization aligned and accountable.',
    actionItems: [],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 95, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 100, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 100, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 100, cccPass: 3 },
    ],
  },
  {
    id: 'fc-007',
    name: 'Ryan Nakamura',
    initials: 'RN',
    role: 'Lead Estimator',
    seatTitle: 'Estimating Lead',
    team: 'Sales',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+/-', 'Team Over Individual': '+/-', 'Own It': '+/-', 'Innovate or Stagnate': '+' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'down', 'Team Over Individual': 'stable', 'Own It': 'down', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Accurate estimating, strong technical knowledge', commitment: 'Shows up consistently', capacity: 'Handles current volume well' },
    fitStatus: 'right-right',
    managerNotes: 'Core values trending down slightly. Schedule coaching session to address quality and ownership.',
    actionItems: ['1-on-1 coaching on estimate review process', 'Pair with Sarah on client follow-up protocols'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 85, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 80, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 75, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 70, cccPass: 3 },
    ],
  },
  {
    id: 'fc-008',
    name: 'Kim Lee',
    initials: 'KL',
    role: 'Project Manager',
    seatTitle: 'PM Lead',
    team: 'Operations',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+', 'Innovate or Stagnate': '+/-' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'stable', 'Team Over Individual': 'stable', 'Own It': 'up', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Excellent project delivery track record', commitment: 'Dependable and thorough', capacity: 'Currently on leave but manages well when active' },
    fitStatus: 'right-right',
    managerNotes: 'Reliable PM. Continue to encourage adoption of new PM tools.',
    actionItems: [],
    lastAssessed: '2026-02-15',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 90, cccPass: 3 },
    ],
  },
  {
    id: 'fc-009',
    name: 'Dan Parker',
    initials: 'DP',
    role: 'Site Superintendent',
    seatTitle: 'Field Lead',
    team: 'Operations',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+/-', 'Own It': '+', 'Innovate or Stagnate': '-' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'stable', 'Team Over Individual': 'down', 'Own It': 'stable', 'Innovate or Stagnate': 'down' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Best field superintendent in the company', commitment: 'First on site, last to leave', capacity: 'Thrives on job sites' },
    fitStatus: 'right-right',
    managerNotes: 'Exceptional in the field. Needs coaching on team collaboration and openness to new methods.',
    actionItems: ['Attend team collaboration workshop', 'Shadow Kim Lee on new digital tools for 2 weeks'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 80, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 80, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 75, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 75, cccPass: 3 },
    ],
  },
  {
    id: 'fc-010',
    name: 'Maria Gonzalez',
    initials: 'MG',
    role: 'AP/AR Specialist',
    seatTitle: 'AP/AR Specialist',
    team: 'Finance',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+', 'Team Over Individual': '+', 'Own It': '+', 'Innovate or Stagnate': '+/-' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'stable', 'Team Over Individual': 'up', 'Own It': 'stable', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: true, commitment: true, capacity: true },
    cccNotes: { competency: 'Accurate and efficient with financial transactions', commitment: 'Consistent and reliable', capacity: 'Handles volume well' },
    fitStatus: 'right-right',
    managerNotes: 'Solid contributor. Growing into a potential team lead role.',
    actionItems: [],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q3 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q4 2025', cvAvg: 90, cccPass: 3 },
      { quarter: 'Q1 2026', cvAvg: 90, cccPass: 3 },
    ],
  },
  {
    id: 'fc-011',
    name: 'James Taylor',
    initials: 'JT',
    role: 'Payroll Administrator',
    seatTitle: 'Payroll Lead',
    team: 'Finance',
    coreValues: { 'Integrity First': '+/-', 'Relentless Quality': '-', 'Team Over Individual': '-', 'Own It': '+/-', 'Innovate or Stagnate': '-' },
    coreValueTrends: { 'Integrity First': 'down', 'Relentless Quality': 'down', 'Team Over Individual': 'down', 'Own It': 'down', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: false, commitment: false, capacity: true },
    cccNotes: { competency: 'Multiple payroll errors in last 2 quarters', commitment: 'Disengaged, missing deadlines frequently', capacity: 'Has the bandwidth but not applying it' },
    fitStatus: 'wrong',
    managerNotes: 'Serious performance concerns. Core values misalignment across multiple dimensions. On formal improvement plan since January. If no improvement by end of Q1, recommend transition out.',
    actionItems: ['30-day formal improvement plan review', 'Weekly check-ins with David Kim', 'Payroll accuracy audit for March', 'Decision checkpoint: April 1'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 60, cccPass: 2 },
      { quarter: 'Q3 2025', cvAvg: 50, cccPass: 1 },
      { quarter: 'Q4 2025', cvAvg: 40, cccPass: 1 },
      { quarter: 'Q1 2026', cvAvg: 30, cccPass: 1 },
    ],
  },
  {
    id: 'fc-012',
    name: 'Tom Bradley',
    initials: 'TB',
    role: 'IT / Systems Admin',
    seatTitle: 'IT Lead',
    team: 'Operations',
    coreValues: { 'Integrity First': '+', 'Relentless Quality': '+/-', 'Team Over Individual': '+/-', 'Own It': '+/-', 'Innovate or Stagnate': '+' },
    coreValueTrends: { 'Integrity First': 'stable', 'Relentless Quality': 'up', 'Team Over Individual': 'up', 'Own It': 'up', 'Innovate or Stagnate': 'stable' },
    ccc: { competency: true, commitment: true, capacity: false },
    cccNotes: { competency: 'Strong technical skills across all systems', commitment: 'Engaged and improving', capacity: 'IT scope has expanded beyond one person' },
    fitStatus: 'right-wrong',
    managerNotes: 'Right person, but seat needs redefinition. IT demands have outgrown a single admin role. Need to either hire support or narrow scope.',
    actionItems: ['Define IT support ticket SLA', 'Budget request for part-time IT assistant', 'Prioritize top 3 systems for Tom to own exclusively'],
    lastAssessed: '2026-03-01',
    quarterlyHistory: [
      { quarter: 'Q2 2025', cvAvg: 65, cccPass: 2 },
      { quarter: 'Q3 2025', cvAvg: 70, cccPass: 2 },
      { quarter: 'Q4 2025', cvAvg: 75, cccPass: 2 },
      { quarter: 'Q1 2026', cvAvg: 75, cccPass: 2 },
    ],
  },
];

const teams = ['All Teams', 'Leadership', 'Sales', 'Operations', 'Finance', 'HR'];
const statusFilters = ['All', 'At Risk', 'Action Required'] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cvRatingScore(r: CVRating): number {
  return r === '+' ? 2 : r === '+/-' ? 1 : 0;
}

function personCVScore(p: PersonFitData): number {
  return Object.values(p.coreValues).reduce((s, r) => s + cvRatingScore(r), 0);
}

function fitStatusLabel(s: FitStatus): string {
  return s === 'right-right' ? 'Right Person, Right Seat' : s === 'right-wrong' ? 'Right Person, Wrong Seat' : 'Wrong Person';
}

function fitStatusConfig(s: FitStatus) {
  return s === 'right-right'
    ? { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-400/10', ring: 'ring-green-400/20', label: 'Right Person, Right Seat' }
    : s === 'right-wrong'
      ? { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-400/10', ring: 'ring-amber-400/20', label: 'Right Person, Wrong Seat' }
      : { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-400/10', ring: 'ring-red-400/20', label: 'Wrong Person' };
}

function cvRatingColor(r: CVRating) {
  return r === '+' ? 'text-green-600 dark:text-green-400 bg-green-400/10 ring-green-400/30' : r === '+/-' ? 'text-amber-600 dark:text-amber-400 bg-amber-400/10 ring-amber-400/30' : 'text-red-600 dark:text-red-400 bg-red-400/10 ring-red-400/30';
}

function trendIcon(t: Trend) {
  return t === 'up' ? TrendingUp : t === 'down' ? TrendingDown : Minus;
}

function trendColor(t: Trend) {
  return t === 'up' ? 'text-green-600 dark:text-green-400' : t === 'down' ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground';
}

// ---------------------------------------------------------------------------
// Mini bar chart component (SVG)
// ---------------------------------------------------------------------------

function MiniChart({ data }: { data: QuarterlyScore[] }) {
  const maxH = 32;
  const barW = 14;
  const gap = 4;
  const totalW = data.length * (barW + gap) - gap;

  return (
    <svg width={totalW} height={maxH + 16} className="overflow-visible">
      {data.map((d, i) => {
        const h = (d.cvAvg / 100) * maxH;
        const color = d.cvAvg >= 80 ? '#4ade80' : d.cvAvg >= 60 ? '#fbbf24' : '#f87171';
        return (
          <g key={d.quarter}>
            <rect
              x={i * (barW + gap)}
              y={maxH - h}
              width={barW}
              height={h}
              rx={2}
              fill={color}
              opacity={0.7}
            />
            <text
              x={i * (barW + gap) + barW / 2}
              y={maxH + 12}
              textAnchor="middle"
              className="fill-muted-foreground"
              fontSize={7}
            >
              {d.quarter.replace('Q', '').replace(' 20', "'")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Heat map for team health
// ---------------------------------------------------------------------------

function TeamHeatMap({ members }: { members: PersonFitData[] }) {
  return (
    <div className="overflow-x-auto">
      <svg width={Math.max(members.length * 28 + 120, 460)} height={coreValueNames.length * 28 + 30}>
        {/* Column headers (people) */}
        {members.map((m, ci) => (
          <text
            key={m.id}
            x={120 + ci * 28 + 14}
            y={12}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={8}
          >
            {m.initials}
          </text>
        ))}
        {/* Rows */}
        {coreValueNames.map((cv, ri) => (
          <g key={cv}>
            <text
              x={0}
              y={28 + ri * 28 + 14}
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {cv.length > 16 ? cv.slice(0, 16) + '...' : cv}
            </text>
            {members.map((m, ci) => {
              const rating = m.coreValues[cv];
              const color = rating === '+' ? '#4ade80' : rating === '+/-' ? '#fbbf24' : '#f87171';
              return (
                <rect
                  key={m.id}
                  x={120 + ci * 28}
                  y={28 + ri * 28}
                  width={24}
                  height={24}
                  rx={4}
                  fill={color}
                  opacity={0.25}
                  stroke={color}
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
              );
            })}
          </g>
        ))}
        {/* Cell text */}
        {coreValueNames.map((cv, ri) =>
          members.map((m, ci) => {
            const rating = m.coreValues[cv];
            const color = rating === '+' ? '#4ade80' : rating === '+/-' ? '#fbbf24' : '#f87171';
            return (
              <text
                key={`${m.id}-${cv}`}
                x={120 + ci * 28 + 12}
                y={28 + ri * 28 + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize={9}
                fontWeight={600}
              >
                {rating}
              </text>
            );
          })
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Department comparison bar chart
// ---------------------------------------------------------------------------

function DepartmentChart({ members }: { members: PersonFitData[] }) {
  const depts = ['Leadership', 'Sales', 'Operations', 'Finance', 'HR'];
  const deptScores = depts.map((d) => {
    const deptMembers = members.filter((m) => m.team === d);
    if (deptMembers.length === 0) return { dept: d, avg: 0, count: 0 };
    const avg = deptMembers.reduce((s, m) => s + personCVScore(m), 0) / deptMembers.length;
    return { dept: d, avg: (avg / 10) * 100, count: deptMembers.length };
  });
  const maxScore = 100;
  const barH = 20;
  const gap = 8;

  return (
    <svg width="100%" height={deptScores.length * (barH + gap) + 10} className="overflow-visible">
      {deptScores.map((d, i) => {
        const w = `${(d.avg / maxScore) * 70}%`;
        const color = d.avg >= 80 ? '#4ade80' : d.avg >= 60 ? '#fbbf24' : '#f87171';
        return (
          <g key={d.dept}>
            <text
              x={0}
              y={i * (barH + gap) + barH / 2 + 4}
              className="fill-muted-foreground"
              fontSize={10}
            >
              {d.dept}
            </text>
            <rect
              x="25%"
              y={i * (barH + gap)}
              width={w}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.3}
            />
            <rect
              x="25%"
              y={i * (barH + gap)}
              width={w}
              height={barH}
              rx={4}
              fill="none"
              stroke={color}
              strokeWidth={1}
              strokeOpacity={0.6}
            />
            <text
              x="25%"
              dx={8}
              y={i * (barH + gap) + barH / 2 + 4}
              fill={color}
              fontSize={10}
              fontWeight={600}
            >
              {Math.round(d.avg)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Fit Check Wizard Modal
// ---------------------------------------------------------------------------

function FitCheckWizard({
  person,
  onClose,
  onSave,
}: {
  person: PersonFitData;
  onClose: () => void;
  onSave: (data: { cvRatings: Record<CoreValueName, CVRating>; ccc: Record<string, boolean>; notes: string }) => void;
}) {
  const [step, setStep] = useState(0); // 0-4 = core values, 5 = CCC, 6 = notes/summary
  const [cvRatings, setCvRatings] = useState<Record<CoreValueName, CVRating>>({ ...person.coreValues });
  const [ccc, setCcc] = useState({ competency: person.ccc.competency, commitment: person.ccc.commitment, capacity: person.ccc.capacity });
  const [notes, setNotes] = useState('');

  const totalSteps = 7;
  const isCV = step < 5;
  const isCCC = step === 5;
  const isSummary = step === 6;

  const currentCV = isCV ? coreValueNames[step] : null;

  const cycleRating = (current: CVRating): CVRating => {
    return current === '+' ? '+/-' : current === '+/-' ? '-' : '+';
  };

  const rightPerson = Object.values(cvRatings).filter((r) => r === '-').length === 0;
  const rightSeat = ccc.competency && ccc.commitment && ccc.capacity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass mx-4 w-full max-w-lg rounded-2xl border border-border/50 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
              {person.initials}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Fit Check: {person.name}</h3>
              <p className="text-xs text-muted-foreground">{person.seatTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i < step ? 'bg-green-400' : i === step ? 'bg-indigo-400' : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
        <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Step {step + 1} of {totalSteps}
          {isCV && ` — Core Value`}
          {isCCC && ` — CCC Assessment`}
          {isSummary && ` — Summary`}
        </p>

        {/* Core Value Step */}
        {isCV && currentCV && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">{currentCV}</h4>
            <p className="text-xs text-muted-foreground">
              Does {person.name.split(' ')[0]} consistently demonstrate this core value?
            </p>
            <div className="flex items-center gap-3">
              {(['+', '+/-', '-'] as CVRating[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setCvRatings((prev) => ({ ...prev, [currentCV]: r }))}
                  className={`flex h-16 flex-1 items-center justify-center rounded-xl text-lg font-bold ring-1 transition-all ${
                    cvRatings[currentCV] === r
                      ? cvRatingColor(r) + ' ring-2 scale-105'
                      : 'bg-muted/20 text-muted-foreground ring-border/30 hover:bg-muted/40'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
              <span className="text-green-600 dark:text-green-400">+</span> = Consistently demonstrates
              <span className="mx-1 text-amber-600 dark:text-amber-400">+/-</span> = Sometimes demonstrates
              <span className="mx-1 text-red-600 dark:text-red-400">-</span> = Does not demonstrate
            </div>
          </div>
        )}

        {/* CCC Step */}
        {isCCC && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">CCC Assessment</h4>
            <p className="text-xs text-muted-foreground">
              Does {person.name.split(' ')[0]} have the Competency, Commitment, and Capacity for this seat?
            </p>
            {(['competency', 'commitment', 'capacity'] as const).map((dim) => (
              <button
                key={dim}
                onClick={() => setCcc((prev) => ({ ...prev, [dim]: !prev[dim] }))}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 ring-1 transition-all ${
                  ccc[dim]
                    ? 'bg-green-400/10 text-green-600 dark:text-green-400 ring-green-400/30'
                    : 'bg-red-400/10 text-red-600 dark:text-red-400 ring-red-400/30'
                }`}
              >
                <span className="text-sm font-medium capitalize">{dim}</span>
                <span className="text-sm font-bold">{ccc[dim] ? 'Yes' : 'No'}</span>
              </button>
            ))}
          </div>
        )}

        {/* Summary Step */}
        {isSummary && (
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-foreground">Assessment Summary</h4>

            {/* CV results */}
            <div className="rounded-xl bg-foreground/[0.03] p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Core Values</p>
              {coreValueNames.map((cv) => (
                <div key={cv} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{cv}</span>
                  <span className={`font-bold ${cvRatings[cv] === '+' ? 'text-green-600 dark:text-green-400' : cvRatings[cv] === '+/-' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                    {cvRatings[cv]}
                  </span>
                </div>
              ))}
            </div>

            {/* CCC results */}
            <div className="rounded-xl bg-foreground/[0.03] p-3 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">CCC</p>
              {(['competency', 'commitment', 'capacity'] as const).map((dim) => (
                <div key={dim} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{dim}</span>
                  <span className={`font-bold ${ccc[dim] ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {ccc[dim] ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>

            {/* Determination */}
            <div className={`rounded-xl p-4 text-center ring-1 ${
              rightPerson && rightSeat ? 'bg-green-400/10 ring-green-400/30' : rightPerson ? 'bg-amber-400/10 ring-amber-400/30' : 'bg-red-400/10 ring-red-400/30'
            }`}>
              <p className={`text-sm font-bold ${
                rightPerson && rightSeat ? 'text-green-600 dark:text-green-400' : rightPerson ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {rightPerson && rightSeat ? 'Right Person, Right Seat' : rightPerson ? 'Right Person, Wrong Seat' : 'Wrong Person'}
              </p>
            </div>

            {/* Notes */}
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this assessment..."
              className="glass w-full rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none"
              rows={3}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="h-9 rounded-lg px-4 text-xs text-muted-foreground hover:text-foreground"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {!isSummary ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
              className="h-9 rounded-lg bg-primary px-6 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Next
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onSave({ cvRatings, ccc, notes })}
              className="h-9 rounded-lg bg-green-600 px-6 text-xs font-semibold text-primary-foreground hover:bg-green-700"
            >
              Save Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FitCheckPage() {
  const [members, setMembers] = useState(teamMembers);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [teamOpen, setTeamOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [wizardPerson, setWizardPerson] = useState<PersonFitData | null>(null);
  const [activeTab, setActiveTab] = useState<'analyzer' | 'health'>('analyzer');

  // Counts
  const rightRightCount = members.filter((m) => m.fitStatus === 'right-right').length;
  const atRiskCount = members.filter((m) => m.fitStatus === 'right-wrong').length;
  const actionRequiredCount = members.filter((m) => m.fitStatus === 'wrong').length;

  // Filter
  const filtered = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'All Teams' || m.team === teamFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'At Risk' && m.fitStatus === 'right-wrong') ||
      (statusFilter === 'Action Required' && m.fitStatus === 'wrong');
    return matchesSearch && matchesTeam && matchesStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') {
      cmp = a.name.localeCompare(b.name);
    } else if (sortKey === 'status') {
      const order: Record<FitStatus, number> = { wrong: 0, 'right-wrong': 1, 'right-right': 2 };
      cmp = order[a.fitStatus] - order[b.fitStatus];
    } else if (sortKey in cvSortKeyMap) {
      const cv = cvSortKeyMap[sortKey];
      cmp = cvRatingScore(a.coreValues[cv]) - cvRatingScore(b.coreValues[cv]);
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleCellClick = useCallback((personId: string, cv: CoreValueName) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== personId) return m;
        const current = m.coreValues[cv];
        const next: CVRating = current === '+' ? '+/-' : current === '+/-' ? '-' : '+';
        const newCoreValues = { ...m.coreValues, [cv]: next };
        // Recalculate fit status
        const hasNegCV = Object.values(newCoreValues).some((r) => r === '-');
        const allCCC = m.ccc.competency && m.ccc.commitment && m.ccc.capacity;
        const newFitStatus: FitStatus = hasNegCV ? 'wrong' : !allCCC ? 'right-wrong' : 'right-right';
        return { ...m, coreValues: newCoreValues, fitStatus: newFitStatus };
      })
    );
    toast.success('Rating updated');
  }, []);

  const handleWizardSave = useCallback((data: { cvRatings: Record<CoreValueName, CVRating>; ccc: Record<string, boolean>; notes: string }) => {
    if (!wizardPerson) return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== wizardPerson.id) return m;
        const hasNegCV = Object.values(data.cvRatings).some((r) => r === '-');
        const allCCC = data.ccc.competency && data.ccc.commitment && data.ccc.capacity;
        const newFitStatus: FitStatus = hasNegCV ? 'wrong' : !allCCC ? 'right-wrong' : 'right-right';
        return {
          ...m,
          coreValues: data.cvRatings,
          ccc: { competency: data.ccc.competency, commitment: data.ccc.commitment, capacity: data.ccc.capacity },
          fitStatus: newFitStatus,
          lastAssessed: new Date().toISOString().split('T')[0],
          managerNotes: data.notes || m.managerNotes,
        };
      })
    );
    setWizardPerson(null);
    toast.success(`Fit Check saved for ${wizardPerson.name}`);
  }, [wizardPerson]);

  const SortHeader = ({ label, sortId, className }: { label: string; sortId: SortKey; className?: string }) => (
    <th
      className={`cursor-pointer select-none px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground ${className || ''}`}
      onClick={() => handleSort(sortId)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${sortKey === sortId ? 'text-indigo-400' : 'opacity-30'}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Wizard Modal */}
      {wizardPerson && (
        <FitCheckWizard
          person={wizardPerson}
          onClose={() => setWizardPerson(null)}
          onSave={handleWizardSave}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            People Analyzer / Fit Check
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assess Right Person, Right Seat across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-9 gap-2 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => toast.success('Fit Check report exported')}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            className="h-9 gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.25)]"
            onClick={() => setWizardPerson(members[0])}
          >
            <Play className="h-3.5 w-3.5" />
            Run Fit Check
          </Button>
        </div>
      </div>

      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/10">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{rightRightCount}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Right Person, Right Seat</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{atRiskCount}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">At Risk (Wrong Seat)</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/10">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{actionRequiredCount}</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Action Required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-muted/50 p-1 w-fit max-w-full">
        <div className="flex flex-wrap items-center gap-1">
        {(['analyzer', 'health'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'analyzer' ? 'People Analyzer' : 'Team Health'}
          </button>
        ))}
        </div>
      </div>

      {/* ----- ANALYZER TAB ----- */}
      {activeTab === 'analyzer' && (
        <div className="space-y-4">
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
            {/* Team filter */}
            <div className="relative">
              <button
                onClick={() => setTeamOpen(!teamOpen)}
                className="glass flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground transition-all hover:text-foreground"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{teamFilter}</span>
                <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${teamOpen ? 'rotate-180' : ''}`} />
              </button>
              {teamOpen && (
                <div className="glass absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-lg border border-border/50 py-1 shadow-xl">
                  {teams.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTeamFilter(t); setTeamOpen(false); }}
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
            {/* Status filter pills */}
            <div className="flex items-center gap-1">
              {statusFilters.map((sf) => (
                <button
                  key={sf}
                  onClick={() => setStatusFilter(sf)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    statusFilter === sf
                      ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  {sf}
                </button>
              ))}
            </div>
          </div>

          {/* People Analyzer Table */}
          <div className="glass rounded-xl relative">
            {/* Mobile scroll hint gradient */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background/80 to-transparent lg:hidden" />
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border">
                    <SortHeader label="Name" sortId="name" className="min-w-[180px]" />
                    {coreValueNames.map((cv, i) => {
                      const sortIds: SortKey[] = ['integrity', 'quality', 'team-first', 'own-it', 'innovate'];
                      const shortNames = ['Integrity', 'Quality', 'Team First', 'Own It', 'Innovate'];
                      return <SortHeader key={cv} label={shortNames[i]} sortId={sortIds[i]} />;
                    })}
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Comp</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Commit</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cap</th>
                    <SortHeader label="Status" sortId="status" />
                    <th className="px-3 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((person) => {
                    const isExpanded = expandedId === person.id;
                    const fitCfg = fitStatusConfig(person.fitStatus);
                    const FitIcon = fitCfg.icon;

                    return (
                      <tr key={person.id} className="group">
                        {/* Main row */}
                        <td className="border-b border-border/50 px-3 py-3">
                          <button
                            className="flex items-center gap-3 text-left"
                            onClick={() => setExpandedId(isExpanded ? null : person.id)}
                          >
                            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-300">
                              {person.initials}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-foreground">{person.name}</span>
                              <p className="text-[10px] text-muted-foreground">{person.role}</p>
                            </div>
                          </button>
                        </td>

                        {/* Core value cells */}
                        {coreValueNames.map((cv) => {
                          const rating = person.coreValues[cv];
                          const trend = person.coreValueTrends[cv];
                          const TrendIcon = trendIcon(trend);
                          return (
                            <td key={cv} className="border-b border-border/50 px-3 py-3 text-center">
                              <button
                                onClick={() => handleCellClick(person.id, cv)}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ring-1 transition-all hover:scale-110 ${cvRatingColor(rating)}`}
                                title={`Click to cycle: ${rating}`}
                              >
                                {rating}
                                <TrendIcon className={`h-2.5 w-2.5 ${trendColor(trend)}`} />
                              </button>
                            </td>
                          );
                        })}

                        {/* CCC cells */}
                        {(['competency', 'commitment', 'capacity'] as const).map((dim) => (
                          <td key={dim} className="border-b border-border/50 px-3 py-3 text-center">
                            {person.ccc[dim] ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-400/10 text-green-400">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-400/10 text-red-400">
                                <XCircle className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>
                        ))}

                        {/* Status */}
                        <td className="border-b border-border/50 px-3 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${fitCfg.bg} ${fitCfg.color} ${fitCfg.ring}`}>
                            <FitIcon className="h-3 w-3" />
                            {person.fitStatus === 'right-right' ? 'RPRS' : person.fitStatus === 'right-wrong' ? 'RPWS' : 'WP'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="border-b border-border/50 px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 rounded-md px-2 text-xs text-primary hover:bg-primary/10"
                              onClick={() => setWizardPerson(person)}
                              title="Run Fit Check"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 rounded-md px-2 text-xs text-muted-foreground hover:text-foreground"
                              onClick={() => setExpandedId(isExpanded ? null : person.id)}
                              title="View Details"
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

          {/* Expanded Detail Panels */}
          {sorted.map((person) => {
            if (expandedId !== person.id) return null;
            const fitCfg = fitStatusConfig(person.fitStatus);
            const FitIcon = fitCfg.icon;

            return (
              <div key={`detail-${person.id}`} className="glass rounded-xl p-5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-indigo-300">
                      {person.initials}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{person.name}</h3>
                      <p className="text-xs text-muted-foreground">{person.role}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="border-border bg-muted/30 text-[10px] text-muted-foreground">
                          {person.team}
                        </Badge>
                        <Badge variant="outline" className="border-border bg-muted/30 text-[10px] text-muted-foreground">
                          Seat: {person.seatTitle}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ring-1 ${fitCfg.bg} ${fitCfg.ring}`}>
                    <FitIcon className={`h-4 w-4 ${fitCfg.color}`} />
                    <span className={`text-xs font-semibold ${fitCfg.color}`}>{fitCfg.label}</span>
                  </div>
                </div>

                {/* Core Values with Trends */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    Core Values Breakdown
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {coreValueNames.map((cv) => {
                      const rating = person.coreValues[cv];
                      const trend = person.coreValueTrends[cv];
                      const TrendIcon = trendIcon(trend);
                      return (
                        <div key={cv} className="flex items-center justify-between rounded-lg bg-foreground/[0.03] px-3 py-2.5">
                          <span className="text-xs text-muted-foreground">{cv}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${rating === '+' ? 'text-green-600 dark:text-green-400' : rating === '+/-' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                              {rating}
                            </span>
                            <TrendIcon className={`h-3 w-3 ${trendColor(trend)}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CCC Detailed */}
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    CCC Assessment
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {(['competency', 'commitment', 'capacity'] as const).map((dim) => (
                      <div key={dim} className="rounded-lg bg-foreground/[0.03] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-xs font-medium capitalize text-muted-foreground">{dim}</p>
                          <span className={`text-xs font-bold ${person.ccc[dim] ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {person.ccc[dim] ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/70">{person.cccNotes[dim]}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical Chart + Manager Notes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Mini chart */}
                  <div className="rounded-lg bg-foreground/[0.03] p-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Quarterly History
                    </h4>
                    <div className="flex items-end justify-center">
                      <MiniChart data={person.quarterlyHistory} />
                    </div>
                    <p className="mt-2 text-center text-[10px] text-muted-foreground">
                      Core Values Score (last 4 quarters)
                    </p>
                  </div>

                  {/* Manager notes */}
                  <div className="rounded-lg bg-foreground/[0.03] p-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Manager Notes
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{person.managerNotes}</p>
                    <p className="mt-3 text-[10px] text-muted-foreground/50">
                      Last assessed: {person.lastAssessed}
                    </p>
                  </div>
                </div>

                {/* Action Items */}
                {person.actionItems.length > 0 && (
                  <div>
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600/60 dark:text-amber-400/60">
                      Action Items
                    </h4>
                    <ul className="space-y-1.5">
                      {person.actionItems.map((item, i) => (
                        <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/40" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                    onClick={() => setWizardPerson(person)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run Fit Check
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toast.success(`1-on-1 scheduled with ${person.name}`)}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Schedule 1-on-1
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toast.success(`Improvement plan created for ${person.name}`)}
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Create Improvement Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => toast.success(`Message sent to ${person.name}`)}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Button>
                </div>
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="glass rounded-xl px-5 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No people match your filters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ----- TEAM HEALTH TAB ----- */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Heat Map */}
          <div className="glass rounded-xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground">Core Values Heat Map</h3>
            </div>
            <TeamHeatMap members={members} />
            <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-green-400/30 ring-1 ring-green-400/50" /> + (Positive)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-amber-400/30 ring-1 ring-amber-400/50" /> +/- (Neutral)
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-red-400/30 ring-1 ring-red-400/50" /> - (Negative)
              </span>
            </div>
          </div>

          {/* Department Comparison */}
          <div className="glass rounded-xl p-5">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-foreground">Department Comparison</h3>
            </div>
            <DepartmentChart members={members} />
          </div>

          {/* Team Quick Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {['Leadership', 'Sales', 'Operations', 'Finance', 'HR'].map((dept) => {
              const deptMembers = members.filter((m) => m.team === dept);
              const rprs = deptMembers.filter((m) => m.fitStatus === 'right-right').length;
              const rpws = deptMembers.filter((m) => m.fitStatus === 'right-wrong').length;
              const wp = deptMembers.filter((m) => m.fitStatus === 'wrong').length;
              return (
                <div key={dept} className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all duration-300">
                  <h4 className="text-sm font-semibold text-foreground">{dept}</h4>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{deptMembers.length} members</p>
                  <div className="mt-3 flex items-center gap-3">
                    {rprs > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" /> {rprs}
                      </span>
                    )}
                    {rpws > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" /> {rpws}
                      </span>
                    )}
                    {wp > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-red-600 dark:text-red-400">
                        <XCircle className="h-3 w-3" /> {wp}
                      </span>
                    )}
                    {rprs === deptMembers.length && (
                      <Badge variant="outline" className="border-green-400/20 bg-green-400/10 text-[9px] text-green-600 dark:text-green-400">
                        All Clear
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}