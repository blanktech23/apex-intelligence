"use client"

import { useState } from "react"
import {
  Search,
  Hash,
  ChevronDown,
  ChevronRight,
  Circle,
  Users,
} from "lucide-react"

import type { ChatChannel, ChannelType } from "@/lib/chat-types"
import { IntegrationBadge } from "@/components/chat/integration-badge"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChannelListProps {
  channels: ChatChannel[]
  activeChannelId: string | null
  onChannelSelect: (channelId: string) => void
}

// ---------------------------------------------------------------------------
// Section header with collapsible state
// ---------------------------------------------------------------------------

function SectionHeader({
  label,
  collapsed,
  onToggle,
}: {
  label: string
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-1 px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 transition-colors hover:text-muted-foreground"
    >
      {collapsed ? (
        <ChevronRight className="size-3" />
      ) : (
        <ChevronDown className="size-3" />
      )}
      <span>{label}</span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Individual channel row
// ---------------------------------------------------------------------------

function ChannelRow({
  channel,
  isActive,
  onSelect,
}: {
  channel: ChatChannel
  isActive: boolean
  onSelect: () => void
}) {
  const isDm = channel.type === "dm" || channel.type === "group_dm"
  const hasUnread = channel.unreadCount > 0

  // For DMs, find the "other" member to show online status
  const otherMember =
    isDm && channel.type === "dm"
      ? channel.members.find((m) => m.id !== "current-user")
      : null

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "bg-blue-500/10 font-semibold text-foreground"
          : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
        hasUnread && !isActive && "font-semibold text-foreground"
      )}
    >
      {/* Icon / online indicator */}
      {channel.type === "group_dm" ? (
        <Users className="size-4 shrink-0 text-muted-foreground" />
      ) : isDm && otherMember ? (
        <Circle
          className={cn(
            "size-2.5 shrink-0",
            otherMember.isOnline
              ? "fill-emerald-500 text-emerald-500"
              : "fill-zinc-400 text-zinc-600 dark:text-zinc-400 dark:fill-zinc-600 dark:text-zinc-600"
          )}
        />
      ) : (
        <Hash className="size-4 shrink-0 text-muted-foreground" />
      )}

      {/* Channel / DM name */}
      <span className="min-w-0 flex-1 truncate text-left">
        {isDm ? channel.displayName : channel.name}
      </span>

      {/* Platform badge for external DMs */}
      {isDm && otherMember && otherMember.platform !== "kiptra" && (
        <IntegrationBadge platform={otherMember.platform} size="sm" />
      )}

      {/* Unread badge */}
      {hasUnread && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500/20 px-1.5 text-[11px] font-semibold text-blue-500 dark:bg-blue-500/30 dark:text-blue-400">
          {channel.unreadCount}
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// ChannelList
// ---------------------------------------------------------------------------

export function ChannelList({
  channels,
  activeChannelId,
  onChannelSelect,
}: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({})

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Filter channels by search query
  const filtered = channels.filter((ch) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      ch.name.toLowerCase().includes(q) ||
      ch.displayName.toLowerCase().includes(q)
    )
  })

  // Group channels by type
  const groupChannels = (type: ChannelType) =>
    filtered.filter((ch) => ch.type === type)

  const projectChannels = groupChannels("project")
  const generalChannels = groupChannels("general")
  const dmChannels = groupChannels("dm")
  const groupDmChannels = groupChannels("group_dm")
  const allDms = [...dmChannels, ...groupDmChannels]

  const sections: { key: string; label: string; items: ChatChannel[] }[] = [
    { key: "projects", label: "Projects", items: projectChannels },
    { key: "channels", label: "Channels", items: generalChannels },
    { key: "dms", label: "Direct Messages", items: allDms },
  ]

  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-[var(--background)]">
      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-2.5 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {sections.map(
          (section) =>
            section.items.length > 0 && (
              <div key={section.key}>
                <SectionHeader
                  label={section.label}
                  collapsed={!!collapsedSections[section.key]}
                  onToggle={() => toggleSection(section.key)}
                />
                {!collapsedSections[section.key] && (
                  <div className="space-y-0.5">
                    {section.items.map((ch) => (
                      <ChannelRow
                        key={ch.id}
                        channel={ch}
                        isActive={activeChannelId === ch.id}
                        onSelect={() => onChannelSelect(ch.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
        )}

        {filtered.length === 0 && searchQuery && (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No channels matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  )
}
