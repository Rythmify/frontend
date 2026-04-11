import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
export default function MessageIdPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  // last message received from the participant (not sent by current user)
  // used for the mark as read/unread API call
  const lastReceivedMessage = activeConv
    ? (activeMessages
        .filter((msg) => msg.sender_id === activeConv.participant.id)
        .at(-1) ?? null)
    : null;

  // Helper Function Load Conversation
  const loadConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setActiveMessages([]);
    setLoadingMsgs(true);

    fetchConversation(conv.id)
      .then((res) => {
        const messages = res.data.messages;
        setActiveMessages(messages);

        // mark all unread messages from the participant as read in the DB
        const unreadMessages = messages.filter(
          (msg) =>
            msg.sender_id === conv.participant.id && msg.is_read === false,
        );
        unreadMessages.forEach((msg) => {
          markMessageReadState(conv.id, msg.id, true).catch(() => {});
        });

        // reflect the cleared unread state locally
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
        );
      })
      .catch(() => setError("Could not load messages."))
      .finally(() => setLoadingMsgs(false));
  };

  // 1. Fetch all conversations, then auto-open the first one,Join/leave socket room when active conversation changes
  useEffect(() => {
    setLoadingConvs(true);
    fetchConversations()
      .then((res) => {
        const items = res.data.items;
        setConversations(items);
        if (items.length > 0) {
          loadConversation(items[0]);
        }
      })
      .catch(() => setError("Could not load conversations."))
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
  if (!activeConvId) return;

  joinConversation(activeConvId);

  return () => {
    leaveConversation(activeConvId);
  };
}, [activeConvId]);
//Listen for real-time events from the other person
useEffect(() => {
  const socket = getSocket();
  if (!socket) return;

  // Other person sent a message → append to thread + update sidebar
  socket.on('message:received', ({ conversationId, message }: { conversationId: string; message: Message }) => {
    if (conversationId === activeConvId) {
      setActiveMessages((prev) => [...prev, message]);
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, last_message: message, unread_count: c.unread_count + 1, updated_at: message.created_at }
          : c,
      ),
    );
  });

  // Other person deleted a message → remove from thread
  socket.on('message:removed', ({ conversationId, messageId }: { conversationId: string; messageId: string }) => {
    if (conversationId === activeConvId) {
      setActiveMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  });

  // Other person read your message → update unread count in sidebar
  socket.on('message:read_updated', ({ conversationId, conversationUnreadCount }: { conversationId: string; conversationUnreadCount: number }) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, unread_count: conversationUnreadCount }
          : c,
      ),
    );
  });

  // Other person is typing → show indicator
  socket.on('message:typing', ({ conversationId }: { conversationId: string }) => {
    if (conversationId === activeConvId) {
      setIsTyping(true);
    }
  });

  // Other person stopped typing → hide indicator
  socket.on('message:stop_typing', ({ conversationId }: { conversationId: string }) => {
    if (conversationId === activeConvId) {
      setIsTyping(false);
    }
  });

  return () => {
    socket.off('message:received');
    socket.off('message:removed');
    socket.off('message:read_updated');
    socket.off('message:typing');
    socket.off('message:stop_typing');
  };
}, [activeConvId]);

  // 2. On message sent — append to messages + update chat profile preview
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

  // 3. On conversation deleted — remove from list and navigate
  const handleConversationDeleted = (deletedId: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== deletedId);
      if (remaining.length > 0) {
        const next = remaining[0];
        navigate(`/messages/${next.participant.id}`);
        loadConversation(next);
      } else {
        setActiveConvId(null);
        setActiveMessages([]);
        navigate("/messages");
      }
      return remaining;
    });
  };

  // 4. On conversation selected from list
  const handleSelectConversation = (conv: Conversation) => {
    navigate(`/messages/${conv.participant.id}`);
    loadConversation(conv);
  };

  // 5. On read state toggled — update unread_count in list to show/hide dot
  const handleReadStateChange = (isUnread: boolean) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, unread_count: isUnread ? 1 : 0 } : c,
      ),
    );
  };

  return (
<div
  data-test="message-id-page"
  className="container flex px-4 py-6 md:px-8 lg:px-20 h-[calc(100vh-64px)]"
>
  {/* ── Left: conversation list — fixed, doesn't scroll with page ── */}
  <div className="flex flex-col w-85 flex-shrink-0 sticky top-0 h-[calc(100vh-64px)] overflow-hidden">
    <MessagingHeader />
    <Chats
      conversations={conversations}
      loading={loadingConvs}
      error={error}
      activeConversationId={activeConvId}
      onSelect={handleSelectConversation}
    />
  </div>

  {/* ── Right: active conversation — scrolls naturally ── */}
  <div className="flex flex-col flex-1 ml-6 min-w-0">
    {activeConv ? (
      <>
        {/* Header stays sticky at top */}
        <div className="sticky top-0 bg-bg z-10">
          <ConversationHeader
            conversationId={activeConv.id}
            reciepiantId={activeConv.participant.id}
            recipientName={activeConv.participant.username}
            lastMessageId={lastReceivedMessage?.id ?? null}
            onReadStateChange={handleReadStateChange}
            onDeleted={handleConversationDeleted}
          />
        </div>

        <SendMessageForm
          conversationId={activeConv.id}
          existingMessages={activeMessages}
          loadingMessages={loadingMsgs}
          onMessageSent={handleMessageSent}
          isTyping={isTyping}
          ParticipantInfo={{
            display_name: activeConv.participant.display_name,
            profile_picture: activeConv.participant.profile_picture,
          }}
        />
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