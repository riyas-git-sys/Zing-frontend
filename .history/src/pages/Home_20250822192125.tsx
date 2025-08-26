// client/src/pages/Home.tsx
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ContactsList from '../components/ContactsList';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Home component rendered, user:', user);
  }, [user]);

  return (
    <div className="flex h-full">
      <ContactsList onSelectChat={(chatId) => navigate(`/chat/${chatId}`)} />
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Welcome to RixChat</h1>
          <p className="text-gray-600">
            Select a chat from the sidebar or start a new conversation
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;