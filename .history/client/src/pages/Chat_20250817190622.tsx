import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatMessages, sendMessage, Message } from '../services/chatService';

function Chat() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await getChatMessages(chatId!);
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [chatId]);

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

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`mb-4 ${message.sender._id === user?._id ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender._id === user?._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;