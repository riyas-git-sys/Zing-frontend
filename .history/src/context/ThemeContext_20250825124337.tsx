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
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedNotifications = localStorage.getItem('notifications');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
  }, []);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Save notification preference
    localStorage.setItem('notifications', notifications.toString());
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