// client/src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api';

export type Theme = 'light' | 'dark' | 'palenight';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  notifications: boolean;
  setNotifications: (notifications: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    // Load saved preferences from local storage first
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');

    // Then try to load from backend if user is logged in
    const loadPreferencesFromBackend = async () => {
      try {
        const token = localStorage.getItem('chatToken');
        if (token) {
          const { data } = await api.get('/user/preferences');
          if (data.theme) setTheme(data.theme);
          if (data.notifications !== undefined) setNotifications(data.notifications);
        }
      } catch (error) {
        console.error('Error loading preferences from backend:', error);
        // Silently fail - we already have local storage values
      }
    };

    loadPreferencesFromBackend();
  }, []);

  const updateThemeOnServer = async (newTheme: Theme) => {
    try {
      const token = localStorage.getItem('chatToken');
      if (token) {
        await api.post('/user/preferences', {
          theme: newTheme,
          notifications
        });
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const updateNotificationsOnServer = async (newNotifications: boolean) => {
    try {
      const token = localStorage.getItem('chatToken');
      if (token) {
        await api.post('/user/preferences', {
          theme,
          notifications: newNotifications
        });
      }
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeOnServer(theme);
  }, [theme]);

  useEffect(() => {
    // Save notification preference
    localStorage.setItem('notifications', notifications.toString());
    updateNotificationsOnServer(notifications);
  }, [notifications]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    notifications,
    setNotifications
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}