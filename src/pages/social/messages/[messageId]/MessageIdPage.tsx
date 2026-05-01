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
  const [hasPrevPage, setHasPrevPage]       = useState(false);
  const [currentPage, setCurrentPage]       = useState(1);
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

  // ─── Load a conversation: fetch page 1 to get total_pages, then jump to last ──
  const loadConversation = useCallback(
    async (conv: Conversation) => {
      setActiveConvId(conv.id);
      useMessagingStore.setState({ activeConversationId: conv.id });
      setActiveMessages([]);
      setCurrentPage(1);
      setHasPrevPage(false);
      setLoadingMsgs(true);

      try {
        // First call: discover total_pages
        const firstRes = await fetchConversation(conv.id, MSG_LIMIT, 1);
        const { total_pages } = firstRes.data.pagination;

        let messages   = firstRes.data.messages;
        let landedPage = 1;

        // If there are multiple pages, jump straight to the last one (newest messages)
        if (total_pages > 1) {
          const lastRes = await fetchConversation(conv.id, MSG_LIMIT, total_pages);
          messages   = lastRes.data.messages;
          landedPage = total_pages;
        }

        setActiveMessages(messages);
        setCurrentPage(landedPage);
        setHasPrevPage(landedPage > 1);

        // Mark unread messages as read
        const unread = messages.filter(
          (msg) => msg.sender_id === conv.participant.id && !msg.is_read,
        );

        if (unread.length > 0) {
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
          );
          refreshUnreadCount();

          for (const msg of unread) {
            markMessageReadState(conv.id, msg.id, true)
              .then((res) => {
                const updatedUnreadCount: number =
                  (res as any)?.data?.conversation_unread_count ?? 0;
                emitMessageRead(conv.id, msg.id, true, updatedUnreadCount);
              })
              .catch(() => {
                emitMessageRead(conv.id, msg.id, true, 0);
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

  // ─── Load previous page (older messages) — prepend on scroll to top ───────
  const loadMoreMessages = useCallback(() => {
    if (!activeConvId || loadingMsgs || !hasPrevPage) return;
    setLoadingMsgs(true);

    const prevPage = currentPage - 1;

    fetchConversation(activeConvId, MSG_LIMIT, prevPage)
      .then((res) => {
        const { messages } = res.data;
        setActiveMessages((prev) => [...messages, ...prev]);
        setCurrentPage(prevPage);
        setHasPrevPage(prevPage > 1);
      })
      .catch(() => setError("Could not load more messages."))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvId, loadingMsgs, hasPrevPage, currentPage]);

  // ─── 1. Initial fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    setLoadingConvs(true);
    fetchConversations()
      .then((res) => {
        const items = res.data.items;
        setConversations(items);
        if (items.length === 0) return;

        const target = messageId
          ? (items.find((c) => c.id === messageId || c.participant.id === messageId) ?? items[0])
          : items[0];

        loadConversation(target);
      })
      .catch(() => setError("Could not load conversations."))
      .finally(() => setLoadingConvs(false));
  }, []);

  // ─── 2. Socket room management ────────────────────────────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    joinConversation(activeConvId);
    return () => {
      leaveConversation(activeConvId);
    };
  }, [activeConvId]);

  // ─── 3. Socket event listeners ────────────────────────────────────────────
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
                unread_count:
                  conversationId === activeConvId ? c.unread_count : c.unread_count + 1,
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
          c.id === conversationId ? { ...c, unread_count: conversationUnreadCount } : c,
        ),
      );
    };

    const onTyping = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === activeConvId) setIsTyping(true);
    };

    const onStopTyping = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === activeConvId) setIsTyping(false);
    };

    const onConnect = () => {
      if (activeConvId) joinConversation(activeConvId);
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

  // ─── 4. Message sent ──────────────────────────────────────────────────────
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

  // ─── 6. Conversation selected ─────────────────────────────────────────────
  const handleSelectConversation = (conv: Conversation) => {
    navigate(`/messages/${conv.id}`);
    loadConversation(conv);
    setShowMobileChat(true);
  };

  // ─── 7. Read state toggled ────────────────────────────────────────────────
  const handleReadStateChange = (isUnread: boolean) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, unread_count: isUnread ? 1 : 0 } : c,
      ),
    );
  };

  // ─── New conversation created from modal ──────────────────────────────────
const handleConversationCreated = useCallback(
  (conversation: Conversation, sentMessage: Message | null) => {
    if (!conversation) return

    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conversation.id)

      const updatedConv: Conversation = {
        ...(exists ?? conversation),
        // Manually set last_message from the actual sent message
        last_message: sentMessage
          ? {
              id:         sentMessage.id,
              body:       sentMessage.body ?? null,
              embed_type: sentMessage.embed_type ?? null,
              embed_id:   sentMessage.embed_id ?? null,
              sender_id:  sentMessage.sender_id,
              is_read:    sentMessage.is_read,
              created_at: sentMessage.created_at,
            }
          : (exists?.last_message ?? conversation.last_message),
        updated_at: sentMessage?.created_at ?? conversation.updated_at,
        unread_count: exists?.unread_count ?? 0,
      }

      // Remove from current position and prepend → moves to top
      const without = prev.filter((c) => c.id !== conversation.id)
      return [updatedConv, ...without]
    })

    if (conversation.id === activeConvId && sentMessage) {
      setActiveMessages((prev) => [...prev, sentMessage])
    } else {
      loadConversation(conversation)
    }

    setShowMobileChat(true)
  },
  [loadConversation, activeConvId],
)

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      data-test="message-id-page"
      className="container flex px-4 py-6 md:px-8 lg:px-20 h-[calc(100vh-64px)] overflow-hidden"
    >
      <div
        className={`${
          showMobileChat ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-85 shrink-0 sticky top-0 h-[calc(100vh-64px)]`}
      >
        <MessagingHeader onConversationCreated={handleConversationCreated}/>
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

            <div className="flex-1 min-h-0">
              <SendMessageForm
                conversationId={activeConv.id}
                existingMessages={activeMessages}
                loadingMessages={loadingMsgs}
                hasMoreMessages={hasPrevPage}
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