// client/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { searchUsers, createChat, getChats, getAllUsers } from '../services/chatService';
import type { User, Chat } from '../types';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Home component rendered, user:', user);
    
    // Check if user has seen welcome popup before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }

    // Set selected chat if chatId exists in URL
    if (chatId) {
      setSelectedChatId(chatId);
    }

    // Load contacts and chats
    loadContacts();
    loadChats();
  }, [user, chatId]);

  const loadContacts = async () => {
    try {
      setError('');
      // Use the dedicated endpoint to get all users
      const { data } = await getAllUsers();
      setContacts(data.filter(u => u._id !== user?._id));
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      setError(error.response?.data?.message || 'Failed to load contacts');
      
      // Fallback: If the /users endpoint doesn't exist, try search with common letters
      if (error.response?.status === 404) {
        console.log(' getAllUsers failed, trying search fallback');
        const commonLetters = ['a', 'e', 'i', 'o', 'u'];
        let contactsLoaded = false;
        
        for (const letter of commonLetters) {
          try {
            const { data } = await searchUsers(letter);
            setContacts(data.filter(u => u._id !== user?._id));
            contactsLoaded = true;
            break;
          } catch (letterError: any) {
            console.error(`Error loading contacts with letter ${letter}:`, letterError);
            continue;
          }
        }
        
        if (!contactsLoaded) {
          setError('Failed to load contacts. Please try searching for specific users.');
        }
      }
    }
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await getChats();
      setChats(data);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      setError(error.response?.data?.message || 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        setError('');
        const { data } = await searchUsers(query);
        setSearchResults(data.filter(u => u._id !== user?._id));
      } catch (error: any) {
        console.error('Error searching users:', error);
        setError(error.response?.data?.message || 'Search failed');
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setError('');
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      setError('');
      const { data } = await createChat(userId);
      setSelectedChatId(data._id);
      navigate(`/chat/${data._id}`);
    } catch (error: any) {
      console.error('Error creating chat:', error);
      setError(error.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`);
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  // If we have a selected chat, don't show the contacts grid
  const showContactsGrid = !selectedChatId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header with Search */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">RixChat</h1>
            <p className="text-gray-600">Connect with your friends and colleagues</p>
          </div>
          
          <div className="w-full md:w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Results</h2>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer border border-gray-100"
                    onClick={() => handleStartChat(user._id)}
                  >
                    <div className="p-4 flex flex-col items-center">
                      <img
                        src={user.profilePicture || '/default-avatar.png'}
                        alt={user.name}
                        className="w-14 h-14 rounded-full object-cover mb-3 shadow-md"
                      />
                      <h3 className="font-semibold text-gray-800 text-center mb-1 text-sm">{user.name}</h3>
                      <p className="text-xs text-gray-500 text-center">{user.mobile}</p>
                      
                      <button className="mt-3 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium transition-colors duration-300 hover:bg-blue-600">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 text-center shadow-md">
                <p className="text-gray-500">No users found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Chats Section - Only show when not searching and no chat selected */}
        {showContactsGrid && !searchQuery && chats.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">💬</span> Recent Chats
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer border border-gray-100"
                  onClick={() => handleSelectChat(chat._id)}
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={chat.isGroup ? 
                          (chat.picture || '/default-group.png') : 
                          (chat.participants.find(p => p._id !== user?._id)?.profilePicture || '/default-avatar.png')
                        }
                        alt={chat.name || chat.participants.find(p => p._id !== user?._id)?.name}
                        className="w-12 h-12 rounded-full object-cover mr-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {chat.isGroup ? 
                            chat.name : 
                            chat.participants.find(p => p._id !== user?._id)?.name
                          }
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.isGroup ? 'Group Chat' : 'Direct Message'}
                        </p>
                      </div>
                    </div>
                    
                    {chat.lastMessage && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage.content}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>
                        {chat.lastMessage ? (
                          new Date(chat.lastMessage.createdAt).toLocaleDateString()
                        ) : (
                          'No messages yet'
                        )}
                      </span>
                      <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium transition-colors duration-300 hover:bg-blue-200">
                        Open Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Grid Section - Only show when not searching and no chat selected */}
        {showContactsGrid && !searchQuery && (
          <div className="mb-20">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="mr-2">👥</span> Your Contacts
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-gray-100"
                    onClick={() => handleStartChat(contact._id)}
                  >
                    <div className="p-6 flex flex-col items-center">
                      <div className="relative mb-4">
                        <img
                          src={contact.profilePicture || '/default-avatar.png'}
                          alt={contact.name}
                          className="w-16 h-16 rounded-full object-cover shadow-md"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-center mb-1">{contact.name}</h3>
                      <p className="text-sm text-gray-500 text-center mb-3">{contact.mobile}</p>
                      
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-blue-600">
                        Start Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State - Only show when not searching and no chat selected */}
        {showContactsGrid && !searchQuery && chats.length === 0 && contacts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to RixChat!</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Get started by searching for users or your contacts will appear here once you have some.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p>{error}</p>
            <button
              onClick={() => {
                loadContacts();
                loadChats();
              }}
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-95 animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-4 text-blue-600">Welcome to RixChat!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for joining our community. Start chatting with your friends 
                and colleagues by selecting a contact from your list.
              </p>
              <button
                onClick={handleCloseWelcome}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;