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
import ChatPage from './pages/ChatPage';
import ErrorBoundary from './ErrorBoundary';

// Remove the useTheme import from AuthContext and handle it differently
function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThemeProvider> {/* ThemeProvider should be outside AuthProvider */}
        <AuthProvider> {/* AuthProvider doesn't use useTheme anymore */}
          <Router>
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
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;