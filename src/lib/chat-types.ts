// ---------------------------------------------------------------------------
// Chat Feature — Type Definitions
// From: chat-provider-patterns/01-booksmarts.md (ChatProvider interface)
// From: slack-integration/01-booksmarts.md (channel structure)
// From: teams-integration/01-booksmarts.md (Adaptive Card types)
// ---------------------------------------------------------------------------

export type ChatPlatform = "kiptra" | "slack" | "teams";
export type ChannelType = "project" | "general" | "dm" | "group_dm";
export type MessageSource = "kiptra" | "slack" | "teams";
export type MessageType = "text" | "file" | "system" | "submittal" | "change_order" | "milestone";
export type MemberRole = "owner" | "admin" | "designer" | "contractor" | "homeowner" | "dealer" | "rep";

// ---------------------------------------------------------------------------
// Channel
// ---------------------------------------------------------------------------

export interface ChatChannel {
  id: string;
  name: string; // e.g. "proj-smith-kitchen"
  displayName: string; // e.g. "Smith Kitchen Remodel"
  type: ChannelType;
  projectId?: string;
  platform: ChatPlatform; // primary mirror platform
  slackChannelId?: string;
  teamsChannelId?: string;
  members: ChatMember[];
  unreadCount: number;
  lastMessage?: ChatMessage;
  isArchived: boolean;
  isMuted: boolean;
  topic?: string;
  createdAt: string;
  pinnedMessages?: string[]; // message IDs
}

// ---------------------------------------------------------------------------
// Member
// ---------------------------------------------------------------------------

export interface ChatMember {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  role: MemberRole;
  platform: ChatPlatform; // where this user primarily lives
  isOnline: boolean;
  lastSeen?: string;
  isTyping?: boolean;
}

// ---------------------------------------------------------------------------
// Message (discriminated union per typescript-advanced KB)
// ---------------------------------------------------------------------------

export interface BaseMessage {
  id: string;
  channelId: string;
  threadId?: string; // parent message ID if threaded reply
  sender: ChatMember;
  source: MessageSource;
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  reactions: ChatReaction[];
  readBy: string[]; // member IDs
  replyCount: number;
  lastReplyAt?: string;
}

export interface TextMessage extends BaseMessage {
  type: "text";
  content: string;
  mentions: string[]; // member IDs
  attachments: ChatAttachment[];
}

export interface SystemMessage extends BaseMessage {
  type: "system";
  content: string;
  systemAction:
    | "member_joined"
    | "member_left"
    | "channel_created"
    | "topic_changed"
    | "milestone_complete"
    | "submittal_created"
    | "submittal_approved"
    | "submittal_rejected"
    | "change_order_created"
    | "change_order_approved"
    | "delivery_scheduled"
    | "estimate_attached";
}

export interface FileMessage extends BaseMessage {
  type: "file";
  content: string;
  attachments: ChatAttachment[];
}

export type ChatMessage = TextMessage | SystemMessage | FileMessage;

// ---------------------------------------------------------------------------
// Attachment
// ---------------------------------------------------------------------------

export interface ChatAttachment {
  id: string;
  name: string;
  fileType: "image" | "pdf" | "document" | "spreadsheet" | "design_render" | "cad";
  url: string;
  size: string; // "2.4 MB"
  thumbnailUrl?: string;
  mimeType?: string;
}

// ---------------------------------------------------------------------------
// Reaction
// ---------------------------------------------------------------------------

export interface ChatReaction {
  emoji: string;
  users: string[]; // member names
  count: number;
}

// ---------------------------------------------------------------------------
// Thread (from chat-provider-patterns/02-streetsmarts.md — K&B threading rules)
// ---------------------------------------------------------------------------

export interface ChatThread {
  rootMessageId: string;
  channelId: string;
  entityType?: "submittal" | "change_order" | "milestone" | "general";
  entityId?: string;
  replyCount: number;
  participants: ChatMember[];
  lastReplyAt: string;
}

// ---------------------------------------------------------------------------
// Integration Status (for settings page)
// ---------------------------------------------------------------------------

export interface ChatIntegration {
  platform: ChatPlatform;
  status: "connected" | "disconnected" | "pending";
  workspaceName?: string;
  connectedAt?: string;
  channelsSynced?: number;
  lastSyncAt?: string;
  connectedBy?: string;
}

// ---------------------------------------------------------------------------
// Chat State
// ---------------------------------------------------------------------------

export interface ChatState {
  channels: ChatChannel[];
  activeChannelId: string | null;
  activeThreadId: string | null;
  integrations: ChatIntegration[];
  searchQuery: string;
  isSearchOpen: boolean;
}
