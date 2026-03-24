"use client"

import { useEffect, useRef, useMemo } from "react"

import type { ChatMessage } from "@/lib/chat-types"
import { MessageBubble } from "@/components/chat/message-bubble"
import { ChatComposer } from "@/components/chat/chat-composer"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MessageThreadProps {
  messages: ChatMessage[]
  channelName: string
  onThreadClick: (messageId: string) => void
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Date separator helpers
// ---------------------------------------------------------------------------

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (isToday) return "Today"

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()

  if (isYesterday) return "Yesterday"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// ---------------------------------------------------------------------------
// Group messages by day
// ---------------------------------------------------------------------------

interface MessageGroup {
  dateLabel: string
  messages: ChatMessage[]
}

function groupMessagesByDay(messages: ChatMessage[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  let currentKey = ""

  for (const msg of messages) {
    const key = getDateKey(msg.createdAt)
    if (key !== currentKey) {
      currentKey = key
      groups.push({
        dateLabel: formatDateSeparator(msg.createdAt),
        messages: [msg],
      })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }

  return groups
}

// ---------------------------------------------------------------------------
// MessageThread
// ---------------------------------------------------------------------------

export function MessageThread({
  messages,
  channelName,
  onThreadClick,
  disabled,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages.length])

  const groups = useMemo(() => groupMessagesByDay(messages), [messages])

  return (
    <div className="flex h-full flex-col">
      {/* Channel header */}
      <div className="flex h-12 shrink-0 items-center border-b border-border px-4">
        <span className="text-sm font-semibold text-foreground">
          #{channelName}
        </span>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        role="log"
        aria-live="polite"
        aria-label={`Messages in ${channelName}`}
      >
        {groups.map((group) => (
          <div key={group.dateLabel}>
            {/* Date separator */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
              <span className="relative z-10 bg-[var(--background)] px-3 text-xs font-medium text-muted-foreground">
                {group.dateLabel}
              </span>
            </div>

            {/* Messages in this day */}
            <div className="space-y-1">
              {group.messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender.id === "current-user"}
                  onThreadClick={
                    msg.replyCount > 0 ? () => onThreadClick(msg.id) : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Typing indicator (hardcoded Sarah for demo) */}
      <TypingIndicator name="Sarah Chen" />

      {/* Composer */}
      <div className="shrink-0 border-t border-border p-3">
        <ChatComposer
          channelName={channelName}
          disabled={disabled}
          placeholder={`Message #${channelName}`}
        />
      </div>
    </div>
  )
}
