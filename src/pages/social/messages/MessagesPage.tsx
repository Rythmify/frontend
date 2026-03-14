import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchConversations } from '../../../api/messaging/conversationApi';
import type { Conversation } from '../../../api/messaging/conversationApi';
import EmptyMessagesPage from './emptyMessagesPage';
import Spinner from '../../../components/UI/Spinner';

export default function MessagesPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading]= useState<boolean>(true);
  const [error, setError]= useState<string | null>(null);

  // fetch conversations
  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetchConversations(1, 20);

        if (!cancelled) {
          setConversations(response.data.items);
        }
      } catch (err) {
        if (!cancelled) {
          if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message ?? 'Failed to load conversations.');
          } else {
            setError('An unexpected error occurred.');
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadConversations();

    return () => {
      cancelled = true;
    };
  }, []);

  // redirect to last conversation if any exist
  useEffect(() => {
    if (!isLoading && conversations.length > 0) {
      navigate(`/messages/${conversations[0].id}`, { replace: true }); // Redirect to the most recent conversation + replace to avoid back button issues
    }
  }, [conversations, isLoading, navigate]);

  if (isLoading) return <Spinner />;
  if (error)     return <p>{error}</p>;

  return <EmptyMessagesPage />;
}