import { useState, useEffect, useCallback } from "react";
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
import {
  joinConversation,
  leaveConversation,
  getSocket,
  emitMessageRead,
} from "@/services/api/messaging/socketService";
import { useMessagingStore } from "@/stores/messaging.store";

const MSG_LIMIT = 50;

export default function MessageIdPage() {
  const navigate = useNavigate();
  const { messageId } = useParams<{ messageId: string }>();

  const [conversations, setConversations]   = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId]     = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs]     = useState(true);
  const [loadingMsgs, setLoadingMsgs]       = useState(false);
  const [hasMoreMsgs, setHasMoreMsgs]       = useState(false);
  const [msgOffset, setMsgOffset]           = useState(0);
  const [error, setError]                   = useState<string | null>(null);
  const [isTyping, setIsTyping]             = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const { refreshUnreadCount } = useMessagingStore();

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  const lastReceivedMessage = activeConv
    ? (activeMessages
        .filter((msg) => msg.sender_id === activeConv.participant.id)
        .at(-1) ?? null)
    : null;

  // ─── Load a conversation from scratch (latest messages first) ───────────
  const loadConversation = useCallback(
    async (conv: Conversation) => {
      setActiveConvId(conv.id);
      useMessagingStore.setState({ activeConversationId: conv.id });
      setActiveMessages([]);
      setMsgOffset(0);
      setHasMoreMsgs(false);
      setLoadingMsgs(true);

      try {
        // First pass: get total to compute offset for the latest page
        const totalRes = await fetchConversation(conv.id, 1, 0);
        const total = totalRes.data.pagination.total_items;
        const initialOffset = Math.max(0, total - MSG_LIMIT);

        // Second pass: load the latest messages
        const res = await fetchConversation(conv.id, MSG_LIMIT, initialOffset);
        const { messages } = res.data;

        setActiveMessages(messages);
        setMsgOffset(initialOffset);
        setHasMoreMsgs(initialOffset > 0);

        // Mark unread messages as read and notify the other participant via socket
        const unread = messages.filter(
          (msg) => msg.sender_id === conv.participant.id && !msg.is_read,
        );

        if (unread.length > 0) {
          // Optimistic: update local unread_count immediately
          const newConvUnreadCount = 0;
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, unread_count: newConvUnreadCount } : c)),
          );
          refreshUnreadCount();

          // Persist read-state for every unread message and emit socket event
          // so the other participant's UI decrements their badge in real time.
          for (const msg of unread) {
            markMessageReadState(conv.id, msg.id, true)
              .then((res) => {
                // The API response should include the updated conversation unread count.
                // Fall back to 0 if the field is missing.
                const updatedUnreadCount: number =
                  (res as any)?.data?.conversation_unread_count ?? newConvUnreadCount;
                emitMessageRead(conv.id, msg.id, true, updatedUnreadCount);
              })
              .catch(() => {
                // HTTP failed — still emit with our best-guess count so the
                // other side's badge doesn't stay stale indefinitely.
                emitMessageRead(conv.id, msg.id, true, newConvUnreadCount);
              });
          }
        } else {
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
          );
          refreshUnreadCount();
        }
      } catch {
        setError("Could not load messages.");
      } finally {
        setLoadingMsgs(false);
      }
    },
    [refreshUnreadCount],
  );

  // ─── Load more (older) messages by prepending ────────────────────────────
  const loadMoreMessages = useCallback(() => {
    if (!activeConvId || loadingMsgs || !hasMoreMsgs) return;
    setLoadingMsgs(true);

    const newOffset = Math.max(0, msgOffset - MSG_LIMIT);
    const loadCount = msgOffset - newOffset;

    fetchConversation(activeConvId, loadCount, newOffset)
      .then((res) => {
        const { messages } = res.data;
        setActiveMessages((prev) => [...messages, ...prev]);
        setMsgOffset(newOffset);
        setHasMoreMsgs(newOffset > 0);
      })
      .catch(() => setError("Could not load more messages."))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvId, loadingMsgs, hasMoreMsgs, msgOffset]);

  // ─── 1. Initial fetch: all conversations + open from URL or first ────────
  useEffect(() => {
    setLoadingConvs(true);
    fetchConversations()
      .then((res) => {
        const items = res.data.items;
        setConversations(items);
        if (items.length === 0) return;

        // open conversation matching URL param, fallback to first
        const target = messageId
          ? (items.find((c) => c.id === messageId || c.participant.id === messageId) ?? items[0])
          : items[0];

        loadConversation(target);
      })
      .catch(() => setError("Could not load conversations."))
      .finally(() => setLoadingConvs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── 2. Socket room management ───────────────────────────────────────────
  //
  // joinConversation stores the room name in socketService so that
  // connectSocket's `connect` handler can re-join it automatically after
  // any reconnect. We still call joinConversation here so it fires on the
  // initial mount and whenever the active conversation changes.
  useEffect(() => {
    if (!activeConvId) return;
    joinConversation(activeConvId);
    return () => {
      leaveConversation(activeConvId);
    };
  }, [activeConvId]);

  // ─── 3. Socket event listeners ───────────────────────────────────────────
  //
  // We also listen for the socket `connect` event so that we re-join the
  // active room if the socket drops and reconnects while the user is on this
  // page (the room join is already handled by socketService, but we want to
  // make sure any in-flight state is correct on the React side too).
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onReceived = ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: Message;
    }) => {
      if (conversationId === activeConvId) {
        setActiveMessages((prev) => [...prev, message]);

        // Auto-mark incoming messages as read and notify the sender
        markMessageReadState(conversationId, message.id, true)
          .then((res) => {
            const updatedUnreadCount: number = (res as any)?.data?.conversation_unread_count ?? 0;
            emitMessageRead(conversationId, message.id, true, updatedUnreadCount);
          })
          .catch(() => {
            emitMessageRead(conversationId, message.id, true, 0);
          });
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                last_message: message,
                // Only increment badge for conversations the user isn't looking at
                unread_count:
                  conversationId === activeConvId
                    ? c.unread_count
                    : c.unread_count + 1,
                updated_at: message.created_at,
              }
            : c,
        ),
      );
    };

    const onRemoved = ({
      conversationId,
      messageId,
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      if (conversationId === activeConvId) {
        setActiveMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    };

    const onReadUpdated = ({
      conversationId,
      conversationUnreadCount,
    }: {
      conversationId: string;
      conversationUnreadCount: number;
    }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, unread_count: conversationUnreadCount }
            : c,
        ),
      );
    };

    const onTyping = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === activeConvId) setIsTyping(true);
    };

    const onStopTyping = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === activeConvId) setIsTyping(false);
    };

    // On reconnect, re-join the active room (belt-and-suspenders alongside
    // the join in socketService's connect handler).
    const onConnect = () => {
      if (activeConvId) {
        joinConversation(activeConvId);
      }
    };

    socket.on("connect", onConnect);
    socket.on("message:received", onReceived);
    socket.on("message:removed", onRemoved);
    socket.on("message:read_updated", onReadUpdated);
    socket.on("message:typing", onTyping);
    socket.on("message:stop_typing", onStopTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("message:received", onReceived);
      socket.off("message:removed", onRemoved);
      socket.off("message:read_updated", onReadUpdated);
      socket.off("message:typing", onTyping);
      socket.off("message:stop_typing", onStopTyping);
    };
  }, [activeConvId]);

  // ─── 4. Message sent ─────────────────────────────────────────────────────
  const handleMessageSent = (msg: Message) => {
    setActiveMessages((prev) => [...prev, msg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, last_message: msg, updated_at: msg.created_at }
          : c,
      ),
    );
  };

  // ─── 5. Conversation deleted ──────────────────────────────────────────────
  const handleConversationDeleted = (deletedId: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== deletedId);
      if (remaining.length > 0) {
        const next = remaining[0];
        navigate(`/messages/${next.id}`);
        loadConversation(next);
      } else {
        setActiveConvId(null);
        useMessagingStore.setState({ activeConversationId: null });
        setActiveMessages([]);
        navigate("/messages");
      }
      return remaining;
    });
  };

  // ─── 6. Conversation selected from list ───────────────────────────────────
  const handleSelectConversation = (conv: Conversation) => {
    navigate(`/messages/${conv.id}`);
    loadConversation(conv);
    setShowMobileChat(true);
  };

  // ─── 7. Read state toggled from ConversationHeader ───────────────────────
  const handleReadStateChange = (isUnread: boolean) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, unread_count: isUnread ? 1 : 0 } : c,
      ),
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      data-test="message-id-page"
      className="container flex px-4 py-6 md:px-8 lg:px-20 h-[calc(100vh-64px)] overflow-hidden"
    >
      {/* Conversation list sidebar */}
      <div
        className={`${
          showMobileChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-85 shrink-0 sticky top-0 h-[calc(100vh-64px)]`}
      >
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

      {/* Active conversation panel */}
      <div
        className={`${
          showMobileChat ? "flex" : "hidden md:flex"
        } flex-col flex-1 md:ml-6 min-w-0 min-h-0`}
      >
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

            {/* SendMessageForm owns the scroll container */}
            <div className="flex-1 min-h-0">
              <SendMessageForm
                conversationId={activeConv.id}
                existingMessages={activeMessages}
                loadingMessages={loadingMsgs}
                hasMoreMessages={hasMoreMsgs}
                onLoadMore={loadMoreMessages}
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