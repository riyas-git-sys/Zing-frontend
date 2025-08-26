import api from './api';

export const getChats = () => api.get('/chats');
export const getChatMessages = (chatId, page = 1) => 
  api.get(`/chats/${chatId}/messages?page=${page}`);
export const createChat = (participantId) => 
  api.post('/chats', { participants: [participantId] });
export const createGroupChat = (name, participants) => 
  api.post('/chats/group', { name, participants });
export const searchUsers = (query) => api.get(`/chats/search?query=${query}`);
export const addToGroup = (chatId, userId) => 
  api.put(`/chats/${chatId}/add`, { userId });
export const sendMessage = (chatId, content, media) => {
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
export const markAsRead = (messageId) => 
  api.put(`/messages/${messageId}/read`);