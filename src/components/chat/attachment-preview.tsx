"use client"

import {
  Box,
  FileText,
  ImageIcon,
  Palette,
  Table,
} from "lucide-react"

import type { ChatAttachment } from "@/lib/chat-types"
import { cn } from "@/lib/utils"

interface AttachmentPreviewProps {
  attachment: ChatAttachment
  className?: string
}

const fileTypeConfig: Record<
  ChatAttachment["fileType"],
  { icon: typeof FileText; gradient: string }
> = {
  image: {
    icon: ImageIcon,
    gradient: "from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10",
  },
  pdf: {
    icon: FileText,
    gradient: "from-red-500/20 to-orange-500/20 dark:from-red-500/10 dark:to-orange-500/10",
  },
  document: {
    icon: FileText,
    gradient: "from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10",
  },
  spreadsheet: {
    icon: Table,
    gradient: "from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10",
  },
  design_render: {
    icon: Palette,
    gradient: "from-violet-500/20 to-pink-500/20 dark:from-violet-500/10 dark:to-pink-500/10",
  },
  cad: {
    icon: Box,
    gradient: "from-amber-500/20 to-yellow-500/20 dark:from-amber-500/10 dark:to-yellow-500/10",
  },
}

export function AttachmentPreview({
  attachment,
  className,
}: AttachmentPreviewProps) {
  const config = fileTypeConfig[attachment.fileType]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border/50 p-2.5 transition-colors hover:border-border hover:bg-muted/50 dark:border-border/30 dark:hover:border-border/60 dark:hover:bg-muted/30",
        className
      )}
    >
      {attachment.fileType === "image" ? (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br",
            config.gradient
          )}
        >
          <Icon className="size-5 text-muted-foreground" />
        </div>
      ) : (
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br",
            config.gradient
          )}
        >
          <Icon className="size-5 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {attachment.name}
        </p>
        <p className="text-xs text-muted-foreground">{attachment.size}</p>
      </div>
    </div>
  )
}
