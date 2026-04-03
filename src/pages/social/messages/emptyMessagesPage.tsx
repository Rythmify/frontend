import { useState } from 'react'
import { Modal } from '@/components/MessagingComponents/Modal'
import MessagingHeader from '@/components/MessagingComponents/MessagingHeader'
import ModalNewMessageBody from './ModalNewMessageBody'

const MessagesPage = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full py-6">

      <MessagingHeader />

      {/* Empty state */}
      <div className="container flex flex-col items-center justify-center flex-grow w-full text-center pt-43">
        <p className="font-semibold text-white text-s">
          You have no messages
        </p>

        <p className="mt-2 text-sm text-white">
          Send someone a message and make their day.
          <button
            onClick={() => setIsOpen(true)}
            className="ml-1 text-[#699FFF] hover:underline"
          >
            Write one
          </button>
        </p>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalNewMessageBody onClose={() => setIsOpen(false)} />
      </Modal>

    </div>
  )
}

export default MessagesPage