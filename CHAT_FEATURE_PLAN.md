# Kiptra Team Chat — Implementation Plan

> **Scope:** Add a "Chat" tab to kiptra-mockup.vercel.app that mirrors Slack/Teams conversations inside Kiptra's UI via OAuth integration.
>
> **Site:** kiptra-mockup.vercel.app (`/Users/joseph/Downloads/kiptra-mockup/`)
>
> **Stack:** Next.js 16 / React 19 / Tailwind 4 / shadcn/ui
>
> **KB Sources:** 16 KBs consulted (13 new + 3 existing). See KB Reference Matrix below.

---

## KB Reference Matrix

### Directly Relevant (read before building)

| # | KB | What to Extract | Files to Read |
|---|-----|----------------|---------------|
| 1 | **chat-provider-patterns/** | `MessageContent` type, `ChatProvider` interface, threading rules (1 thread per K&B entity), channel mapping (project→channel), platform abstraction, ADRs | All 3 files |
| 2 | **slack-integration/** | Channel naming (`proj-{client}-{type}`), Block Kit rendering, notification routing table, bot persona, Slack Connect visual patterns, `files.uploadV2` | All 3 files |
| 3 | **teams-integration/** | Adaptive Card rendering, Teams channel structure, guest user `#EXT#` display, project status cards, contractor onboarding cards | All 3 files |
| 4 | **ui-ux-patterns/** | RSC split (server skeleton + client message list), `ResponsivePanel` pattern, virtualized lists (TanStack Virtual), state management (TanStack Query for messages, Zustand for UI, `nuqs` for threadId), `useAutoSave` for draft composer, shadcn/ui data table | 01-booksmarts (Sections 5b, 9, 10, 11, 12), 02-streetsmarts (iOS viewport, responsive panels) |
| 5 | **advanced-interactions/** | `useOptimistic` for sent messages, Framer Motion panel transitions, keyboard shortcuts, undo pattern (for message delete/edit), collaborative cursor patterns | 01-booksmarts (useOptimistic, undo/redo), 02-streetsmarts |
| 6 | **accessibility-wcag/** | `role="log"` + `aria-live="polite"` for message list, debounced announcements (max 1/sec), `inert` for background panels, `<search>` element for chat search, keyboard nav (Arrow keys in channel list), focus trap in thread panel | 01-booksmarts (Sections on live regions, search), 03-insidersmarts (collaboration a11y) |
| 7 | **mobile-responsive/** | `100dvh` iOS keyboard fix, `useKeyboardVisible()` hook, responsive breakpoints, offline message queue UX (IndexedDB pattern), PWA install, service worker caching tiers, barcode scanning (for material lookup in chat) | 01-booksmarts (Web Vitals, PWA, service worker), 03-insidersmarts (field installer UX) |
| 8 | **push-notifications/** | In-app notification bell integration (`chat_message` + `chat_mention` types), notification preference center UI (add chat category), quiet hours enforcement, frequency caps, escalation chain for unread @mentions | 01-booksmarts (Sections on preference center, dispatch, NotificationInbox), 03-insidersmarts (escalation chains) |
| 9 | **search-infrastructure/** | Message search UI (`websearch_to_tsquery` for natural language), full-text search display patterns, hybrid search (keyword + semantic), zero-result handling, search analytics | 01-booksmarts (Sections on Postgres FTS, hybrid search RPC, search analytics) |

### Supporting (consult for specific sections)

| # | KB | What to Extract | When to Read |
|---|-----|----------------|-------------|
| 10 | **customer-support/** | AI-to-human handoff UI (confidence badge, "Connecting you with..." state), support thread schema, warranty claim workflow UI | If AI agent responds in chat threads |
| 11 | **user-onboarding/** | `driver.js` tour step for Chat tab, empty state design for first-time chat, multi-tenant onboarding (org connects Slack/Teams) | When adding tour integration |
| 12 | **file-storage-cdn/** | Attachment preview patterns (thumbnails, file type icons, upload progress bar), presigned URL display, virus scan "pending" state, multipart upload progress | When building attachment-preview.tsx |
| 13 | **analytics-tracking/** | Event naming convention (`chat_message_sent`, `chat_thread_created`), PostHog group analytics for firm-level adoption, `data-track` attributes, K&B funnel stages, 90-day retention windows | When adding tracking attributes |

### Existing KBs (from original kiptra-expertise-v2)

| # | KB | What to Extract |
|---|-----|----------------|
| 14 | **frontend-nextjs/** | App Router layout patterns, route groups, Server/Client component boundaries, `loading.tsx` + `error.tsx` conventions |
| 15 | **queue-events-realtime/** | Socket.IO room-per-project pattern (informs UI room naming), Redis adapter architecture, NATS subject hierarchy |
| 16 | **typescript-advanced/** | Discriminated unions for message variants (`TextMessage | FileMessage | SystemMessage`), generic types for chat data layer, Zod schemas |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│  Kiptra Web App (Next.js 16)                         │
│  ┌────────────────────────────────────────────────┐  │
│  │  /chat (new route)                             │  │
│  │  ┌──────────┐  ┌───────────────────────────┐   │  │
│  │  │ Channel  │  │ Message Thread             │   │  │
│  │  │ Sidebar  │  │                            │   │  │
│  │  │          │  │ Messages (virtualized)      │   │  │
│  │  │ #proj-   │  │ ┌─────────────────────┐    │   │  │
│  │  │  smith   │  │ │ Sarah (via Slack) ✦  │    │   │  │
│  │  │ #proj-   │  │ │ Cabinet specs look   │    │   │  │
│  │  │  jones   │  │ │ good. Ship Monday?   │    │   │  │
│  │  │ #general │  │ └─────────────────────┘    │   │  │
│  │  │ DMs      │  │ ┌─────────────────────┐    │   │  │
│  │  │          │  │ │ You                  │    │   │  │
│  │  │          │  │ │ Yes, confirmed with  │    │   │  │
│  │  │          │  │ │ the homeowner ✓✓     │    │   │  │
│  │  │          │  │ └─────────────────────┘    │   │  │
│  │  │          │  │                            │   │  │
│  │  │          │  │ ┌──────────────────────┐   │   │  │
│  │  │          │  │ │ Composer + Attach    │   │   │  │
│  │  │          │  │ └──────────────────────┘   │   │  │
│  │  └──────────┘  └───────────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
│                         │                            │
│                    OAuth tokens                      │
│                    ┌────┴────┐                        │
│                    ▼         ▼                        │
│              Slack API   Teams API                    │
│              (mirror)    (mirror)                     │
└──────────────────────────────────────────────────────┘
```

**Core principle (from chat-provider-patterns/03 ADR 3):** Kiptra is the system of record. Slack/Teams are mirrors. All messages flow through Kiptra's chat UI, synced bidirectionally via OAuth-authenticated API calls.

---

## File Plan

### New Files to Create

| # | File | Purpose | Est. Lines |
|---|------|---------|-----------|
| 1 | `src/app/(authenticated)/chat/page.tsx` | Main chat page (channel list + message area) | ~800 |
| 2 | `src/app/(authenticated)/chat/layout.tsx` | Chat layout (optional context-aware sidebar swap) | ~50 |
| 3 | `src/components/chat/channel-list.tsx` | Left panel: channels, DMs, search | ~250 |
| 4 | `src/components/chat/message-thread.tsx` | Center panel: message list + composer | ~400 |
| 5 | `src/components/chat/message-bubble.tsx` | Individual message with platform badge | ~120 |
| 6 | `src/components/chat/chat-composer.tsx` | Message input with attachments, mentions | ~200 |
| 7 | `src/components/chat/thread-panel.tsx` | Right panel: thread replies (slide-over) | ~180 |
| 8 | `src/components/chat/channel-header.tsx` | Channel name, members, integration status | ~100 |
| 9 | `src/components/chat/chat-search.tsx` | Search messages across channels | ~120 |
| 10 | `src/components/chat/integration-badge.tsx` | "via Slack" / "via Teams" indicator | ~30 |
| 11 | `src/components/chat/typing-indicator.tsx` | Animated typing dots | ~40 |
| 12 | `src/components/chat/attachment-preview.tsx` | File/image previews in messages | ~80 |
| 13 | `src/lib/chat-data.ts` | Mock data: channels, messages, users, threads | ~500 |
| 14 | `src/lib/chat-types.ts` | TypeScript interfaces for chat entities | ~80 |

### Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `src/components/sidebar.tsx` | Add "Chat" to `NAV_ITEM_REGISTRY` with `MessageSquare` icon and unread badge |
| 2 | `src/lib/persona-templates.ts` | Add "Chat" to all 4 persona `sidebarItems` arrays |
| 3 | `src/lib/role-context.tsx` | Add "Chat" to all role `sidebarItems` (viewer = read-only) |
| 4 | `src/app/(authenticated)/settings/integrations/page.tsx` | Add Slack/Teams OAuth connection cards |

**Total: ~14 new files, 4 modified files, ~2,950 lines**

---

## Phase 1: Data Layer & Types

### 1a. Type Definitions (`src/lib/chat-types.ts`)

```typescript
// From chat-provider-patterns/01-booksmarts.md — ChatProvider interface
type ChatPlatform = 'kiptra' | 'slack' | 'teams';
type ChannelType = 'project' | 'general' | 'dm' | 'group_dm';
type MessageSource = 'kiptra' | 'slack' | 'teams';

interface ChatChannel {
  id: string;
  name: string;                    // e.g., "proj-smith-kitchen"
  type: ChannelType;
  projectId?: string;              // linked Kiptra project
  platform: ChatPlatform;          // primary platform
  slackChannelId?: string;
  teamsChannelId?: string;
  members: ChatMember[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  isArchived: boolean;
  topic?: string;
  createdAt: string;
}

interface ChatMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'designer' | 'contractor' | 'homeowner';
  platform: ChatPlatform;          // where this user primarily lives
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatMessage {
  id: string;
  channelId: string;
  threadId?: string;               // parent message ID if threaded
  sender: ChatMember;
  content: string;
  source: MessageSource;           // "via Slack" / "via Teams" badge
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  replyCount?: number;
  isEdited: boolean;
  createdAt: string;
  readBy?: string[];               // member IDs for read receipts
}

interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'pdf' | 'design_render';
  url: string;
  size: string;                    // "2.4 MB"
  thumbnailUrl?: string;
}

interface ChatReaction {
  emoji: string;
  users: string[];                 // member names
}
```

### 1b. Mock Data (`src/lib/chat-data.ts`)

Mock data must be realistic for K&B industry (from feedback_mock_data_accuracy.md). Create:

**Channels (8-10):**
- `#proj-smith-kitchen` — Active kitchen remodel (linked to project, 5 members)
- `#proj-johnson-masterbath` — Master bath renovation (3 members)
- `#proj-garcia-fullremodel` — Full home remodel (8 members, high activity)
- `#general` — Firm-wide channel
- `#submittals` — Material submittal discussions
- `#installations` — Field crew coordination
- DM: Sarah Chen (designer, via Slack)
- DM: Mike Thompson (contractor, via Teams)
- DM: HomeOwner — Lisa Johnson (Kiptra-only, no Slack/Teams)
- Group DM: Smith Kitchen Team (3 people)

**Messages per channel (15-30):** Mix of:
- Messages sent from Kiptra (no badge)
- Messages "via Slack" (Slack icon badge)
- Messages "via Teams" (Teams icon badge)
- System messages ("Sarah added Mike to the channel", "Project milestone: Demolition Complete")
- Threaded replies (submittals, change orders)
- Attachments (floor plans, material photos, BOM PDFs)
- K&B-specific content: cabinet specs, countertop selections, permit status, delivery scheduling, installation dates

**Key mock scenarios to demonstrate:**
1. Designer sends a material spec in Kiptra → contractor sees it in Slack
2. Contractor replies from Slack → appears in Kiptra with "via Slack" badge
3. Homeowner messages in Kiptra → designer gets notification
4. System auto-posts: "Milestone Complete: Plumbing Rough-In" to project channel
5. Threaded conversation about a change order with approval action

---

## Phase 2: Navigation Integration

### 2a. Sidebar Registration

Add to `NAV_ITEM_REGISTRY` in `sidebar.tsx`:

```typescript
import { MessageSquare } from "lucide-react";

// Add to registry:
Chat: { icon: MessageSquare, href: "/chat", badge: 5, dataTour: "chat-link" },
```

Position: After "CRM" and before "Projects" — chat is a primary daily-use feature.

### 2b. Persona Templates

Add `"Chat"` to every persona's `sidebarItems`:

| Persona | Position in array | Rationale |
|---------|------------------|-----------|
| Contractor | After "CRM" | Primary user — chats with designers, homeowners, dealers |
| Dealer | After "Orders" | Chats with contractors about orders, specs |
| Rep | After "CRM" | Chats with dealers and contractors in territory |
| Manufacturer | After "Production" | Chats with dealers about orders, quality |

### 2c. Role Permissions

| Role | Chat Access |
|------|------------|
| owner | Full (all channels, can create/archive) |
| admin | Full |
| manager | Full (project channels they manage) |
| designer | Full (project channels they're assigned to) |
| bookkeeper | Read-only (financial-tagged channels only) |
| viewer | Read-only (no composer, can view messages) |

---

## Phase 3: Chat UI Components

### 3a. Main Chat Page (`/chat`)

**Layout:** Three-panel responsive layout:
- **Desktop (lg+):** Channel list (280px) | Message area (flex-1) | Thread panel (350px, conditional)
- **Tablet (md):** Channel list as Sheet (slide-over) | Message area (full) | Thread as Sheet
- **Mobile (sm):** Full-screen channel list → tap → full-screen messages → tap thread → full-screen thread

From ui-ux-patterns/02-streetsmarts.md:
- Use `100dvh` for chat container (iOS keyboard fix)
- `ResponsivePanel` pattern: `<Sheet>` on desktop, `<Drawer>` on mobile
- Hide bottom nav when keyboard opens (`useKeyboardVisible()` hook)

### 3b. Channel List (`channel-list.tsx`)

```
┌─────────────────────────┐
│ 🔍 Search channels...   │
├─────────────────────────┤
│ PROJECTS                │
│ ● #proj-smith-kitchen 3 │ ← unread badge
│   #proj-johnson-bath    │
│   #proj-garcia-remodel  │
├─────────────────────────┤
│ CHANNELS                │
│ ● #general           1  │
│   #submittals           │
│   #installations        │
├─────────────────────────┤
│ DIRECT MESSAGES         │
│ 🟢 Sarah Chen      Slack│ ← platform indicator
│ 🟢 Mike Thompson  Teams │
│ ⚪ Lisa Johnson  Kiptra │
│ 👥 Smith Kitchen Team   │
└─────────────────────────┘
```

Features:
- Unread count badges (bold channel name + count)
- Online/offline presence dots
- Platform indicator per user (Slack/Teams/Kiptra icon)
- Project channels auto-grouped and linked to project
- Channel search with `websearch_to_tsquery` pattern (from search-infrastructure KB)

### 3c. Message Thread (`message-thread.tsx`)

```
┌──────────────────────────────────────────────┐
│ #proj-smith-kitchen  👥 5  📌 Topic: ...     │ ← channel-header.tsx
├──────────────────────────────────────────────┤
│                                              │
│ ── Today ──────────────────────────────────  │
│                                              │
│ 🟣 Sarah Chen              via Slack  10:23a │
│ ┌──────────────────────────────────────┐     │
│ │ KraftMaid specs for the island are   │     │
│ │ attached. 36" base, quartz top.      │     │
│ │ 📎 smith-island-specs.pdf (2.4 MB)   │     │
│ │ 💬 3 replies                         │     │
│ └──────────────────────────────────────┘     │
│                                              │
│ 🔵 Mike Thompson           via Teams  11:05a │
│ ┌──────────────────────────────────────┐     │
│ │ Confirmed with plumber. Rough-in     │     │
│ │ starts Thursday AM.                  │     │
│ └──────────────────────────────────────┘     │
│                                              │
│ ⚙️ System                            11:30a │
│ │ ✅ Milestone Complete: Demolition           │
│                                              │
│ 🟢 You                               12:15p │
│ ┌──────────────────────────────────────┐     │
│ │ @Lisa Johnson — plumbing starts      │     │
│ │ Thursday, expect noise 8am-3pm.      │     │
│ │ ✓✓ Read by Lisa, Sarah              │     │
│ └──────────────────────────────────────┘     │
│                                              │
│ Sarah is typing...                           │
├──────────────────────────────────────────────┤
│ 📎  Type a message...            ➤ Send     │ ← chat-composer.tsx
└──────────────────────────────────────────────┘
```

Key UX details:
- **Platform badges**: Small Slack/Teams icon on messages from external platforms
- **Read receipts**: Double check + "Read by X, Y" on sent messages
- **System messages**: Milestone completions, member joins, channel events
- **Threaded replies**: "💬 3 replies" — click opens thread panel
- **Typing indicator**: Animated dots with sender name
- **@mentions**: Highlighted, clickable
- **Date separators**: "Today", "Yesterday", "March 20"
- **Attachment previews**: Thumbnails for images, icon + filename for files
- **Reactions**: Emoji row below messages (click to add)

From accessibility-wcag KB:
- Message list: `role="log"` + `aria-live="polite"` + `aria-relevant="additions"`
- Debounced announcements: max 1/sec in active threads
- Keyboard nav: Arrow keys between messages, Enter to reply, Tab to thread

### 3d. Message Bubble (`message-bubble.tsx`)

Variants:
- **Own message**: Right-aligned, accent background, read receipts
- **Other's message**: Left-aligned, muted background, avatar + name
- **System message**: Centered, small text, icon
- **Threaded message**: Indent + connection line to parent

Platform indicator colors:
- Slack: `#4A154B` (purple) small icon
- Teams: `#6264A7` (purple-blue) small icon
- Kiptra: No badge (native)

### 3e. Chat Composer (`chat-composer.tsx`)

```
┌────────────────────────────────────────────────┐
│ 📎  😀  @  │ Type a message...        │ ➤ Send │
└────────────────────────────────────────────────┘
```

Features:
- Attachment button (mock file picker)
- Emoji picker (mock)
- @mention autocomplete (shows channel members with platform badges)
- Shift+Enter for newline, Enter to send
- Draft auto-save to localStorage (from ui-ux-patterns/01 Section 10)
- Disabled state for viewer role (from role permissions)

### 3f. Thread Panel (`thread-panel.tsx`)

Slides in from right on desktop (350px), full-screen Sheet on mobile.

```
┌───────────────────────────┐
│ ← Thread in #proj-smith   │
│ ─────────────────────────│
│ [Original message]        │
│ ─────────────────────────│
│ 3 replies                 │
│                           │
│ Sarah: Confirmed specs    │
│ Mike: Will pick up Mon    │
│ You: Perfect, thanks      │
│                           │
│ [Reply composer]          │
└───────────────────────────┘
```

### 3g. Channel Header (`channel-header.tsx`)

```
#proj-smith-kitchen  |  👥 5 members  |  🔗 Slack Connected  |  📌 Island remodel, KraftMaid cabinets
                                                                [Search] [Pin] [Members] [Settings]
```

Shows:
- Channel name + type icon
- Member count + avatars
- Integration status (Slack/Teams connected badge)
- Topic/description
- Action buttons (search, pinned messages, member list, settings)

---

## Phase 4: Integration Settings

### 4a. Settings > Integrations Page Update

Add two new integration cards to the existing integrations page:

**Slack Integration Card:**
```
┌────────────────────────────────────────┐
│ [Slack Logo]  Slack                    │
│ Mirror project channels and DMs in     │
│ Kiptra. Messages sync bidirectionally. │
│                                        │
│ Status: ✅ Connected                   │
│ Workspace: Smith Remodeling            │
│ Channels synced: 4                     │
│ Last sync: 2 minutes ago              │
│                                        │
│ [Manage]  [Disconnect]                 │
└────────────────────────────────────────┘
```

**Teams Integration Card:**
```
┌────────────────────────────────────────┐
│ [Teams Logo]  Microsoft Teams          │
│ Mirror Teams channels in Kiptra.       │
│ Requires admin consent.                │
│                                        │
│ Status: 🔵 Connect                     │
│                                        │
│ [Connect with Microsoft]               │
└────────────────────────────────────────┘
```

---

## Phase 5: Persona-Specific Chat Experiences

### Per-Persona Channel Defaults

| Persona | Default Channels | Special Features |
|---------|-----------------|------------------|
| **Contractor** | Project channels, #submittals, #installations, homeowner DMs | Milestone auto-posts, submittal threads, homeowner simplified view |
| **Dealer** | #orders, contractor DMs, rep DMs | Order status threads, catalog update notifications |
| **Rep** | Territory dealer channels, #orders | Commission-related message highlights |
| **Manufacturer** | #production, dealer channels, #quality | Production alert threads, dealer support channels |

### Homeowner View (Contractor persona — client-facing)

When viewing a DM with a homeowner, show a simplified UI:
- No thread nesting
- No emoji reactions
- Larger text, simpler layout
- "Your Designer" label instead of individual name
- Project timeline context bar at top

---

## Phase 6: K&B-Specific Mock Scenarios

### Scenario 1: Submittal Approval Thread
```
[System] New submittal: KraftMaid Island Cabinet - SKU KM-3648-SH
  └─ Sarah (Slack): Specs attached. 36" base, Shaker door, Dove White.
  └─ Mike (Teams): Fits the layout. Recommend soft-close upgrade.
  └─ You: @Lisa Johnson — approve this spec? [Approve] [Request Changes]
  └─ Lisa (Kiptra): Approved ✓
  └─ [System] Submittal approved. Order created → #orders
```

### Scenario 2: Change Order Discussion
```
[System] 🔄 Change Order #CO-003: Add under-cabinet lighting
  └─ Lisa (Kiptra): Can we add LED strips under the island?
  └─ Sarah (Slack): Yes — $1,200 materials + $400 labor. 2-day extension.
  └─ You: Sending updated estimate now.
  └─ [System] Estimate #EST-047 attached ($1,600)
  └─ Lisa (Kiptra): Approved ✓
```

### Scenario 3: Delivery Coordination
```
Mike (Teams): KraftMaid delivery confirmed for Tuesday 8am.
  Need someone onsite to receive. 4 pallets.
You: I'll have Jason there. @Jason — heads up, Tuesday 8am delivery.
Jason (Slack): 👍 Got it. I'll prep the garage for staging.
[System] 📦 Delivery scheduled: Tue Mar 25, 8:00 AM — Smith Kitchen
```

### Scenario 4: Homeowner Update (Simplified DM)
```
Your Designer: Hi Lisa! Quick update — plumbing rough-in
  starts Thursday. Expect noise from 8am-3pm. The crew will
  use the side entrance.
Lisa: Thanks for the heads up! Should I move anything
  from the kitchen beforehand?
Your Designer: Just clear the counters and any items from
  under the sink. We'll handle the rest.
```

---

## Build Sequence

| Step | Files | Depends On | Est. Effort |
|------|-------|-----------|-------------|
| 1 | `chat-types.ts` | — | Small |
| 2 | `chat-data.ts` | Step 1 | Medium |
| 3 | `sidebar.tsx` + `persona-templates.ts` + `role-context.tsx` | — | Small |
| 4 | `integration-badge.tsx` + `typing-indicator.tsx` | Step 1 | Small |
| 5 | `message-bubble.tsx` | Steps 1, 4 | Medium |
| 6 | `attachment-preview.tsx` | Step 1 | Small |
| 7 | `chat-composer.tsx` | Step 1 | Medium |
| 8 | `channel-header.tsx` | Step 1 | Small |
| 9 | `channel-list.tsx` | Steps 1, 2 | Medium |
| 10 | `message-thread.tsx` | Steps 5, 6, 7, 8 | Large |
| 11 | `thread-panel.tsx` | Step 5 | Medium |
| 12 | `chat-search.tsx` | Steps 1, 2 | Small |
| 13 | `chat/layout.tsx` | — | Small |
| 14 | `chat/page.tsx` | Steps 9-12 | Large |
| 15 | Update integrations page | — | Small |

**Parallelizable:** Steps 1-3 can run in parallel. Steps 4-8 can run in parallel after step 1. Steps 9-12 can run in parallel after their deps.

---

## Design Tokens

### Chat-Specific Colors (Tailwind)

```
Message own:        bg-blue-600/10 dark:bg-blue-500/20
Message other:      bg-zinc-100 dark:bg-zinc-800
Message system:     bg-transparent, text-zinc-500
Slack badge:        bg-[#4A154B] text-white
Teams badge:        bg-[#6264A7] text-white
Kiptra badge:       bg-emerald-500 text-white
Unread:             bg-blue-500 text-white (rounded pill)
Online dot:         bg-emerald-500
Offline dot:        bg-zinc-400
Mention highlight:  bg-amber-100 dark:bg-amber-900/30
```

### Responsive Breakpoints

```
Mobile (< 768px):   Full-screen panels, swipe nav
Tablet (768-1024):  Channel list as overlay, messages full
Desktop (> 1024):   Three-panel side-by-side
```

---

## Accessibility (from accessibility-wcag KBs)

- Message list: `role="log"` with `aria-live="polite"` and `aria-relevant="additions"`
- Channel list: `role="listbox"` with `aria-selected` on active channel
- Composer: `role="textbox"` with `aria-label="Message #channel-name"`
- Thread panel: `aria-label="Thread replies"` + focus trap when open
- Platform badges: `aria-label="sent via Slack"` (not just icon)
- Keyboard navigation: Arrow keys in channel list, Escape to close thread
- Reduced motion: Disable typing indicator animation for `prefers-reduced-motion`

---

## What This Plan Does NOT Include

- Actual Slack/Teams OAuth integration (this is a mockup with static data)
- WebSocket/Supabase Realtime connections
- Backend API endpoints
- Message persistence
- File upload functionality
- Push notifications

These are covered in the full implementation strategy (see conversation context) and would be built when moving from mockup to production.
