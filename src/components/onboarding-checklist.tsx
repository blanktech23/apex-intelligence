"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, Role } from "@/lib/role-context";
import { usePersona, type Persona } from "@/lib/persona-context";
import { Confetti } from "@/components/confetti";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  completed: boolean;
}

interface ChecklistState {
  completedItems: string[];
  dismissed: boolean;
}

// ---------------------------------------------------------------------------
// Storage key scoped by persona
// ---------------------------------------------------------------------------

function storageKey(persona: Persona): string {
  return `onboardingChecklist_${persona}`;
}

const VISIBLE_ROLES: Set<Role> = new Set(["owner", "admin", "manager"]);

// All possible persona keys for reset
const ALL_PERSONAS: Persona[] = ["contractor", "dealer", "rep", "manufacturer"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadState(persona: Persona, items: ChecklistItem[]): ChecklistState {
  if (typeof window === "undefined") return { completedItems: [], dismissed: false };
  try {
    const raw = localStorage.getItem(storageKey(persona));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  // Default: pre-checked items start completed (endowed progress / Zeigarnik)
  return {
    completedItems: items.filter((i) => i.completed).map((i) => i.id),
    dismissed: false,
  };
}

function saveState(persona: Persona, state: ChecklistState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(persona), JSON.stringify(state));
  } catch {
    // ignore
  }
}

/** Reset to factory defaults — clears ALL persona-scoped keys */
export function resetChecklist() {
  for (const p of ALL_PERSONAS) {
    try {
      localStorage.removeItem(storageKey(p));
    } catch {
      // ignore
    }
  }
  // dispatch storage event so the component re-reads
  window.dispatchEvent(new Event("checklist-reset"));
}

// ---------------------------------------------------------------------------
// Progress Ring SVG
// ---------------------------------------------------------------------------

function ProgressRing({
  percent,
  size = 28,
  strokeWidth = 3,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-foreground/10"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function OnboardingChecklist({
  collapsed: sidebarCollapsed,
}: {
  collapsed: boolean;
}) {
  const router = useRouter();
  const { role } = useRole();
  const { persona, template } = usePersona();

  // Derive checklist items from persona template
  const templateItems: ChecklistItem[] = useMemo(
    () => template.checklistItems,
    [template]
  );

  // Start with a stable default to avoid hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<ChecklistState>({
    completedItems: templateItems.filter((i) => i.completed).map((i) => i.id),
    dismissed: false,
  });
  const [expanded, setExpanded] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  // Hydrate from localStorage after mount, and re-read when persona changes
  useEffect(() => {
    setState(loadState(persona, templateItems));
    setMounted(true);
  }, [persona, templateItems]);

  // Re-read state on reset event
  useEffect(() => {
    const handler = () => setState(loadState(persona, templateItems));
    const storageHandler = (e: StorageEvent) => {
      if (e.key === storageKey(persona)) setState(loadState(persona, templateItems));
    };
    window.addEventListener("checklist-reset", handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("checklist-reset", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, [persona, templateItems]);

  // Persist state changes (skip initial SSR default)
  useEffect(() => {
    if (mounted) {
      saveState(persona, state);
    }
  }, [state, persona, mounted]);

  // All template items are visible (role filtering removed — persona template is the source of truth)
  const visibleItems = templateItems;

  const completedCount = useMemo(
    () => visibleItems.filter((i) => state.completedItems.includes(i.id)).length,
    [visibleItems, state.completedItems]
  );

  const totalCount = visibleItems.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount && totalCount > 0;
  const canDismiss = completedCount >= Math.ceil(totalCount * 0.8); // 80%

  // Don't render for roles that shouldn't see the checklist
  if (!VISIBLE_ROLES.has(role)) return null;

  // If dismissed, show a small "Setup Guide" link
  if (state.dismissed) {
    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger className="w-full">
            <button
              onClick={() => setState((s) => ({ ...s, dismissed: false }))}
              className="flex w-full items-center justify-center rounded-lg px-0 py-2 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            Setup Guide
          </TooltipContent>
        </Tooltip>
      );
    }
    return (
      <button
        onClick={() => setState((s) => ({ ...s, dismissed: false }))}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Setup Guide</span>
      </button>
    );
  }

  // Toggle a checklist item
  const toggleItem = (id: string) => {
    setState((prev) => {
      const wasCompleted = prev.completedItems.includes(id);
      let next: string[];
      if (wasCompleted) {
        next = prev.completedItems.filter((x) => x !== id);
      } else {
        next = [...prev.completedItems, id];
        setJustCompleted(id);
        setTimeout(() => setJustCompleted(null), 600);
      }
      const newState = { ...prev, completedItems: next };

      // Check milestones
      const newCompleted = visibleItems.filter((i) => next.includes(i.id)).length;
      const newTotal = visibleItems.length;

      if (newCompleted === newTotal && newTotal > 0 && !wasCompleted) {
        // 100% completion
        setTimeout(() => {
          setConfettiTrigger(true);
          toast.success("You're all set! Your workspace is fully configured.", {
            duration: 4000,
          });
          setTimeout(() => setConfettiTrigger(false), 100);
        }, 300);
      } else if (
        newCompleted === Math.ceil(newTotal * (5 / 7)) &&
        !wasCompleted
      ) {
        // ~71% milestone (5/7)
        toast("Almost there! Just a few more steps.", {
          duration: 3000,
        });
      }

      return newState;
    });
  };

  const handleItemClick = (item: ChecklistItem) => {
    if (!state.completedItems.includes(item.id)) {
      router.push(item.href);
    }
  };

  // -- Collapsed sidebar: progress ring only --
  if (sidebarCollapsed) {
    return (
      <>
        <Confetti trigger={confettiTrigger} />
        <Tooltip>
          <TooltipTrigger className="w-full">
            <button
              onClick={() => setExpanded(!expanded)}
              className="relative flex w-full items-center justify-center rounded-lg px-0 py-2 text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              <ProgressRing percent={percent} size={24} strokeWidth={2.5} />
              {allComplete && (
                <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3 text-primary" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12}>
            <span>
              {percent}% Setup Complete ({completedCount}/{totalCount})
            </span>
          </TooltipContent>
        </Tooltip>
      </>
    );
  }

  // -- Expanded sidebar --
  return (
    <>
      <Confetti trigger={confettiTrigger} />
      <div className="rounded-lg border border-border bg-foreground/[0.02]">
        {/* Header / collapsed pill */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-foreground/[0.04]"
        >
          <ProgressRing percent={percent} />
          <div className="flex flex-1 flex-col text-left">
            <span className="text-xs font-semibold text-foreground">
              {allComplete ? "Setup Complete!" : "Setup Guide"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {percent}% &middot; {completedCount} of {totalCount}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>

        {/* Expanded checklist */}
        {expanded && (
          <div className="border-t border-border px-2 pb-2 pt-1">
            {/* Progress bar */}
            <div className="mx-1 mb-2 mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Items */}
            <div className="space-y-0.5">
              {visibleItems.map((item) => {
                const isCompleted = state.completedItems.includes(item.id);
                const isJustCompleted = justCompleted === item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-150",
                      !isCompleted && "cursor-pointer hover:bg-foreground/[0.04]",
                      isJustCompleted && "bg-primary/10"
                    )}
                  >
                    {/* Checkbox -- 48x48 touch target via padding */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item.id);
                      }}
                      className="flex h-[48px] w-[48px] -m-3 items-center justify-center shrink-0"
                      aria-label={
                        isCompleted
                          ? `Uncheck: ${item.label}`
                          : `Complete: ${item.label}`
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4 text-primary transition-transform",
                            isJustCompleted && "scale-125"
                          )}
                        />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      )}
                    </button>

                    {/* Label -- clicking navigates if incomplete */}
                    <button
                      onClick={() => handleItemClick(item)}
                      disabled={isCompleted}
                      className={cn(
                        "flex-1 text-left text-xs transition-colors",
                        isCompleted
                          ? "text-muted-foreground line-through"
                          : "text-foreground group-hover:text-primary"
                      )}
                    >
                      {item.label}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Dismiss button -- appears at 80%+ */}
            {canDismiss && (
              <button
                onClick={() => setState((s) => ({ ...s, dismissed: true }))}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
              >
                <X className="h-3 w-3" />
                <span>Dismiss</span>
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
