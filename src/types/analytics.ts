export interface PlatformMetrics {
  signups: {
    total: number;
    daily: { date: string; count: number }[];
    monthly: { month: string; count: number }[];
    yearly: { year: number; count: number }[];
    growth: number; // Percentage
  };
  revenue: {
    total: number;
    daily: { date: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    yearly: { year: number; amount: number }[];
    growth: number; // Percentage
  };
  retention: {
    rate: number; // Percentage
    cohorts: {
      startDate: string;
      users: number;
      retentionByWeek: number[];
    }[];
  };
  growth: {
    userGrowth: number; // Percentage
    locationGrowth: number; // Percentage
    revenueGrowth: number; // Percentage
  };
  subscriptions: {
    basic: number;
    pro: number;
    premium: number;
    conversionRate: number; // Percentage
  };
}