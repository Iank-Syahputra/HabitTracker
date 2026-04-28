'use client';

import { motion } from 'framer-motion';
import { Check, Trash2, Clock, ListChecks } from 'lucide-react';
import type { TaskWithStatus } from '@/types';

interface TaskItemProps {
  task: TaskWithStatus;
  color: string;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, color, onToggle, onDelete }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-center gap-3 rounded-xl border p-4 transition-all ${
        task.isCompletedToday 
          ? 'border-green-500/30 bg-green-500/10' 
          : 'border-input bg-card hover:border-primary/30'
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
          task.isCompletedToday
            ? 'border-green-500 bg-green-500'
            : 'border-input group-hover:border-primary'
        }`}
      >
        {task.isCompletedToday && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${
          task.isCompletedToday ? 'line-through text-muted-foreground' : ''
        }`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {task.task_type === 'daily' ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Daily
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              Checklist
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}