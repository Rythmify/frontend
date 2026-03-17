import React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '../../../../components/MessagingComponents/Modal';
import { ChatProfile } from '@/components/MessagingComponents/ChatProfile';
import Chats from '@/components/MessagingComponents/Chats';
import ConversationPage from '@/components/MessagingComponents/ConversationPage';
import {
  fetchConversations,
  fetchConversation,
  sendMessage,
  deleteConversation,
  deleteMessage,
  startConversation,
  markMessageReadState,
  searchFollowing,
  type Conversation,
  type Message,
  type FollowingUser,
} from '@/services/api/messaging/conversationApi';
// import ModalBlockBody from '../ModalBlockBody';
export default function MessageIdPage() {
  
  return (
    <div className='flex '> 
      <Chats/>
      <ConversationPage/>
    </div>
  )
}


