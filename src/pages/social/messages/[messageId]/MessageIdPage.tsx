import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chats } from "@/components/MessagingComponents/Chats";
import MessagingHeader from "@/components/MessagingComponents/MessagingHeader";
import {
  fetchConversations,
  fetchConversation,
  markMessageReadState,
  type Conversation,
  type Message,
} from "@/services/api/messaging/conversationApi";
import ConversationHeader from "@/components/MessagingComponents/ConversationHeader";
import SendMessageForm from "@/components/MessagingComponents/SendMessageForm";
import { joinConversation, leaveConversation, getSocket } from '@/services/api/messaging/socketService';
import { useMessagingStore } from '@/stores/messaging.store';

const PAGE_SIZE = 50;

export default function MessageIdPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]     = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [loadingMore, setLoadingMore]       = useState(false);
  // oldest page we've fetched so far — we go downward (last page → page 1)
  const [oldestPageFetched, setOldestPageFetched] = useState(1);
  const [hasMorePages, setHasMorePages]           = useState(false);
  const [error, setError]                         = useState<string | null>(null);
  const [isTyping, setIsTyping]                   = useState(false);
  const [showMobileChat, setShowMobileChat]       = useState(false);

  const { refreshUnreadCount } = useMessagingStore();

  // Ref to the scrollable message container
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const lastReceivedMessage = activeConv
    ? (activeMessages.filter((m) => m.sender_id === activeConv.participant.id).at(-1) ?? null)
    : null;

  // ── Scroll helpers ──────────────────────────────────────────────────────────

  const scrollToBottom = () => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  // Preserve scroll position when prepending older messages at the top
  const preserveScrollAfter = (fn: () => void) => {
    const el = scrollContainerRef.current;
    if (!el) { fn(); return; }
    const prevScrollHeight = el.scrollHeight;
    fn();
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight - prevScrollHeight;
    });
  };

  // ── Mark unread messages as read ────────────────────────────────────────────

  const markConversationRead = (conv: Conversation, messages: Message[]) => {
    if (conv.unread_count === 0) return;

    const unread = messages.filter(
      (m) => m.sender_id === conv.participant.id && !m.is_read,
    );
    unread.forEach((m) => {
      markMessageReadState(conv.id, m.id, true).catch(() => {});
    });

    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
    );
    refreshUnreadCount();
  };

  // ── Load a conversation: fetch the LAST page first so user sees newest ──────
  // The API is oldest-to-newest, so:
  //   - Step 1: fetch page 1 just to discover total_pages
  //   - Step 2: if total_pages > 1, fetch the last page for display
  //   - Scrolling UP loads progressively older pages (last-1, last-2, …)

  const loadConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setActiveMessages([]);
    setOldestPageFetched(1);
    setHasMorePages(false);
    setLoadingMsgs(true);

    // Fetch page 1 to get total_pages, then jump to last page if needed
    fetchConversation(conv.id, 1, PAGE_SIZE)
      .then(async (res) => {
        const { messages, pagination } = res.data;
        const { total_pages } = pagination;

        if (total_pages <= 1) {
          // Everything fits on one page — we're done
          setActiveMessages(messages);
          setOldestPageFetched(1);
          setHasMorePages(false);
          requestAnimationFrame(scrollToBottom);
          markConversationRead(conv, messages);
        } else {
          // Fetch the last page so the user sees the most recent messages
          const lastRes = await fetchConversation(conv.id, total_pages, PAGE_SIZE);
          setActiveMessages(lastRes.data.messages);
          setOldestPageFetched(total_pages);
          // There are pages before the last one still to load upward
          setHasMorePages(total_pages > 1);
          requestAnimationFrame(scrollToBottom);
          markConversationRead(conv, lastRes.data.messages);
        }
      })
      .catch(() => setError("Could not load messages."))
      .finally(() => setLoadingMsgs(false));
  };

  // ── Load an older page when the user scrolls to the top ────────────────────

  const loadOlderMessages = useCallback(() => {
    if (!activeConvId || loadingMore || !hasMorePages) return;

    const pageToFetch = oldestPageFetched - 1;
    if (pageToFetch < 1) { setHasMorePages(false); return; }

    setLoadingMore(true);

    fetchConversation(activeConvId, pageToFetch, PAGE_SIZE)
      .then((res) => {
        const { messages: olderMessages } = res.data;
        setOldestPageFetched(pageToFetch);
        setHasMorePages(pageToFetch > 1);
        // Prepend and keep viewport anchored
        preserveScrollAfter(() => {
          setActiveMessages((prev) => [...olderMessages, ...prev]);
        });
      })
      .catch(() => {/* silently ignore — user can scroll again */})
      .finally(() => setLoadingMore(false));
  }, [activeConvId, loadingMore, hasMorePages, oldestPageFetched]);

  // ── Scroll-to-top detection ─────────────────────────────────────────────────

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (el.scrollTop <= 80 && !loadingMore && hasMorePages) {
        loadOlderMessages();
      }
    };

    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadOlderMessages, loadingMore, hasMorePages]);

  // ── Boot ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    setLoadingConvs(true);
    fetchConversations()
      .then((res) => {
        const items = res.data.items;
        setConversations(items);
        if (items.length === 0) return;

        const target = conversationId
          ? items.find((c) => c.id === conversationId) ?? items[0]
          : items[0];

        loadConversation(target);
      })
      .catch(() => setError("Could not load conversations."))
      .finally(() => setLoadingConvs(false));
  }, []);

  // ── Socket room ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeConvId) return;
    joinConversation(activeConvId);
    return () => { leaveConversation(activeConvId); };
  }, [activeConvId]);

 // ── Socket events ─────────────────────────────────────────────────────────

useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  const onReceived = ({ conversationId, message }: { conversationId: string; message: Message }) => {
    if (conversationId === activeConvId) {
      setActiveMessages((prev) => [...prev, message]);
      requestAnimationFrame(scrollToBottom);
      // Mark as read immediately since user is looking at the conversation
      const activeConv = conversations.find(c => c.id === conversationId);
      if (activeConv) markConversationRead(activeConv, [message]);
    }
    // Always update the sidebar — moves this conversation to top
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              last_message: message,
              unread_count: conversationId === activeConvId ? 0 : c.unread_count + 1,
              updated_at: message.created_at,
            }
          : c,
      );
      // Sort so the most recently updated conversation is first
      return [...updated].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  };

  const onRemoved = ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
    if (conversationId === activeConvId) {
      setActiveMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  const onReadUpdated = ({ conversationId, conversationUnreadCount }: { conversationId: string; conversationUnreadCount: number }) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: conversationUnreadCount } : c)),
    );
  };

  const onTyping     = ({ conversationId }: { conversationId: string }) => { if (conversationId === activeConvId) setIsTyping(true);  };
  const onStopTyping = ({ conversationId }: { conversationId: string }) => { if (conversationId === activeConvId) setIsTyping(false); };

  socket.on('message:received',     onReceived);
  socket.on('message:removed',      onRemoved);
  socket.on('message:read_updated', onReadUpdated);
  socket.on('message:typing',       onTyping);
  socket.on('message:stop_typing',  onStopTyping);

  return () => {
    socket.off('message:received',     onReceived);
    socket.off('message:removed',      onRemoved);
    socket.off('message:read_updated', onReadUpdated);
    socket.off('message:typing',       onTyping);
    socket.off('message:stop_typing',  onStopTyping);
  };
}, [activeConvId]); // conversations removed from deps to avoid stale closure issues

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleMessageSent = (msg: Message) => {
    setActiveMessages((prev) => [...prev, msg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, last_message: msg, updated_at: msg.created_at }
          : c,
      ),
    );
    requestAnimationFrame(scrollToBottom);
  };

  const handleConversationDeleted = (deletedId: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== deletedId);
      if (remaining.length > 0) {
        const next = remaining[0];
        navigate(`/messages/${next.id}`);
        loadConversation(next);
      } else {
        setActiveConvId(null);
        setActiveMessages([]);
        navigate("/messages");
      }
      return remaining;
    });
  };

  const handleSelectConversation = (conv: Conversation) => {
    navigate(`/messages/${conv.id}`);
    loadConversation(conv);
    setShowMobileChat(true);
  };

  const handleReadStateChange = (isUnread: boolean) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, unread_count: isUnread ? 1 : 0 } : c,
      ),
    );
    refreshUnreadCount();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      data-test="message-id-page"
      className="container flex px-4 py-6 md:px-8 lg:px-20 h-[calc(100vh-64px)] overflow-hidden"
    >
      {/* Sidebar */}
      <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-85 shrink-0 sticky top-0 h-[calc(100vh-64px)]`}>
        <MessagingHeader />
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Chats
            conversations={conversations}
            loading={loadingConvs}
            error={error}
            activeConversationId={activeConvId}
            onSelect={handleSelectConversation}
          />
        </div>
      </div>

      {/* Chat panel */}
      <div className={`${showMobileChat ? 'flex' : 'hidden md:flex'} flex-col flex-1 md:ml-6 min-w-0`}>
        {activeConv ? (
          <>
            <div className="shrink-0 bg-bg z-10">
              <ConversationHeader
                conversationId={activeConv.id}
                reciepiantId={activeConv.participant.id}
                recipientName={activeConv.participant.username}
                lastMessageId={lastReceivedMessage?.id ?? null}
                onReadStateChange={handleReadStateChange}
                onDeleted={handleConversationDeleted}
                onBack={() => setShowMobileChat(false)}
              />
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">

              {/* Older messages spinner — pinned at top of scroll area */}
              {loadingMore && (
                <div className="text-xs text-[#666] text-center py-2">
                  Loading older messages…
                </div>
              )}

              {/* Beginning of conversation hint */}
              {!loadingMore && !hasMorePages && activeMessages.length > 0 && (
                <div className="text-xs text-[#444] text-center py-2">
                  Beginning of conversation
                </div>
              )}

              <SendMessageForm
                conversationId={activeConv.id}
                existingMessages={activeMessages}
                loadingMessages={loadingMsgs}
                onMessageSent={handleMessageSent}
                isTyping={isTyping}
                ParticipantInfo={{
                  display_name: activeConv.participant.display_name,
                  profile_picture: activeConv.participant.avatar,
                }}
              />
            </div>
          </>
        ) : (
          !loadingConvs && (
            <div className="flex items-center justify-center flex-1 text-sm text-[#666]">
              Select a conversation to start messaging.
            </div>
          )
        )}
      </div>
    </div>
  );
}