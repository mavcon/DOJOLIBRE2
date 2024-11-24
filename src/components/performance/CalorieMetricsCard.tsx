import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Scale } from 'lucide-react';
import { Button } from '../ui/Button';
import { useMetricsStore } from '../../store/metricsStore';
import { useAuthStore } from '../../store/authStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function CalorieMetricsCard() {
  const currentUser = useAuthStore(state => state.user);
  const { getTimeRangeMetrics, setUserWeight } = useMetricsStore();
  const [weightInput, setWeightInput] = useState('');
  const [isKg, setIsKg] = useState(true);

  if (!currentUser) return null;

  const metrics = getTimeRangeMetrics(currentUser.id);
  const currentWeight = metrics.weight;
  const currentUnit = metrics.weightUnit;

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      setUserWeight(currentUser.id, weight, isKg ? 'kg' : 'lbs');
      setWeightInput('');
    }
  };

  const toggleUnit = () => {
    const newIsKg = !isKg;
    setIsKg(newIsKg);
    const newWeight = newIsKg 
      ? currentWeight * 0.45359237  // lbs to kg
      : currentWeight * 2.20462;    // kg to lbs
    setUserWeight(currentUser.id, Math.round(newWeight * 100) / 100, newIsKg ? 'kg' : 'lbs');
  };

  const calorieData = metrics.workouts.weekly.map(workout => ({
    date: new Date(workout.date).toLocaleDateString(),
    calories: Math.round(workout.caloriesBurned),
  }));

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Calories Burned</h2>
        </div>
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            {currentWeight} {currentUnit}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <form onSubmit={handleWeightSubmit} className="flex gap-2">
          <input
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder={`Enter weight in ${isKg ? 'kg' : 'lbs'}`}
            className="flex-1 px-3 py-2 border rounded-md"
            step="0.1"
            min="0"
          />
          <Button
            type="button"
            variant="outline"
            onClick={toggleUnit}
          >
            {isKg ? 'kg' : 'lbs'}
          </Button>
          <Button type="submit">Update</Button>
        </form>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `${value} cal`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ fill: '#F97316', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-xl font-semibold text-orange-500">
            {Math.round(metrics.workouts.recent?.caloriesBurned || 0)} cal
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">This Week</p>
          <p className="text-xl font-semibold text-orange-500">
            {Math.round(
              metrics.workouts.weekly.reduce((acc, w) => acc + w.caloriesBurned, 0)
            )} cal
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-xl font-semibold text-orange-500">
            {Math.round(
              metrics.workouts.monthly.reduce((acc, w) => acc + w.caloriesBurned, 0)
            )} cal
          </p>
        </div>
      </div>
    </div>
  );
}