"use client"

import * as React from "react"
import { AtSign, Check, File, Paperclip, SendHorizonal, Smile, Upload } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Mock files for attachment picker
const MOCK_FILES = [
  { id: "f1", name: "smith-kitchen-specs.pdf", size: "2.4 MB", date: "Mar 22" },
  { id: "f2", name: "cabinet-measurements.xlsx", size: "156 KB", date: "Mar 21" },
  { id: "f3", name: "countertop-sample.jpg", size: "3.1 MB", date: "Mar 20" },
  { id: "f4", name: "bathroom-layout-v2.dwg", size: "1.8 MB", date: "Mar 18" },
]

// Mock team members for @ mention
const MOCK_MEMBERS = [
  { id: "m1", name: "Sarah Chen", role: "Designer", initials: "SC" },
  { id: "m2", name: "Mike Thompson", role: "Contractor", initials: "MT" },
  { id: "m3", name: "Lisa Johnson", role: "Project Manager", initials: "LJ" },
  { id: "m4", name: "David Kim", role: "Homeowner", initials: "DK" },
  { id: "m5", name: "Rachel Torres", role: "Sales Rep", initials: "RT" },
]

// Common emojis grid
const EMOJI_GRID = [
  "\u{1F44D}", "\u2764\uFE0F", "\u{1F602}", "\u{1F389}", "\u{1F525}", "\u{1F440}",
  "\u2705", "\u274C", "\u{1F4AF}", "\u{1F64C}", "\u{1F60A}", "\u{1F44F}",
  "\u{1F680}", "\u{1F4AA}", "\u2B50", "\u{1F91D}", "\u{1F60D}", "\u{1F3AF}",
  "\u{1F4A1}", "\u26A1", "\u{1F3E0}", "\u{1F528}", "\u{1F4D0}", "\u{1F4CB}",
  "\u{1F6C1}", "\u{1FAB5}", "\u{1F48E}", "\u{1F3A8}", "\u{1F4E6}", "\u{1F527}",
]

interface ChatComposerProps {
  channelName: string
  disabled?: boolean
  onSend?: (message: string) => void
  className?: string
  placeholder?: string
  variant?: "default" | "compact"
}

export function ChatComposer({
  channelName,
  disabled = false,
  onSend,
  className,
  placeholder,
  variant = "default",
}: ChatComposerProps) {
  const [value, setValue] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Attachment dialog state
  const [showAttach, setShowAttach] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<Set<string>>(new Set())

  // Mention popover state
  const [showMentions, setShowMentions] = React.useState(false)
  const [mentionSearch, setMentionSearch] = React.useState("")
  const mentionRef = React.useRef<HTMLDivElement>(null)

  // Emoji popover state
  const [showEmoji, setShowEmoji] = React.useState(false)
  const emojiRef = React.useRef<HTMLDivElement>(null)

  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const maxHeight = 5 * 24 // ~5 rows
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [])

  React.useEffect(() => {
    adjustHeight()
  }, [value, adjustHeight])

  // Close popovers on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mentionRef.current && !mentionRef.current.contains(e.target as Node)) {
        setShowMentions(false)
      }
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSend = React.useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend?.(trimmed)
    setValue("")
  }, [value, disabled, onSend])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const filteredMembers = MOCK_MEMBERS.filter((m) =>
    m.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  if (disabled) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border-t border-border/50 px-4 py-3 dark:border-border/30",
          className
        )}
      >
        <span className="text-sm text-muted-foreground">
          Read-only — you cannot send messages in this channel
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "border-t border-border/50 px-4 py-2 dark:border-border/30",
        className
      )}
    >
      <div className="relative flex items-end gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 transition-colors focus-within:border-border focus-within:bg-background dark:border-border/30 dark:bg-muted/20 dark:focus-within:border-border/60">
        {/* Attach button */}
        <button
          type="button"
          onClick={() => {
            setSelectedFiles(new Set())
            setShowAttach(true)
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
          aria-label="Attach file"
        >
          <Paperclip className="size-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? `Message #${channelName}...`}
          rows={1}
          className="max-h-[120px] min-h-[24px] flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />

        {/* Right toolbar */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* @ Mention button + popover */}
          <div ref={mentionRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMentions((prev) => !prev)
                setShowEmoji(false)
                setMentionSearch("")
              }}
              className={cn(
                "rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
                showMentions && "bg-muted text-foreground"
              )}
              aria-label="Mention someone"
            >
              <AtSign className="size-4" />
            </button>

            {showMentions && (
              <div className="absolute bottom-full right-0 z-50 mb-2 w-64 rounded-lg border border-border/50 bg-popover shadow-lg dark:border-border/30">
                <div className="border-b border-border/30 p-2">
                  <Input
                    value={mentionSearch}
                    onChange={(e) => setMentionSearch(e.target.value)}
                    placeholder="Search members..."
                    className="h-7 text-xs"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredMembers.length === 0 ? (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">No members found</p>
                  ) : (
                    filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setValue((prev) => prev + `@${member.name} `)
                          setShowMentions(false)
                          toast.success(`@${member.name} mentioned`)
                          textareaRef.current?.focus()
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                          {member.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">{member.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{member.role}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Emoji button + popover */}
          <div ref={emojiRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowEmoji((prev) => !prev)
                setShowMentions(false)
              }}
              className={cn(
                "rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
                showEmoji && "bg-muted text-foreground"
              )}
              aria-label="Add emoji"
            >
              <Smile className="size-4" />
            </button>

            {showEmoji && (
              <div className="absolute bottom-full right-0 z-50 mb-2 w-[220px] rounded-lg border border-border/50 bg-popover p-2 shadow-lg dark:border-border/30">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Emoji
                </p>
                <div className="grid grid-cols-6 gap-0.5">
                  {EMOJI_GRID.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setValue((prev) => prev + emoji)
                        setShowEmoji(false)
                        textareaRef.current?.focus()
                      }}
                      className="flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-muted"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim()}
            className={cn(
              "ml-1 rounded-md p-1 transition-colors",
              value.trim()
                ? "text-primary hover:bg-primary/10"
                : "text-muted-foreground/40"
            )}
            aria-label="Send message"
          >
            <SendHorizonal className="size-4" />
          </button>
        </div>
      </div>

      {/* File attachment dialog */}
      <Dialog open={showAttach} onOpenChange={setShowAttach}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attach Files</DialogTitle>
            <DialogDescription>
              Select files to attach to your message
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {MOCK_FILES.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => toggleFileSelection(file.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selectedFiles.has(file.id)
                    ? "border-primary/50 bg-primary/5 dark:border-primary/30"
                    : "border-border/40 hover:bg-muted/50 dark:border-border/20"
                )}
              >
                <div className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
                  selectedFiles.has(file.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/60 dark:border-border/40"
                )}>
                  {selectedFiles.has(file.id) && <Check className="size-3" />}
                </div>
                <File className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{file.size} — uploaded {file.date}</p>
                </div>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success("File uploaded")
              }}
            >
              <Upload className="size-3.5" />
              Upload New
            </Button>
            <Button
              size="sm"
              disabled={selectedFiles.size === 0}
              onClick={() => {
                toast.success(`${selectedFiles.size} file${selectedFiles.size > 1 ? "s" : ""} attached to message`)
                setShowAttach(false)
              }}
            >
              Attach Selected ({selectedFiles.size})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
