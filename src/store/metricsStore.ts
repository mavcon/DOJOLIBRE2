import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalorieMetrics, UserMetrics, WorkoutMetrics } from '../types/metrics';

const MET_VALUE = 7.5;

const DEFAULT_METRICS: UserMetrics = {
  userId: '',
  weight: 70,
  weightUnit: 'kg',
  workouts: {
    recent: null,
    weekly: [],
    monthly: [],
    yearly: [],
  },
};

interface MetricsState {
  userMetrics: Record<string, UserMetrics>;
  setUserWeight: (userId: string, weight: number, unit: 'kg' | 'lbs') => void;
  calculateCalories: (userId: string, durationMinutes: number) => number;
  addWorkout: (userId: string, workout: WorkoutMetrics) => void;
  getTimeRangeMetrics: (userId: string) => UserMetrics;
}

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set, get) => ({
      userMetrics: {},

      setUserWeight: (userId: string, weight: number, unit: 'kg' | 'lbs') => {
        set((state) => ({
          userMetrics: {
            ...state.userMetrics,
            [userId]: {
              ...(state.userMetrics[userId] || { ...DEFAULT_METRICS, userId }),
              weight,
              weightUnit: unit,
            },
          },
        }));
      },

      calculateCalories: (userId: string, durationMinutes: number) => {
        const metrics = get().getTimeRangeMetrics(userId);
        const weightInKg = metrics.weightUnit === 'lbs' 
          ? metrics.weight * 0.45359237 
          : metrics.weight;

        return (MET_VALUE * weightInKg * (durationMinutes / 60) * 3.5) / 200;
      },

      addWorkout: (userId: string, workout: WorkoutMetrics) => {
        set((state) => {
          const currentMetrics = state.userMetrics[userId] || {
            ...DEFAULT_METRICS,
            userId,
          };

          const now = new Date();
          const workoutDate = new Date(workout.date);
          
          // Update time ranges
          const weekly = [...(currentMetrics.workouts?.weekly || [])].filter(
            w => new Date(w.date).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          const monthly = [...(currentMetrics.workouts?.monthly || [])].filter(
            w => new Date(w.date).getTime() > now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          const yearly = [...(currentMetrics.workouts?.yearly || [])].filter(
            w => new Date(w.date).getTime() > now.getTime() - 365 * 24 * 60 * 60 * 1000
          );

          return {
            userMetrics: {
              ...state.userMetrics,
              [userId]: {
                ...currentMetrics,
                workouts: {
                  recent: workout,
                  weekly: [...weekly, workout],
                  monthly: [...monthly, workout],
                  yearly: [...yearly, workout],
                },
              },
            },
          };
        });
      },

      getTimeRangeMetrics: (userId: string) => {
        const metrics = get().userMetrics[userId];
        if (!metrics) {
          return { ...DEFAULT_METRICS, userId };
        }
        return {
          ...metrics,
          workouts: {
            recent: metrics.workouts?.recent || null,
            weekly: metrics.workouts?.weekly || [],
            monthly: metrics.workouts?.monthly || [],
            yearly: metrics.workouts?.yearly || [],
          },
        };
      },
    }),
    {
      name: 'metrics-storage',
    }
  )
);