"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Phone,
  Globe,
  Bot,
  User,
  Sparkles,
  Clock,
  Plus,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Receipt,
  Timer,
  Target,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  deals,
  contacts,
  getContactById,
  getActivitiesByDeal,
  getStageConfig,
  getContactTypeConfig,
  PIPELINE_STAGES,
  ACTIVITY_TYPES,
  type Deal,
  type Activity,
  type PipelineStage,
} from "@/lib/crm-data";

// ─── Deal status badge colors ────────────────────────────────
const dealStatusColors: Record<string, string> = {
  open: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  won: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  lost: "bg-red-500/20 text-red-400 border-red-500/30",
  on_hold: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const dealStatusLabels: Record<string, string> = {
  open: "Open",
  won: "Won",
  lost: "Lost",
  on_hold: "On Hold",
};

// ─── Mock invoices ───────────────────────────────────────────
function getMockInvoices(deal: Deal) {
  if (deal.billedToDate === 0) return [];
  const invoices = [];
  if (deal.contractAmount > 0 && deal.billedToDate > 0) {
    invoices.push({
      number: `INV-${deal.id.split("-")[1]}01`,
      amount: Math.round(deal.billedToDate * 0.6),
      status: "paid" as const,
      date: deal.createdDate,
    });
    if (deal.billedToDate > deal.contractAmount * 0.3) {
      invoices.push({
        number: `INV-${deal.id.split("-")[1]}02`,
        amount: Math.round(deal.billedToDate * 0.4),
        status: deal.arAging > 0 ? ("overdue" as const) : ("paid" as const),
        date: deal.lastActivityDate,
      });
    }
  }
  return invoices;
}

// ─── AI insights by stage ────────────────────────────────────
function getInsightsForDeal(deal: Deal) {
  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.key === deal.stage);
  const insights: { text: string; type: "growth" | "engagement" | "opportunity" | "risk" }[] = [];

  if (stageIdx <= 2) {
    insights.push({ text: `Response time was ${deal.contactId === "con-010" ? "45" : "3"} min — ${deal.contactId === "con-010" ? "above" : "within"} the 5-min target.`, type: deal.contactId === "con-010" ? "risk" : "growth" });
    insights.push({ text: "Send pre-consultation questionnaire 48 hours before the meeting to maximize consultation quality.", type: "opportunity" });
    insights.push({ text: "Leads at this stage convert at 35% — personalized follow-up within 24h increases to 52%.", type: "engagement" });
  } else if (deal.stage === "in_design") {
    insights.push({ text: "2 revision rounds completed — average for this stage is 3. On track for faster approval.", type: "growth" });
    insights.push({ text: "Material selections pending for 5+ days. Proactive outreach reduces design phase by 1 week.", type: "risk" });
    insights.push({ text: `Similar deals at this value ($${(deal.value / 1000).toFixed(0)}K) close 22% faster with a design walkthrough video.`, type: "opportunity" });
  } else if (deal.stage === "proposal_sent") {
    insights.push({ text: "60% of decisions happen within 72 hours — follow up tomorrow if no response.", type: "engagement" });
    insights.push({ text: "Proposal open rate: 3 views in 48 hours. High engagement signals readiness to close.", type: "growth" });
    insights.push({ text: "Offering a 5% early-sign discount has converted 40% of stalled proposals this quarter.", type: "opportunity" });
  } else if (deal.stage === "warranty") {
    insights.push({ text: "Send review request — 30-day window closes soon. Google reviews drive 3x more referrals.", type: "risk" });
    insights.push({ text: "Customer satisfaction score projected at 9.2/10 based on project timeline adherence.", type: "growth" });
    insights.push({ text: "Cross-sell opportunity: 45% of warranty-stage clients book a second project within 6 months.", type: "opportunity" });
  } else if (deal.stage === "estimating") {
    insights.push({ text: "Sub quotes are 80% collected. Completing takeoff 2 days early improves proposal acceptance by 15%.", type: "growth" });
    insights.push({ text: "Material costs trending 3% higher than Q4 — lock pricing with suppliers this week.", type: "risk" });
    insights.push({ text: "Bundle kitchen + bath estimate for a 10% package discount to increase deal value.", type: "opportunity" });
  } else if (deal.stage === "in_construction") {
    insights.push({ text: "Project is on schedule — 94% of on-time projects result in 5-star reviews.", type: "growth" });
    insights.push({ text: `AR aging at ${deal.arAging} days. ${deal.arAging > 0 ? "Send payment reminder to maintain cash flow." : "All payments current."}`, type: deal.arAging > 0 ? "risk" : "engagement" });
    insights.push({ text: "Schedule pre-completion walkthrough to catch punch list items early and avoid delays.", type: "opportunity" });
  } else {
    insights.push({ text: "Deal progressing within expected timeline. Conversion probability aligns with historical data.", type: "engagement" });
    insights.push({ text: "Regular touchpoints increase close rate by 28% — schedule next follow-up within 5 business days.", type: "opportunity" });
    insights.push({ text: `GP margin at ${deal.grossProfit}% — ${deal.grossProfit >= 30 ? "above" : "below"} the 30% target. ${deal.grossProfit < 30 ? "Review pricing." : "Strong margin."}`, type: deal.grossProfit >= 30 ? "growth" : "risk" });
  }

  return insights;
}

// ─── Similar deals ───────────────────────────────────────────
function getSimilarDeals(deal: Deal) {
  return deals
    .filter(
      (d) =>
        d.id !== deal.id &&
        d.stage === deal.stage &&
        d.dealStatus !== "lost" &&
        Math.abs(d.value - deal.value) / deal.value < 0.5
    )
    .slice(0, 3);
}

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;

  const foundDeal = deals.find((d) => d.id === dealId);

  const [currentStage, setCurrentStage] = useState<PipelineStage>(
    foundDeal?.stage ?? "new_lead"
  );
  const [activeTab, setActiveTab] = useState("activities");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([
    { content: "Initial scope discussion completed. Client has clear vision.", date: "2026-03-15T10:00:00", author: "Jordan Mitchell" },
    { content: "AI follow-up: Budget alignment confirmed. Proceed with design phase.", date: "2026-03-18T14:30:00", author: "Estimating Agent" },
  ]);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logForm, setLogForm] = useState({
    type: "note" as string,
    subject: "",
    description: "",
  });

  if (!foundDeal) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass border-border p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Deal Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The deal you are looking for does not exist.
          </p>
          <Link href="/crm/pipeline">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pipeline
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const deal = foundDeal;
  const contact = getContactById(deal.contactId);
  const dealActivities = getActivitiesByDeal(deal.id);
  const stageConfig = getStageConfig(currentStage);
  const stageIdx = PIPELINE_STAGES.findIndex((s) => s.key === currentStage);
  const insights = getInsightsForDeal({ ...deal, stage: currentStage });
  const similarDeals = getSimilarDeals(deal);
  const invoices = getMockInvoices(deal);
  const contactType = contact ? getContactTypeConfig(contact.type) : null;

  function moveToPrevStage() {
    if (stageIdx > 0) {
      const prev = PIPELINE_STAGES[stageIdx - 1].key;
      setCurrentStage(prev);
      toast.success(`Moved to ${PIPELINE_STAGES[stageIdx - 1].label}`);
    }
  }

  function moveToNextStage() {
    if (stageIdx < PIPELINE_STAGES.length - 1) {
      const next = PIPELINE_STAGES[stageIdx + 1].key;
      setCurrentStage(next);
      toast.success(`Moved to ${PIPELINE_STAGES[stageIdx + 1].label}`);
    }
  }

  function handleLogActivity() {
    if (!logForm.subject.trim()) return;
    toast.success("Activity logged successfully");
    setLogForm({ type: "note", subject: "", description: "" });
    setShowLogDialog(false);
  }

  const invoiceStatusColors: Record<string, string> = {
    paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    overdue: "bg-red-500/20 text-red-400 border-red-500/30",
    sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    draft: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    partial: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <Link
          href="/crm/pipeline"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{deal.name}</h1>
              <Badge
                variant="outline"
                className={`${stageConfig.bgColor} ${stageConfig.color} ${stageConfig.borderColor}`}
              >
                {stageConfig.label}
              </Badge>
              <Badge
                variant="outline"
                className={dealStatusColors[deal.dealStatus]}
              >
                {dealStatusLabels[deal.dealStatus]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="text-xl font-semibold text-foreground">
                ${deal.value.toLocaleString()}
              </span>
              {deal.grossProfit > 0 && (
                <span className="text-sm">
                  GP: <span className="text-emerald-400 font-medium">{deal.grossProfit}%</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={stageIdx === 0}
              onClick={moveToPrevStage}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Stage
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={stageIdx === PIPELINE_STAGES.length - 1}
              onClick={moveToNextStage}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Next Stage
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-border" />

      {/* Contact Card */}
      {contact && (
        <Card className="glass border-border p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Contact
          </h3>
          <Link
            href={`/crm/contacts/${contact.id}`}
            className="flex flex-wrap items-center gap-4 group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-medium text-indigo-300 shrink-0">
                {contact.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground group-hover:text-indigo-400 transition-colors">
                    {contact.name}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  {contactType && (
                    <Badge variant="outline" className={`${contactType.bgColor} ${contactType.color} text-[10px] px-1.5 py-0`}>
                      {contactType.label}
                    </Badge>
                  )}
                </div>
                {contact.company && (
                  <p className="text-sm text-muted-foreground truncate">{contact.company}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {contact.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{contact.email}</span>
                </div>
              )}
            </div>
          </Link>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-indigo-500/10 p-2">
              <DollarSign className="h-4 w-4 text-indigo-400" />
            </div>
            <span className="text-xs text-muted-foreground">Contract Amount</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            ${deal.contractAmount.toLocaleString()}
          </p>
        </Card>
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Receipt className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-xs text-muted-foreground">Billed to Date</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            ${deal.billedToDate.toLocaleString()}
          </p>
        </Card>
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Timer className="h-4 w-4 text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground">AR Aging</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {deal.arAging} <span className="text-sm font-normal text-muted-foreground">days</span>
          </p>
        </Card>
        <Card className="glass border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Target className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-xs text-muted-foreground">Probability</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {deal.probability}<span className="text-sm font-normal text-muted-foreground">%</span>
          </p>
        </Card>
      </div>

      {/* Stage Timeline */}
      <Card className="glass border-border p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Pipeline Progress
        </h3>
        <div className="flex items-center gap-0 min-w-[700px]">
          {PIPELINE_STAGES.map((stage, i) => {
            const StageIcon = stage.icon;
            const isCompleted = i < stageIdx;
            const isCurrent = i === stageIdx;
            const isFuture = i > stageIdx;
            return (
              <div key={stage.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? "border-emerald-500/50 bg-emerald-500/20"
                        : isCurrent
                        ? `${stage.borderColor} ${stage.bgColor} ring-2 ring-offset-1 ring-offset-background ${stage.borderColor}`
                        : "border-border bg-foreground/5"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <StageIcon
                        className={`h-4 w-4 ${
                          isCurrent ? stage.color : "text-muted-foreground/50"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-center leading-tight ${
                      isCurrent
                        ? `${stage.color} font-semibold`
                        : isCompleted
                        ? "text-emerald-400/70"
                        : "text-muted-foreground/40"
                    }`}
                  >
                    {stage.shortLabel}
                  </span>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 -mx-1 ${
                      i < stageIdx
                        ? "bg-emerald-500/40"
                        : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="glass border border-border bg-foreground/5">
              <TabsTrigger
                value="activities"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Activities
              </TabsTrigger>
              <TabsTrigger
                value="financials"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Financials
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300"
              >
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Activities Tab */}
            <TabsContent value="activities" className="mt-4 space-y-4">
              <div className="flex justify-end">
                <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                  <DialogTrigger
                    render={
                      <Button
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                      />
                    }
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Log Activity
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Log Activity</DialogTitle>
                      <DialogDescription>
                        Record a new activity for this deal.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                        <Select
                          value={logForm.type}
                          onValueChange={(v) => v && setLogForm({ ...logForm, type: v })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACTIVITY_TYPES.map((t) => (
                              <SelectItem key={t.key} value={t.key}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Subject</label>
                        <Input
                          value={logForm.subject}
                          onChange={(e) =>
                            setLogForm({ ...logForm, subject: e.target.value })
                          }
                          placeholder="Activity subject..."
                          className="bg-transparent border-border"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                        <textarea
                          value={logForm.description}
                          onChange={(e) =>
                            setLogForm({ ...logForm, description: e.target.value })
                          }
                          placeholder="Add details..."
                          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground border border-border rounded-lg p-2 resize-none focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline" className="border-border" />}
                      >
                        Cancel
                      </DialogClose>
                      <Button
                        onClick={handleLogActivity}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Log Activity
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {dealActivities.length === 0 ? (
                <Card className="glass border-border p-8 text-center">
                  <p className="text-muted-foreground">No activities recorded for this deal yet.</p>
                </Card>
              ) : (
                <div className="relative space-y-0">
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                  {dealActivities.map((activity) => {
                    const typeConfig = ACTIVITY_TYPES.find(
                      (t) => t.key === activity.type
                    );
                    const TypeIcon = typeConfig?.icon ?? FileText;
                    return (
                      <div key={activity.id} className="relative flex gap-4 py-3">
                        <div
                          className={`relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                            activity.agent === "ai"
                              ? "border-amber-500/30 bg-amber-500/10"
                              : "border-border bg-foreground/5"
                          }`}
                        >
                          <TypeIcon
                            className={`h-4 w-4 ${
                              activity.agent === "ai"
                                ? "text-amber-400"
                                : typeConfig?.color ?? "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {activity.subject}
                            </span>
                            {activity.agent === "ai" && (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0"
                              >
                                <Bot className="h-3 w-3 mr-1" />
                                {activity.agentName}
                              </Badge>
                            )}
                            {activity.direction && (
                              <span className="text-muted-foreground">
                                {activity.direction === "inbound" ? (
                                  <ArrowDownLeft className="h-3.5 w-3.5 text-blue-400" />
                                ) : (
                                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {new Date(activity.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at{" "}
                              {new Date(activity.date).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                            {activity.duration && (
                              <>
                                <span>-</span>
                                <span>{activity.duration} min</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Financials Tab */}
            <TabsContent value="financials" className="mt-4 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="glass border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Contract</p>
                  <p className="text-lg font-bold text-foreground">
                    ${deal.contractAmount.toLocaleString()}
                  </p>
                </Card>
                <Card className="glass border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Billed</p>
                  <p className="text-lg font-bold text-emerald-400">
                    ${deal.billedToDate.toLocaleString()}
                  </p>
                </Card>
                <Card className="glass border-border p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Outstanding</p>
                  <p className="text-lg font-bold text-amber-400">
                    ${(deal.contractAmount - deal.billedToDate).toLocaleString()}
                  </p>
                </Card>
              </div>

              {/* Invoice Table */}
              <Card className="glass border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground">Invoices</h4>
                </div>
                {invoices.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    No invoices generated yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {invoices.map((inv) => (
                      <div
                        key={inv.number}
                        className="flex items-center justify-between p-4 hover:bg-foreground/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {inv.number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(inv.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">
                            ${inv.amount.toLocaleString()}
                          </span>
                          <Badge
                            variant="outline"
                            className={invoiceStatusColors[inv.status]}
                          >
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Payment Progress */}
              <Card className="glass border-border p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Payment Progress</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-foreground/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${
                          deal.contractAmount > 0
                            ? Math.min((deal.billedToDate / deal.contractAmount) * 100, 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {deal.contractAmount > 0
                      ? Math.round((deal.billedToDate / deal.contractAmount) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4 space-y-4">
              <Card className="glass border-border p-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this deal..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (noteText.trim()) {
                        setNotes([
                          ...notes,
                          {
                            content: noteText.trim(),
                            date: new Date().toISOString(),
                            author: "You",
                          },
                        ]);
                        setNoteText("");
                        toast.success("Note added successfully");
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              </Card>
              {notes
                .slice()
                .reverse()
                .map((note, i) => (
                  <Card key={i} className="glass border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {note.author.includes("Agent") ? (
                          <Bot className="h-4 w-4 text-amber-400" />
                        ) : (
                          <User className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium text-muted-foreground">
                          {note.author}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* AI Deal Insights */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                AI Deal Insights
              </h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    insight.type === "risk"
                      ? "bg-red-500/10 border border-red-500/20 text-red-300"
                      : insight.type === "opportunity"
                      ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                      : insight.type === "growth"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                      : "bg-blue-500/10 border border-blue-500/20 text-blue-300"
                  }`}
                >
                  {insight.text}
                </div>
              ))}
            </div>
          </Card>

          {/* Similar Deals */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Similar Deals
              </h3>
            </div>
            {similarDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No similar deals at this stage.</p>
            ) : (
              <div className="space-y-3">
                {similarDeals.map((sd) => {
                  const sdContact = getContactById(sd.contactId);
                  return (
                    <Link
                      key={sd.id}
                      href={`/crm/deals/${sd.id}`}
                      className="block rounded-lg p-3 bg-foreground/[0.03] border border-border hover:bg-foreground/[0.06] transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground mb-1">
                        {sd.name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{sdContact?.name ?? "Unknown"}</span>
                        <span className="font-medium">${sd.value.toLocaleString()}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Key Dates */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key Dates
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="text-foreground">
                  {new Date(deal.createdDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expected Close</span>
                <span className="text-foreground">
                  {new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Activity</span>
                <span className="text-foreground">
                  {new Date(deal.lastActivityDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
