"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  Trophy,
  Zap,
  ChevronDown,
  Plus,
  Handshake,
  Activity,
  ArrowRight,
  Sparkles,
  UserPlus,
  Share2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  contacts,
  deals,
  activities,
  PIPELINE_STAGES,
  CONTACT_TYPES,
  ACTIVITY_TYPES,
  getContactById,
  getActivityTypeConfig,
  getPipelineStats,
} from "@/lib/crm-data";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString()}`;
}

function relativeTime(dateStr: string): string {
  const now = new Date("2026-03-22T17:00:00");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CRMDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const stats = getPipelineStats();
  const openDeals = deals.filter((d) => d.dealStatus === "open");
  const wonDeals = deals.filter((d) => d.dealStatus === "won");
  const wonThisMonthDeals = wonDeals.filter((d) => d.lastActivityDate >= "2026-03-01");

  // Speed-to-lead per contact
  const contactsWithSTL = contacts.filter((c) => c.speedToLead !== null);
  const avgSTL = Math.round(
    contactsWithSTL.reduce((sum, c) => sum + c.speedToLead!, 0) / contactsWithSTL.length
  );

  // Pipeline stage counts for mini bar
  const stageCounts = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    count: deals.filter((d) => d.stage === stage.key && d.dealStatus !== "lost").length,
  }));
  const totalStageDeals = stageCounts.reduce((s, sc) => s + sc.count, 0);

  // Contact type breakdown
  const contactTypeBreakdown = CONTACT_TYPES.map((ct) => ({
    ...ct,
    count: contacts.filter((c) => c.type === ct.key).length,
  }));

  // Pipeline value per stage
  const stageValues = PIPELINE_STAGES.map((stage) => ({
    ...stage,
    value: deals
      .filter((d) => d.stage === stage.key && d.dealStatus !== "lost")
      .reduce((sum, d) => sum + d.value, 0),
  })).filter((s) => s.value > 0);

  // Recent activities (last 8)
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Referral stats
  const referralContacts = contacts.filter((c) => c.referralSource === "Referral");
  const referralRevenue = referralContacts.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalRevenue = contacts.reduce((sum, c) => sum + c.totalRevenue, 0);
  const referralRevenuePercent = totalRevenue > 0 ? Math.round((referralRevenue / totalRevenue) * 100) : 0;

  // Stat cards config
  const statCards = [
    {
      key: "contacts",
      label: "Total Contacts",
      value: contacts.length.toString(),
      subtitle: `${contacts.filter((c) => c.status === "active").length} active`,
      color: "text-blue-400",
      icon: Users,
    },
    {
      key: "pipeline",
      label: "Pipeline Value",
      value: formatCurrency(stats.totalPipelineValue),
      subtitle: `Weighted: ${formatCurrency(stats.weightedValue)}`,
      color: "text-emerald-400",
      icon: DollarSign,
    },
    {
      key: "won",
      label: "Won This Month",
      value: `${wonThisMonthDeals.length} deals`,
      subtitle: formatCurrencyFull(stats.wonValue),
      color: "text-amber-400",
      icon: Trophy,
    },
    {
      key: "stl",
      label: "Speed-to-Lead",
      value: `${avgSTL} min`,
      subtitle: `${contactsWithSTL.length} contacts tracked`,
      color: "text-purple-400",
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">CRM</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contacts, pipeline, and relationship management
        </p>
      </div>

      {/* A. Stat Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.key}
            role="button"
            tabIndex={0}
            aria-expanded={expandedCard === stat.key}
            className={`glass border-border p-5 cursor-pointer transition-all duration-200 hover:bg-foreground/[0.03] ${
              expandedCard === stat.key
                ? "ring-1 ring-indigo-500/30 border-indigo-500/20"
                : ""
            }`}
            onClick={() =>
              setExpandedCard(expandedCard === stat.key ? null : stat.key)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setExpandedCard(expandedCard === stat.key ? null : stat.key);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className={`mt-1 text-xs ${stat.color}`}>{stat.subtitle}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-xl bg-foreground/5 p-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${
                    expandedCard === stat.key ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Expanded: Total Contacts */}
            {expandedCard === "contacts" && stat.key === "contacts" && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {contactTypeBreakdown.map((ct) => (
                  <div
                    key={ct.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ct.icon className={`h-3.5 w-3.5 ${ct.color}`} />
                      <span className="text-muted-foreground">{ct.label}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {ct.count}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Expanded: Pipeline Value */}
            {expandedCard === "pipeline" && stat.key === "pipeline" && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {stageValues.map((sv) => (
                  <div
                    key={sv.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className={`${sv.color}`}>{sv.shortLabel}</span>
                    <span className="font-medium text-foreground">
                      {formatCurrencyFull(sv.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Expanded: Won This Month */}
            {expandedCard === "won" && stat.key === "won" && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                {wonThisMonthDeals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No deals won this month yet.
                  </p>
                ) : (
                  wonThisMonthDeals.map((deal) => {
                    const contact = getContactById(deal.contactId);
                    return (
                      <div
                        key={deal.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground truncate max-w-[60%]">
                          {deal.name}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCurrencyFull(deal.value)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Expanded: Speed-to-Lead */}
            {expandedCard === "stl" && stat.key === "stl" && (
              <div className="mt-4 space-y-2 border-t border-border pt-4 max-h-48 overflow-y-auto">
                {contactsWithSTL
                  .sort((a, b) => a.speedToLead! - b.speedToLead!)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground truncate max-w-[60%]">
                        {c.name}
                      </span>
                      <span
                        className={`font-medium ${
                          c.speedToLead! <= 5
                            ? "text-emerald-400"
                            : c.speedToLead! <= 15
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {c.speedToLead} min
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* B. Mini Pipeline Bar */}
      <Card className="glass border-border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Pipeline</h2>
          <Link
            href="/crm/pipeline"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View full pipeline
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex h-8 w-full overflow-hidden rounded-lg">
          {stageCounts.map((stage) => {
            if (stage.count === 0) return null;
            const widthPercent = (stage.count / totalStageDeals) * 100;
            // Extract hex color from tailwind class for gradient
            const bgClass = stage.bgColor.replace("/20", "/60");
            return (
              <Link
                key={stage.key}
                href="/crm/pipeline"
                className={`${bgClass} flex items-center justify-center transition-all duration-200 hover:brightness-125 border-r border-background/20 last:border-r-0`}
                style={{ width: `${Math.max(widthPercent, 4)}%` }}
                title={`${stage.label}: ${stage.count} deal${stage.count !== 1 ? "s" : ""}`}
              >
                <span className="text-[10px] font-medium text-foreground/80 truncate px-1">
                  {stage.count}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {stageCounts
            .filter((s) => s.count > 0)
            .map((stage) => (
              <div key={stage.key} className="flex items-center gap-1.5">
                <div
                  className={`h-2 w-2 rounded-full ${stage.bgColor.replace(
                    "/20",
                    "/80"
                  )}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {stage.shortLabel} ({stage.count})
                </span>
              </div>
            ))}
        </div>
      </Card>

      {/* C + D + E grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* C. Recent Activities (2 cols) */}
        <Card className="glass border-border p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Activity
            </h2>
            <Link
              href="/crm/activities"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {recentActivities.map((act) => {
              const typeConfig = getActivityTypeConfig(act.type);
              const contact = getContactById(act.contactId);
              const TypeIcon = typeConfig.icon;
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-foreground/[0.03]"
                >
                  <div className="mt-0.5 rounded-lg bg-foreground/5 p-2">
                    <TypeIcon
                      className={`h-3.5 w-3.5 ${typeConfig.color}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {act.subject}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      {contact && (
                        <Link
                          href={`/crm/contacts/${contact.id}`}
                          className="hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.name}
                        </Link>
                      )}
                      {act.dealId && (
                        <>
                          <span className="text-border">·</span>
                          <Link
                            href={`/crm/deals/${act.dealId}`}
                            className="hover:text-foreground transition-colors truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {deals.find((d) => d.id === act.dealId)?.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {relativeTime(act.date)}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        act.agent === "ai"
                          ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {act.agent === "ai" ? (
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI
                        </span>
                      ) : (
                        "Manual"
                      )}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* D + E column */}
        <div className="space-y-6">
          {/* D. Quick Actions */}
          <Card className="glass border-border p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <Link
                href="/crm/contacts"
                className="flex items-center gap-3 rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-foreground/[0.05] hover:border-blue-500/30"
              >
                <UserPlus className="h-4 w-4 text-blue-400" />
                Add Contact
              </Link>
              <Link
                href="/crm/pipeline"
                className="flex items-center gap-3 rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-foreground/[0.05] hover:border-emerald-500/30"
              >
                <Plus className="h-4 w-4 text-emerald-400" />
                Create Deal
              </Link>
              <Link
                href="/crm/activities"
                className="flex items-center gap-3 rounded-lg border border-border bg-foreground/[0.02] px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-foreground/[0.05] hover:border-purple-500/30"
              >
                <Activity className="h-4 w-4 text-purple-400" />
                View Activities
              </Link>
            </div>
          </Card>

          {/* E. Referral Insights */}
          <Card className="glass border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-foreground">
                Referral Insights
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Contacts from referrals
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {referralContacts.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Revenue from referrals
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrencyFull(referralRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  % of total revenue
                </span>
                <Badge
                  variant="outline"
                  className="border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-xs"
                >
                  {referralRevenuePercent}%
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
