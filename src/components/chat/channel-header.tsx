"use client"

import { Hash, Pin, Search, Settings, Users } from "lucide-react"
import { toast } from "sonner"

import type { ChatChannel } from "@/lib/chat-types"
import { cn } from "@/lib/utils"

interface ChannelHeaderProps {
  channel: ChatChannel
  className?: string
}

export function ChannelHeader({ channel, className }: ChannelHeaderProps) {
  const isDm = channel.type === "dm" || channel.type === "group_dm"
  const hasSlack = !!channel.slackChannelId
  const hasTeams = !!channel.teamsChannelId

  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border/50 px-4 py-2.5 dark:border-border/30",
        className
      )}
    >
      {/* Left side */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* Channel name */}
        <div className="flex items-center gap-1.5">
          {!isDm && <Hash className="size-4 text-muted-foreground" />}
          <h2 className="text-sm font-semibold text-foreground">
            {channel.displayName}
          </h2>
        </div>

        {/* Member count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="size-3.5" />
          <span>{channel.members.length}</span>
        </div>

        {/* Integration status */}
        {hasSlack && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#4A154B]/10 px-2 py-0.5 text-xs font-medium text-[#4A154B] dark:bg-[#4A154B]/20 dark:text-[#E8A0BF]">
            🔗 Slack Connected
          </span>
        )}
        {hasTeams && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6264A7]/10 px-2 py-0.5 text-xs font-medium text-[#6264A7] dark:bg-[#6264A7]/20 dark:text-[#A4A6D8]">
            🔗 Teams Connected
          </span>
        )}

        {/* Topic */}
        {channel.topic && (
          <>
            <span className="text-border">|</span>
            <p className="truncate text-xs text-muted-foreground">
              {channel.topic}
            </p>
          </>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => toast("Search coming soon")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
          aria-label="Search messages"
        >
          <Search className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => toast("Pinned messages coming soon")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
          aria-label="Pinned messages"
        >
          <Pin className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => toast("Channel settings coming soon")}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
          aria-label="Channel settings"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  )
}
