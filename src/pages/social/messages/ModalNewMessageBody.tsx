import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageBox } from '@/components/MessagingComponents/MessageBox'
import { RecipientInputBox, type RecipientResult } from '@/components/MessagingComponents/RecipientInputBox'
import { startConversation } from '@/services/api/messaging/conversationApi'
import type { ResolvedEmbed } from '@/components/MessagingComponents/MessageBox'

interface ModalNewMessageBodyProps {
  onClose: () => void
   prefilledRecipient?: RecipientResult // optional prop to prefill the recipient (e.g. when clicking "Message" from a profile) 
}

const ModalNewMessageBody = ({ onClose, prefilledRecipient }: ModalNewMessageBodyProps) => {
  const navigate = useNavigate()

  const [selected, setSelected] = useState<RecipientResult | null>(
    prefilledRecipient ?? null  
  )
  const [message, setMessage]       = useState('')
  const [embed, setEmbed]           = useState<ResolvedEmbed | null>(null)
  const [isSending, setIsSending]   = useState(false)
  const [recipientError, setRecipientError] = useState<string | null>(null)
  const [messageError, setMessageError]     = useState<string | null>(null)

  const handleSend = async () => {
    let hasError = false

    if (!selected) {
      setRecipientError('Enter a recipient.')
      hasError = true
    }

    if (!message.trim()) {
      setMessageError('Enter a message.')
      hasError = true
    }

    if (hasError) return

    setRecipientError(null)
    setMessageError(null)
    setIsSending(true)
    try {
      await startConversation({
        recipient_id: selected!.id,
        body: message.trim(),
        ...(embed ? { resource: { type: embed.type, id: embed.id } } : {}),
      })
      onClose()
      navigate(`/messages/${selected!.id}`)
    } catch {
      setMessageError('Failed to send message. Please try again.')
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
        onValueChange={(val) => { setMessage(val); if (val.trim()) setMessageError(null) }}
        onIsEmptyChange={() => {}}
        onEmbedResolved={setEmbed}
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
          className="px-3 py-1 text-sm font-extrabold text-black bg-white rounded"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default ModalNewMessageBody