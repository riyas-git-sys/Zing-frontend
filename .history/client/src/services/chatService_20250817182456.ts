// client/src/services/chatService.ts
import api from './api';

interface User {
  id: string;
  name: string;
  mobile: string;
  profilePicture: string;
}

interface Chat {
  id: string;
  participants: User[];
}

export const createChat = (participantId: string): Promise<{ data: Chat }> => 
  api.post('/chats', { participants: [participantId] });

export const createGroupChat = (name: string, participants: string[]): Promise<{ data: Chat }> =>
  api.post('/chats/group', { name, participants });

export const searchUsers = (query: string): Promise<{ data: User[] }> => 
  api.get(`/chats/search?query=${query}`);