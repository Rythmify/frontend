import React from 'react'
import { useState } from 'react'
import { Modal } from './Modal'
import ModalNewMessageBody from '@/pages/social/messages/ModalNewMessageBody'

interface ConversationHeaderPropsimport
 {
reciepiant:User
isOpen:boolean
}
const ConversationHeader = () => {
const [isOpen, setIsOpen] = useState(false)
    
  return (
    <div className='flex '>
        <div className='flex text-white space-between '>
           <button 
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsOpen(true)}
        >
          New
        </button>
        <button 
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsOpen(true)}
        >
          Block
        </button>
         <button 
          className="p-2 text-sm font-bold w-14 hover:text-grey-300"
          onClick={() => setIsOpen(true)}
        >
          Report
        </button>
        </div>
        <div className='flex '>
            
        </div>
    </div>
  )
}

export default ConversationHeader