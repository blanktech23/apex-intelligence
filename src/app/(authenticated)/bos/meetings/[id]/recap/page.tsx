'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Star,
  Download,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  MessageSquare,
  Target,
  Sparkles,
  Loader2,
  Send,
  Plus,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Mock recap data
// ---------------------------------------------------------------------------

interface RecapAttendee {
  name: string;
  avatar: string;
  rating: number;
}

interface RecapDecision {
  text: string;
  section: string;
}

interface RecapActionItem {
  description: string;
  owner: string;
  dueDate: string;
  source: string;
}

interface RecapIssue {
  title: string;
  status: 'resolved' | 'carried';
  resolution?: string;
}

interface SectionNote {
  section: string;
  notes: string[];
}

const recapAttendees: RecapAttendee[] = [
  { name: 'Joseph', avatar: 'J', rating: 9 },
  { name: 'Mike Torres', avatar: 'M', rating: 8 },
  { name: 'Sarah Chen', avatar: 'S', rating: 8 },
  { name: 'Lisa Park', avatar: 'L', rating: 7 },
  { name: 'David Kim', avatar: 'D', rating: 9 },
];

const avgRating =
  recapAttendees.reduce((sum, a) => sum + a.rating, 0) / recapAttendees.length;

const decisions: RecapDecision[] = [
  {
    text: 'Increase PM compensation packages by 15% to attract senior candidates',
    section: 'IDS - Issues',
  },
  {
    text: 'Implement weekend auto-responder for customer inquiries starting next week',
    section: 'IDS - Issues',
  },
  {
    text: 'Schedule emergency supplier meeting to negotiate material costs',
    section: 'Rock Review',
  },
  {
    text: 'Extend design tool licenses for 12 months (annual plan saves 20%)',
    section: 'IDS - Issues',
  },
];

const actionItems: RecapActionItem[] = [
  {
    description: 'Prepare revised PM compensation proposal for review',
    owner: 'Mike Torres',
    dueDate: 'Mar 23, 2026',
    source: 'IDS',
  },
  {
    description: 'Configure weekend auto-responder in CRM',
    owner: 'Sarah Chen',
    dueDate: 'Mar 22, 2026',
    source: 'IDS',
  },
  {
    description: 'Contact top 3 suppliers to negotiate Q2 pricing',
    owner: 'David Kim',
    dueDate: 'Mar 25, 2026',
    source: 'Rock Review',
  },
  {
    description: 'Send revised proposal to Westfield client',
    owner: 'Sarah Chen',
    dueDate: 'Mar 20, 2026',
    source: 'Carried Forward',
  },
  {
    description: 'Schedule crew training for new safety protocols',
    owner: 'Mike Torres',
    dueDate: 'Mar 21, 2026',
    source: 'Carried Forward',
  },
  {
    description: 'Renew design tool licenses (annual plan)',
    owner: 'Lisa Park',
    dueDate: 'Mar 27, 2026',
    source: 'IDS',
  },
];

const issuesSummary: RecapIssue[] = [
  {
    title: 'Material costs increasing 12% - need pricing strategy',
    status: 'resolved',
    resolution: 'Schedule supplier negotiation meeting. David Kim to lead.',
  },
  {
    title: 'Two PM candidates declined offers - compensation gap',
    status: 'resolved',
    resolution: 'Increase compensation packages by 15%. Mike to prepare proposal.',
  },
  {
    title: 'Customer complaints about response time on weekends',
    status: 'resolved',
    resolution: 'Implement auto-responder. Sarah to configure by Friday.',
  },
  {
    title: 'Design tool licenses expiring next month',
    status: 'resolved',
    resolution: 'Renew annual plan. Lisa to process.',
  },
  {
    title: 'Subcontractor availability for Q2 projects',
    status: 'carried',
  },
];

const sectionNotes: SectionNote[] = [
  {
    section: 'Check-in',
    notes: [
      'Joseph: Family vacation to Lake Tahoe was great. Professionally, excited about the AI estimating beta results - 3 clients testing now.',
      'Mike: Son\'s baseball team won their first game. Crew morale is high after the safety certification achievement.',
      'Sarah: Closed the Riverside commercial deal on Friday - $180K contract.',
      'Lisa: Attended a design conference - brought back ideas for the brand refresh.',
      'David: Started training for a half-marathon. Ops running smoothly after the scheduling fix.',
    ],
  },
  {
    section: 'Scorecard Review',
    notes: [
      'Revenue tracking above target at $295K vs $280K goal (+5.4%).',
      'New leads slightly below target (38 vs 40). Marketing campaign delayed by one week.',
      'Close rate significantly improved to 42% (target 35%) - AI estimating may be contributing.',
      'Active projects below target (12 vs 15) - need to accelerate pipeline conversion.',
      'Customer satisfaction strong at 4.7/5.0.',
    ],
  },
  {
    section: 'Rock Review',
    notes: [
      'AI estimating launch: ON TRACK - Beta testing with 3 clients showing 25% faster turnaround.',
      'PM hiring: OFF TRACK - Two senior candidates declined. Root cause: compensation below market.',
      'Customer portal v2: ON TRACK - Development 80% complete, beta launch next week.',
      'Material waste reduction: AT RISK - Need supplier cooperation. David to schedule meeting.',
      'Brand refresh: ON TRACK - Lisa presented updated color palette and typography. Team approved direction.',
    ],
  },
  {
    section: 'Action Item Review',
    notes: [
      '3 of 5 items completed on time.',
      'Completed: Q1 financials review, design mockups for portal, safety protocol documentation.',
      'Carried forward: Westfield proposal (in progress), crew training scheduling.',
    ],
  },
  {
    section: 'Headlines',
    notes: [
      'Won the Riverside commercial project - $180K contract (Sarah Chen)',
      'New safety certification achieved for all crews (Mike Torres)',
      'QuickBooks integration now live and syncing daily (Joseph)',
    ],
  },
  {
    section: 'IDS - Issues',
    notes: [
      'Discussed and resolved 4 of 5 issues.',
      'Top issue: Material cost increases resolved with supplier negotiation strategy.',
      'PM hiring issue resolved by increasing compensation budget by 15%.',
      'Weekend response time resolved with auto-responder implementation.',
      'Subcontractor availability carried to next week pending Q2 project timeline clarity.',
    ],
  },
  {
    section: 'Conclude',
    notes: [
      'Average meeting rating: 8.2/10.',
      'Team consensus: productive session with clear action items.',
      'Next meeting: March 27, 2026 at 9:00 AM.',
    ],
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MeetingRecapPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Check-in'])
  );
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'done'>('idle');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState<Record<string, boolean>>(
    Object.fromEntries(recapAttendees.map((a) => [a.name, true]))
  );
  const [additionalEmail, setAdditionalEmail] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [emailSending, setEmailSending] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            href="/bos/meetings"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Meetings
          </Link>
          <span>/</span>
          <span className="text-foreground">Meeting Recap</span>
        </div>

        {/* Header */}
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">
                  Leadership Team Weekly Sync
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400 ring-1 ring-green-400/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  March 20, 2026
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  9:00 AM - 10:28 AM (88 min)
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  5 of 6 attended
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-400" />
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {avgRating.toFixed(1)}/10
                  </span>
                </span>
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex flex-wrap shrink-0 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 gap-1.5 rounded-lg px-3 text-xs ${exportState === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                disabled={exportState !== 'idle'}
                onClick={() => {
                  setExportState('exporting');
                  toast.success('PDF export started. Check your downloads.');
                  setTimeout(() => {
                    setExportState('done');
                    setTimeout(() => setExportState('idle'), 2000);
                  }, 1500);
                }}
              >
                {exportState === 'exporting' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Exporting...
                  </>
                ) : exportState === 'done' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Exported
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    Export PDF
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEmailRecipients(Object.fromEntries(recapAttendees.map((a) => [a.name, true])));
                  setAdditionalEmails([]);
                  setAdditionalEmail('');
                  setEmailSending(false);
                  setShowEmailDialog(true);
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                Share via Email
              </Button>
            </div>
          </div>

          {/* Attendee ratings */}
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center gap-6">
              {recapAttendees.map((attendee) => (
                <div key={attendee.name} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {attendee.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{attendee.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Rated: {attendee.rating}/10
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI badge */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-500/5 px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs text-indigo-600 dark:text-indigo-400">
              AI-generated recap by Kiptra AI Meeting Assistant
            </span>
          </div>
        </div>

        {/* Decisions Made */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-foreground">Decisions Made</h2>
            <span className="text-xs text-muted-foreground">({decisions.length})</span>
          </div>
          <div className="space-y-2">
            {decisions.map((decision, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/20 p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-foreground">{decision.text}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    From: {decision.section}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-foreground">Action Items</h2>
            <span className="text-xs text-muted-foreground">
              ({actionItems.length})
            </span>
          </div>
          <div className="glass overflow-hidden rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Owner
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Due Date
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {actionItems.map((item, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="px-4 py-3 text-foreground">{item.description}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.owner}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.dueDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          item.source === 'Carried Forward'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20'
                        )}
                      >
                        {item.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issues Summary */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-foreground">Issues Summary</h2>
            <span className="text-xs text-muted-foreground">
              {issuesSummary.filter((i) => i.status === 'resolved').length} resolved,{' '}
              {issuesSummary.filter((i) => i.status === 'carried').length} carried forward
            </span>
          </div>
          <div className="space-y-2">
            {issuesSummary.map((issue, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg p-3',
                  issue.status === 'resolved' ? 'bg-green-500/5' : 'bg-amber-500/5'
                )}
              >
                <div className="flex items-start gap-3">
                  {issue.status === 'resolved' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{issue.title}</p>
                    {issue.resolution && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {issue.resolution}
                      </p>
                    )}
                    <span
                      className={cn(
                        'mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1',
                        issue.status === 'resolved'
                          ? 'bg-green-500/15 text-green-600 dark:text-green-400 ring-green-500/20'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-500/20'
                      )}
                    >
                      {issue.status === 'resolved' ? 'Resolved' : 'Carried Forward'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section-by-Section Notes */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-foreground">
              Section-by-Section Notes
            </h2>
          </div>
          <div className="space-y-1">
            {sectionNotes.map((section) => {
              const isExpanded = expandedSections.has(section.section);
              return (
                <div key={section.section} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.section)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {section.section}
                    </span>
                    <ChevronLeft
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded ? '-rotate-90' : 'rotate-180'
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-1.5">
                      {section.notes.map((note, i) => (
                        <p
                          key={i}
                          className="text-xs text-muted-foreground leading-relaxed pl-4 border-l-2 border-border"
                        >
                          {note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back to meetings */}
        <div className="flex justify-center pb-6">
          <Link href="/bos/meetings">
            <Button
              variant="ghost"
              className="h-9 gap-1.5 rounded-lg px-4 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Meetings
            </Button>
          </Link>
        </div>
      </div>

      {/* Send Recap Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => { if (!open) setShowEmailDialog(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Send Recap Email
            </DialogTitle>
            <DialogDescription>
              Select attendees to receive the meeting recap.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attendees</h4>
            <div className="space-y-1.5">
              {recapAttendees.map((attendee) => (
                <button
                  key={attendee.name}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/50"
                  onClick={() => setEmailRecipients((prev) => ({ ...prev, [attendee.name]: !prev[attendee.name] }))}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${emailRecipients[attendee.name] ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                    {emailRecipients[attendee.name] && '\u2713'}
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                    {attendee.avatar}
                  </div>
                  <span className="text-sm text-foreground">{attendee.name}</span>
                </button>
              ))}
            </div>
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Additional Recipients</h4>
              {additionalEmails.map((email, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="flex-1 rounded-lg bg-muted/30 px-3 py-1.5 text-xs text-foreground">{email}</span>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-red-600 dark:text-red-400"
                    onClick={() => setAdditionalEmails((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={additionalEmail}
                  onChange={(e) => setAdditionalEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && additionalEmail.trim()) {
                      setAdditionalEmails((prev) => [...prev, additionalEmail.trim()]);
                      setAdditionalEmail('');
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-primary hover:bg-primary/10"
                  disabled={!additionalEmail.trim()}
                  onClick={() => {
                    if (additionalEmail.trim()) {
                      setAdditionalEmails((prev) => [...prev, additionalEmail.trim()]);
                      setAdditionalEmail('');
                    }
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" className="h-8 rounded-lg px-3 text-xs text-muted-foreground" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={emailSending}
              onClick={() => {
                setEmailSending(true);
                const recipientCount = Object.values(emailRecipients).filter(Boolean).length + additionalEmails.length;
                setTimeout(() => {
                  toast.success(`Recap sent to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`);
                  setShowEmailDialog(false);
                  setEmailSending(false);
                }, 1000);
              }}
              className="h-8 gap-1.5 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              {emailSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
