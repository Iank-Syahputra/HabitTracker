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
            completed_at: `${date}T00:00:00.000Z`,
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
          const completedToday = siloTasks.filter((task) => 
            state.taskLogs.some(
              (log) => 
                log.task_id === task.id && 
                log.completed_at.startsWith(today) && 
                log.is_completed
            )
          ).length;
          
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
            }))
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