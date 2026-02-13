
import React, { useState, useMemo } from 'react';
import { Student, Attendance } from '../types';
import { CalendarDays, Search, Check, X, Layers, Download, CheckCheck, Sun, Clock, Activity, MinusCircle } from 'lucide-react';

interface AttendanceReportProps {
  students: Student[];
}

type Status = 'P' | 'A' | null;
// Record<studentId, Record<dayKey, Status>>
type AttendanceHistory = Record<string, Record<string, Status>>;

const AttendanceReport: React.FC<AttendanceReportProps> = ({ students }) => {
  const [history, setHistory] = useState<AttendanceHistory>(() => {
    const saved = localStorage.getItem('edureg_attendance_history');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const days: { key: keyof Attendance; label: string; short: string }[] = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const cycleStatus = (student: Student, dayKey: keyof Attendance) => {
    // Only allow update if the student is enrolled on that day
    if (!student.attendance?.[dayKey]) return;

    setHistory(prev => {
      const currentStatus = prev[student.id]?.[dayKey] || null;
      let nextStatus: Status = null;
      
      if (currentStatus === null) nextStatus = 'P';
      else if (currentStatus === 'P') nextStatus = 'A';
      else if (currentStatus === 'A') nextStatus = null;

      const newHistory = {
        ...prev,
        [student.id]: {
          ...(prev[student.id] || {}),
          [dayKey]: nextStatus
        }
      };
      localStorage.setItem('edureg_attendance_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const markAllPresent = (dayKey: keyof Attendance) => {
    setHistory(prev => {
      const newHistory = { ...prev };
      students.forEach(student => {
        if (student.attendance?.[dayKey]) {
          newHistory[student.id] = {
            ...(newHistory[student.id] || {}),
            [dayKey]: 'P' as Status
          };
        }
      });
      localStorage.setItem('edureg_attendance_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const dailyCounts = useMemo(() => {
    const counts: Record<string, { P: number; A: number }> = {};
    days.forEach(d => {
      counts[d.key] = { P: 0, A: 0 };
      students.forEach(s => {
        const status = history[s.id]?.[d.key];
        if (status === 'P') counts[d.key].P++;
        if (status === 'A') counts[d.key].A++;
      });
    });
    return counts;
  }, [history, students]);

  // Filtering and Grouping students
  const filteredStudents = useMemo(() => 
    students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    ), 
    [students, searchQuery]
  );

  const weekdayStudents = filteredStudents.filter(s => s.attendance.monday || s.attendance.tuesday || s.attendance.wednesday || s.attendance.thursday || s.attendance.friday);
  const weekendStudents = filteredStudents.filter(s => s.attendance.saturday || s.attendance.sunday);

  const exportToCSV = () => {
    const headers = ['Student Name', 'Student ID', 'Course', ...days.map(d => d.label)];
    const rows = students.map(student => {
      const dayData = days.map(day => {
        const isEnrolled = student.attendance?.[day.key];
        if (!isEnrolled) return 'Not Enrolled';
        const status = history[student.id]?.[day.key];
        if (status === 'P') return 'Present';
        if (status === 'A') return 'Absent';
        return 'Pending';
      });
      return [
        `"${student.name.replace(/"/g, '""')}"`,
        student.studentId,
        `"${student.course.replace(/"/g, '""')}"`,
        ...dayData
      ];
    });

    const csvContent = [headers, ...rows]
      .map(e => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `full_attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StudentRow: React.FC<{ student: Student, isWeekend?: boolean }> = ({ student, isWeekend }) => {
    const studentStats = useMemo(() => {
      let pCount = 0;
      let aCount = 0;
      days.forEach(d => {
        const status = history[student.id]?.[d.key];
        if (status === 'P') pCount++;
        if (status === 'A') aCount++;
      });
      return { pCount, aCount };
    }, [history, student.id]);

    return (
      <div className={`rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-6 overflow-hidden theme-transition shadow-sm border-l-[6px] ${
        isWeekend 
          ? 'bg-amber-50/40 dark:bg-amber-900/10 border-l-amber-500' 
          : 'bg-white dark:bg-slate-900 border-l-indigo-600'
      }`}>
        {/* Row Header with Stats */}
        <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black border shadow-sm ${
              isWeekend 
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' 
                : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
            }`}>
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-black text-slate-800 dark:text-white truncate leading-none mb-1 uppercase tracking-tight">{student.name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isWeekend ? 'text-amber-600 bg-amber-100/50' : 'text-slate-400 bg-slate-50 dark:bg-slate-800'
                }`}>
                  #{student.studentId}
                </span>
                <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-700" />
                <p className="text-[9px] text-slate-400 font-medium truncate">{student.course}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                 <span className="text-[10px] font-black text-slate-800 dark:text-white">{studentStats.pCount}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)] ml-1" />
                 <span className="text-[10px] font-black text-slate-800 dark:text-white">{studentStats.aCount}</span>
               </div>
               <p className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.1em]">Week Stats</p>
            </div>
          </div>
        </div>
        
        {/* Mini Calendar View Strip */}
        <div className={`p-4 ${isWeekend ? 'bg-amber-100/10 dark:bg-amber-950/20' : 'bg-indigo-50/20 dark:bg-indigo-950/10'}`}>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              const isDayWeekend = idx >= 5;
              const isEnrolled = student.attendance?.[day.key] ?? false;
              const status = history[student.id]?.[day.key] || null;
              
              // Base Tile Styles
              let tileClass = "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 border-2 ";
              let iconColor = "";
              let StatusIcon: any = null;

              if (!isEnrolled) {
                tileClass += "bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60";
                iconColor = "text-slate-300 dark:text-slate-600";
                StatusIcon = MinusCircle;
              } else if (status === 'P') {
                tileClass += "bg-blue-100 dark:bg-blue-900/40 border-blue-500/30 shadow-sm";
                iconColor = "text-blue-600 dark:text-blue-400";
                StatusIcon = Check;
              } else if (status === 'A') {
                tileClass += "bg-rose-100 dark:bg-rose-900/40 border-rose-500/30 shadow-sm";
                iconColor = "text-rose-600 dark:text-rose-400";
                StatusIcon = X;
              } else {
                tileClass += isWeekend 
                  ? "bg-white dark:bg-slate-900 border-amber-100/50 dark:border-amber-900/50" 
                  : "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800";
              }

              return (
                <button 
                  key={day.key} 
                  disabled={!isEnrolled}
                  onClick={() => cycleStatus(student, day.key)}
                  className={tileClass}
                  title={isEnrolled ? `Cycle attendance for ${day.label}` : "Not scheduled for this day"}
                >
                  <span className={`text-[7px] font-black uppercase tracking-tighter mb-0.5 ${
                    status === 'P' ? 'text-blue-600' : 
                    status === 'A' ? 'text-rose-600' : 
                    (!isEnrolled ? 'text-slate-300' : (isDayWeekend ? 'text-amber-500' : 'text-slate-400'))
                  }`}>
                    {day.short}
                  </span>
                  
                  <div className="relative">
                    {StatusIcon ? (
                      <StatusIcon className={`w-3.5 h-3.5 stroke-[4px] ${iconColor} animate-in zoom-in duration-200`} />
                    ) : (
                      <div className={`w-1.5 h-1.5 rounded-full ${isDayWeekend ? 'bg-amber-200 dark:bg-amber-800' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                  </div>
                  
                  {!isEnrolled && (
                    <span className="text-[5px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 leading-none">N/A</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, icon: Icon, color, count }: { title: string, icon: any, color: string, count: number }) => (
    <div className="flex items-center justify-between px-2 mb-4 mt-10">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-xl ${color} bg-opacity-10 border border-current border-opacity-20`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <h3 className="text-[12px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-[0.1em]">{title}</h3>
      </div>
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full shadow-sm">
        <Activity className="w-3 h-3 text-indigo-500" />
        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{count} Active</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="px-1 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Attendance</h2>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master 7-Day Audit</p>
          </div>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={students.length === 0}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-90 disabled:opacity-50"
          aria-label="Export Data"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
      
      {/* Search Bar Section */}
      <div className="space-y-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Filter report by student name or ID..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-white shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {searchQuery && (
          <div className="px-2 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Found {filteredStudents.length} matches for "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 hide-scrollbar snap-x">
        {days.map((d, idx) => (
          <div key={d.key} className={`flex-shrink-0 w-32 bg-white dark:bg-slate-900 p-5 rounded-[2rem] border snap-center shadow-sm theme-transition group transition-colors ${idx >= 5 ? 'border-amber-100 dark:border-amber-900/50 hover:border-amber-400' : 'border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-400'}`}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">
              <p className={`text-[11px] font-black uppercase tracking-widest ${idx >= 5 ? 'text-amber-600' : 'text-indigo-600'}`}>{d.short}</p>
              <button 
                onClick={() => markAllPresent(d.key)}
                className={`p-1.5 rounded-lg transition-all active:scale-75 ${idx >= 5 ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'}`}
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.6)]" />
                    <span className="text-[10px] font-bold text-slate-400">P</span>
                 </div>
                 <span className="text-lg font-black text-slate-800 dark:text-white leading-none tracking-tight">{dailyCounts[d.key].P}</span>
               </div>
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
                    <span className="text-[10px] font-bold text-slate-400">A</span>
                 </div>
                 <span className="text-lg font-black text-slate-800 dark:text-white leading-none tracking-tight">{dailyCounts[d.key].A}</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
        <SectionHeader title="Weekly Programs" icon={Clock} color="text-indigo-500" count={weekdayStudents.length} />
        {weekdayStudents.length > 0 ? (
          weekdayStudents.map(s => <StudentRow key={s.id} student={s} />)
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] p-10 border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">
              {searchQuery ? `No matching students for "${searchQuery}"` : "No Weekday Rosters Found"}
            </p>
          </div>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
        <SectionHeader title="Weekend Special" icon={Sun} color="text-amber-500" count={weekendStudents.length} />
        {weekendStudents.length > 0 ? (
          weekendStudents.map(s => <StudentRow key={s.id} student={s} isWeekend />)
        ) : (
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] p-10 border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">
              {searchQuery ? `No matching students for "${searchQuery}"` : "No Weekend Rosters Found"}
            </p>
          </div>
        )}
      </div>

      {students.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
          <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">System Standby</p>
          <p className="text-[10px] text-slate-300 dark:text-slate-700 mt-2">Waiting for student registration data...</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;
