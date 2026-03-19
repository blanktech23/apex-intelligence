"use client";

import { useState } from "react";
import {
  Sparkles,
  Download,
  CreditCard,
  DollarSign,
  Zap,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Server,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Usage data                                                         */
/* ------------------------------------------------------------------ */

const usageBreakdown = [
  {
    label: "API Calls Today",
    icon: Server,
    used: 3420,
    limit: 5000,
    color: "bg-primary",
    textColor: "text-primary",
    format: (n: number) => `${(n / 1000).toFixed(1)}K`,
  },
  {
    label: "Active Agents",
    icon: Zap,
    used: 6,
    limit: 7,
    color: "bg-emerald-400",
    textColor: "text-emerald-400",
    format: (n: number) => `${n}`,
  },
  {
    label: "AI Spend This Month",
    icon: DollarSign,
    used: 127,
    limit: 200,
    color: "bg-cyan-400",
    textColor: "text-cyan-400",
    format: (n: number) => `$${n}`,
  },
  {
    label: "Team Seats",
    icon: Users,
    used: 8,
    limit: 15,
    color: "bg-amber-400",
    textColor: "text-amber-400",
    format: (n: number) => `${n}`,
  },
];

/* ------------------------------------------------------------------ */
/*  Plan features                                                      */
/* ------------------------------------------------------------------ */

const planFeatures = [
  "6 operational agents + Support Agent",
  "5,000 API calls / day",
  "Priority support",
  "All integrations",
  "Advanced analytics & reports",
  "~80% AI margin",
];

/* ------------------------------------------------------------------ */
/*  Billing history                                                    */
/* ------------------------------------------------------------------ */

const billingHistory = [
  {
    id: "INV-2026-003",
    date: "Mar 1, 2026",
    description: "Professional Plan - Monthly",
    amount: "$500.00",
    status: "paid" as const,
  },
  {
    id: "INV-2026-002",
    date: "Feb 1, 2026",
    description: "Professional Plan - Monthly",
    amount: "$500.00",
    status: "paid" as const,
  },
  {
    id: "INV-2026-001",
    date: "Jan 1, 2026",
    description: "Professional Plan - Monthly + Setup Fee",
    amount: "$10,500.00",
    status: "paid" as const,
  },
  {
    id: "INV-2025-012",
    date: "Dec 1, 2025",
    description: "Starter Plan - Monthly",
    amount: "$275.00",
    status: "paid" as const,
  },
  {
    id: "INV-2025-011",
    date: "Nov 1, 2025",
    description: "Starter Plan - Monthly",
    amount: "$275.00",
    status: "paid" as const,
  },
  {
    id: "INV-2025-010",
    date: "Oct 1, 2025",
    description: "Starter Plan - Monthly + Setup Fee",
    amount: "$5,275.00",
    status: "paid" as const,
  },
];

/* ------------------------------------------------------------------ */
/*  Plans for upgrade dialog                                           */
/* ------------------------------------------------------------------ */

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$275",
    setup: "$5,000",
    description: "Small contractors & solopreneurs",
    features: [
      "3 operational agents + Support Agent",
      "1,000 API calls / day",
      "Email support",
      "~85% AI margin",
    ],
    current: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$500",
    setup: "$10,000",
    description: "Mid-size remodelers & growing teams",
    features: [
      "6 operational agents + Support Agent",
      "5,000 API calls / day",
      "Priority support",
      "All integrations",
      "Advanced analytics & reports",
      "~80% AI margin",
    ],
    current: true,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$750",
    setup: "$20,000",
    description: "Large GCs & multi-location firms",
    features: [
      "6 operational agents + Support Agent + custom",
      "Unlimited API calls",
      "Dedicated account manager",
      "Usage above $200/mo AI cap billed at cost",
      "SSO & SAML",
      "SLA guarantee",
      "~75% AI margin",
    ],
    current: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BillingSettingsPage() {
  const { config } = useRole();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!config.canViewBilling) {
    return (
      <div className="glass rounded-xl px-5 py-12 text-center">
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have permission to view billing information.</p>
      </div>
    );
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setSelectedPlan(null);
      setUpgradeOpen(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Billing</h1>

      {/* ============================================================ */}
      {/*  Current plan card                                            */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-muted/30 to-transparent p-6 shadow-[0_0_40px_rgba(99,102,241,0.08)]">
        {/* Subtle glow orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Professional Plan
              </h2>
              <Badge className="border-0 bg-primary/20 text-primary">
                Active
              </Badge>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight text-foreground">
                $500
              </span>
              <span className="text-lg text-muted-foreground">/mo</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Next billing date:{" "}
              <span className="font-medium text-foreground">April 1, 2026</span>
            </p>

            {/* Feature bullets */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1">
              {planFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                  <span className="text-xs text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => setUpgradeOpen(true)}
            className="shrink-0 gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
          >
            <ArrowUpRight className="h-4 w-4" />
            Upgrade plan
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Usage breakdown                                              */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <h2 className="mb-5 text-base font-semibold text-foreground">
          Usage this month
        </h2>

        <div className="space-y-5">
          {usageBreakdown.map((item) => {
            const Icon = item.icon;
            const pct = Math.round((item.used / item.limit) * 100);
            const isHigh = pct >= 80;

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${item.textColor}`} />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.format(item.used)}{" "}
                      <span className="text-muted-foreground/60">
                        / {item.format(item.limit)}
                      </span>
                    </span>
                    <span
                      className={`min-w-[40px] text-right text-xs font-semibold ${
                        isHigh ? "text-amber-400" : item.textColor
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? "bg-amber-400" : item.color
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Payment method                                               */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Payment method
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Opening payment method settings...")}
            className="border-border text-xs"
          >
            Update
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-5 py-4">
          {/* Card brand visual */}
          <div className="flex h-10 w-14 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-800">
            <span className="text-xs font-bold tracking-wider text-white">
              VISA
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Visa ending in 4242
            </p>
            <p className="text-xs text-muted-foreground">Expires 12/2028</p>
          </div>
          <Badge className="border-0 bg-emerald-500/15 text-emerald-400">
            Default
          </Badge>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Billing history                                              */}
      {/* ============================================================ */}
      <div className="glass rounded-xl p-6">
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Billing history
        </h2>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Amount
                </TableHead>
                <TableHead className="text-xs text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs text-muted-foreground">
                  Invoice
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow
                  key={item.id}
                  className="border-border hover:bg-muted/30"
                >
                  <TableCell className="text-sm text-muted-foreground">
                    {item.date}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {item.amount}
                  </TableCell>
                  <TableCell>
                    <Badge className="border-0 bg-emerald-500/15 text-emerald-400">
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast.success(`Downloading ${item.id}.pdf`)}
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Upgrade plan dialog                                          */}
      {/* ============================================================ */}
      {upgradeOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => { setUpgradeOpen(false); setConfirmed(false); setSelectedPlan(null); }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-[var(--background)] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Choose a Plan</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Select the plan that best fits your team
                  </p>
                </div>
                <button
                  onClick={() => { setUpgradeOpen(false); setConfirmed(false); setSelectedPlan(null); }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Confirmed state */}
              {confirmed && selectedPlan && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 animate-in zoom-in duration-300">
                    <Check className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-foreground">
                    Switched to {plans.find((p) => p.id === selectedPlan)?.name} Plan
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your new plan is now active. Changes take effect immediately.
                  </p>
                </div>
              )}

              {/* Plan cards */}
              {!confirmed && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={cn(
                        "relative flex flex-col rounded-xl border p-5 transition-all duration-200",
                        plan.current
                          ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                          : "border-border hover:border-primary/30 hover:bg-muted/30"
                      )}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold text-white">
                          CURRENT
                        </span>
                      )}

                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>

                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {plan.setup} one-time setup fee
                      </p>

                      <div className="mt-5 flex-1 space-y-2.5">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                            <span className="text-xs text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => !plan.current && handleSelectPlan(plan.id)}
                        disabled={plan.current}
                        className={cn(
                          "mt-5 w-full text-sm font-semibold",
                          plan.current
                            ? "border border-border bg-muted/50 text-muted-foreground cursor-default"
                            : "bg-primary text-white hover:bg-primary/90"
                        )}
                      >
                        {plan.current ? "Current Plan" : plan.id === "enterprise" ? "Contact Sales" : "Switch Plan"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
