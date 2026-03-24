"use client"

import { cn } from "@/lib/utils"

type Platform = "kiptra" | "slack" | "teams"

interface IntegrationBadgeProps {
  platform: Platform
  size?: "sm" | "md"
  className?: string
}

function SlackIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z"
        fill="currentColor"
      />
    </svg>
  )
}

function TeamsIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.625 6.547h-3.516a2.953 2.953 0 1 0-2.36-4.734A3.75 3.75 0 0 1 20.625 6.547zM16.5 7.547H22.5a1.5 1.5 0 0 1 1.5 1.5v4.5a3.75 3.75 0 0 1-3.75 3.75h-.047A5.25 5.25 0 0 0 16.5 12.75V7.547zM13.125 3.797a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM1.5 9.047a1.5 1.5 0 0 1 1.5-1.5h14.25a1.5 1.5 0 0 1 1.5 1.5v3.75a6.375 6.375 0 0 1-12.75 0H3a1.5 1.5 0 0 1-1.5-1.5V9.047z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IntegrationBadge({
  platform,
  size = "sm",
  className,
}: IntegrationBadgeProps) {
  // Don't render badge for kiptra-native messages
  if (platform === "kiptra") {
    return null
  }

  const iconSize = size === "sm" ? 14 : 18

  const platformConfig = {
    slack: {
      label: "Slack",
      color: "text-[#4A154B] bg-[#4A154B]/10 dark:text-[#E8A0BF] dark:bg-[#4A154B]/20",
      icon: <SlackIcon size={iconSize} />,
    },
    teams: {
      label: "Teams",
      color: "text-[#6264A7] bg-[#6264A7]/10 dark:text-[#A4A6D8] dark:bg-[#6264A7]/20",
      icon: <TeamsIcon size={iconSize} />,
    },
  } as const

  const config = platformConfig[platform]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium",
        config.color,
        className
      )}
      aria-label={`sent via ${platform}`}
    >
      {config.icon}
      <span className="sr-only">{config.label}</span>
    </span>
  )
}
