// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import ChatPage from './pages/ChatPage';

// Debug component to track auth state
function AuthDebug() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log('Auth state changed:', { user, loading });
  }, [user, loading]);
  
  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthDebug />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with Layout */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Layout>
                  <Home />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/chat/:chatId" 
            element={
              <PrivateRoute>
                <Layout>
                  <ChatPage />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <PrivateRoute>
                <Layout>
                  <Groups />
                </Layout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <Layout>
                  <Settings />
                </Layout>
              </PrivateRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;