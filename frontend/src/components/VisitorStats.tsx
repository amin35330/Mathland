import React, { useEffect, useState } from 'react';
import { Users, Calendar, Sun, Activity } from 'lucide-react';
import { api } from '../services/api';
import { Stats } from '../types';

export const VisitorStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, monthly: 0, daily: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStats = async () => {
      try {
        // 1. بررسی آیا امروز بازدید ثبت شده؟
        const lastVisitDate = localStorage.getItem('last_visit_date');
        const today = new Date().toISOString().split('T')[0];

        if (lastVisitDate !== today) {
          // اگر تاریخ آخرین بازدید امروز نیست، بازدید جدید ثبت کن
          await api.recordVisit();
          localStorage.setItem('last_visit_date', today);
        }

        // 2. دریافت آمار به‌روز
        const data = await api.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    initStats();
  }, []);

  if (loading) return null; // تا وقتی لود نشده چیزی نشان نده

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 mb-8 px-4 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl shadow-lg p-6 relative overflow-hidden group">
        
        {/* Background Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
        
        <div className="grid grid-cols-3 gap-4 md:gap-8 divide-x divide-x-reverse divide-gray-200/50 dark:divide-gray-700/50">
          
          {/* Daily */}
          <div className="flex flex-col items-center justify-center text-center group/item">
            <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300">
              <Sun size={20} />
            </div>
            <span className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-1">
              {stats.daily.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">بازدید امروز</span>
          </div>

          {/* Monthly */}
          <div className="flex flex-col items-center justify-center text-center group/item">
            <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300">
              <Calendar size={20} />
            </div>
            <span className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-1">
              {stats.monthly.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">بازدید ماهانه</span>
          </div>

          {/* Total */}
          <div className="flex flex-col items-center justify-center text-center group/item">
            <div className="mb-2 p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full shadow-sm group-hover/item:scale-110 transition-transform duration-300">
              <Activity size={20} />
            </div>
            <span className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-1">
              {stats.total.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">بازدید کل</span>
          </div>

        </div>
      </div>
    </div>
  );
};