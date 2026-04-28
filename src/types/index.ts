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
}

export interface Task {
  id: string;
  category_id: string;
  title: string;
  task_type: 'daily' | 'checklist';
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
}

export interface TaskWithStatus extends Task {
  isCompletedToday: boolean;
  todayLog?: TaskLog;
}