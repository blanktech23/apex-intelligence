'use client';

import { useState, useCallback } from 'react';
import {
  ClipboardCheck,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Star,
  FileText,
  Plus,
  Download,
  Filter,
  X,
  Sparkles,
  Shield,
  Heart,
  Zap,
  Brain,
  Eye,
  Layers,
  Settings,
  UserCheck,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AssessmentTab = 'baseline' | 'org-fit' | 'custom';
type CoreValueRating = '+' | '+/-' | '-';
type QuestionType = 'rating' | 'multiple-choice' | 'yes-no' | 'open-text';
type CustomAssessmentStatus = 'Active' | 'Draft' | 'Closed';

interface BaselineCategory {
  id: string;
  name: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  questions: { text: string; score: number }[];
  previousScore: number;
}

interface OrgFitPerson {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  coreValues: { value: string; rating: CoreValueRating }[];
  roleFit: 'Strong Fit' | 'Good Fit' | 'Needs Development';
  overallScore: number;
}

interface CustomQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
}

interface CustomAssessment {
  id: string;
  title: string;
  description: string;
  status: CustomAssessmentStatus;
  questions: CustomQuestion[];
  respondents: number;
  totalRecipients: number;
  createdAt: string;
  closedAt?: string;
  results?: { questionId: string; avgScore?: number; distribution?: Record<string, number> }[];
}

// ---------------------------------------------------------------------------
// Mock Data — Baseline Assessment
// ---------------------------------------------------------------------------

const baselineCategories: BaselineCategory[] = [
  {
    id: 'vision',
    name: 'Vision',
    icon: Eye,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10',
    previousScore: 3.6,
    questions: [
      { text: 'Leadership team has a shared, compelling vision for the company', score: 4 },
      { text: 'The company purpose and core values are documented and visible', score: 5 },
      { text: 'All employees can articulate the company vision', score: 3 },
      { text: '10-year target and 3-year picture are clearly defined', score: 4 },
      { text: 'Marketing strategy aligns with the vision', score: 4 },
    ],
  },
  {
    id: 'people',
    name: 'People',
    icon: Users,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    previousScore: 3.4,
    questions: [
      { text: 'Right people are in the right seats across the org', score: 4 },
      { text: 'The accountability chart is clear and up-to-date', score: 4 },
      { text: 'Every seat has documented roles and responsibilities', score: 3 },
      { text: 'Performance issues are addressed promptly', score: 3 },
      { text: 'Hiring process consistently brings in A-players', score: 4 },
    ],
  },
  {
    id: 'data',
    name: 'Data',
    icon: BarChart3,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    previousScore: 3.0,
    questions: [
      { text: 'Company scorecard is reviewed weekly by leadership', score: 4 },
      { text: 'Every employee has at least one measurable KPI', score: 3 },
      { text: 'Data drives decisions rather than gut feelings', score: 4 },
      { text: 'Leading indicators are tracked alongside lagging ones', score: 3 },
      { text: 'Dashboards are accessible to all relevant team members', score: 4 },
    ],
  },
  {
    id: 'process',
    name: 'Process',
    icon: Settings,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/10',
    previousScore: 2.8,
    questions: [
      { text: 'Core processes are documented and followed by everyone', score: 3 },
      { text: 'Processes are regularly reviewed and improved', score: 3 },
      { text: 'New employees can quickly learn processes through documentation', score: 4 },
      { text: 'There is a consistent way to measure process effectiveness', score: 3 },
      { text: 'Technology supports and automates key processes', score: 4 },
    ],
  },
  {
    id: 'traction',
    name: 'Traction',
    icon: Target,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10',
    previousScore: 3.8,
    questions: [
      { text: 'Quarterly goals (Rocks) are set and tracked rigorously', score: 5 },
      { text: 'Weekly meetings follow a structured agenda', score: 4 },
      { text: 'Issues are identified and resolved systematically', score: 4 },
      { text: 'There is strong accountability for commitments', score: 4 },
      { text: 'The organization consistently executes on priorities', score: 4 },
    ],
  },
  {
    id: 'issues',
    name: 'Issues',
    icon: Zap,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    previousScore: 3.2,
    questions: [
      { text: 'Issues are openly discussed without fear of retribution', score: 4 },
      { text: 'The IDS process is used consistently', score: 3 },
      { text: 'Issues are resolved permanently, not just temporarily', score: 3 },
      { text: 'Leadership team addresses tough issues head-on', score: 4 },
      { text: 'There is a clear prioritization system for issues', score: 4 },
    ],
  },
  {
    id: 'team-health',
    name: 'Team Health',
    icon: Heart,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10',
    previousScore: 3.6,
    questions: [
      { text: 'Leadership team has high trust and open communication', score: 4 },
      { text: 'Healthy conflict is encouraged during meetings', score: 4 },
      { text: 'Team members support each others decisions publicly', score: 4 },
      { text: 'Everyone is focused on organizational goals over personal ones', score: 3 },
      { text: 'The team holds each other accountable', score: 4 },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    icon: Shield,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10',
    previousScore: 3.4,
    questions: [
      { text: 'The Visionary and Integrator roles are clearly defined', score: 5 },
      { text: 'Leadership delegates effectively and avoids micromanaging', score: 4 },
      { text: 'Leaders model core values consistently', score: 4 },
      { text: 'Succession planning is in place for key roles', score: 3 },
      { text: 'Leaders invest in their own development', score: 4 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Mock Data — Org Fit Assessment
// ---------------------------------------------------------------------------

const companyValues = ['Integrity First', 'Relentless Quality', 'Team Over Individual', 'Own It', 'Innovate or Stagnate'];

const orgFitPeople: OrgFitPerson[] = [
  { id: 'of-001', name: 'Sarah Chen', initials: 'SC', role: 'VP of Sales & Marketing', department: 'Sales', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+/-' }, { value: 'Innovate or Stagnate', rating: '+' }], roleFit: 'Strong Fit', overallScore: 4.5 },
  { id: 'of-002', name: 'Mike Torres', initials: 'MT', role: 'VP of Operations', department: 'Operations', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+/-' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '+/-' }], roleFit: 'Good Fit', overallScore: 3.8 },
  { id: 'of-003', name: 'David Kim', initials: 'DK', role: 'Controller / Finance', department: 'Finance', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '+/-' }], roleFit: 'Strong Fit', overallScore: 4.3 },
  { id: 'of-004', name: 'Lisa Park', initials: 'LP', role: 'HR / People Director', department: 'People', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+/-' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '+' }], roleFit: 'Strong Fit', overallScore: 4.4 },
  { id: 'of-005', name: 'Carlos Rivera', initials: 'CR', role: 'Integrator / COO', department: 'Executive', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '+' }], roleFit: 'Strong Fit', overallScore: 4.8 },
  { id: 'of-006', name: 'Ryan Nakamura', initials: 'RN', role: 'Lead Estimator', department: 'Sales', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+/-' }, { value: 'Own It', rating: '+/-' }, { value: 'Innovate or Stagnate', rating: '-' }], roleFit: 'Good Fit', overallScore: 3.4 },
  { id: 'of-007', name: 'Kim Lee', initials: 'KL', role: 'Project Manager', department: 'Operations', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '+/-' }], roleFit: 'Strong Fit', overallScore: 4.2 },
  { id: 'of-008', name: 'Dan Parker', initials: 'DP', role: 'Site Superintendent', department: 'Operations', coreValues: [{ value: 'Integrity First', rating: '+/-' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '-' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '-' }], roleFit: 'Needs Development', overallScore: 2.8 },
  { id: 'of-009', name: 'Maria Gonzalez', initials: 'MG', role: 'AP/AR Specialist', department: 'Finance', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+/-' }, { value: 'Innovate or Stagnate', rating: '+/-' }], roleFit: 'Good Fit', overallScore: 3.6 },
  { id: 'of-010', name: 'James Taylor', initials: 'JT', role: 'Payroll Administrator', department: 'Finance', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+/-' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '-' }], roleFit: 'Good Fit', overallScore: 3.2 },
  { id: 'of-011', name: 'Tom Bradley', initials: 'TB', role: 'IT / Systems Admin', department: 'Operations', coreValues: [{ value: 'Integrity First', rating: '+' }, { value: 'Relentless Quality', rating: '+' }, { value: 'Team Over Individual', rating: '+/-' }, { value: 'Own It', rating: '+' }, { value: 'Innovate or Stagnate', rating: '+' }], roleFit: 'Strong Fit', overallScore: 4.1 },
  { id: 'of-012', name: 'Alex Flores', initials: 'AF', role: 'Business Dev Rep', department: 'Sales', coreValues: [{ value: 'Integrity First', rating: '+/-' }, { value: 'Relentless Quality', rating: '+/-' }, { value: 'Team Over Individual', rating: '+' }, { value: 'Own It', rating: '+/-' }, { value: 'Innovate or Stagnate', rating: '+' }], roleFit: 'Needs Development', overallScore: 2.9 },
];

// ---------------------------------------------------------------------------
// Mock Data — Custom Assessments
// ---------------------------------------------------------------------------

const initialCustomAssessments: CustomAssessment[] = [
  {
    id: 'ca-001',
    title: 'Q1 2026 Employee Engagement Survey',
    description: 'Quarterly pulse check on employee satisfaction, engagement, and workplace culture.',
    status: 'Active',
    createdAt: '2026-01-15',
    questions: [
      { id: 'q1', text: 'How satisfied are you with your current role?', type: 'rating' },
      { id: 'q2', text: 'Do you feel your contributions are recognized?', type: 'yes-no' },
      { id: 'q3', text: 'How would you rate team communication?', type: 'rating' },
      { id: 'q4', text: 'What area needs the most improvement?', type: 'multiple-choice', options: ['Communication', 'Work-Life Balance', 'Career Growth', 'Compensation', 'Management'] },
      { id: 'q5', text: 'Any additional feedback?', type: 'open-text' },
    ],
    respondents: 9,
    totalRecipients: 12,
    results: [
      { questionId: 'q1', avgScore: 4.1 },
      { questionId: 'q2', distribution: { Yes: 7, No: 2 } },
      { questionId: 'q3', avgScore: 3.6 },
      { questionId: 'q4', distribution: { Communication: 2, 'Work-Life Balance': 3, 'Career Growth': 2, Compensation: 1, Management: 1 } },
    ],
  },
  {
    id: 'ca-002',
    title: 'Safety Culture Assessment',
    description: 'Evaluate the organization\'s safety culture and identify areas for improvement.',
    status: 'Closed',
    createdAt: '2025-10-01',
    closedAt: '2025-10-31',
    questions: [
      { id: 'sq1', text: 'How well does leadership prioritize safety?', type: 'rating' },
      { id: 'sq2', text: 'Do you feel comfortable reporting safety concerns?', type: 'yes-no' },
      { id: 'sq3', text: 'How would you rate the safety training provided?', type: 'rating' },
      { id: 'sq4', text: 'What is the biggest safety concern on your job site?', type: 'open-text' },
    ],
    respondents: 11,
    totalRecipients: 11,
    results: [
      { questionId: 'sq1', avgScore: 4.3 },
      { questionId: 'sq2', distribution: { Yes: 10, No: 1 } },
      { questionId: 'sq3', avgScore: 3.9 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: score color
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 4) return 'text-green-600 dark:text-green-400';
  if (score >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 4) return 'bg-green-400';
  if (score >= 3) return 'bg-amber-400';
  return 'bg-red-400';
}

function scoreGlow(score: number): string {
  if (score >= 4) return 'shadow-[0_0_8px_rgba(34,197,94,0.4)]';
  if (score >= 3) return 'shadow-[0_0_8px_rgba(245,158,11,0.4)]';
  return 'shadow-[0_0_8px_rgba(239,68,68,0.4)]';
}

// ---------------------------------------------------------------------------
// Helper: CoreValueRating dot
// ---------------------------------------------------------------------------

function CoreValueDot({ rating }: { rating: CoreValueRating }) {
  const config = {
    '+': { color: 'bg-green-400', text: 'text-green-600 dark:text-green-400' },
    '+/-': { color: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400' },
    '-': { color: 'bg-red-400', text: 'text-red-600 dark:text-red-400' },
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
// SVG Radar Chart
// ---------------------------------------------------------------------------

function RadarChart({
  categories,
  size = 280,
}: {
  categories: { name: string; score: number; previousScore: number }[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size / 2 - 36;
  const levels = 5;
  const n = categories.length;

  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  function polarToCart(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  // Grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = (maxRadius / levels) * (i + 1);
    const points = Array.from({ length: n }, (_, j) => {
      const p = polarToCart(startAngle + j * angleStep, r);
      return `${p.x},${p.y}`;
    }).join(' ');
    return <polygon key={i} points={points} fill="none" className="stroke-foreground/[0.08]" strokeWidth="1" />;
  });

  // Axis lines
  const axisLines = Array.from({ length: n }, (_, i) => {
    const p = polarToCart(startAngle + i * angleStep, maxRadius);
    return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-foreground/[0.1]" strokeWidth="1" />;
  });

  // Data polygon (current)
  const currentPoints = categories.map((cat, i) => {
    const r = (cat.score / 5) * maxRadius;
    const p = polarToCart(startAngle + i * angleStep, r);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Data polygon (previous)
  const previousPoints = categories.map((cat, i) => {
    const r = (cat.previousScore / 5) * maxRadius;
    const p = polarToCart(startAngle + i * angleStep, r);
    return `${p.x},${p.y}`;
  }).join(' ');

  // Labels
  const labels = categories.map((cat, i) => {
    const labelR = maxRadius + 22;
    const p = polarToCart(startAngle + i * angleStep, labelR);
    return (
      <text
        key={i}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[10px]"
      >
        {cat.name}
      </text>
    );
  });

  // Score dots
  const scoreDots = categories.map((cat, i) => {
    const r = (cat.score / 5) * maxRadius;
    const p = polarToCart(startAngle + i * angleStep, r);
    return (
      <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-indigo-400" />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridRings}
      {axisLines}
      {/* Previous quarter */}
      <polygon
        points={previousPoints}
        fill="rgba(148,163,184,0.06)"
        stroke="rgba(148,163,184,0.3)"
        strokeWidth="1"
        strokeDasharray="4 3"
      />
      {/* Current quarter */}
      <polygon
        points={currentPoints}
        fill="rgba(99,102,241,0.12)"
        stroke="rgba(129,140,248,0.7)"
        strokeWidth="2"
      />
      {scoreDots}
      {labels}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Progress Ring
// ---------------------------------------------------------------------------

function ProgressRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 5) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-foreground/[0.08]"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score >= 4 ? '#4ade80' : score >= 3 ? '#fbbf24' : '#f87171'}
          strokeWidth="3"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${scoreColor(score)}`}>{score.toFixed(1)}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create Assessment Modal
// ---------------------------------------------------------------------------

function CreateAssessmentModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (assessment: CustomAssessment) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('rating');

  const addQuestion = () => {
    if (!newQText.trim()) return;
    setQuestions((prev) => [
      ...prev,
      {
        id: `nq-${Date.now()}`,
        text: newQText,
        type: newQType,
        ...(newQType === 'multiple-choice'
          ? { options: ['Option A', 'Option B', 'Option C'] }
          : {}),
      },
    ]);
    setNewQText('');
    toast.success('Question added');
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    const newAssessment: CustomAssessment = {
      id: `ca-${Date.now()}`,
      title,
      description,
      status: 'Draft',
      createdAt: new Date().toISOString().split('T')[0],
      questions,
      respondents: 0,
      totalRecipients: 12,
    };
    onSave(newAssessment);
    setTitle('');
    setDescription('');
    setQuestions([]);
    onClose();
    toast.success('Assessment created as draft');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-background border border-border/50 p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Create Assessment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
          <Input
            placeholder="Assessment title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
          <textarea
            placeholder="Describe the purpose of this assessment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-input bg-muted/30 px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Questions list */}
        {questions.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Questions ({questions.length})
            </label>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground/50 mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">{q.text}</p>
                    <span className="text-[10px] text-muted-foreground/60 capitalize">{q.type.replace('-', ' ')}</span>
                  </div>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-muted-foreground/40 hover:text-red-400 transition-colors shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add question */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground block">Add Question</label>
          <div className="flex gap-2">
            <Input
              placeholder="Question text..."
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              className="glass border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
            />
            <select
              value={newQType}
              onChange={(e) => setNewQType(e.target.value as QuestionType)}
              className="rounded-lg border border-input bg-muted/30 px-2 py-1 text-xs text-foreground focus:border-indigo-500/50 focus:outline-none"
            >
              <option value="rating">Rating (1-5)</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="yes-no">Yes / No</option>
              <option value="open-text">Open Text</option>
            </select>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 text-xs text-indigo-400 hover:bg-indigo-500/10"
            onClick={addQuestion}
          >
            <Plus className="h-3 w-3" /> Add Question
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 text-xs bg-primary text-primary-foreground"
            onClick={handleSave}
          >
            Create Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal Bar for custom results
// ---------------------------------------------------------------------------

function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground w-6 text-right">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState<AssessmentTab>('baseline');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customAssessments, setCustomAssessments] = useState<CustomAssessment[]>(initialCustomAssessments);
  const [expandedCustom, setExpandedCustom] = useState<string | null>(null);
  const [expandedOrgPerson, setExpandedOrgPerson] = useState<string | null>(null);

  // Baseline scoring with local editable state
  const [baselineScores, setBaselineScores] = useState<Record<string, number[]>>(() => {
    const initial: Record<string, number[]> = {};
    baselineCategories.forEach((cat) => {
      initial[cat.id] = cat.questions.map((q) => q.score);
    });
    return initial;
  });

  const getCategoryAvg = useCallback(
    (catId: string) => {
      const scores = baselineScores[catId];
      if (!scores || scores.length === 0) return 0;
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    },
    [baselineScores]
  );

  const overallBaseline = baselineCategories.reduce((sum, cat) => sum + getCategoryAvg(cat.id), 0) / baselineCategories.length;

  const updateScore = (catId: string, qIndex: number, newScore: number) => {
    setBaselineScores((prev) => {
      const updated = { ...prev };
      updated[catId] = [...prev[catId]];
      updated[catId][qIndex] = newScore;
      return updated;
    });
    toast.success(`Score updated to ${newScore}`);
  };

  // Org Fit filtering
  const departments = ['all', ...Array.from(new Set(orgFitPeople.map((p) => p.department)))];
  const filteredOrgFit = orgFitPeople.filter((p) => {
    const matchesDept = departmentFilter === 'all' || p.department === departmentFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const avgTeamHealth = orgFitPeople.reduce((sum, p) => sum + p.overallScore, 0) / orgFitPeople.length;

  // Custom assessment handlers
  const handleCreateAssessment = (assessment: CustomAssessment) => {
    setCustomAssessments((prev) => [assessment, ...prev]);
  };

  const handleStatusChange = (id: string, newStatus: CustomAssessmentStatus) => {
    setCustomAssessments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: newStatus, ...(newStatus === 'Closed' ? { closedAt: new Date().toISOString().split('T')[0] } : {}) }
          : a
      )
    );
    toast.success(`Assessment ${newStatus === 'Active' ? 'activated' : newStatus === 'Closed' ? 'closed' : 'moved to draft'}`);
  };

  const handleExport = () => {
    toast.success('Assessment results exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assessments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluate organizational health, team alignment, and custom surveys
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5" />
            Export Results
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-lg bg-muted/50 p-1 w-fit max-w-full">
        <div className="flex flex-wrap items-center gap-1">
        {([
          { key: 'baseline' as const, label: 'Baseline Assessment' },
          { key: 'org-fit' as const, label: 'Organizational Fit' },
          { key: 'custom' as const, label: 'Custom Assessments' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-md px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
            {key === 'custom' && (
              <Badge
                variant="outline"
                className="bg-cyan-500/15 text-cyan-400 border-cyan-500/20 text-[9px] px-1.5 py-0"
              >
                Beta
              </Badge>
            )}
          </button>
        ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* BASELINE ASSESSMENT TAB                                          */}
      {/* ================================================================ */}
      {activeTab === 'baseline' && (
        <div className="space-y-6">
          {/* Overview Card with Radar Chart */}
          <div className="glass rounded-xl p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Left: summary */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">Baseline Health Score</h2>
                  <Badge
                    variant="outline"
                    className="bg-green-400/10 text-green-600 dark:text-green-400 border-green-400/20 text-[10px]"
                  >
                    Q1 2026
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${scoreColor(overallBaseline)}`}>
                    {overallBaseline.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {baselineCategories.length} categories, {baselineCategories.length * 5} total questions
                </p>

                {/* Historical comparison */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 w-fit">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-6 rounded-full bg-indigo-400/70" />
                    <span className="text-[10px] text-muted-foreground">Q1 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-6 rounded-full bg-slate-400/30 border border-dashed border-slate-400/40" />
                    <span className="text-[10px] text-muted-foreground">Q4 2025</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-400" />
                    <span className="text-[10px] font-medium text-green-600 dark:text-green-400">+0.5 avg improvement</span>
                  </div>
                </div>

                {/* Category summary bars */}
                <div className="space-y-2 mt-2">
                  {baselineCategories.map((cat) => {
                    const avg = getCategoryAvg(cat.id);
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <div className={`inline-flex rounded p-1 ${cat.iconBg}`}>
                          <Icon className={`h-3 w-3 ${cat.iconColor}`} />
                        </div>
                        <span className="text-xs text-muted-foreground w-20 shrink-0">{cat.name}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${scoreBg(avg)}`}
                            style={{ width: `${(avg / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold w-8 text-right ${scoreColor(avg)}`}>
                          {avg.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Radar Chart */}
              <div className="flex items-center justify-center lg:justify-end">
                <RadarChart
                  categories={baselineCategories.map((cat) => ({
                    name: cat.name,
                    score: getCategoryAvg(cat.id),
                    previousScore: cat.previousScore,
                  }))}
                  size={280}
                />
              </div>
            </div>
          </div>

          {/* Category Cards */}
          <div className="space-y-3">
            {baselineCategories.map((cat) => {
              const avg = getCategoryAvg(cat.id);
              const isExpanded = expandedCategory === cat.id;
              const Icon = cat.icon;
              const delta = avg - cat.previousScore;

              return (
                <div key={cat.id} className="glass rounded-xl transition-all duration-300">
                  {/* Header row */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/20 rounded-xl transition-colors"
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  >
                    <div className={`inline-flex rounded-lg p-2.5 ${cat.iconBg}`}>
                      <Icon className={`h-5 w-5 ${cat.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                        {delta > 0 ? (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
                            <TrendingUp className="h-3 w-3" />+{delta.toFixed(1)}
                          </span>
                        ) : delta < 0 ? (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                            <TrendingDown className="h-3 w-3" />{delta.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cat.questions.length} questions &middot; Previous: {cat.previousScore.toFixed(1)}
                      </p>
                    </div>
                    <ProgressRing score={avg} size={44} />
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded: individual questions */}
                  {isExpanded && (
                    <div className="border-t border-border/50 p-5 space-y-3">
                      {cat.questions.map((q, qi) => {
                        const currentScore = baselineScores[cat.id][qi];
                        return (
                          <div key={qi} className="flex items-start gap-3 rounded-lg bg-muted/30 px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{q.text}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  onClick={() => updateScore(cat.id, qi, val)}
                                  className={`h-7 w-7 rounded-md text-xs font-semibold transition-all ${
                                    val === currentScore
                                      ? `${scoreBg(val)} text-white ${scoreGlow(val)}`
                                      : val <= currentScore
                                        ? 'bg-muted/40 text-foreground'
                                        : 'bg-muted/20 text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground'
                                  }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          Category Average: <span className={`font-semibold ${scoreColor(avg)}`}>{avg.toFixed(1)}</span>
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-xs text-primary hover:bg-primary/10"
                          onClick={() => {
                            toast.success(`${cat.name} scores saved`);
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Save Scores
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ORGANIZATIONAL FIT TAB                                           */}
      {/* ================================================================ */}
      {activeTab === 'org-fit' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="inline-flex rounded-lg p-2.5 bg-green-500/10">
                  <UserCheck className="h-5 w-5 text-green-400" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {orgFitPeople.filter((p) => p.roleFit === 'Strong Fit').length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Strong Fit</p>
              <p className="mt-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                {Math.round((orgFitPeople.filter((p) => p.roleFit === 'Strong Fit').length / orgFitPeople.length) * 100)}% of team
              </p>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="inline-flex rounded-lg p-2.5 bg-amber-500/10">
                  <Users className="h-5 w-5 text-amber-400" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {orgFitPeople.filter((p) => p.roleFit === 'Good Fit').length}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Good Fit</p>
              <p className="mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                {Math.round((orgFitPeople.filter((p) => p.roleFit === 'Good Fit').length / orgFitPeople.length) * 100)}% of team
              </p>
            </div>
            <div className="glass rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="inline-flex rounded-lg p-2.5 bg-red-500/10">
                  <Heart className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {avgTeamHealth.toFixed(1)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Avg Team Health</p>
              <p className={`mt-1.5 text-xs font-medium ${scoreColor(avgTeamHealth)}`}>
                {avgTeamHealth >= 4 ? 'Excellent' : avgTeamHealth >= 3 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="glass border-border bg-muted/30 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                    departmentFilter === dept
                      ? 'bg-background text-foreground shadow-sm border border-border/50'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept}
                </button>
              ))}
            </div>
          </div>

          {/* Core Values Header Row */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="hidden lg:flex items-center gap-4 px-5 py-3 border-b border-border/30">
              <div className="w-56 shrink-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Team Member
                </span>
              </div>
              {companyValues.map((v) => (
                <div key={v} className="flex-1 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 truncate block">
                    {v}
                  </span>
                </div>
              ))}
              <div className="w-24 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Role Fit
                </span>
              </div>
              <div className="w-16 text-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  Score
                </span>
              </div>
              <div className="w-5" />
            </div>

            {/* Person rows */}
            {filteredOrgFit.map((person) => {
              const isExpanded = expandedOrgPerson === person.id;
              return (
                <div key={person.id} className="transition-all duration-300">
                  <div
                    className="flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors border-b border-border/10"
                    onClick={() => setExpandedOrgPerson(isExpanded ? null : person.id)}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 w-56 shrink-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-300">
                        {person.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{person.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{person.role}</p>
                      </div>
                    </div>

                    {/* Core value ratings - desktop */}
                    <div className="hidden lg:contents">
                      {person.coreValues.map((cv) => (
                        <div key={cv.value} className="flex-1 flex justify-center">
                          <CoreValueDot rating={cv.rating} />
                        </div>
                      ))}
                    </div>

                    {/* Core value ratings - mobile */}
                    <div className="flex flex-wrap gap-2 lg:hidden">
                      {person.coreValues.map((cv) => (
                        <div key={cv.value} className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground/60">{cv.value.split(' ')[0]}:</span>
                          <CoreValueDot rating={cv.rating} />
                        </div>
                      ))}
                    </div>

                    {/* Role Fit */}
                    <div className="w-24 flex justify-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          person.roleFit === 'Strong Fit'
                            ? 'bg-green-400/10 text-green-600 dark:text-green-400 border-green-400/20'
                            : person.roleFit === 'Good Fit'
                              ? 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-400/20'
                              : 'bg-red-400/10 text-red-600 dark:text-red-400 border-red-400/20'
                        }`}
                      >
                        {person.roleFit}
                      </Badge>
                    </div>

                    {/* Score */}
                    <div className="w-16 flex justify-center">
                      <span className={`text-sm font-bold ${scoreColor(person.overallScore)}`}>
                        {person.overallScore.toFixed(1)}
                      </span>
                    </div>

                    {/* Chevron */}
                    <ChevronRight
                      className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 py-4 bg-muted/20 border-b border-border/10 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Core Values breakdown */}
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                            Core Values Alignment
                          </h4>
                          <div className="space-y-2">
                            {person.coreValues.map((cv) => (
                              <div key={cv.value} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                                <span className="text-xs text-muted-foreground">{cv.value}</span>
                                <CoreValueDot rating={cv.rating} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Role details */}
                        <div>
                          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                            Seat Details
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-xs text-muted-foreground">Department</span>
                              <span className="text-xs font-medium text-foreground">{person.department}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-xs text-muted-foreground">Role Fit</span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  person.roleFit === 'Strong Fit'
                                    ? 'bg-green-400/10 text-green-600 dark:text-green-400 border-green-400/20'
                                    : person.roleFit === 'Good Fit'
                                      ? 'bg-amber-400/10 text-amber-600 dark:text-amber-400 border-amber-400/20'
                                      : 'bg-red-400/10 text-red-600 dark:text-red-400 border-red-400/20'
                                }`}
                              >
                                {person.roleFit}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-xs text-muted-foreground">Overall Score</span>
                              <span className={`text-sm font-bold ${scoreColor(person.overallScore)}`}>
                                {person.overallScore.toFixed(1)} / 5.0
                              </span>
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                              <span className="text-xs text-muted-foreground">Values Passed</span>
                              <span className="text-xs font-medium text-foreground">
                                {person.coreValues.filter((cv) => cv.rating === '+').length} of {person.coreValues.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredOrgFit.length === 0 && (
              <div className="flex flex-col items-center py-10 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">No team members match your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* CUSTOM ASSESSMENTS TAB                                           */}
      {/* ================================================================ */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {/* Beta notice */}
          <div className="glass rounded-xl p-4 flex items-start gap-3">
            <div className="inline-flex rounded-lg p-2 bg-cyan-500/10 shrink-0">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Custom Assessments is in Beta</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Create custom surveys to collect feedback from your team. Question types include ratings, multiple choice, yes/no, and open text.
              </p>
            </div>
          </div>

          {/* Assessment cards */}
          <div className="space-y-3">
            {customAssessments.map((assessment) => {
              const isExpanded = expandedCustom === assessment.id;
              const completionPct = Math.round((assessment.respondents / assessment.totalRecipients) * 100);

              return (
                <div key={assessment.id} className="glass rounded-xl transition-all duration-300">
                  {/* Main row */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 cursor-pointer hover:bg-muted/20 rounded-xl transition-colors"
                    onClick={() => setExpandedCustom(isExpanded ? null : assessment.id)}
                  >
                    {/* Icon + Title + Badge row */}
                    <div className="flex items-start sm:items-center gap-3 sm:flex-1 min-w-0">
                      <div className="inline-flex rounded-lg p-2.5 bg-indigo-500/10 shrink-0">
                        <ClipboardCheck className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">{assessment.title}</h3>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              assessment.status === 'Active'
                                ? 'bg-green-400/10 text-green-600 dark:text-green-400 border-green-400/20'
                                : assessment.status === 'Draft'
                                  ? 'bg-gray-400/10 text-gray-600 dark:text-gray-400 border-gray-400/20'
                                  : 'bg-red-400/10 text-red-600 dark:text-red-400 border-red-400/20'
                            }`}
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats row (questions, responses) */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground pl-[52px] sm:pl-0">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {assessment.questions.length} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assessment.respondents}/{assessment.totalRecipients} responses
                      </span>
                    </div>

                    {/* Date + Progress + Action row */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-[52px] sm:pl-0">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {assessment.createdAt}
                      </span>

                      {/* Completion progress */}
                      <div className="hidden sm:flex items-center gap-3 shrink-0">
                        <div className="w-20">
                          <Progress value={completionPct} className="h-1.5 bg-muted/30" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground w-8">
                          {completionPct}%
                        </span>
                      </div>
                    </div>

                    {/* Status actions */}
                    <div className="flex items-center gap-2 shrink-0 pl-[52px] sm:pl-0">
                      {assessment.status === 'Draft' && (
                        <Button
                          size="sm"
                          className="h-7 px-3 text-xs bg-primary text-primary-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(assessment.id, 'Active');
                          }}
                        >
                          Activate
                        </Button>
                      )}
                      {assessment.status === 'Active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(assessment.id, 'Closed');
                          }}
                        >
                          Close
                        </Button>
                      )}
                      {assessment.status === 'Closed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-3 text-xs text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info('Viewing archived assessment');
                          }}
                        >
                          View Report
                        </Button>
                      )}
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded: results */}
                  {isExpanded && (
                    <div className="border-t border-border/50 p-5 space-y-5">
                      <p className="text-xs text-muted-foreground">{assessment.description}</p>

                      {/* Results visualization */}
                      {assessment.results && assessment.results.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                            Results Summary
                          </h4>
                          {assessment.questions.map((q) => {
                            const result = assessment.results?.find((r) => r.questionId === q.id);
                            if (!result) return null;

                            return (
                              <div key={q.id} className="rounded-lg bg-muted/30 px-4 py-3 space-y-2">
                                <p className="text-xs font-medium text-foreground">{q.text}</p>

                                {/* Rating result */}
                                {result.avgScore !== undefined && (
                                  <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${scoreBg(result.avgScore)}`}
                                        style={{ width: `${(result.avgScore / 5) * 100}%` }}
                                      />
                                    </div>
                                    <span className={`text-sm font-bold ${scoreColor(result.avgScore)}`}>
                                      {result.avgScore.toFixed(1)}/5
                                    </span>
                                  </div>
                                )}

                                {/* Distribution result */}
                                {result.distribution && (
                                  <div className="space-y-1.5">
                                    {Object.entries(result.distribution).map(([label, value]) => {
                                      const total = Object.values(result.distribution!).reduce((a, b) => a + b, 0);
                                      return (
                                        <HorizontalBar
                                          key={label}
                                          label={label}
                                          value={value}
                                          max={total}
                                          color={
                                            q.type === 'yes-no'
                                              ? label === 'Yes'
                                                ? 'bg-green-400'
                                                : 'bg-red-400'
                                              : 'bg-indigo-400'
                                          }
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Questions list if no results yet */}
                      {(!assessment.results || assessment.results.length === 0) && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                            Questions
                          </h4>
                          <div className="space-y-2">
                            {assessment.questions.map((q, i) => (
                              <div key={q.id} className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2">
                                <span className="text-xs font-medium text-muted-foreground/50 mt-0.5">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-foreground">{q.text}</p>
                                  <span className="text-[10px] text-muted-foreground/60 capitalize">{q.type.replace('-', ' ')}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            toast.success('Assessment link copied to clipboard');
                          }}
                        >
                          <Layers className="h-3 w-3" /> Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            toast.success('Reminder sent to pending respondents');
                          }}
                        >
                          <Zap className="h-3 w-3" /> Send Reminder
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={handleExport}
                        >
                          <Download className="h-3 w-3" /> Export
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {customAssessments.length === 0 && (
            <div className="glass rounded-xl p-10 flex flex-col items-center text-center">
              <ClipboardCheck className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-medium text-foreground">No assessments yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create your first custom assessment to get started.</p>
              <Button
                size="sm"
                className="mt-4 h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Create Assessment
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Assessment Modal */}
      <CreateAssessmentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateAssessment}
      />
    </div>
  );
}
