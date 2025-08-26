// client/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import ContactsList from '../components/ContactsList';
import { getChats, getAllUsers } from '../services/chatService';
import type { User, Chat } from '../types';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

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
    loadData();
  }, [user, chatId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load all users (contacts)
      const { data: usersData } = await getAllUsers();
      setContacts(usersData.filter(u => u._id !== user?._id));
      
      // Load chats
      const { data: chatsData } = await getChats();
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`);
  };

  const handleStartChat = async (userId: string) => {
    try {
      // In a real implementation, you would call createChat here
      console.log('Starting chat with user:', userId);
      // For demo purposes, we'll navigate to a placeholder chat
      navigate(`/chat/new-${userId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // If we have a selected chat, don't show the contacts grid
  const showContactsGrid = !selectedChatId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800">RixChat</h1>
        <p className="text-gray-600">Connect with your friends and colleagues</p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Contacts Grid Section */}
        {showContactsGrid && (
          <div className="mb-12">
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
                      <p className="text-sm text-gray-500 text-center">{contact.mobile}</p>
                      
                      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium transition-colors duration-300 hover:bg-blue-600">
                        Start Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Chats Section */}
        {showContactsGrid && chats.length > 0 && (
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
                        className="w-12 h-12 rounded-full object-cover mr-4"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {chat.isGroup ? 
                            chat.name : 
                            chat.participants.find(p => p._id !== user?._id)?.name
                          }
                        </h3>
                        <p className="text-sm text-gray-500">
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

        {/* Empty State */}
        {showContactsGrid && chats.length === 0 && contacts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to RixChat!</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Get started by searching for users or your contacts will appear here once you have some.
            </p>
            <button 
              className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium transition-colors duration-300 hover:bg-blue-600"
              onClick={() => document.getElementById('search-input')?.focus()}
            >
              Search Users
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