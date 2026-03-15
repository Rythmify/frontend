import React from 'react'
import { useState } from 'react'
import { Modal } from '../../../../components/MessagingComponents/Modal';
import { ChatProfile } from '@/components/MessagingComponents/ChatProfile';
import Chats from '@/components/MessagingComponents/Chats';
import ConversationPage from '@/components/MessagingComponents/ConversationPage';
// import ModalBlockBody from '../ModalBlockBody';
export default function MessageIdPage() {
  
  return (
    <div className='flex '> 
      <Chats/>
      <ConversationPage/>
    </div>
  )
}
