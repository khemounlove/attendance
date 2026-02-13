
import React, { useState } from 'react';
import { Student, StudentFormData } from '../types';
import { Trash2, Book, Calendar, User, Clock, AlertTriangle, Edit3 } from 'lucide-react';
import RegistrationForm from './RegistrationForm';

interface StudentListProps {
  students: Student[];
  onDelete: (id: string) => void;
  onSave: (data: StudentFormData, student: Student) => void;
  onEmptyAction: () => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onDelete, onSave, onEmptyAction }) => {
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (studentToDelete) {
      onDelete(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleInlineSave = (data: StudentFormData, student: Student) => {
    onSave(data, student);
    setEditingStudentId(null);
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm mt-4">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
          <User className="w-12 h-12 text-slate-300 dark:text-slate-700" />
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">No Active Registrations</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 max-w-xs mx-auto">Enrollment records are currently empty. Use the registration portal to add your first student.</p>
        <button 
          onClick={onEmptyAction}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 transition-all"
        >
          Open Registration
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {students.map((student) => {
          const isEditing = editingStudentId === student.id;
          
          return (
            <div 
              key={student.id} 
              className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative group animate-in fade-in slide-in-from-right-4 theme-transition ${isEditing ? 'ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-950' : 'hover:border-indigo-200 dark:hover:border-indigo-900/40 hover:shadow-md'}`}
            >
              {isEditing ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 mb-6">
                     <Edit3 className="w-4 h-4 text-indigo-500" />
                     <h4 className="text-xs font-black uppercase text-indigo-500 tracking-widest">Edit Mode: {student.studentId}</h4>
                  </div>
                  <RegistrationForm 
                    initialData={student}
                    autoId={student.studentId}
                    onSubmit={(data) => handleInlineSave(data, student)}
                    onCancel={() => setEditingStudentId(null)}
                  />
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg">
                          #{student.studentId}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {student.sex}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 dark:text-white mt-3 truncate tracking-tight uppercase">{student.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setEditingStudentId(student.id)}
                        className="p-3 text-slate-300 dark:text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-all active:scale-90"
                        aria-label="Edit Student"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setStudentToDelete(student)}
                        className="p-3 text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all active:scale-90"
                        aria-label="Delete Student"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Book className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-bold truncate tracking-tight">{student.course}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(student.attendance).map(([day, active]) => {
                        if (!active) return null;
                        const isWeekend = day === 'saturday' || day === 'sunday';
                        return (
                          <span key={day} className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${
                            isWeekend 
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40' 
                              : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40'
                          }`}>
                            {day.substring(0, 3)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{student.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>{student.time}</span>
                      </div>
                    </div>
                    <span className="text-[8px] opacity-60">Entry {new Date(student.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900/40">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Purge Record?</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                You are removing <span className="font-black text-indigo-600 dark:text-indigo-400 uppercase">{studentToDelete.name}</span>. This action is final and synchronized across all system instances.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-10">
              <button 
                onClick={confirmDelete}
                className="w-full bg-rose-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-rose-200 dark:shadow-none active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setStudentToDelete(null)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Abort Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentList;
