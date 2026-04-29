import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export type { User, Session, AuthError };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color_theme: string;
          position: number;
          silo_type: 'recurring' | 'one-time';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          color_theme?: string;
          position?: number;
          silo_type?: 'recurring' | 'one-time';
        };
        Update: {
          name?: string;
          icon?: string;
          color_theme?: string;
          position?: number;
          silo_type?: 'recurring' | 'one-time';
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          category_id: string;
          title: string;
          task_type: 'daily' | 'checklist';
          priority: 'high' | 'medium' | 'low';
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          title: string;
          task_type?: 'daily' | 'checklist';
          priority?: 'high' | 'medium' | 'low';
          position?: number;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          task_type?: 'daily' | 'checklist';
          priority?: 'high' | 'medium' | 'low';
          position?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      task_logs: {
        Row: {
          id: string;
          task_id: string;
          completed_at: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          completed_at?: string;
          is_completed?: boolean;
        };
        Update: {
          completed_at?: string;
          is_completed?: boolean;
        };
      };
    };
  };
};

export const tables = {
  profiles: 'profiles',
  categories: 'categories',
  tasks: 'tasks',
  task_logs: 'task_logs',
} as const;

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email: string, password: string, options?: { data?: { full_name?: string } }) {
  return supabase.auth.signUp({ email, password, options });
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });
}

export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });
}

export async function updatePassword(newPassword: string) {
  return supabase.auth.updateUser({ password: newPassword });
}

export async function updateProfile(updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');
  
  return supabase
    .from(tables.profiles)
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
}

export async function getProfile(userId: string) {
  return supabase
    .from(tables.profiles)
    .select('*')
    .eq('id', userId)
    .single();
}

export async function getCategories() {
  return supabase
    .from(tables.categories)
    .select('*')
    .order('position', { ascending: true });
}

export async function getCategoryById(id: string) {
  return supabase
    .from(tables.categories)
    .select('*')
    .eq('id', id)
    .single();
}

export async function createCategory(category: Partial<Database['public']['Tables']['categories']['Insert']>) {
  return supabase
    .from(tables.categories)
    .insert(category)
    .select()
    .single();
}

export async function updateCategory(id: string, updates: Partial<Database['public']['Tables']['categories']['Update']>) {
  return supabase
    .from(tables.categories)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteCategory(id: string) {
  return supabase
    .from(tables.categories)
    .delete()
    .eq('id', id);
}

export async function getTasks(categoryId: string) {
  return supabase
    .from(tables.tasks)
    .select('*')
    .eq('category_id', categoryId)
    .order('position', { ascending: true });
}

export async function createTask(task: Partial<Database['public']['Tables']['tasks']['Insert']>) {
  return supabase
    .from(tables.tasks)
    .insert(task)
    .select()
    .single();
}

export async function updateTask(id: string, updates: Partial<Database['public']['Tables']['tasks']['Update']>) {
  return supabase
    .from(tables.tasks)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteTask(id: string) {
  return supabase
    .from(tables.tasks)
    .delete()
    .eq('id', id);
}

export async function reorderTasks(taskIds: string[]) {
  const updates = taskIds.map((id, index) => ({
    id,
    position: index,
  }));
  
  return Promise.all(
    updates.map(({ id, position }) =>
      supabase
        .from(tables.tasks)
        .update({ position })
        .eq('id', id)
    )
  );
}

export async function toggleTaskComplete(taskId: string) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const { data: existingLogs } = await supabase
    .from(tables.task_logs)
    .select('*')
    .eq('task_id', taskId)
    .gte('completed_at', todayStart.toISOString())
    .lte('completed_at', todayEnd.toISOString())
    .eq('is_completed', true)
    .single();

  if (existingLogs) {
    return supabase
      .from(tables.task_logs)
      .update({ is_completed: false })
      .eq('id', existingLogs.id);
  } else {
    return supabase
      .from(tables.task_logs)
      .insert({
        task_id: taskId,
        completed_at: new Date().toISOString(),
        is_completed: true,
      });
  }
}

export async function getTodayTaskLogs(taskId: string) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  return supabase
    .from(tables.task_logs)
    .select('*')
    .eq('task_id', taskId)
    .gte('completed_at', todayStart.toISOString())
    .lte('completed_at', todayEnd.toISOString())
    .eq('is_completed', true);
}

export async function getTaskLogsForDateRange(taskId: string, startDate: Date, endDate: Date) {
  return supabase
    .from(tables.task_logs)
    .select('*')
    .eq('task_id', taskId)
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString())
    .eq('is_completed', true);
}

export async function getContributionHeatmap(userId: string, days: number = 365) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));

  const { data: logs } = await supabase
    .from(tables.task_logs)
    .select(`
      id,
      completed_at,
      task:tasks(
        category:categories(
          user_id
        )
      )
    `)
    .eq('is_completed', true)
    .gte('completed_at', startDate.toISOString())
    .order('completed_at', { ascending: true });

  const countsByDate = new Map<string, number>();
  
  logs?.forEach((log: any) => {
    const date = new Date(log.completed_at).toISOString().split('T')[0];
    countsByDate.set(date, (countsByDate.get(date) || 0) + 1);
  });

  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      count: countsByDate.get(dateStr) || 0,
    });
  }

  return result;
}

export async function getUserTaskLogs(userId: string, days: number = 365) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: logs } = await supabase
    .from(tables.task_logs)
    .select(`
      id,
      task_id,
      completed_at,
      is_completed
    `)
    .eq('is_completed', true)
    .gte('completed_at', startDate.toISOString())
    .order('completed_at', { ascending: true });

  return logs || [];
}

export function subscribeToCategories(callback: (payload: any) => void) {
  return supabase
    .channel('categories')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, callback)
    .subscribe();
}

export function subscribeToTasks(callback: (payload: any) => void) {
  return supabase
    .channel('tasks')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
    .subscribe();
}

export function subscribeToTaskLogs(callback: (payload: any) => void) {
  return supabase
    .channel('task_logs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_logs' }, callback)
    .subscribe();
}

export function unsubscribe(channel: any) {
  return supabase.removeChannel(channel);
}