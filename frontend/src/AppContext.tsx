import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppContextType, Book, Teacher, Video, Paradox, ThemeSettings, Creator, Settings } from './types';
import { api } from './services/api';

// تنظیمات پیش‌فرض (تا زمانی که از سرور لود شود)
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
  const [books, setBooks] = useState<Book[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [paradoxes, setParadoxes] = useState<Paradox[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [theme, setTheme] = useState<ThemeSettings>({
    darkMode: false,
    primaryColor: 'teal',
  });

  // 1. بارگذاری تم از حافظه مرورگر
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme === 'dark') {
      setTheme(prev => ({ ...prev, darkMode: true }));
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 2. دریافت تمام اطلاعات از سرور هنگام باز شدن سایت
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksData, teachersData, videosData, paradoxesData, creatorsData, settingsData] = await Promise.all([
          api.getBooks(),
          api.getTeachers(),
          api.getVideos(),
          api.getParadoxes(),
          api.getCreators(),
          api.getSettings()
        ]);

        if (booksData) setBooks(booksData);
        if (teachersData) setTeachers(teachersData);
        if (videosData) setVideos(videosData);
        if (paradoxesData) setParadoxes(paradoxesData);
        if (creatorsData) setCreators(creatorsData);
        
        // اگر تنظیمات از سرور آمد، جایگزین کن
        if (settingsData && settingsData.appName) {
            setSettings(settingsData);
        }
        
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

  // تابع آپدیت داده‌ها (هم در صفحه و هم در سرور)
  const updateData = async (type: 'books' | 'teachers' | 'videos' | 'paradoxes' | 'creators', data: any[]) => {
    try {
      // اول State را آپدیت می‌کنیم تا کاربر تغییر را سریع ببیند
      switch (type) {
        case 'books': setBooks(data); await api.saveBooks(data); break;
        case 'teachers': setTeachers(data); await api.saveTeachers(data); break;
        case 'videos': setVideos(data); await api.saveVideos(data); break;
        case 'paradoxes': setParadoxes(data); await api.saveParadoxes(data); break;
        case 'creators': setCreators(data); await api.saveCreators(data); break;
      }
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
      alert('خطا در ذخیره اطلاعات در سرور.');
    }
  };

  // تابع اختصاصی آپدیت تنظیمات
  const updateSettings = async (newSettings: Settings) => {
    try {
      setSettings(newSettings);
      await api.saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error; // خطا را به کامپوننت Admin می‌فرستیم تا آلرت دهد
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-50" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300 font-bold">در حال دریافت اطلاعات...</p>
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