// client/src/components/Layout.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">RixChat</h1>
        <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => navigate('/')}
              className={`w-full text-left p-2 rounded ${
                location.pathname === '/' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/chat')}
              className={`w-full text-left p-2 rounded ${
                location.pathname === '/chat' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Chats
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/groups')}
              className={`w-full text-left p-2 rounded ${
                location.pathname === '/groups' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Groups
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/profile')}
              className={`w-full text-left p-2 rounded ${
                location.pathname === '/profile' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Profile
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('/settings')}
              className={`w-full text-left p-2 rounded ${
                location.pathname === '/settings' ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
            >
              Settings
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );

  // Mobile Bottom Navigation
  const MobileNavigation = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around p-2">
        <button
          onClick={() => navigate('/')}
          className={`p-3 rounded-full ${
            location.pathname === '/' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </button>
        
        <button
          onClick={() => navigate('/chat')}
          className={`p-3 rounded-full ${
            location.pathname.startsWith('/chat') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
          </svg>
          Chats
        </button>

        <button
          onClick={() => navigate('/groups')}
          className={`p-3 rounded-full ${
            location.pathname.startsWith('/groups') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
            <svg className="w-6 h-6 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm10 12H5V5h10v10z" clipRule="evenodd" />
            </svg>
            Groups
        </button>
        
        <button
          onClick={() => navigate('/profile')}
          className={`p-3 rounded-full ${
            location.pathname === '/profile' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Profile
        </button>
        
        <button
          onClick={() => navigate('/settings')}
          className={`p-3 rounded-full ${
            location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <svg className="w-6 h-6 ml-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {!isMobile && <DesktopSidebar />}
      
      <main className={`flex-1 ${!isMobile ? 'ml-64' : 'pb-16'}`}>
        {children}
      </main>
      
      {isMobile && <MobileNavigation />}
    </div>
  );
}

export default Layout;