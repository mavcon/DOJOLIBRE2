import React from 'react';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function AdminHeader({ title, actionLabel, onAction, children }: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        {children}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}