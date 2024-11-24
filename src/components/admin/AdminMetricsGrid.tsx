import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
}

interface AdminMetricsGridProps {
  metrics: MetricProps[];
}

export function AdminMetricsGrid({ metrics }: AdminMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400">{metric.title}</h3>
              <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            {metric.change && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {metric.change}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}