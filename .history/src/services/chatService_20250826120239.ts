// client/src/services/chatService.ts
import api from './api';
import type { User, Message, Chat } from '@/types';

export const getAllUsers = async (): Promise<{ data: User[] }> => {
  return api.get('/chats/users');
};

export const getChats = async (): Promise<{ data: Chat[] }> => {
  return api.get('/chats');
};

export const getChatMessages = async (chatId: string): Promise<{ data: Message[] }> => {
  return api.get(`/chats/${chatId}/messages`);
};

export const sendMessage = async (chatId: string, content: string, media: File[] = []): Promise<{ data: Message }> => {
  const formData = new FormData();
  formData.append('chatId', chatId);
  formData.append('content', content);
  
  // Append each file to the form data
  media.forEach((file) => {
    formData.append('media', file);
  });
  
  return api.post('/messages', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const searchUsers = async (query: string): Promise<{ data: User[] }> => {
  return api.get(`/chats/search?query=${encodeURIComponent(query)}`);
};

// FIXED: Include participants in the request body
export const createChat = async (participantId: string): Promise<{ data: Chat }> => {
  return api.post('/chats', { 
    participants: [participantId] 
  });
};

export const createGroupChat = async (name: string, participants: string[]): Promise<{ data: Chat }> => {
  return api.post('/chats/group', { 
    name, 
    participants
  });
};

export const addToGroup = async (chatId: string, userId: string): Promise<{ data: Chat }> => {
  return api.post(`/chats/${chatId}/add-member`, { userId });
};

export const uploadGroupPicture = async (chatId: string, formData: FormData) => {
  const response = await api.put(`/chats/${chatId}/picture`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const leaveGroup = async (chatId: string) => {
  const response = await api.post(`/chats/${chatId}/leave`);
  return response.data;
};

export const promoteToAdmin = async (chatId: string, userId: string): Promise<{ data: Chat }> => {
  return api.post(`/chats/${chatId}/promote-admin`, { userId });
};

export const demoteAdmin = async (chatId: string, userId: string): Promise<{ data: Chat }> => {
  return api.post(`/chats/${chatId}/demote-admin`, { userId });
};

export const clearChat = async (chatId: string): Promise<{ data: any }> => {
  return api.delete(`/messages/chat/${chatId}`);
};

export const removeFromGroup = async (chatId: string, userId: string): Promise<{ data: Chat }> => {
  return api.post(`/chats/${chatId}/remove-member`, { userId });
};

export const deleteGroup = async (chatId: string): Promise<{ data: any }> => {
  return api.delete(`/chats/${chatId}`);
};