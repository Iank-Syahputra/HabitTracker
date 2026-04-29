import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Silo, Task, TaskLog, SiloWithProgress, TaskWithStatus } from '@/types';

interface AppState {
  silos: Silo[];
  tasks: Record<string, Task[]>;
  taskLogs: TaskLog[];
  currentUserId: string | null;
  
  setCurrentUserId: (userId: string | null) => void;
  
  addSilo: (silo: Silo) => void;
  updateSilo: (id: string, updates: Partial<Silo>) => void;
  deleteSilo: (id: string) => void;
  
  addTask: (siloId: string, task: Task) => void;
  updateTask: (siloId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (siloId: string, taskId: string) => void;
  reorderTasks: (siloId: string, tasks: Task[]) => void;
  
  toggleTaskComplete: (taskId: string, date?: string) => void;
  
  getSilosWithProgress: () => SiloWithProgress[];
  getTasksForSilo: (siloId: string) => TaskWithStatus[];
  
  clearAllData: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

function calculateStreak(completedDates: string[], totalTasks: number): number {
  if (completedDates.length === 0 || totalTasks === 0) return 0;
  
  const sortedDates = [...completedDates].sort().reverse();
  const today = getToday();
  
  let streak = 0;
  let currentDate = new Date(today);
  const todayStr = today;
  
  const hasCompletedToday = sortedDates.includes(todayStr);
  if (!hasCompletedToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const index = sortedDates.indexOf(dateStr);
    
    if (index !== -1) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      silos: [],
      tasks: {},
      taskLogs: [],
      currentUserId: null,
      
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      
      addSilo: (silo) => set((state) => ({
        silos: [...state.silos, silo],
        tasks: { ...state.tasks, [silo.id]: [] }
      })),
      
      updateSilo: (id, updates) => set((state) => ({
        silos: state.silos.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      
      deleteSilo: (id) => set((state) => {
        const { [id]: removed, ...remainingTasks } = state.tasks;
        return {
          silos: state.silos.filter((s) => s.id !== id),
          tasks: remainingTasks
        };
      }),
      
      addTask: (siloId, task) => set((state) => ({
        tasks: {
          ...state.tasks,
          [siloId]: [...(state.tasks[siloId] || []), task]
        }
      })),
      
      updateTask: (siloId, taskId, updates) => set((state) => ({
        tasks: {
          ...state.tasks,
          [siloId]: state.tasks[siloId]?.map((t) => 
            t.id === taskId ? { ...t, ...updates } : t
          ) || []
        }
      })),
      
      deleteTask: (siloId, taskId) => set((state) => ({
        tasks: {
          ...state.tasks,
          [siloId]: state.tasks[siloId]?.filter((t) => t.id !== taskId) || []
        }
      })),
      
      reorderTasks: (siloId, reorderedTasks) => set((state) => ({
        tasks: { ...state.tasks, [siloId]: reorderedTasks }
      })),
      
      toggleTaskComplete: (taskId, date = getToday()) => set((state) => {
        const existingLog = state.taskLogs.find(
          (log) => log.task_id === taskId && log.completed_at.startsWith(date) && log.is_completed
        );
        
        if (existingLog) {
          return {
            taskLogs: state.taskLogs.map((log) => 
              log.id === existingLog.id ? { ...log, is_completed: false } : log
            )
          };
        } else {
          const newLog: TaskLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            task_id: taskId,
            completed_at: new Date().toISOString(),
            is_completed: true
          };
          return { taskLogs: [...state.taskLogs, newLog] };
        }
      }),
      
      getSilosWithProgress: () => {
        const state = get();
        const today = getToday();
        
        return state.silos.map((silo) => {
          const siloTasks = state.tasks[silo.id] || [];
          const siloType = (silo as any).silo_type || 'recurring';
          const completedToday = siloTasks.filter((task) => 
            state.taskLogs.some(
              (log) => 
                log.task_id === task.id && 
                log.completed_at.startsWith(today) && 
                log.is_completed
            )
          ).length;
          
          let completedDates: string[] = [];
          let streak = 0;
          
          if (siloType === 'recurring' && siloTasks.length > 0) {
            const allLogs = state.taskLogs.filter(log => log.is_completed);
            const siloTaskIds = new Set(siloTasks.map(t => t.id));
            
            const logsByDate = new Map<string, TaskLog[]>();
            allLogs.forEach(log => {
              const dateStr = log.completed_at.split('T')[0];
              if (!logsByDate.has(dateStr)) {
                logsByDate.set(dateStr, []);
              }
              logsByDate.get(dateStr)!.push(log);
            });
            
            const perfectDates: string[] = [];
            logsByDate.forEach((logs, dateStr) => {
              const completedTaskIds = new Set(logs.map(l => l.task_id));
              const allCompleted = [...siloTaskIds].every(taskId => 
                completedTaskIds.has(taskId)
              );
              
              if (allCompleted) {
                perfectDates.push(dateStr);
              }
            });
            
            completedDates = perfectDates.sort();
            streak = calculateStreak(completedDates, siloTasks.length);
          }
          
          return {
            ...silo,
            progress: siloTasks.length > 0 
              ? Math.round((completedToday / siloTasks.length) * 100) 
              : 0,
            completedCount: completedToday,
            totalCount: siloTasks.length,
            tasks: siloTasks.map((task) => ({
              ...task,
              isCompletedToday: state.taskLogs.some(
                (log) => 
                  log.task_id === task.id && 
                  log.completed_at.startsWith(today) && 
                  log.is_completed
              )
            })),
            streak,
            completedDates,
          };
        });
      },
      
      getTasksForSilo: (siloId) => {
        const state = get();
        const today = getToday();
        const siloTasks = state.tasks[siloId] || [];
        
        return siloTasks.map((task) => ({
          ...task,
          isCompletedToday: state.taskLogs.some(
            (log) => 
              log.task_id === task.id && 
              log.completed_at.startsWith(today) && 
              log.is_completed
          )
        }));
      },
      
      clearAllData: () => set({
        silos: [],
        tasks: {},
        taskLogs: [],
        currentUserId: null
      })
    }),
    {
      name: 'synergyhub-storage',
    }
  )
);