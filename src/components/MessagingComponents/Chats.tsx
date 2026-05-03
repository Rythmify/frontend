import { ChatProfile } from "@/components/MessagingComponents/ChatProfile";
import { type Conversation } from "@/services/api/messaging/conversationApi";
import Spinner from "@/components/UI/Spinner";
import type { UIEvent } from "react";

interface ChatsProps {
  conversations: Conversation[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  activeConversationId: string | null;
  onSelect: (conversation: Conversation) => void;
  onLoadMore: () => void;
}

export function Chats({
  conversations,
  loading,
  loadingMore,
  hasMore,
  error,
  activeConversationId,
  onSelect,
  onLoadMore,
}: ChatsProps) {
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (!hasMore || loadingMore) return;

    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanceFromBottom <= 120) {
      onLoadMore();
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div data-test="chat-error" className="px-4 py-8 text-sm text-center text-[#666] width-full">
        {error}
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (conversations.length === 0) {
    return (
      <div data-test="chat-empty-state" className="px-4 py-10 text-sm text-center text-[#666] leading-relaxed width-full">
        No conversations yet.
        <br />
        Start one with the{" "}
        <span className="font-semibold text-white">New</span> button above.
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────────────────
  return (
    <div
      data-test="chat-list"
      onScroll={handleScroll}
      className="flex flex-1 min-h-0 flex-col overflow-y-auto width-full"
    >
      {conversations.map((conv) => (
        <ChatProfile
          key={conv.id}
          conversation={conv}
          isActive={conv.id === activeConversationId}
          onClick={() => onSelect(conv)}
        />
      ))}

      {loadingMore && (
        <div data-test="chat-loading-more" className="flex justify-center py-3">
          <Spinner />
        </div>
      )}
    </div>
  );
}
