import { useState } from 'react'
import { Modal } from '@/components/MessagingComponents/Modal'
import ModalNewMessageBody from '@/pages/social/messages/ModalNewMessageBody'
import type { Conversation,Message } from '@/services/api/messaging/conversationApi'

interface MessagingHeaderProps {
  onConversationCreated?: (conversation: Conversation, sentMessage: Message) => void
}

function MessagingHeader({ onConversationCreated }: MessagingHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div data-test="messaging-header" className="container sticky">
      <div className="flex items-center justify-between pt-5 mb-3">
        <h1 className="text-2xl font-bold text-white weight-500">Messages</h1>

        <button
          data-test="new-message-button"
          className="p-2 text-sm font-bold text-black border bg-text-hover rounded-[5px] w-14 hover:text-text-secondary transition-colors cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          New
        </button>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalNewMessageBody
            onClose={() => setIsOpen(false)}
            onConversationCreated={onConversationCreated}
          />
        </Modal>
      </div>
    </div>
  )
}

export default MessagingHeader