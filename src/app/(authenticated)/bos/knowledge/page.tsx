'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  BookOpen,
  Clock,
  User,
  FileText,
  Shield,
  GraduationCap,
  CheckSquare,
  Bookmark,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ArticleCategory =
  | 'Onboarding'
  | 'SOPs & Processes'
  | 'Company Policies'
  | 'Training Materials'
  | 'Best Practices';

interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  author: { name: string; initials: string };
  lastUpdated: string;
  readTimeMin: number;
  completionPercent?: number;
  required: boolean;
  excerpt: string;
}

// ---------------------------------------------------------------------------
// Mock Data — Construction knowledge base
// ---------------------------------------------------------------------------

const articles: Article[] = [
  {
    id: 'art-001',
    title: 'Safety Protocol Handbook',
    category: 'Company Policies',
    author: { name: 'Mike Torres', initials: 'MT' },
    lastUpdated: 'Mar 12, 2026',
    readTimeMin: 25,
    completionPercent: 100,
    required: true,
    excerpt:
      'Comprehensive guide to job site safety including PPE requirements, fall protection, electrical safety, and emergency procedures. OSHA compliance checklist included.',
  },
  {
    id: 'art-002',
    title: 'Client Communication Standards',
    category: 'Best Practices',
    author: { name: 'Sarah Chen', initials: 'SC' },
    lastUpdated: 'Mar 8, 2026',
    readTimeMin: 12,
    completionPercent: 75,
    required: true,
    excerpt:
      'Guidelines for professional client communication including response time SLAs, update frequency, escalation procedures, and template messages.',
  },
  {
    id: 'art-003',
    title: 'Estimating Best Practices',
    category: 'SOPs & Processes',
    author: { name: 'Ryan Nakamura', initials: 'RN' },
    lastUpdated: 'Feb 28, 2026',
    readTimeMin: 18,
    required: false,
    excerpt:
      'Step-by-step estimating methodology from initial site visit through final bid submission. Includes material markup tables, labor rate guides, and contingency formulas.',
  },
  {
    id: 'art-004',
    title: 'New Employee Onboarding Checklist',
    category: 'Onboarding',
    author: { name: 'Lisa Park', initials: 'LP' },
    lastUpdated: 'Mar 15, 2026',
    readTimeMin: 8,
    completionPercent: 100,
    required: true,
    excerpt:
      'Complete onboarding checklist for new hires covering paperwork, equipment setup, safety orientation, team introductions, and 30/60/90-day milestones.',
  },
  {
    id: 'art-005',
    title: 'Project Handoff Procedure',
    category: 'SOPs & Processes',
    author: { name: 'Kim Lee', initials: 'KL' },
    lastUpdated: 'Feb 20, 2026',
    readTimeMin: 10,
    required: false,
    excerpt:
      'Standard operating procedure for transitioning projects between phases: sales to preconstruction, preconstruction to production, and production to close-out.',
  },
  {
    id: 'art-006',
    title: 'Subcontractor Management Guide',
    category: 'Best Practices',
    author: { name: 'Dan Parker', initials: 'DP' },
    lastUpdated: 'Mar 1, 2026',
    readTimeMin: 15,
    required: false,
    excerpt:
      'Best practices for managing subcontractor relationships including qualification, scope definition, payment terms, quality control, and dispute resolution.',
  },
  {
    id: 'art-007',
    title: 'APEX Intelligence Platform Training',
    category: 'Training Materials',
    author: { name: 'Joseph Wells', initials: 'JW' },
    lastUpdated: 'Mar 16, 2026',
    readTimeMin: 30,
    completionPercent: 40,
    required: true,
    excerpt:
      'Comprehensive training guide for the APEX Intelligence AI platform covering dashboard navigation, agent configuration, escalation handling, and report generation.',
  },
  {
    id: 'art-008',
    title: 'Change Order Management',
    category: 'SOPs & Processes',
    author: { name: 'David Kim', initials: 'DK' },
    lastUpdated: 'Jan 25, 2026',
    readTimeMin: 12,
    required: false,
    excerpt:
      'Procedures for managing change orders from identification through approval: documentation requirements, pricing methodology, client communication, and contract amendments.',
  },
];

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const categoryConfig: Record<ArticleCategory, { icon: typeof BookOpen; color: string }> = {
  Onboarding: { icon: GraduationCap, color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  'SOPs & Processes': { icon: FileText, color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  'Company Policies': { icon: Shield, color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  'Training Materials': { icon: BookOpen, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'Best Practices': { icon: CheckSquare, color: 'bg-green-500/15 text-green-400 border-green-500/30' },
};

const allCategories: (ArticleCategory | 'All Articles')[] = [
  'All Articles',
  'Onboarding',
  'SOPs & Processes',
  'Company Policies',
  'Training Materials',
  'Best Practices',
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function KnowledgePage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'All Articles'>('All Articles');

  const filtered = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      a.author.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Articles' || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const requiredCount = articles.filter((a) => a.required).length;
  const completedRequired = articles.filter(
    (a) => a.required && a.completionPercent === 100
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Knowledge Portal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Company wiki, SOPs, training materials, and best practices
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
              onClick={() => setView('list')}
              className={`rounded-md p-1.5 transition-all ${
                view === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search articles, SOPs, training materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="glass h-11 border-border bg-muted/30 pl-10 text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50"
        />
      </div>

      {/* Summary bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{articles.length}</span>
            <span className="text-xs text-muted-foreground">Total Articles</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">{requiredCount}</span>
            <span className="text-xs text-muted-foreground">Required Reading</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-400">
              {completedRequired}/{requiredCount}
            </span>
            <span className="text-xs text-muted-foreground">Required Completed</span>
          </div>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Categories sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="glass rounded-xl p-2">
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === 'All Articles'
                  ? articles.length
                  : articles.filter((a) => a.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    isActive
                      ? 'bg-primary/10 text-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`ml-2 text-xs ${
                      isActive ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Articles */}
        <div className="flex-1">
          {view === 'grid' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((article) => {
                const catConfig = categoryConfig[article.category];
                return (
                  <div
                    key={article.id}
                    className="glass glass-hover rounded-xl p-5 cursor-pointer transition-all duration-300"
                  >
                    {/* Category + required badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${catConfig.color}`}>
                        {article.category}
                      </Badge>
                      {article.required && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]"
                        >
                          Required
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-sm font-semibold text-foreground line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mb-4 text-xs text-muted-foreground line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/70">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTimeMin} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {article.lastUpdated}
                      </span>
                    </div>

                    {/* Completion indicator */}
                    {article.completionPercent !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-muted-foreground">Progress</span>
                          <span className="text-[10px] text-muted-foreground">
                            {article.completionPercent}%
                          </span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted/30">
                          <div
                            className={`h-1 rounded-full transition-all ${
                              article.completionPercent === 100
                                ? 'bg-green-400'
                                : 'bg-primary'
                            }`}
                            style={{ width: `${article.completionPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {view === 'list' && (
            <div className="space-y-2">
              {filtered.map((article) => {
                const catConfig = categoryConfig[article.category];
                return (
                  <div
                    key={article.id}
                    className="glass glass-hover flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {article.title}
                        </h3>
                        {article.required && (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] shrink-0"
                          >
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
                        <Badge variant="outline" className={`text-[9px] ${catConfig.color}`}>
                          {article.category}
                        </Badge>
                        <span>{article.author.name}</span>
                        <span>{article.readTimeMin} min</span>
                        <span>{article.lastUpdated}</span>
                      </div>
                    </div>

                    {/* Completion */}
                    {article.completionPercent !== undefined && (
                      <div className="shrink-0 text-right">
                        <span
                          className={`text-xs font-medium ${
                            article.completionPercent === 100
                              ? 'text-green-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {article.completionPercent}%
                        </span>
                      </div>
                    )}

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="glass rounded-xl px-5 py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No articles match your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
