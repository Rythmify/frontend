import { useState } from 'react'
import { Modal } from '@/components/MessagingComponents/Modal'
import ModalNewMessageBody from '@/pages/social/messages/ModalNewMessageBody'

function MessagingHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="container sticky">
    <div className="flex items-center justify-between pt-5 mb-3  ">
      <h1 className="text-2xl font-bold text-white weight-500">Messages</h1>

      <button
        className="p-2 text-sm font-bold text-black border bg-text-hover rounded-[5px] w-14 hover:text-text-secondary transition-colors cursor-pointer "
        onClick={() => setIsOpen(true)}
      >
        New
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalNewMessageBody onClose={() => setIsOpen(false)} />
      </Modal>
    </div>
    </div>
  )
}

export default MessagingHeader