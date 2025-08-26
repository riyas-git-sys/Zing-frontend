// client/src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatMessages, sendMessage } from '../services/chatService';
import type { Message } from '@/types'; 

function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/');
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        const { data } = await getChatMessages(chatId);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chatId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { data } = await sendMessage(chatId!, newMessage, []);
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <button 
          onClick={() => navigate('/')}
          className="mr-2 text-blue-500 hover:text-blue-700"
        >
          ← Back to Chats
        </button>
        <h2 className="text-xl font-semibold inline">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`mb-4 ${message.sender._id === user?._id ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-end space-x-2">
                {message.sender._id !== user?._id && (
                  <img
                    src={message.sender.profilePicture || '/default-avatar.png'}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div
                  className={`inline-block p-3 rounded-lg max-w-xs ${
                    message.sender._id === user?._id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border'
                  }`}
                >
                  {message.sender._id !== user?._id && (
                    <div className="text-xs font-semibold mb-1">
                      {message.sender.name}
                    </div>
                  )}
                  {message.content}
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPage;