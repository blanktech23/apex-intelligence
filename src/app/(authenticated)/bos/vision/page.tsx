'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        'Complete Apex Intelligence platform MVP and onboard first 5 clients',
        'Hire and train 2 new site superintendents',
        'Launch referral program with $500 incentive per closed referral',
        'Implement automated weekly KPI reporting for all teams',
        'Achieve 92% employee retention rate',
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Section Card component
// ---------------------------------------------------------------------------

function SectionCard({ section }: { section: VisionSection }) {
  const [editing, setEditing] = useState(false);
  const Icon = section.icon;

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
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 gap-1.5 rounded-lg px-2.5 text-xs transition-all ${
            editing
              ? 'text-green-400 hover:bg-green-400/10'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            <>
              <Check className="h-3 w-3" />
              Save
            </>
          ) : (
            <>
              <Pencil className="h-3 w-3" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {Object.entries(section.content).map(([key, value]) => {
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
                          defaultValue={item}
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
              {Object.keys(section.content).length > 1 && (
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {label}
                </h4>
              )}
              {editing ? (
                <textarea
                  defaultValue={value}
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
            <span className="text-sm font-medium text-foreground">7</span>
            <span className="text-xs text-muted-foreground">Sections</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-400">7/7</span>
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

      {/* Vision sections */}
      <div className="space-y-4">
        {visionSections.map((section) => (
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
