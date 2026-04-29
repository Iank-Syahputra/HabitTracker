'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Clock, ListChecks } from 'lucide-react';
import type { TaskWithStatus } from '@/types';
import { useState } from 'react';

interface TaskItemProps {
  task: TaskWithStatus;
  color: string;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, color, onToggle, onDelete }: TaskItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (!task.isCompletedToday) {
      setIsAnimating(true);
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
      setTimeout(() => setIsAnimating(false), 400);
    }
    onToggle();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-center gap-3 rounded-xl border p-4 transition-all glass-card ${
        task.isCompletedToday 
          ? 'border-emerald-500/30 bg-emerald-500/10' 
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      <button
        onClick={handleToggle}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          task.isCompletedToday
            ? 'border-emerald-500 bg-emerald-500 checkbox-glow'
            : 'border-white/20 group-hover:border-emerald-500/50'
        } ${isAnimating ? 'checkbox-explode' : ''}`}
      >
        {task.isCompletedToday && (
          <motion.svg
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate text-foreground ${
          task.isCompletedToday ? 'line-through text-muted-foreground' : ''
        }`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {task.priority === 'high' && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              🔴 High
            </span>
          )}
          {task.priority === 'medium' && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              🟡 Medium
            </span>
          )}
          {task.priority === 'low' && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              🟢 Low
            </span>
          )}
          {!task.priority && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Daily
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground sm:opacity-0 sm:hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}