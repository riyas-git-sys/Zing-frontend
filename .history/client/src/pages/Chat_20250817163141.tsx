import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import { getChatMessages, sendMessage } from '../services/chatService';

function Chat() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [media, setMedia] = useState([]);
  const messagesEndRef = useRef(null);
  const socket = useSocket(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await getChatMessages(chatId);
      setMessages(data);
    };

    loadMessages();

    socket.emit('joinChat', chatId);
    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.emit('leaveChat', chatId);
      socket.off('newMessage');
    };
  }, [chatId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && media.length === 0) return;

    try {
      const { data } = await sendMessage(chatId, newMessage, media);
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      setMedia([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMediaChange = (e) => {
    setMedia([...e.target.files]);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Chat header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`mb-4 ${message.sender._id === user._id ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender._id === user._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
              {/* Render media here */}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="file"
            multiple
            onChange={handleMediaChange}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className="p-2 bg-gray-200 rounded-l-lg cursor-pointer"
          >
            <span>+</span>
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-r-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;