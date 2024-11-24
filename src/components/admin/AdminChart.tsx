import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdminChartProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  height?: number;
}

export function AdminChart({
  title,
  data,
  dataKey,
  xAxisKey,
  height = 300,
}: AdminChartProps) {
  return (
    <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                border: 'none',
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}