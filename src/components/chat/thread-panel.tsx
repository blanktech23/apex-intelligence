"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import { ArrowLeft, X } from "lucide-react"

import type { ChatMessage, TextMessage } from "@/lib/chat-types"
import { MessageBubble } from "@/components/chat/message-bubble"
import { ChatComposer } from "@/components/chat/chat-composer"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mock responses for thread replies
// ---------------------------------------------------------------------------

const THREAD_RESPONSES = [
  "Got it, I'll take a look at that and get back to you.",
  "Thanks for the update. Let me check with the team.",
  "Makes sense. I'll update the project notes.",
  "Good catch — I'll revise the estimate accordingly.",
  "Let me pull up the specs on that. One moment.",
  "Noted. I've added this to our action items.",
  "I'll coordinate with the contractor on that.",
  "That's a good point. Let me think about it and circle back.",
]

let threadResponseIndex = 0
function getNextThreadResponse(): string {
  const response = THREAD_RESPONSES[threadResponseIndex % THREAD_RESPONSES.length]
  threadResponseIndex++
  return response
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ThreadPanelProps {
  rootMessage: ChatMessage
  initialReplies: ChatMessage[]
  onClose: () => void
  channelName: string
}

// ---------------------------------------------------------------------------
// ThreadPanel
// ---------------------------------------------------------------------------

export function ThreadPanel({
  rootMessage,
  initialReplies,
  onClose,
  channelName,
}: ThreadPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [replies, setReplies] = useState<ChatMessage[]>(initialReplies)
  const [isTyping, setIsTyping] = useState(false)

  // Sync when thread changes
  useEffect(() => {
    setReplies(initialReplies)
  }, [initialReplies])

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

  // Scroll to bottom on mount and when replies change
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [replies.length, isTyping])

  const handleReply = useCallback((text: string) => {
    const userReply: TextMessage = {
      id: `thread-user-${Date.now()}`,
      channelId: rootMessage.channelId,
      threadId: rootMessage.id,
      type: "text",
      content: text,
      sender: {
        id: "current-user",
        name: "Alex Rivera",
        initials: "AR",
        role: "owner",
        platform: "kiptra",
        isOnline: true,
      },
      source: "kiptra",
      createdAt: new Date().toISOString(),
      isEdited: false,
      reactions: [],
      readBy: ["current-user"],
      replyCount: 0,
      mentions: [],
      attachments: [],
    }

    setReplies((prev) => [...prev, userReply])
    setIsTyping(true)

    setTimeout(() => {
      const responseReply: TextMessage = {
        id: `thread-sarah-${Date.now()}`,
        channelId: rootMessage.channelId,
        threadId: rootMessage.id,
        type: "text",
        content: getNextThreadResponse(),
        sender: {
          id: "sarah-chen",
          name: "Sarah Chen",
          initials: "SC",
          role: "designer",
          platform: "slack",
          isOnline: true,
        },
        source: "slack",
        createdAt: new Date().toISOString(),
        isEdited: false,
        reactions: [],
        readBy: ["sarah-chen"],
        replyCount: 0,
        mentions: [],
        attachments: [],
      }

      setIsTyping(false)
      setReplies((prev) => [...prev, responseReply])
    }, 1500)
  }, [rootMessage.channelId, rootMessage.id])

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

          {/* Typing indicator in thread */}
          {isTyping && <TypingIndicator name="Sarah Chen" className="mt-2" />}
        </div>

        {/* Reply composer */}
        <div className="shrink-0 border-t border-border p-3">
          <ChatComposer
            channelName={channelName}
            placeholder="Reply..."
            variant="compact"
            onSend={handleReply}
          />
        </div>
      </aside>
    </>
  )
}
