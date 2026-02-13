
import React, { useState } from 'react';
import { Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import { extractStudentData } from '../services/geminiService';
import { APIExtractionResult } from '../types';

interface AISmartFillProps {
  onExtracted: (data: APIExtractionResult) => void;
}

const AISmartFill: React.FC<AISmartFillProps> = ({ onExtracted }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await extractStudentData(input);
      onExtracted(result);
    } catch (err) {
      setError("Could not extract data. Please check your text and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Smart Fill</h2>
            <p className="text-indigo-100 text-xs">Voice-to-text or Quick paste</p>
          </div>
        </div>
        <p className="text-indigo-50 text-sm leading-relaxed mb-4">
          Paste a message, email, or simple notes about a student. I'll automatically fill the registration form for you.
        </p>
        <div className="bg-white/10 rounded-xl p-3 text-[10px] border border-white/20">
          <strong>Try:</strong> "Register Alice Wong (F), ID AL99, for Math 101 costing $250 today at 2pm"
        </div>
      </div>

      <div className="relative">
        <textarea 
          className="w-full h-40 bg-white border-2 border-slate-100 rounded-2xl p-5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all shadow-sm placeholder:text-slate-400"
          placeholder="Type or paste registration details here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        {error && (
          <div className="flex items-center gap-2 text-rose-500 text-xs mt-2 px-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button 
          onClick={handleProcess}
          disabled={isLoading || !input.trim()}
          className="w-full mt-4 bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Details...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Auto-Fill Form</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8 opacity-40 grayscale pointer-events-none">
        <div className="h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-12 bg-slate-200 rounded-lg"></div>
        <div className="h-12 bg-slate-200 rounded-lg col-span-2"></div>
      </div>
    </div>
  );
};

export default AISmartFill;
