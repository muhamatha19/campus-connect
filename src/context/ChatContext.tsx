import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatConversation, ChatMessage, ConversationTopicType } from '../types';
import { INITIAL_CONVERSATIONS } from '../data/demoData';
import { useAuth } from './AuthContext';

/**
 * ============================================================================
 * [DEVELOPMENT NOTICE — MOCK CAMPUS CHAT DATA LAYER]
 * ============================================================================
 * Manages peer-to-peer student messages with local AsyncStorage persistence.
 *
 * ARCHITECTURAL NOTES:
 * 1. Seeded demo conversations & user-sent messages are persisted offline.
 * 2. Simulates local instant messaging across Marketplace, Tasks, and Pick & Drop.
 * 3. Does not use real-time WebSockets, push notification daemons, or remote APIs.
 * 4. Displays a clear demo banner distinguishing offline simulated chat from live servers.
 * ============================================================================
 */

export interface GetOrCreateConversationParams {
  peerId: string;
  peerName: string;
  peerDepartment?: string;
  peerVerified?: boolean;
  topicType: ConversationTopicType;
  topicTitle: string;
  topicReferenceId?: string;
}

interface ChatContextType {
  conversations: ChatConversation[];
  unreadMessagesCount: number;
  isLoading: boolean;
  sendMessage: (conversationId: string, text: string) => Promise<ChatMessage | null>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  getOrCreateConversation: (params: GetOrCreateConversationParams) => Promise<string>;
  resetToDemoChat: () => Promise<void>;
}

const STORAGE_KEY_CHAT = '@campus_connect_chat_v2';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from AsyncStorage
  useEffect(() => {
    const loadStoredChat = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_CHAT);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed);
          }
        } else {
          await AsyncStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(INITIAL_CONVERSATIONS));
        }
      } catch (e) {
        console.warn('[ChatContext] Error loading cached conversations', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredChat();
  }, []);

  const persistConversations = async (updated: ChatConversation[]) => {
    try {
      setConversations(updated);
      await AsyncStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(updated));
    } catch (e) {
      console.warn('[ChatContext] Error saving conversations to storage', e);
    }
  };

  const currentUserId = user?.id || 'usr_demo_101';
  const currentUserName = user?.name || 'Alex Chen (You)';

  const formatCurrentTime = (): string => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour becomes 12
    const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const sendMessage = async (
    conversationId: string,
    text: string
  ): Promise<ChatMessage | null> => {
    const cleanText = text.trim();
    if (!cleanText) return null;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      conversationId,
      senderId: currentUserId,
      senderName: currentUserName,
      text: cleanText,
      timestamp: new Date().toISOString(),
      formattedTime: formatCurrentTime(),
      isMe: true,
      status: 'sent',
    };

    const updated = conversations.map((conv) => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: cleanText,
          lastMessageTimestamp: newMessage.timestamp,
          lastMessageTimeAgo: 'Just now',
          messages: [...conv.messages, newMessage],
        };
      }
      return conv;
    });

    await persistConversations(updated);
    return newMessage;
  };

  const markConversationAsRead = async (conversationId: string) => {
    const target = conversations.find((c) => c.id === conversationId);
    if (!target || target.unreadCount === 0) return;

    const updated = conversations.map((conv) => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
        };
      }
      return conv;
    });

    await persistConversations(updated);
  };

  const getOrCreateConversation = async (
    params: GetOrCreateConversationParams
  ): Promise<string> => {
    // Check if an existing conversation matches this topic or peer
    const existing = conversations.find(
      (c) =>
        c.peerId === params.peerId &&
        c.topicType === params.topicType &&
        (!params.topicReferenceId || c.topicReferenceId === params.topicReferenceId)
    );

    if (existing) {
      return existing.id;
    }

    // Create a new conversation
    const newId = `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newConv: ChatConversation = {
      id: newId,
      peerId: params.peerId,
      peerName: params.peerName,
      peerDepartment: params.peerDepartment || 'Campus Student',
      peerVerified: params.peerVerified ?? true,
      topicType: params.topicType,
      topicTitle: params.topicTitle,
      topicReferenceId: params.topicReferenceId,
      lastMessage: `Started conversation regarding ${params.topicTitle}`,
      lastMessageTimestamp: new Date().toISOString(),
      lastMessageTimeAgo: 'Just now',
      unreadCount: 0,
      messages: [],
    };

    const updated = [newConv, ...conversations];
    await persistConversations(updated);
    return newId;
  };

  const resetToDemoChat = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(INITIAL_CONVERSATIONS));
      setConversations(INITIAL_CONVERSATIONS);
    } catch (e) {
      console.warn('[ChatContext] Error resetting demo chat', e);
    }
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        unreadMessagesCount,
        isLoading,
        sendMessage,
        markConversationAsRead,
        getOrCreateConversation,
        resetToDemoChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
