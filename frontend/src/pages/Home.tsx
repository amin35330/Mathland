import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, BookOpen, User, PlayCircle, AlertTriangle, GraduationCap, Mic, MicOff, ClipboardPaste, Image as ImageIcon, X, ArrowLeft, Terminal } from 'lucide-react';
import { solveMathProblem } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export const Home: React.FC = () => {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // متغیر جدید برای ذخیره جزئیات فنی خطا
  const [debugLog, setDebugLog] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const { settings } = useAppContext();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Paste Event for Images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setImage(event.target?.result as string);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('مرورگر شما از قابلیت تایپ صوتی پشتیبانی نمی‌کند.');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'fa-IR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input && !image) return;
    
    // پاک کردن لاگ‌های قبلی
    setDebugLog(null);
    setError(null);
    setResponse(null);

    // بررسی اولیه
    if (!settings.apiKey) {
        const msg = 'کلید API تنظیم نشده است. لطفاً در پنل ادمین کلید را وارد کنید.';
        setError(msg);
        setDebugLog(`[Frontend Error]: ${msg}`);
        return;
    }

    setLoading(true);

    try {
      let base64Data = undefined;
      let mimeType = 'image/jpeg';

      if (image) {
        const match = image.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        } else {
          base64Data = image.split(',')[1];
        }
      }

      const result = await solveMathProblem(input, base64Data, mimeType, settings.apiKey);
      setResponse(result);
    } catch (err: any) {
      // نمایش خطای کاربر پسند
      setError('مشکلی در ارتباط با سرور پیش آمد.');
      // نمایش خطای فنی کامل در باکس لاگ
      setDebugLog(`[Detailed Error Log]\nTime: ${new Date().toLocaleTimeString()}\nMessage: ${err.message}\nStack: ${err.stack || 'N/A'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative font-sans selection:bg-primary-200 selection:text-primary-900">
      
      <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 relative z-10">
        
        {/* Hero Header */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-primary-200 dark:border-primary-900 shadow-lg text-primary-700 dark:text-primary-300 text-sm font-bold mb-6 animate-in slide-in-from-top-4 fade-in duration-700">
            <Sparkles size={16} className="animate-pulse text-accent-500" />
            <span>پاسخ‌دهی هوشمند • حل مسائل درسی</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight mb-6 drop-shadow-sm">
            <span className="block">مسائل ریاضی رو</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 animate-pulse-glow bg-[length:200%_auto]">
              سـاده و سریع
            </span>
             <span className="block">حل کن!</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-8 font-medium">
            عکس مسئله رو بفرست یا سوالت رو بنویس؛ من برات توضیح میدم.
          </p>
        </div>

        {/* Main Interaction Area */}
        <div className="relative max-w-4xl mx-auto z-20">
           <div className="absolute -top-6 -right-6 w-20 h-20 bg-accent-400/40 rounded-2xl rotate-12 blur-xl animate-pulse"></div>
           <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-400/40 rounded-full blur-xl animate-pulse-glow"></div>

          <div className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(139,92,246,0.2)] dark:shadow-black/50 border border-white/50 dark:border-white/10 overflow-hidden transition-all">
            
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Combined Input Area */}
                <div className="relative bg-white/50 dark:bg-gray-900/40 rounded-3xl border-2 border-transparent focus-within:border-primary-400 dark:focus-within:border-primary-600 transition-all">
                  
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="سوالت رو اینجا بنویس یا عکس مسئله رو بچسبون (Ctrl+V)..."
                    className="w-full min-h-[160px] bg-transparent resize-none outline-none text-xl md:text-2xl text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed p-6"
                    dir="rtl"
                  />

                  {/* Image Preview */}
                  {image && (
                    <div className="px-6 pb-4">
                      <div className="relative inline-block group">
                        <img src={image} alt="Preview" className="h-32 w-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-md" />
                        <button 
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 mx-2">
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={startListening}
                        className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-primary-100 hover:text-primary-600'}`}
                        title="تایپ صوتی"
                      >
                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        <span className="text-sm font-medium hidden sm:inline">{isListening ? 'در حال شنیدن...' : 'صوتی'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${image ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-primary-100 hover:text-primary-600'}`}
                        title="آپلود عکس"
                      >
                        <ImageIcon size={20} />
                        <span className="text-sm font-medium hidden sm:inline">تصویر</span>
                      </button>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || (!input && !image)}
                      className={`
                        px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 hover:shadow-lg
                        ${loading || (!input && !image)
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-primary-500/30'
                        }
                      `}
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      <span>حل کن</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          <div className="text-center mt-4 text-gray-500 dark:text-gray-400 text-sm flex justify-center gap-6">
             <span className="flex items-center gap-1"><ClipboardPaste size={14}/> چسباندن تصویر فعال</span>
          </div>

          {/* --- DEBUG LOG BOX (NEW) --- */}
          {debugLog && (
            <div className="mt-8 animate-in slide-in-from-top-4">
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl border border-gray-700 shadow-2xl font-mono text-xs md:text-sm overflow-x-auto text-left dir-ltr relative">
                    <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-2 text-gray-400">
                        <Terminal size={16} />
                        <span className="font-bold">System Debug Log</span>
                    </div>
                    <pre className="whitespace-pre-wrap break-all">{debugLog}</pre>
                </div>
            </div>
          )}
          {/* --------------------------- */}

        </div>

        {/* Error Alert (Simple) */}
        {error && !debugLog && (
          <div className="max-w-4xl mx-auto mt-8 animate-in slide-in-from-top-2">
            <div className="bg-red-50 dark:bg-red-900/30 border-r-4 border-red-500 p-4 rounded-xl flex items-center gap-3">
              <AlertTriangle className="text-red-500 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Answer Section */}
        {response && (
          <div className="max-w-4xl mx-auto mt-16 animate-in slide-in-from-bottom-8 duration-700 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-200 to-accent-200 blur-3xl opacity-40 -z-10"></div>
            
            <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden relative border border-white/50 dark:border-gray-700">
              <div className="bg-gradient-to-r from-primary-100/50 to-accent-100/50 dark:from-primary-900/30 dark:to-accent-900/30 p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full text-green-600 dark:text-green-400 shadow-inner">
                  <GraduationCap size={24} />
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">پاسخ معلم:</h3>
              </div>
              
              <div className="p-8 md:p-12 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] dark:bg-none">
                <div className="prose dark:prose-invert prose-xl max-w-none text-gray-800 dark:text-gray-200 leading-loose" dir="rtl">
                  <div className="whitespace-pre-wrap font-medium">
                    {response}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
                 <div className="text-sm text-gray-500">مفید بود؟</div>
                 <button 
                   onClick={() => navigator.clipboard.writeText(response)}
                   className="text-primary-600 hover:bg-primary-100 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                 >
                   کپی متن
                 </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Features - Redesigned */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          
          <Link to="/books" className="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-1 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/40 dark:border-white/10">
            <div className="bg-white dark:bg-gray-800/80 h-full rounded-[2.2rem] p-8 overflow-hidden relative">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-2xl group-hover:bg-primary-200 dark:group-hover:bg-primary-900/30 transition-colors"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-500">
                          <BookOpen size={32} />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">کتابخانه</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">دانلود رایگان کتاب‌های درسی و جزوات آموزشی برتر.</p>
                </div>
            </div>
          </Link>

          <Link to="/teachers" className="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-1 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/40 dark:border-white/10">
            <div className="bg-white dark:bg-gray-800/80 h-full rounded-[2.2rem] p-8 overflow-hidden relative">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-2xl group-hover:bg-accent-200 dark:group-hover:bg-accent-900/30 transition-colors"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-pink-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:scale-110 transition-transform duration-500">
                          <User size={32} />
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">معلمین برتر</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">ارتباط مستقیم با اساتید مجرب و دریافت مشاوره تخصصی.</p>
                </div>
            </div>
          </Link>

          <Link to="/videos" className="group relative bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl p-1 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/40 dark:border-white/10">
            <div className="bg-white dark:bg-gray-800/80 h-full rounded-[2.2rem] p-8 overflow-hidden relative">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-500">
                          <PlayCircle size={32} />
                        </div>
                         <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">ویدیو کلوپ</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4">دسترسی به آرشیو فیلم‌های آموزشی و نکات تستی.</p>
                </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};