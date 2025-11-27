
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Book, Teacher, Video, Paradox, ThemeSettings, Creator, Settings } from './types';
import { INITIAL_BOOKS, INITIAL_TEACHERS, INITIAL_VIDEOS, INITIAL_PARADOXES, INITIAL_CREATORS, INITIAL_SETTINGS } from './constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [paradoxes, setParadoxes] = useState<Paradox[]>(INITIAL_PARADOXES);
  const [creators, setCreators] = useState<Creator[]>(INITIAL_CREATORS);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [theme, setTheme] = useState<ThemeSettings>({
    darkMode: false,
    primaryColor: 'teal',
  });

  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme === 'dark') {
      setTheme(prev => ({ ...prev, darkMode: true }));
      document.documentElement.classList.add('dark');
    }
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  const toggleTheme = () => {
    setTheme(prev => {
      const newMode = !prev.darkMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme_preference', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme_preference', 'light');
      }
      return { ...prev, darkMode: newMode };
    });
  };

  const updateData = (type: 'books' | 'teachers' | 'videos' | 'paradoxes' | 'creators', data: any[]) => {
    switch (type) {
      case 'books': setBooks(data); break;
      case 'teachers': setTeachers(data); break;
      case 'videos': setVideos(data); break;
      case 'paradoxes': setParadoxes(data); break;
      case 'creators': setCreators(data); break;
    }
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider value={{
      books, teachers, videos, paradoxes, creators, settings, theme, isAuthenticated,
      login, logout, toggleTheme, updateData, updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
