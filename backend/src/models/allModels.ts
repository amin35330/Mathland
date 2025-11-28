// دیگر نیازی به mongoose نیست، فقط اینترفیس‌ها را تعریف می‌کنیم
// Firestore به صورت خودکار ID و timestamp را اضافه می‌کند

export interface Book {
  id?: string; // Firestore ID
  title: string;
  author: string;
  description: string;
  subject: string;
  imageUrl: string;
  downloadUrl: string;
  rating: number;
}

export interface Teacher {
  id?: string; // Firestore ID
  name: string;
  bio: string;
  experience: string;
  imageUrl: string;
  phone: string;
  email: string;
}

export interface Video {
  id?: string; // Firestore ID
  title: string;
  tutor: string;
  thumbnailUrl: string;
  duration: string;
  category: string;
  videoUrl?: string;
}

export interface Paradox {
  id?: string; // Firestore ID
  title: string;
  summary: string;
  content: string;
}

export interface Creator {
  id?: string; // Firestore ID
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

export interface Settings {
  id?: string; // Firestore ID
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

// برای Firestore نیازی به export کردن مدل‌های Mongoose نیست
// این فایل فقط برای تعریف Type ها استفاده می‌شود