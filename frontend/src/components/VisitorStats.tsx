import React, { useEffect, useState } from 'react';
import { Calendar, Sun, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { Stats } from '../types';

export const VisitorStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ total: 0, monthly: 0, daily: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStats = async () => {
      try {
        const lastVisitDate = localStorage.getItem('last_visit_date');
        const today = new Date().toISOString().split('T')[0];

        if (lastVisitDate !== today) {
          await api.recordVisit();
          localStorage.setItem('last_visit_date', today);
        }

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

  if (loading) return null;

  return (
    // تغییرات اصلی اینجا اعمال شد:
    // mt-12: فاصله از بالا کم شد تا به کارت‌ها نزدیک‌تر شود
    // mb-8: فاصله از پایین دقیقاً حدود ۳۰ پیکسل تنظیم شد
    <div className="w-full max-w-3xl mx-auto mt-12 mb-8 px-4 animate-in slide-in-from-bottom-8 duration-1000">
      {/* Container: Capsule Shape */}
      <div className="relative bg-white/30 dark:bg-gray-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] px-4 py-3 md:px-8 md:py-4 group hover:shadow-[0_20px_50px_-10px_rgba(124,58,237,0.2)] transition-all duration-500">
        
        {/* Decorative Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-700 rounded-full"></div>

        <div className="relative flex justify-between items-center divide-x divide-x-reverse divide-gray-400/30 dark:divide-gray-600/30">
          
          {/* Daily */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center px-2">
            <div className="p-1.5 bg-yellow-400/20 text-yellow-600 dark:text-yellow-300 rounded-full shadow-inner">
              <Sun size={18} />
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline gap-1">
                <span className="text-xl font-black text-gray-800 dark:text-white">
                  {stats.daily.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 opacity-80">امروز</span>
            </div>
          </div>

          {/* Monthly */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center px-2">
            <div className="p-1.5 bg-blue-400/20 text-blue-600 dark:text-blue-300 rounded-full shadow-inner">
              <Calendar size={18} />
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline gap-1">
                <span className="text-xl font-black text-gray-800 dark:text-white">
                  {stats.monthly.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 opacity-80">این ماه</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-center px-2">
            <div className="p-1.5 bg-purple-400/20 text-purple-600 dark:text-purple-300 rounded-full shadow-inner">
              <TrendingUp size={18} />
            </div>
            <div className="flex flex-col md:flex-row md:items-baseline gap-1">
                <span className="text-xl font-black text-gray-800 dark:text-white">
                  {stats.total.toLocaleString('fa-IR')}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-gray-600 dark:text-gray-300 opacity-80">کل بازدید</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};