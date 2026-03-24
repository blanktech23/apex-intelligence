"use client"

import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
  name: string
  className?: string
}

export function TypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 text-xs text-muted-foreground",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-0.5">
        <span
          className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-[typing-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-[typing-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-[typing-bounce_1.4s_ease-in-out_infinite]"
          style={{ animationDelay: "400ms" }}
        />
      </span>
      <span>{name} is typing...</span>
    </div>
  )
}
