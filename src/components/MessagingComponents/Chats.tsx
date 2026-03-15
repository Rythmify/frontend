import React from 'react'
import MessagingHeader from './MessagingHeader'
import { ChatProfile } from './ChatProfile'
const Chats = () => {
  return (
    <div className="flex flex-col gap-4">
      <MessagingHeader />
      <div>
      <ChatProfile
  photo="/avatars/alyaa.jpg"
  name="Alyaa Mohamed"
  lastMessage="ana 3mlt mn el 2 accounts bto3e asln"
  sentFrom="20 hours ago"
  isActive={true}
  // onClick={() => setActiveConversation("alyaa")}
/> 
    <ChatProfile
  photo="/avatars/nour.jpg"
  name="nour aboseif"
  lastMessage="ana 3mlt mn el 2 accounts bto3e asln"
  sentFrom="20 hours ago"
  isActive={true}
  // onClick={() => setActiveConversation("alyaa")}
/> 
    <ChatProfile
  photo="/avatars/rowaida.jpg"
  name="rowaida"
  lastMessage="ana 3mlt mn el 2 accounts bto3e asln"
  sentFrom="20 hours ago"
  isActive={true}
  // onClick={() => setActiveConversation("alyaa")}
/> 
</div>
    </div>
  )
}

export default Chats