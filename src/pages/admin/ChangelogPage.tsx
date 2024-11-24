import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Filter, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/adminStore';
import { ChangelogEntry } from '../../types/auth';

type FilterOptions = {
  entityType?: ChangelogEntry['entityType'];
  startDate?: Date;
  endDate?: Date;
};

export function ChangelogPage() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const { getChangelog } = useAdminStore();

  const entries = getChangelog(filters);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Changelog</h1>
        <div className="flex gap-4">
          <select
            value={filters.entityType || ''}
            onChange={(e) => setFilters({ ...filters, entityType: e.target.value as ChangelogEntry['entityType'] })}
            className="px-3 py-2 bg-white dark:bg-black border dark:border-gray-800 rounded-md"
          >
            <option value="">All Types</option>
            <option value="user">Users</option>
            <option value="location">Locations</option>
            <option value="plan">Plans</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  entry.action === 'create'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : entry.action === 'update'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {entry.action.toUpperCase()}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {entry.entityType.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm')}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Changes</h3>
              <div className="space-y-2">
                {Object.entries(entry.changes).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {key}:
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {JSON.stringify(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}