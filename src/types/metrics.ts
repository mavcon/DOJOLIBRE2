export interface CalorieMetrics {
  weight: number;
  weightUnit: 'kg' | 'lbs';
  sessionDuration: number; // in minutes
  caloriesBurned: number;
}

export interface WorkoutMetrics {
  date: Date;
  duration: number; // in minutes
  caloriesBurned: number;
  locationId: string;
}

export interface TimeRange {
  recent: WorkoutMetrics | null;
  weekly: WorkoutMetrics[];
  monthly: WorkoutMetrics[];
  yearly: WorkoutMetrics[];
}

export interface UserMetrics {
  userId: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  workouts: TimeRange;
}