import React from 'react'
import { useParams } from 'react-router-dom'
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
import { useAuthStore } from '@/stores/auth.store';

export default function UsernamePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();

  // TODO: fetch the profile user by username from your API/store
  // For now, if viewing own profile:
  const user = currentUser; // replace with actual fetch by username

  if (!user || !currentUser) return null; // or a <Spinner />

  return (
    <ProfileHeader user={user} isOwner={user.id === currentUser.id} />
  )
}