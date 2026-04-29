import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Silo, Task, TaskLog, SiloWithProgress, TaskWithStatus } from '@/types';
import {
  getCategories,
  getTasks,
  toggleTaskComplete as dbToggleTaskComplete,
  createCategory as dbCreateCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  createTask as dbCreateTask,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getContributionHeatmap,
  getCurrentUser,
  getUserTaskLogs,
  type Database,
  supabase,
} from '@/lib/database/client';

interface DataState {
  silos: Silo[];
  tasks: Record<string, Task[]>;
  taskLogs: TaskLog[];
  heatmapData: { date: string; count: number }[];
  isOnline: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  
  initialize: () => Promise<void>;
  syncFromServer: () => Promise<void>;
  
  addSilo: (silo: Silo) => Promise<void>;
  updateSilo: (id: string, updates: Partial<Silo>) => Promise<void>;
  deleteSilo: (id: string) => Promise<void>;
  
  addTask: (siloId: string, task: Task) => Promise<void>;
  updateTask: (siloId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (siloId: string, taskId: string) => Promise<void>;
  reorderTasks: (siloId: string, tasks: Task[]) => Promise<void>;
  
  toggleTaskComplete: (taskId: string) => Promise<void>;
  
  getSilosWithProgress: () => SiloWithProgress[];
  getTasksForSilo: (siloId: string) => TaskWithStatus[];
  getHeatmapData: () => { date: string; count: number; max: number }[];
  
  setOnline: (online: boolean) => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

function getLocalDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

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

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      silos: [],
      tasks: {},
      taskLogs: [],
      heatmapData: [],
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      isLoading: false,
      isSyncing: false,

      initialize: async () => {
        const user = await getCurrentUser();
        if (user) {
          await get().syncFromServer();
        }
      },

      syncFromServer: async () => {
        set({ isSyncing: true });
        try {
          const user = await getCurrentUser();
          const { data: categories } = await getCategories();
          
          let heatmap: any[] = [];
          let serverTaskLogs: TaskLog[] = [];
          if (user) {
            const heatmapResult = await getContributionHeatmap(user.id, 365);
            heatmap = heatmapResult || [];
            const taskLogsResult = await getUserTaskLogs(user.id, 365);
            serverTaskLogs = taskLogsResult.map((log: any) => ({
              id: log.id,
              task_id: log.task_id,
              completed_at: log.completed_at,
              is_completed: log.is_completed,
            }));
          }

          const siloTasks: Record<string, Task[]> = {};
          const allTaskLogs: TaskLog[] = [];
          
          if (categories) {
            for (const silo of categories) {
              const { data: tasks } = await getTasks(silo.id);
              if (tasks) {
                siloTasks[silo.id] = tasks;
              }
            }
          }

          set({
            silos: categories || [],
            tasks: siloTasks,
            taskLogs: serverTaskLogs || [],
            heatmapData: heatmap || [],
            isLoading: false,
            isSyncing: false,
          });
        } catch (error) {
          console.error('Sync error:', error);
          set({ isSyncing: false });
        }
      },

      addSilo: async (silo) => {
        const state = get();
        const user = await getCurrentUser();
        const userId = user?.id;
        
        if (!userId) {
          console.error('No user logged in');
          return;
        }
        
        const newSilos = [...(state.silos || []), silo];
        const newTasks = { ...state.tasks, [silo.id]: [] };
        set({ silos: newSilos, tasks: newTasks });
        
        if (state.isOnline) {
          try {
            await dbCreateCategory({
              user_id: userId,
              name: silo.name,
              icon: silo.icon,
              color_theme: silo.color_theme,
              position: state.silos.length,
              silo_type: silo.silo_type || 'recurring',
            });
            await get().syncFromServer();
          } catch (error) {
            console.error('Failed to create silo on server:', error);
          }
        }
      },

      updateSilo: async (id, updates) => {
        const state = get();
        const newSilos = (state.silos || []).map((s) => s.id === id ? { ...s, ...updates } : s);
        set({ silos: newSilos });
        
        if (state.isOnline) {
          try {
            await dbUpdateCategory(id, updates);
          } catch (error) {
            console.error('Failed to update silo on server:', error);
          }
        }
      },

      deleteSilo: async (id) => {
        const state = get();
        const newSilos = (state.silos || []).filter((s) => s.id !== id);
        const { [id]: removed, ...remainingTasks } = state.tasks;
        set({ silos: newSilos, tasks: remainingTasks });
        
        if (state.isOnline) {
          try {
            await dbDeleteCategory(id);
          } catch (error) {
            console.error('Failed to delete silo on server:', error);
          }
        }
      },

      addTask: async (siloId, task) => {
        const state = get();
        const currentTasks = Array.isArray(state.tasks[siloId]) ? state.tasks[siloId] : [];
        const newTasks = {
          ...state.tasks,
          [siloId]: [...currentTasks, task],
        };
        set({ tasks: newTasks });
        
        if (state.isOnline) {
          try {
            const taskData: {
              category_id: string;
              title: string;
              task_type?: 'daily' | 'checklist';
              priority?: 'high' | 'medium' | 'low';
              position: number;
            } = {
              category_id: siloId,
              title: task.title,
              task_type: 'daily',
              priority: task.priority || 'medium',
              position: task.order,
            };
            console.log('=== DEBUG TASK CREATE ===');
            console.log('siloId:', siloId);
            console.log('taskData:', JSON.stringify(taskData));
            
            const result = await dbCreateTask(taskData);
            console.log('Result:', JSON.stringify(result, null, 2));
            
            if (result.error) {
              console.error('DB Error:', result.error.message, result.error.details);
            } else {
              console.log('✅ Task saved to DB successfully');
              await get().syncFromServer();
            }
          } catch (error: any) {
            console.error('❌ Failed to create task:', error?.message || error);
          }
        }
      },

      updateTask: async (siloId, taskId, updates) => {
        const state = get();
        const currentTasks = Array.isArray(state.tasks[siloId]) ? state.tasks[siloId] : [];
        const newTasks = {
          ...state.tasks,
          [siloId]: currentTasks.map((t) => 
            t.id === taskId ? { ...t, ...updates } : t
          ),
        };
        set({ tasks: newTasks });
        
        if (state.isOnline) {
          try {
            await dbUpdateTask(taskId, updates);
          } catch (error) {
            console.error('Failed to update task on server:', error);
          }
        }
      },

      deleteTask: async (siloId, taskId) => {
        const state = get();
        const currentTasks = Array.isArray(state.tasks[siloId]) ? state.tasks[siloId] : [];
        const newTasks = {
          ...state.tasks,
          [siloId]: currentTasks.filter((t) => t.id !== taskId),
        };
        set({ tasks: newTasks });
        
        if (state.isOnline) {
          try {
            await dbDeleteTask(taskId);
          } catch (error) {
            console.error('Failed to delete task on server:', error);
          }
        }
      },

      reorderTasks: async (siloId, reorderedTasks) => {
        set({ tasks: { ...get().tasks, [siloId]: reorderedTasks } });
      },

      toggleTaskComplete: async (taskId) => {
        const state = get();
        const today = getToday();
        
        const existingLog = state.taskLogs.find(
          (log) => log.task_id === taskId && log.completed_at.startsWith(today) && log.is_completed
        );
        
        let newLogs: TaskLog[];
        if (existingLog) {
          newLogs = state.taskLogs.map((log) => 
            log.id === existingLog.id ? { ...log, is_completed: false } : log
          );
        } else {
          const newLog: TaskLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            task_id: taskId,
            completed_at: new Date().toISOString(),
            is_completed: true
          };
          newLogs = [...state.taskLogs, newLog];
        }
        
        set({ taskLogs: newLogs });
        
        if (state.isOnline) {
          try {
            await dbToggleTaskComplete(taskId);
          } catch (error) {
            console.error('Failed to toggle task on server:', error);
          }
        }
      },

      getSilosWithProgress: () => {
        const state = get();
        
        if (!state.silos || !Array.isArray(state.silos)) {
          return [];
        }
        
        return state.silos.map((silo) => {
          const siloTasks = Array.isArray(state.tasks[silo.id]) ? state.tasks[silo.id] : [];
          const siloType = (silo as any).silo_type || 'recurring';
          
          if (!siloTasks || !Array.isArray(siloTasks)) {
            return {
              ...silo,
              progress: 0,
              completedCount: 0,
              totalCount: 0,
              tasks: [],
              streak: 0,
              completedDates: [],
            };
          }
          
          const today = getToday();
          
          const tasksWithStatus = siloTasks.map((task) => ({
            ...task,
            isCompletedToday: state.taskLogs.some(
              (log) => 
                log.task_id === task.id && 
                log.completed_at.startsWith(today) && 
                log.is_completed
            )
          }));
          
          const completedTodayCount = tasksWithStatus.filter(t => t.isCompletedToday).length;
          
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
              ? Math.round((completedTodayCount / siloTasks.length) * 100) 
              : 0,
            completedCount: completedTodayCount,
            totalCount: siloTasks.length,
            tasks: tasksWithStatus,
            streak,
            completedDates,
          };
        });
      },

      getTasksForSilo: (siloId) => {
        const state = get();
        const today = getToday();
        const siloTasks = Array.isArray(state.tasks[siloId]) ? state.tasks[siloId] : [];
        
        const silo = state.silos.find(s => s.id === siloId);
        const siloType = (silo as any)?.silo_type || 'recurring';
        
        const tasksWithStatus = siloTasks.map((task) => ({
          ...task,
          isCompletedToday: state.taskLogs.some(
            (log) => 
              log.task_id === task.id && 
              log.completed_at.startsWith(today) && 
              log.is_completed
          )
        }));
        
        if (siloType === 'one-time') {
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return tasksWithStatus.sort((a, b) => {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          });
        }
        
        return tasksWithStatus;
      },

      getHeatmapData: () => {
        const state = get();
        const maxCount = Math.max(...state.heatmapData.map(d => d.count), 1);
        
        return state.heatmapData.map(d => ({
          ...d,
          max: maxCount,
        }));
      },

      setOnline: (online) => set({ isOnline: online }),
    }),
    {
      name: 'synergyhub-data',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        silos: state.silos,
        tasks: state.tasks,
        taskLogs: state.taskLogs,
        heatmapData: state.heatmapData,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useDataStore.getState().setOnline(true));
  window.addEventListener('offline', () => useDataStore.getState().setOnline(false));
}