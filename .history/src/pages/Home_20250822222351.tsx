// client/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ContactsList from '../components/ContactsList';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    console.log('Home component rendered, user:', user);
    
    // Check if user has seen welcome popup before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, [user]);

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  return (
    <div className="flex h-100vh">
      <ContactsList onSelectChat={(chatId) => navigate(`/chat/${chatId}`)} />
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 relative">
        {/* Welcome Popup */}
        {showWelcome && (
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
        
      </div>
    </div>
  );
}

export default Home;