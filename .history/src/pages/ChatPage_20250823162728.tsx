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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if mobile device
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      setIsUploading(true);
      const { data } = await sendMessage(chatId!, newMessage, selectedFiles);
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      setSelectedFiles([]);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      const fileType = file.type.split('/')[0];
      const isValidType = ['image', 'video', 'audio', 'application', 'text'].includes(fileType);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit

      if (!isValidType) {
        alert('Please select valid file types (images, videos, audio, documents)');
        return false;
      }

      if (!isValidSize) {
        alert('File size must be less than 10MB');
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle mobile keyboard visibility
  useEffect(() => {
    const handleFocus = () => {
      if (isMobile) {
        document.body.classList.add('keyboard-open');
      }
    };

    const handleBlur = () => {
      if (isMobile) {
        document.body.classList.remove('keyboard-open');
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
    };
  }, [isMobile]);

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
          
          {!otherUser && (
            <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
          )}
        </div>
      </div>

      {/* Messages Area - Wider container */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
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
                <div className="flex items-end space-x-2 max-w-full">
                  {message.sender._id !== user?._id && (
                    <img
                      src={message.sender.profilePicture || '/default-avatar.png'}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  <div
                    className={`max-w-full ${
                      message.sender._id === user?._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border'
                    } rounded-lg p-3`}
                    style={{
                      marginLeft: message.sender._id === user?._id ? 'auto' : '0',
                      marginRight: message.sender._id !== user?._id ? 'auto' : '0',
                      maxWidth: isMobile ? '50%' : '75%',
                      wordWrap: 'break-word'
                    }}
                  >
                    {message.sender._id !== user?._id && (
                      <div className="text-xs font-semibold mb-1 text-gray-600">
                        {message.sender.name}
                      </div>
                    )}
                    
                    {/* Display media files */}
                    {message.media && message.media.length > 0 && (
                      <div className="mb-2">
                        {message.media.map((media, index) => (
                          <div key={index} className="mb-2">
                            {media.type === 'image' && (
                              <img
                                src={media.url}
                                alt={media.name}
                                className="max-w-full rounded-lg max-h-48 object-cover"
                              />
                            )}
                            {media.type === 'video' && (
                              <video
                                controls
                                className="max-w-full rounded-lg max-h-48"
                              >
                                <source src={media.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            )}
                            {media.type === 'audio' && (
                              <audio controls className="w-full">
                                <source src={media.url} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                            {!['image', 'video', 'audio'].includes(media.type) && (
                              <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 bg-gray-100 rounded hover:bg-gray-200"
                              >
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {media.name}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-base whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </div>
                  </div>
                  {message.sender._id === user?._id && (
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt={user.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="p-3 bg-gray-100 border-t">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image/') ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="relative bg-white p-2 rounded border">
                    <div className="text-xs truncate w-16">{file.name}</div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage} 
        className="p-3 bg-white border-t sticky bottom-0"
        style={{
          position: isMobile ? 'sticky' : 'relative',
          bottom: isMobile ? '0' : 'auto'
        }}
      >
        <div className="flex space-x-2 items-center">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Attach button */}
          <button
            type="button"
            onClick={handleAttachClick}
            className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
            disabled={isUploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUploading}
          />

          <button
            type="submit"
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || isUploading}
            className="px-4 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[60px] flex items-center justify-center"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPage;