"use client"

import {
  CheckCheck,
  LogIn,
  LogOut,
  MessageCircle,
  Milestone,
  FileCheck,
  FileX,
  FilePlus,
  ClipboardEdit,
  Truck,
  Receipt,
  Hash,
  Bell,
} from "lucide-react"

import type { ChatMessage, SystemMessage } from "@/lib/chat-types"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { IntegrationBadge } from "@/components/chat/integration-badge"
import { AttachmentPreview } from "@/components/chat/attachment-preview"

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  onThreadClick?: (messageId: string) => void
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return dateStr
  }
}

function highlightMentions(content: string): React.ReactNode[] {
  const parts = content.split(/(@\w+)/g)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span
          key={i}
          className="rounded-sm bg-amber-500/20 px-0.5 font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
        >
          {part}
        </span>
      )
    }
    return part
  })
}

const systemActionIcons: Record<SystemMessage["systemAction"], typeof Bell> = {
  member_joined: LogIn,
  member_left: LogOut,
  channel_created: Hash,
  topic_changed: Bell,
  milestone_complete: Milestone,
  submittal_created: FilePlus,
  submittal_approved: FileCheck,
  submittal_rejected: FileX,
  change_order_created: ClipboardEdit,
  change_order_approved: FileCheck,
  delivery_scheduled: Truck,
  estimate_attached: Receipt,
}

function SystemMessageBubble({ message }: { message: SystemMessage }) {
  const Icon = systemActionIcons[message.systemAction] ?? Bell

  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground dark:bg-muted/40">
        <Icon className="size-3.5" />
        <span>{message.content}</span>
      </div>
    </div>
  )
}

export function MessageBubble({
  message,
  isOwn,
  onThreadClick,
}: MessageBubbleProps) {
  if (message.type === "system") {
    return <SystemMessageBubble message={message} />
  }

  const hasAttachments =
    "attachments" in message && message.attachments.length > 0
  const hasReactions = message.reactions.length > 0

  return (
    <div
      className={cn(
        "group flex gap-2.5 px-4 py-1 hover:bg-muted/30 dark:hover:bg-muted/20",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (only for others) */}
      {!isOwn && (
        <Avatar size="sm" className="mt-0.5 shrink-0">
          <AvatarFallback>{message.sender.initials}</AvatarFallback>
        </Avatar>
      )}

      {/* Content */}
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-0.5",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name + integration badge */}
        {!isOwn && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              {message.sender.name}
            </span>
            <IntegrationBadge platform={message.source} size="sm" />
            <span className="text-xs text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed",
            isOwn
              ? "rounded-br-md bg-primary/10 text-foreground dark:bg-primary/15"
              : "rounded-bl-md bg-zinc-100 text-foreground dark:bg-zinc-800"
          )}
        >
          <p className="whitespace-pre-wrap break-words">
            {highlightMentions(message.content)}
          </p>

          {message.isEdited && (
            <span className="ml-1 text-[10px] text-muted-foreground">
              (edited)
            </span>
          )}
        </div>

        {/* Attachments */}
        {hasAttachments && (
          <div className="mt-1 flex flex-col gap-1.5">
            {message.attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Reactions */}
        {hasReactions && (
          <div className="mt-1 flex flex-wrap gap-1">
            {message.reactions.map((reaction, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-xs dark:border-border/30 dark:bg-muted/30"
                title={reaction.users.join(", ")}
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </span>
            ))}
          </div>
        )}

        {/* Thread link */}
        {message.replyCount > 0 && (
          <button
            onClick={() => onThreadClick?.(message.id)}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <MessageCircle className="size-3" />
            <span>
              {message.replyCount}{" "}
              {message.replyCount === 1 ? "reply" : "replies"}
            </span>
          </button>
        )}

        {/* Read receipts (own messages) */}
        {isOwn && message.readBy.length > 0 && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
            <CheckCheck className="size-3" />
            <span>Read by {message.readBy.join(", ")}</span>
          </div>
        )}

        {/* Timestamp for own messages */}
        {isOwn && (
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        )}
      </div>
    </div>
  )
}
