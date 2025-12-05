import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, Trash, LayoutDashboard, Book, User, X, Image as ImageIcon, PlayCircle, MonitorPlay, HelpCircle, Pencil, Users, Upload, Loader2, Activity, Settings } from 'lucide-react';
import { Book as BookType, Teacher as TeacherType, Video as VideoType, Paradox as ParadoxType, Settings as SettingsType, Creator as CreatorType } from '../types';
import { validateApiKey } from '../services/geminiService';

export const Admin: React.FC = () => {
  const { isAuthenticated, login, logout, books, teachers, videos, paradoxes, creators, settings, updateData, updateSettings } = useAppContext();
  const navigate = useNavigate();
  
  // Login State
  const [username, setUsername] = useState('');
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

  // --- Login Logic ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Admin' && password === 'Taraneh@123') {
      login();
    } else {
      alert('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- Image Handlers (With Size Check) ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<any>>, field: string = 'imageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
          alert('حجم تصویر انتخاب شده زیاد است (بیشتر از ۱ مگابایت). لطفاً تصویر کم‌حجم‌تری انتخاب کنید.');
          return;
      }
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
      if (file.size > 1024 * 1024) {
          alert('حجم لوگو زیاد است. لطفاً فایل زیر ۱ مگابایت انتخاب کنید.');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempSettings(prev => ({ ...prev, appLogoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Modals Open/Close ---
  const openBookModal = (book?: BookType) => {
    setNewBook(book ? book : { rating: 5, imageUrl: '' });
    setEditingId(book ? book.id : null);
    setIsBookModalOpen(true);
  };
  const openTeacherModal = (teacher?: TeacherType) => {
    setNewTeacher(teacher ? teacher : { imageUrl: '' });
    setEditingId(teacher ? teacher.id : null);
    setIsTeacherModalOpen(true);
  };
  const openVideoModal = (video?: VideoType) => {
    setNewVideo(video ? video : { thumbnailUrl: '', duration: '' });
    setEditingId(video ? video.id : null);
    setIsVideoModalOpen(true);
  };
  const openParadoxModal = (paradox?: ParadoxType) => {
    setNewParadox(paradox ? paradox : {});
    setEditingId(paradox ? paradox.id : null);
    setIsParadoxModalOpen(true);
  };
  const openCreatorModal = (creator?: CreatorType) => {
    setNewCreator(creator ? creator : { imageUrl: '' });
    setEditingId(creator ? creator.id : null);
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

  // --- API Test ---
  const handleTestApiKey = async () => {
    setIsTestingKey(true);
    setKeyStatus('idle');
    setTestMessage('در حال تست...');
    try {
        const result = await validateApiKey(tempSettings.apiKey);
        setKeyStatus(result.success ? 'success' : 'error');
        setTestMessage(result.message);
    } catch (e: any) {
        setKeyStatus('error');
        setTestMessage(e.message);
    } finally {
        setIsTestingKey(false);
    }
  };

  // --- Save Handlers ---
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title) return;
    const item = { ...newBook, id: editingId || Date.now().toString() } as BookType;
    if (!item.author) item.author = 'نامشخص';
    if (!item.imageUrl) item.imageUrl = 'https://picsum.photos/200/300';
    
    const updated = editingId ? books.map(b => b.id === editingId ? item : b) : [...books, item];
    updateData('books', updated);
    closeModals();
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name) return;
    const item = { ...newTeacher, id: editingId || Date.now().toString() } as TeacherType;
    if (!item.imageUrl) item.imageUrl = 'https://picsum.photos/300/300';

    const updated = editingId ? teachers.map(t => t.id === editingId ? item : t) : [...teachers, item];
    updateData('teachers', updated);
    closeModals();
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title) return;
    const item = { ...newVideo, id: editingId || Date.now().toString() } as VideoType;
    if (!item.thumbnailUrl) item.thumbnailUrl = 'https://picsum.photos/300/180';

    const updated = editingId ? videos.map(v => v.id === editingId ? item : v) : [...videos, item];
    updateData('videos', updated);
    closeModals();
  };

  const handleSaveParadox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParadox.title) return;
    const item = { ...newParadox, id: editingId || Date.now().toString() } as ParadoxType;
    
    const updated = editingId ? paradoxes.map(p => p.id === editingId ? item : p) : [...paradoxes, item];
    updateData('paradoxes', updated);
    closeModals();
  };

  const handleSaveCreator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreator.name) return;
    const item = { ...newCreator, id: editingId || Date.now().toString() } as CreatorType;
    if (!item.imageUrl) item.imageUrl = 'https://picsum.photos/200';

    const updated = editingId ? creators.map(c => c.id === editingId ? item : c) : [...creators, item];
    updateData('creators', updated);
    closeModals();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(tempSettings);
      alert('تنظیمات با موفقیت ذخیره شد.');
    } catch (error) {
      alert('خطا در ذخیره تنظیمات.');
    }
  };

  // --- Delete Handler ---
  const deleteItem = (type: any, id: string) => {
    if (window.confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      switch (type) {
        case 'books': updateData('books', books.filter(b => b.id !== id)); break;
        case 'teachers': updateData('teachers', teachers.filter(t => t.id !== id)); break;
        case 'videos': updateData('videos', videos.filter(v => v.id !== id)); break;
        case 'paradoxes': updateData('paradoxes', paradoxes.filter(p => p.id !== id)); break;
        case 'creators': updateData('creators', creators.filter(c => c.id !== id)); break;
      }
    }
  };

  // --- Login Screen ---
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
          <form onSubmit={handleLogin} className="space-y-4 mt-8">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="نام کاربری (Admin)" dir="ltr" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="رمز عبور" dir="ltr" />
            <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700">ورود</button>
          </form>
        </div>
      </div>
    );
  }

  // --- Admin Dashboard Layout ---
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
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
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <item.icon size={20} /> <span>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 mt-8"><span>خروج</span></button>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">آمار کلی</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700"><div className="text-gray-500 text-sm">کتاب‌ها</div><div className="text-3xl font-bold dark:text-white">{books.length}</div></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700"><div className="text-gray-500 text-sm">معلمین</div><div className="text-3xl font-bold text-primary-500">{teachers.length}</div></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700"><div className="text-gray-500 text-sm">ویدیوها</div><div className="text-3xl font-bold text-accent-500">{videos.length}</div></div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700"><div className="text-gray-500 text-sm">پارادوکس‌ها</div><div className="text-3xl font-bold text-indigo-500">{paradoxes.length}</div></div>
            </div>
          </div>
        )}

        {/* Settings & Creators */}
        {activeTab === 'settings' && (
             <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 space-y-4">
                 <h3 className="font-bold text-lg text-primary-600 border-b pb-2">تنظیمات اصلی</h3>
                 <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                    {tempSettings.appLogoUrl ? <img src={tempSettings.appLogoUrl} className="h-24 object-contain" /> : <Upload className="text-gray-400" />}
                    <span className="text-sm mt-2 text-gray-500">آپلود لوگو</span>
                 </div>
                 <input type="file" ref={logoInputRef} className="hidden" onChange={handleLogoUpload} accept="image/*" />
                 
                 <input value={tempSettings.appName} onChange={e => setTempSettings({...tempSettings, appName: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="نام سایت" />
                 <input value={tempSettings.adminEmail} onChange={e => setTempSettings({...tempSettings, adminEmail: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="ایمیل ادمین" dir="ltr" />
                 
                 <div className="border-t pt-4">
                    <h3 className="font-bold text-primary-600 mb-2">هوش مصنوعی</h3>
                    <div className="flex gap-2">
                        <input type="password" value={tempSettings.apiKey} onChange={e => setTempSettings({...tempSettings, apiKey: e.target.value})} className="flex-1 p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="API Key" dir="ltr" />
                        <button type="button" onClick={handleTestApiKey} className="bg-blue-500 text-white px-4 rounded">{isTestingKey ? '...' : 'تست'}</button>
                    </div>
                    {testMessage && <div className={`text-xs mt-2 ${keyStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{testMessage}</div>}
                 </div>

                 <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={tempSettings.eitaaLink} onChange={e => setTempSettings({...tempSettings, eitaaLink: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="لینک ایتا" dir="ltr" />
                    <input value={tempSettings.rubikaLink} onChange={e => setTempSettings({...tempSettings, rubikaLink: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="لینک روبیکا" dir="ltr" />
                    <input value={tempSettings.phone} onChange={e => setTempSettings({...tempSettings, phone: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="تلفن" dir="ltr" />
                    <input value={tempSettings.address} onChange={e => setTempSettings({...tempSettings, address: e.target.value})} className="p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="آدرس" />
                 </div>
                 <textarea value={tempSettings.copyrightText} onChange={e => setTempSettings({...tempSettings, copyrightText: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="متن کپی‌رایت" />
                 
                 <button className="bg-green-600 text-white px-6 py-2 rounded w-full">ذخیره تنظیمات</button>

                 <div className="border-t pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-primary-600">مدیریت سازندگان</h3>
                        <button type="button" onClick={() => openCreatorModal()} className="bg-primary-600 text-white px-3 py-1 rounded text-sm flex gap-1"><Plus size={16}/> افزودن</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {creators.map(c => (
                            <div key={c.id} className="border p-3 rounded flex items-center gap-3 dark:border-gray-700">
                                <img src={c.imageUrl} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <div className="font-bold dark:text-white">{c.name}</div>
                                    <div className="text-xs text-gray-500">{c.role}</div>
                                </div>
                                <button type="button" onClick={() => openCreatorModal(c)} className="text-blue-500"><Pencil size={18}/></button>
                                <button type="button" onClick={() => deleteItem('creators', c.id)} className="text-red-500"><Trash size={18}/></button>
                            </div>
                        ))}
                    </div>
                 </div>
             </form>
        )}

        {/* Lists (Books, Teachers, Videos, Paradoxes) */}
        {['books', 'teachers', 'videos', 'paradoxes'].includes(activeTab) && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {activeTab === 'books' ? 'کتاب‌ها' : activeTab === 'teachers' ? 'معلمین' : activeTab === 'videos' ? 'ویدیوها' : 'پارادوکس‌ها'}
                    </h2>
                    <button onClick={() => activeTab === 'books' ? openBookModal() : activeTab === 'teachers' ? openTeacherModal() : activeTab === 'videos' ? openVideoModal() : openParadoxModal()} className="bg-primary-600 text-white px-4 py-2 rounded flex gap-2">
                        <Plus /> افزودن
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-4">عنوان / نام</th>
                                <th className="p-4">جزئیات</th>
                                <th className="p-4">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {(activeTab === 'books' ? books : activeTab === 'teachers' ? teachers : activeTab === 'videos' ? videos : paradoxes).map((item: any) => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-4 dark:text-white">{item.title || item.name}</td>
                                    <td className="p-4 text-sm text-gray-500">{item.author || item.experience || item.tutor || item.summary}</td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => activeTab === 'books' ? openBookModal(item) : activeTab === 'teachers' ? openTeacherModal(item) : activeTab === 'videos' ? openVideoModal(item) : openParadoxModal(item)} className="text-blue-500"><Pencil size={18}/></button>
                                        <button onClick={() => deleteItem(activeTab, item.id)} className="text-red-500"><Trash size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        )}
      </main>

      {/* --- Modals --- */}
      {(isBookModalOpen || isTeacherModalOpen || isVideoModalOpen || isParadoxModalOpen || isCreatorModalOpen) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between mb-4">
                      <h3 className="font-bold text-xl dark:text-white">
                          {editingId ? 'ویرایش' : 'افزودن'}
                      </h3>
                      <button onClick={closeModals}><X /></button>
                  </div>
                  
                  {isBookModalOpen && (
                      <form onSubmit={handleSaveBook} className="space-y-4">
                          <div className="flex justify-center border-2 border-dashed p-4 rounded cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                              {newBook.imageUrl ? <img src={newBook.imageUrl} className="h-32 object-contain"/> : <ImageIcon className="text-gray-400"/>}
                          </div>
                          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewBook)} accept="image/*"/>
                          <input value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="عنوان" required/>
                          <input value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="نویسنده" required/>
                          <input value={newBook.subject} onChange={e => setNewBook({...newBook, subject: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="موضوع"/>
                          <textarea value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="توضیحات" rows={3}/>
                          <input value={newBook.downloadUrl} onChange={e => setNewBook({...newBook, downloadUrl: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="لینک دانلود" dir="ltr"/>
                          <button className="w-full bg-primary-600 text-white py-2 rounded">ذخیره</button>
                      </form>
                  )}

                  {isTeacherModalOpen && (
                      <form onSubmit={handleSaveTeacher} className="space-y-4">
                          <div className="flex justify-center border-2 border-dashed p-4 rounded cursor-pointer" onClick={() => teacherFileInputRef.current?.click()}>
                              {newTeacher.imageUrl ? <img src={newTeacher.imageUrl} className="h-32 object-contain"/> : <User className="text-gray-400"/>}
                          </div>
                          <input type="file" ref={teacherFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewTeacher)} accept="image/*"/>
                          <input value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="نام" required/>
                          <input value={newTeacher.experience} onChange={e => setNewTeacher({...newTeacher, experience: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="سابقه"/>
                          <input value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="تلفن" dir="ltr"/>
                          <input value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="ایمیل" dir="ltr"/>
                          <textarea value={newTeacher.bio} onChange={e => setNewTeacher({...newTeacher, bio: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="بیوگرافی" rows={3}/>
                          <button className="w-full bg-primary-600 text-white py-2 rounded">ذخیره</button>
                      </form>
                  )}

                  {isVideoModalOpen && (
                      <form onSubmit={handleSaveVideo} className="space-y-4">
                          <div className="flex justify-center border-2 border-dashed p-4 rounded cursor-pointer" onClick={() => videoFileInputRef.current?.click()}>
                              {newVideo.thumbnailUrl ? <img src={newVideo.thumbnailUrl} className="h-32 object-contain"/> : <MonitorPlay className="text-gray-400"/>}
                          </div>
                          <input type="file" ref={videoFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewVideo, 'thumbnailUrl')} accept="image/*"/>
                          <input value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="عنوان" required/>
                          <input value={newVideo.tutor} onChange={e => setNewVideo({...newVideo, tutor: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="مدرس"/>
                          <input value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="پایه" required/>
                          <input value={newVideo.duration} onChange={e => setNewVideo({...newVideo, duration: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="مدت زمان" dir="ltr"/>
                          <textarea value={newVideo.videoUrl} onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="کد امبد (IFrame)" rows={3} dir="ltr"/>
                          <button className="w-full bg-primary-600 text-white py-2 rounded">ذخیره</button>
                      </form>
                  )}

                  {isParadoxModalOpen && (
                      <form onSubmit={handleSaveParadox} className="space-y-4">
                          <input value={newParadox.title} onChange={e => setNewParadox({...newParadox, title: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="عنوان" required/>
                          <input value={newParadox.summary} onChange={e => setNewParadox({...newParadox, summary: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="خلاصه" required/>
                          <textarea value={newParadox.content} onChange={e => setNewParadox({...newParadox, content: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="محتوا" rows={5} required/>
                          <button className="w-full bg-primary-600 text-white py-2 rounded">ذخیره</button>
                      </form>
                  )}

                  {isCreatorModalOpen && (
                      <form onSubmit={handleSaveCreator} className="space-y-4">
                          <div className="flex justify-center border-2 border-dashed p-4 rounded cursor-pointer" onClick={() => creatorFileInputRef.current?.click()}>
                              {newCreator.imageUrl ? <img src={newCreator.imageUrl} className="h-32 object-contain"/> : <User className="text-gray-400"/>}
                          </div>
                          <input type="file" ref={creatorFileInputRef} className="hidden" onChange={(e) => handleImageUpload(e, setNewCreator)} accept="image/*"/>
                          <input value={newCreator.name} onChange={e => setNewCreator({...newCreator, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="نام" required/>
                          <input value={newCreator.role} onChange={e => setNewCreator({...newCreator, role: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="نقش" required/>
                          <textarea value={newCreator.bio} onChange={e => setNewCreator({...newCreator, bio: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" placeholder="بیوگرافی" rows={3}/>
                          <button className="w-full bg-primary-600 text-white py-2 rounded">ذخیره</button>
                      </form>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};