"use client";

import { useState, useCallback, DragEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  DollarSign,
  TrendingUp,
  BarChart3,
  Trophy,
  GripVertical,
  Calendar,
  User,
  PauseCircle,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deals as initialDeals,
  contacts,
  PIPELINE_STAGES,
  getContactById,
  getStageConfig,
  type Deal,
  type PipelineStage,
  type DealStatus,
} from "@/lib/crm-data";

// ─── Helpers ─────────────────────────────────────────────────
function formatValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 100000) return `$${(value / 1000).toFixed(0)}K`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatFullValue(value: number): string {
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const REPS = [
  "Jordan Mitchell",
  "Priya Sharma",
  "Alex Thompson",
  "Casey Rodriguez",
];

// ─── Component ───────────────────────────────────────────────
export default function PipelinePage() {
  const router = useRouter();
  const [allDeals, setAllDeals] = useState<Deal[]>(initialDeals);
  const [filterRep, setFilterRep] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | DealStatus>("all");
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    name: "",
    contactId: "",
    stage: "new_lead" as PipelineStage,
    value: "",
    expectedCloseDate: "",
    description: "",
  });

  // ─── Filtered deals ─────────────────────────────────────────
  const filteredDeals = allDeals.filter((d) => {
    if (filterRep !== "all" && d.assignedTo !== filterRep) return false;
    if (filterStatus !== "all" && d.dealStatus !== filterStatus) return false;
    return true;
  });

  const dealsByStage = (stage: PipelineStage) =>
    filteredDeals
      .filter((d) => d.stage === stage)
      .sort((a, b) => b.value - a.value);

  // ─── Pipeline stats ─────────────────────────────────────────
  const openDeals = filteredDeals.filter((d) => d.dealStatus === "open");
  const wonDeals = filteredDeals.filter((d) => d.dealStatus === "won");
  const totalPipeline = openDeals.reduce((s, d) => s + d.value, 0);
  const weightedValue = openDeals.reduce(
    (s, d) => s + d.value * (d.probability / 100),
    0
  );
  const winRate =
    wonDeals.length + openDeals.length > 0
      ? Math.round(
          (wonDeals.length / (wonDeals.length + filteredDeals.filter((d) => d.dealStatus === "lost").length || 1)) * 100
        )
      : 0;

  // ─── Drag & Drop ────────────────────────────────────────────
  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, dealId: string) => {
      e.dataTransfer.setData("text/plain", dealId);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, stage: PipelineStage) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverStage(stage);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, targetStage: PipelineStage) => {
      e.preventDefault();
      setDragOverStage(null);
      const dealId = e.dataTransfer.getData("text/plain");
      const deal = allDeals.find((d) => d.id === dealId);
      if (!deal || deal.stage === targetStage) return;

      const stageConfig = getStageConfig(targetStage);
      setAllDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: targetStage } : d))
      );
      toast.success(`Moved "${deal.name}" to ${stageConfig.label}`);
    },
    [allDeals]
  );

  // ─── Create Deal ────────────────────────────────────────────
  const handleCreateDeal = () => {
    if (!newDeal.name || !newDeal.contactId || !newDeal.value) {
      toast.error("Please fill in required fields");
      return;
    }

    const deal: Deal = {
      id: `deal-${Date.now()}`,
      name: newDeal.name,
      contactId: newDeal.contactId,
      stage: newDeal.stage,
      dealStatus: "open",
      value: parseFloat(newDeal.value),
      grossProfit: 0,
      probability: PIPELINE_STAGES.findIndex((s) => s.key === newDeal.stage) * 8 + 10,
      expectedCloseDate: newDeal.expectedCloseDate || "2026-06-30",
      createdDate: new Date().toISOString().split("T")[0],
      lastActivityDate: new Date().toISOString().split("T")[0],
      projectId: null,
      assignedTo: "Jordan Mitchell",
      description: newDeal.description,
      invoiceStatus: "none",
      arAging: 0,
      contractAmount: 0,
      billedToDate: 0,
    };

    setAllDeals((prev) => [...prev, deal]);
    setNewDeal({
      name: "",
      contactId: "",
      stage: "new_lead",
      value: "",
      expectedCloseDate: "",
      description: "",
    });
    setCreateOpen(false);
    toast.success(`Created deal "${deal.name}"`);
  };

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track deals through your K&B sales process
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-500/20"
                />
              }
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Deal
            </DialogTrigger>
            <DialogContent className="bg-popover/95 backdrop-blur-xl border-border text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create New Deal</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Deal Name *
                  </label>
                  <Input
                    placeholder="e.g. Smith Kitchen Remodel"
                    value={newDeal.name}
                    onChange={(e) =>
                      setNewDeal((p) => ({ ...p, name: e.target.value }))
                    }
                    className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Contact *
                  </label>
                  <Select
                    value={newDeal.contactId}
                    onValueChange={(v: string | null) =>
                      v && setNewDeal((p) => ({ ...p, contactId: v }))
                    }
                  >
                    <SelectTrigger className="bg-foreground/5 border-border text-foreground">
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-foreground">
                          {c.name}
                          {c.company ? ` — ${c.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Stage
                  </label>
                  <Select
                    value={newDeal.stage}
                    onValueChange={(v: string | null) =>
                      v && setNewDeal((p) => ({ ...p, stage: v as PipelineStage }))
                    }
                  >
                    <SelectTrigger className="bg-foreground/5 border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {PIPELINE_STAGES.map((s) => (
                        <SelectItem key={s.key} value={s.key} className="text-foreground">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Value ($) *
                  </label>
                  <Input
                    type="number"
                    placeholder="45000"
                    value={newDeal.value}
                    onChange={(e) =>
                      setNewDeal((p) => ({ ...p, value: e.target.value }))
                    }
                    className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Expected Close Date
                  </label>
                  <Input
                    type="date"
                    value={newDeal.expectedCloseDate}
                    onChange={(e) =>
                      setNewDeal((p) => ({
                        ...p,
                        expectedCloseDate: e.target.value,
                      }))
                    }
                    className="bg-foreground/5 border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Description
                  </label>
                  <Input
                    placeholder="Brief description..."
                    value={newDeal.description}
                    onChange={(e) =>
                      setNewDeal((p) => ({ ...p, description: e.target.value }))
                    }
                    className="bg-foreground/5 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button
                  onClick={handleCreateDeal}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 mt-2"
                >
                  Create Deal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Strip */}
        <div className="flex items-center gap-6 mt-4 px-4 py-2.5 rounded-lg bg-foreground/[0.03] border border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Pipeline
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatFullValue(totalPipeline)}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Weighted
              </p>
              <p className="text-sm font-semibold text-foreground">
                {formatFullValue(Math.round(weightedValue))}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Open Deals
              </p>
              <p className="text-sm font-semibold text-foreground">
                {openDeals.length}
              </p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Win Rate
              </p>
              <p className="text-sm font-semibold text-foreground">{winRate}%</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Filters */}
          <Select value={filterRep} onValueChange={(v: string | null) => v && setFilterRep(v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-foreground/5 border-border text-foreground">
              <User className="w-3 h-3 mr-1 opacity-50" />
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-foreground text-xs">
                All Reps
              </SelectItem>
              {REPS.map((r) => (
                <SelectItem key={r} value={r} className="text-foreground text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterStatus}
            onValueChange={(v: string | null) => v && setFilterStatus(v as "all" | DealStatus)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs bg-foreground/5 border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all" className="text-foreground text-xs">
                All Status
              </SelectItem>
              <SelectItem value="open" className="text-foreground text-xs">
                Open
              </SelectItem>
              <SelectItem value="won" className="text-foreground text-xs">
                Won
              </SelectItem>
              <SelectItem value="lost" className="text-foreground text-xs">
                Lost
              </SelectItem>
              <SelectItem value="on_hold" className="text-foreground text-xs">
                On Hold
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-6 pb-6">
        <div className="flex gap-3 h-full" style={{ minWidth: `${PIPELINE_STAGES.length * 292}px` }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = dealsByStage(stage.key);
            const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
            const isDragOver = dragOverStage === stage.key;

            return (
              <div
                key={stage.key}
                className={`flex flex-col rounded-xl border transition-all duration-200 ${
                  isDragOver
                    ? `${stage.borderColor} ring-1 ring-current bg-foreground/[0.04]`
                    : "border-border bg-foreground/[0.02]"
                }`}
                style={{ minWidth: 280, width: 280 }}
                onDragOver={(e) => handleDragOver(e, stage.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column Header */}
                <div className={`flex-shrink-0 px-3 py-2.5 border-b border-border rounded-t-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <stage.icon className={`w-3.5 h-3.5 ${stage.color}`} />
                      <span className={`text-xs font-semibold ${stage.color}`}>
                        {stage.shortLabel}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-foreground/5 rounded-full px-1.5 py-0.5 ml-0.5">
                        {stageDeals.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatValue(stageTotal)}
                    </span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-foreground/10">
                  {stageDeals.length === 0 ? (
                    <div className="flex items-center justify-center h-20 text-xs text-muted-foreground/50 italic">
                      No deals
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const contact = getContactById(deal.contactId);
                      return (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          contactName={contact?.name ?? "Unknown"}
                          stageColor={stage.color}
                          onDragStart={handleDragStart}
                          onClick={() => router.push(`/crm/deals/${deal.id}`)}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Deal Card ──────────────────────────────────────────────
function DealCard({
  deal,
  contactName,
  stageColor,
  onDragStart,
  onClick,
}: {
  deal: Deal;
  contactName: string;
  stageColor: string;
  onDragStart: (e: DragEvent<HTMLDivElement>, id: string) => void;
  onClick: () => void;
}) {
  const gpBadgeColor =
    deal.grossProfit >= 30
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : deal.grossProfit >= 20
      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30";

  const statusIndicator = {
    won: { icon: CheckCircle2, color: "text-emerald-400", label: "Won" },
    lost: { icon: XCircle, color: "text-red-400", label: "Lost" },
    on_hold: { icon: PauseCircle, color: "text-amber-400", label: "On Hold" },
    open: null,
  }[deal.dealStatus];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      onClick={onClick}
      className="group relative rounded-lg border border-border bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/[0.15] p-3 cursor-pointer transition-all duration-150 active:scale-[0.98]"
    >
      {/* Drag handle */}
      <div className="absolute top-2.5 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      {/* Contact name */}
      <p className="text-[10px] text-muted-foreground truncate pr-5">
        {contactName}
      </p>

      {/* Deal name */}
      <p className="text-sm font-medium text-foreground mt-0.5 truncate pr-4">
        {deal.name}
      </p>

      {/* Value + GP */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm font-semibold text-foreground">
          {deal.value >= 100000
            ? formatFullValue(deal.value)
            : formatValue(deal.value)}
        </span>
        {deal.grossProfit > 0 && (
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 ${gpBadgeColor}`}
          >
            {deal.grossProfit}% GP
          </Badge>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(deal.expectedCloseDate)}</span>
        </div>

        {statusIndicator ? (
          <div className={`flex items-center gap-0.5 ${statusIndicator.color}`}>
            <statusIndicator.icon className="w-3 h-3" />
            <span className="text-[10px] font-medium">
              {statusIndicator.label}
            </span>
          </div>
        ) : null}
      </div>

      {/* Assigned to */}
      <p className="text-[10px] text-muted-foreground/60 mt-1.5 truncate">
        {deal.assignedTo}
      </p>
    </div>
  );
}
