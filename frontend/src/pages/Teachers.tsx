import React from 'react';
import { useAppContext } from '../AppContext';
import { Mail, Phone, Briefcase, User } from 'lucide-react';

export const Teachers: React.FC = () => {
  const { teachers, settings } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-center text-gray-900 dark:text-white mb-12">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
          اساتید برتر
        </span> {settings.appName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
        {teachers.map(teacher => (
          <div key={teacher.id} className="group w-full max-w-sm h-[420px] [perspective:1000px] cursor-pointer">
            <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-xl rounded-3xl">
              
              {/* FRONT SIDE */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700">
                <div className="h-full flex flex-col">
                  <div className="flex-1 relative">
                    <img 
                      src={teacher.imageUrl} 
                      alt={teacher.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                      <h2 className="text-3xl font-bold mb-2 drop-shadow-md">{teacher.name}</h2>
                      <div className="w-16 h-1 bg-accent-500 mx-auto rounded-full"></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                      برای مشاهده جزئیات نگه دارید
                    </span>
                  </div>
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 flex flex-col justify-center text-center shadow-2xl border border-white/20 relative">
                
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-white/30 overflow-hidden shadow-lg p-1 bg-white/10 backdrop-blur-sm">
                       <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-sm">{teacher.name}</h3>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar">
                       <p className="text-white/90 text-sm leading-relaxed px-2 font-medium">
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

                    <div className="space-y-3 pt-4 border-t border-white/20">
                       <a href={`tel:${teacher.phone}`} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors text-sm font-bold backdrop-blur-sm border border-white/10">
                         <Phone size={16} />
                         {teacher.phone}
                       </a>
                       <a href={`mailto:${teacher.email}`} className="flex items-center justify-center gap-2 bg-white text-purple-700 hover:bg-gray-100 py-2 rounded-lg transition-colors text-sm font-bold shadow-lg">
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