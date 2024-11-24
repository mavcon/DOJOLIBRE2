import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
}

export function MetricsCard({ title, value, change, icon: Icon }: MetricsCardProps) {
  return (
    <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 dark:text-gray-400">{title}</h3>
        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{change}</p>
      )}
    </div>
  );
}