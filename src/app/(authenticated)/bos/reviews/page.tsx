'use client';

import { useState, useMemo } from 'react';
import {
  Star,
  Search,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Users,
  TrendingUp,
  Printer,
  Calendar,
  PenLine,
  Eye,
  Play,
  BarChart3,
  Shield,
  Send,
  Plus,
  ArrowLeftRight,
  Target,
  ListChecks,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

type ReviewStep = 'Not Started' | 'Self-Assessment' | 'Manager Review' | 'Discussion' | 'Complete';
type CoreValueRating = '+' | '+/-' | '-';
type CCCRating = 'Exceeds' | 'Meets' | 'Below';
type LACAction = 'Lead' | 'Agree' | 'Coach';
type DetailTab = 'self' | 'manager' | 'compare' | 'summary';

interface ReviewPerson {
  id: string;
  name: string;
  initials: string;
  role: string;
  step: ReviewStep;
  manager: string;
}

interface ReviewDetail {
  personId: string;
  coreValues: { value: string; selfRating: CoreValueRating; managerRating: CoreValueRating; lac: LACAction }[];
  ccc: { dimension: string; selfRating: CCCRating; managerRating: CCCRating; lac: LACAction }[];
  goalRetro: { goal: string; result: string; met: boolean }[];
  strengths: string[];
  growthAreas: string[];
  overallSelfRating: number;
  overallManagerRating: number;
  selfFormComplete: boolean;
  managerFormComplete: boolean;
  selfSigned: boolean;
  managerSigned: boolean;
  selfSignedDate: string | null;
  managerSignedDate: string | null;
  performanceData: {
    rocksCompleted: number;
    rocksTotal: number;
    todosCompleted: number;
    todosTotal: number;
    kpisOnTrack: number;
    kpisTotal: number;
    meetingAttendance: number;
  };
}

interface TemplateInfo {
  name: string;
  description: string;
  sections: number;
  structure: string[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const steps: ReviewStep[] = ['Not Started', 'Self-Assessment', 'Manager Review', 'Discussion', 'Complete'];

const reviewPeople: ReviewPerson[] = [
  { id: 'r-001', name: 'Sarah Chen', initials: 'SC', role: 'VP of Sales & Marketing', step: 'Complete', manager: 'Joseph Wells' },
  { id: 'r-002', name: 'Mike Torres', initials: 'MT', role: 'VP of Operations', step: 'Complete', manager: 'Joseph Wells' },
  { id: 'r-003', name: 'David Kim', initials: 'DK', role: 'Controller / Finance', step: 'Discussion', manager: 'Joseph Wells' },
  { id: 'r-004', name: 'Lisa Park', initials: 'LP', role: 'HR / People Director', step: 'Complete', manager: 'Joseph Wells' },
  { id: 'r-005', name: 'Carlos Rivera', initials: 'CR', role: 'Integrator / COO', step: 'Complete', manager: 'Joseph Wells' },
  { id: 'r-006', name: 'Ryan Nakamura', initials: 'RN', role: 'Lead Estimator', step: 'Manager Review', manager: 'Sarah Chen' },
  { id: 'r-007', name: 'Kim Lee', initials: 'KL', role: 'Project Manager', step: 'Complete', manager: 'Mike Torres' },
  { id: 'r-008', name: 'Dan Parker', initials: 'DP', role: 'Site Superintendent', step: 'Self-Assessment', manager: 'Mike Torres' },
  { id: 'r-009', name: 'Maria Gonzalez', initials: 'MG', role: 'AP/AR Specialist', step: 'Complete', manager: 'David Kim' },
  { id: 'r-010', name: 'James Taylor', initials: 'JT', role: 'Payroll Administrator', step: 'Not Started', manager: 'David Kim' },
  { id: 'r-011', name: 'Tom Bradley', initials: 'TB', role: 'IT / Systems Admin', step: 'Complete', manager: 'Carlos Rivera' },
  { id: 'r-012', name: 'Alex Flores', initials: 'AF', role: 'Business Dev Rep', step: 'Not Started', manager: 'Sarah Chen' },
];

const reviewDetails: Record<string, ReviewDetail> = {
  'r-001': {
    personId: 'r-001',
    coreValues: [
      { value: 'Integrity First', selfRating: '+', managerRating: '+', lac: 'Agree' },
      { value: 'Relentless Quality', selfRating: '+', managerRating: '+', lac: 'Lead' },
      { value: 'Team Over Individual', selfRating: '+', managerRating: '+/-', lac: 'Coach' },
      { value: 'Own It', selfRating: '+/-', managerRating: '+/-', lac: 'Agree' },
      { value: 'Innovate or Stagnate', selfRating: '+', managerRating: '+', lac: 'Lead' },
    ],
    ccc: [
      { dimension: 'Competency', selfRating: 'Exceeds', managerRating: 'Exceeds', lac: 'Lead' },
      { dimension: 'Commitment', selfRating: 'Exceeds', managerRating: 'Meets', lac: 'Agree' },
      { dimension: 'Capacity', selfRating: 'Meets', managerRating: 'Exceeds', lac: 'Agree' },
    ],
    goalRetro: [
      { goal: 'Close $1.2M in new business', result: '$1.4M closed', met: true },
      { goal: 'Launch referral program', result: 'Launched in Feb, 12 referrals', met: true },
      { goal: 'Reduce sales cycle to 14 days', result: 'Currently at 16 days', met: false },
    ],
    strengths: [
      'Exceptional relationship building with enterprise clients',
      'Strong mentoring of junior sales team members',
      'Proactive in adopting AI tools for pipeline management',
    ],
    growthAreas: [
      'Delegation — tends to take on too much personally',
      'Documentation of sales processes for team scalability',
    ],
    overallSelfRating: 4.4,
    overallManagerRating: 4.2,
    selfFormComplete: true,
    managerFormComplete: true,
    selfSigned: true,
    managerSigned: true,
    selfSignedDate: '2026-03-15',
    managerSignedDate: '2026-03-16',
    performanceData: {
      rocksCompleted: 3,
      rocksTotal: 4,
      todosCompleted: 18,
      todosTotal: 22,
      kpisOnTrack: 5,
      kpisTotal: 7,
      meetingAttendance: 96,
    },
  },
  'r-002': {
    personId: 'r-002',
    coreValues: [
      { value: 'Integrity First', selfRating: '+', managerRating: '+', lac: 'Agree' },
      { value: 'Relentless Quality', selfRating: '+', managerRating: '+', lac: 'Lead' },
      { value: 'Team Over Individual', selfRating: '+', managerRating: '+', lac: 'Lead' },
      { value: 'Own It', selfRating: '+', managerRating: '+', lac: 'Agree' },
      { value: 'Innovate or Stagnate', selfRating: '+/-', managerRating: '+/-', lac: 'Coach' },
    ],
    ccc: [
      { dimension: 'Competency', selfRating: 'Exceeds', managerRating: 'Exceeds', lac: 'Lead' },
      { dimension: 'Commitment', selfRating: 'Exceeds', managerRating: 'Exceeds', lac: 'Agree' },
      { dimension: 'Capacity', selfRating: 'Meets', managerRating: 'Meets', lac: 'Agree' },
    ],
    goalRetro: [
      { goal: 'Implement job costing system', result: 'Completed in Q1', met: true },
      { goal: 'Reduce project overruns by 15%', result: 'Reduced by 22%', met: true },
      { goal: 'Hire 2 additional PMs', result: '1 of 2 hired', met: false },
    ],
    strengths: [
      'Exceptional project delivery and timeline management',
      'Strong safety culture leadership',
    ],
    growthAreas: [
      'Adopting new technology tools more quickly',
      'Cross-department collaboration with sales',
    ],
    overallSelfRating: 4.1,
    overallManagerRating: 4.3,
    selfFormComplete: true,
    managerFormComplete: true,
    selfSigned: true,
    managerSigned: true,
    selfSignedDate: '2026-03-14',
    managerSignedDate: '2026-03-15',
    performanceData: {
      rocksCompleted: 2,
      rocksTotal: 3,
      todosCompleted: 14,
      todosTotal: 16,
      kpisOnTrack: 6,
      kpisTotal: 8,
      meetingAttendance: 92,
    },
  },
  'r-003': {
    personId: 'r-003',
    coreValues: [
      { value: 'Integrity First', selfRating: '+', managerRating: '+', lac: 'Lead' },
      { value: 'Relentless Quality', selfRating: '+', managerRating: '+', lac: 'Agree' },
      { value: 'Team Over Individual', selfRating: '+/-', managerRating: '+/-', lac: 'Coach' },
      { value: 'Own It', selfRating: '+', managerRating: '+/-', lac: 'Agree' },
      { value: 'Innovate or Stagnate', selfRating: '+/-', managerRating: '-', lac: 'Coach' },
    ],
    ccc: [
      { dimension: 'Competency', selfRating: 'Exceeds', managerRating: 'Meets', lac: 'Agree' },
      { dimension: 'Commitment', selfRating: 'Meets', managerRating: 'Meets', lac: 'Agree' },
      { dimension: 'Capacity', selfRating: 'Meets', managerRating: 'Below', lac: 'Coach' },
    ],
    goalRetro: [
      { goal: 'Close Q4 books within 5 business days', result: 'Closed in 4 days', met: true },
      { goal: 'Automate monthly reconciliation', result: 'In progress, 60% complete', met: false },
      { goal: 'Implement new AP workflow', result: 'Completed in Feb', met: true },
    ],
    strengths: [
      'Accuracy and attention to detail in financial reporting',
      'Strong compliance and audit readiness',
    ],
    growthAreas: [
      'Embracing automation and technology improvements',
      'Proactive communication on financial risks',
    ],
    overallSelfRating: 3.8,
    overallManagerRating: 3.5,
    selfFormComplete: true,
    managerFormComplete: true,
    selfSigned: false,
    managerSigned: false,
    selfSignedDate: null,
    managerSignedDate: null,
    performanceData: {
      rocksCompleted: 2,
      rocksTotal: 3,
      todosCompleted: 11,
      todosTotal: 15,
      kpisOnTrack: 4,
      kpisTotal: 6,
      meetingAttendance: 88,
    },
  },
};

const pastCycles = [
  { period: 'Q4 2025', completed: '12 of 12', avgRating: 4.0, people: 12 },
  { period: 'Q3 2025', completed: '11 of 11', avgRating: 3.8, people: 11 },
  { period: 'Q2 2025', completed: '10 of 10', avgRating: 3.9, people: 10 },
];

const templates: TemplateInfo[] = [
  {
    name: 'Standard Quarterly Review',
    description:
      'Core values alignment, CCC assessment, goal retrospective, strengths & growth areas, and overall rating.',
    sections: 6,
    structure: ['Core Values Alignment (+/+/-/-)', 'CCC Assessment (Competency, Commitment, Capacity)', 'Rock/Goal Retrospective', 'Performance Data Summary', 'Strengths & Growth Areas', 'Overall Rating & Signatures'],
  },
  {
    name: '90-Day New Hire Review',
    description:
      'Onboarding progress, culture fit assessment, skill evaluation, and development plan.',
    sections: 4,
    structure: ['Onboarding Milestone Checklist', 'Culture Fit Assessment (Core Values)', 'Skills & Competency Evaluation', 'Development Plan & Next 90 Days'],
  },
  {
    name: 'Annual Performance Review',
    description:
      'Comprehensive review covering all quarters, compensation review, career development, and goal setting for next year.',
    sections: 8,
    structure: ['Year-in-Review Summary', 'Quarterly Performance Trends', 'Core Values Alignment', 'CCC Assessment', 'Key Accomplishments', 'Career Development Discussion', 'Compensation Review', 'Next Year Goal Setting'],
  },
];

// ---------------------------------------------------------------------------
// Helper: Rating value map for comparison calculations
// ---------------------------------------------------------------------------

const cvRatingValue: Record<CoreValueRating, number> = { '+': 3, '+/-': 2, '-': 1 };
const cccRatingValue: Record<CCCRating, number> = { 'Exceeds': 3, 'Meets': 2, 'Below': 1 };

function getAgreementScore(detail: ReviewDetail): number {
  let totalItems = 0;
  let agreements = 0;

  for (const cv of detail.coreValues) {
    totalItems++;
    if (cv.selfRating === cv.managerRating) agreements++;
  }
  for (const c of detail.ccc) {
    totalItems++;
    if (c.selfRating === c.managerRating) agreements++;
  }

  return totalItems > 0 ? Math.round((agreements / totalItems) * 100) : 0;
}

function getLACCount(detail: ReviewDetail): { lead: number; agree: number; coach: number } {
  const all = [...detail.coreValues.map((cv) => cv.lac), ...detail.ccc.map((c) => c.lac)];
  return {
    lead: all.filter((a) => a === 'Lead').length,
    agree: all.filter((a) => a === 'Agree').length,
    coach: all.filter((a) => a === 'Coach').length,
  };
}

// ---------------------------------------------------------------------------
// Step progress indicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }: { currentStep: ReviewStep }) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex items-center gap-1">
      {steps.slice(1).map((step, i) => {
        const stepIndex = i + 1;
        const isCompleted = currentIndex >= stepIndex;
        const isCurrent = currentIndex === stepIndex;

        return (
          <div key={step} className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full transition-all ${
                isCompleted
                  ? 'bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.5)]'
                  : isCurrent
                    ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                    : 'bg-muted-foreground/20'
              }`}
              title={step}
            />
            {i < 3 && (
              <div
                className={`h-px w-3 ${
                  isCompleted ? 'bg-green-400/50' : 'bg-muted-foreground/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Core value rating display
// ---------------------------------------------------------------------------

function CoreValueRatingDot({ rating }: { rating: CoreValueRating }) {
  const config = {
    '+': { color: 'bg-green-400', text: 'text-green-400' },
    '+/-': { color: 'bg-amber-400', text: 'text-amber-400' },
    '-': { color: 'bg-red-400', text: 'text-red-400' },
  };
  const c = config[rating];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${c.color}`} />
      {rating}
    </span>
  );
}

// ---------------------------------------------------------------------------
// CCC rating badge
// ---------------------------------------------------------------------------

function CCCRatingBadge({ rating }: { rating: CCCRating }) {
  const color =
    rating === 'Exceeds'
      ? 'text-green-400'
      : rating === 'Meets'
        ? 'text-blue-400'
        : 'text-red-400';
  return <span className={`text-sm font-semibold ${color}`}>{rating}</span>;
}

// ---------------------------------------------------------------------------
// LAC indicator
// ---------------------------------------------------------------------------

function LACIndicator({ action, onClick }: { action: LACAction; onClick?: () => void }) {
  const config = {
    Lead: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', label: 'L' },
    Agree: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', label: 'A' },
    Coach: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', label: 'C' },
  };
  const c = config[action];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      title={action}
      className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold ${c.bg} ${c.border} ${c.text} hover:opacity-80 transition-opacity`}
    >
      {c.label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// LAC summary
// ---------------------------------------------------------------------------

function LACSummary({ detail }: { detail: ReviewDetail }) {
  const counts = getLACCount(detail);
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1 text-xs">
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <span className="text-green-400 font-medium">Lead: {counts.lead}</span>
      </span>
      <span className="flex items-center gap-1 text-xs">
        <span className="h-2 w-2 rounded-full bg-blue-400" />
        <span className="text-blue-400 font-medium">Agree: {counts.agree}</span>
      </span>
      <span className="flex items-center gap-1 text-xs">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-amber-400 font-medium">Coach: {counts.coach}</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form completion indicators
// ---------------------------------------------------------------------------

function FormCompletionBadges({ detail }: { detail: ReviewDetail }) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`text-[10px] gap-1 ${
          detail.selfFormComplete
            ? 'bg-green-400/10 text-green-400 border-green-400/20'
            : 'bg-muted/30 text-muted-foreground border-border'
        }`}
      >
        {detail.selfFormComplete ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <Circle className="h-3 w-3" />
        )}
        Self
      </Badge>
      <Badge
        variant="outline"
        className={`text-[10px] gap-1 ${
          detail.managerFormComplete
            ? 'bg-green-400/10 text-green-400 border-green-400/20'
            : 'bg-muted/30 text-muted-foreground border-border'
        }`}
      >
        {detail.managerFormComplete ? (
          <CheckCircle2 className="h-3 w-3" />
        ) : (
          <Circle className="h-3 w-3" />
        )}
        Manager
      </Badge>
      <Badge
        variant="outline"
        className="text-[10px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      >
        Both Forms Required
      </Badge>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Performance Data Section
// ---------------------------------------------------------------------------

function PerformanceDataSection({ data }: { data: ReviewDetail['performanceData'] }) {
  const rockPct = Math.round((data.rocksCompleted / data.rocksTotal) * 100);
  const todoPct = Math.round((data.todosCompleted / data.todosTotal) * 100);

  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
        <BarChart3 className="h-3.5 w-3.5" />
        Performance Summary (Auto-Pulled)
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
          <Target className="mx-auto h-4 w-4 text-indigo-400 mb-1" />
          <p className="text-lg font-bold text-foreground">
            {data.rocksCompleted}/{data.rocksTotal}
          </p>
          <p className="text-[10px] text-muted-foreground">Rocks Completed</p>
          <Progress value={rockPct} className="mt-1.5 h-1 bg-muted/30" />
        </div>
        <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
          <ListChecks className="mx-auto h-4 w-4 text-cyan-400 mb-1" />
          <p className="text-lg font-bold text-foreground">
            {data.todosCompleted}/{data.todosTotal}
          </p>
          <p className="text-[10px] text-muted-foreground">To-Dos Completed</p>
          <Progress value={todoPct} className="mt-1.5 h-1 bg-muted/30" />
        </div>
        <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-green-400 mb-1" />
          <p className="text-lg font-bold text-foreground">
            <span className="text-green-400">{data.kpisOnTrack}</span>
            <span className="text-muted-foreground/60 text-sm">/{data.kpisTotal}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">KPIs On-Track</p>
          <div className="mt-1.5 flex items-center justify-center gap-1">
            <span className={`text-[10px] font-medium ${data.kpisOnTrack >= data.kpisTotal * 0.7 ? 'text-green-400' : 'text-amber-400'}`}>
              {data.kpisTotal - data.kpisOnTrack} off-track
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-muted/30 px-3 py-3 text-center">
          <Users className="mx-auto h-4 w-4 text-purple-400 mb-1" />
          <p className="text-lg font-bold text-foreground">{data.meetingAttendance}%</p>
          <p className="text-[10px] text-muted-foreground">Meeting Attendance</p>
          <Progress value={data.meetingAttendance} className="mt-1.5 h-1 bg-muted/30" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Comparison view helpers
// ---------------------------------------------------------------------------

function cvDiffLevel(self: CoreValueRating, manager: CoreValueRating): 'agree' | 'minor' | 'major' {
  const diff = Math.abs(cvRatingValue[self] - cvRatingValue[manager]);
  if (diff === 0) return 'agree';
  if (diff === 1) return 'minor';
  return 'major';
}

function cccDiffLevel(self: CCCRating, manager: CCCRating): 'agree' | 'minor' | 'major' {
  const diff = Math.abs(cccRatingValue[self] - cccRatingValue[manager]);
  if (diff === 0) return 'agree';
  if (diff === 1) return 'minor';
  return 'major';
}

function diffColor(level: 'agree' | 'minor' | 'major') {
  if (level === 'agree') return 'border-green-500/30 bg-green-500/5';
  if (level === 'minor') return 'border-amber-500/30 bg-amber-500/5';
  return 'border-red-500/30 bg-red-500/5';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'templates'>('current');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [detailTabs, setDetailTabs] = useState<Record<string, DetailTab>>({});

  // Interactive state for ratings
  const [localDetails, setLocalDetails] = useState<Record<string, ReviewDetail>>(reviewDetails);

  // Modal states
  const [signatureModal, setSignatureModal] = useState<{ personId: string; role: 'self' | 'manager' } | null>(null);
  const [scheduleModal, setScheduleModal] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [actionItemModal, setActionItemModal] = useState<string | null>(null);
  const [actionItemTitle, setActionItemTitle] = useState('');
  const [actionItemDesc, setActionItemDesc] = useState('');
  const [actionItemDue, setActionItemDue] = useState('');
  const [newCycleModal, setNewCycleModal] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [cycleStart, setCycleStart] = useState('');
  const [cycleEnd, setCycleEnd] = useState('');
  const [templatePreview, setTemplatePreview] = useState<TemplateInfo | null>(null);
  const [reviewFormModal, setReviewFormModal] = useState<{ personId: string; mode: 'start' | 'continue' | 'view' } | null>(null);
  const [pastCycleExpanded, setPastCycleExpanded] = useState<string | null>(null);

  // Person step state for interactive progression
  const [personSteps, setPersonSteps] = useState<Record<string, ReviewStep>>(
    Object.fromEntries(reviewPeople.map((p) => [p.id, p.step]))
  );

  const completedCount = useMemo(
    () => Object.values(personSteps).filter((s) => s === 'Complete').length,
    [personSteps]
  );
  const totalCount = reviewPeople.length;

  const filtered = reviewPeople.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase())
  );

  // Helpers for detail tab
  function getDetailTab(personId: string): DetailTab {
    return detailTabs[personId] ?? 'summary';
  }

  function setDetailTab(personId: string, tab: DetailTab) {
    setDetailTabs((prev) => ({ ...prev, [personId]: tab }));
  }

  // Update core value rating
  function cycleCVRating(personId: string, index: number, which: 'self' | 'manager') {
    const order: CoreValueRating[] = ['+', '+/-', '-'];
    setLocalDetails((prev) => {
      const detail = prev[personId];
      if (!detail) return prev;
      const newCVs = [...detail.coreValues];
      const current = which === 'self' ? newCVs[index].selfRating : newCVs[index].managerRating;
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      newCVs[index] = {
        ...newCVs[index],
        [which === 'self' ? 'selfRating' : 'managerRating']: order[nextIdx],
      };
      return { ...prev, [personId]: { ...detail, coreValues: newCVs } };
    });
    toast.success(`Rating updated to ${['+ ', '+/- ', '- '][(['+ ', '+/- ', '- '].indexOf('+ ') + 1) % 3]}`, { duration: 1500 });
  }

  // Update CCC rating
  function cycleCCCRating(personId: string, index: number, which: 'self' | 'manager') {
    const order: CCCRating[] = ['Exceeds', 'Meets', 'Below'];
    setLocalDetails((prev) => {
      const detail = prev[personId];
      if (!detail) return prev;
      const newCCC = [...detail.ccc];
      const current = which === 'self' ? newCCC[index].selfRating : newCCC[index].managerRating;
      const nextIdx = (order.indexOf(current) + 1) % order.length;
      newCCC[index] = {
        ...newCCC[index],
        [which === 'self' ? 'selfRating' : 'managerRating']: order[nextIdx],
      };
      return { ...prev, [personId]: { ...detail, ccc: newCCC } };
    });
    toast.success('CCC rating updated', { duration: 1500 });
  }

  // Cycle LAC action
  function cycleLAC(personId: string, section: 'cv' | 'ccc', index: number) {
    const order: LACAction[] = ['Lead', 'Agree', 'Coach'];
    setLocalDetails((prev) => {
      const detail = prev[personId];
      if (!detail) return prev;
      if (section === 'cv') {
        const newCVs = [...detail.coreValues];
        const nextIdx = (order.indexOf(newCVs[index].lac) + 1) % order.length;
        newCVs[index] = { ...newCVs[index], lac: order[nextIdx] };
        return { ...prev, [personId]: { ...detail, coreValues: newCVs } };
      } else {
        const newCCC = [...detail.ccc];
        const nextIdx = (order.indexOf(newCCC[index].lac) + 1) % order.length;
        newCCC[index] = { ...newCCC[index], lac: order[nextIdx] };
        return { ...prev, [personId]: { ...detail, ccc: newCCC } };
      }
    });
    toast.success('Action indicator updated', { duration: 1500 });
  }

  // Toggle goal met
  function toggleGoalMet(personId: string, index: number) {
    setLocalDetails((prev) => {
      const detail = prev[personId];
      if (!detail) return prev;
      const newGoals = [...detail.goalRetro];
      newGoals[index] = { ...newGoals[index], met: !newGoals[index].met };
      return { ...prev, [personId]: { ...detail, goalRetro: newGoals } };
    });
    toast.success('Goal status toggled', { duration: 1500 });
  }

  // Handle signature
  function handleSign() {
    if (!signatureModal) return;
    const { personId, role } = signatureModal;
    const dateStr = new Date().toISOString().split('T')[0];
    setLocalDetails((prev) => {
      const detail = prev[personId];
      if (!detail) return prev;
      if (role === 'self') {
        return { ...prev, [personId]: { ...detail, selfSigned: true, selfSignedDate: dateStr } };
      } else {
        return { ...prev, [personId]: { ...detail, managerSigned: true, managerSignedDate: dateStr } };
      }
    });

    const detail = localDetails[personId];
    const person = reviewPeople.find((p) => p.id === personId);
    if (detail && person) {
      const otherSigned = role === 'self' ? detail.managerSigned : detail.selfSigned;
      if (otherSigned) {
        setPersonSteps((prev) => ({ ...prev, [personId]: 'Complete' }));
        toast.success(`Review for ${person.name} is now Complete. Both parties signed.`, { duration: 3000 });
      } else {
        toast.success(`${role === 'self' ? 'Self' : 'Manager'} signature recorded for ${person.name}`, { duration: 2500 });
      }
    }
    setSignatureModal(null);
  }

  // ---------------------------------------------------------------------------
  // Render review detail content
  // ---------------------------------------------------------------------------

  function renderDetailContent(person: ReviewPerson) {
    const detail = localDetails[person.id];
    const currentTab = getDetailTab(person.id);
    const currentStep = personSteps[person.id] ?? person.step;

    if (!detail) {
      return (
        <div className="border-t border-border/50 p-5">
          <div className="flex flex-col items-center py-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              {currentStep === 'Not Started'
                ? 'Review has not been started yet. Click "Start Review" to begin.'
                : currentStep === 'Complete'
                  ? 'Review completed. Detailed data available for primary team members.'
                  : `Review is in the "${currentStep}" stage.`}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setScheduleModal(person.id);
                }}
              >
                <Calendar className="h-3.5 w-3.5" />
                Schedule Discussion
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-border/50 p-5 space-y-6">
        {/* Form completion badges */}
        <FormCompletionBadges detail={detail} />

        {/* Detail tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-0.5 w-fit">
          {([
            { key: 'self' as const, label: 'Self-Assessment' },
            { key: 'manager' as const, label: 'Manager Assessment' },
            { key: 'compare' as const, label: 'Compare' },
            { key: 'summary' as const, label: 'Summary' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={(e) => {
                e.stopPropagation();
                setDetailTab(person.id, tab.key);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all flex items-center gap-1.5 ${
                currentTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.key === 'compare' && <ArrowLeftRight className="h-3 w-3" />}
              {tab.label}
              {tab.key === 'self' && detail.selfFormComplete && (
                <CheckCircle2 className="h-3 w-3 text-green-400" />
              )}
              {tab.key === 'manager' && detail.managerFormComplete && (
                <CheckCircle2 className="h-3 w-3 text-green-400" />
              )}
            </button>
          ))}
        </div>

        {/* Performance Data (shown in all tabs) */}
        <PerformanceDataSection data={detail.performanceData} />

        {/* Self-Assessment / Manager Assessment views */}
        {(currentTab === 'self' || currentTab === 'manager') && (
          <>
            {/* Core Values */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Core Values Alignment — {currentTab === 'self' ? 'Self-Assessment' : 'Manager Assessment'}
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {detail.coreValues.map((cv, i) => {
                  const rating = currentTab === 'self' ? cv.selfRating : cv.managerRating;
                  return (
                    <div
                      key={cv.value}
                      className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                    >
                      <span className="text-xs text-muted-foreground flex items-center gap-2">
                        <LACIndicator
                          action={cv.lac}
                          onClick={() => cycleLAC(person.id, 'cv', i)}
                        />
                        {cv.value}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleCVRating(person.id, i, currentTab);
                        }}
                        className="hover:opacity-70 transition-opacity"
                      >
                        <CoreValueRatingDot rating={rating} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CCC */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                CCC Assessment — {currentTab === 'self' ? 'Self-Assessment' : 'Manager Assessment'}
              </h4>
              <div className="flex flex-wrap gap-3">
                {detail.ccc.map((c, i) => {
                  const rating = currentTab === 'self' ? c.selfRating : c.managerRating;
                  return (
                    <div
                      key={c.dimension}
                      className="rounded-lg bg-muted/30 px-4 py-3 text-center"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <LACIndicator
                          action={c.lac}
                          onClick={() => cycleLAC(person.id, 'ccc', i)}
                        />
                        <p className="text-xs text-muted-foreground">{c.dimension}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleCCCRating(person.id, i, currentTab);
                        }}
                        className="mt-1 hover:opacity-70 transition-opacity"
                      >
                        <CCCRatingBadge rating={rating} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LAC summary */}
            <div className="flex items-center gap-4 rounded-lg bg-muted/30 px-4 py-3">
              <Award className="h-4 w-4 text-indigo-400" />
              <LACSummary detail={detail} />
            </div>
          </>
        )}

        {/* Compare view */}
        {currentTab === 'compare' && (
          <>
            <div className="flex items-center gap-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20 px-4 py-3">
              <ArrowLeftRight className="h-4 w-4 text-indigo-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-foreground">
                  Agreement Score: {getAgreementScore(detail)}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Items where self and manager ratings match
                </p>
              </div>
              <div className="flex gap-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-400" /> Agree
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Minor diff
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> Major diff
                </span>
              </div>
            </div>

            {/* Core Values comparison */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Core Values — Side-by-Side
              </h4>
              <div className="space-y-2">
                {detail.coreValues.map((cv, i) => {
                  const level = cvDiffLevel(cv.selfRating, cv.managerRating);
                  return (
                    <div
                      key={cv.value}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${diffColor(level)}`}
                    >
                      <span className="text-xs text-muted-foreground flex items-center gap-2 flex-1">
                        <LACIndicator
                          action={cv.lac}
                          onClick={() => cycleLAC(person.id, 'cv', i)}
                        />
                        {cv.value}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground/60 mb-0.5">Self</p>
                          <CoreValueRatingDot rating={cv.selfRating} />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground/60 mb-0.5">Manager</p>
                          <CoreValueRatingDot rating={cv.managerRating} />
                        </div>
                        {level === 'major' && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CCC comparison */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                CCC Assessment — Side-by-Side
              </h4>
              <div className="space-y-2">
                {detail.ccc.map((c, i) => {
                  const level = cccDiffLevel(c.selfRating, c.managerRating);
                  return (
                    <div
                      key={c.dimension}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${diffColor(level)}`}
                    >
                      <span className="text-xs text-muted-foreground flex items-center gap-2 flex-1">
                        <LACIndicator
                          action={c.lac}
                          onClick={() => cycleLAC(person.id, 'ccc', i)}
                        />
                        {c.dimension}
                      </span>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground/60 mb-0.5">Self</p>
                          <CCCRatingBadge rating={c.selfRating} />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground/60 mb-0.5">Manager</p>
                          <CCCRatingBadge rating={c.managerRating} />
                        </div>
                        {level === 'major' && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall rating comparison */}
            <div className="flex items-center gap-4 rounded-lg bg-primary/5 px-4 py-3">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <div className="flex-1 flex items-center gap-6">
                <div>
                  <p className="text-[10px] text-muted-foreground/60">Self Rating</p>
                  <p className="text-sm font-semibold text-foreground">
                    {detail.overallSelfRating}/5.0
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/60">Manager Rating</p>
                  <p className="text-sm font-semibold text-foreground">
                    {detail.overallManagerRating}/5.0
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/60">Difference</p>
                  <p className={`text-sm font-semibold ${
                    Math.abs(detail.overallSelfRating - detail.overallManagerRating) <= 0.3
                      ? 'text-green-400'
                      : Math.abs(detail.overallSelfRating - detail.overallManagerRating) <= 0.8
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}>
                    {Math.abs(detail.overallSelfRating - detail.overallManagerRating).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* LAC summary */}
            <div className="flex items-center gap-4 rounded-lg bg-muted/30 px-4 py-3">
              <Award className="h-4 w-4 text-indigo-400" />
              <LACSummary detail={detail} />
            </div>
          </>
        )}

        {/* Summary view */}
        {currentTab === 'summary' && (
          <>
            {/* Core Values */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Core Values Alignment
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {detail.coreValues.map((cv, i) => (
                  <div
                    key={cv.value}
                    className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <LACIndicator
                        action={cv.lac}
                        onClick={() => cycleLAC(person.id, 'cv', i)}
                      />
                      {cv.value}
                    </span>
                    <CoreValueRatingDot rating={cv.managerRating} />
                  </div>
                ))}
              </div>
            </div>

            {/* CCC */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                CCC Assessment
              </h4>
              <div className="flex flex-wrap gap-3">
                {detail.ccc.map((c, i) => (
                  <div
                    key={c.dimension}
                    className="rounded-lg bg-muted/30 px-4 py-3 text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <LACIndicator
                        action={c.lac}
                        onClick={() => cycleLAC(person.id, 'ccc', i)}
                      />
                      <p className="text-xs text-muted-foreground">{c.dimension}</p>
                    </div>
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        c.managerRating === 'Exceeds'
                          ? 'text-green-400'
                          : c.managerRating === 'Meets'
                            ? 'text-blue-400'
                            : 'text-red-400'
                      }`}
                    >
                      {c.managerRating}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* LAC summary */}
            <div className="flex items-center gap-4 rounded-lg bg-muted/30 px-4 py-3">
              <Award className="h-4 w-4 text-indigo-400" />
              <LACSummary detail={detail} />
            </div>

            {/* Goal Retrospective */}
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Goal Retrospective
              </h4>
              <div className="space-y-2">
                {detail.goalRetro.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg bg-muted/30 px-3 py-2"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGoalMet(person.id, i);
                      }}
                      className="mt-0.5 shrink-0 hover:opacity-70 transition-opacity"
                    >
                      {g.met ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-red-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{g.goal}</p>
                      <p className="text-[11px] text-muted-foreground">{g.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Growth */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400/60">
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {detail.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400/40" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400/60">
                  Areas for Growth
                </h4>
                <ul className="space-y-1.5">
                  {detail.growthAreas.map((g, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/40" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-3">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Overall Rating: {detail.overallManagerRating}/5.0
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {detail.overallManagerRating >= 4.5
                    ? 'Outstanding performance'
                    : detail.overallManagerRating >= 3.5
                      ? 'Exceeds expectations in most areas'
                      : detail.overallManagerRating >= 2.5
                        ? 'Meets expectations'
                        : 'Below expectations — coaching plan recommended'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Signature status */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            Electronic Signatures
          </h4>
          <div className="flex flex-wrap gap-3">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
              detail.selfSigned
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-border bg-muted/30'
            }`}>
              {detail.selfSigned ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40" />
              )}
              <div>
                <p className="text-xs font-medium text-foreground">
                  {person.name} (Self)
                </p>
                {detail.selfSigned && detail.selfSignedDate ? (
                  <p className="text-[10px] text-green-400">Signed {detail.selfSignedDate}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground/60">Awaiting signature</p>
                )}
              </div>
              {!detail.selfSigned && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-6 px-2 text-[10px] text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSignatureModal({ personId: person.id, role: 'self' });
                  }}
                >
                  Sign
                </Button>
              )}
            </div>
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
              detail.managerSigned
                ? 'border-green-500/20 bg-green-500/5'
                : 'border-border bg-muted/30'
            }`}>
              {detail.managerSigned ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40" />
              )}
              <div>
                <p className="text-xs font-medium text-foreground">
                  {person.manager} (Manager)
                </p>
                {detail.managerSigned && detail.managerSignedDate ? (
                  <p className="text-[10px] text-green-400">Signed {detail.managerSignedDate}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground/60">Awaiting signature</p>
                )}
              </div>
              {!detail.managerSigned && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-2 h-6 px-2 text-[10px] text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSignatureModal({ personId: person.id, role: 'manager' });
                  }}
                >
                  Sign
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setScheduleModal(person.id);
            }}
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule Discussion
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              toast.success(`Exporting review for ${person.name} to PDF...`, { duration: 2000 });
            }}
          >
            <Printer className="h-3.5 w-3.5" />
            Print/Export
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setActionItemModal(person.id);
              setActionItemTitle(`Follow-up: ${person.name} Q1 Review`);
              setActionItemDesc('');
              setActionItemDue('');
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Follow-up Action
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Quarterly Reviews
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage performance reviews and team development
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-muted/50 p-1 w-fit max-w-full">
        <div className="flex flex-wrap items-center gap-1">
        {(['current', 'past', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'current' && 'Current Cycle'}
            {tab === 'past' && 'Past Reviews'}
            {tab === 'templates' && 'Templates'}
          </button>
        ))}
        </div>
      </div>

      {/* Current Cycle */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {/* Cycle header card */}
          <div className="glass rounded-xl p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">
                    Q1 2026 Review Cycle
                  </h2>
                  <Badge
                    variant="outline"
                    className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[10px]"
                  >
                    In Progress
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-red-400/10 text-red-400 border-red-400/20 text-[10px] gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    11 days remaining
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review period: January 1 - March 31, 2026
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {completedCount} of {totalCount} reviews completed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((completedCount / totalCount) * 100)}% complete
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                    onClick={() => {
                      const pending = reviewPeople.filter(
                        (p) => (personSteps[p.id] ?? p.step) !== 'Complete'
                      ).length;
                      toast.success(`Reminders sent to ${pending} pending reviewers`, { duration: 2500 });
                    }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Reminders
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg px-3 text-xs bg-primary text-primary-foreground"
                    onClick={() => {
                      setNewCycleModal(true);
                      setCycleName('');
                      setCycleStart('');
                      setCycleEnd('');
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Start New Cycle
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={(completedCount / totalCount) * 100} className="h-1.5 bg-muted/30" />
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass border-border bg-muted/30 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
            />
          </div>

          {/* Review cards */}
          <div className="space-y-3">
            {filtered.map((person) => {
              const currentStep = personSteps[person.id] ?? person.step;
              const isExpanded = expandedReview === person.id;

              return (
                <div key={person.id} className="glass rounded-xl transition-all duration-300">
                  {/* Main row */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/20 rounded-xl transition-colors"
                    onClick={() =>
                      setExpandedReview(isExpanded ? null : person.id)
                    }
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-primary">
                      {person.initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {person.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {person.role}
                        </span>
                        {localDetails[person.id] && (
                          <div className="hidden sm:flex items-center gap-1 ml-2">
                            {localDetails[person.id].selfFormComplete && localDetails[person.id].managerFormComplete ? (
                              <Badge
                                variant="outline"
                                className="text-[9px] bg-green-400/10 text-green-400 border-green-400/20 gap-0.5"
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Both Forms
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[9px] bg-amber-400/10 text-amber-400 border-amber-400/20"
                              >
                                {localDetails[person.id].selfFormComplete ? '1' : '0'}/2 Forms
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <StepIndicator currentStep={currentStep} />
                        <span
                          className={`text-[10px] font-medium ${
                            currentStep === 'Complete'
                              ? 'text-green-400'
                              : currentStep === 'Not Started'
                                ? 'text-muted-foreground/60'
                                : 'text-amber-400'
                          }`}
                        >
                          {currentStep}
                        </span>
                      </div>
                    </div>

                    {/* Action + chevron */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={currentStep === 'Complete' ? 'ghost' : 'default'}
                        className={`h-8 rounded-lg px-3 text-xs font-medium gap-1.5 ${
                          currentStep === 'Complete'
                            ? 'text-primary hover:bg-primary/10'
                            : currentStep === 'Not Started'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentStep === 'Complete') {
                            setExpandedReview(person.id);
                            setDetailTab(person.id, 'summary');
                            setReviewFormModal({ personId: person.id, mode: 'view' });
                          } else if (currentStep === 'Not Started') {
                            setReviewFormModal({ personId: person.id, mode: 'start' });
                          } else {
                            setReviewFormModal({ personId: person.id, mode: 'continue' });
                          }
                        }}
                      >
                        {currentStep === 'Complete' && <Eye className="h-3.5 w-3.5" />}
                        {currentStep === 'Not Started' && <Play className="h-3.5 w-3.5" />}
                        {currentStep !== 'Complete' && currentStep !== 'Not Started' && <PenLine className="h-3.5 w-3.5" />}
                        {currentStep === 'Complete'
                          ? 'View'
                          : currentStep === 'Not Started'
                            ? 'Start Review'
                            : 'Continue'}
                      </Button>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && renderDetailContent(person)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Reviews */}
      {activeTab === 'past' && (
        <div className="space-y-3">
          {pastCycles.map((cycle) => {
            const isExpanded = pastCycleExpanded === cycle.period;
            return (
              <div
                key={cycle.period}
                className="glass rounded-xl transition-all duration-300"
              >
                <div
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 cursor-pointer hover:bg-muted/20 rounded-xl transition-colors"
                  onClick={() => setPastCycleExpanded(isExpanded ? null : cycle.period)}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {cycle.period} Review Cycle
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {cycle.completed} reviews
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        {cycle.avgRating}/5.0 avg rating
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-green-400/10 text-green-400 border-green-400/20"
                      >
                        Completed
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Exporting ${cycle.period} reviews to PDF...`, { duration: 2000 });
                      }}
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPastCycleExpanded(isExpanded ? null : cycle.period);
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View All
                    </Button>
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 p-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {reviewPeople.slice(0, cycle.people).map((person) => (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-primary">
                            {person.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{person.name}</p>
                            <p className="text-[10px] text-muted-foreground">{person.role}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-foreground">
                              {(3.5 + ((person.name.charCodeAt(0) % 15) / 10)).toFixed(1)}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-green-400/10 text-green-400 border-green-400/20"
                          >
                            Complete
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.name}
              className="glass glass-hover rounded-xl p-5 cursor-pointer transition-all duration-300"
              onClick={() => setTemplatePreview(template)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                  <p className="mt-2 text-[11px] text-muted-foreground/60">
                    {template.sections} sections
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast('Coming soon', {
                        description: 'Template customization will be available in a future update.',
                        duration: 2500,
                      });
                    }}
                  >
                    <PenLine className="h-3.5 w-3.5 mr-1.5" />
                    Customize
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 shrink-0 rounded-lg px-3 text-xs bg-primary text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`New review started with "${template.name}" template`, {
                        description: 'Select a team member to begin the review.',
                        duration: 3000,
                      });
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------------------------------
          Modals
      --------------------------------------------------------------------------- */}

      {/* Signature confirmation modal */}
      <Dialog
        open={signatureModal !== null}
        onOpenChange={(open) => {
          if (!open) setSignatureModal(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              Sign & Submit Review
            </DialogTitle>
            <DialogDescription>
              By signing, you confirm that this review is accurate and has been discussed.
              {signatureModal && (
                <span className="block mt-1 text-foreground font-medium">
                  Signing as: {signatureModal.role === 'self'
                    ? reviewPeople.find((p) => p.id === signatureModal.personId)?.name
                    : reviewPeople.find((p) => p.id === signatureModal.personId)?.manager
                  } ({signatureModal.role === 'self' ? 'Self' : 'Manager'})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              I confirm this performance review is accurate and reflects our discussion.
              I understand both parties must sign for the review to be marked as complete.
            </p>
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
              onClick={handleSign}
              className="h-8 gap-1.5 rounded-lg bg-green-600 px-4 text-xs font-medium text-white hover:bg-green-500"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sign & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule discussion modal */}
      <Dialog
        open={scheduleModal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setScheduleModal(null);
            setScheduleDate('');
            setScheduleTime('10:00');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              Schedule Discussion
            </DialogTitle>
            <DialogDescription>
              {scheduleModal && (
                <>
                  Schedule a review discussion with{' '}
                  <span className="text-foreground font-medium">
                    {reviewPeople.find((p) => p.id === scheduleModal)?.name}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="glass border-border bg-muted/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label>
              <Input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="glass border-border bg-muted/30 text-foreground"
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
              onClick={() => {
                const person = reviewPeople.find((p) => p.id === scheduleModal);
                toast.success(`Discussion scheduled with ${person?.name}`, {
                  description: `${scheduleDate || 'TBD'} at ${scheduleTime || 'TBD'}`,
                  duration: 3000,
                });
                setScheduleModal(null);
                setScheduleDate('');
                setScheduleTime('10:00');
              }}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              <Calendar className="h-3.5 w-3.5" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create follow-up action modal */}
      <Dialog
        open={actionItemModal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActionItemModal(null);
            setActionItemTitle('');
            setActionItemDesc('');
            setActionItemDue('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-400" />
              Create Follow-up Action Item
            </DialogTitle>
            <DialogDescription>
              Create an action item from this review discussion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title</label>
              <Input
                value={actionItemTitle}
                onChange={(e) => setActionItemTitle(e.target.value)}
                placeholder="Action item title..."
                className="glass border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea
                value={actionItemDesc}
                onChange={(e) => setActionItemDesc(e.target.value)}
                placeholder="Details about the follow-up action..."
                rows={3}
                className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
              <Input
                type="date"
                value={actionItemDue}
                onChange={(e) => setActionItemDue(e.target.value)}
                className="glass border-border bg-muted/30 text-foreground"
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
              onClick={() => {
                toast.success('Action item created', {
                  description: actionItemTitle || 'Follow-up action',
                  duration: 3000,
                });
                setActionItemModal(null);
                setActionItemTitle('');
                setActionItemDesc('');
                setActionItemDue('');
              }}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New cycle modal */}
      <Dialog
        open={newCycleModal}
        onOpenChange={(open) => {
          if (!open) {
            setNewCycleModal(false);
            setCycleName('');
            setCycleStart('');
            setCycleEnd('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-400" />
              Start New Review Cycle
            </DialogTitle>
            <DialogDescription>
              Create a new quarterly review cycle for your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Cycle Name</label>
              <Input
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                placeholder="e.g., Q2 2026 Review Cycle"
                className="glass border-border bg-muted/30 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={cycleStart}
                  onChange={(e) => setCycleStart(e.target.value)}
                  className="glass border-border bg-muted/30 text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={cycleEnd}
                  onChange={(e) => setCycleEnd(e.target.value)}
                  className="glass border-border bg-muted/30 text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Participants</label>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-foreground">{totalCount} team members</p>
                <p className="text-[10px] text-muted-foreground">All active employees with org chart seats</p>
              </div>
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
              onClick={() => {
                toast.success(`Review cycle "${cycleName || 'New Cycle'}" created`, {
                  description: `${totalCount} team members enrolled. Notification emails sent.`,
                  duration: 3000,
                });
                setNewCycleModal(false);
                setCycleName('');
                setCycleStart('');
                setCycleEnd('');
              }}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template preview modal */}
      <Dialog
        open={templatePreview !== null}
        onOpenChange={(open) => {
          if (!open) setTemplatePreview(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              {templatePreview?.name}
            </DialogTitle>
            <DialogDescription>
              {templatePreview?.description}
            </DialogDescription>
          </DialogHeader>
          {templatePreview && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                Template Structure ({templatePreview.sections} sections)
              </h4>
              <div className="space-y-1.5">
                {templatePreview.structure.map((section, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">{section}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                toast('Coming soon', {
                  description: 'Template customization will be available in a future update.',
                  duration: 2500,
                });
              }}
            >
              <PenLine className="h-3.5 w-3.5 mr-1.5" />
              Customize Template
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success(`New review started with "${templatePreview?.name}" template`, {
                  description: 'Select a team member to begin the review.',
                  duration: 3000,
                });
                setTemplatePreview(null);
              }}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review form modal (start/continue/view) */}
      <Dialog
        open={reviewFormModal !== null}
        onOpenChange={(open) => {
          if (!open) setReviewFormModal(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewFormModal?.mode === 'start' && <Play className="h-4 w-4 text-green-400" />}
              {reviewFormModal?.mode === 'continue' && <PenLine className="h-4 w-4 text-amber-400" />}
              {reviewFormModal?.mode === 'view' && <Eye className="h-4 w-4 text-indigo-400" />}
              {reviewFormModal?.mode === 'start' && 'Start Review'}
              {reviewFormModal?.mode === 'continue' && 'Continue Review'}
              {reviewFormModal?.mode === 'view' && 'View Completed Review'}
            </DialogTitle>
            <DialogDescription>
              {reviewFormModal && (
                <>
                  {reviewFormModal.mode === 'start' && 'This will create a new review and notify both parties to complete their assessment forms.'}
                  {reviewFormModal.mode === 'continue' && `Resume the in-progress review. Current step: ${personSteps[reviewFormModal.personId] ?? 'Unknown'}`}
                  {reviewFormModal.mode === 'view' && 'View the completed review details below.'}
                  <span className="block mt-1 text-foreground font-medium">
                    {reviewPeople.find((p) => p.id === reviewFormModal.personId)?.name} —{' '}
                    {reviewPeople.find((p) => p.id === reviewFormModal.personId)?.role}
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {reviewFormModal && (
            <div className="space-y-2">
              {['Core Values Assessment', 'CCC Assessment', 'Rock/Goal Retrospective', 'Performance Data', 'Strengths & Growth', 'Overall Rating'].map((section, i) => {
                const currentStep = reviewFormModal.mode === 'view' ? 6 : reviewFormModal.mode === 'continue' ? 3 : 0;
                return (
                  <div
                    key={section}
                    className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2"
                  >
                    {i < currentStep ? (
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    ) : i === currentStep ? (
                      <div className="h-4 w-4 rounded-full border-2 border-amber-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                    )}
                    <span className={`text-xs ${i <= currentStep ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                      {section}
                    </span>
                  </div>
                );
              })}
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
              {reviewFormModal?.mode === 'view' ? 'Close' : 'Cancel'}
            </DialogClose>
            {reviewFormModal?.mode !== 'view' && (
              <Button
                size="sm"
                onClick={() => {
                  if (reviewFormModal) {
                    const person = reviewPeople.find((p) => p.id === reviewFormModal.personId);
                    if (reviewFormModal.mode === 'start') {
                      setPersonSteps((prev) => ({ ...prev, [reviewFormModal.personId]: 'Self-Assessment' }));
                      toast.success(`Review started for ${person?.name}`, {
                        description: 'Self-assessment form is now active. Notification sent.',
                        duration: 3000,
                      });
                      setExpandedReview(reviewFormModal.personId);
                      setDetailTab(reviewFormModal.personId, 'self');
                    } else {
                      const currentStep = personSteps[reviewFormModal.personId];
                      const nextStep = steps[Math.min(steps.indexOf(currentStep ?? 'Self-Assessment') + 1, steps.length - 1)];
                      setPersonSteps((prev) => ({ ...prev, [reviewFormModal.personId]: nextStep }));
                      toast.success(`Review advanced to "${nextStep}" for ${person?.name}`, { duration: 2500 });
                      setExpandedReview(reviewFormModal.personId);
                    }
                  }
                  setReviewFormModal(null);
                }}
                className={`h-8 gap-1.5 rounded-lg px-4 text-xs font-medium text-white ${
                  reviewFormModal?.mode === 'start'
                    ? 'bg-green-600 hover:bg-green-500'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {reviewFormModal?.mode === 'start' && <Play className="h-3.5 w-3.5" />}
                {reviewFormModal?.mode === 'continue' && <PenLine className="h-3.5 w-3.5" />}
                {reviewFormModal?.mode === 'start' ? 'Start Review' : 'Advance to Next Step'}
              </Button>
            )}
            {reviewFormModal?.mode === 'view' && (
              <Button
                size="sm"
                onClick={() => {
                  if (reviewFormModal) {
                    setExpandedReview(reviewFormModal.personId);
                    setDetailTab(reviewFormModal.personId, 'summary');
                  }
                  setReviewFormModal(null);
                }}
                className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
              >
                <Eye className="h-3.5 w-3.5" />
                View Details
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
