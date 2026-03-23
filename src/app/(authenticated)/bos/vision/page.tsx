'use client';

import { useState, useCallback } from 'react';
import {
  Eye,
  Pencil,
  Check,
  X,
  Target,
  Compass,
  Megaphone,
  TrendingUp,
  Calendar,
  Flag,
  Heart,
  Clock,
  Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VisionSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: Record<string, string | string[]>;
  lastUpdated?: string;
}

type RockStatus = 'On Track' | 'Off Track' | 'Complete';

interface Rock {
  id: string;
  title: string;
  owner: string;
  status: RockStatus;
  progress: number;
}

// ---------------------------------------------------------------------------
// Mock Data — Construction company V/TO
// ---------------------------------------------------------------------------

const visionSections: VisionSection[] = [
  {
    id: 'core-values',
    title: 'Core Values',
    icon: Heart,
    content: {
      values: [
        'Integrity First: We do the right thing, even when no one is watching. Every estimate, every invoice, every promise.',
        'Relentless Quality: Good enough never is. We build it like we are building it for our own family.',
        'Team Over Individual: No lone wolves. We win as a crew or not at all.',
        'Own It: If you see a problem, it is yours to fix. No finger-pointing, no excuses.',
        'Innovate or Stagnate: We embrace technology and new methods. The old way is not always the best way.',
      ],
    },
  },
  {
    id: 'core-focus',
    title: 'Core Focus',
    icon: Compass,
    content: {
      mission:
        'To transform the remodeling and renovation experience through AI-powered project management, making every project predictable, profitable, and stress-free for both our team and our clients.',
      niche:
        'Residential and light commercial renovation projects ($25K-$500K) in the greater metropolitan area, specializing in kitchen, bath, and whole-home remodels.',
    },
  },
  {
    id: '10-year-target',
    title: '10-Year Target',
    icon: Target,
    content: {
      goal: '$50M annual revenue with 15% net profit, operating across 3 metros as the most trusted AI-powered construction firm in the region.',
    },
  },
  {
    id: 'marketing-strategy',
    title: 'Marketing Strategy',
    icon: Megaphone,
    content: {
      targetMarket:
        'Homeowners (35-65, HHI $150K+) and commercial property managers undertaking renovation projects valued at $25K-$500K.',
      threeUniques: [
        'AI-powered project management with real-time transparency',
        'Fixed-price guarantees backed by data-driven estimating',
        'White-glove client experience from discovery to final walkthrough',
      ],
      provenProcess:
        'Discovery Call > AI-Enhanced Site Assessment > Smart Estimate > Design Phase > Build Phase > Final Walkthrough > 2-Year Warranty',
      guarantee:
        'On-time completion guarantee or 1% daily discount on remaining balance. No surprise change orders without written pre-approval.',
    },
  },
  {
    id: '3-year-picture',
    title: '3-Year Picture',
    icon: TrendingUp,
    content: {
      revenue: '$12M annual revenue',
      profit: '12% net profit margin',
      measurables: [
        '45+ active projects per quarter',
        '4.8+ client satisfaction rating',
        '95% on-time project completion',
        '35% gross margin on all projects',
        '2 additional market territories opened',
      ],
    },
  },
  {
    id: '1-year-plan',
    title: '1-Year Plan',
    icon: Calendar,
    content: {
      revenueGoal: '$4.2M annual revenue',
      profitGoal: '10% net profit margin',
      measurables: [
        'Close 15 new projects per quarter',
        'Reduce average project duration by 10%',
        'Achieve 4.6+ client satisfaction rating',
        'Launch AI estimating tool v2.0',
        'Hire 3 additional project managers',
        'Zero OSHA incidents',
      ],
    },
  },
  {
    id: 'quarterly-goals',
    title: 'Quarterly Goals (Q1 2026)',
    icon: Flag,
    content: {
      goals: [
        'Complete Kiptra AI platform MVP and onboard first 5 clients',
        'Hire and train 2 new site superintendents',
        'Launch referral program with $500 incentive per closed referral',
        'Implement automated weekly KPI reporting for all teams',
        'Achieve 92% employee retention rate',
      ],
    },
  },
];

const initialRocks: Rock[] = [
  {
    id: 'rock-1',
    title: 'Launch Kiptra AI Platform MVP',
    owner: 'Joseph Wells',
    status: 'On Track',
    progress: 72,
  },
  {
    id: 'rock-2',
    title: 'Hire & Onboard 2 Site Superintendents',
    owner: 'Lisa Park',
    status: 'On Track',
    progress: 50,
  },
  {
    id: 'rock-3',
    title: 'Implement AI Estimating Tool v2.0',
    owner: 'Ryan Nakamura',
    status: 'Off Track',
    progress: 30,
  },
  {
    id: 'rock-4',
    title: 'Achieve 4.6+ Client Satisfaction Rating',
    owner: 'Sarah Chen',
    status: 'On Track',
    progress: 85,
  },
  {
    id: 'rock-5',
    title: 'Launch Client Referral Program',
    owner: 'Sarah Chen',
    status: 'Complete',
    progress: 100,
  },
];

// ---------------------------------------------------------------------------
// Rock status config
// ---------------------------------------------------------------------------

const rockStatusConfig: Record<RockStatus, { bg: string; text: string; ring: string }> = {
  'On Track': { bg: 'bg-green-400/10', text: 'text-green-400', ring: 'ring-green-400/20' },
  'Off Track': { bg: 'bg-red-400/10', text: 'text-red-400', ring: 'ring-red-400/20' },
  Complete: { bg: 'bg-blue-400/10', text: 'text-blue-400', ring: 'ring-blue-400/20' },
};

// ---------------------------------------------------------------------------
// Section Card component
// ---------------------------------------------------------------------------

function SectionCard({ section }: { section: VisionSection }) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(section.content);
  const [draftContent, setDraftContent] = useState(section.content);
  const Icon = section.icon;

  const handleEdit = () => {
    setDraftContent({ ...content });
    setEditing(true);
  };

  const handleSave = () => {
    setContent({ ...draftContent });
    setEditing(false);
    toast.success(`${section.title} updated successfully`);
  };

  const handleCancel = () => {
    setDraftContent({ ...content });
    setEditing(false);
  };

  const updateDraftField = (key: string, value: string) => {
    setDraftContent((prev) => ({ ...prev, [key]: value }));
  };

  const updateDraftArrayItem = (key: string, index: number, value: string) => {
    setDraftContent((prev) => {
      const arr = [...(prev[key] as string[])];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  };

  const displayContent = editing ? draftContent : content;

  return (
    <div className="glass rounded-xl p-6 transition-all duration-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {editing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 rounded-lg px-2.5 text-xs text-red-400 hover:bg-red-400/10 transition-all"
                onClick={handleCancel}
              >
                <X className="h-3 w-3" />
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 rounded-lg px-2.5 text-xs text-green-400 hover:bg-green-400/10 transition-all"
                onClick={handleSave}
              >
                <Check className="h-3 w-3" />
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground transition-all"
              onClick={handleEdit}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {Object.entries(displayContent).map(([key, value]) => {
          const label = formatLabel(key);

          if (Array.isArray(value)) {
            return (
              <div key={key}>
                {label !== section.title && (
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {label}
                  </h4>
                )}
                <ul className="space-y-1.5">
                  {value.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                      {editing ? (
                        <input
                          value={item}
                          onChange={(e) => updateDraftArrayItem(key, i, e.target.value)}
                          className="flex-1 bg-transparent text-foreground focus:outline-none border-b border-dashed border-primary/30 pb-0.5"
                        />
                      ) : (
                        <span>{item}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          return (
            <div key={key}>
              {Object.keys(displayContent).length > 1 && (
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {label}
                </h4>
              )}
              {editing ? (
                <textarea
                  value={value}
                  onChange={(e) => updateDraftField(key, e.target.value)}
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm text-foreground focus:outline-none border border-dashed border-primary/30 rounded-lg p-2"
                />
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">{value}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rocks Section component
// ---------------------------------------------------------------------------

function RocksSection() {
  const [rocks, setRocks] = useState<Rock[]>(initialRocks);

  const onTrack = rocks.filter((r) => r.status === 'On Track').length;
  const offTrack = rocks.filter((r) => r.status === 'Off Track').length;
  const complete = rocks.filter((r) => r.status === 'Complete').length;
  const avgProgress = Math.round(rocks.reduce((sum, r) => sum + r.progress, 0) / rocks.length);

  const cycleStatus = useCallback((id: string) => {
    setRocks((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next: RockStatus =
          r.status === 'On Track' ? 'Off Track' : r.status === 'Off Track' ? 'Complete' : 'On Track';
        const progress = next === 'Complete' ? 100 : r.progress;
        toast.success(`${r.title} marked as ${next}`);
        return { ...r, status: next, progress };
      })
    );
  }, []);

  return (
    <div className="glass rounded-xl p-6 transition-all duration-300">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Quarterly Rocks (Q1 2026)</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            {onTrack} On Track
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {offTrack} Off Track
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            {complete} Complete
          </span>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-4 rounded-lg bg-muted/20 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">Overall Rock Completion</span>
          <span className="text-xs font-semibold text-foreground">{avgProgress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/30">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Rock list */}
      <div className="space-y-3">
        {rocks.map((rock) => {
          const status = rockStatusConfig[rock.status];
          return (
            <div
              key={rock.id}
              className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/10 p-3 transition-all hover:bg-muted/20"
            >
              {/* Progress circle */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted/30"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${rock.progress * 0.9739} 97.39`}
                    strokeLinecap="round"
                    className={
                      rock.status === 'Complete'
                        ? 'text-blue-400'
                        : rock.status === 'On Track'
                          ? 'text-green-400'
                          : 'text-red-400'
                    }
                  />
                </svg>
                <span className="absolute text-[10px] font-semibold text-foreground">
                  {rock.progress}%
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">{rock.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Owner: {rock.owner}</p>
              </div>

              {/* Status badge — clickable to cycle */}
              <button
                onClick={() => cycleStatus(rock.id)}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 transition-all hover:opacity-80 ${status.bg} ${status.text} ${status.ring}`}
                title="Click to change status"
              >
                {rock.status}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VisionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Vision Plan (V/TO)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vision/Traction Organizer — your company&apos;s strategic roadmap
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: March 15, 2026 by Joseph Wells</span>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">8</span>
            <span className="text-xs text-muted-foreground">Sections</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-400">8/8</span>
            <span className="text-xs text-muted-foreground">Completed</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">
              Next review: Q2 2026 Quarterly Planning
            </span>
          </div>
        </div>
      </div>

      {/* Vision sections — render up to 1-Year Plan, then Rocks, then Quarterly Goals */}
      <div className="space-y-4">
        {visionSections.slice(0, 6).map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}

        {/* Quarterly Rocks section */}
        <RocksSection />

        {/* Quarterly Goals (last section) */}
        {visionSections.slice(6).map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace('Three Uniques', '3 Uniques')
    .replace('Proven Process', 'Proven Process')
    .replace('Revenue Goal', 'Revenue Goal')
    .replace('Profit Goal', 'Profit Goal');
}
