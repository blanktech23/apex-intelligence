"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Clock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type InviteState = "pending" | "loading" | "accepted";

export default function InviteAcceptPage() {
  const router = useRouter();
  const [state, setState] = useState<InviteState>("pending");

  useEffect(() => {
    if (state === "loading") {
      const timer = setTimeout(() => setState("accepted"), 1800);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (state === "accepted") {
      const timer = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

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

      <div className="glass glow-primary relative z-10 w-full max-w-md rounded-2xl p-8">
        {/* Company logo placeholder */}
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/40">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            Slate Design Remodel
          </span>
        </div>

        {state === "accepted" ? (
          /* Success state */
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
              <svg
                className="h-7 w-7 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                  className="animate-[draw_0.4s_ease-out_forwards]"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: 30,
                    animation: "draw 0.4s ease-out forwards",
                  }}
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Invitation Accepted
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecting you to Slate Design Remodel...
              </p>
            </div>
            <div className="flex gap-1.5 pt-2">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        ) : (
          /* Pending / Loading state */
          <>
            {/* Heading */}
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold text-foreground">
                You&apos;ve been invited
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Sarah Chen</span>{" "}
                invited you to join{" "}
                <span className="font-medium text-foreground">
                  Slate Design Remodel
                </span>{" "}
                as a{" "}
                <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  Manager
                </span>
              </p>
            </div>

            {/* Role info */}
            <div className="mb-6 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                As a Manager, you&apos;ll be able to:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Approve agent drafts within your scope
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Manage escalation queue
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  View project status and activity
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Coordinate team tasks
                </li>
              </ul>
            </div>

            {/* Accept button */}
            <Button
              onClick={() => setState("loading")}
              disabled={state === "loading"}
              className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(99,102,241,0.3)]"
            >
              {state === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>

            {/* Expiry notice */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70">
              <Clock className="h-3.5 w-3.5" />
              <span>This invitation expires in 71 hours</span>
            </div>

            {/* Back to login */}
            <div className="mt-5 text-center">
              <a
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </a>
            </div>
          </>
        )}
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
