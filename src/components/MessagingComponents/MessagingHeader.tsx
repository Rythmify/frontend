import React from 'react'
import { useState } from 'react'
import { Modal } from '@/components/MessagingComponents/Modal';
import ModalNewMessageBody from '@/pages/social/messages/ModalNewMessageBody';
function MessagingHeader() {
 const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center justify-between pt-5 mb-10 w-0.5 gap-49 ">
        <h1 className="text-2xl font-bold text-white weight-500">
          Messages
        </h1>

        <button 
         
          className=" p-2 text-sm font-bold text-black border bg-text-hover  rounded-[5px] w-14 "
          onClick={() => setIsOpen(true)}
        >
          New
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
       <ModalNewMessageBody />
      </Modal>
      </div>
  )
}

export default MessagingHeader