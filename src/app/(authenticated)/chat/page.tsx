"use client";

import { useState, useCallback } from "react";
import { ChannelList } from "@/components/chat/channel-list";
import { ChannelHeader } from "@/components/chat/channel-header";
import { MessageThread } from "@/components/chat/message-thread";
import { ThreadPanel } from "@/components/chat/thread-panel";
import { ChatSearch } from "@/components/chat/chat-search";
import {
  MOCK_CHANNELS,
  getChannelMessages,
  getThreadReplies,
  getChannel,
} from "@/lib/chat-data";
import type { ChatMessage } from "@/lib/chat-types";
import { useRole } from "@/lib/role-context";
import { MessageSquare, ArrowLeft } from "lucide-react";

// ---------------------------------------------------------------------------
// Empty state when no channel is selected
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-zinc-500 dark:text-zinc-400">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <MessageSquare className="h-8 w-8" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Team Chat
        </h3>
        <p className="mt-1 max-w-sm text-sm">
          Select a channel or conversation to start messaging. Your Slack and
          Teams messages sync here automatically.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Chat Page
// ---------------------------------------------------------------------------

export default function ChatPage() {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(
    "chan-smith-kitchen"
  );
  const [activeThreadMessageId, setActiveThreadMessageId] = useState<
    string | null
  >(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileShowMessages, setMobileShowMessages] = useState(false);

  const { config } = useRole();
  const isReadOnly = !config.canEditProjects; // viewer + bookkeeper

  // Derived state
  const activeChannel = activeChannelId
    ? getChannel(activeChannelId)
    : undefined;
  const messages = activeChannelId
    ? getChannelMessages(activeChannelId)
    : [];

  // Find the thread root message and its replies
  const threadRootMessage = activeThreadMessageId
    ? messages.find((m) => m.id === activeThreadMessageId)
    : undefined;
  const threadReplies = activeThreadMessageId
    ? getThreadReplies(activeThreadMessageId)
    : [];

  // Handlers
  const handleChannelSelect = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    setActiveThreadMessageId(null);
    setMobileShowMessages(true);
  }, []);

  const handleThreadClick = useCallback((messageId: string) => {
    setActiveThreadMessageId(messageId);
  }, []);

  const handleThreadClose = useCallback(() => {
    setActiveThreadMessageId(null);
  }, []);

  const handleBackToChannels = useCallback(() => {
    setMobileShowMessages(false);
  }, []);

  return (
    <div className="flex overflow-hidden bg-background" style={{ height: 'calc(100dvh - 57px)' }}>
      {/* ---------------------------------------------------------------- */}
      {/*  Channel List (left panel)                                       */}
      {/* ---------------------------------------------------------------- */}
      <div
        className={`${
          mobileShowMessages ? "hidden lg:flex" : "flex"
        } w-full flex-col border-r border-zinc-200 dark:border-zinc-800 lg:w-72 lg:flex-shrink-0`}
      >
        <ChannelList
          channels={MOCK_CHANNELS}
          activeChannelId={activeChannelId}
          onChannelSelect={handleChannelSelect}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Message Area (center panel)                                     */}
      {/* ---------------------------------------------------------------- */}
      <div
        className={`${
          mobileShowMessages ? "flex" : "hidden lg:flex"
        } min-h-0 flex-1 flex-col overflow-hidden`}
      >
        {activeChannel ? (
          <>
            {/* Mobile back button + channel header */}
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleBackToChannels}
                className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 lg:hidden"
                aria-label="Back to channels"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex-1">
                <ChannelHeader channel={activeChannel} onSearchClick={() => setIsSearchOpen(true)} />
              </div>
            </div>

            {/* Messages + composer */}
            <MessageThread
              initialMessages={messages}
              channelName={activeChannel.displayName}
              onThreadClick={handleThreadClick}
              disabled={isReadOnly}
              isDm={activeChannel.type === "dm"}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Thread Panel (right panel, conditional)                         */}
      {/* ---------------------------------------------------------------- */}
      {threadRootMessage && (
        <ThreadPanel
          rootMessage={threadRootMessage}
          initialReplies={threadReplies}
          onClose={handleThreadClose}
          channelName={activeChannel?.displayName ?? ""}
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/*  Search Overlay                                                  */}
      {/* ---------------------------------------------------------------- */}
      <ChatSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={MOCK_CHANNELS}
      />
    </div>
  );
}
