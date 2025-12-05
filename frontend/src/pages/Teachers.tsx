import React from 'react';
import { useAppContext } from '../AppContext';
import { Mail, Phone, Briefcase, User, ChevronUp } from 'lucide-react';

export const Teachers: React.FC = () => {
  const { teachers, settings } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-black text-center text-gray-900 dark:text-white mb-16">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
          اساتید برتر
        </span> {settings.appName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {teachers.map(teacher => (
          // Increased height to h-[500px] for better proportions
          <div key={teacher.id} className="group w-full max-w-sm h-[500px] [perspective:1000px] cursor-pointer">
            <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-2xl rounded-3xl">
              
              {/* --- FRONT SIDE --- */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex flex-col">
                
                {/* Image Section (75% height) */}
                <div className="h-[75%] relative overflow-hidden">
                  <img 
                    src={teacher.imageUrl} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Subtle gradient overlay for better depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Info Section (25% height) - Name displayed here */}
                <div className="h-[25%] bg-white dark:bg-gray-800 flex flex-col items-center justify-center p-4 relative z-10 border-t border-gray-100 dark:border-gray-700">
                  {/* Floating Action Button Design Element */}
                  <div className="absolute -top-6 w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-gray-800">
                    <User size={20} />
                  </div>
                  
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1 mt-2">{teacher.name}</h2>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                    مدرس ریاضی
                  </span>
                </div>
              </div>

              {/* --- BACK SIDE --- */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 flex flex-col justify-center text-center shadow-2xl border border-white/20 relative">
                
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-white/30 overflow-hidden shadow-lg p-1 bg-white/10 backdrop-blur-sm">
                       <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-sm">{teacher.name}</h3>
                    <div className="w-12 h-1 bg-white/50 mx-auto rounded-full mb-4"></div>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar px-1">
                       <p className="text-white/90 text-sm leading-relaxed font-medium text-justify" dir="rtl">
                         {teacher.bio}
                       </p>
                       
                       <div className="bg-white/10 rounded-xl p-3 backdrop-blur-md border border-white/10">
                          <div className="flex items-center justify-center gap-2 text-pink-200 mb-1">
                            <Briefcase size={16} />
                            <span className="font-bold text-sm">سابقه کاری</span>
                          </div>
                          <p className="text-xs text-white font-medium">{teacher.experience}</p>
                       </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/20 mt-auto">
                       <a href={`tel:${teacher.phone}`} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl transition-colors text-sm font-bold backdrop-blur-sm border border-white/10">
                         <Phone size={16} />
                         {teacher.phone}
                       </a>
                       <a href={`mailto:${teacher.email}`} className="flex items-center justify-center gap-2 bg-white text-purple-700 hover:bg-gray-100 py-2.5 rounded-xl transition-colors text-sm font-bold shadow-lg">
                         <Mail size={16} />
                         ارسال ایمیل
                       </a>
                    </div>
                </div>
              </div>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};