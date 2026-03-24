"use client"

import { useState } from "react"
import { Hash, Pin, Search, Settings, Users, X } from "lucide-react"
import { toast } from "sonner"

import type { ChatChannel } from "@/lib/chat-types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChannelHeaderProps {
  channel: ChatChannel
  className?: string
  onSearchClick?: () => void
}

// Mock pinned messages
const INITIAL_PINNED = [
  {
    id: "pin-1",
    author: "Sarah Chen",
    preview: "Cabinet specs updated - review before submitting",
    date: "Mar 22",
  },
  {
    id: "pin-2",
    author: "Mike Thompson",
    preview: "Meeting moved to Thursday 2pm",
    date: "Mar 20",
  },
  {
    id: "pin-3",
    author: "Lisa Johnson",
    preview: "Final countertop material selections attached",
    date: "Mar 18",
  },
]

export function ChannelHeader({ channel, className, onSearchClick }: ChannelHeaderProps) {
  const isDm = channel.type === "dm" || channel.type === "group_dm"
  const hasSlack = !!channel.slackChannelId
  const hasTeams = !!channel.teamsChannelId

  const [showPinned, setShowPinned] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState(INITIAL_PINNED)
  const [showSettings, setShowSettings] = useState(false)
  const [channelNameInput, setChannelNameInput] = useState(channel.displayName)
  const [channelTopicInput, setChannelTopicInput] = useState(channel.topic ?? "")
  const [notificationPref, setNotificationPref] = useState<string>("all")

  return (
    <div className={cn("relative", className)}>
      <div
        className="flex items-center justify-between border-b border-border/50 px-4 py-2.5 dark:border-border/30"
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
              Slack Connected
            </span>
          )}
          {hasTeams && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#6264A7]/10 px-2 py-0.5 text-xs font-medium text-[#6264A7] dark:bg-[#6264A7]/20 dark:text-[#A4A6D8]">
              Teams Connected
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
            onClick={() => onSearchClick?.()}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
            aria-label="Search messages"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowPinned((prev) => !prev)}
            className={cn(
              "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
              showPinned && "bg-muted text-foreground"
            )}
            aria-label="Pinned messages"
          >
            <Pin className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setChannelNameInput(channel.displayName)
              setChannelTopicInput(channel.topic ?? "")
              setShowSettings(true)
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
            aria-label="Channel settings"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      {/* Pinned messages panel */}
      {showPinned && (
        <div className="border-b border-border/50 bg-muted/30 px-4 py-3 dark:border-border/30 dark:bg-muted/10">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pinned Messages ({pinnedMessages.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowPinned(false)}
              className="rounded-md p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
          {pinnedMessages.length === 0 ? (
            <p className="text-xs text-muted-foreground">No pinned messages in this channel.</p>
          ) : (
            <div className="space-y-2">
              {pinnedMessages.map((pin) => (
                <div
                  key={pin.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-background/60 px-3 py-2 dark:border-border/20 dark:bg-background/30"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{pin.author}</span>
                      <span className="text-xs text-muted-foreground">{pin.date}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{pin.preview}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPinnedMessages((prev) => prev.filter((p) => p.id !== pin.id))
                      toast.success("Message unpinned")
                    }}
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    Unpin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Channel settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Channel Settings</DialogTitle>
            <DialogDescription>
              Manage settings for #{channel.displayName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Channel name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Channel Name</label>
              <Input
                value={channelNameInput}
                onChange={(e) => setChannelNameInput(e.target.value)}
              />
            </div>

            {/* Channel topic */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Topic</label>
              <textarea
                value={channelTopicInput}
                onChange={(e) => setChannelTopicInput(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="Add a topic..."
              />
            </div>

            {/* Notification preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Notifications</label>
              <Select value={notificationPref} onValueChange={(v) => { if (v) setNotificationPref(v) }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All messages</SelectItem>
                  <SelectItem value="mentions">Mentions only</SelectItem>
                  <SelectItem value="nothing">Nothing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Members */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Members ({channel.members.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {channel.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/40 px-2 py-1 dark:border-border/20"
                  >
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                      {member.initials}
                    </div>
                    <span className="text-xs text-foreground">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast.success("Left channel")
                setShowSettings(false)
              }}
            >
              Leave Channel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast.success("Channel settings updated")
                setShowSettings(false)
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
