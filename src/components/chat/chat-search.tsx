"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Hash, X } from "lucide-react"

import type { ChatChannel } from "@/lib/chat-types"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChatSearchProps {
  isOpen: boolean
  onClose: () => void
  channels: ChatChannel[]
}

// ---------------------------------------------------------------------------
// Mock search results
// ---------------------------------------------------------------------------

interface SearchResult {
  id: string
  channelName: string
  senderName: string
  preview: string
  timestamp: string
}

const MOCK_RESULTS: SearchResult[] = [
  {
    id: "sr-1",
    channelName: "proj-smith-kitchen",
    senderName: "Sarah Chen",
    preview:
      "The cabinet specs have been updated. Please review the new dimensions before we submit to the manufacturer...",
    timestamp: "Mar 22",
  },
  {
    id: "sr-2",
    channelName: "general",
    senderName: "Mike Thompson",
    preview:
      "Team meeting moved to Thursday at 2pm. We'll discuss the Johnson bathroom project timeline.",
    timestamp: "Mar 21",
  },
  {
    id: "sr-3",
    channelName: "proj-garcia-remodel",
    senderName: "Lisa Johnson",
    preview:
      "The homeowner approved the countertop sample. Going with Caesarstone Calacatta Nuvo for the island.",
    timestamp: "Mar 20",
  },
  {
    id: "sr-4",
    channelName: "submittals",
    senderName: "Sarah Chen",
    preview:
      "Submittal #SUB-0042 has been approved by the designer. Ready for ordering.",
    timestamp: "Mar 19",
  },
]

// ---------------------------------------------------------------------------
// ChatSearch
// ---------------------------------------------------------------------------

export function ChatSearch({ isOpen, onClose, channels }: ChatSearchProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the animation start
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
    // Reset query on close
    setQuery("")
  }, [isOpen])

  // Escape closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    },
    [isOpen, onClose]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  // Filter mock results by query
  const results = query.trim()
    ? MOCK_RESULTS.filter(
        (r) =>
          r.preview.toLowerCase().includes(query.toLowerCase()) ||
          r.senderName.toLowerCase().includes(query.toLowerCase()) ||
          r.channelName.toLowerCase().includes(query.toLowerCase())
      )
    : []

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 supports-backdrop-filter:backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-lg animate-in fade-in zoom-in-95 duration-150 sm:inset-x-auto sm:w-full">
        <div className="overflow-hidden rounded-xl border border-border bg-[var(--background)] shadow-2xl ring-1 ring-foreground/10">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search messages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close search"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Results or empty state */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query.trim() && results.length > 0 ? (
              <ul className="divide-y divide-border">
                {results.map((result) => (
                  <li key={result.id}>
                    <button
                      onClick={onClose}
                      className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                    >
                      {/* Channel + timestamp */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <Hash className="size-3" />
                          {result.channelName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {result.timestamp}
                        </span>
                      </div>

                      {/* Sender */}
                      <span className="text-xs font-semibold text-foreground">
                        {result.senderName}
                      </span>

                      {/* Preview */}
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {result.preview}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.trim() && results.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Search across all channels and direct messages
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
