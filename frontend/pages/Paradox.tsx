
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const Paradox: React.FC = () => {
  const { paradoxes } = useAppContext();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          <span className="text-accent-500">پارادوکس‌های</span> شگفت‌انگیز
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          مسائلی که ذهن بزرگترین ریاضیدانان تاریخ را به چالش کشیده‌اند.
        </p>
      </div>

      <div className="space-y-6">
        {paradoxes.map((item) => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md"
          >
            <button
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="w-full flex items-center justify-between p-6 text-right focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">
                    {item.summary}
                  </p>
                </div>
              </div>
              <div className="text-gray-400">
                {openId === item.id ? <ChevronUp /> : <ChevronDown />}
              </div>
            </button>
            
            {openId === item.id && (
              <div className="px-6 pb-8 pt-0 animate-in slide-in-from-top-2 duration-200">
                 <div className="h-px w-full bg-gray-100 dark:bg-gray-700 mb-6"></div>
                 <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-loose text-justify whitespace-pre-wrap">
                   {item.content}
                 </div>
              </div>
            )}
          </div>
        ))}
        {paradoxes.length === 0 && (
            <div className="text-center text-gray-500 py-10">موردی یافت نشد.</div>
        )}
      </div>
    </div>
  );
};
