export interface Profile {
  id: string;
  email: string;
  full_name: string;
}

export interface Silo {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color_theme: string;
  created_at: string;
  silo_type: 'recurring' | 'one-time';
}

export interface Task {
  id: string;
  category_id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  order: number;
}

export interface TaskLog {
  id: string;
  task_id: string;
  completed_at: string;
  is_completed: boolean;
}

export interface SiloWithProgress extends Silo {
  progress: number;
  completedCount: number;
  totalCount: number;
  tasks: TaskWithStatus[];
  streak: number;
  completedDates: string[];
}

export interface TaskWithStatus extends Task {
  isCompletedToday: boolean;
  todayLog?: TaskLog;
}