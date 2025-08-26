// client/src/pages/ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getChatMessages, sendMessage, getChats } from '../services/chatService';
import type { Message, Chat, User } from '@/types'; 

// Import default images
import defaultAvatar from '../assets/default-avatar.png';
import defaultGroup from '../assets/default-group.png';

function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

        // Load chat info to get group details
        const { data: chats } = await getChats();
        const currentChat = chats.find(chat => chat._id === chatId);
        
        if (currentChat) {
          setCurrentChat(currentChat);
          
          if (currentChat.isGroup) {
            // For group chats, we don't need to set otherUser
            setOtherUser(null);
          } else {
            // For 1-on-1 chats, find the other user
            const otherParticipant = currentChat.participants.find(
              participant => participant._id !== user?._id
            );
            if (otherParticipant) {
              setOtherUser(otherParticipant);
            }
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
    // Scroll to bottom when messages load or change
    scrollToBottom();
  }, [messages]);

  // Add this useEffect to scroll to bottom immediately when component mounts
  useEffect(() => {
    // Scroll to bottom immediately when component mounts
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
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

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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

  const handleUserInfo = () => {
    if (currentChat?.isGroup) {
      navigate(`/chat/${chatId}/group-info`);
    } else if (otherUser) {
      navigate(`/chat/${chatId}/user-info`);
    }
    setShowMenu(false);
  };

  const handleChatInfo = () => {
    navigate(`/chat/${chatId}/chat-info`);
    setShowMenu(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="mr-3 text-blue-500 hover:text-blue-700 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {currentChat?.isGroup ? (
              <div className="flex items-center">
                <img
                  src={currentChat.picture || defaultGroup}
                  alt={currentChat.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
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
            ) : otherUser ? (
              <div className="flex items-center">
                <img
                  src={otherUser.profilePicture || defaultAvatar}
                  alt={otherUser.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
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
            ) : (
              <h2 className="text-lg font-semibold text-gray-800">Chat</h2>
            )}
          </div>

          {/* Three-dot menu button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={handleUserInfo}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {currentChat?.isGroup ? 'Group Info' : 'User Info'}
                </button>
                <button
                  onClick={handleChatInfo}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100 flex items-center border-t border-gray-100"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Chat Info & Media
                </button>
              </div>
            )}
          </div>
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
                <div className="flex items-end space-x-2 max-w-xs md:max-w-md lg:max-w-lg">
                  {/* Show sender avatar on the left for received messages */}
                  {message.sender._id !== user?._id && (
                    <img
                      src={message.sender.profilePicture || defaultAvatar}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  
                  <div className="relative max-w-full">
                    {/* Message bubble with arrow */}
                    <div
                      className={`relative ${
                        message.sender._id === user?._id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border'
                      } rounded-lg p-3 max-w-[70vw] md:max-w-[50vw] lg:max-w-[40vw]`}
                      style={{
                        marginLeft: message.sender._id === user?._id ? 'auto' : '0',
                        marginRight: message.sender._id !== user?._id ? 'auto' : '0',
                        wordWrap: 'break-word'
                      }}
                    >
                      {/* Arrow for sent messages */}
                      {message.sender._id === user?._id && (
                        <div className="absolute -right-3 bottom-2 transform -translate-x-1/2">
                          <div className="w-4 h-4 bg-blue-500 rotate-45 transform origin-center"></div>
                        </div>
                      )}
                      
                      {/* Arrow for received messages */}
                      {message.sender._id !== user?._id && (
                        <div className="absolute -left-3 bottom-2 transform translate-x-1/2">
                          <div className="w-4 h-4 bg-white border-l border-b border-t-0 border-r-0 rotate-45 transform origin-center"></div>
                        </div>
                      )}

                      {/* Show sender name for received messages in groups */}
                      {message.sender._id !== user?._id && currentChat?.isGroup && (
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
                                <button
                                  onClick={() => {
                                    // You'll need to implement a state to track the fullscreen media
                                    setSelectedMedia(media);
                                  }}
                                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7a3 3 0 100 6 3 3 0 000-6z" />
                                  </svg>
                                </button>
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

                      <div className="text-base whitespace-pre-wrap break-words relative z-10 overflow-hidden">
                        {message.content}
                      </div>
                      <div className="text-xs mt-1 opacity-70 text-right relative z-10">
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Show sender avatar on the right for sent messages */}
                  {message.sender._id === user?._id && (
                    <img
                      src={user?.profilePicture || defaultAvatar}
                      alt={user?.name}
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
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t">
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
            className="px-4 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] flex items-center justify-center transition-colors"
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