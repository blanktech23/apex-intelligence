'use client';

import { useState } from 'react';
import {
  Star,
  Search,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ReviewStep = 'Not Started' | 'Self-Assessment' | 'Manager Review' | 'Discussion' | 'Complete';
type CoreValueRating = '+' | '+/-' | '-';
type CCCRating = 'Exceeds' | 'Meets' | 'Below';

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
  coreValues: { value: string; rating: CoreValueRating }[];
  ccc: { dimension: string; rating: CCCRating }[];
  goalRetro: { goal: string; result: string; met: boolean }[];
  strengths: string[];
  growthAreas: string[];
  overallRating: number;
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

const sampleDetail: ReviewDetail = {
  personId: 'r-001',
  coreValues: [
    { value: 'Integrity First', rating: '+' },
    { value: 'Relentless Quality', rating: '+' },
    { value: 'Team Over Individual', rating: '+' },
    { value: 'Own It', rating: '+/-' },
    { value: 'Innovate or Stagnate', rating: '+' },
  ],
  ccc: [
    { dimension: 'Competency', rating: 'Exceeds' },
    { dimension: 'Commitment', rating: 'Meets' },
    { dimension: 'Capacity', rating: 'Exceeds' },
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
  overallRating: 4.2,
};

const pastCycles = [
  { period: 'Q4 2025', completed: '12 of 12', avgRating: 4.0 },
  { period: 'Q3 2025', completed: '11 of 11', avgRating: 3.8 },
  { period: 'Q2 2025', completed: '10 of 10', avgRating: 3.9 },
];

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
// Page
// ---------------------------------------------------------------------------

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'templates'>('current');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const completedCount = reviewPeople.filter((p) => p.step === 'Complete').length;
  const totalCount = reviewPeople.length;

  const filtered = reviewPeople.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
        {(['current', 'past', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
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
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Review period: January 1 - March 31, 2026
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {completedCount} of {totalCount} reviews completed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((completedCount / totalCount) * 100)}% complete
                  </p>
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
              const isExpanded = expandedReview === person.id;
              const stepIndex = steps.indexOf(person.step);

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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
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
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <StepIndicator currentStep={person.step} />
                        <span
                          className={`text-[10px] font-medium ${
                            person.step === 'Complete'
                              ? 'text-green-400'
                              : person.step === 'Not Started'
                                ? 'text-muted-foreground/60'
                                : 'text-amber-400'
                          }`}
                        >
                          {person.step}
                        </span>
                      </div>
                    </div>

                    {/* Action + chevron */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={person.step === 'Complete' ? 'ghost' : 'default'}
                        className={`h-8 rounded-lg px-3 text-xs font-medium ${
                          person.step === 'Complete'
                            ? 'text-primary hover:bg-primary/10'
                            : person.step === 'Not Started'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {person.step === 'Complete'
                          ? 'View'
                          : person.step === 'Not Started'
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

                  {/* Expanded detail — show sample data for first person */}
                  {isExpanded && person.id === 'r-001' && (
                    <div className="border-t border-border/50 p-5 space-y-6">
                      {/* Detail tabs */}
                      <div className="flex items-center gap-1 rounded-lg bg-muted/30 p-0.5 w-fit">
                        {(['Self-Assessment', 'Manager Review', 'Discussion Notes', 'Summary'] as const).map(
                          (tab, i) => (
                            <button
                              key={tab}
                              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                i === 3
                                  ? 'bg-background text-foreground shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tab}
                            </button>
                          )
                        )}
                      </div>

                      {/* Core Values Alignment */}
                      <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                          Core Values Alignment
                        </h4>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {sampleDetail.coreValues.map((cv) => (
                            <div
                              key={cv.value}
                              className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2"
                            >
                              <span className="text-xs text-muted-foreground">
                                {cv.value}
                              </span>
                              <CoreValueRatingDot rating={cv.rating} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CCC Assessment */}
                      <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                          CCC Assessment
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {sampleDetail.ccc.map((c) => (
                            <div
                              key={c.dimension}
                              className="rounded-lg bg-[rgba(255,255,255,0.03)] px-4 py-3 text-center"
                            >
                              <p className="text-xs text-muted-foreground">{c.dimension}</p>
                              <p
                                className={`mt-1 text-sm font-semibold ${
                                  c.rating === 'Exceeds'
                                    ? 'text-green-400'
                                    : c.rating === 'Meets'
                                      ? 'text-blue-400'
                                      : 'text-red-400'
                                }`}
                              >
                                {c.rating}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Goal Retrospective */}
                      <div>
                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                          Goal Retrospective
                        </h4>
                        <div className="space-y-2">
                          {sampleDetail.goalRetro.map((g, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 rounded-lg bg-[rgba(255,255,255,0.03)] px-3 py-2"
                            >
                              {g.met ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                              )}
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
                            {sampleDetail.strengths.map((s, i) => (
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
                            {sampleDetail.growthAreas.map((g, i) => (
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
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Overall Rating: {sampleDetail.overallRating}/5.0
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Exceeds expectations in most areas
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expanded placeholder for other people */}
                  {isExpanded && person.id !== 'r-001' && (
                    <div className="border-t border-border/50 p-5">
                      <div className="flex flex-col items-center py-6 text-center">
                        <FileText className="h-8 w-8 text-muted-foreground/30" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {person.step === 'Not Started'
                            ? 'Review has not been started yet.'
                            : person.step === 'Complete'
                              ? 'Review details would appear here.'
                              : `Review is in the "${person.step}" stage.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Reviews */}
      {activeTab === 'past' && (
        <div className="space-y-3">
          {pastCycles.map((cycle) => (
            <div
              key={cycle.period}
              className="glass glass-hover rounded-xl p-5 cursor-pointer transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {cycle.period} Review Cycle
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {cycle.completed} reviews
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      {cycle.avgRating}/5.0 avg rating
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View All
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="space-y-3">
          {[
            {
              name: 'Standard Quarterly Review',
              description:
                'Core values alignment, CCC assessment, goal retrospective, strengths & growth areas, and overall rating.',
              sections: 6,
            },
            {
              name: '90-Day New Hire Review',
              description:
                'Onboarding progress, culture fit assessment, skill evaluation, and development plan.',
              sections: 4,
            },
            {
              name: 'Annual Performance Review',
              description:
                'Comprehensive review covering all quarters, compensation review, career development, and goal setting for next year.',
              sections: 8,
            },
          ].map((template) => (
            <div
              key={template.name}
              className="glass glass-hover rounded-xl p-5 cursor-pointer transition-all duration-300"
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 rounded-lg px-3 text-xs text-primary hover:bg-primary/10"
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
