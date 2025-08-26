// client/src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatMessages, sendMessage, getChats } from '../services/chatService';
import type { Message, Chat, User } from '@/types'; 

function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/');
      return;
    }

    const loadChatData = async () => {
  try {
    setLoading(true);
    const { data: messagesData } = await getChatMessages(chatId);
    setMessages(messagesData);
    
    // Get user info from the first message that's not from current user
    if (messagesData.length > 0) {
      const otherUserMessage = messagesData.find(msg => msg.sender._id !== user?._id) || messagesData[0];
      if (otherUserMessage && otherUserMessage.sender._id !== user?._id) {
        setOtherUser(otherUserMessage.sender);
      }
    }
  } catch (error) {
    console.error('Error loading chat data:', error);
    navigate('/');
  } finally {
    setLoading(false);
  }
};

    loadChatData();
  }, [chatId, navigate, user?._id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with user info */}
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
          
          {otherUser && (
            <div className="flex items-center">
              <img
                src={otherUser.profilePicture || '/default-avatar.png'}
                alt={otherUser.name}
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {otherUser.name}
                </h2>
                {otherUser.status && (
                  <p className="text-xs text-gray-500 truncate">{otherUser.status}</p>
                )}
              </div>
            </div>
          )}
          
          {currentChat?.isGroup && (
            <div className="flex items-center">
              <img
                src={currentChat.picture || '/default-group.png'}
                alt={currentChat.name}
                className="w-8 h-8 rounded-full mr-3 object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {currentChat.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {currentChat.participants.length} members
                </p>
              </div>
            </div>
          )}
          
          {!otherUser && !currentChat?.isGroup && (
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          )}
        </div>
      </div>

      {/* Messages Area */}
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

      {/* Message Input */}
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