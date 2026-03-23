"use client";

import { Sparkles, ExternalLink } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-bold tracking-tight text-foreground">
              KIPTRA
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Intelligence
            </span>
          </div>
        </div>

        {/* Content */}
        <h1 className="mb-3 text-2xl font-bold text-foreground">
          Scheduled Maintenance
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          We&apos;re performing scheduled maintenance to improve your
          experience. We&apos;ll be back shortly.
        </p>

        {/* ETA */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-5 py-2.5">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
          <span className="text-sm font-medium text-foreground">
            Expected back by 6:00 PM EST
          </span>
        </div>

        {/* Status link */}
        <div>
          <button
            onClick={() => {
              window.alert("Status page is not yet configured. Check back later.");
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View status page
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
