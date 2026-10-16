/**
 * ============================================================================
 * [CHAT SERVICE INTERFACE — FASTAPI /chat CONTRACT]
 * ============================================================================
 */

import { ChatConversation, ChatMessage } from '../../types';
import { ApiResponse, SendMessageDto, CreateConversationDto } from './types';

export interface IChatService {
  getConversations(): Promise<ApiResponse<ChatConversation[]>>;
  getConversationById(id: string): Promise<ApiResponse<ChatConversation>>;
  getMessages(conversationId: string): Promise<ApiResponse<ChatMessage[]>>;
  sendMessage(data: SendMessageDto): Promise<ApiResponse<ChatMessage>>;
  createConversation(data: CreateConversationDto): Promise<ApiResponse<ChatConversation>>;
  markAsRead(conversationId: string): Promise<ApiResponse<{ marked: boolean }>>;
}
