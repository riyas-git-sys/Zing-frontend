// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import UserInfo from './components/chat/UserInfo';
import GroupInfo from './components/chat/GroupInfo';
import ChatInfo from './components/chat/ChatInfo';
import EditGroup from './components/EditGroup';

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
        <ThemeProvider>
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
              path="/chat/:chatId/user-info" 
              element={
                <PrivateRoute>
                  <Layout>
                    <UserInfo />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/chat/:chatId/group-info" 
              element={
                <PrivateRoute>
                  <Layout>
                    <GroupInfo />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/edit-group/:chatId" 
              element={
                <PrivateRoute>
                  <Layout>
                    <EditGroup />
                  </Layout>
                </PrivateRoute>
              } />
            <Route 
              path="/chat/:chatId/chat-info" 
              element={
                <PrivateRoute>
                  <Layout>
                    <ChatInfo />
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
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;