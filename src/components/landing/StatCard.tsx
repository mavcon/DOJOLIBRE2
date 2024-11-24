import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
}

export function StatCard({ icon: Icon, value, label, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center"
    >
      <Icon className="w-8 h-8 text-indigo-600 mx-auto mb-4" />
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  );
}