import { create } from 'zustand';
import { PlatformMetrics } from '../types/analytics';

interface AnalyticsState {
  metrics: PlatformMetrics;
}

// Mock data for development
const MOCK_METRICS: PlatformMetrics = {
  signups: {
    total: 1250,
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20 + 10),
    })),
    monthly: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, 11 - i, 1).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 300 + 100),
    })),
    yearly: Array.from({ length: 3 }, (_, i) => ({
      year: 2024 - i,
      count: Math.floor(Math.random() * 3000 + 1000),
    })),
    growth: 15.5,
  },
  revenue: {
    total: 125000,
    daily: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 1000 + 500),
    })),
    monthly: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, 11 - i, 1).toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 15000 + 8000),
    })),
    yearly: Array.from({ length: 3 }, (_, i) => ({
      year: 2024 - i,
      amount: Math.floor(Math.random() * 150000 + 100000),
    })),
    growth: 22.3,
  },
  retention: {
    rate: 78.5,
    cohorts: Array.from({ length: 6 }, (_, i) => ({
      startDate: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 100 + 50),
      retentionByWeek: Array.from({ length: 8 }, () => Math.floor(Math.random() * 100)),
    })),
  },
  growth: {
    userGrowth: 18.7,
    locationGrowth: 12.4,
    revenueGrowth: 22.3,
  },
  subscriptions: {
    basic: 750,
    pro: 350,
    premium: 150,
    conversionRate: 15.8,
  },
};

export const useAnalyticsStore = create<AnalyticsState>(() => ({
  metrics: MOCK_METRICS,
}));