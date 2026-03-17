"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function InviteSuccessPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background bg-mesh px-4">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Mesh overlay orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="glass glow-primary relative z-10 w-full max-w-md rounded-2xl p-8 text-center">
        {/* Company logo placeholder */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>

        {/* Green checkmark animation */}
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 ring-4 ring-green-500/10">
          <svg
            className="h-10 w-10 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: 30,
                animation: "draw 0.5s ease-out 0.3s forwards",
              }}
            />
          </svg>
        </div>

        {/* Success message */}
        <h1 className="text-xl font-semibold text-foreground">
          You&apos;ve joined Slate Design Remodel
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          as a{" "}
          <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            Manager
          </span>
        </p>

        {/* Role description */}
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-border bg-muted/20 p-4 text-left">
          <p className="text-xs font-medium text-foreground">
            What you can do as a Manager:
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Approve agent drafts, manage escalations, view project status, and
            coordinate team tasks.
          </p>
        </div>

        {/* Go to Dashboard button */}
        <div className="mt-8">
          <a href="/dashboard">
            <Button className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]">
              Go to Dashboard
            </Button>
          </a>
        </div>
      </div>

      <style jsx global>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
