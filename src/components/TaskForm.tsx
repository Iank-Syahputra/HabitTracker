'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (title: string, priority: 'high' | 'medium' | 'low') => void;
  siloType?: 'recurring' | 'one-time';
}

export function TaskForm({ onSubmit, siloType = 'recurring' }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    onSubmit(title.trim(), priority);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    setTitle('');
    setPriority('medium');
    setIsSubmitting(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="rounded-xl glass-card border border-white/10 p-4"
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={siloType === 'one-time' ? "Add a task..." : "Add a daily task..."}
            className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        {(siloType === 'one-time' || siloType === 'recurring') && (
          <div className="flex gap-1">
            <span className="flex items-center text-xs text-muted-foreground py-2 mr-1">Priority:</span>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md transition-all ${
                priority === 'high' 
                  ? 'bg-red-500/80 text-white' 
                  : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50 border border-white/10'
              }`}
            >
              🔴 <span className="xs:hidden sm:hidden md:inline">High</span>
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md transition-all ${
                priority === 'medium' 
                  ? 'bg-yellow-500/80 text-white' 
                  : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50 border border-white/10'
              }`}
            >
              🟡 <span className="xs:hidden sm:hidden md:inline">Med</span>
            </button>
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-md transition-all ${
                priority === 'low' 
                  ? 'bg-green-500/80 text-white' 
                  : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50 border border-white/10'
              }`}
            >
              🟢 <span className="xs:hidden sm:hidden md:inline">Low</span>
            </button>
          </div>
        )}
      </div>
    </motion.form>
  );
}