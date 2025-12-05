import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, Trash, LayoutDashboard, Book, User, X, Image as ImageIcon, PlayCircle, MonitorPlay, HelpCircle, Pencil, Users, Upload, Loader2, Check, Settings, Activity } from 'lucide-react';
import { Book as BookType, Teacher as TeacherType, Video as VideoType, Paradox as ParadoxType, Settings as SettingsType, Creator as CreatorType } from '../types';
import { validateApiKey } from '../services/geminiService';

export const Admin: React.FC = () => {
  const { isAuthenticated, login, logout, books, teachers, videos, paradoxes, creators, settings, updateData, updateSettings } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'books' | 'teachers' | 'videos' | 'paradoxes' | 'settings'>('dashboard');

  // Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isParadoxModalOpen, setIsParadoxModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [newBook, setNewBook] = useState<Partial<BookType>>({});
  const [newTeacher, setNewTeacher] = useState<Partial<TeacherType>>({});
  const [newVideo, setNewVideo] = useState<Partial<VideoType>>({});
  const [newParadox, setNewParadox] = useState<Partial<ParadoxType>>({});
  const [newCreator, setNewCreator] = useState<Partial<CreatorType>>({});
  const [tempSettings, setTempSettings] = useState<SettingsType>(settings);

  // API Key Test State
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const teacherFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const creatorFileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Initialize temp settings when settings change
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  // Login Logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@admin.com' && password === 'admin') {
      login();
    } else {
      alert('ایمیل یا رمز عبور اشتباه است (demo: admin@admin.com / admin)');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- Reset & Open Modals ---
  
  const openBookModal = (book?: BookType) => {
    if (book) {
      setNewBook(book);
      setEditingId(book.id);
    } else {
      setNewBook({ rating: 5, imageUrl: '' });
      setEditingId(null);
    }
    setIsBookModalOpen(true);
  };

  const openTeacherModal = (teacher?: TeacherType) => {
    if (teacher) {
      setNewTeacher(teacher);
      setEditingId(teacher.id);
    } else {
      setNewTeacher({ imageUrl: '' });
      setEditingId(null);
    }
    setIsTeacherModalOpen(true);
  };

  const openVideoModal = (video?: VideoType) => {
    if (video) {
      setNewVideo(video);
      setEditingId(video.id);
    } else {
      setNewVideo({ thumbnailUrl: '', duration: '' });
      setEditingId(null);
    }
    setIsVideoModalOpen(true);
  };

  const openParadoxModal = (paradox?: ParadoxType) => {
    if (paradox) {
      setNewParadox(paradox);
      setEditingId(paradox.id);
    } else {
      setNewParadox({});
      setEditingId(null);
    }
    setIsParadoxModalOpen(true);
  };

  const openCreatorModal = (creator: CreatorType) => {
    setNewCreator(creator);
    setEditingId(creator.id); // Creators always exist, we edit them
    setIsCreatorModalOpen(true);
  };

  const closeModals = () => {
    setIsBookModalOpen(false);
    setIsTeacherModalOpen(false);
    setIsVideoModalOpen(false);
    setIsParadoxModalOpen(false);
    setIsCreatorModalOpen(false);
    setEditingId(null);
  };

  // --- Image Handlers ---

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<any>>, field: string = 'imageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter((prev: any) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings(prev => ({ ...prev, appLogoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- API Key Test ---
  const handleTestApiKey = async () => {
    // حتی اگر کلید خالی باشد هم اجازه تست می‌دهیم تا ببینیم سرور چه می‌گوید
    setIsTestingKey(true);
    setKeyStatus('idle');
    setTestMessage('در حال ارسال درخواست تست به سرور...');
    
    try {
        const result = await validateApiKey(tempSettings.apiKey);
        setKeyStatus(result.success ? 'success' : 'error');
        setTestMessage(result.message);
    } catch (e: any) {
        setKeyStatus('error');
        setTestMessage(e.message || 'خطای ناشناخته در تست');
    } finally {
        setIsTestingKey(false);
    }
  };

  // --- Save Handlers ---

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;

    if (editingId) {
      const updated = books.map(b => b.id === editingId ? { ...b, ...newBook } as BookType : b);
      updateData('books', updated);
    } else {
      const item: BookType = {
        id: Date.now().toString(),
        title: newBook.title!,
        author: newBook.author || 'نامشخص',
        description: newBook.description || '',
        subject: newBook.subject || 'عمومی',
        imageUrl: newBook.imageUrl || 'https://picsum.photos/200/300',
        downloadUrl: newBook.downloadUrl || '#',
        rating: newBook.rating || 5,
      };
      updateData('books', [...books, item]);
    }
    closeModals();
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name) return;

    if (editingId) {
      const updated = teachers.map(t => t.id === editingId ? { ...t, ...newTeacher } as TeacherType : t);
      updateData('teachers', updated);
    } else {
      const item: TeacherType = {
        id: Date.now().toString(),
        name: newTeacher.name!,
        bio: newTeacher.bio || '',
        experience: newTeacher.experience || '',
        phone: newTeacher.phone || '',
        email: newTeacher.email || '',
        imageUrl: newTeacher.imageUrl || 'https://picsum.photos/300/300',
      };
      updateData('teachers', [...teachers, item]);
    }
    closeModals();
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title) return;

    if (editingId) {
      const updated = videos.map(v => v.id === editingId ? { ...v, ...newVideo } as VideoType : v);
      updateData('videos', updated);
    } else {
      const item: VideoType = {
        id: Date.now().toString(),
        title: newVideo.title!,
        tutor: newVideo.tutor || '',
        category: newVideo.category || '',
        videoUrl: newVideo.videoUrl || '',
        duration: newVideo.duration || '00:00',
        thumbnailUrl: newVideo.thumbnailUrl || 'https://picsum.photos/300/180',
      };
      updateData('videos', [...videos, item]);
    }
    closeModals();
  };

  const handleSaveParadox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParadox.title) return;

    if (editingId) {
      const updated = paradoxes.map(p => p.id === editingId ? { ...p, ...newParadox } as ParadoxType : p);
      updateData('paradoxes', updated);
    } else {
      const item: ParadoxType = {
        id: Date.now().toString(),
        title: newParadox.title!,
        summary: newParadox.summary || '',
        content: newParadox.content || '',
      };
      updateData('paradoxes', [...paradoxes, item]);
    }
    closeModals();
  };

  const handleSaveCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreator.name || !editingId) return;
    
    const updated = creators.map(c => c.id === editingId ? { ...c, ...newCreator } as CreatorType : c);
    updateData('creators', updated);
    closeModals();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // مستقیم ذخیره می‌کنیم تا تداخل ایجاد نشود
      await updateSettings(tempSettings);
      alert('تنظیمات با موفقیت در سرور ذخیره شد.');
    } catch (error) {
      console.error(error);
      alert('خطا در ذخیره تنظیمات.');
    }
  };

  // --- Delete Handlers ---

  const deleteItem = (type: 'books' | 'teachers' | 'videos' | 'paradoxes', id: string) => {
    if (window.confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      switch (type) {
        case 'books': updateData('books', books.filter(b => b.id !== id)); break;
        case 'teachers': updateData('teachers', teachers.filter(t => t.id !== id)); break;
        case 'videos': updateData('videos', videos.filter(v => v.id !== id)); break;
        case 'paradoxes': updateData('paradoxes', paradoxes.filter(p => p.id !== id)); break;
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
          <div className="flex justify-center mb-6 text-primary-600 dark:text-primary-400">
            <div className="bg-primary-50 dark:bg-gray-700 p-4 rounded-full">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">ورود به پنل مدیریت</h2>
          <p className="text-center text-gray-500 mb-8 text-sm">اطلاعات ورود (demo: admin@admin.com / admin)</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="ایمیل" dir="ltr" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="رمز عبور" dir="ltr" />
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold">ورود</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-accent-500 rounded-lg"></div>
          <span className="font-bold text-lg dark:text-white">پنل ادمین</span>
        </div>
        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'داشبورد' },
            { id: 'settings', icon: Settings, label: 'تنظیمات و سازندگان' },
            { id: 'books', icon: Book, label: 'مدیریت کتاب‌ها' },
            { id: 'teachers', icon: User, label: 'مدیریت معلمین' },
            { id: 'videos', icon: PlayCircle, label: 'مدیریت ویدیوها' },
            { id: 'paradoxes', icon: HelpCircle, label: 'مدیریت پارادوکس‌ها' },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 mt-8">
            <span>خروج</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">آمار کلی سایت</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-gray-500 text-sm mb-1">تعداد کتاب‌ها</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{books.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-gray-500 text-sm mb-1">تعداد معلمین</div>
                <div className="text-3xl font-bold text-primary-500">{teachers.length}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-gray-500 text-sm mb-1">ویدیوها</div>
                <div className="text-3xl font-bold text-accent-500">{videos.length}</div>
              </div>
               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="text-gray-500 text-sm mb-1">پارادوکس‌ها</div>
                <div className="text-3xl font-bold text-indigo-500">{paradoxes.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تنظیمات سایت و سازندگان</h2>
             
             {/* General Settings */}
             <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="col-span-1 md:col-span-2">
                    <h3 className="font-bold text-lg text-primary-600 mb-4 border-b pb-2">مشخصات اصلی</h3>
                 </div>
                 
                 {/* Logo Upload */}
                 <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer group" onClick={() => logoInputRef.current?.click()}>
                    <div className="flex flex-col items-center gap-2">
                        {tempSettings.appLogoUrl ? (
                             <div className="relative">
                                <img src={tempSettings.appLogoUrl} alt="Logo Preview" className="h-24 w-auto object-contain" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                     <Pencil className="text-white" />
                                </div>
                             </div>
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <Upload size={32} />
                                <span className="text-sm mt-2">آپلود لوگو (PNG, SVG)</span>
                            </div>
                        )}
                    </div>
                 </div>
                 <input type="file" ref={logoInputRef} className="hidden" onChange={handleLogoUpload} accept="image/*" />

                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">نام نرم افزار / سایت</label>
                    <input type="text" value={tempSettings.appName} onChange={e => setTempSettings({...tempSettings, appName: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">ایمیل ادمین (برای دریافت پیام)</label>
                    <input type="text" value={tempSettings.adminEmail} onChange={e => setTempSettings({...tempSettings, adminEmail: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
                 </div>

                 {/* API KEY SECTION */}
                 <div className="col-span-1 md:col-span-2 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                    <h3 className="font-bold text-lg text-primary-600 mb-2">تنظیمات هوش مصنوعی (Google Gemini)</h3>
                    <label className="text-sm font-bold dark:text-gray-300">کلید API (API Key)</label>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input 
                                type="password" 
                                value={tempSettings.apiKey || ''} 
                                onChange={e => {
                                    setTempSettings({...tempSettings, apiKey: e.target.value});
                                    setKeyStatus('idle');
                                    setTestMessage('');
                                }} 
                                className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" 
                                dir="ltr"
                                placeholder="AIza..."
                            />
                            <button 
                                type="button"
                                onClick={handleTestApiKey}
                                disabled={isTestingKey}
                                className={`px-4 py-2 rounded font-bold text-white flex items-center gap-2 transition-all ${
                                    isTestingKey ? 'bg-gray-400' : 
                                    keyStatus === 'success' ? 'bg-green-500' :
                                    keyStatus === 'error' ? 'bg-red-500' :
                                    'bg-blue-500 hover:bg-blue-600'
                                }`}
                            >
                                {isTestingKey ? <Loader2 className="animate-spin" size={18} /> : <Activity size={18} />}
                                {isTestingKey ? 'در حال تست...' : 'تست اتصال'}
                            </button>
                        </div>
                        {/* نمایش پیام نتیجه تست */}
                        {testMessage && (
                            <div className={`text-xs font-mono p-2 rounded border ${
                                keyStatus === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 
                                keyStatus === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50'
                            }`}>
                                {testMessage}
                            </div>
                        )}
                    </div>
                 </div>

                 <div className="col-span-1 md:col-span-2 mt-4">
                    <h3 className="font-bold text-lg text-primary-600 mb-4 border-b pb-2">شبکه‌های اجتماعی و تماس</h3>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">لینک کانال ایتا</label>
                    <input type="text" value={tempSettings.eitaaLink} onChange={e => setTempSettings({...tempSettings, eitaaLink: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">لینک کانال روبیکا</label>
                    <input type="text" value={tempSettings.rubikaLink} onChange={e => setTempSettings({...tempSettings, rubikaLink: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">تلفن تماس</label>
                    <input type="text" value={tempSettings.phone} onChange={e => setTempSettings({...tempSettings, phone: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">آدرس</label>
                    <input type="text" value={tempSettings.address} onChange={e => setTempSettings({...tempSettings, address: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                 </div>
                 
                 <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-bold dark:text-gray-300">متن کپی‌رایت فوتر</label>
                    <textarea value={tempSettings.copyrightText} onChange={e => setTempSettings({...tempSettings, copyrightText: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} />
                 </div>

                 <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 shadow-lg shadow-green-600/30">ذخیره تغییرات</button>
                 </div>
             </form>

             {/* Creators Management */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg text-primary-600 mb-4 border-b pb-2 flex items-center gap-2">
                  <Users size={20} />
                  مدیریت سازندگان (درباره ما)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {creators.map(creator => (
                     <div key={creator.id} className="flex items-center gap-4 p-4 border rounded-lg dark:border-gray-700">
                        <img src={creator.imageUrl} alt={creator.name} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1">
                           <div className="font-bold dark:text-white">{creator.name}</div>
                           <div className="text-xs text-gray-500">{creator.role}</div>
                        </div>
                        <button onClick={() => openCreatorModal(creator)} className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors">
                           <Pencil size={18} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* BOOKS */}
        {activeTab === 'books' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">لیست کتاب‌ها</h2>
               <button onClick={() => openBookModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700">
                 <Plus size={18} /> افزودن کتاب
               </button>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
               <table className="w-full text-right">
                 <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                   <tr>
                     <th className="p-4 text-sm">عنوان</th>
                     <th className="p-4 text-sm">نویسنده</th>
                     <th className="p-4 text-sm">عملیات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {books.map(book => (
                     <tr key={book.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                       <td className="p-4 dark:text-white">{book.title}</td>
                       <td className="p-4 dark:text-gray-400">{book.author}</td>
                       <td className="p-4 flex gap-2">
                         <button onClick={() => openBookModal(book)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Pencil size={18} /></button>
                         <button onClick={() => deleteItem('books', book.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={18} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">لیست معلمین</h2>
               <button onClick={() => openTeacherModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700">
                 <Plus size={18} /> افزودن معلم
               </button>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
               <table className="w-full text-right">
                 <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                   <tr>
                     <th className="p-4 text-sm">نام</th>
                     <th className="p-4 text-sm">سابقه</th>
                     <th className="p-4 text-sm">عملیات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {teachers.map(teacher => (
                     <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                       <td className="p-4 dark:text-white">{teacher.name}</td>
                       <td className="p-4 dark:text-gray-400">{teacher.experience}</td>
                       <td className="p-4 flex gap-2">
                         <button onClick={() => openTeacherModal(teacher)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Pencil size={18} /></button>
                         <button onClick={() => deleteItem('teachers', teacher.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={18} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* VIDEOS */}
        {activeTab === 'videos' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">لیست ویدیوها</h2>
               <button onClick={() => openVideoModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700">
                 <Plus size={18} /> افزودن ویدیو
               </button>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
               <table className="w-full text-right">
                 <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                   <tr>
                     <th className="p-4 text-sm">عنوان</th>
                     <th className="p-4 text-sm">مدرس</th>
                     <th className="p-4 text-sm">پایه</th>
                     <th className="p-4 text-sm">عملیات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {videos.map(video => (
                     <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                       <td className="p-4 dark:text-white">{video.title}</td>
                       <td className="p-4 dark:text-gray-400">{video.tutor}</td>
                       <td className="p-4 dark:text-gray-400">{video.category}</td>
                       <td className="p-4 flex gap-2">
                         <button onClick={() => openVideoModal(video)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Pencil size={18} /></button>
                         <button onClick={() => deleteItem('videos', video.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={18} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* PARADOXES */}
        {activeTab === 'paradoxes' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت پارادوکس‌ها</h2>
               <button onClick={() => openParadoxModal()} className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700">
                 <Plus size={18} /> افزودن پارادوکس
               </button>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
               <table className="w-full text-right">
                 <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                   <tr>
                     <th className="p-4 text-sm">عنوان</th>
                     <th className="p-4 text-sm">خلاصه</th>
                     <th className="p-4 text-sm">عملیات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                   {paradoxes.map(item => (
                     <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                       <td className="p-4 dark:text-white font-bold">{item.title}</td>
                       <td className="p-4 dark:text-gray-400 text-sm truncate max-w-xs">{item.summary}</td>
                       <td className="p-4 flex gap-2">
                         <button onClick={() => openParadoxModal(item)} className="text-blue-500 hover:bg-blue-50 p-2 rounded"><Pencil size={18} /></button>
                         <button onClick={() => deleteItem('paradoxes', item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash size={18} /></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-white">{editingId ? 'ویرایش کتاب' : 'افزودن کتاب'}</h3>
              <button onClick={closeModals}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-48 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden relative bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {newBook.imageUrl ? <img src={newBook.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400" />}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewBook)} accept="image/*" />
              </div>
              <input placeholder="عنوان" value={newBook.title || ''} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="نویسنده" value={newBook.author || ''} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="موضوع" value={newBook.subject || ''} onChange={e => setNewBook({...newBook, subject: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <textarea placeholder="توضیحات" value={newBook.description || ''} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} />
              <input placeholder="لینک دانلود" value={newBook.downloadUrl || ''} onChange={e => setNewBook({...newBook, downloadUrl: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              <button className="w-full bg-primary-600 text-white py-3 rounded font-bold hover:bg-primary-700">{editingId ? 'بروزرسانی' : 'ذخیره'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-white">{editingId ? 'ویرایش معلم' : 'افزودن معلم'}</h3>
              <button onClick={closeModals}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden relative bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => teacherFileInputRef.current?.click()}>
                  {newTeacher.imageUrl ? <img src={newTeacher.imageUrl} className="w-full h-full object-cover" /> : <User className="text-gray-400" />}
                </div>
                <input type="file" ref={teacherFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewTeacher)} accept="image/*" />
              </div>
              <input placeholder="نام و نام خانوادگی" value={newTeacher.name || ''} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="سابقه" value={newTeacher.experience || ''} onChange={e => setNewTeacher({...newTeacher, experience: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <input placeholder="تلفن" value={newTeacher.phone || ''} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              <input placeholder="ایمیل" value={newTeacher.email || ''} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              <textarea placeholder="بیوگرافی" value={newTeacher.bio || ''} onChange={e => setNewTeacher({...newTeacher, bio: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} />
              <button className="w-full bg-primary-600 text-white py-3 rounded font-bold hover:bg-primary-700">{editingId ? 'بروزرسانی' : 'ذخیره'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {isVideoModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-white">{editingId ? 'ویرایش ویدیو' : 'افزودن ویدیو'}</h3>
              <button onClick={closeModals}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveVideo} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="w-48 h-28 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden relative bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => videoFileInputRef.current?.click()}>
                  {newVideo.thumbnailUrl ? <img src={newVideo.thumbnailUrl} className="w-full h-full object-cover" /> : <MonitorPlay className="text-gray-400" />}
                </div>
                <input type="file" ref={videoFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewVideo, 'thumbnailUrl')} accept="image/*" />
              </div>
              <input placeholder="عنوان ویدیو" value={newVideo.title || ''} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="نام مدرس" value={newVideo.tutor || ''} onChange={e => setNewVideo({...newVideo, tutor: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <input placeholder="پایه (دسته‌بندی)" value={newVideo.category || ''} onChange={e => setNewVideo({...newVideo, category: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="مدت زمان (مثلا 10:00)" value={newVideo.duration || ''} onChange={e => setNewVideo({...newVideo, duration: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="ltr" />
              <textarea placeholder="کد امبد (IFrame) از آپارات" value={newVideo.videoUrl || ''} onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" rows={4} dir="ltr" />
              <button className="w-full bg-primary-600 text-white py-3 rounded font-bold hover:bg-primary-700">{editingId ? 'بروزرسانی' : 'ذخیره'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Paradox Modal */}
      {isParadoxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-white">{editingId ? 'ویرایش پارادوکس' : 'افزودن پارادوکس'}</h3>
              <button onClick={closeModals}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveParadox} className="space-y-4">
              <input placeholder="عنوان پارادوکس" value={newParadox.title || ''} onChange={e => setNewParadox({...newParadox, title: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="خلاصه کوتاه" value={newParadox.summary || ''} onChange={e => setNewParadox({...newParadox, summary: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <textarea placeholder="شرح کامل و محتوای پارادوکس..." value={newParadox.content || ''} onChange={e => setNewParadox({...newParadox, content: e.target.value})} className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[200px]" required />
              <button className="w-full bg-primary-600 text-white py-3 rounded font-bold hover:bg-primary-700">{editingId ? 'بروزرسانی' : 'ذخیره'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Creator Modal */}
      {isCreatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold dark:text-white">ویرایش سازنده</h3>
              <button onClick={closeModals}><X size={24} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSaveCreator} className="space-y-4">
               <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden relative bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => creatorFileInputRef.current?.click()}>
                  {newCreator.imageUrl ? <img src={newCreator.imageUrl} className="w-full h-full object-cover" /> : <User className="text-gray-400" />}
                </div>
                <input type="file" ref={creatorFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewCreator)} accept="image/*" />
              </div>
              <input placeholder="نام" value={newCreator.name || ''} onChange={e => setNewCreator({...newCreator, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <input placeholder="نقش / پایه" value={newCreator.role || ''} onChange={e => setNewCreator({...newCreator, role: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
              <textarea placeholder="بیوگرافی کوتاه" value={newCreator.bio || ''} onChange={e => setNewCreator({...newCreator, bio: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} required />
              <button className="w-full bg-primary-600 text-white py-2 rounded font-bold hover:bg-primary-700">ذخیره تغییرات</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};