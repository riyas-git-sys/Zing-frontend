// client/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import ContactsList from '../components/ContactsList';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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
  }, [user, chatId]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    navigate(`/chat/${chatId}`);
  };

  // If we have a selected chat, don't show the contacts list
  const showContactsList = !selectedChatId;

  return (
    <div className="flex h-full">
      {/* Contacts List - Only show when no chat is selected */}
      {showContactsList && (
        <ContactsList onSelectChat={handleSelectChat} />
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 relative">
        {/* Welcome Popup */}
        {showWelcome && showContactsList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4 text-blue-600">Welcome to RixChat!</h1>
                <p className="text-gray-600 mb-6">
                  Thank you for joining our community. Start chatting with your friends 
                  and colleagues by selecting a contact from the sidebar.
                </p>
                <button
                  onClick={handleCloseWelcome}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Default content when no chat is selected */}
        {showContactsList && (
          <div className="text-center p-4">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to RixChat</h2>
              <p className="text-gray-600 mb-4">
                Select a contact from the sidebar to start a conversation
              </p>
              <div className="text-sm text-gray-500">
                <p>• Message your friends instantly</p>
                <p>• Create group chats</p>
                <p>• Share media files</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;