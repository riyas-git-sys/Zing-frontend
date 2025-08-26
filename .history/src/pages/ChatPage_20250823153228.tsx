// client/src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatMessages, sendMessage } from '../services/chatService';
import type { Message, Chat } from '@/types'; 

function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
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
        
        // Try to get chat info from the first message or localStorage
        if (data.length > 0 && data[0].chat) {
          setCurrentChat(data[0].chat);
        }
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
      alert('Failed to send message. Please check your connection.');
    }
  };

  // Get the other participant's name for the header
  const getChatName = () => {
    if (!currentChat) return 'Chat';
    
    if (currentChat.isGroup) {
      return currentChat.name || 'Group Chat';
    }
    
    // For 1-on-1 chats, find the other participant
    const otherParticipant = currentChat.participants?.find(
      (p: any) => p._id !== user?._id
    );
    
    return otherParticipant?.name || 'Unknown User';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 text-blue-500 hover:text-blue-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {getChatName()}
          </h2>
        </div>
      </div>

      {/* Messages Area - Fixed height without extra space */}
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
              <div className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-end space-x-2 max-w-xs">
                  {message.sender._id !== user?._id && (
                    <img
                      src={message.sender.profilePicture || '/default-avatar.png'}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.sender._id === user?._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border'
                    }`}
                  >
                    {message.sender._id !== user?._id && (
                      <div className="text-xs font-semibold mb-1 text-gray-600">
                        {message.sender.name}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom without extra space */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[60px] flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPage;