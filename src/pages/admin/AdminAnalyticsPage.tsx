import React from 'react';
import { Users, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { AdminMetricsGrid } from '../../components/admin/AdminMetricsGrid';
import { AdminChart } from '../../components/admin/AdminChart';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { useLocationStore } from '../../store/locationStore';
import { useUserStore } from '../../store/userStore';

export function AdminAnalyticsPage() {
  const { metrics } = useAnalyticsStore();
  const { locations } = useLocationStore();
  const { users } = useUserStore();

  const overviewMetrics = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      change: `+${metrics.signups.growth}% from last month`,
    },
    {
      title: 'Total Revenue',
      value: `$${metrics.revenue.total.toLocaleString()}`,
      icon: DollarSign,
      change: `+${metrics.revenue.growth}% from last month`,
    },
    {
      title: 'Retention Rate',
      value: `${metrics.retention.rate}%`,
      icon: Percent,
      change: 'Last 30 days',
    },
    {
      title: 'Growth Rate',
      value: `${metrics.growth.userGrowth}%`,
      icon: TrendingUp,
      change: 'Month over month',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <AdminMetricsGrid metrics={overviewMetrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Chart */}
        <AdminChart
          title="User Signups"
          data={metrics.signups.daily}
          dataKey="count"
          xAxisKey="date"
        />

        {/* Revenue Chart */}
        <AdminChart
          title="Revenue"
          data={metrics.revenue.daily}
          dataKey="amount"
          xAxisKey="date"
        />
      </div>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Basic Members</h3>
          <div className="text-3xl font-bold">{metrics.subscriptions.basic}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Active subscriptions
          </div>
        </div>

        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Pro Members</h3>
          <div className="text-3xl font-bold">{metrics.subscriptions.pro}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Active subscriptions
          </div>
        </div>

        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Premium Members</h3>
          <div className="text-3xl font-bold">{metrics.subscriptions.premium}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Active subscriptions
          </div>
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-6">Growth Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              User Growth
            </h3>
            <p className="text-2xl font-bold mt-2">
              {metrics.growth.userGrowth}%
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Location Growth
            </h3>
            <p className="text-2xl font-bold mt-2">
              {metrics.growth.locationGrowth}%
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Revenue Growth
            </h3>
            <p className="text-2xl font-bold mt-2">
              {metrics.growth.revenueGrowth}%
            </p>
          </div>
        </div>
      </div>

      {/* Retention Cohorts */}
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-6">Retention Cohorts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2">Cohort</th>
                {Array.from({ length: 8 }, (_, i) => (
                  <th key={i} className="text-center py-2">
                    Week {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.retention.cohorts.map((cohort) => (
                <tr key={cohort.startDate}>
                  <td className="py-2">
                    {new Date(cohort.startDate).toLocaleDateString()}
                    <br />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {cohort.users} users
                    </span>
                  </td>
                  {cohort.retentionByWeek.map((rate, i) => (
                    <td
                      key={i}
                      className="text-center py-2"
                      style={{
                        background: `rgba(99, 102, 241, ${rate / 100})`,
                      }}
                    >
                      {rate}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}