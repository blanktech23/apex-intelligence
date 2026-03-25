"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"

import type { ChatMessage, TextMessage } from "@/lib/chat-types"
import { MessageBubble } from "@/components/chat/message-bubble"
import { ChatComposer } from "@/components/chat/chat-composer"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mock responses from Sarah Chen
// ---------------------------------------------------------------------------

const MOCK_RESPONSES = [
  "Got it, I'll take a look at that and get back to you.",
  "Thanks for the update. Let me check with the team.",
  "Makes sense. I'll update the project notes.",
  "Good catch — I'll revise the estimate accordingly.",
  "Let me pull up the specs on that. One moment.",
  "Noted. I've added this to our action items.",
  "I'll coordinate with the contractor on that.",
  "That's a good point. Let me think about it and circle back.",
]

let responseIndex = 0
function getNextResponse(): string {
  const response = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length]
  responseIndex++
  return response
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MessageThreadProps {
  initialMessages: ChatMessage[]
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
  initialMessages,
  channelName,
  onThreadClick,
  disabled,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isTyping, setIsTyping] = useState(false)

  // Sync when channel changes (initialMessages changes)
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages.length, isTyping])

  const handleSend = useCallback((text: string) => {
    const userMessage: TextMessage = {
      id: `user-${Date.now()}`,
      channelId: "",
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

    setMessages((prev) => [...prev, userMessage])
    setIsTyping(true)

    // Simulate Sarah responding after 1.5s
    setTimeout(() => {
      const responseMessage: TextMessage = {
        id: `sarah-${Date.now()}`,
        channelId: "",
        type: "text",
        content: getNextResponse(),
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
      setMessages((prev) => [...prev, responseMessage])
    }, 1500)
  }, [])

  const groups = useMemo(() => groupMessagesByDay(messages), [messages])

  return (
    <div className="flex h-full flex-col">
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

      {/* Typing indicator — only shown when Sarah is "typing" */}
      {isTyping && <TypingIndicator name="Sarah Chen" />}

      {/* Composer */}
      <div className="shrink-0 border-t border-border p-3">
        <ChatComposer
          channelName={channelName}
          disabled={disabled}
          placeholder={`Message #${channelName}`}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
