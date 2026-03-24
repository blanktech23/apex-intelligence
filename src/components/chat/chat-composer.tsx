"use client"

import * as React from "react"
import { AtSign, Paperclip, SendHorizonal, Smile } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"

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
      <div className="flex items-end gap-1.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 transition-colors focus-within:border-border focus-within:bg-background dark:border-border/30 dark:bg-muted/20 dark:focus-within:border-border/60">
        {/* Toolbar buttons */}
        <button
          type="button"
          onClick={() => toast("File attachments coming soon")}
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
          <button
            type="button"
            onClick={() => toast("@ mentions coming soon")}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
            aria-label="Mention someone"
          >
            <AtSign className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => toast("Emoji picker coming soon")}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
            aria-label="Add emoji"
          >
            <Smile className="size-4" />
          </button>
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
    </div>
  )
}
