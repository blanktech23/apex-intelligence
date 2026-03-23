"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRole, roleConfigs, Role } from "@/lib/role-context";
import { usePersona, type Persona } from "@/lib/persona-context";
import { PERSONA_TEMPLATES } from "@/lib/persona-templates";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Shield,
  X,
  Check,
  RotateCcw,
  HardHat,
  Store,
  UserCheck,
  Factory,
} from "lucide-react";
import { resetChecklist } from "@/components/onboarding-checklist";
import { TourResetButton } from "@/components/tour/tour-reset-button";

// ---------------------------------------------------------------------------
// Persona config for the switcher UI
// ---------------------------------------------------------------------------

const PERSONA_CARDS: {
  id: Persona;
  label: string;
  icon: typeof HardHat;
}[] = [
  { id: "contractor", label: "Contractor", icon: HardHat },
  { id: "dealer", label: "Dealer", icon: Store },
  { id: "rep", label: "Sales Rep", icon: UserCheck },
  { id: "manufacturer", label: "Manufacturer", icon: Factory },
];

// ---------------------------------------------------------------------------
// Which roles are available per persona
// ---------------------------------------------------------------------------

const PERSONA_ROLES: Record<Persona, Role[]> = {
  contractor: ["owner", "admin", "manager", "designer", "bookkeeper", "viewer"],
  dealer: ["owner", "admin", "manager", "bookkeeper", "viewer"],
  rep: ["owner", "admin", "viewer"],
  manufacturer: ["owner", "admin", "manager", "bookkeeper", "viewer"],
};

// Short persona labels for the pill
const PERSONA_PILL_LABELS: Record<Persona, string> = {
  contractor: "Contractor",
  dealer: "Dealer",
  rep: "Sales Rep",
  manufacturer: "Manufacturer",
};

export function RoleSwitcher() {
  const { role, config, setRole } = useRole();
  const { persona, setPersona, resetPersona } = usePersona();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const availableRoles = PERSONA_ROLES[persona];

  const handlePersonaSwitch = (p: Persona) => {
    if (p === persona) return;
    setPersona(p);
    setRole("owner");
    resetChecklist();
    // Tour resets automatically via persona-scoped localStorage keys
    // Navigate to dashboard to avoid stale persona-specific routes
    router.push("/dashboard");
  };

  const handleResetAll = () => {
    resetPersona();
    setRole("owner");
    resetChecklist();
    // Tours will reset on persona change since keys are scoped
    router.push("/dashboard");
  };

  return (
    <div className="fixed bottom-[8.5rem] right-5 z-50 hidden flex-col items-end gap-3 lg:flex">
      {/* Expanded panel */}
      {expanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setExpanded(false)}
          />

          {/* Panel */}
          <div className="relative z-50 w-[min(400px,calc(100vw-2.5rem))] rounded-2xl border border-border bg-[var(--background)] p-5 shadow-2xl ring-1 ring-white/5 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Demo Mode
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Switch business type and team role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Business Type section ── */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Business Type
            </p>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {PERSONA_CARDS.map((pc) => {
                const isActive = pc.id === persona;
                const Icon = pc.icon;
                return (
                  <button
                    key={pc.id}
                    onClick={() => handlePersonaSwitch(pc.id)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                      isActive
                        ? "bg-primary/10 ring-2 ring-primary/40 shadow-[0_0_12px_rgba(var(--primary-rgb,99,102,241),0.15)]"
                        : "hover:bg-muted/80"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {pc.label}
                    </span>
                    {isActive && (
                      <Check className="ml-auto h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Team Role section ── */}
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Team Role
            </p>
            <div className="space-y-1.5">
              {availableRoles.map((r) => {
                const rc = roleConfigs[r];
                const isActive = r === role;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setExpanded(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                      isActive
                        ? "bg-primary/10 ring-2 ring-primary/40"
                        : "hover:bg-muted/80"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        rc.color.split(" ").slice(0, 2).join(" ")
                      )}
                    >
                      {rc.avatar}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {rc.name}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ring-1",
                            rc.color
                          )}
                        >
                          {rc.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-1">
                        {rc.description}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Footer ── */}
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              <div className="flex-1 rounded-lg bg-muted/60 px-3 py-2">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Switching business type resets tours, checklist, and role.
                </p>
              </div>
              <button
                onClick={handleResetAll}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Reset persona, role, tours, and checklist to defaults"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating pill button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-[var(--background)] px-3.5 py-2.5 shadow-lg transition-all duration-200 hover:shadow-xl",
          "hover:border-primary/40 hover:ring-1 hover:ring-primary/20"
        )}
      >
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
          {PERSONA_PILL_LABELS[persona]}
        </span>
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
            config.color.split(" ").slice(0, 2).join(" ")
          )}
        >
          {config.avatar}
        </div>
        <span className="text-xs font-semibold text-foreground">
          {config.label}
        </span>
        <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/20">
          DEMO
        </span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
