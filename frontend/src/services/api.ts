import { Book, Teacher, Video, Paradox, Creator, Settings } from '../types';

// مهم: آدرس بک‌اند را از متغیرهای محیطی می‌خوانیم
const API_URL = import.meta.env.VITE_API_BASE_URL;

const request = async (endpoint: string, options?: RequestInit) => {
  try {
    // اگر آدرس بک‌اند تعریف نشده بود، خطا بده
    if (!API_URL) {
      throw new Error("VITE_API_BASE_URL is not defined. Please check your environment variables in Vercel.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    // اگر پاسخ محتوایی نداشت (مثل status 204)، یک آبجکت خالی برگردان
    if (response.status === 204) {
        return {};
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};

export const api = {
  getBooks: () => request('/books'),
  saveBooks: (data: Book[]) => request('/books', { method: 'POST', body: JSON.stringify(data) }),
  getTeachers: () => request('/teachers'),
  saveTeachers: (data: Teacher[]) => request('/teachers', { method: 'POST', body: JSON.stringify(data) }),
  getVideos: () => request('/videos'),
  saveVideos: (data: Video[]) => request('/videos', { method: 'POST', body: JSON.stringify(data) }),
  getParadoxes: () => request('/paradoxes'),
  saveParadoxes: (data: Paradox[]) => request('/paradoxes', { method: 'POST', body: JSON.stringify(data) }),
  getCreators: () => request('/creators'),
  saveCreators: (data: Creator[]) => request('/creators', { method: 'POST', body: JSON.stringify(data) }),
  getSettings: () => request('/settings'),
  saveSettings: (data: Settings) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),
};