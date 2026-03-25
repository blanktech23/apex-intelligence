"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  constraintRules,
  getConstraintSummary,
  type ConstraintRule,
  type Severity,
} from "@/data/kb/constraint-rules";
import { floorPlan } from "@/data/kb/floor-plan-data";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getItemName(itemId: string): string {
  const cab = floorPlan.cabinets.find((c) => c.id === itemId);
  if (cab) return cab.name;
  const app = floorPlan.appliances.find((a) => a.id === itemId);
  if (app) return app.name;
  const fix = floorPlan.fixtures.find((f) => f.id === itemId);
  if (fix) return fix.name;
  return itemId;
}

const severityConfig: Record<
  Severity,
  {
    label: string;
    icon: typeof AlertTriangle;
    badgeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  P1: {
    label: "Errors",
    icon: AlertCircle,
    badgeBg: "bg-red-500/10",
    badgeText: "text-red-600 dark:text-red-400",
    dotColor: "bg-red-500",
  },
  P2: {
    label: "Warnings",
    icon: AlertTriangle,
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  P3: {
    label: "Info",
    icon: Info,
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function RuleItem({
  rule,
  onSelectItem,
}: {
  rule: ConstraintRule;
  onSelectItem: (id: string) => void;
}) {
  const cfg = severityConfig[rule.severity];
  const Icon = cfg.icon;

  return (
    <button
      onClick={() => {
        if (rule.affectedItemIds.length > 0) {
          onSelectItem(rule.affectedItemIds[0]);
        }
      }}
      className="w-full text-left rounded-lg border border-border/50 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
    >
      <div className="flex items-start gap-2">
        <Icon className={`size-3.5 mt-0.5 shrink-0 ${cfg.badgeText}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground truncate">
              {rule.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
              {rule.nkbaRef}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
            {rule.message}
          </p>
          {rule.affectedItemIds.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {rule.affectedItemIds.slice(0, 3).map((id) => (
                <span
                  key={id}
                  className="inline-flex rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {getItemName(id)}
                </span>
              ))}
              {rule.affectedItemIds.length > 3 && (
                <span className="text-[10px] text-muted-foreground/60">
                  +{rule.affectedItemIds.length - 3} more
                </span>
              )}
            </div>
          )}
          {rule.measurement && (
            <div className="mt-1.5 flex items-center gap-2 text-[10px]">
              <span className={`font-mono font-medium ${cfg.badgeText}`}>
                {rule.measurement.actual}{rule.measurement.unit === "inches" ? '"' : "'"}
              </span>
              <span className="text-muted-foreground/60">vs required</span>
              <span className="font-mono font-medium text-foreground">
                {rule.measurement.required}{rule.measurement.unit === "inches" ? '"' : "'"}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function SeveritySection({
  severity,
  rules,
  onSelectItem,
  defaultOpen = true,
}: {
  severity: Severity;
  rules: ConstraintRule[];
  onSelectItem: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = severityConfig[severity];
  const Icon = cfg.icon;

  if (rules.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-1.5"
      >
        <Icon className={`size-3.5 ${cfg.badgeText}`} />
        <span className="text-xs font-semibold text-foreground">
          {cfg.label}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${cfg.badgeBg} ${cfg.badgeText}`}
        >
          {rules.length}
        </span>
        <div className="flex-1" />
        {open ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="space-y-2 pb-2">
          {rules.map((rule) => (
            <RuleItem key={rule.id} rule={rule} onSelectItem={onSelectItem} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */

interface ConstraintPanelProps {
  onSelectItem: (id: string) => void;
  className?: string;
}

export function ConstraintPanel({ onSelectItem, className }: ConstraintPanelProps) {
  const [passedOpen, setPassedOpen] = useState(false);
  const summary = getConstraintSummary();

  const failures = constraintRules.filter((r) => r.status === "fail");
  const warnings = constraintRules.filter(
    (r) => r.status === "warning" && r.severity === "P2"
  );
  const infos = constraintRules.filter(
    (r) => r.status === "warning" && r.severity === "P3"
  );
  const passes = constraintRules.filter((r) => r.status === "pass");

  return (
    <div className={className}>
      {/* Header with summary badge */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          Constraint Validation
        </h3>
        <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {summary.pass} pass, {summary.fail} errors, {summary.warning} warnings
        </span>
      </div>

      <div className="space-y-1">
        {/* P1 Errors */}
        <SeveritySection
          severity="P1"
          rules={failures}
          onSelectItem={onSelectItem}
        />

        {/* P2 Warnings */}
        <SeveritySection
          severity="P2"
          rules={warnings}
          onSelectItem={onSelectItem}
        />

        {/* P3 Info */}
        <SeveritySection
          severity="P3"
          rules={infos}
          onSelectItem={onSelectItem}
        />

        {/* Passed rules */}
        <div>
          <button
            onClick={() => setPassedOpen(!passedOpen)}
            className="flex w-full items-center gap-2 py-1.5"
          >
            <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-foreground">Passed</span>
            <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
              {passes.length}
            </span>
            <div className="flex-1" />
            {passedOpen ? (
              <ChevronUp className="size-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-3.5 text-muted-foreground" />
            )}
          </button>
          {passedOpen && (
            <div className="space-y-1 pb-2">
              {passes.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5"
                >
                  <CheckCircle2 className="size-3 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-[11px] text-muted-foreground truncate">
                    {rule.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 ml-auto">
                    {rule.nkbaRef}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
