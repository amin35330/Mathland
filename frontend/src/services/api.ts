import { Book, Teacher, Video, Paradox, Creator, Settings } from '../types';

// اصلاح مهم: آدرس را به نسبی تغییر می‌دهیم
const API_URL = '/api';

const request = async (endpoint: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};

// ... بقیه فایل بدون تغییر می‌ماند ...
export const api = {
  // --- Books ---
  getBooks: () => request('/books'),
  saveBooks: (data: Book[]) => request('/books', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // --- Teachers ---
  getTeachers: () => request('/teachers'),
  saveTeachers: (data: Teacher[]) => request('/teachers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // --- Videos ---
  getVideos: () => request('/videos'),
  saveVideos: (data: Video[]) => request('/videos', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // --- Paradoxes ---
  getParadoxes: () => request('/paradoxes'),
  saveParadoxes: (data: Paradox[]) => request('/paradoxes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // --- Creators ---
  getCreators: () => request('/creators'),
  saveCreators: (data: Creator[]) => request('/creators', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // --- Settings ---
  getSettings: () => request('/settings'),
  saveSettings: (data: Settings) => request('/settings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
};