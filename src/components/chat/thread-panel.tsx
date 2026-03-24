"use client"

import { useEffect, useCallback, useRef } from "react"
import { ArrowLeft, X } from "lucide-react"

import type { ChatMessage } from "@/lib/chat-types"
import { MessageBubble } from "@/components/chat/message-bubble"
import { ChatComposer } from "@/components/chat/chat-composer"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ThreadPanelProps {
  rootMessage: ChatMessage
  replies: ChatMessage[]
  onClose: () => void
  channelName: string
}

// ---------------------------------------------------------------------------
// ThreadPanel
// ---------------------------------------------------------------------------

export function ThreadPanel({
  rootMessage,
  replies,
  onClose,
  channelName,
}: ThreadPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Escape key closes the panel
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Scroll to bottom on mount
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [replies.length])

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-[var(--background)] shadow-lg",
          "lg:relative lg:inset-auto lg:z-auto lg:w-[380px] lg:shadow-none",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close thread"
          >
            <ArrowLeft className="size-4" />
          </button>

          <span className="flex-1 truncate text-sm font-semibold text-foreground">
            Thread in #{channelName}
          </span>

          <button
            onClick={onClose}
            className="hidden size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
            aria-label="Close thread"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
          {/* Root message */}
          <MessageBubble
            message={rootMessage}
            isOwn={rootMessage.sender.id === "current-user"}
          />

          {/* Reply count separator */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <span className="relative z-10 bg-[var(--background)] px-3 text-xs font-medium text-muted-foreground">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>

          {/* Replies */}
          <div className="space-y-1">
            {replies.map((reply) => (
              <MessageBubble
                key={reply.id}
                message={reply}
                isOwn={reply.sender.id === "current-user"}
              />
            ))}
          </div>
        </div>

        {/* Reply composer */}
        <div className="shrink-0 border-t border-border p-3">
          <ChatComposer
            channelName={channelName}
            placeholder="Reply..."
            variant="compact"
          />
        </div>
      </aside>
    </>
  )
}
