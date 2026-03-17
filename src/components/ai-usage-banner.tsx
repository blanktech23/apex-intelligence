"use client";

import Link from "next/link";
import { AlertTriangle, XCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  AI Usage Banner                                                    */
/*  Shows a top banner when AI spend approaches or reaches the limit.  */
/*  - >= 80%: Amber warning banner                                     */
/*  - >= 100%: Red critical banner                                     */
/*  - < 80%: Nothing rendered                                          */
/* ------------------------------------------------------------------ */

interface AiUsageBannerProps {
  /** Current AI usage percentage (0-100+). */
  percent: number;
}

export function AiUsageBanner({ percent }: AiUsageBannerProps) {
  if (percent >= 100) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm">
        <XCircle className="h-4 w-4 shrink-0 text-red-400" />
        <span className="text-red-300">
          AI usage limit reached. Agent execution paused.
        </span>
        <Link
          href="/settings/billing/usage"
          className="ml-1 font-medium text-red-400 underline underline-offset-2 transition-colors hover:text-red-300"
        >
          Upgrade plan
        </Link>
      </div>
    );
  }

  if (percent >= 80) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
        <span className="text-amber-300">
          Approaching AI usage limit &mdash; {percent}% of monthly budget used
        </span>
        <Link
          href="/settings/billing"
          className="ml-1 font-medium text-amber-400 underline underline-offset-2 transition-colors hover:text-amber-300"
        >
          View usage
        </Link>
      </div>
    );
  }

  return null;
}
