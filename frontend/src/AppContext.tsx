import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Book, Teacher, Video, Paradox, ThemeSettings, Creator, Settings } from './types';
import { api } from './services/api';

// مقادیر اولیه خالی (تا زمانی که دیتا از سرور برسد)
const DEFAULT_SETTINGS: Settings = {
  appName: 'ریاضی‌یار',
  appLogoUrl: '',
  adminEmail: '',
  eitaaLink: '',
  rubikaLink: '',
  address: '',
  phone: '',
  copyrightText: '',
  apiKey: ''
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State ها دیگر از فایل constants خوانده نمی‌شوند، بلکه اول خالی هستند
  const [books, setBooks] = useState<Book[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [paradoxes, setParadoxes] = useState<Paradox[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // وضعیت لودینگ
  
  const [theme, setTheme] = useState<ThemeSettings>({
    darkMode: false,
    primaryColor: 'teal',
  });

  // 1. Load Theme (Local Storage)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme === 'dark') {
      setTheme(prev => ({ ...prev, darkMode: true }));
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 2. Fetch All Data from Backend on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // درخواست همزمان تمام اطلاعات برای سرعت بیشتر
        const [booksData, teachersData, videosData, paradoxesData, creatorsData, settingsData] = await Promise.all([
          api.getBooks(),
          api.getTeachers(),
          api.getVideos(),
          api.getParadoxes(),
          api.getCreators(),
          api.getSettings()
        ]);

        setBooks(booksData);
        setTeachers(teachersData);
        setVideos(videosData);
        setParadoxes(paradoxesData);
        setCreators(creatorsData);
        if(settingsData) setSettings(settingsData);
        
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  // تابع آپدیت هوشمند: هم State را آپدیت می‌کند و هم به سرور می‌فرستد
  const updateData = async (type: 'books' | 'teachers' | 'videos' | 'paradoxes' | 'creators', data: any[]) => {
    try {
      // 1. آپدیت نمایشی (برای سرعت)
      switch (type) {
        case 'books': setBooks(data); await api.saveBooks(data); break;
        case 'teachers': setTeachers(data); await api.saveTeachers(data); break;
        case 'videos': setVideos(data); await api.saveVideos(data); break;
        case 'paradoxes': setParadoxes(data); await api.saveParadoxes(data); break;
        case 'creators': setCreators(data); await api.saveCreators(data); break;
      }
      // 2. ذخیره در سرور (در پس‌زمینه انجام می‌شود)
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      alert('خطا در ذخیره اطلاعات در سرور. لطفاً اتصال اینترنت را بررسی کنید.');
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    try {
      setSettings(newSettings);
      await api.saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('خطا در ذخیره تنظیمات.');
    }
  };

  if (isLoading) {
     // یک لودینگ زیبا هنگام بالا آمدن سایت
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-bold animate-pulse">در حال دریافت اطلاعات از سرور...</p>
        </div>
      </div>
    );
  }

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