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
  X,
  Check,
  ArrowLeft,
  History,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  content: string;
  tags: string[];
  versionHistory: { version: string; date: string; author: string; summary: string }[];
}

// ---------------------------------------------------------------------------
// Mock Data — Construction knowledge base
// ---------------------------------------------------------------------------

const initialArticles: Article[] = [
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
    content:
      'This handbook covers all OSHA-mandated safety protocols for construction job sites. Topics include: Personal Protective Equipment (PPE) requirements for all personnel, fall protection systems and harness inspection procedures, electrical safety and lockout/tagout protocols, confined space entry procedures, hazardous material handling, emergency evacuation plans, first aid station locations and supplies, incident reporting procedures, and weekly safety meeting agendas. All team members must complete the safety orientation within their first week and pass the safety certification exam with a score of 90% or higher.',
    tags: ['safety', 'OSHA', 'compliance', 'PPE'],
    versionHistory: [
      { version: '3.2', date: 'Mar 12, 2026', author: 'Mike Torres', summary: 'Updated fall protection section with new harness requirements' },
      { version: '3.1', date: 'Jan 15, 2026', author: 'Mike Torres', summary: 'Added confined space entry procedures' },
      { version: '3.0', date: 'Nov 1, 2025', author: 'Dan Parker', summary: 'Major revision for 2026 OSHA standards' },
    ],
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
    content:
      'Professional client communication is the cornerstone of our reputation. This guide establishes standards for all client-facing communications. Response Time SLAs: Initial inquiry responses within 2 business hours, project update requests within 4 hours, emergency/urgent matters within 30 minutes. Update Frequency: Weekly project status emails every Friday by 3 PM, photo documentation of progress at each milestone, monthly budget summaries for projects over $100K. Escalation Procedures: Tier 1 (PM handles), Tier 2 (VP Operations), Tier 3 (CEO). Template Messages: Welcome email, milestone completion, delay notification, change order request, project completion, and warranty information.',
    tags: ['communication', 'SLA', 'client-facing', 'templates'],
    versionHistory: [
      { version: '2.1', date: 'Mar 8, 2026', author: 'Sarah Chen', summary: 'Added AI-generated update templates' },
      { version: '2.0', date: 'Dec 20, 2025', author: 'Sarah Chen', summary: 'Revised SLA timelines and escalation tiers' },
    ],
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
    content:
      'Our estimating process follows a rigorous methodology to ensure accurate and competitive bids. Step 1: Initial Site Visit - conduct thorough walkthrough, document existing conditions with photos and measurements, identify potential challenges. Step 2: Scope Definition - create detailed scope of work document, identify all trades required, list material specifications. Step 3: Quantity Takeoff - use digital takeoff tools for measurements, cross-reference with field notes, apply waste factors. Step 4: Pricing - apply current material pricing from supplier quotes, use standard labor rates with productivity adjustments, include equipment rental costs. Step 5: Markup & Contingency - apply standard markup (see tables), add contingency based on project complexity (5-15%), include overhead allocation. Step 6: Review & Submit - peer review by senior estimator, final approval by VP, professional bid presentation to client.',
    tags: ['estimating', 'bidding', 'pricing', 'methodology'],
    versionHistory: [
      { version: '1.3', date: 'Feb 28, 2026', author: 'Ryan Nakamura', summary: 'Updated labor rate tables for 2026' },
      { version: '1.2', date: 'Oct 10, 2025', author: 'Ryan Nakamura', summary: 'Added AI estimating tool integration steps' },
    ],
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
    content:
      'Welcome to Kiptra Builders! This checklist ensures every new team member has a smooth start. Day 1: Complete HR paperwork (W-4, I-9, direct deposit), receive company handbook, IT setup (email, project management access, phone), office/site tour, meet your team. Week 1: Safety orientation and certification, review core values and company vision, shadow a senior team member, complete KIPTRA Intelligence platform training (Module 1). 30-Day Milestone: Complete all required reading, pass safety certification, attend first L10 meeting, receive first performance check-in. 60-Day Milestone: Lead a small task independently, complete KIPTRA platform training (all modules), participate in quarterly planning session. 90-Day Milestone: Full performance review with manager, core values evaluation, goal setting for next quarter, mentorship program enrollment.',
    tags: ['onboarding', 'new-hire', 'checklist', 'HR'],
    versionHistory: [
      { version: '4.0', date: 'Mar 15, 2026', author: 'Lisa Park', summary: 'Added KIPTRA Intelligence platform training modules' },
      { version: '3.5', date: 'Jan 5, 2026', author: 'Lisa Park', summary: 'Updated 30/60/90 day milestones' },
    ],
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
    content:
      'Seamless project transitions are critical to client satisfaction and profitability. Sales to Preconstruction: PM assigned, kickoff meeting within 48 hours, scope review and validation, budget baseline established, permit timeline identified. Preconstruction to Production: Pre-construction meeting with all stakeholders, schedule finalized and shared, material orders placed, subcontracts executed, site mobilization checklist completed. Production to Close-out: Punch list created and tracked, final inspections scheduled, warranty documentation prepared, client walkthrough conducted, final invoice and lien releases processed. Each transition requires a formal handoff meeting and signed handoff document.',
    tags: ['handoff', 'transitions', 'project-management'],
    versionHistory: [
      { version: '2.0', date: 'Feb 20, 2026', author: 'Kim Lee', summary: 'Added digital handoff checklist templates' },
    ],
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
    content:
      'Effective subcontractor management is essential for project success. Qualification: Verify insurance (GL, WC, auto), check references (minimum 3 similar projects), review financial stability, confirm required licenses and certifications. Scope Definition: Provide detailed written scope with drawings, clearly define inclusions and exclusions, specify material standards and acceptable substitutions, include timeline requirements and liquidated damages. Payment Terms: Standard net-30 from invoice approval, progress billing tied to milestones, retainage of 10% until project completion, no payment without lien waiver. Quality Control: Pre-work meetings for each phase, daily progress inspections, photo documentation requirements, punch list completion within 5 business days. Dispute Resolution: Direct discussion first, escalation to project manager, mediation if needed, contractual remedies as last resort.',
    tags: ['subcontractors', 'vendor-management', 'quality-control'],
    versionHistory: [
      { version: '1.5', date: 'Mar 1, 2026', author: 'Dan Parker', summary: 'Updated insurance requirements and payment terms' },
    ],
  },
  {
    id: 'art-007',
    title: 'KIPTRA Intelligence Platform Training',
    category: 'Training Materials',
    author: { name: 'Joseph Wells', initials: 'JW' },
    lastUpdated: 'Mar 16, 2026',
    readTimeMin: 30,
    completionPercent: 40,
    required: true,
    excerpt:
      'Comprehensive training guide for the KIPTRA Intelligence AI platform covering dashboard navigation, agent configuration, escalation handling, and report generation.',
    content:
      'The KIPTRA Intelligence platform is our proprietary AI-powered project management system. Module 1 - Dashboard Navigation: Overview of main dashboard, understanding KPI widgets, customizing your view, setting up notifications. Module 2 - Agent Configuration: Understanding AI agents (Sales, Operations, Finance, Support), configuring agent behaviors, setting up automation rules, managing agent permissions. Module 3 - Escalation Handling: How escalations are routed, priority levels and SLAs, responding to escalations, escalation analytics. Module 4 - Report Generation: Standard reports (daily, weekly, monthly), custom report builder, scheduling automated reports, exporting and sharing. Module 5 - Advanced Features: AI-powered insights, predictive analytics, integration with QuickBooks and Google Calendar, mobile app usage.',
    tags: ['KIPTRA', 'AI', 'training', 'platform'],
    versionHistory: [
      { version: '2.0', date: 'Mar 16, 2026', author: 'Joseph Wells', summary: 'Added Module 5: Advanced Features' },
      { version: '1.5', date: 'Feb 10, 2026', author: 'Joseph Wells', summary: 'Updated agent configuration for v2 agents' },
      { version: '1.0', date: 'Jan 1, 2026', author: 'Joseph Wells', summary: 'Initial release' },
    ],
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
    content:
      'Change orders are inevitable in construction projects. Proper management protects both the company and the client. Identification: Any scope change, unforeseen condition, or client request triggers a change order. Documentation: Detailed description of the change, reason for the change, affected drawings/specifications, photos of existing conditions (if applicable). Pricing: Material costs with supplier quotes, labor hours with rate schedule, equipment costs, markup per contract terms, impact on project schedule. Client Communication: Present change order within 48 hours of identification, provide clear explanation and justification, obtain written approval before proceeding, document verbal approvals immediately in writing. Contract Amendment: Formal change order document signed by both parties, update project budget and schedule, file with original contract documents, update accounting system.',
    tags: ['change-orders', 'scope-changes', 'documentation'],
    versionHistory: [
      { version: '1.2', date: 'Jan 25, 2026', author: 'David Kim', summary: 'Added digital change order form template' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const categoryConfig: Record<ArticleCategory, { icon: typeof BookOpen; color: string }> = {
  Onboarding: { icon: GraduationCap, color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  'SOPs & Processes': { icon: FileText, color: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  'Company Policies': { icon: Shield, color: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  'Training Materials': { icon: BookOpen, color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  'Best Practices': { icon: CheckSquare, color: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30' },
};

const allCategories: (ArticleCategory | 'All Articles')[] = [
  'All Articles',
  'Onboarding',
  'SOPs & Processes',
  'Company Policies',
  'Training Materials',
  'Best Practices',
];

const categoryOptions: ArticleCategory[] = [
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
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  // Create article modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ArticleCategory>('Best Practices');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newRequired, setNewRequired] = useState(false);

  // Article detail view state
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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

  const handleCreateArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Title and content are required');
      return;
    }

    const newArticle: Article = {
      id: `art-${String(articles.length + 1).padStart(3, '0')}`,
      title: newTitle.trim(),
      category: newCategory,
      author: { name: 'Joseph Wells', initials: 'JW' },
      lastUpdated: 'Mar 20, 2026',
      readTimeMin: Math.max(1, Math.round(newContent.trim().split(/\s+/).length / 200)),
      completionPercent: undefined,
      required: newRequired,
      excerpt: newContent.trim().slice(0, 180) + (newContent.trim().length > 180 ? '...' : ''),
      content: newContent.trim(),
      tags: newTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      versionHistory: [
        {
          version: '1.0',
          date: 'Mar 20, 2026',
          author: 'Joseph Wells',
          summary: 'Initial publication',
        },
      ],
    };

    setArticles((prev) => [newArticle, ...prev]);
    toast.success(`Article "${newTitle.trim()}" created successfully`);
    setCreateOpen(false);
    setNewTitle('');
    setNewCategory('Best Practices');
    setNewContent('');
    setNewTags('');
    setNewRequired(false);
  };

  const handleMarkAsRead = (articleId: string) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, completionPercent: 100 } : a))
    );
    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle({ ...selectedArticle, completionPercent: 100 });
    }
    toast.success('Article marked as read');
  };

  // -------------------------------------------------------------------------
  // Article Detail View
  // -------------------------------------------------------------------------
  if (selectedArticle) {
    const catConfig = categoryConfig[selectedArticle.category];
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Portal
        </button>

        {/* Article header */}
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={`text-[10px] ${catConfig.color}`}>
                  {selectedArticle.category}
                </Badge>
                {selectedArticle.required && (
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px]"
                  >
                    Required
                  </Badge>
                )}
                {selectedArticle.completionPercent === 100 && (
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[10px]"
                  >
                    <Check className="h-2.5 w-2.5 mr-0.5" />
                    Read
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-foreground mb-2">{selectedArticle.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedArticle.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedArticle.readTimeMin} min read
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="h-3 w-3" />
                  Updated {selectedArticle.lastUpdated}
                </span>
              </div>
              {/* Tags */}
              {selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {selectedArticle.completionPercent !== 100 && (
              <Button
                size="sm"
                onClick={() => handleMarkAsRead(selectedArticle.id)}
                className="h-8 gap-1.5 rounded-lg bg-green-600 px-4 text-xs font-medium text-white hover:bg-green-500"
              >
                <Eye className="h-3.5 w-3.5" />
                Mark as Read
              </Button>
            )}
          </div>
        </div>

        {/* Article content */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">Article Content</h2>
          <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {selectedArticle.content}
          </div>
        </div>

        {/* Version history */}
        <div className="glass rounded-xl p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            Version History
          </h2>
          <div className="space-y-3">
            {selectedArticle.versionHistory.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/10 p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  v{entry.version}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{entry.summary}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span>{entry.author}</span>
                    <span>{entry.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Main list view
  // -------------------------------------------------------------------------
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
            onClick={() => setCreateOpen(true)}
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
            <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-foreground">{articles.length}</span>
            <span className="text-xs text-muted-foreground">Total Articles</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{requiredCount}</span>
            <span className="text-xs text-muted-foreground">Required Reading</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
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
                    onClick={() => setSelectedArticle(article)}
                  >
                    {/* Category + required badge */}
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${catConfig.color}`}>
                        {article.category}
                      </Badge>
                      {article.required && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px]"
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
                    onClick={() => setSelectedArticle(article)}
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
                            className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] shrink-0"
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
                              ? 'text-green-600 dark:text-green-400'
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

      {/* -----------------------------------------------------------------------
          Create Article Modal
      ----------------------------------------------------------------------- */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setNewTitle('');
            setNewCategory('Best Practices');
            setNewContent('');
            setNewTags('');
            setNewRequired(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Create New Article
            </DialogTitle>
            <DialogDescription>
              Add a new article to the knowledge base
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Title
              </label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Article title..."
                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ArticleCategory)}
                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 [&>option]:bg-background"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Content
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your article content..."
                rows={6}
                className="w-full resize-none rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Tags (comma-separated)
              </label>
              <input
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="safety, compliance, training..."
                className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Required reading toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNewRequired(!newRequired)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  newRequired ? 'bg-primary' : 'bg-muted/50'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    newRequired ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-muted-foreground">Required Reading</span>
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
              onClick={handleCreateArticle}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Check className="h-3.5 w-3.5" />
              Save Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
