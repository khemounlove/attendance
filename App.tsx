
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutGrid, 
  Settings, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  ChevronLeft,
  Zap,
  Fingerprint,
  Moon,
  Sun,
  ShieldCheck,
  CalendarDays,
  FileText,
  UserPlus,
  Layout,
  CloudCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  MessageCircle,
  QrCode,
  ExternalLink,
  Send,
  X as XIcon
} from 'lucide-react';
import { Student, StudentFormData } from './types';
import RegistrationForm from './components/RegistrationForm';
import StudentList from './components/StudentList';
import AttendanceReport from './components/AttendanceReport';

type View = 'dashboard' | 'register' | 'config' | 'report';
type SyncStatus = 'synced' | 'syncing' | 'offline';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('edureg_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Settings state
  const [showTelegramQR, setShowTelegramQR] = useState(() => {
    return localStorage.getItem('edureg_show_tg_qr') === 'true';
  });

  // Connectivity Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setSyncStatus(isOnline ? 'synced' : 'offline');
  }, [isOnline]);

  useEffect(() => {
    const saved = localStorage.getItem('edureg_students');
    if (saved) {
      try {
        setStudents(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing stored data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('edureg_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('edureg_show_tg_qr', showTelegramQR.toString());
  }, [showTelegramQR]);

  useEffect(() => {
    if (students.length > 0) {
      setSyncStatus('syncing');
      localStorage.setItem('edureg_students', JSON.stringify(students));
      const timer = setTimeout(() => {
        setSyncStatus(isOnline ? 'synced' : 'offline');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [students, isOnline]);

  const nextStudentId = useMemo(() => {
    if (students.length === 0) return "0001";
    const numericIds = students
      .map(s => parseInt(s.studentId, 10))
      .filter(id => !isNaN(id));
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return (maxId + 1).toString().padStart(4, '0');
  }, [students]);

  const handleSaveStudent = useCallback((data: StudentFormData, studentToUpdate?: Student) => {
    if (studentToUpdate) {
      setStudents(prev => prev.map(s => s.id === studentToUpdate.id ? { ...s, ...data } : s));
    } else {
      const newStudent: Student = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: Date.now()
      };
      setStudents(prev => [newStudent, ...prev]);
      setActiveView('dashboard');
    }
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 3000);
  }, []);

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SyncIndicator = ({ className = "" }: { className?: string }) => {
    const config = {
      synced: { icon: CloudCheck, text: 'Synced', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      syncing: { icon: RefreshCw, text: 'Syncing', color: 'text-indigo-500', bg: 'bg-indigo-500/10', spin: true },
      offline: { icon: WifiOff, text: 'Local Only', color: 'text-amber-500', bg: 'bg-amber-500/10' }
    }[syncStatus];
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-current border-opacity-10 ${config.bg} ${config.color} ${className} transition-all duration-500`}>
        <Icon className={`w-3 h-3 ${config.spin ? 'animate-spin' : ''}`} />
        <span className="text-[9px] font-black uppercase tracking-widest">{config.text}</span>
      </div>
    );
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group w-full ${
        activeView === view 
          ? 'bg-indigo-600 text-white shadow-lg' 
          : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  const TelegramQRCard = () => (
    <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
          <Send className="w-8 h-8 text-white fill-white" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tighter mb-1">Telegram Community</h3>
        <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mb-6">Scan to Join the Group</p>
        
        <div className="bg-white p-4 rounded-3xl shadow-inner mb-6">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://t.me/studentlearned_')}`} 
            alt="Telegram Group QR"
            className="w-40 h-40"
          />
        </div>

        <a 
          href="https://t.me/studentlearned_" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
        >
          <ExternalLink className="w-3 h-3" /> Join Link
        </a>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'} flex theme-transition`}>
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 sticky top-0 h-screen shrink-0 z-40 theme-transition">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">EDU Pro</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">v3.1 Production</p>
            </div>
          </div>
          <nav className="space-y-2">
            <NavItem view="dashboard" icon={LayoutGrid} label="Registry" />
            <NavItem view="report" icon={FileText} label="Attendance" />
            <NavItem view="register" icon={UserPlus} label="Enroll New" />
            <NavItem view="config" icon={Settings} label="Settings" />
          </nav>
        </div>
        <div className="mt-auto p-8 space-y-4">
           {showTelegramQR && (
             <button onClick={() => setShowQRModal(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-100 dark:border-sky-800 transition-all">
               <QrCode className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Telegram QR</span>
             </button>
           )}
           <SyncIndicator />
           <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                 <ShieldCheck className="w-4 h-4 text-emerald-600" />
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">Safe Mode Active</p>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Data is encrypted and hosted locally.</p>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="bg-white/80 dark:bg-slate-900/80 px-6 py-4 md:py-6 sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md theme-transition">
          <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
            <div className="md:hidden flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md"><Zap className="w-4 h-4 text-white fill-white" /></div>
               <h1 className="text-lg font-black text-slate-900 dark:text-white">EDU</h1>
            </div>
            <div className="hidden md:block">
               {activeView === 'dashboard' ? (
                 <div className="flex items-center gap-2"><Layout className="w-4 h-4 text-indigo-500" /><h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Dashboard</h2></div>
               ) : (
                 <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 uppercase font-black text-xs tracking-widest"><ChevronLeft className="w-4 h-4" /> Back</button>
               )}
            </div>
            <div className="flex items-center gap-3">
              <SyncIndicator className="md:hidden" />
              {activeView === 'dashboard' && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Filter..." className="w-48 bg-slate-100 dark:bg-slate-800/50 rounded-2xl py-2 pl-9 pr-4 text-xs dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              )}
              <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32 md:pb-12 hide-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            {activeView === 'dashboard' && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div>
                      <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Master Registry</h2>
                      <div className="flex items-center gap-1.5 mt-1"><Fingerprint className="w-4 h-4 text-indigo-500" /><span className="text-xs font-black text-indigo-600 dark:text-indigo-400">STATUS: OPTIMAL</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
                          {filteredStudents.length} RECORDS
                      </div>
                      <button onClick={() => setActiveView('register')} className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                        <PlusCircle className="w-4 h-4" /> Enroll Student
                      </button>
                    </div>
                </div>
                {showTelegramQR && (
                  <div className="mb-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800 rounded-[2rem] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg"><Send className="w-5 h-5 text-white fill-white" /></div>
                        <div>
                          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Official Support</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">Join our Telegram Group Community</p>
                        </div>
                      </div>
                      <button onClick={() => setShowQRModal(true)} className="bg-white dark:bg-slate-800 text-sky-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-sky-100 active:scale-95 transition-all">Show QR</button>
                    </div>
                  </div>
                )}
                <StudentList students={filteredStudents} onDelete={handleDeleteStudent} onSave={handleSaveStudent} onEmptyAction={() => setActiveView('register')} />
              </div>
            )}
            
            {activeView === 'register' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Register Student</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Enrollment System v3.1 - Secure Entry</p>
                </div>
                <RegistrationForm onSubmit={(data) => handleSaveStudent(data)} autoId={nextStudentId} />
              </div>
            )}

            {activeView === 'report' && <div className="animate-in fade-in duration-500"><AttendanceReport students={students} /></div>}

            {activeView === 'config' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Configuration</h2>
                <div className="grid grid-cols-1 gap-6">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Community Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <MessageCircle className="w-6 h-6 text-sky-500" />
                          <div>
                            <p className="font-black text-slate-800 dark:text-white text-sm">Dashboard QR</p>
                            <p className="text-[10px] text-slate-400">Toggle community invite visible</p>
                          </div>
                        </div>
                        <button onClick={() => setShowTelegramQR(!showTelegramQR)} className={`w-14 h-7 rounded-full p-1 transition-all ${showTelegramQR ? 'bg-sky-500' : 'bg-slate-200'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${showTelegramQR ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <button onClick={() => setShowQRModal(true)} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between text-left group transition-all">
                        <div className="flex items-center gap-4">
                          <QrCode className="w-6 h-6 text-indigo-600" />
                          <div><p className="font-black text-slate-800 dark:text-white text-sm">View Group QR</p><p className="text-[10px] text-slate-400">Join our Telegram</p></div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180" />
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowQRModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><XIcon className="w-5 h-5" /></button>
            </div>
            <TelegramQRCard />
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Join for community support</p>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 pt-4 pb-10 flex justify-around items-center z-40">
        <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center gap-1 ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}><LayoutGrid className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Records</span></button>
        <button onClick={() => setActiveView('report')} className={`flex flex-col items-center gap-1 ${activeView === 'report' ? 'text-indigo-600' : 'text-slate-400'}`}><FileText className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Audit</span></button>
        <button onClick={() => setActiveView('register')} className="bg-indigo-600 text-white p-4 rounded-full -mt-8 shadow-lg ring-4 ring-white dark:ring-slate-900"><PlusCircle className="w-6 h-6" /></button>
        <button onClick={() => setActiveView('config')} className={`flex flex-col items-center gap-1 ${activeView === 'config' ? 'text-indigo-600' : 'text-slate-400'}`}><Settings className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Setup</span></button>
      </nav>
    </div>
  );
};

export default App;
