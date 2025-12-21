'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
  ai_assistant_type?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  session_id: string;
  sender_type: 'user' | 'assistant';
  content: string;
  sent_at: string;
}

export const useConversations = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadConversations = async (): Promise<Conversation[]> => {
    if (!user?.id) return [];
    
    try {
      const response = await fetch(`/api/conversations?type=conversations&userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to load conversations');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  };

  const getConversationMessages = async (sessionId: string): Promise<ConversationMessage[]> => {
    try {
      const response = await fetch(`/api/conversations?type=messages&sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      return [];
    }
  };

  const createConversation = async (title: string, aiAssistantType?: string): Promise<Conversation | null> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'conversation',
          data: {
            title,
            userId: user?.id,
            aiAssistantType: aiAssistantType || 'chatgpt'
          }
        })
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const addMessageToConversation = async (
    sessionId: string,
    content: string,
    senderType: 'user' | 'assistant'
  ): Promise<ConversationMessage | null> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'message',
          data: {
            sessionId,
            content,
            senderType
          }
        })
      });
      if (!response.ok) throw new Error('Failed to add message');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding message to conversation:', error);
      return null;
    }
  };

  const deleteConversation = async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete conversation');
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  };

  const renameConversation = async (sessionId: string, newTitle: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, title: newTitle })
      });
      if (!response.ok) throw new Error('Failed to rename conversation');
      return true;
    } catch (error) {
      console.error('Error renaming conversation:', error);
      return false;
    }
  };

  // Load conversations on mount
  const loadUserConversations = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await loadConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading user conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Select conversation and load its messages
  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    try {
      const messages = await getConversationMessages(conversation.id);
      setMessages(messages);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  // Clear current conversation
  const clearCurrentConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  // Create new conversation and select it
  const createAndSelectConversation = async (title: string, aiAssistantType?: string) => {
    const newConversation = await createConversation(title, aiAssistantType);
    if (newConversation) {
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      return newConversation;
    }
    return null;
  };

  // Add message and update UI
  const addMessage = async (sessionId: string, content: string, senderType: 'user' | 'assistant') => {
    const message = await addMessageToConversation(sessionId, content, senderType);
    if (message) {
      setMessages(prev => [...prev, message]);
      // Update conversation timestamp
      setConversations(prev => prev.map(conv => 
        conv.id === sessionId 
          ? { ...conv, updated_at: new Date().toISOString() }
          : conv
      ));
      return message;
    }
    return null;
  };

  // Delete conversation and update UI
  const removeConversation = async (sessionId: string) => {
    const success = await deleteConversation(sessionId);
    if (success) {
      setConversations(prev => prev.filter(conv => conv.id !== sessionId));
      if (currentConversation?.id === sessionId) {
        clearCurrentConversation();
      }
    }
    return success;
  };

  // Rename conversation and update UI
  const updateConversationTitle = async (sessionId: string, newTitle: string) => {
    const success = await renameConversation(sessionId, newTitle);
    if (success) {
      setConversations(prev => prev.map(conv => 
        conv.id === sessionId 
          ? { ...conv, title: newTitle, updated_at: new Date().toISOString() }
          : conv
      ));
      if (currentConversation?.id === sessionId) {
        setCurrentConversation(prev => prev ? { ...prev, title: newTitle } : null);
      }
    }
    return success;
  };

  // Load conversations when user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (user?.id && isMounted) {
        try {
          setIsLoading(true);
          const data = await loadConversations();
          if (isMounted) {
            setConversations(data);
          }
        } catch (error) {
          console.error('Error loading user conversations:', error);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else if (!user?.id && isMounted) {
        setConversations([]);
        clearCurrentConversation();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return {
    // State
    conversations,
    currentConversation,
    messages,
    isLoading,
    
    // Actions
    loadConversations: loadUserConversations,
    createConversation: createAndSelectConversation,
    selectConversation,
    clearCurrentConversation,
    addMessage,
    deleteConversation: removeConversation,
    renameConversation: updateConversationTitle,
    
    // Raw functions (for advanced usage)
    getConversationMessages,
    addMessageToConversation,
  };
};