import React from 'react';
import { Filter as FilterIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function Filter({ options, value, onChange, label }: FilterProps) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-white dark:bg-black border dark:border-gray-800 rounded-md"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}