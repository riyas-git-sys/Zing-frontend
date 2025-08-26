import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  mobile: string;
  profilePicture: string;
  status?: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  register: (name: string, mobile: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('chatToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          setUser(data);
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem('chatToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (mobile: string, password: string) => {
    const { data } = await api.post('/auth/login', { mobile, password });
    localStorage.setItem('chatToken', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    navigate('/');
  };

  const register = async (name: string, mobile: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, mobile, password });
    localStorage.setItem('chatToken', data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('chatToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};