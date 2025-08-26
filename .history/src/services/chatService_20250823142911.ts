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
  media.forEach((file) => formData.append('media', file));
  
  return api.post('/messages', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    // If query is empty, return all users (except current user)
    if (!query || query.trim().length === 0) {
      const users = await User.find({ _id: { $ne: req.user._id } })
        .select('name profilePicture mobile status')
        .sort({ name: 1 });
      return res.json(users);
    }
    
    if (query.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { mobile: { $regex: query, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    }).select('name profilePicture mobile status');

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: error.message });
  }
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