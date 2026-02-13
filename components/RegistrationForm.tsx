
import React, { useState, useEffect } from 'react';
import { StudentFormData, Sex, Attendance, Student } from '../types';
import { Save, User, BookOpen, Fingerprint, X, Calendar, Clock } from 'lucide-react';

interface RegistrationFormProps {
  onSubmit: (data: StudentFormData) => void;
  autoId: string;
  initialData?: Student;
  onCancel?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, autoId, initialData, onCancel }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    studentId: initialData?.studentId || autoId,
    name: initialData?.name || '',
    sex: initialData?.sex || Sex.MALE,
    course: initialData?.course || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    time: initialData?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    attendance: initialData?.attendance || {
      monday: true, tuesday: true, wednesday: true, thursday: true, friday: true,
      saturday: false, sunday: false
    }
  });

  useEffect(() => {
    if (!initialData && !formData.name) {
      setFormData(prev => ({ ...prev, studentId: autoId }));
    }
  }, [autoId, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleDay = (day: keyof Attendance) => {
    setFormData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [day]: !prev.attendance[day]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const days: { key: keyof Attendance; label: string }[] = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.25rem] py-4 px-5 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/20 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-sm dark:text-white shadow-sm font-medium";
  const labelClass = "block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-[0.15em] ml-1";

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${initialData ? 'p-1' : 'pb-10'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <label className={labelClass}>Unique Student ID</label>
            <div className="relative">
              <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
              <input 
                required
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className={`${inputClass} font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-900/10`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Legal Full Name</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600 pointer-events-none" />
              <input required name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name..." className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Biological Gender</label>
            <div className="relative">
              <select name="sex" value={formData.sex} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                {Object.values(Sex).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l pl-3 border-slate-200 dark:border-slate-800">
                 <div className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className={labelClass}>Assigned Course</label>
            <div className="relative">
              <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600 pointer-events-none" />
              <input required name="course" value={formData.course} onChange={handleChange} placeholder="e.g. Advanced Mathematics" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Enrollment Date</label>
              <div className="relative">
                <input type="date" name="date" value={formData.date} onChange={handleChange} className={`${inputClass} pr-2`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Preferred Time</label>
              <div className="relative">
                <input type="time" name="time" value={formData.time} onChange={handleChange} className={`${inputClass} pr-2`} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Roster Attendance Schedule</label>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`aspect-square rounded-xl font-black text-[9px] transition-all border flex flex-col items-center justify-center gap-0.5 ${
                    formData.attendance[day.key]
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="opacity-60">{day.label.charAt(0)}</span>
                  <div className={`w-1 h-1 rounded-full ${formData.attendance[day.key] ? 'bg-white' : 'bg-slate-200'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 uppercase text-xs tracking-widest"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
        <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
          <Save className="w-4 h-4" /> {initialData ? 'Update Record' : 'Create Registration'}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
