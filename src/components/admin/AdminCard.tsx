import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AdminCardProps {
  className?: string;
  children: React.ReactNode;
}

export function AdminCard({ className, children }: AdminCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800 p-6',
        className
      )}
    >
      {children}
    </motion.div>
  );
}