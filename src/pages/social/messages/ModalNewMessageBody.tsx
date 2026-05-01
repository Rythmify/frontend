import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageBox } from '@/components/MessagingComponents/MessageBox'
import { RecipientInputBox, type RecipientResult } from '@/components/MessagingComponents/RecipientInputBox'
import {
  startConversation,
  sendMessage,
  type Conversation,
  type Message, 
} from '@/services/api/messaging/conversationApi'
import type { ResolvedEmbed } from '@/components/MessagingComponents/MessageBox'

interface ModalNewMessageBodyProps {
  onClose: () => void
  prefilledRecipient?: RecipientResult
  onConversationCreated?: (conversation: Conversation, sentMessage: Message) => void
}

const ModalNewMessageBody = ({
  onClose,
  prefilledRecipient,
  onConversationCreated,
}: ModalNewMessageBodyProps) => {
  const navigate = useNavigate()

  const [selected, setSelected]             = useState<RecipientResult | null>(prefilledRecipient ?? null)
  const [message, setMessage]               = useState('')
  const [embeds, setEmbeds]                 = useState<ResolvedEmbed[]>([])
  const [isSending, setIsSending]           = useState(false)
  const [boxKey, setBoxKey]                 = useState(0)
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [messageError, setMessageError]     = useState<string | null>(null)

  const handleSend = async () => {
    let hasError = false

    if (!selected) {
      setRecipientError('Enter a recipient.')
      hasError = true
    }

    if (!message.trim() && embeds.length === 0) {
      setMessageError('Enter a message or paste a track/playlist link.')
      hasError = true
    }

    if (hasError) return

    setRecipientError(null)
    setMessageError(null)
    setIsSending(true)

    try {
  let conversation: Conversation | null = null
  let firstMessage: Message | null = null

  if (embeds.length === 0) {
    const res = await startConversation({
      recipient_id: selected!.id,
      body: message.trim(),
    })
    const typed = res as { data?: { conversation?: Conversation; message?: Message } }
    conversation = typed.data?.conversation ?? null
    firstMessage = typed.data?.message ?? null
  } else {
    const firstRes = await startConversation({
      recipient_id: selected!.id,
      ...(message.trim() ? { body: message.trim() } : {}),
      resource: { type: embeds[0].type, id: embeds[0].id },
    })
    const typed = firstRes as { data?: { conversation?: Conversation; message?: Message } }
    conversation = typed.data?.conversation ?? null
    firstMessage = typed.data?.message ?? null

    const conversationId = conversation?.id
    if (conversationId && embeds.length > 1) {
      for (let i = 1; i < embeds.length; i++) {
        await sendMessage(conversationId, {
          resource: { type: embeds[i].type, id: embeds[i].id },
        })
      }
    }
  }

  setMessage('')
  setEmbeds([])
  setBoxKey((k) => k + 1)

  // Guard: only call back if we have a valid conversation
  if (conversation && firstMessage) {
    onConversationCreated?.(conversation, firstMessage)
  } else if (conversation) {
    // Message shape missing — still navigate but without optimistic append
    onConversationCreated?.(conversation, null as unknown as Message)
  }

  onClose()

  const targetId = conversation?.id ?? selected!.id
  navigate(`/messages/${targetId}`)
    } catch (err: unknown) {
      const axiosError = err as { response?: { status: number } }
      if (axiosError.response?.status === 403) {
        setMessageError('Unable to send message to this user.')
      } else {
        setMessageError('Failed to send message. Please try again.')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">New message</h2>

      {/* ── To field ── */}
      <label className="block mb-1 text-sm text-white">
        To <span className="text-red-500">*</span>
      </label>

      <div className="mb-4">
        {prefilledRecipient ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-border rounded">
            <span className="text-white text-sm font-semibold">
              {prefilledRecipient.display_name || prefilledRecipient.username}
            </span>
          </div>
        ) : (
          <RecipientInputBox
            onSelect={(user) => { setSelected(user); setRecipientError(null) }}
            onClear={() => setSelected(null)}
            error={recipientError}
          />
        )}
      </div>

      {/* ── Message field ── */}
      <label className="block mb-1 text-sm text-white">
        Write your message and add tracks or playlists{' '}
        <span className="text-red-500">*</span>
      </label>

      <MessageBox
        key={boxKey}
        onValueChange={(val) => { setMessage(val); if (val.trim()) setMessageError(null) }}
        onIsEmptyChange={(empty) => { if (empty) setMessageError(null) }}
        onEmbedsResolved={setEmbeds}
        hasError={!!messageError}
      />

      {messageError && (
        <p className="mt-1 text-sm text-red-500">{messageError}</p>
      )}

      {/* ── Send ── */}
      <div className="flex justify-end mt-4">
        <button
          data-test="send-message-button"
          onClick={handleSend}
          disabled={isSending}
          className="px-5 py-2 text-sm font-semibold text-black transition-colors bg-white rounded-lg hover:text-[color:#838383] disabled:opacity-50"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default ModalNewMessageBody