// client/src/context/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  useEffect(() => {
    // Load saved preferences from backend if user is logged in
    const loadPreferences = async () => {
      try {
        const token = localStorage.getItem('chatToken');
        if (token) {
          // If user data already has preferences, use them
          if (user?.preferences) {
            const { theme: userTheme, notifications: userNotifications } = user.preferences;
            if (userTheme) setTheme(userTheme as Theme);
            if (userNotifications !== undefined) setNotifications(userNotifications);
          } else {
            // Fallback: try to fetch preferences from API
            try {
              const { data } = await api.get('/user/preferences');
              if (data.theme) setTheme(data.theme);
              if (data.notifications !== undefined) setNotifications(data.notifications);
            } catch (apiError) {
              console.error('Error loading preferences from API:', apiError);
              // Fallback to local storage
              const savedTheme = localStorage.getItem('theme') as Theme;
              const savedNotifications = localStorage.getItem('notifications');
              
              if (savedTheme) setTheme(savedTheme);
              if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
            }
          }
        } else {
          // No token, use local storage only
          const savedTheme = localStorage.getItem('theme') as Theme;
          const savedNotifications = localStorage.getItem('notifications');
          
          if (savedTheme) setTheme(savedTheme);
          if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        // Fallback to local storage
        const savedTheme = localStorage.getItem('theme') as Theme;
        const savedNotifications = localStorage.getItem('notifications');
        
        if (savedTheme) setTheme(savedTheme);
        if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
      }
    };

    loadPreferences();
  }, [user]);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateThemeOnServer = async (newTheme: Theme) => {
    try {
      await api.post('/user/preferences', {
        theme: newTheme,
        notifications
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const updateNotificationsOnServer = async (newNotifications: boolean) => {
    try {
      await api.post('/user/preferences', {
        theme,
        notifications: newNotifications
      });
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };

  // Update your useEffect for theme
  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Only update server if user is logged in
    if (user) {
      updateThemeOnServer(theme);
    }
  }, [theme, user]);

  // Update your useEffect for notifications
  useEffect(() => {
    // Save notification preference
    localStorage.setItem('notifications', notifications.toString());
    
    // Only update server if user is logged in
    if (user) {
      updateNotificationsOnServer(notifications);
    }
  }, [notifications, user]);

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