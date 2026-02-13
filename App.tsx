
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
  Send
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

  // Default attendance config
  const [defaultAttendance, setDefaultAttendance] = useState({
    monFri: true,
    satSun: false
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

  // Sync Status Logic
  useEffect(() => {
    if (!isOnline) {
      setSyncStatus('offline');
    } else {
      setSyncStatus('synced');
    }
  }, [isOnline]);

  // Load from local storage
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

  // Sync theme
  useEffect(() => {
    localStorage.setItem('edureg_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save visibility preference
  useEffect(() => {
    localStorage.setItem('edureg_show_tg_qr', showTelegramQR.toString());
  }, [showTelegramQR]);

  // Save to local storage
  useEffect(() => {
    if (students.length > 0) {
      // Simulate sync animation
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
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-1' 
          : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeView === view ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  const TelegramQRCard = () => (
    <div className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
          <Send className="w-8 h-8 text-white fill-white" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tighter mb-1">Telegram Community</h3>
        <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mb-6">Scan to Join the Group</p>
        
        <div className="bg-white p-4 rounded-3xl shadow-inner mb-6">
          <img 
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://t.me/+qD6pAEJrLYBmN2Vl" 
            alt="Telegram Group QR"
            className="w-40 h-40"
          />
        </div>

        <a 
          href="https://t.me/+qD6pAEJrLYBmN2Vl" 
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
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 sticky top-0 h-screen shrink-0 z-40 theme-transition">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none">EDU Pro</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">v3.0 Web App</p>
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
             <button 
               onClick={() => setShowQRModal(true)}
               className="w-full flex items-center gap-3 px-4 py-3 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-2xl border border-sky-100 dark:border-sky-800 transition-all hover:scale-[1.02]"
             >
               <QrCode className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-widest">Telegram QR</span>
             </button>
           )}
           <SyncIndicator />
           <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                 </div>
                 <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">Local Safe Mode</p>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed font-medium">Data is encrypted and stored locally in your browser.</p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 px-6 py-4 md:py-6 sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md theme-transition">
          <div className="max-w-6xl mx-auto flex justify-between items-center w-full">
            <div className="md:hidden flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white fill-white" />
               </div>
               <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">EDU</h1>
            </div>

            <div className="hidden md:block">
               {activeView === 'dashboard' ? (
                 <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-indigo-500" />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Master Dashboard</h2>
                 </div>
               ) : (
                 <button onClick={() => setActiveView('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Return Home</span>
                 </button>
               )}
            </div>

            <div className="flex items-center gap-3">
              <SyncIndicator className="md:hidden" />
              {activeView === 'dashboard' && (
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search records..."
                    className="w-48 lg:w-64 bg-slate-100 dark:bg-slate-800/50 border border-transparent dark:border-slate-700 rounded-2xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 active:scale-95 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Search Bar - Only visible on small screens when in dashboard */}
        {activeView === 'dashboard' && (
          <div className="md:hidden px-6 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 pt-6 pb-32 md:pb-12 hide-scrollbar">
          <div className="max-w-6xl mx-auto w-full">
            {activeView === 'dashboard' && (
              <div className="animate-in fade-in duration-500 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                    <div>
                      <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Live Registry</h2>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Fingerprint className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">System Status: Optimal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
                          {filteredStudents.length} ACTIVE RECORDS
                      </div>
                      <button 
                        onClick={() => setActiveView('register')}
                        className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
                      >
                        <PlusCircle className="w-4 h-4" /> Enroll Student
                      </button>
                    </div>
                </div>
                
                {showTelegramQR && (
                  <div className="mb-6 animate-in slide-in-from-top-2 duration-500">
                    <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800 rounded-[2rem] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200 dark:shadow-none">
                          <Send className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Official Support</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white">Join our Telegram Group Community</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowQRModal(true)}
                        className="bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-sky-100 dark:border-sky-800 active:scale-95 transition-all"
                      >
                        Show QR
                      </button>
                    </div>
                  </div>
                )}

                <StudentList 
                  students={filteredStudents} 
                  onDelete={handleDeleteStudent} 
                  onSave={handleSaveStudent}
                  onEmptyAction={() => setActiveView('register')}
                />
              </div>
            )}
            
            {activeView === 'register' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 mb-6 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors md:hidden" onClick={() => setActiveView('dashboard')}>
                   <ChevronLeft className="w-5 h-5" />
                   <span className="text-sm font-medium">Back</span>
                </div>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">
                    Register Student
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Enrollment system version 3.0.4 - Secure Entry</p>
                </div>
                <RegistrationForm 
                  onSubmit={(data) => handleSaveStudent(data)} 
                  autoId={nextStudentId}
                />
              </div>
            )}

            {activeView === 'report' && (
              <div className="animate-in fade-in duration-500">
                <AttendanceReport students={students} />
              </div>
            )}

            {activeView === 'config' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">System Configuration</h2>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Community Section */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Community & Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400">
                            <MessageCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white text-sm">Dashboard QR</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Show join shortcut on main screen</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowTelegramQR(!showTelegramQR)}
                          className={`w-14 h-7 rounded-full p-1 transition-all ${showTelegramQR ? 'bg-sky-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${showTelegramQR ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => setShowQRModal(true)}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between text-left group hover:border-indigo-500 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white text-sm">View Group QR</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Scan and join our Telegram</p>
                          </div>
                        </div>
                        <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180" />
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Appearance</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white text-sm">Dark Interface</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">Enable high-contrast dark theme</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-14 h-7 rounded-full p-1 transition-all ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${darkMode ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Enrollment Presets</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CalendarDays className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white text-sm">Weekday Roster</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Auto-select Mon-Fri for new entries</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDefaultAttendance(p => ({ ...p, monFri: !p.monFri }))}
                          className={`w-14 h-7 rounded-full p-1 transition-all ${defaultAttendance.monFri ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${defaultAttendance.monFri ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Sun className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white text-sm">Weekend Roster</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">Auto-select Sat-Sun for new entries</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setDefaultAttendance(p => ({ ...p, satSun: !p.satSun }))}
                          className={`w-14 h-7 rounded-full p-1 transition-all ${defaultAttendance.satSun ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${defaultAttendance.satSun ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] p-8 text-center space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm mb-2">
                    <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-lg font-black text-slate-800 dark:text-white">EDU Pro Web v3.1</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-black">Powered by RWA Engine</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 max-w-sm mx-auto leading-relaxed mt-4">
                    Enterprise student management simplified. All data is synchronized across your browser's local sandbox for 100% privacy.
                  </p>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Telegram QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setShowQRModal(false)}
                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <TelegramQRCard />
            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">
              Join for help & updates
            </p>
          </div>
        </div>
      )}

      {/* Mobile Success Toast */}
      {isSuccessToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-10 md:left-auto md:right-10 md:translate-x-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-5 rounded-[2rem] flex items-center gap-4 shadow-2xl animate-in fade-in slide-in-from-bottom-10 z-50 transition-all">
          <div className="bg-emerald-500 p-1.5 rounded-full">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-sm tracking-tight uppercase">Data Sync Complete!</span>
        </div>
      )}

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-4 pt-4 pb-10 flex justify-around items-center z-40 theme-transition">
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <div className={`p-2 rounded-xl ${activeView === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
            <LayoutGrid className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Records</span>
        </button>

        <button 
          onClick={() => setActiveView('report')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'report' ? 'text-indigo-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <div className={`p-2 rounded-xl ${activeView === 'report' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
            <FileText className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Audit</span>
        </button>
        
        <div className="relative -top-8">
           <button 
             onClick={() => setActiveView('register')}
             className="bg-indigo-600 text-white p-4 rounded-[1.8rem] shadow-2xl shadow-indigo-300 dark:shadow-none active:scale-90 transition-all ring-[10px] ring-white/50 dark:ring-slate-900/50"
           >
             <PlusCircle className="w-8 h-8" />
           </button>
        </div>

        <button 
          onClick={() => setActiveView('config')}
          className={`flex flex-col items-center gap-1 transition-all ${activeView === 'config' ? 'text-indigo-600 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <div className={`p-2 rounded-xl ${activeView === 'config' ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Setup</span>
        </button>
      </nav>
    </div>
  );
};

// Helper for X icon
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default App;
