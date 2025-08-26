import api from './api';

export const getChatMessages = (chatId: string, page = 1) => 
  api.get(`/chats/${chatId}/messages?page=${page}`);

export const sendMessage = (chatId: string, content: string, media: File[]) => {
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