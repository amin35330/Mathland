export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  subject: string;
  imageUrl: string;
  downloadUrl: string;
  rating: number;
}

export interface Teacher {
  id: string;
  name: string;
  bio: string; 
  experience: string; 
  imageUrl: string;
  phone: string;
  email: string;
}

export interface Video {
  id: string;
  title: string;
  tutor: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  videoUrl?: string;
}

export interface Paradox {
  id: string;
  title: string;
  summary: string;
  content: string;
}

export interface Creator {
  id: string;
  name: string;
  role: string; 
  bio: string;
  imageUrl: string;
}

export interface Settings {
  appName: string;
  appLogoUrl: string;
  adminEmail: string;
  eitaaLink: string;
  rubikaLink: string;
  address: string;
  phone: string;
  copyrightText: string;
  apiKey: string;
}

// --- اضافه شد ---
export interface Stats {
  total: number;
  monthly: number;
  daily: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface ThemeSettings {
  darkMode: boolean;
  primaryColor: string;
}

export interface AppContextType {
  books: Book[];
  teachers: Teacher[];
  videos: Video[];
  paradoxes: Paradox[];
  creators: Creator[];
  settings: Settings;
  theme: ThemeSettings;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  toggleTheme: () => void;
  updateData: (type: 'books' | 'teachers' | 'videos' | 'paradoxes' | 'creators', data: any[]) => void;
  updateSettings: (newSettings: Settings) => void;
}