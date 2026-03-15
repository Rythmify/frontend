import React from 'react'
import { useState } from 'react'
import { Modal } from '../../../../components/MessagingComponents/Modal';
// import ModalBlockBody from '../ModalBlockBody';
export default function MessageIdPage() {
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
          Block
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <h2 className="mb-5 text-2xl font-bold">Block username</h2>
       {/* <ModalBlockBody /> */}
      </Modal>
      </div>
  )
}
// import React from 'react'

// const MessageIdPage = () => {
//   return (
//     <div>MessageIdPage</div>
//   )
// }

// export default MessageIdPage