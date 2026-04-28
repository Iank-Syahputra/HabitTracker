'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, ListChecks } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (title: string, taskType: 'daily' | 'checklist') => void;
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<'daily' | 'checklist'>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), taskType);
    setTitle('');
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="rounded-xl glass-card border border-white/10 p-4"
    >
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-lg border border-white/10 bg-slate-800/50 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <div className="flex rounded-lg border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setTaskType('daily')}
            className={`flex items-center gap-1 px-3 py-2 text-sm transition-all ${
              taskType === 'daily' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' 
                : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50'
            }`}
          >
            <Clock className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setTaskType('checklist')}
            className={`flex items-center gap-1 px-3 py-2 text-sm transition-all ${
              taskType === 'checklist' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' 
                : 'bg-slate-800/50 text-muted-foreground hover:bg-slate-700/50'
            }`}
          >
            <ListChecks className="h-4 w-4" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!title.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {taskType === 'daily' 
          ? 'Daily: Resets automatically at midnight' 
          : 'Checklist: Manual reset when needed'}
      </p>
    </motion.form>
  );
}