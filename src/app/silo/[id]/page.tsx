'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Loader2, WifiOff } from 'lucide-react';
import { TaskItem } from '@/components/TaskItem';
import { TaskForm } from '@/components/TaskForm';
import { Confetti } from '@/components/Confetti';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getIcon, type IconKey } from '@/utils/icons';
import type { Task } from '@/types';

export default function SiloPage() {
  const params = useParams();
  const router = useRouter();
  const siloId = params.id as string;
  
  const [showConfetti, setShowConfetti] = useState(false);
  const prevProgressRef = useRef(0);

  const { user, initialize } = useAuthStore();
  const {
    silos,
    addTask,
    deleteTask,
    toggleTaskComplete,
    getTasksForSilo,
    getSilosWithProgress,
    isOnline,
    isLoading,
  } = useDataStore();

  useEffect(() => {
    initialize();
  }, []);

  const silo = silos.find(s => s.id === siloId);
  const tasksForSilo = getTasksForSilo(siloId);
  const allSilosWithProgress = getSilosWithProgress();
  const siloProgress = allSilosWithProgress.find(s => s.id === siloId);

  useEffect(() => {
    if (siloProgress && siloProgress.progress > prevProgressRef.current && prevProgressRef.current < 100 && siloProgress.progress === 100) {
      setShowConfetti(true);
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    }
    prevProgressRef.current = siloProgress?.progress || 0;
  }, [siloProgress?.progress]);

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => setShowConfetti(false), 1500);
    }
  }, [showConfetti]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!silo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4 text-muted-foreground">Silo not found</p>
          <button
            onClick={() => router.push('/')}
            className="text-emerald-500 hover:underline"
          >
            Go back to Lobby
          </button>
        </div>
      </div>
    );
  }

  const Icon = getIcon(silo.icon as IconKey);
  const completedCount = tasksForSilo.filter(t => t.isCompletedToday).length;
  const progress = tasksForSilo.length > 0 
    ? Math.round((completedCount / tasksForSilo.length) * 100)
    : 0;

  const handleAddTask = (title: string, taskType: 'daily' | 'checklist') => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      category_id: siloId,
      title,
      task_type: taskType,
      created_at: new Date().toISOString(),
      order: tasksForSilo.length
    };
    addTask(siloId, newTask);
  };

  const handleToggleTask = (taskId: string) => {
    toggleTaskComplete(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      deleteTask(siloId, taskId);
    }
  };

  const isComplete = progress === 100 && tasksForSilo.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Confetti trigger={showConfetti} />
      
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex h-10 w-10 items-center justify-center rounded-full glass-card border border-white/10 transition-all hover:border-white/20 hover:bg-slate-700/50"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div
            className="flex flex-1 items-center gap-3 rounded-xl p-3 glass-card"
            style={{ backgroundColor: `${silo.color_theme}15` }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${silo.color_theme}30` }}
            >
              <Icon className="h-5 w-5" style={{ color: silo.color_theme }} />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">{silo.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">
                {completedCount}/{tasksForSilo.length} completed
              </p>
            </div>
            {!isOnline && (
              <WifiOff className="h-5 w-5 text-orange-500" />
            )}
          </div>
        </header>

        <div className="mb-6 h-3 rounded-full bg-slate-800/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ 
              background: progress === 100 
                ? 'linear-gradient(90deg, #6366F1, #10B981)'
                : `linear-gradient(90deg, ${silo.color_theme}, ${silo.color_theme}dd)`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 py-4 border border-emerald-500/30"
          >
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Silo Complete!</span>
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </motion.div>
        )}

        <section className="mb-6">
          <TaskForm onSubmit={handleAddTask} />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Tasks</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : tasksForSilo.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 py-12 text-center glass-card"
            >
              <p className="text-muted-foreground">No tasks yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add your first task above</p>
            </motion.div>
          ) : (
            <motion.div layout className="space-y-3">
              <AnimatePresence>
                {tasksForSilo.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    color={silo.color_theme}
                    onToggle={() => handleToggleTask(task.id)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}