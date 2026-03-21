"use client";

import { useState } from "react";
import { useRole, roleConfigs, Role } from "@/lib/role-context";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Shield, X, Check } from "lucide-react";

const roles: Role[] = ["owner", "admin", "manager", "designer", "bookkeeper", "viewer"];

export function RoleSwitcher() {
  const { role, config, setRole } = useRole();
  const [expanded, setExpanded] = useState(false);

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
                    Demo Mode — Role Switcher
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Preview the app as different team members
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

            {/* Role cards */}
            <div className="space-y-2">
              {roles.map((r) => {
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
                      "flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all duration-150",
                      isActive
                        ? "bg-primary/10 ring-2 ring-primary/40"
                        : "hover:bg-muted/80"
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        rc.color.split(" ").slice(0, 2).join(" ")
                      )}
                    >
                      {rc.avatar}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-foreground">
                          {rc.name}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1",
                            rc.color
                          )}
                        >
                          {rc.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {rc.description}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 rounded-lg bg-muted/60 px-4 py-2.5">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Navigation, visible agents, and permissions change with each
                role. This switcher is only visible in demo mode.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Floating pill button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2.5 rounded-full border border-border bg-[var(--background)] px-4 py-2.5 shadow-lg transition-all duration-200 hover:shadow-xl",
          "hover:border-primary/40 hover:ring-1 hover:ring-primary/20"
        )}
      >
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
            config.color.split(" ").slice(0, 2).join(" ")
          )}
        >
          {config.avatar}
        </div>
        <span className="text-sm font-semibold text-foreground">
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
