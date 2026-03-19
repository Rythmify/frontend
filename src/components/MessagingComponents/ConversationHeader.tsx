import React from 'react'
import { useState } from 'react'
import { Modal } from './Modal'
import ModalNewMessageBody from '@/pages/social/messages/ModalNewMessageBody'
import  DeleteConversationButton from '@/components/MessagingComponents/DeleteConversationButton'
interface User {
    id: string
    username: string
    display_name: string
    profile_picture: string | null
}

interface ConversationHeaderPropsimport
 {
reciepiantId:string

conversationId:string
}

const ConversationHeader = ({reciepiantId, conversationId }: ConversationHeaderPropsimport) => {
const [isOpen, setIsOpen] = useState(false)
    
  return (
    <div data-test="conversation-header" className='flex space-between'>
        <div className='flex text-white space-between '>
           <button 
          data-test="conversation-new-button"
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsOpen(true)}
        >
        Profile
        </button>
        <button 
          data-test="conversation-block-button"
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsOpen(true)}
        >
          Block
        </button>
         <button 
          data-test="conversation-report-button"
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsOpen(true)}
        >
          Report
        </button>
        </div>
        <div className='flex '>
           <DeleteConversationButton conversationId={conversationId} participantId={reciepiantId} /> 
        </div>
    </div>
  )
}

export default ConversationHeader