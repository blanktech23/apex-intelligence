"use client";

import {
  Move,
  RotateCw,
  Copy,
  Wrench,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Toolbar Actions                                                    */
/* ------------------------------------------------------------------ */

interface ToolbarAction {
  id: string;
  label: string;
  icon: React.ElementType;
  destructive?: boolean;
}

const actions: ToolbarAction[] = [
  { id: "move", label: "Move", icon: Move },
  { id: "rotate", label: "Rotate 90\u00b0", icon: RotateCw },
  { id: "duplicate", label: "Duplicate", icon: Copy },
  { id: "modify", label: "Modify", icon: Wrench },
  { id: "delete", label: "Delete", icon: Trash2, destructive: true },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CanvasToolbar({
  selectedItemId,
  onAction,
  className,
}: {
  selectedItemId: string | null;
  onAction: (action: string) => void;
  className?: string;
}) {
  if (!selectedItemId) return null;

  return (
    <TooltipProvider>
      <div
        className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-0.5 rounded-lg border border-border bg-background px-1.5 py-1 shadow-md ${className ?? ""}`}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Tooltip key={action.id}>
              <TooltipTrigger
                className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                  action.destructive
                    ? "text-muted-foreground hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => {
                  if (action.id === "modify") {
                    onAction("modify");
                  } else {
                    toast.success(`${action.label}: ${selectedItemId}`);
                    onAction(action.id);
                  }
                }}
              >
                <Icon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
