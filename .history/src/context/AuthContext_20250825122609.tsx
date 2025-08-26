// client/src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture?: string;
  status?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrMobile: string, password: string) => Promise<void>;
  register: (name: string, email: string, mobile: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void; // Add this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Loading user from token...');
        const token = localStorage.getItem('chatToken');
        
        if (token) {
          console.log('Token found, fetching user data...');
          // Set the token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get current user data
          const { data } = await api.get('/auth/me');
          console.log('User data loaded:', data);
          setUser(data);
        } else {
          console.log('No token found');
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // If token is invalid, remove it
        localStorage.removeItem('chatToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        console.log('Auth loading complete');
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (emailOrMobile: string, password: string) => {
    try {
      console.log('Logging in with:', emailOrMobile);
      const { data } = await api.post('/auth/login', { emailOrMobile, password });
      console.log('Login response:', data);
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token
      localStorage.setItem('chatToken', data.token);
      
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Set user data
      setUser(data.user);
      console.log('User set successfully:', data.user);
      
      // Use window.location instead of navigate to ensure complete refresh
      window.location.href = '/';
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = (error as any).response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, mobile: string, password: string) => {
    try {
      console.log('Registering user:', name, email);
      const { data } = await api.post('/auth/register', { 
        name, 
        email, 
        mobile, 
        password 
      });
      console.log('Registration response:', data);
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }
      
      // Store token
      localStorage.setItem('chatToken', data.token);
      
      // Set the token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Set user data
      setUser(data.user);
      console.log('User set successfully:', data.user);
      
      // Use window.location instead of navigate to ensure complete refresh
      window.location.href = '/';
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorData = (error as any).response?.data;
      const errorMessage = errorData?.message || 
                          errorData?.errors?.join(', ') || 
                          'Registration failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    console.log('Logging out');
    localStorage.removeItem('chatToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login', { replace: true });
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}