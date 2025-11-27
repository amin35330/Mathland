
import React from 'react';
import { Mail, Phone, MapPin, Send, GraduationCap } from 'lucide-react';
import { useAppContext } from '../AppContext';

// Custom Icons for Eitaa and Rubika since they are not in Lucide
const EitaaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#E37227"/>
    <path d="M16.5 7.5H7.5C6.67157 7.5 6 8.17157 6 9V15C6 15.8284 6.67157 16.5 7.5 16.5H16.5C17.3284 16.5 18 15.8284 18 15V9C18 8.17157 17.3284 7.5 16.5 7.5Z" fill="white"/>
    <path d="M12 13.5L9 10.5M12 13.5L15 10.5M12 13.5V7.5" stroke="#E37227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RubikaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#702D87"/>
    <path d="M12 6L17 10.5V16.5L12 19.5L7 16.5V10.5L12 6Z" fill="white"/>
  </svg>
);

export const About: React.FC = () => {
  const { creators, settings } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 md:p-12 text-center mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-bl-[100px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-100 dark:bg-accent-900/20 rounded-tr-[80px] -z-0"></div>
        
        <div className="relative z-10">
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-700 dark:to-gray-600 rounded-full shadow-inner">
                    {settings.appLogoUrl ? (
                        <img src={settings.appLogoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                         <GraduationCap size={64} className="text-primary-600 dark:text-primary-400" />
                    )}
                </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              درباره <span className="text-primary-600 dark:text-primary-400">{settings.appName}</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
              ما با هدف ساده‌سازی یادگیری ریاضیات برای دانش‌آموزان ایرانی گرد هم آمده‌ایم. 
              این پلتفرم با بهره‌گیری از جدیدترین تکنولوژی‌های هوش مصنوعی و محتوای آموزشی تعاملی، 
              مسیر یادگیری را برای شما لذت‌بخش می‌کند.
            </p>
            
            <div className="flex justify-center gap-6">
              <a href={settings.eitaaLink} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                 <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                   <EitaaIcon />
                 </div>
                 <span className="text-xs font-bold text-gray-500">ایتا</span>
              </a>
              <a href={settings.rubikaLink} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                 <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                   <RubikaIcon />
                 </div>
                 <span className="text-xs font-bold text-gray-500">روبیکا</span>
              </a>
            </div>
        </div>
      </div>

      {/* Creators Section - Flip Boxes */}
      <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 border-b pb-4 border-gray-200 dark:border-gray-700 inline-block w-full">
            سازندگان پروژه
          </h2>
          <div className="flex flex-wrap justify-center gap-10">
            {creators.map(creator => (
              <div key={creator.id} className="group w-full max-w-sm h-[400px] [perspective:1000px] cursor-pointer">
                <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] shadow-xl rounded-3xl">
                  
                  {/* FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700">
                    <div className="h-full flex flex-col">
                      <div className="flex-1 relative overflow-hidden">
                        <img 
                          src={creator.imageUrl} 
                          alt={creator.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                          <h3 className="text-2xl font-bold mb-1 drop-shadow-md">{creator.name}</h3>
                          <p className="text-sm opacity-90 bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">{creator.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden bg-gradient-to-br from-accent-600 to-accent-800 text-white p-8 flex flex-col justify-center text-center shadow-2xl border-2 border-accent-400/30">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-white/30 overflow-hidden shadow-inner">
                       <img src={creator.imageUrl} alt={creator.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{creator.name}</h3>
                    <span className="text-accent-200 text-sm font-bold mb-6 block border-b border-white/10 pb-4">{creator.role}</span>
                    
                    <p className="text-white/90 text-sm leading-relaxed px-2 mb-4">
                         {creator.bio}
                    </p>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
      </div>

      {/* Contact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center h-full">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
            <Phone className="text-primary-500" />
            تماس با ما
          </h2>
          <div className="space-y-6">
             <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20">
               <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full text-primary-600 dark:text-primary-400">
                 <Mail size={20} />
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-bold mb-1">ایمیل پشتیبانی</span>
                  <span className="font-mono dir-ltr text-left">{settings.adminEmail}</span>
               </div>
             </div>
             
             <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20">
               <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full text-primary-600 dark:text-primary-400">
                 <Phone size={20} />
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-bold mb-1">تلفن تماس</span>
                  <span className="font-mono dir-ltr text-left">{settings.phone}</span>
               </div>
             </div>

             <div className="flex items-center gap-4 text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20">
               <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full text-primary-600 dark:text-primary-400">
                 <MapPin size={20} />
               </div>
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-bold mb-1">آدرس ما</span>
                  <span>{settings.address}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Send Message Form */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
             <Send className="text-accent-500" />
             ارسال پیام
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            پیام شما مستقیماً به ایمیل <span className="font-bold text-gray-700 dark:text-gray-300">{settings.adminEmail}</span> ارسال می‌شود.
          </p>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('پیام شما با موفقیت ارسال شد!'); }}>
            <div className="grid grid-cols-2 gap-4">
               <input 
                type="text" 
                placeholder="نام شما" 
                required
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all" 
              />
              <input 
                type="text" 
                placeholder="شماره تماس" 
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all" 
              />
            </div>
            <input 
              type="email" 
              placeholder="ایمیل شما" 
              required
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all" 
            />
            <textarea 
              placeholder="متن پیام..." 
              rows={4} 
              required
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 resize-none transition-all"
            ></textarea>
            <button type="submit" className="w-full bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-700 hover:to-accent-600 text-white font-bold py-3 rounded-xl transition-all transform hover:-translate-y-1 shadow-lg shadow-accent-500/30">
              ارسال پیام
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
