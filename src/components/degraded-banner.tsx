"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const messages = [
  "Some features are temporarily unavailable. Your data is safe.",
  "Agent automation is temporarily paused. Manual operations available.",
  "AI features temporarily limited. We're working on it.",
];

export function DegradedBanner() {
  const [visible, setVisible] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  if (!visible) return null;

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 bg-amber-500/15 border-b border-amber-500/20 px-4 py-2.5">
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p
        className="cursor-pointer text-sm font-medium text-amber-700 dark:text-amber-300"
        onClick={() => setMessageIndex((i) => (i + 1) % messages.length)}
        title="Click to cycle messages (demo)"
      >
        {messages[messageIndex]}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded text-amber-600/70 dark:text-amber-400/70 transition-colors hover:text-amber-700 dark:hover:text-amber-300"
        title="Hide banner (demo only)"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
