
import React, { useState, useMemo } from 'react';
import { Student, Attendance } from '../types';
import { CalendarDays, Search, Check, X, Layers, Download, CheckCheck, Sun, Clock, Activity, MinusCircle } from 'lucide-react';

interface AttendanceReportProps {
  students: Student[];
}

type Status = 'P' | 'A' | null;
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
    const headers = ['Student Name', 'Student ID', 'Course', 'Price', ...days.map(d => d.label)];
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
        student.price,
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
    link.setAttribute("download", `student_report_${new Date().toISOString().split('T')[0]}.csv`);
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
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-black text-slate-800 dark:text-white">{studentStats.pCount}</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-1" />
                 <span className="text-[10px] font-black text-slate-800 dark:text-white">{studentStats.aCount}</span>
               </div>
               <p className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Attendance</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 ${isWeekend ? 'bg-amber-100/10 dark:bg-amber-950/20' : 'bg-indigo-50/20 dark:bg-indigo-950/10'}`}>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, idx) => {
              const isEnrolled = student.attendance?.[day.key] ?? false;
              const status = history[student.id]?.[day.key] || null;
              
              let tileClass = "w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 border-2 ";
              let iconColor = "";
              let StatusIcon: any = null;

              if (!isEnrolled) {
                tileClass += "bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60";
                StatusIcon = MinusCircle;
                iconColor = "text-slate-300 dark:text-slate-600";
              } else if (status === 'P') {
                tileClass += "bg-blue-100 dark:bg-blue-900/40 border-blue-500/30";
                iconColor = "text-blue-600 dark:text-blue-400";
                StatusIcon = Check;
              } else if (status === 'A') {
                tileClass += "bg-rose-100 dark:bg-rose-900/40 border-rose-500/30";
                iconColor = "text-rose-600 dark:text-rose-400";
                StatusIcon = X;
              } else {
                tileClass += "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800";
              }

              return (
                <button 
                  key={day.key} 
                  disabled={!isEnrolled}
                  onClick={() => cycleStatus(student, day.key)}
                  className={tileClass}
                >
                  <span className="text-[7px] font-black uppercase mb-0.5">{day.short}</span>
                  {StatusIcon && <StatusIcon className={`w-3.5 h-3.5 ${iconColor}`} />}
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
        <h3 className="text-[12px] font-black uppercase tracking-widest">{title}</h3>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1 rounded-full text-[10px] font-black">{count} Active</div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="px-1 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Attendance</h2>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Audit</p>
          </div>
        </div>
        <button onClick={exportToCSV} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-xl"><Download className="w-5 h-5" /></button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search records..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 hide-scrollbar">
        {days.map((d, idx) => (
          <div key={d.key} className="flex-shrink-0 w-32 bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <p className={`text-[11px] font-black uppercase ${idx >= 5 ? 'text-amber-600' : 'text-indigo-600'}`}>{d.short}</p>
              <button onClick={() => markAllPresent(d.key)} className="text-slate-400"><CheckCheck className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-between text-lg font-black dark:text-white">
              <span className="text-blue-500">{dailyCounts[d.key].P}</span>
              <span className="text-rose-500">{dailyCounts[d.key].A}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Weekly Programs" icon={Clock} color="text-indigo-500" count={weekdayStudents.length} />
      {weekdayStudents.map(s => <StudentRow key={s.id} student={s} />)}

      <SectionHeader title="Weekend Special" icon={Sun} color="text-amber-500" count={weekendStudents.length} />
      {weekendStudents.map(s => <StudentRow key={s.id} student={s} isWeekend />)}
    </div>
  );
};

export default AttendanceReport;
